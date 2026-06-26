import { validateGitHubUser } from '../services/githubService.js';
import { integrationService } from '../services/integrationService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const connectPlatform = async (req, res) => {
  const { platform } = req.params;
  const { username } = req.body;

  if (!username) {
    throw new ApiError(400, 'Username is required');
  }

  if (platform !== 'github') {
    throw new ApiError(400, 'Invalid platform. Only github is supported in this phase.');
  }

  // Run validation checks
  const validationResult = await validateGitHubUser(username);

  if (!validationResult.valid) {
    throw new ApiError(400, validationResult.message || `Invalid ${platform} username.`);
  }

  const account = await integrationService.createOrUpdateAccount(req.user._id, platform, username);

  res.status(200).json(
    new ApiResponse(
      200,
      account,
      `GitHub profile connected successfully. ${validationResult.warning || ''}`
    )
  );
};

export const getConnectionStatus = async (req, res) => {
  const accounts = await integrationService.getAccountsByUserId(req.user._id);
  res.status(200).json(new ApiResponse(200, accounts, 'Integration statuses fetched successfully'));
};

export const updateConnection = async (req, res) => {
  const { platform } = req.params;
  const { username, connected } = req.body;

  if (platform !== 'github') {
    throw new ApiError(400, 'Invalid platform. Only github is supported in this phase.');
  }

  let validationResult = { valid: true };
  if (username) {
    validationResult = await validateGitHubUser(username);
    if (!validationResult.valid) {
      throw new ApiError(400, validationResult.message || `Invalid username for ${platform}`);
    }
  }

  const account = await integrationService.updateAccount(req.user._id, platform, { username, connected });

  res.status(200).json(new ApiResponse(200, account, `${platform} connection updated successfully`));
};

export const disconnectPlatform = async (req, res) => {
  const { platform } = req.params;

  if (platform !== 'github') {
    throw new ApiError(400, 'Invalid platform. Only github is supported in this phase.');
  }

  await integrationService.deleteAccount(req.user._id, platform);

  res.status(200).json(new ApiResponse(200, {}, `${platform} connection removed successfully`));
};
