import mongoose from 'mongoose';

const githubStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  repos: {
    type: Number,
    default: 0,
  },
  stars: {
    type: Number,
    default: 0,
  },
  followers: {
    type: Number,
    default: 0,
  },
  following: {
    type: Number,
    default: 0,
  },
  languages: [
    {
      name: { type: String, required: true },
      percentage: { type: Number, required: true },
    },
  ],
  lastSynced: {
    type: Date,
    default: Date.now,
  },
});

const GitHubStats = mongoose.model('GitHubStats', githubStatsSchema);

export default GitHubStats;
