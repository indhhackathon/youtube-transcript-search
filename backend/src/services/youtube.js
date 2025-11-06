import { google } from 'googleapis';
import { config } from '../config/env.js';
import logger from '../config/logger.js';

class YouTubeService {
  constructor() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: config.youtube.apiKey
    });
  }

  async searchVideos(keyword, maxResults = 10) {
    try {
      logger.info(`Searching YouTube for keyword: ${keyword}`);

      const response = await this.youtube.search.list({
        part: 'snippet',
        q: keyword,
        type: 'video',
        maxResults: maxResults,
        videoCaption: 'closedCaption',
        relevanceLanguage: 'en',
        safeSearch: 'none',
        order: 'relevance'
      });

      const videos = response.data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description
      }));

      logger.info(`Found ${videos.length} videos for keyword: ${keyword}`);
      return videos;
    } catch (error) {
      logger.error('YouTube search error:', error);
      throw new Error(`Failed to search YouTube: ${error.message}`);
    }
  }

  async getVideoDetails(videoId) {
    try {
      const response = await this.youtube.videos.list({
        part: 'snippet,statistics',
        id: videoId
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = response.data.items[0];
      return {
        videoId: video.id,
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
        thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
        publishedAt: video.snippet.publishedAt,
        description: video.snippet.description,
        viewCount: video.statistics.viewCount,
        likeCount: video.statistics.likeCount
      };
    } catch (error) {
      logger.error(`Error getting video details for ${videoId}:`, error);
      throw error;
    }
  }
}

export const youtubeService = new YouTubeService();
