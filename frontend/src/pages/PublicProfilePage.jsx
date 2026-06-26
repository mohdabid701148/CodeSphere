import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
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

export default function PublicProfilePage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [privacyError, setPrivacyError] = useState(false);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      setLoading(true);
      setErrorMsg('');
      setPrivacyError(false);
      try {
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`http://localhost:5000/profile/${slug}`, { headers });
        if (response.data?.success) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error('Fetch public profile error:', err);
        if (err.response?.status === 403) {
          setPrivacyError(true);
        } else {
          setErrorMsg(err.response?.data?.message || 'Developer profile not found.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPublicProfile();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-t-2 border-indigo-600 animate-spin"></div>
        <p className="text-slate-500 text-sm">Loading portfolio profile...</p>
      </div>
    );
  }

  if (privacyError) {
    return (
      <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/80 p-12 rounded-2xl text-center max-w-lg mx-auto my-16 space-y-6">
        <span className="text-5xl">🔒</span>
        <h3 className="text-slate-900 font-extrabold text-2xl tracking-tight">This Profile is Private</h3>
        <p className="text-slate-600 text-sm max-w-sm mx-auto">
          The owner of this portfolio has set their profile visibility to private. Only authenticated owners can access this dashboard view.
        </p>
        <div className="pt-4">
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
            &larr; Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/80 p-12 rounded-2xl text-center max-w-lg mx-auto my-16 space-y-6">
        <span className="text-5xl">🔍</span>
        <h3 className="text-slate-900 font-extrabold text-2xl tracking-tight">Developer Not Found</h3>
        <p className="text-slate-600 text-sm">
          {errorMsg || 'We could not find any active portfolio matching this address URL.'}
        </p>
        <div className="pt-4">
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
            &larr; Return Home
          </Link>
        </div>
      </div>
    );
  }

  const { user, connections = [], githubStats, codeforcesStats } = data || {};
  const githubConn = connections.find(c => c.platform === 'github');
  const codeforcesConn = connections.find(c => c.platform === 'codeforces');

  const cfChartData = codeforcesStats?.contestHistory?.map((c, i) => ({
    name: `Contest ${i + 1}`,
    rating: c.newRating,
    rank: c.rank,
    contest: c.contestName.length > 30 ? c.contestName.substring(0, 30) + '...' : c.contestName
  })) || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Public profile header card */}
      <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/80 p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-emerald-50/5 rounded-full blur-3xl -z-10"></div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=placeholder'}
            alt={user?.name}
            className="w-24 h-24 rounded-2xl border border-indigo-100 object-cover"
          />
          <div className="text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h2 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                {user?.name}
              </h2>
            </div>
            <p className="text-indigo-600 font-medium text-sm">
              {user?.headline || 'Developer Portfolio'}
            </p>
            <p className="text-slate-600 text-sm max-w-xl">
              {user?.bio || 'Passionate developer showcasing statistics.'}
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex gap-4 justify-center">
          {user?.socialLinks?.linkedin && (
            <a
              href={user.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition"
              title="LinkedIn"
            >
              💼
            </a>
          )}
          {user?.socialLinks?.twitter && (
            <a
              href={user.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition"
              title="Twitter"
            >
              🐦
            </a>
          )}
          {user?.socialLinks?.website && (
            <a
              href={user.socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition"
              title="Personal Website"
            >
              🌐
            </a>
          )}
        </div>
      </div>

      {/* Grid: Overview charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* GitHub stats overview */}
        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/80 p-6 rounded-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-xl">🐙</span>
              <h3 className="text-lg font-bold text-slate-900">GitHub Statistics</h3>
            </div>

            {githubConn && githubStats ? (
              <div className="grid grid-cols-3 gap-4">
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
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                GitHub integration not configured.
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
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-xl">🏆</span>
              <h3 className="text-lg font-bold text-slate-900">Codeforces Statistics</h3>
            </div>

            {codeforcesConn && codeforcesStats ? (
              <div className="grid grid-cols-3 gap-4">
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
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                Codeforces integration not configured.
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
    </div>
  );
}
