import ConnectedAccount from '../models/ConnectedAccount.js';
import { ApiError } from '../utils/ApiError.js';

export const integrationService = {
  getAccountsByUserId: async (userId) => {
    return await ConnectedAccount.find({ userId });
  },

  createOrUpdateAccount: async (userId, platform, username) => {
    let account = await ConnectedAccount.findOne({ userId, platform });

    if (account) {
      account.username = username;
      account.connected = true;
      account.syncStatus = 'idle';
      await account.save();
    } else {
      account = await ConnectedAccount.create({
        userId,
        platform,
        username,
        connected: true,
        syncStatus: 'idle'
      });
    }
    return account;
  },

  updateAccount: async (userId, platform, updates) => {
    const account = await ConnectedAccount.findOne({ userId, platform });
    
    if (!account) {
      throw new ApiError(404, `No connected ${platform} profile found to update.`);
    }

    if (updates.username) {
      account.username = updates.username;
      account.syncStatus = 'idle';
    }
    
    if (updates.connected !== undefined) {
      account.connected = updates.connected;
    }

    await account.save();
    return account;
  },

  deleteAccount: async (userId, platform) => {
    const result = await ConnectedAccount.deleteOne({ userId, platform });
    if (result.deletedCount === 0) {
      throw new ApiError(404, `No connected ${platform} profile found to disconnect.`);
    }
    return true;
  }
};
