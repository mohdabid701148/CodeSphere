import { GitHubStrategy } from './GitHubStrategy.js';
import { CodeforcesStrategy } from './CodeforcesStrategy.js';
import { LeetCodeStrategy } from './LeetCodeStrategy.js';
import { AtCoderStrategy } from './AtCoderStrategy.js';

export const strategies = {
  github: new GitHubStrategy(),
  codeforces: new CodeforcesStrategy(),
  leetcode: new LeetCodeStrategy(),
  atcoder: new AtCoderStrategy(),
};

/**
 * Retrieve the integration strategy for a given platform name.
 * @param {string} platform 
 * @returns {BasePlatformStrategy}
 */
export const getPlatformStrategy = (platform) => {
  const strategy = strategies[platform.toLowerCase()];
  if (!strategy) {
    throw new Error(`Platform strategy '${platform}' is not supported.`);
  }
  return strategy;
};

/**
 * Get a list of all supported integration platforms.
 * @returns {string[]}
 */
export const getSupportedPlatforms = () => {
  return Object.keys(strategies);
};
