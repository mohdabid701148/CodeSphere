import mongoose from 'mongoose';

const platformStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  platform: {
    type: String,
    required: true,
    enum: ['github', 'codeforces', 'leetcode'],
  },
  rating: {
    type: Number,
    default: 0,
  },
  maxRating: {
    type: Number,
    default: 0,
  },
  rank: {
    type: String,
    default: 'Unrated',
  },
  maxRank: {
    type: String,
    default: 'Unrated',
  },
  solvedCount: {
    type: Number,
    default: 0,
  },
  contestsCount: {
    type: Number,
    default: 0,
  },
  additionalMetrics: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  history: [
    {
      label: { type: String },
      value: { type: Number },
      description: { type: String },
    },
  ],
  lastSynced: {
    type: Date,
    default: Date.now,
  },
});

// Compound unique index to allow only one stats record per user per platform
platformStatsSchema.index({ userId: 1, platform: 1 }, { unique: true });

const PlatformStats = mongoose.model('PlatformStats', platformStatsSchema);

export default PlatformStats;
