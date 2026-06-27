import mongoose from 'mongoose';

const atcoderStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
      timestamp: { type: Date },
    },
  ],
  lastSynced: {
    type: Date,
    default: Date.now,
  },
});

const AtCoderStats = mongoose.model('AtCoderStats', atcoderStatsSchema);

export default AtCoderStats;
