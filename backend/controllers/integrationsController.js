import ConnectedAccount from '../models/ConnectedAccount.js';
import PlatformStats from '../models/PlatformStats.js';

import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPlatformStrategy, getSupportedPlatforms } from '../integrations/index.js';

export const connectPlatform = async (req, res) => {
  const { platform } = req.params;
  const { username } = req.body;

  if (!username || typeof username !== 'string') {
    throw new ApiError(400, 'Username is required and must be a string');
  }

  const cleanUsername = username.trim();
  const usernameRegex = /^[a-zA-Z0-9-_.]+$/;
  if (!usernameRegex.test(cleanUsername)) {
    throw new ApiError(400, 'Invalid characters in username. Only alphanumeric, dashes, underscores, and dots are allowed.');
  }

  const supportedPlatforms = getSupportedPlatforms();
  if (!supportedPlatforms.includes(platform)) {
    throw new ApiError(400, `Invalid platform name. Must be one of: ${supportedPlatforms.join(', ')}.`);
  }

  // Run validation checks via strategy class
  const strategy = getPlatformStrategy(platform);
  const validationResult = await strategy.validateUser(cleanUsername);

  if (!validationResult.valid) {
    throw new ApiError(400, validationResult.message || `Invalid ${platform} username.`);
  }

  // Generate verification token
  const verificationToken = `codesphere_verify_${Math.random().toString(36).substring(2, 10)}`;
  const verificationStartedAt = new Date();

  let account = await ConnectedAccount.findOne({ userId: req.user._id, platform });

  if (account) {
    account.username = cleanUsername;
    account.connected = false; // set to false pending verification
    account.verificationToken = verificationToken;
    account.verificationStartedAt = verificationStartedAt;
    account.syncStatus = 'idle';
    await account.save();
  } else {
    account = await ConnectedAccount.create({
      userId: req.user._id,
      platform,
      username: cleanUsername,
      connected: false,
      verificationToken,
      verificationStartedAt,
      syncStatus: 'idle',
    });
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { account, verificationToken },
      `${platform.toUpperCase()} connection initiated. Please add the verification token to your profile and verify.`
    )
  );
};

export const verifyPlatform = async (req, res) => {
  const { platform } = req.params;

  const supportedPlatforms = getSupportedPlatforms();
  if (!supportedPlatforms.includes(platform)) {
    throw new ApiError(400, `Invalid platform name.`);
  }

  const account = await ConnectedAccount.findOne({ userId: req.user._id, platform });

  if (!account) {
    throw new ApiError(404, `No connection process initiated for ${platform}.`);
  }

  if (account.connected) {
    return res.status(200).json(
      new ApiResponse(200, account, `${platform.toUpperCase()} is already verified and connected.`)
    );
  }

  if (!account.verificationToken) {
    throw new ApiError(400, `No verification token generated for this account. Please reconnect.`);
  }

  const strategy = getPlatformStrategy(platform);
  const isVerified = await strategy.verifyUser(account.username, account.verificationToken, account.verificationStartedAt);

  if (!isVerified) {
    throw new ApiError(
      400,
      `Verification failed. Please follow the instructions and try again.`
    );
  }

  // Set connected to true and clear verification token
  account.connected = true;
  account.verificationToken = undefined;
  await account.save();

  res.status(200).json(
    new ApiResponse(
      200,
      account,
      `${platform.toUpperCase()} profile verified and connected successfully!`
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

  if (username !== undefined && username !== account.username) {
    if (typeof username !== 'string' || !username.trim()) {
      throw new ApiError(400, 'Username must be a valid non-empty string');
    }
    const cleanUsername = username.trim();
    const usernameRegex = /^[a-zA-Z0-9-_.]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      throw new ApiError(400, 'Invalid characters in username. Only alphanumeric, dashes, underscores, and dots are allowed.');
    }
    const strategy = getPlatformStrategy(platform);
    const validationResult = await strategy.validateUser(cleanUsername);

    if (!validationResult.valid) {
      throw new ApiError(400, validationResult.message || `Invalid username for ${platform}`);
    }

    account.username = cleanUsername;
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
