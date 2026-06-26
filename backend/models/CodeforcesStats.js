import mongoose from 'mongoose';

const codeforcesStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
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
  contestHistory: [
    {
      contestId: { type: Number },
      contestName: { type: String },
      rank: { type: Number },
      newRating: { type: Number },
      oldRating: { type: Number },
    },
  ],
  lastSynced: {
    type: Date,
    default: Date.now,
  },
});

const CodeforcesStats = mongoose.model('CodeforcesStats', codeforcesStatsSchema);

export default CodeforcesStats;
