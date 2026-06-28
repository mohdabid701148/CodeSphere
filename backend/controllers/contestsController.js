import { asyncHandler } from '../utils/asyncHandler.js';
import redisClient from '../config/redis.js';

const CACHE_TTL_SEC = 3600; // 1 hour

const THIRTY_DAYS_SEC = 30 * 24 * 60 * 60;

const fetchCodeforces = async () => {
  try {
    const res = await fetch('https://codeforces.com/api/contest.list?gym=false');
    const data = await res.json();
    if (data.status !== 'OK') return [];
    
    const nowSec = Math.floor(Date.now() / 1000);
    return data.result
      .filter(c => c.startTimeSeconds > nowSec - THIRTY_DAYS_SEC)
      .map(c => ({
        id: `cf-${c.id}`,
        platform: 'codeforces',
        title: c.name,
        startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
        durationSeconds: c.durationSeconds,
        url: `https://codeforces.com/contest/${c.id}`
      }));
  } catch (error) {
    console.error('Codeforces contests fetch error:', error);
    return [];
  }
};

const fetchLeetCode = async () => {
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{
          topTwoContests {
            title
            titleSlug
            startTime
            duration
          }
          pastContests(pageNo: 1, numPerPage: 10) {
            data {
              title
              titleSlug
              startTime
              duration
            }
          }
        }`
      })
    });
    const data = await res.json();
    
    const upcoming = data.data.topTwoContests || [];
    const past = data.data.pastContests?.data || [];
    
    return [...upcoming, ...past].map(c => ({
      id: `lc-${c.titleSlug}`,
      platform: 'leetcode',
      title: c.title,
      startTime: new Date(c.startTime * 1000).toISOString(),
      durationSeconds: c.duration,
      url: `https://leetcode.com/contest/${c.titleSlug}`
    }));
  } catch (error) {
    console.error('LeetCode contests fetch error:', error);
    return [];
  }
};

const fetchAtCoder = async () => {
  try {
    const res = await fetch('https://kenkoooo.com/atcoder/resources/contests.json');
    const data = await res.json();
    const nowSeconds = Math.floor(Date.now() / 1000);
    
    return data
      .filter(c => c.start_epoch_second > nowSeconds - THIRTY_DAYS_SEC)
      .filter(c => /AtCoder (Beginner|Regular|Grand|Heuristic) Contest/.test(c.title))
      .map(c => ({
        id: `ac-${c.id}`,
        platform: 'atcoder',
        title: c.title,
        startTime: new Date(c.start_epoch_second * 1000).toISOString(),
        durationSeconds: c.duration_second,
        url: `https://atcoder.jp/contests/${c.id}`
      }));
  } catch (error) {
    console.error('AtCoder contests fetch error:', error);
    return [];
  }
};

const fetchCodeChef = async () => {
  try {
    const res = await fetch('https://www.codechef.com/api/list/contests/all', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const data = await res.json();
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_SEC * 1000);
    
    const allCc = [
      ...(data.future_contests || []),
      ...(data.present_contests || []),
      ...(data.past_contests || [])
    ];
    
    return allCc
      .filter(c => new Date(c.contest_start_date_iso) > thirtyDaysAgo)
      .map(c => ({
        id: `cc-${c.code}`,
        platform: 'codechef',
        title: c.contest_name,
        startTime: new Date(c.contest_start_date_iso).toISOString(),
        durationSeconds: parseInt(c.contest_duration) * 60,
        url: `https://www.codechef.com/${c.code}`
      }));
  } catch (error) {
    console.error('CodeChef contests fetch error:', error);
    return [];
  }
};

export const getUpcomingContests = asyncHandler(async (req, res) => {
  // Check Redis cache first
  try {
    const cached = await redisClient.get('contests:all');
    if (cached) {
      return res.status(200).json(cached);
    }
  } catch (err) {
    console.error('Redis GET Error:', err.message);
  }

  // Fetch all in parallel
  const [cf, lc, ac, cc] = await Promise.all([
    fetchCodeforces(),
    fetchLeetCode(),
    fetchAtCoder(),
    fetchCodeChef()
  ]);

  const allContests = [...cf, ...lc, ...ac, ...cc]
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Save to Redis
  try {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      await redisClient.setex('contests:all', CACHE_TTL_SEC, allContests);
    }
  } catch (err) {
    console.error('Redis SETEX Error:', err.message);
  }

  res.status(200).json(allContests);
});
