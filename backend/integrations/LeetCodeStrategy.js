import { BasePlatformStrategy } from './BasePlatformStrategy.js';

export class LeetCodeStrategy extends BasePlatformStrategy {
  constructor() {
    super('leetcode');
  }

  async validateUser(username) {
    const query = `
      query validateUser($username: String!) {
        matchedUser(username: $username) {
          username
        }
      }
    `;

    try {
      const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
        },
        body: JSON.stringify({ query, variables: { username } }),
      });

      const result = await res.json();
      if (result.errors && result.errors.some(e => e.message.includes('does not exist'))) {
        return { valid: false, message: 'LeetCode username does not exist.' };
      }

      if (!result.data || !result.data.matchedUser) {
        return { valid: false, message: 'LeetCode user not found.' };
      }

      return { valid: true };
    } catch (error) {
      console.error('LeetCode Validation Error:', error);
      return { valid: true, warning: 'LeetCode API offline. Connected without live validation.' };
    }
  }

  async sync(username) {
    const query = `
      query userCombinedStats($username: String!) {
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
          badges {
            name
            icon
          }
          tagProblemCounts {
            fundamental {
              tagName
              problemsSolved
            }
            intermediate {
              tagName
              problemsSolved
            }
            advanced {
              tagName
              problemsSolved
            }
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          topPercentage
          badge {
            name
          }
        }
        userContestRankingHistory(username: $username) {
          attended
          rating
          ranking
          contest {
            title
            startTime
          }
        }
      }
    `;

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({ query, variables: { username } }),
    });

    const result = await res.json();

    if (result.errors && result.errors.some(e => e.message.includes('does not exist'))) {
      throw new Error('LeetCode profile fetch failed. User does not exist.');
    }

    const data = result.data;
    if (!data || !data.matchedUser) {
      throw new Error('LeetCode user profile stats not found.');
    }

    // Fetch active years first
    let activeYears = [new Date().getFullYear()];
    try {
      const yearsQuery = `
        query getActiveYears($username: String!) {
          matchedUser(username: $username) {
            userCalendar {
              activeYears
            }
          }
        }
      `;
      const yearsRes = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
        },
        body: JSON.stringify({ query: yearsQuery, variables: { username } }),
      });
      const yearsData = await yearsRes.json();
      if (yearsData.data?.matchedUser?.userCalendar?.activeYears) {
        activeYears = yearsData.data.matchedUser.userCalendar.activeYears;
      }
    } catch (err) {
      console.warn('Failed to fetch LeetCode active years:', err.message);
    }

    // Fetch calendar for all active years
    let activeDays = 0;
    const calendarMap = {};
    for (const year of activeYears) {
      try {
        const calQuery = `
          query getYearCalendar($username: String!, $year: Int!) {
            matchedUser(username: $username) {
              userCalendar(year: $year) {
                totalActiveDays
                submissionCalendar
              }
            }
          }
        `;
        const calRes = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
          },
          body: JSON.stringify({ query: calQuery, variables: { username, year } }),
        });
        const calData = await calRes.json();
        const userCal = calData.data?.matchedUser?.userCalendar;
        if (userCal) {
          activeDays += userCal.totalActiveDays || 0;
          if (userCal.submissionCalendar) {
            const calendar = JSON.parse(userCal.submissionCalendar);
            Object.entries(calendar).forEach(([timestamp, count]) => {
              const dateStr = new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0];
              calendarMap[dateStr] = (calendarMap[dateStr] || 0) + count;
            });
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch LeetCode calendar for year ${year}:`, err.message);
      }
    }

    // 1. Parse solved counts
    let solvedCount = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    const submissionStats = data.matchedUser.submitStats?.acSubmissionNum || [];
    submissionStats.forEach((item) => {
      if (item.difficulty === 'All') solvedCount = item.count;
      if (item.difficulty === 'Easy') easySolved = item.count;
      if (item.difficulty === 'Medium') mediumSolved = item.count;
      if (item.difficulty === 'Hard') hardSolved = item.count;
    });

    // 2. Parse contest rankings
    const contestRanking = data.userContestRanking || {};
    const contestsCount = contestRanking.attendedContestsCount || 0;
    const currentRating = Math.round(contestRanking.rating || 0);
    const rank = contestRanking.badge?.name || (currentRating > 0 ? 'Contestant' : 'Unrated');

    // 3. Parse contest history & max rating
    let history = [];
    let maxRating = currentRating;
    const historyData = data.userContestRankingHistory || [];
    
    // Filter and map attended contests
    const attendedContests = historyData.filter(item => item.attended);
    
    attendedContests.forEach((item, idx) => {
      const ratingVal = Math.round(item.rating || 0);
      if (ratingVal > maxRating) {
        maxRating = ratingVal;
      }
      
      history.push({
        label: `Contest ${idx + 1}`,
        value: ratingVal,
        description: item.contest?.title || 'LeetCode Contest',
        timestamp: item.contest?.startTime ? new Date(item.contest.startTime * 1000) : new Date(),
      });
    });



    // 5. Parse badges
    const badges = (data.matchedUser.badges || []).map((badge) => ({
      name: badge.name,
      icon: badge.icon.startsWith('http') ? badge.icon : `https://leetcode.com${badge.icon}`,
    }));

    // 6. Parse topic tag problem stats
    const tags = [];
    const tagCounts = data.matchedUser.tagProblemCounts || {};
    ['fundamental', 'intermediate', 'advanced'].forEach((category) => {
      if (tagCounts[category]) {
        tagCounts[category].forEach((tag) => {
          tags.push({
            name: tag.tagName,
            solved: tag.problemsSolved,
            category,
          });
        });
      }
    });
    tags.sort((a, b) => b.solved - a.solved);

    // Map to normalized PlatformStats format
    return {
      solvedCount,
      contestsCount,
      rating: currentRating,
      maxRating,
      rank,
      maxRank: rank,
      additionalMetrics: {
        easySolved,
        mediumSolved,
        hardSolved,
        globalRanking: contestRanking.globalRanking || null,
        topPercentage: contestRanking.topPercentage || null,
        activeDays,
        badges,
        tags,
        calendar: calendarMap,
      },
      history,
    };
  }

  async verifyUser(username, token, startedAt) {
    try {
      // Instant verification: check if user submitted to "Two Sum" after verification started
      const query = `
        query userRecentSubmissions($username: String!, $limit: Int!) {
          recentSubmissionList(username: $username, limit: $limit) {
            titleSlug
            timestamp
            statusDisplay
          }
        }
      `;
      const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
        },
        body: JSON.stringify({ query, variables: { username, limit: 20 } }),
      });
      const result = await res.json();
      const submissions = result.data?.recentSubmissionList || [];
      
      const startTime = startedAt ? Math.floor(new Date(startedAt).getTime() / 1000) : 0;
      
      return submissions.some(sub => 
        sub.titleSlug === 'two-sum' && 
        parseInt(sub.timestamp) >= startTime
      );
    } catch (err) {
      console.error('LeetCode Verification Error:', err);
      return false;
    }
  }
}
