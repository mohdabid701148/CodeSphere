import api from '../utils/api.js';

export const syncService = {
  // Retrieve aggregated dashboard statistics
  getDashboard: async () => {
    const res = await api.get('/sync');
    return res.data.data;
  },

  // Trigger synchronization for a platform
  syncPlatform: async (platform) => {
    const endpoint = platform === 'all' ? '/sync/all' : `/sync/${platform}`;
    const res = await api.post(endpoint);
    return res.data;
  },
};
