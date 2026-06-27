export const PLATFORM_CONFIGS = {
  github: {
    key: 'github',
    title: 'GitHub',
    icon: `<svg class="w-5 h-5 fill-current text-slate-800" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/></svg>`,
    urlPrefix: 'https://github.com/',
    metrics: [
      { key: 'additionalMetrics.repos', label: 'Repositories' },
      { key: 'additionalMetrics.stars', label: 'Stars' },
      { key: 'additionalMetrics.followers', label: 'Followers' },
    ],
  },
  codeforces: {
    key: 'codeforces',
    title: 'Codeforces',
    icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="11" width="4" height="10" fill="#3b5998" rx="1"/><rect x="10" y="3" width="4" height="18" fill="#ea3f25" rx="1"/><rect x="17" y="7" width="4" height="14" fill="#fbc42b" rx="1"/></svg>`,
    urlPrefix: 'https://codeforces.com/profile/',
    metrics: [
      { key: 'rating', label: 'Rating' },
      { key: 'maxRating', label: 'Max Rating' },
      { key: 'rank', label: 'Rank Tier' },
    ],
  },
  leetcode: {
    key: 'leetcode',
    title: 'LeetCode',
    icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#f89f1b" d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg>`,
    urlPrefix: 'https://leetcode.com/u/',
    metrics: [
      { key: 'solvedCount', label: 'Problems Solved' },
      { key: 'rating', label: 'Contest Rating' },
      { key: 'rank', label: 'Rank Tier' },
    ],
  },
  atcoder: {
    key: 'atcoder',
    title: 'AtCoder',
    icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#222"/><path d="M12 5L7 16H9.5L10.5 13H13.5L14.5 16H17L12 5ZM11 11.5L12 8.5L13 11.5H11Z" fill="white"/></svg>`,
    urlPrefix: 'https://atcoder.jp/users/',
    metrics: [
      { key: 'rating', label: 'Rating' },
      { key: 'maxRating', label: 'Max Rating' },
      { key: 'rank', label: 'Rank Tier' },
    ],
  },
  codechef: {
    key: 'codechef',
    title: 'CodeChef',
    icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.12 6.78l-5.6 5.6-2.52-2.52-1.42 1.42 3.94 3.94 7.02-7.02-1.42-1.42z" fill="#5b4636"/></svg>`, // Basic icon since CodeChef SVGs are complex
    urlPrefix: 'https://www.codechef.com/users/',
    metrics: [
      { key: 'rating', label: 'Rating' },
      { key: 'rank', label: 'Rank Tier' },
    ],
  },
};

export const getSupportedPlatforms = () => Object.keys(PLATFORM_CONFIGS);
