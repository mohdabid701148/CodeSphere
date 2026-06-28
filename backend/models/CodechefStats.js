import mongoose from 'mongoose';

const codechefStatsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    handle: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: null,
    },
    stars: {
      type: String, // e.g. "5★"
      default: null,
    },
    globalRank: {
      type: Number,
      default: null,
    },
    countryRank: {
      type: Number,
      default: null,
    },
    solvedCount: {
      type: Number,
      default: 0,
    },
    contestsCount: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('CodechefStats', codechefStatsSchema);
