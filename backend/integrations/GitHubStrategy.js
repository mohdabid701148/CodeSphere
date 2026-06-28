import { BasePlatformStrategy } from './BasePlatformStrategy.js';

export class GitHubStrategy extends BasePlatformStrategy {
  constructor() {
    super('github');
  }

  async validateUser(username) {
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
  }

  async sync(username) {
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

    // Paginate through all repositories
    let allRepos = [];
    let page = 1;
    while (true) {
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`, {
        headers: { 'User-Agent': 'CodeSphere-App' }
      });

      if (reposRes.status === 403) {
        console.warn(`GitHub rate limit reached during repo fetch (page ${page}). Using ${allRepos.length} repos collected so far.`);
        break;
      }

      if (!reposRes.ok) {
        throw new Error(`GitHub repos fetch failed on page ${page}: ${reposRes.statusText}`);
      }

      const repos = await reposRes.json();
      if (repos.length === 0) break;

      allRepos = allRepos.concat(repos);
      page++;
    }

    let totalStars = 0;
    const languageCounts = {};

    allRepos.forEach((repo) => {
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

    // Map to normalized PlatformStats format
    return {
      solvedCount: 0,
      rating: 0,
      maxRating: 0,
      rank: 'Unrated',
      maxRank: 'Unrated',
      additionalMetrics: {
        repos: profile.public_repos || allRepos.length,
        stars: totalStars,
        followers: profile.followers || 0,
        following: profile.following || 0,
        languages,
      },
      history: [],
    };
  }

  async verifyUser(username, token, startedAt) {
    try {
      const res = await fetch(`https://api.github.com/repos/${username}/${token}`, {
        headers: { 'User-Agent': 'CodeSphere-App' }
      });
      return res.status === 200;
    } catch (err) {
      console.error('GitHub Verification Error:', err);
      return false;
    }
  }
}
