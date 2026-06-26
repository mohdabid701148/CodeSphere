import ConnectedAccount from '../models/ConnectedAccount.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Validate GitHub username
const validateGitHubUser = async (username) => {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'User-Agent': 'CodeSphere-App' }
    });

    if (res.status === 404) {
      return { valid: false, message: 'GitHub username does not exist' };
    }

    if (res.status === 403) {
      console.warn(`GitHub API Rate Limited on validation. Allowing connection for: ${username}`);
      return { valid: true, warning: 'GitHub API rate limit reached. Profile connected but validation bypassed.' };
    }

    return { valid: res.ok };
  } catch (error) {
    console.error('GitHub Validation Error:', error);
    return { valid: true, warning: 'GitHub API offline. Connected without live validation.' };
  }
};

// Validate Codeforces username
const validateCodeforcesUser = async (username) => {
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
    const data = await res.json();

    if (data.status === 'FAILED') {
      return { valid: false, message: data.comment || 'Codeforces user not found' };
    }

    return { valid: data.status === 'OK' };
  } catch (error) {
    console.error('Codeforces Validation Error:', error);
    return { valid: true, warning: 'Codeforces API offline. Connected without live validation.' };
  }
};

export const connectPlatform = async (req, res) => {
  const { platform } = req.params;
  const { username } = req.body;

  if (!username) {
    throw new ApiError(400, 'Username is required');
  }

  if (!['github', 'codeforces'].includes(platform)) {
    throw new ApiError(400, 'Invalid platform name. Must be github or codeforces.');
  }

  // Run validation checks
  let validationResult = { valid: true };
  if (platform === 'github') {
    validationResult = await validateGitHubUser(username);
  } else if (platform === 'codeforces') {
    validationResult = await validateCodeforcesUser(username);
  }

  if (!validationResult.valid) {
    throw new ApiError(400, validationResult.message || `Invalid ${platform} username.`);
  }

  let account = await ConnectedAccount.findOne({ userId: req.user._id, platform });

  if (account) {
    account.username = username;
    account.connected = true;
    account.syncStatus = 'idle';
    await account.save();
  } else {
    account = await ConnectedAccount.create({
      userId: req.user._id,
      platform,
      username,
      connected: true,
      syncStatus: 'idle'
    });
  }

  res.status(200).json(
    new ApiResponse(
      200,
      account,
      `${platform === 'github' ? 'GitHub' : 'Codeforces'} profile connected successfully. ${validationResult.warning || ''}`
    )
  );
};

export const getConnectionStatus = async (req, res) => {
  const accounts = await ConnectedAccount.find({ userId: req.user._id });
  res.status(200).json(new ApiResponse(200, accounts, 'Integration statuses fetched successfully'));
};

export const updateConnection = async (req, res) => {
  const { platform } = req.params;
  const { username, connected } = req.body;

  if (!['github', 'codeforces'].includes(platform)) {
    throw new ApiError(400, 'Invalid platform name');
  }

  const account = await ConnectedAccount.findOne({ userId: req.user._id, platform });

  if (!account) {
    throw new ApiError(404, `No connected ${platform} profile found to update.`);
  }

  if (username && username !== account.username) {
    let validationResult = { valid: true };
    if (platform === 'github') {
      validationResult = await validateGitHubUser(username);
    } else if (platform === 'codeforces') {
      validationResult = await validateCodeforcesUser(username);
    }

    if (!validationResult.valid) {
      throw new ApiError(400, validationResult.message || `Invalid username for ${platform}`);
    }

    account.username = username;
    account.syncStatus = 'idle';
  }

  if (connected !== undefined) {
    account.connected = connected;
  }

  await account.save();

  res.status(200).json(new ApiResponse(200, account, `${platform} connection updated successfully`));
};

export const disconnectPlatform = async (req, res) => {
  const { platform } = req.params;

  if (!['github', 'codeforces'].includes(platform)) {
    throw new ApiError(400, 'Invalid platform name');
  }

  const result = await ConnectedAccount.deleteOne({ userId: req.user._id, platform });

  if (result.deletedCount === 0) {
    throw new ApiError(404, `No connected ${platform} profile found to disconnect.`);
  }

  res.status(200).json(new ApiResponse(200, {}, `${platform} connection removed successfully`));
};
