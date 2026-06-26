import React, { useState } from 'react';
import { useIntegrations } from '../hooks/useIntegrations.js';

export default function IntegrationsPage() {
  const { connections, isLoading, connectMutation, disconnectMutation, updateMutation } = useIntegrations();
  const [usernames, setUsernames] = useState({ github: '', codeforces: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isEditingGithub, setIsEditingGithub] = useState(false);
  const [editUsername, setEditUsername] = useState('');

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 6000);
  };

  const handleConnect = async (platform) => {
    const username = usernames[platform].trim();
    if (!username) {
      showStatus('error', `Please input a username for ${platform === 'github' ? 'GitHub' : 'Codeforces'}.`);
      return;
    }

    connectMutation.mutate(
      { platform, username },
      {
        onSuccess: (data) => {
          showStatus('success', data.message || `Successfully connected to ${platform}!`);
          setUsernames(prev => ({ ...prev, [platform]: '' }));
        },
        onError: (err) => {
          const errMsg = err.response?.data?.message || `Failed to connect ${platform} profile.`;
          showStatus('error', errMsg);
        }
      }
    );
  };

  const handleUpdate = async () => {
    const username = editUsername.trim();
    if (!username) {
      showStatus('error', 'Please input a username.');
      return;
    }

    updateMutation.mutate(
      { platform: 'github', username },
      {
        onSuccess: (data) => {
          showStatus('success', data.message || 'Successfully updated GitHub username!');
          setIsEditingGithub(false);
        },
        onError: (err) => {
          const errMsg = err.response?.data?.message || 'Failed to update GitHub profile.';
          showStatus('error', errMsg);
        }
      }
    );
  };

  const handleDisconnect = async (platform) => {
    if (!window.confirm(`Are you sure you want to disconnect your ${platform === 'github' ? 'GitHub' : 'Codeforces'} profile? Your synced statistics will be lost.`)) {
      return;
    }

    disconnectMutation.mutate(platform, {
      onSuccess: () => {
        showStatus('success', `Disconnected ${platform === 'github' ? 'GitHub' : 'Codeforces'} successfully.`);
        if (platform === 'github') {
          setIsEditingGithub(false);
        }
      },
      onError: () => {
        showStatus('error', `Failed to disconnect ${platform}.`);
      }
    });
  };

  const getPlatformConn = (platform) => {
    return connections.find(c => c.platform === platform && c.connected);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full border-t-2 border-indigo-600 animate-spin"></div>
        <p className="mt-4 text-slate-500 text-sm">Loading integrations...</p>
      </div>
    );
  }

  const githubConn = getPlatformConn('github');

  const githubLoading = connectMutation.status === 'pending' || disconnectMutation.status === 'pending' || updateMutation.status === 'pending';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-extrabold font-display text-slate-900 tracking-tight">
          Connect Your Platforms
        </h2>
        <p className="text-slate-600 max-w-xl mx-auto text-sm">
          Link your profiles to fetch repository counts, stars, Codeforces ranks, rating progress, and compile them onto your portfolio.
        </p>
      </div>

      {statusMsg.text && (
        <div className={`p-4 rounded-xl border text-sm max-w-lg mx-auto transition-all ${
          statusMsg.type === 'success' 
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* GitHub Integration Card */}
        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/80 p-8 rounded-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800 text-2xl font-bold">
                  <svg className="w-6 h-6 fill-current text-indigo-600" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">GitHub</h3>
                  <p className="text-xs text-slate-500">Repositories, Stars, Languages</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                githubConn ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
              }`}>
                {githubConn ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              Connect your GitHub account to sync your total stars, repository metadata, and language breakdown percentages.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-200">
            {githubConn ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-full">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold mb-1">Linked User</span>
                    
                    {!isEditingGithub ? (
                      <div className="flex items-center justify-between">
                        <a 
                          href={`https://github.com/${githubConn.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 font-semibold text-sm hover:underline"
                        >
                          @{githubConn.username}
                        </a>
                        <span className="text-xs text-slate-500">
                          Sync: {githubConn.lastSync ? new Date(githubConn.lastSync).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                          placeholder="New username"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {!isEditingGithub ? (
                  <div className="flex gap-3">
                    <button
                      disabled={githubLoading}
                      onClick={() => {
                        setEditUsername(githubConn.username);
                        setIsEditingGithub(true);
                      }}
                      className="w-1/2 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition duration-200 cursor-pointer disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      disabled={githubLoading}
                      onClick={() => handleDisconnect('github')}
                      className="w-1/2 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold hover:bg-red-100 hover:text-red-700 transition duration-200 cursor-pointer disabled:opacity-50"
                    >
                      {githubLoading ? 'Processing...' : 'Disconnect'}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      disabled={githubLoading}
                      onClick={() => setIsEditingGithub(false)}
                      className="w-1/2 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition duration-200 cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={githubLoading}
                      onClick={handleUpdate}
                      className="w-1/2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition duration-200 cursor-pointer disabled:opacity-50"
                    >
                      {githubLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter GitHub username"
                    value={usernames.github}
                    onChange={(e) => setUsernames(prev => ({ ...prev, github: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
                  />
                </div>
                <button
                  disabled={githubLoading}
                  onClick={() => handleConnect('github')}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition duration-200 cursor-pointer disabled:opacity-50"
                >
                  {githubLoading ? 'Verifying & Connecting...' : 'Connect GitHub'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Codeforces integration hidden for Phase 2 MVP */}
        {/*
        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/80 p-8 rounded-2xl space-y-6 flex flex-col justify-between opacity-50 cursor-not-allowed">
           ... codeforces integration ...
        </div>
        */}
      </div>
    </div>
  );
}
