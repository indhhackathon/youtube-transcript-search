import { YoutubeTranscript } from 'youtube-transcript';
import logger from '../config/logger.js';

class CaptionsService {
  async getTranscript(videoId) {
    try {
      logger.info(`Fetching transcript for video: ${videoId}`);

      const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'en'
      });

      if (!transcript || transcript.length === 0) {
        throw new Error('No transcript available for this video');
      }

      logger.info(`Successfully fetched transcript for ${videoId} (${transcript.length} segments)`);
      return transcript;
    } catch (error) {
      if (error.message.includes('Transcript is disabled')) {
        logger.warn(`Transcript disabled for video ${videoId}`);
        throw new Error('Transcript is not available for this video');
      } else if (error.message.includes('Could not find')) {
        logger.warn(`No transcript found for video ${videoId}`);
        throw new Error('No transcript found for this video');
      } else {
        logger.error(`Error fetching transcript for ${videoId}:`, error);
        throw new Error(`Failed to fetch transcript: ${error.message}`);
      }
    }
  }

  findKeywordInTranscript(transcript, keyword) {
    const regex = new RegExp(keyword, 'gi');
    const matches = [];

    for (const segment of transcript) {
      if (regex.test(segment.text)) {
        matches.push({
          text: segment.text,
          start: segment.offset / 1000,
          duration: segment.duration / 1000
        });
      }
    }

    return matches;
  }

  getFullTranscriptText(transcript) {
    return transcript.map(segment => segment.text).join(' ');
  }

  highlightKeyword(text, keyword) {
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  getContextSnippet(transcript, keyword, contextWords = 20) {
    const fullText = this.getFullTranscriptText(transcript);
    const regex = new RegExp(keyword, 'gi');
    const match = regex.exec(fullText);

    if (!match) {
      return null;
    }

    const words = fullText.split(' ');
    const matchIndex = fullText.substring(0, match.index).split(' ').length - 1;

    const start = Math.max(0, matchIndex - contextWords);
    const end = Math.min(words.length, matchIndex + contextWords + 1);

    const snippet = words.slice(start, end).join(' ');
    return {
      snippet,
      highlightedSnippet: this.highlightKeyword(snippet, keyword)
    };
  }
}

export const captionsService = new CaptionsService();
