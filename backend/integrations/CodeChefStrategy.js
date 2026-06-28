import { BasePlatformStrategy } from './BasePlatformStrategy.js';

export class CodeChefStrategy extends BasePlatformStrategy {
  constructor() {
    super('codechef');
  }

  async validateUser(username) {
    try {
      const response = await fetch(`https://www.codechef.com/users/${username}`);
      
      // If codechef redirects to homepage, the user does not exist
      if (response.url === 'https://www.codechef.com/') {
        return { valid: false, message: 'User not found on CodeChef' };
      }

      if (!response.ok) {
        return { valid: false, message: `CodeChef responded with ${response.status}` };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, message: `Validation failed: ${error.message}` };
    }
  }

  async sync(username) {
    try {
      const response = await fetch(`https://www.codechef.com/users/${username}`);
      
      if (response.url === 'https://www.codechef.com/') {
        throw new Error('User not found on CodeChef');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CodeChef profile for ${username}`);
      }
      
      const html = await response.text();
      
      // Extract data using regex
      const ratingMatch = html.match(/class=\"rating-number\">(\d+)</);
      const starsMatch = html.match(/class=\"rating-star\">([^<]+)</);
      const ranksMatch = html.match(/<ul class=\"inline-list\">.*?<strong>(\d+)<\/strong>.*?<strong>(\d+)<\/strong>/s);
      const solvedMatch = html.match(/Total Problems Solved:.*?(\d+)/i) || html.match(/Problems Solved.*?<h3>.*?(\d+).*?<\/h3>/s);
      
      const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;
      const stars = starsMatch ? starsMatch[1].trim() : "1★";
      const globalRank = ranksMatch ? ranksMatch[1] : null;
      const countryRank = ranksMatch ? ranksMatch[2] : null;
      const solvedCount = solvedMatch ? parseInt(solvedMatch[1], 10) : 0;

      const stats = {
        rating,
        maxRating: rating, // CodeChef profile doesn't expose maxRating easily in HTML, we will just use current rating.
        rank: stars,
        maxRank: stars,
        solvedCount,
        contestsCount: 0,
        additionalMetrics: {
          globalRank: globalRank ? parseInt(globalRank, 10) : null,
          countryRank: countryRank ? parseInt(countryRank, 10) : null,
        }
      };

      return stats;
    } catch (error) {
      throw new Error(`CodeChef Sync Error: ${error.message}`);
    }
  }
}
