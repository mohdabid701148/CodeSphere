import ConnectedAccount from '../models/ConnectedAccount.js';
import PlatformStats from '../models/PlatformStats.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getPlatformStrategy, getSupportedPlatforms } from '../integrations/index.js';

export const connectPlatform = async (req, res) => {
  const { platform } = req.params;
  const { username } = req.body;

  if (!username) {
    throw new ApiError(400, 'Username is required');
  }

  const supportedPlatforms = getSupportedPlatforms();
  if (!supportedPlatforms.includes(platform)) {
    throw new ApiError(400, `Invalid platform name. Must be one of: ${supportedPlatforms.join(', ')}.`);
  }

  // Run validation checks via strategy class
  const strategy = getPlatformStrategy(platform);
  const validationResult = await strategy.validateUser(username);

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
      syncStatus: 'idle',
    });
  }

  res.status(200).json(
    new ApiResponse(
      200,
      account,
      `${platform.toUpperCase()} profile connected successfully. ${validationResult.warning || ''}`
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

  const supportedPlatforms = getSupportedPlatforms();
  if (!supportedPlatforms.includes(platform)) {
    throw new ApiError(400, 'Invalid platform name');
  }

  const account = await ConnectedAccount.findOne({ userId: req.user._id, platform });

  if (!account) {
    throw new ApiError(404, `No connected ${platform} profile found to update.`);
  }

  if (username && username !== account.username) {
    const strategy = getPlatformStrategy(platform);
    const validationResult = await strategy.validateUser(username);

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

  const supportedPlatforms = getSupportedPlatforms();
  if (!supportedPlatforms.includes(platform)) {
    throw new ApiError(400, 'Invalid platform name');
  }

  const result = await ConnectedAccount.deleteOne({ userId: req.user._id, platform });

  if (result.deletedCount === 0) {
    throw new ApiError(404, `No connected ${platform} profile found to disconnect.`);
  }

  // Delete matching statistics document as well
  await PlatformStats.deleteOne({ userId: req.user._id, platform });

  res.status(200).json(new ApiResponse(200, {}, `${platform} connection removed successfully`));
};
