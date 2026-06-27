import ConnectedAccount from '../models/ConnectedAccount.js';
import PlatformStats from '../models/PlatformStats.js';
import SyncLog from '../models/SyncLog.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getPlatformStrategy, getSupportedPlatforms } from '../integrations/index.js';

// Internal helper to run validation + fetch + db save
const syncPlatformData = async (userId, platform, username) => {
  try {
    const strategy = getPlatformStrategy(platform);
    const normalizedStats = await strategy.sync(username);

    // Save to PlatformStats collection
    const stats = await PlatformStats.findOneAndUpdate(
      { userId, platform },
      {
        ...normalizedStats,
        lastSynced: new Date(),
      },
      { upsert: true, returnDocument: 'after' }
    );

    return stats;
  } catch (error) {
    console.error(`Sync Core Error for ${platform}:`, error.message);
    throw error;
  }
};

// POST /sync/:platform
export const syncPlatformStats = async (req, res) => {
  const { platform } = req.params;
  const supportedPlatforms = getSupportedPlatforms();

  if (!supportedPlatforms.includes(platform)) {
    throw new ApiError(400, `Unsupported platform: ${platform}`);
  }

  const account = await ConnectedAccount.findOne({ userId: req.user._id, platform, connected: true });

  if (!account) {
    throw new ApiError(404, `No connected ${platform} account found. Please link your account first.`);
  }

  account.syncStatus = 'syncing';
  await account.save();

  try {
    const stats = await syncPlatformData(req.user._id, platform, account.username);
    
    account.syncStatus = 'success';
    account.lastSync = new Date();
    await account.save();

    await SyncLog.create({
      userId: req.user._id,
      platform,
      status: 'success',
      message: `Successfully synchronized ${platform} profile.`
    });

    res.status(200).json(new ApiResponse(200, stats, `${platform} statistics updated successfully.`));
  } catch (err) {
    account.syncStatus = 'failed';
    await account.save();

    await SyncLog.create({
      userId: req.user._id,
      platform,
      status: 'failed',
      message: err.message || `${platform} sync failed.`
    });

    throw new ApiError(500, err.message || `${platform} synchronization failed.`);
  }
};

// POST /sync/all
export const syncAllStats = async (req, res) => {
  const accounts = await ConnectedAccount.find({ userId: req.user._id, connected: true });
  
  if (accounts.length === 0) {
    throw new ApiError(400, 'No connected accounts found. Connect profiles first.');
  }

  const syncPromises = accounts.map(async (acc) => {
    acc.syncStatus = 'syncing';
    await acc.save();

    try {
      await syncPlatformData(req.user._id, acc.platform, acc.username);
      acc.syncStatus = 'success';
      acc.lastSync = new Date();
      await acc.save();

      await SyncLog.create({
        userId: req.user._id,
        platform: acc.platform,
        status: 'success',
        message: `Auto-sync: Successfully synchronized ${acc.platform} profile.`
      });
    } catch (err) {
      acc.syncStatus = 'failed';
      await acc.save();

      await SyncLog.create({
        userId: req.user._id,
        platform: acc.platform,
        status: 'failed',
        message: `Auto-sync: Sync failed - ${err.message}`
      });
    }
  });

  await Promise.all(syncPromises);

  res.status(200).json(new ApiResponse(200, {}, 'Triggered all active sync profiles.'));
};

// GET /sync/
export const getDashboardStats = async (req, res) => {
  const connections = await ConnectedAccount.find({ userId: req.user._id });
  const statsList = await PlatformStats.find({ userId: req.user._id });
  const syncLogs = await SyncLog.find({ userId: req.user._id }).sort({ timestamp: -1 }).limit(10);

  // Extract profiles for frontend backwards compatibility
  const githubStats = statsList.find(s => s.platform === 'github');
  const codeforcesStats = statsList.find(s => s.platform === 'codeforces');
  const leetcodeStats = statsList.find(s => s.platform === 'leetcode');

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: req.user,
        connections,
        githubStats: githubStats || null,
        codeforcesStats: codeforcesStats || null,
        leetcodeStats: leetcodeStats || null,
        allStats: statsList, // Unified data
        syncLogs
      },
      'Dashboard aggregated statistics retrieved successfully.'
    )
  );
};

// GET /sync/:platform
export const getPlatformStats = async (req, res) => {
  const { platform } = req.params;
  const supportedPlatforms = getSupportedPlatforms();

  if (!supportedPlatforms.includes(platform)) {
    throw new ApiError(400, `Unsupported platform: ${platform}`);
  }

  const stats = await PlatformStats.findOne({ userId: req.user._id, platform });
  if (!stats) {
    throw new ApiError(404, `No ${platform} stats found. Trigger a sync first.`);
  }

  res.status(200).json(new ApiResponse(200, stats, `${platform} stats fetched successfully.`));
};
