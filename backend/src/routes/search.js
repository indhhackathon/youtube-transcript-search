import express from 'express';
import { youtubeService } from '../services/youtube.js';
import { captionsService } from '../services/captions.js';
import { cacheService } from '../services/cache.js';
import { meilisearchService } from '../services/meilisearch.js';
import { Video } from '../db/models/Video.js';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q: keyword, limit = 10, useCache = 'true' } = req.query;

    if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Keyword parameter "q" is required'
      });
    }

    const normalizedKeyword = keyword.trim().toLowerCase();
    const cacheKey = `search:${normalizedKeyword}:${limit}`;
    const shouldUseCache = useCache === 'true';

    logger.info(`Search request for keyword: "${keyword}" (limit: ${limit})`);

    if (shouldUseCache) {
      const cachedResults = await cacheService.get(cacheKey);
      if (cachedResults) {
        logger.info(`Returning cached results for: ${keyword}`);
        return res.json({
          success: true,
          cached: true,
          keyword,
          results: cachedResults,
          count: cachedResults.length
        });
      }
    }

    let results = [];

    try {
      const meilisearchResults = await meilisearchService.search(keyword, parseInt(limit));

      if (meilisearchResults.length > 0) {
        logger.info(`Found ${meilisearchResults.length} results in Meilisearch`);

        results = await Promise.all(
          meilisearchResults.map(async (hit) => {
            const video = await Video.findOne({ videoId: hit.videoId });
            if (!video) return null;

            const matches = video.findKeywordMatches(keyword);
            if (matches.length === 0) return null;

            const contextSnippet = captionsService.getContextSnippet(
              video.transcript,
              keyword,
              20
            );

            return {
              videoId: video.videoId,
              title: video.title,
              channel: video.channel,
              thumbnailUrl: video.thumbnailUrl,
              matches: matches.slice(0, 5),
              matchCount: matches.length,
              snippet: contextSnippet?.highlightedSnippet || matches[0]?.text || '',
              url: `https://youtube.com/watch?v=${video.videoId}`
            };
          })
        );

        results = results.filter(r => r !== null);
      }
    } catch (meilisearchError) {
      logger.warn('Meilisearch search failed, falling back to YouTube API:', meilisearchError);
    }

    if (results.length === 0) {
      logger.info('No Meilisearch results, searching YouTube...');
      const youtubeVideos = await youtubeService.searchVideos(keyword, parseInt(limit));

      const videoResults = await Promise.all(
        youtubeVideos.map(async (videoInfo) => {
          try {
            let video = await Video.findOne({ videoId: videoInfo.videoId });

            if (!video) {
              const transcript = await captionsService.getTranscript(videoInfo.videoId);
              const fullTranscriptText = captionsService.getFullTranscriptText(transcript);

              video = new Video({
                videoId: videoInfo.videoId,
                title: videoInfo.title,
                channel: videoInfo.channel,
                thumbnailUrl: videoInfo.thumbnailUrl,
                publishedAt: videoInfo.publishedAt,
                transcript: transcript.map(seg => ({
                  text: seg.text,
                  start: seg.offset / 1000,
                  duration: seg.duration / 1000
                })),
                fullTranscriptText
              });

              await video.save();
              logger.info(`Saved new video to database: ${video.videoId}`);

              await meilisearchService.indexVideo(video);
            }

            const matches = video.findKeywordMatches(keyword);
            if (matches.length === 0) {
              return null;
            }

            const contextSnippet = captionsService.getContextSnippet(
              video.transcript,
              keyword,
              20
            );

            return {
              videoId: video.videoId,
              title: video.title,
              channel: video.channel,
              thumbnailUrl: video.thumbnailUrl,
              matches: matches.slice(0, 5),
              matchCount: matches.length,
              snippet: contextSnippet?.highlightedSnippet || matches[0]?.text || '',
              url: `https://youtube.com/watch?v=${video.videoId}`
            };
          } catch (error) {
            logger.error(`Error processing video ${videoInfo.videoId}:`, error.message);
            return null;
          }
        })
      );

      results = videoResults.filter(r => r !== null);
    }

    if (shouldUseCache && results.length > 0) {
      await cacheService.set(cacheKey, results);
    }

    logger.info(`Returning ${results.length} results for keyword: ${keyword}`);

    return res.json({
      success: true,
      cached: false,
      keyword,
      results,
      count: results.length
    });
  } catch (error) {
    logger.error('Search error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Search API is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
