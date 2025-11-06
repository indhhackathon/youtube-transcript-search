import mongoose from 'mongoose';

const transcriptSegmentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  start: { type: Number, required: true },
  duration: { type: Number, required: true }
}, { _id: false });

const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  publishedAt: {
    type: Date
  },
  transcript: [transcriptSegmentSchema],
  fullTranscriptText: {
    type: String,
    index: 'text'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

videoSchema.index({ videoId: 1 });
videoSchema.index({ fullTranscriptText: 'text' });

videoSchema.methods.findKeywordMatches = function(keyword) {
  const regex = new RegExp(keyword, 'gi');
  const matches = [];

  for (const segment of this.transcript) {
    if (regex.test(segment.text)) {
      matches.push({
        text: segment.text,
        start: segment.start,
        duration: segment.duration,
        timestampUrl: `https://youtube.com/watch?v=${this.videoId}&t=${Math.floor(segment.start)}s`
      });
    }
  }

  return matches;
};

export const Video = mongoose.model('Video', videoSchema);
