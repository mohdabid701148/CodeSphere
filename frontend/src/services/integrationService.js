import api from '../utils/api.js';

export const integrationService = {
  // Fetch linkage status of active platforms
  getStatus: async () => {
    const res = await api.get('/integrations/status');
    return res.data.data;
  },

  // Connect platform handle
  connect: async (platform, username) => {
    const res = await api.post(`/integrations/${platform}`, { username });
    return res.data;
  },

  // Disconnect handle and delete stats records
  disconnect: async (platform) => {
    const res = await api.delete(`/integrations/${platform}`);
    return res.data;
  },
};
