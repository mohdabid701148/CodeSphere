import { BasePlatformStrategy } from './BasePlatformStrategy.js';

export class AtCoderStrategy extends BasePlatformStrategy {
  constructor() {
    super('atcoder');
  }

  getRank(rating) {
    if (rating >= 2800) return 'Red';
    if (rating >= 2400) return 'Orange';
    if (rating >= 2000) return 'Yellow';
    if (rating >= 1600) return 'Blue';
    if (rating >= 1200) return 'Cyan';
    if (rating >= 800) return 'Green';
    if (rating >= 400) return 'Brown';
    if (rating > 0) return 'Gray';
    return 'Unrated';
  }

  async validateUser(username) {
    try {
      const res = await fetch(`https://atcoder.jp/users/${username}/history/json`);
      if (res.status === 404) {
        return { valid: false, message: 'AtCoder user not found' };
      }
      return { valid: true };
    } catch (error) {
      console.error('AtCoder Validation Error:', error);
      return { valid: true, warning: 'AtCoder API offline. Connected without live validation.' };
    }
  }

  async sync(username) {
    let history = [];
    let contestsCount = 0;
    let rating = 0;
    let maxRating = 0;

    // 1. Fetch contest history and ratings
    try {
      const res = await fetch(`https://atcoder.jp/users/${username}/history/json`);
      if (res.status === 404) {
        throw new Error('AtCoder user not found.');
      }
      if (res.ok) {
        const historyData = await res.json();
        const ratedContests = historyData.filter(item => item.IsRated);
        
        contestsCount = ratedContests.length;
        
        history = ratedContests.map((item, idx) => {
          if (item.NewRating > maxRating) maxRating = item.NewRating;
          return {
            label: `Contest ${idx + 1}`,
            value: item.NewRating,
            description: item.ContestName,
            timestamp: new Date(item.EndTime),
          };
        });

        if (ratedContests.length > 0) {
          rating = ratedContests[ratedContests.length - 1].NewRating;
        }
      }
    } catch (error) {
      throw new Error(`AtCoder history fetch failed: ${error.message}`);
    }

    const rank = this.getRank(rating);
    const maxRank = this.getRank(maxRating);

    // 2. Fetch submissions for solved count using Kenkoooo API
    let solvedCount = 0;
    let activeDays = 0;
    const calendarMap = {};

    try {
      const kenkooooRes = await fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${username}&from_second=0`);
      if (kenkooooRes.ok) {
        const submissions = await kenkooooRes.json();
        
        const solvedProblems = new Set();
        const activeDaysSet = new Set();

        submissions.forEach((submission) => {
          if (submission.result === 'AC') {
            solvedProblems.add(submission.problem_id);
          }
          const dateStr = new Date(submission.epoch_second * 1000).toISOString().split('T')[0];
          activeDaysSet.add(dateStr);
          calendarMap[dateStr] = (calendarMap[dateStr] || 0) + 1;
        });

        solvedCount = solvedProblems.size;
        activeDays = activeDaysSet.size;
      }
    } catch (error) {
      console.warn('Failed to fetch AtCoder submissions from Kenkoooo API:', error.message);
    }

    // Map to normalized PlatformStats format
    return {
      solvedCount,
      contestsCount,
      rating,
      maxRating,
      rank,
      maxRank,
      additionalMetrics: {
        activeDays,
        calendar: calendarMap,
      },
      history,
    };
  }
}
