import mongoose from 'mongoose';

const connectedAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    platform: {
      type: String,
      enum: ['github', 'codeforces', 'leetcode'],
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    connected: {
      type: Boolean,
      default: true,
    },
    lastSync: {
      type: Date,
    },
    syncStatus: {
      type: String,
      enum: ['idle', 'syncing', 'success', 'failed'],
      default: 'idle',
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique combination of userId and platform
connectedAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });

const ConnectedAccount = mongoose.model('ConnectedAccount', connectedAccountSchema);

export default ConnectedAccount;
