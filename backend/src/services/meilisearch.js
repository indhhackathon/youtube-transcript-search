import { MeiliSearch } from 'meilisearch';
import { config } from '../config/env.js';
import logger from '../config/logger.js';

class MeilisearchService {
  constructor() {
    this.client = new MeiliSearch({
      host: config.meilisearch.host,
      apiKey: config.meilisearch.apiKey
    });
    this.indexName = 'videos';
    this.index = null;
  }

  async initialize() {
    try {
      this.index = this.client.index(this.indexName);

      await this.index.updateSettings({
        searchableAttributes: [
          'title',
          'channel',
          'fullTranscriptText'
        ],
        filterableAttributes: ['videoId', 'publishedAt'],
        sortableAttributes: ['publishedAt'],
        rankingRules: [
          'words',
          'typo',
          'proximity',
          'attribute',
          'sort',
          'exactness'
        ],
        displayedAttributes: ['*'],
        pagination: {
          maxTotalHits: 1000
        }
      });

      logger.info('Meilisearch index initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Meilisearch:', error);
      throw error;
    }
  }

  async indexVideo(video) {
    try {
      const document = {
        id: video.videoId,
        videoId: video.videoId,
        title: video.title,
        channel: video.channel,
        thumbnailUrl: video.thumbnailUrl,
        publishedAt: new Date(video.publishedAt).getTime(),
        fullTranscriptText: video.fullTranscriptText
      };

      await this.index.addDocuments([document]);
      logger.info(`Indexed video ${video.videoId} in Meilisearch`);
    } catch (error) {
      logger.error(`Error indexing video ${video.videoId}:`, error);
      throw error;
    }
  }

  async indexVideos(videos) {
    try {
      const documents = videos.map(video => ({
        id: video.videoId,
        videoId: video.videoId,
        title: video.title,
        channel: video.channel,
        thumbnailUrl: video.thumbnailUrl,
        publishedAt: new Date(video.publishedAt).getTime(),
        fullTranscriptText: video.fullTranscriptText
      }));

      await this.index.addDocuments(documents);
      logger.info(`Indexed ${videos.length} videos in Meilisearch`);
    } catch (error) {
      logger.error('Error indexing videos:', error);
      throw error;
    }
  }

  async search(keyword, limit = 50) {
    try {
      const results = await this.index.search(keyword, {
        limit: limit,
        attributesToHighlight: ['fullTranscriptText', 'title'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>'
      });

      logger.info(`Meilisearch found ${results.hits.length} results for: ${keyword}`);
      return results.hits;
    } catch (error) {
      logger.error('Meilisearch search error:', error);
      throw error;
    }
  }

  async deleteVideo(videoId) {
    try {
      await this.index.deleteDocument(videoId);
      logger.info(`Deleted video ${videoId} from Meilisearch`);
    } catch (error) {
      logger.error(`Error deleting video ${videoId}:`, error);
      throw error;
    }
  }

  async getStats() {
    try {
      const stats = await this.index.getStats();
      return stats;
    } catch (error) {
      logger.error('Error getting Meilisearch stats:', error);
      return null;
    }
  }
}

export const meilisearchService = new MeilisearchService();
