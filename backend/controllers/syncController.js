import ConnectedAccount from '../models/ConnectedAccount.js';
import GitHubStats from '../models/GitHubStats.js';
import CodeforcesStats from '../models/CodeforcesStats.js';
import SyncLog from '../models/SyncLog.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Synchronize GitHub profile stats
const syncGitHub = async (userId, username) => {
  try {
    const profileRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'User-Agent': 'CodeSphere-App' }
    });
    
    if (profileRes.status === 403) {
      console.warn('GitHub rate limit reached during sync.');
      throw new Error('GitHub API rate limit reached. Please try again later.');
    }

    if (!profileRes.ok) {
      throw new Error(`GitHub profile fetch failed: ${profileRes.statusText}`);
    }
    
    const profile = await profileRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
      headers: { 'User-Agent': 'CodeSphere-App' }
    });
    
    if (!reposRes.ok) {
      throw new Error(`GitHub repos fetch failed: ${reposRes.statusText}`);
    }
    
    const repos = await reposRes.json();

    let totalStars = 0;
    const languageCounts = {};

    repos.forEach((repo) => {
      totalStars += repo.stargazers_count || 0;
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    });

    const totalReposWithLanguage = Object.values(languageCounts).reduce((a, b) => a + b, 0);
    const languages = Object.entries(languageCounts).map(([name, count]) => ({
      name,
      percentage: totalReposWithLanguage > 0 ? Math.round((count / totalReposWithLanguage) * 100) : 0,
    })).sort((a, b) => b.percentage - a.percentage);

    const stats = await GitHubStats.findOneAndUpdate(
      { userId },
      {
        repos: profile.public_repos || repos.length,
        stars: totalStars,
        followers: profile.followers || 0,
        languages,
        lastSynced: new Date(),
      },
      { upsert: true, returnDocument: 'after' }
    );

    return stats;
  } catch (error) {
    console.error('GitHub Sync Core Error:', error.message);
    throw error;
  }
};

// Synchronize Codeforces handle stats
const syncCodeforces = async (userId, username) => {
  try {
    const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
    const infoData = await infoRes.json();

    if (infoData.status !== 'OK') {
      throw new Error(infoData.comment || 'Codeforces profile fetch failed.');
    }

    const info = infoData.result[0];

    const ratingRes = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`);
    const ratingData = await ratingRes.json();

    let contestHistory = [];
    if (ratingData.status === 'OK') {
      contestHistory = ratingData.result.map((item) => ({
        contestId: item.contestId,
        contestName: item.contestName,
        rank: item.rank,
        newRating: item.newRating,
        oldRating: item.oldRating,
      }));
    }

    const stats = await CodeforcesStats.findOneAndUpdate(
      { userId },
      {
        rating: info.rating || 0,
        maxRating: info.maxRating || 0,
        rank: info.rank || 'Unrated',
        contestHistory,
        lastSynced: new Date(),
      },
      { upsert: true, returnDocument: 'after' }
    );

    return stats;
  } catch (error) {
    console.error('Codeforces Sync Core Error:', error.message);
    throw error;
  }
};

export const syncGitHubStats = async (req, res) => {
  const account = await ConnectedAccount.findOne({ userId: req.user._id, platform: 'github', connected: true });

  if (!account) {
    throw new ApiError(404, 'No connected GitHub account found. Please link your account first.');
  }

  account.syncStatus = 'syncing';
  await account.save();

  try {
    const stats = await syncGitHub(req.user._id, account.username);
    
    account.syncStatus = 'success';
    account.lastSync = new Date();
    await account.save();

    await SyncLog.create({
      userId: req.user._id,
      platform: 'github',
      status: 'success',
      message: 'Successfully synchronized GitHub profile.'
    });

    res.status(200).json(new ApiResponse(200, stats, 'GitHub statistics updated successfully.'));
  } catch (err) {
    account.syncStatus = 'failed';
    await account.save();

    await SyncLog.create({
      userId: req.user._id,
      platform: 'github',
      status: 'failed',
      message: err.message || 'GitHub sync failed.'
    });

    throw new ApiError(500, err.message || 'GitHub synchronization failed.');
  }
};

export const syncCodeforcesStats = async (req, res) => {
  const account = await ConnectedAccount.findOne({ userId: req.user._id, platform: 'codeforces', connected: true });

  if (!account) {
    throw new ApiError(404, 'No connected Codeforces account found. Please link your account first.');
  }

  account.syncStatus = 'syncing';
  await account.save();

  try {
    const stats = await syncCodeforces(req.user._id, account.username);
    
    account.syncStatus = 'success';
    account.lastSync = new Date();
    await account.save();

    await SyncLog.create({
      userId: req.user._id,
      platform: 'codeforces',
      status: 'success',
      message: 'Successfully synchronized Codeforces profile.'
    });

    res.status(200).json(new ApiResponse(200, stats, 'Codeforces statistics updated successfully.'));
  } catch (err) {
    account.syncStatus = 'failed';
    await account.save();

    await SyncLog.create({
      userId: req.user._id,
      platform: 'codeforces',
      status: 'failed',
      message: err.message || 'Codeforces sync failed.'
    });

    throw new ApiError(500, err.message || 'Codeforces synchronization failed.');
  }
};

export const syncAllStats = async (req, res) => {
  const accounts = await ConnectedAccount.find({ userId: req.user._id, connected: true });
  
  if (accounts.length === 0) {
    throw new ApiError(400, 'No connected accounts found. Connect GitHub or Codeforces profiles first.');
  }

  const syncPromises = accounts.map(async (acc) => {
    acc.syncStatus = 'syncing';
    await acc.save();

    try {
      if (acc.platform === 'github') {
        await syncGitHub(req.user._id, acc.username);
      } else if (acc.platform === 'codeforces') {
        await syncCodeforces(req.user._id, acc.username);
      }
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

export const getDashboardStats = async (req, res) => {
  const connections = await ConnectedAccount.find({ userId: req.user._id });
  const githubStats = await GitHubStats.findOne({ userId: req.user._id });
  const codeforcesStats = await CodeforcesStats.findOne({ userId: req.user._id });
  const syncLogs = await SyncLog.find({ userId: req.user._id }).sort({ timestamp: -1 }).limit(10);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: req.user,
        connections,
        githubStats: githubStats || null,
        codeforcesStats: codeforcesStats || null,
        syncLogs
      },
      'Dashboard aggregated statistics retrieved successfully.'
    )
  );
};

export const getGitHubStats = async (req, res) => {
  const stats = await GitHubStats.findOne({ userId: req.user._id });
  if (!stats) {
    throw new ApiError(404, 'No GitHub stats found. Trigger a sync first.');
  }
  res.status(200).json(new ApiResponse(200, stats, 'GitHub stats fetched successfully.'));
};

export const getCodeforcesStats = async (req, res) => {
  const stats = await CodeforcesStats.findOne({ userId: req.user._id });
  if (!stats) {
    throw new ApiError(404, 'No Codeforces stats found. Trigger a sync first.');
  }
  res.status(200).json(new ApiResponse(200, stats, 'Codeforces stats fetched successfully.'));
};
