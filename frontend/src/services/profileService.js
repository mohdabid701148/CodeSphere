import api from '../utils/api.js';

export const profileService = {
  // Query public profile credentials by slug
  getPublicProfile: async (slug) => {
    const res = await api.get(`/profile/${slug}`);
    return res.data.data;
  },

  // Update bio, headline, links, custom slug
  updateProfile: async (profileData) => {
    const res = await api.patch('/profile', profileData);
    return res.data;
  },

  // Toggle profile public/private visibility status
  togglePrivacy: async (isPublic) => {
    const res = await api.patch('/profile/privacy', { isPublic });
    return res.data;
  },
};
