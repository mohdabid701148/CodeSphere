import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard.js';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f97316', '#a855f7', '#3b82f6', '#ec4899', '#6b7280'];

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const {
    dashData,
    isLoading,
    error,
    refetch,
    syncMutation,
    updateProfileMutation,
    privacyMutation
  } = useDashboard();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    headline: user?.headline || '',
    bio: user?.bio || '',
    slug: user?.slug || '',
    linkedin: user?.socialLinks?.linkedin || '',
    twitter: user?.socialLinks?.twitter || '',
    website: user?.socialLinks?.website || '',
  });

  const [toast, setToast] = useState({ type: '', text: '' });

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: '', text: '' }), 4000);
  };

  const handleSyncAll = () => {
    syncMutation.mutate('all', {
      onSuccess: () => showToast('success', 'Profile statistics synchronized successfully.'),
      onError: (err) => showToast('error', err.response?.data?.message || 'Sync failed.')
    });
  };

  const handleSyncPlatform = (platform) => {
    syncMutation.mutate(platform, {
      onSuccess: () => showToast('success', 'Platform stats synchronized successfully.'),
      onError: (err) => showToast('error', err.response?.data?.message || 'Sync failed.')
    });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(editForm, {
      onSuccess: async () => {
        showToast('success', 'Profile details updated successfully.');
        setIsEditing(false);
        await refreshUser();
      },
      onError: (err) => showToast('error', err.response?.data?.message || 'Failed to update profile.')
    });
  };

  const handleTogglePrivacy = () => {
    privacyMutation.mutate(!user?.isPublic, {
      onSuccess: async (data) => {
        showToast('success', data.message || 'Privacy settings updated.');
        await refreshUser();
      },
      onError: (err) => showToast('error', err.response?.data?.message || 'Failed to toggle privacy.')
    });
  };

  const handleCopyLink = () => {
    if (!user?.slug) return;
    const portfolioUrl = `${window.location.origin}/profile/${user.slug}`;
    navigator.clipboard.writeText(portfolioUrl)
      .then(() => showToast('success', 'Portfolio link copied to clipboard!'))
      .catch(() => showToast('error', 'Failed to copy link.'));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-t-2 border-indigo-600 animate-spin"></div>
        <p className="text-slate-500 text-sm">Retrieving analytics database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/80 p-8 rounded-2xl text-center max-w-lg mx-auto my-12">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-slate-900 font-bold text-xl mt-4">Failed to load dashboard</h3>
        <p className="text-slate-600 mt-2 text-sm">{error.message || 'Server error. Please try again.'}</p>
        <button onClick={() => refetch()} className="mt-6 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl cursor-pointer">Retry Load</button>
      </div>
    );
  }

  const { connections = [], githubStats, codeforcesStats, syncLogs = [] } = dashData || {};
  const githubConn = connections.find(c => c.platform === 'github' && c.connected);
  const codeforcesConn = connections.find(c => c.platform === 'codeforces' && c.connected);
  const isSyncing = syncMutation.status === 'pending';

  const cfChartData = codeforcesStats?.contestHistory?.map((c, i) => ({
    name: `Contest ${i + 1}`,
    rating: c.newRating,
    rank: c.rank,
    contest: c.contestName.length > 30 ? c.contestName.substring(0, 30) + '...' : c.contestName
  })) || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Alert */}
      {toast.text && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl border text-sm shadow-xl transition-all ${
          toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {toast.text}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/80 p-8 rounded-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50/5 rounded-full blur-3xl -z-10"></div>
        <div className="flex items-center gap-6">
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=placeholder'}
            alt={user?.name}
            className="w-20 h-20 rounded-2xl border border-indigo-100 object-cover"
          />
          <div className="space-y-1.5">
            <h2 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">
              {user?.name || 'Developer'}
            </h2>
            <p className="text-indigo-600 font-medium text-sm">
              {user?.headline || 'Full Stack Engineer & Competitive Programmer'}
            </p>
            <p className="text-slate-500 text-xs font-mono">
              URL: {user?.slug ? `/profile/${user.slug}` : 'not configured'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              setEditForm({
                headline: user?.headline || '',
                bio: user?.bio || '',
                slug: user?.slug || '',
                linkedin: user?.socialLinks?.linkedin || '',
                twitter: user?.socialLinks?.twitter || '',
                website: user?.socialLinks?.website || '',
              });
              setIsEditing(!isEditing);
            }}
            className="px-5 py-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition cursor-pointer"
          >
            {isEditing ? 'Cancel Edit' : '✍️ Edit Profile'}
          </button>

          {user?.slug && (
            <button
              onClick={handleCopyLink}
              className="px-5 py-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition cursor-pointer"
            >
              🔗 Share Portfolio
            </button>
          )}

          <button
            disabled={isSyncing || (!githubConn && !codeforcesConn)}
            onClick={handleSyncAll}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 disabled:opacity-50 text-white text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            {isSyncing ? '🔄 Syncing...' : '🔄 Refresh All Stats'}
          </button>
        </div>
      </div>

      {/* Editing Form Section */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 shadow-xl shadow-slate-100/80 p-8 rounded-2xl space-y-6">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Customize Portfolio Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase">Headline</label>
              <input
                type="text"
                placeholder="Headline (e.g. Software Engineer at Google)"
                value={editForm.headline}
                onChange={e => setEditForm(prev => ({ ...prev, headline: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase">Custom URL Slug</label>
              <input
                type="text"
                placeholder="Slug (e.g. johndoe)"
                value={editForm.slug}
                onChange={e => setEditForm(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase">Bio</label>
              <textarea
                rows="3"
                placeholder="Write a short summary about your coding experience..."
                value={editForm.bio}
                onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase">LinkedIn Profile URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={editForm.linkedin}
                onChange={e => setEditForm(prev => ({ ...prev, linkedin: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase">Twitter Profile URL</label>
              <input
                type="url"
                placeholder="https://twitter.com/username"
                value={editForm.twitter}
                onChange={e => setEditForm(prev => ({ ...prev, twitter: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase">Personal Website URL</label>
              <input
                type="url"
                placeholder="https://yourwebsite.com"
                value={editForm.website}
                onChange={e => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProfileMutation.status === 'pending'}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer"
            >
              {updateProfileMutation.status === 'pending' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Grid: Overview charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* GitHub stats overview */}
        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/80 p-6 rounded-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐙</span>
                <h3 className="text-lg font-bold text-slate-900">GitHub Analytics</h3>
              </div>
              {githubConn && (
                <button
                  disabled={isSyncing}
                  onClick={() => handleSyncPlatform('github')}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer disabled:opacity-50"
                >
                  Sync Now
                </button>
              )}
            </div>

            {githubConn && githubStats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-2xl font-extrabold text-slate-900">{githubStats.repos}</span>
                  <span className="block text-xs text-slate-400 mt-1 uppercase font-semibold">Repos</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-2xl font-extrabold text-indigo-600">{githubStats.stars}</span>
                  <span className="block text-xs text-slate-400 mt-1 uppercase font-semibold">Stars</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-2xl font-extrabold text-emerald-600">{githubStats.followers}</span>
                  <span className="block text-xs text-slate-400 mt-1 uppercase font-semibold">Followers</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-2xl font-extrabold text-amber-600">{githubStats.following}</span>
                  <span className="block text-xs text-slate-400 mt-1 uppercase font-semibold">Following</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                {githubConn ? 'Never synchronized. Click Sync Now to pull data.' : 'GitHub account not linked.'}
              </div>
            )}
          </div>
          {githubConn && githubStats?.languages?.length > 0 && (
            <div className="h-60 pt-4 border-t border-slate-100">
              <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 text-center">Language Distribution</h4>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={githubStats.languages}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="percentage"
                    nameKey="name"
                  >
                    {githubStats.languages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                    itemStyle={{ color: '#0f172a' }}
                  />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Codeforces stats overview */}
        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/80 p-6 rounded-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <h3 className="text-lg font-bold text-slate-900">Codeforces Analytics</h3>
              </div>
              {codeforcesConn && (
                <button
                  disabled={isSyncing}
                  onClick={() => handleSyncPlatform('codeforces')}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer disabled:opacity-50"
                >
                  Sync Now
                </button>
              )}
            </div>

            {codeforcesConn && codeforcesStats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-2xl font-extrabold text-slate-900">{codeforcesStats.rating}</span>
                  <span className="block text-xs text-slate-400 mt-1 uppercase font-semibold">Rating</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-2xl font-extrabold text-indigo-600">{codeforcesStats.maxRating}</span>
                  <span className="block text-xs text-slate-400 mt-1 uppercase font-semibold">Max Rating</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-md font-bold text-rose-600 truncate block mt-1 leading-6">{codeforcesStats.rank}</span>
                  <span className="block text-xs text-slate-400 mt-1 uppercase font-semibold">Rank Tier</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-md font-bold text-amber-600 truncate block mt-1 leading-6">{codeforcesStats.maxRank || 'Unrated'}</span>
                  <span className="block text-xs text-slate-400 mt-1 uppercase font-semibold">Max Rank Tier</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                {codeforcesConn ? 'Never synchronized. Click Sync Now to pull data.' : 'Codeforces account not linked.'}
              </div>
            )}
          </div>
          {codeforcesConn && cfChartData.length > 0 && (
            <div className="h-60 pt-4 border-t border-slate-100">
              <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 text-center">Rating Progression</h4>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={cfChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.01)" />
                  <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '10px' }} />
                  <YAxis stroke="#94a3b8" domain={['dataMin - 100', 'dataMax + 100']} style={{ fontSize: '10px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                    itemStyle={{ color: '#0f172a' }}
                    labelStyle={{ color: '#f43f5e', fontWeight: 'bold' }}
                    formatter={(value, name, props) => [`Rating: ${value} (Rank: ${props.payload.rank})`, props.payload.contest]}
                  />
                  <Area type="monotone" dataKey="rating" stroke="#f43f5e" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRating)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Account Settings / Sync logs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/80 p-6 rounded-2xl space-y-6">
          <h3 className="text-slate-900 font-bold text-lg border-b border-slate-100 pb-3">Portfolio Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-800">Public Visibility</span>
                <p className="text-xs text-slate-400">Allow search & link views</p>
              </div>
              <button
                type="button"
                onClick={handleTogglePrivacy}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                  user?.isPublic ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 transform ${
                  user?.isPublic ? 'translate-x-6' : 'translate-x-0'
                }`}></div>
              </button>
            </div>

            <div className="pt-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Share Link</span>
              {user?.slug ? (
                <div className="mt-1 flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-indigo-600 font-mono text-xs truncate flex-1">
                    /profile/{user.slug}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition font-semibold"
                  >
                    Copy
                  </button>
                </div>
              ) : (
                <span className="text-slate-400 text-xs mt-1 block">Set slug to enable sharing.</span>
              )}
            </div>
          </div>
        </div>

        {/* Sync logs */}
        <div className="md:col-span-2 bg-white border border-slate-200 shadow-xl shadow-slate-100/80 p-6 rounded-2xl">
          <h3 className="text-slate-900 font-bold text-lg mb-4 border-b border-slate-100 pb-3">Synchronization History</h3>
          {syncLogs.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {syncLogs.map((log) => (
                <div key={log._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    <div>
                      <span className="text-slate-800 font-medium">{log.platform === 'github' ? 'GitHub' : 'Codeforces'} sync {log.status}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{log.message}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 text-sm py-4">No sync logs found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
