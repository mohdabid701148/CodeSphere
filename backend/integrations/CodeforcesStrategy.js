import { BasePlatformStrategy } from './BasePlatformStrategy.js';

export class CodeforcesStrategy extends BasePlatformStrategy {
  constructor() {
    super('codeforces');
  }

  async validateUser(username) {
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
  }

  async sync(username) {
    // 1. Fetch user info
    const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
    const infoData = await infoRes.json();

    if (infoData.status !== 'OK') {
      throw new Error(infoData.comment || 'Codeforces profile fetch failed.');
    }

    const info = infoData.result[0];

    // 2. Fetch user rating history
    const ratingRes = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`);
    const ratingData = await ratingRes.json();

    let history = [];
    let contestsCount = 0;
    if (ratingData.status === 'OK') {
      contestsCount = ratingData.result.length;
      history = ratingData.result.map((item, idx) => ({
        label: `Contest ${idx + 1}`,
        value: item.newRating,
        description: item.contestName,
        timestamp: new Date(item.ratingUpdateTimeSeconds * 1000),
      }));
    }

    // 3. Fetch user submissions to calculate unique solved problems and active days
    let solvedCount = 0;
    let activeDays = 0;
    const calendarMap = {};
    try {
      const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
      const statusData = await statusRes.json();
      if (statusData.status === 'OK') {
        const solvedProblems = new Set();
        const activeDaysSet = new Set();
        statusData.result.forEach((submission) => {
          if (submission.verdict === 'OK' && submission.problem) {
            const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
            solvedProblems.add(problemId);
          }
          if (submission.creationTimeSeconds) {
            const dateStr = new Date(submission.creationTimeSeconds * 1000).toISOString().split('T')[0];
            activeDaysSet.add(dateStr);
            calendarMap[dateStr] = (calendarMap[dateStr] || 0) + 1;
          }
        });
        solvedCount = solvedProblems.size;
        activeDays = activeDaysSet.size;
      }
    } catch (error) {
      console.warn('Failed to fetch Codeforces solved count & active days:', error.message);
    }

    // Map to normalized PlatformStats format
    return {
      solvedCount,
      contestsCount,
      rating: info.rating || 0,
      maxRating: info.maxRating || 0,
      rank: info.rank || 'Unrated',
      maxRank: info.maxRank || 'Unrated',
      additionalMetrics: {
        activeDays,
        calendar: calendarMap,
      },
      history,
    };
  }

  async verifyUser(username, token, startedAt) {
    try {
      // 1. Instant: check if user submitted to problem 4A (Watermelon) after verification started
      const startTime = startedAt ? Math.floor(new Date(startedAt).getTime() / 1000) : 0;
      const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=10`);
      const statusData = await statusRes.json();
      if (statusData.status === 'OK' && statusData.result?.length > 0) {
        const match = statusData.result.some(sub =>
          sub.problem?.contestId === 4 &&
          sub.problem?.index === 'A' &&
          sub.creationTimeSeconds >= startTime
        );
        if (match) return true;
      }

      // 2. Fallback: profile token check
      const res = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
      const data = await res.json();
      if (data.status === 'OK' && data.result?.length > 0) {
        const info = data.result[0];
        const fields = [
          info.firstName || '',
          info.lastName || '',
          info.organization || '',
        ];
        if (fields.some(f => f.includes(token))) return true;
      }

      return false;
    } catch (err) {
      console.error('Codeforces Verification Error:', err);
      return false;
    }
  }
}
