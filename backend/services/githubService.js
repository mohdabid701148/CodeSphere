export const validateGitHubUser = async (username) => {
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
