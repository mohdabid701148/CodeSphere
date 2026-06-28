export class BasePlatformStrategy {
  constructor(platformName) {
    this.platformName = platformName;
  }

  /**
   * Validate if a username/handle is valid on the platform.
   * @param {string} username 
   * @returns {Promise<{valid: boolean, message?: string, warning?: string}>}
   */
  async validateUser(username) {
    throw new Error('validateUser must be implemented by subclasses');
  }

  /**
   * Fetch live statistics from the platform API and return them normalized.
   * @param {string} username 
   * @returns {Promise<object>} Normalized PlatformStats object values
   */
  async sync(username) {
    throw new Error('sync must be implemented by subclasses');
  }

  /**
   * Verify if a user owns the account.
   * @param {string} username 
   * @param {string} token 
   * @param {Date} startedAt - When the verification was initiated
   * @returns {Promise<boolean>}
   */
  async verifyUser(username, token, startedAt) {
    return false;
  }
}
