import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntegrations } from '../hooks/useIntegrations.js';
import { PLATFORM_CONFIGS } from '../config/platforms.js';

export default function IntegrationsPage() {
  const navigate = useNavigate();
  const { connections, isLoading, connectMutation, disconnectMutation, refetch } = useIntegrations();
  const [usernames, setUsernames] = useState({ github: '', codeforces: '', leetcode: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 6000);
  };

  const handleConnect = async (platform) => {
    const username = usernames[platform].trim();
    if (!username) {
      showStatus('error', `Please input a username for ${platform.toUpperCase()}.`);
      return;
    }

    connectMutation.mutate(
      { platform, username },
      {
        onSuccess: (data) => {
          showStatus('success', data.message || `Successfully connected to ${platform}!`);
          setUsernames(prev => ({ ...prev, [platform]: '' }));
          refetch();
        },
        onError: (err) => {
          const errMsg = err.response?.data?.message || `Failed to connect ${platform} profile.`;
          showStatus('error', errMsg);
        }
      }
    );
  };

  const handleDisconnect = async (platform) => {
    if (!window.confirm(`Are you sure you want to disconnect your ${platform.toUpperCase()} profile? Your synced statistics will be lost.`)) {
      return;
    }

    disconnectMutation.mutate(platform, {
      onSuccess: () => {
        showStatus('success', `Disconnected ${platform.toUpperCase()} successfully.`);
        refetch();
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
        <div className="w-12 h-12 rounded-full border-t-2 border-slate-900 animate-spin"></div>
        <p className="mt-4 text-slate-500 text-sm">Loading integrations...</p>
      </div>
    );
  }

  const isMutating = connectMutation.status === 'pending' || disconnectMutation.status === 'pending';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Connect Coding Profiles</h2>
        <p className="text-slate-500 max-w-xl mx-auto text-xs">
          Link your profiles to fetch repository stats, Codeforces rank, and LeetCode problem solving progress into a unified dashboard.
        </p>
      </div>

      {statusMsg.text && (
        <div className={`p-4 rounded-xl border text-xs max-w-md mx-auto transition-all text-center ${
          statusMsg.type === 'success' 
            ? 'border-slate-200 bg-white text-slate-800' 
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {statusMsg.text}
        </div>
      )}

      {/* Grid containing dynamic platform cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(PLATFORM_CONFIGS).map((platform) => {
          const conn = getPlatformConn(platform.key);

          return (
            <div key={platform.key} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl flex items-center justify-center" dangerouslySetInnerHTML={{ __html: platform.icon }} />
                    <h3 className="text-sm font-bold text-slate-900">{platform.title}</h3>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    conn 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {conn ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <p className="text-[10px] text-slate-500 leading-normal">
                  Connect your {platform.title} username to pull solved problems counts, contest ratings, and statistics history.
                </p>
              </div>

              <div className="pt-4">
                {conn ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <span className="text-[10px] text-slate-400 block font-semibold">LINKED USERNAME</span>
                      <a 
                        href={`${platform.urlPrefix}${conn.username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 font-semibold hover:underline block truncate"
                      >
                        {conn.username}
                      </a>
                    </div>
                    <button
                      disabled={isMutating}
                      onClick={() => handleDisconnect(platform.key)}
                      className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold cursor-pointer transition"
                    >
                      Disconnect Handle
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder={`Enter ${platform.title} username`}
                      value={usernames[platform.key]}
                      onChange={(e) => setUsernames(prev => ({ ...prev, [platform.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                    />
                    <button
                      disabled={isMutating}
                      onClick={() => handleConnect(platform.key)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition"
                    >
                      Connect Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs text-slate-500 hover:text-slate-800 font-semibold hover:underline cursor-pointer"
        >
          &larr; Return to Dashboard
        </button>
      </div>
    </div>
  );
}
