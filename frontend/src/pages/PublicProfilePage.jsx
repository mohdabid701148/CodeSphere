import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import PlatformRatingChart from '../components/PlatformRatingChart';
import { PLATFORM_CONFIGS } from '../config/platforms.js';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function PublicProfilePage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [privacyError, setPrivacyError] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Current');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [showAllDsaTopics, setShowAllDsaTopics] = useState(false);

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
        <div className="w-12 h-12 rounded-full border-t-2 border-slate-900 animate-spin"></div>
        <p className="text-slate-500 text-sm">Loading portfolio profile...</p>
      </div>
    );
  }

  if (privacyError) {
    return (
      <div className="bg-white border border-slate-200 shadow-md p-12 rounded-2xl text-center max-w-lg mx-auto my-16 space-y-6">
        <span className="text-5xl">🔒</span>
        <h3 className="text-slate-900 font-extrabold text-2xl tracking-tight">This Profile is Private</h3>
        <p className="text-slate-600 text-sm max-w-sm mx-auto">
          The owner of this portfolio has set their profile visibility to private. Only the authenticated owner can access this view.
        </p>
        <div className="pt-4">
          <Link to="/" className="text-slate-900 font-semibold text-sm hover:underline">
            &larr; Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-white border border-slate-200 shadow-md p-12 rounded-2xl text-center max-w-lg mx-auto my-16 space-y-6">
        <span className="text-5xl">🔍</span>
        <h3 className="text-slate-900 font-extrabold text-2xl tracking-tight">Developer Not Found</h3>
        <p className="text-slate-600 text-sm">
          {errorMsg || 'We could not find any active portfolio matching this address URL.'}
        </p>
        <div className="pt-4">
          <Link to="/" className="text-slate-900 font-semibold text-sm hover:underline">
            &larr; Return Home
          </Link>
        </div>
      </div>
    );
  }

  const { user, connections = [], githubStats, codeforcesStats, leetcodeStats, atcoderStats, allStats = [] } = data || {};

  // Find active connections
  const getPlatformConn = (platform) => connections.find(c => c.platform === platform && c.connected);

  // Compute aggregated stats
  const totalSolved = (leetcodeStats?.solvedCount || 0) + (codeforcesStats?.solvedCount || 0) + (atcoderStats?.solvedCount || 0) + (codechefStats?.solvedCount || 0);
  const totalContests = (leetcodeStats?.contestsCount || 0) + (codeforcesStats?.contestsCount || 0) + (atcoderStats?.contestsCount || 0) + (codechefStats?.contestsCount || 0);
  const totalActiveDays = (leetcodeStats?.additionalMetrics?.activeDays || 0) + (codeforcesStats?.additionalMetrics?.activeDays || 0) + (atcoderStats?.additionalMetrics?.activeDays || 0) + (codechefStats?.additionalMetrics?.activeDays || 0);
  const cpSolved = (codeforcesStats?.solvedCount || 0) + (atcoderStats?.solvedCount || 0) + (codechefStats?.solvedCount || 0);

  // Prepare unified rating chart data
  const cfHistory = codeforcesStats?.history || [];
  const lcHistory = leetcodeStats?.history || [];
  const acHistory = atcoderStats?.history || [];
  const ccHistory = codechefStats?.history || [];
  
  const chartDataLength = Math.max(cfHistory.length, lcHistory.length, acHistory.length, ccHistory.length);
  const unifiedChartData = [];
  for (let i = 0; i < chartDataLength; i++) {
    const dataPoint = { name: `Match ${i + 1}` };
    if (i < cfHistory.length) {
      dataPoint.Codeforces = cfHistory[i].value;
      dataPoint.cfContest = cfHistory[i].description;
    }
    if (i < lcHistory.length) {
      dataPoint.LeetCode = lcHistory[i].value;
      dataPoint.lcContest = lcHistory[i].description;
    }
    if (i < acHistory.length) {
      dataPoint.AtCoder = acHistory[i].value;
      dataPoint.acContest = acHistory[i].description;
    }
    if (i < ccHistory.length) {
      dataPoint.CodeChef = ccHistory[i].value;
      dataPoint.ccContest = ccHistory[i].description;
    }
    unifiedChartData.push(dataPoint);
  }

  // Get awards and topics from LeetCode
  const leetCodeBadges = leetcodeStats?.additionalMetrics?.badges || [];
  const dsaTags = leetcodeStats?.additionalMetrics?.tags || [];

  // Flat calendar dates for calculating streaks
  const getFlatCalendarData = (lcCalendar = {}, cfCalendar = {}, acCalendar = {}, period = 'Current') => {
    const dates = [];
    const today = new Date();
    
    if (period === 'Current') {
      const startDate = new Date();
      startDate.setDate(today.getDate() - 180);
      const currentDate = new Date(startDate);
      while (currentDate <= today) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = (lcCalendar[dateStr] || 0) + (cfCalendar[dateStr] || 0) + (acCalendar[dateStr] || 0);
        dates.push({
          date: new Date(currentDate),
          dateStr,
          count
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      const selectedYear = parseInt(period);
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31);
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = (lcCalendar[dateStr] || 0) + (cfCalendar[dateStr] || 0) + (acCalendar[dateStr] || 0);
        dates.push({
          date: new Date(currentDate),
          dateStr,
          count
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    return dates;
  };

  const calendarDates = getFlatCalendarData(
    leetcodeStats?.additionalMetrics?.calendar,
    codeforcesStats?.additionalMetrics?.calendar,
    atcoderStats?.additionalMetrics?.calendar,
    selectedPeriod
  );

  // Grouped monthly grids for rendering heatmap blocks
  const getMonthlyCalendarGrid = (lcCalendar = {}, cfCalendar = {}, acCalendar = {}, period = 'Current') => {
    const monthsData = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const generateMonthGrid = (year, month) => {
      const targetDate = new Date(year, month, 1);
      const firstDay = new Date(year, month, 1);
      const firstDayOfWeek = firstDay.getDay(); // 0 is Sunday
      
      const lastDay = new Date(year, month + 1, 0);
      const totalDays = lastDay.getDate();
      const lastDayOfWeek = lastDay.getDay();
      
      const dates = [];
      
      // Padding before first day of month (blank grid squares)
      for (let i = 0; i < firstDayOfWeek; i++) {
        dates.push({ isPadding: true });
      }
      
      // Days in the month
      for (let day = 1; day <= totalDays; day++) {
        const currentDate = new Date(year, month, day);
        currentDate.setHours(0, 0, 0, 0);
        
        if (currentDate > today) {
          dates.push({ isPadding: true });
        } else {
          const dateStr = currentDate.toISOString().split('T')[0];
          const count = (lcCalendar[dateStr] || 0) + (cfCalendar[dateStr] || 0) + (acCalendar[dateStr] || 0);
          dates.push({
            isPadding: false,
            date: currentDate,
            dateStr,
            count
          });
        }
      }
      
      // Padding after last day of month (blank grid squares)
      for (let i = lastDayOfWeek + 1; i <= 6; i++) {
        dates.push({ isPadding: true });
      }
      
      return {
        monthName: targetDate.toLocaleString('default', { month: 'short' }),
        dates
      };
    };
    
    if (period === 'Current') {
      // Generate the last 6 months (including current month)
      for (let m = 5; m >= 0; m--) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
        monthsData.push(generateMonthGrid(targetDate.getFullYear(), targetDate.getMonth()));
      }
    } else {
      // Generate full year (January to December)
      const selectedYear = parseInt(period);
      for (let m = 0; m < 12; m++) {
        monthsData.push(generateMonthGrid(selectedYear, m));
      }
    }
    
    return monthsData;
  };

  const monthlyGrid = getMonthlyCalendarGrid(
    leetcodeStats?.additionalMetrics?.calendar,
    codeforcesStats?.additionalMetrics?.calendar,
    atcoderStats?.additionalMetrics?.calendar,
    selectedPeriod
  );

  // Compute streaks
  const calculateStreaks = (dates) => {
    const activeDates = dates.filter(d => d.count > 0).map(d => d.dateStr);
    const uniqueSortedDates = [...new Set(activeDates)].sort();

    let maxStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    uniqueSortedDates.forEach(dateStr => {
      const curr = new Date(dateStr);
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(curr - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays > 1) {
          if (tempStreak > maxStreak) maxStreak = tempStreak;
          tempStreak = 1;
        }
      }
      prevDate = curr;
    });

    if (tempStreak > maxStreak) maxStreak = tempStreak;

    if (uniqueSortedDates.length > 0) {
      const lastActiveDate = new Date(uniqueSortedDates[uniqueSortedDates.length - 1]);
      const today = new Date();
      const diffTime = Math.abs(today - lastActiveDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 2) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }
    }

    const totalSubmissions = dates.reduce((sum, d) => sum + d.count, 0);

    return { maxStreak, currentStreak, totalSubmissions };
  };

  const { maxStreak, currentStreak, totalSubmissions } = calculateStreaks(calendarDates);

  return (
    <div className="space-y-8 pb-16">
      {/* Main Grid: Sidebar + Profile Ingestion Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Public Profile Info & Platform Dock */}
        <div className="space-y-6 lg:col-span-1">
          {/* Developer Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Developer'}
                alt={user?.name}
                className="w-24 h-24 rounded-full border border-slate-100 object-cover"
              />
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                <p className="text-xs text-slate-400 font-mono">@{user?.slug || 'username'}</p>
              </div>
              <p className="text-slate-600 text-xs text-center max-w-xs">{user?.headline || 'Developer Portfolio'}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <p>{user?.bio || 'Passionate developer showcasing stats.'}</p>
              {user?.socialLinks?.linkedin && (
                <p className="truncate">💼 <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">LinkedIn</a></p>
              )}
              {user?.socialLinks?.twitter && (
                <p className="truncate">🐦 <a href={user.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Twitter</a></p>
              )}
              {user?.socialLinks?.website && (
                <p className="truncate">🌐 <a href={user.socialLinks.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Website</a></p>
              )}
            </div>
          </div>

          {/* Connected Handles List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Connected Platforms</h3>
            
            <div className="space-y-3">
              {Object.values(PLATFORM_CONFIGS).map((platform) => {
                const conn = getPlatformConn(platform.key);
                if (!conn) return null;

                return (
                  <div key={platform.key} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: platform.icon }} />
                      <div className="ml-1">
                        <span className="font-semibold text-slate-800 block">{platform.title}</span>
                        <a 
                          href={`${platform.urlPrefix}${conn.username}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-slate-400 hover:underline truncate block max-w-[150px]"
                        >
                          {conn.username}
                        </a>
                      </div>
                    </div>
                    <span className="text-emerald-500 font-bold">✓</span>
                  </div>
                );
              })}

              {connections.filter(c => c.connected).length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">No active coding profiles connected.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Ingestion Stats View */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Total Contests Widget */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="text-center md:text-left flex flex-col items-center md:items-start md:pl-4">
              <span className="text-slate-500 font-bold text-lg">Total Contests</span>
              <span className="text-7xl font-black text-slate-900 mt-2">{totalContests}</span>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[260px]">
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.leetcode.icon }} />
                  <span className="font-semibold text-slate-700 text-sm">LeetCode</span>
                </div>
                <span className="font-bold text-slate-800">{leetcodeStats?.contestsCount || 0}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.codeforces.icon }} />
                  <span className="font-semibold text-slate-700 text-sm">CodeForces</span>
                </div>
                <span className="font-bold text-slate-800">{codeforcesStats?.contestsCount || 0}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.atcoder.icon }} />
                  <span className="font-semibold text-slate-700 text-sm">AtCoder</span>
                </div>
                <span className="font-bold text-slate-800">{atcoderStats?.contestsCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Coding Consistency (GitHub/LeetCode style monthly grouped heatmap grid) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 relative consistency-card">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2 relative">
              <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Coding Consistency</h4>
              <div className="flex gap-4 text-xs font-semibold text-slate-500 items-center">
                <span>Submissions <span className="text-slate-900 font-bold font-mono">{totalSubmissions}</span></span>
                <span>Max.Streak <span className="text-slate-900 font-bold font-mono">{maxStreak}</span></span>
                <span>Current.Streak <span className="text-slate-900 font-bold font-mono">{currentStreak}</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer select-none relative"
                >
                  <span>{selectedPeriod}</span>
                  <span className="text-[10px]">▼</span>

                  {isPeriodDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 bg-white border border-slate-200 shadow-lg rounded-xl py-1.5 w-28 z-50 text-slate-800 text-left font-medium">
                      {['Current', '2026', '2025'].map((p) => (
                        <div
                          key={p}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPeriod(p);
                            setIsPeriodDropdownOpen(false);
                          }}
                          className="px-3.5 py-1.5 hover:bg-slate-50 text-xs cursor-pointer"
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-slate-400 font-bold text-xs select-none">≫</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Flex row of month blocks */}
              <div className="flex flex-nowrap gap-6 items-start overflow-x-auto py-2">
                {monthlyGrid.map((month, mIdx) => (
                  <div key={mIdx} className="flex flex-col items-center space-y-2 flex-shrink-0">
                    {/* Month Grid box */}
                    <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                      <div className="grid grid-flow-col grid-rows-7 gap-1 select-none">
                        {month.dates.map((d, i) => {
                          if (d.isPadding) {
                            return <div key={i} className="w-2.5 h-2.5 bg-transparent" />;
                          }

                          let color = '#EBEDF0'; // 0 submissions
                          if (d.count > 0 && d.count <= 2) color = '#C6E48B';      // Light green
                          else if (d.count > 2 && d.count <= 5) color = '#7BC96F'; // Medium green
                          else if (d.count > 5 && d.count <= 9) color = '#239A3B'; // Solid green
                          else if (d.count > 9) color = '#196127';                 // Dark green

                          const formattedDateStr = d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                          const tooltipText = `${d.count} submission${d.count !== 1 ? 's' : ''} on ${formattedDateStr}`;

                          return (
                            <div
                              key={i}
                              className="w-2.5 h-2.5 rounded-[2px] transition-all duration-150 cursor-crosshair hover:scale-125 hover:shadow-sm"
                              style={{ backgroundColor: color }}
                              onMouseEnter={(e) => {
                                const cardRect = e.currentTarget.closest('.consistency-card').getBoundingClientRect();
                                const rect = e.target.getBoundingClientRect();
                                setHoveredDay({
                                  text: tooltipText,
                                  x: rect.left - cardRect.left + rect.width / 2,
                                  y: rect.top - cardRect.top - 38
                                });
                              }}
                              onMouseLeave={() => setHoveredDay(null)}
                            />
                          );
                        })}
                      </div>
                    </div>
                    {/* Month Label below */}
                    <span className="text-[10px] text-slate-500 font-bold">{month.monthName}</span>
                  </div>
                ))}
              </div>

              {/* Scrollbar styled like in the screenshot */}
              <div className="flex items-center gap-2 pt-2 text-slate-400 justify-center">
                <span className="text-xs cursor-pointer hover:text-slate-600 font-bold select-none">&lsaquo;</span>
                <div className="flex-grow max-w-xs bg-slate-100 h-1 rounded-full relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-full w-2/3 bg-slate-300 rounded-full"></div>
                </div>
                <span className="text-xs cursor-pointer hover:text-slate-600 font-bold select-none">&rsaquo;</span>
              </div>
            </div>

            {/* Custom Tooltip absolute box */}
            {hoveredDay && (
              <div 
                className="absolute bg-[#282828] text-white text-[11px] font-medium px-3 py-1.5 rounded-[4px] shadow-md z-50 pointer-events-none transform -translate-x-1/2 transition-all duration-75 whitespace-nowrap"
                style={{ left: hoveredDay.x, top: hoveredDay.y }}
              >
                {hoveredDay.text}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#282828]"></div>
              </div>
            )}
          </div>

          {/* DSA solved counts and CP ranks side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Problems Solved (Doughnut Charts) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <h4 className="text-sm text-slate-600 font-bold text-center border-b border-slate-100 pb-3">Problems Solved</h4>
              
              {/* DSA Section */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-slate-500 text-center uppercase tracking-wider">DSA</h5>
                <div className="flex items-center justify-center gap-8">
                  
                  {/* Doughnut Chart */}
                  <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[{ name: 'Easy', value: leetcodeStats?.additionalMetrics?.easySolved || 0, color: '#4ade80' }, { name: 'Medium', value: leetcodeStats?.additionalMetrics?.mediumSolved || 0, color: '#facc15' }, { name: 'Hard', value: leetcodeStats?.additionalMetrics?.hardSolved || 0, color: '#f87171' }].filter(d => d.value > 0).length ? [{ name: 'Easy', value: leetcodeStats?.additionalMetrics?.easySolved || 0, color: '#4ade80' }, { name: 'Medium', value: leetcodeStats?.additionalMetrics?.mediumSolved || 0, color: '#facc15' }, { name: 'Hard', value: leetcodeStats?.additionalMetrics?.hardSolved || 0, color: '#f87171' }].filter(d => d.value > 0) : [{ name: 'None', value: 1, color: '#f1f5f9' }]}
                          innerRadius={45}
                          outerRadius={60}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {([{ name: 'Easy', value: leetcodeStats?.additionalMetrics?.easySolved || 0, color: '#4ade80' }, { name: 'Medium', value: leetcodeStats?.additionalMetrics?.mediumSolved || 0, color: '#facc15' }, { name: 'Hard', value: leetcodeStats?.additionalMetrics?.hardSolved || 0, color: '#f87171' }].filter(d => d.value > 0).length ? [{ name: 'Easy', value: leetcodeStats?.additionalMetrics?.easySolved || 0, color: '#4ade80' }, { name: 'Medium', value: leetcodeStats?.additionalMetrics?.mediumSolved || 0, color: '#facc15' }, { name: 'Hard', value: leetcodeStats?.additionalMetrics?.hardSolved || 0, color: '#f87171' }].filter(d => d.value > 0) : [{ name: 'None', value: 1, color: '#f1f5f9' }]).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-black text-slate-900">{leetcodeStats?.solvedCount || 0}</span>
                    </div>
                  </div>

                  {/* Stats Pills */}
                  <div className="flex-1 space-y-2 max-w-[140px]">
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                      <span className="text-xs font-semibold text-emerald-500">Easy</span>
                      <span className="text-xs font-bold text-slate-700">{leetcodeStats?.additionalMetrics?.easySolved || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                      <span className="text-xs font-semibold text-amber-500">Medium</span>
                      <span className="text-xs font-bold text-slate-700">{leetcodeStats?.additionalMetrics?.mediumSolved || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                      <span className="text-xs font-semibold text-rose-500">Hard</span>
                      <span className="text-xs font-bold text-slate-700">{leetcodeStats?.additionalMetrics?.hardSolved || 0}</span>
                    </div>
                  </div>

                </div>
              </div>

              <div className="border-t border-slate-100 w-full"></div>

              {/* CP Section */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-slate-500 text-center uppercase tracking-wider">Competitive Programming</h5>
                <div className="flex items-center justify-center gap-8">
                  
                  {/* Doughnut Chart */}
                  <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={cpSolved > 0 ? [
                            { name: 'Codeforces', value: codeforcesStats?.solvedCount || 0, color: '#facc15' },
                            { name: 'AtCoder', value: atcoderStats?.solvedCount || 0, color: '#222222' },
                            { name: 'CodeChef', value: codechefStats?.solvedCount || 0, color: '#5b4636' }
                          ].filter(d => d.value > 0) : [{ name: 'None', value: 1, color: '#f1f5f9' }]}
                          innerRadius={45}
                          outerRadius={60}
                          dataKey="value"
                          stroke="none"
                        >
                          {(cpSolved > 0 ? [
                            { name: 'Codeforces', value: codeforcesStats?.solvedCount || 0, color: '#facc15' },
                            { name: 'AtCoder', value: atcoderStats?.solvedCount || 0, color: '#222222' },
                            { name: 'CodeChef', value: codechefStats?.solvedCount || 0, color: '#5b4636' }
                          ].filter(d => d.value > 0) : [{ name: 'None', value: 1, color: '#f1f5f9' }]).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-black text-slate-900">{cpSolved}</span>
                    </div>
                  </div>

                  {/* Stats Pills */}
                  <div className="flex-1 max-w-[140px] space-y-2 overflow-y-auto max-h-[80px] pr-1 sidebar-scroll">
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                      <span className="text-xs font-semibold text-amber-500">Codeforces</span>
                      <span className="text-xs font-bold text-slate-700">{codeforcesStats?.solvedCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                      <span className="text-xs font-semibold text-slate-900">AtCoder</span>
                      <span className="text-xs font-bold text-slate-700">{atcoderStats?.solvedCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                      <span className="text-xs font-semibold text-[#5b4636]">CodeChef</span>
                      <span className="text-xs font-bold text-slate-700">{codechefStats?.solvedCount || 0}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Contest Rankings Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
               <h4 className="text-sm text-slate-600 font-bold text-center border-b border-slate-100 pb-3">Contest Rankings</h4>
               
               {/* LeetCode */}
               <div className="space-y-2 text-center pt-2">
                 <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">LeetCode</h5>
                 <div className="flex items-center justify-center gap-6">
                   <div className="w-16 h-16 flex items-center justify-center drop-shadow-sm" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.leetcode.icon }}></div>
                   <div className="text-center">
                     <span className="text-4xl font-black text-slate-900 block">{leetcodeStats?.rating || 0}</span>
                     <span className="text-[10px] text-slate-500 block text-center mt-1">(max : {leetcodeStats?.maxRating || 0})</span>
                   </div>
                 </div>
               </div>

               <div className="border-t border-slate-100 my-6 w-3/4 mx-auto"></div>

               {/* Codeforces */}
               <div className="space-y-2 text-center pb-2">
                 <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Codeforces</h5>
                 <div className="flex items-center justify-center gap-6">
                   <div className="w-16 h-16 flex items-center justify-center drop-shadow-sm" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.codeforces.icon }}></div>
                   <div className="text-center">
                     <span className="text-sm font-bold text-emerald-600 capitalize block mb-0.5">{codeforcesStats?.rank || 'Unrated'}</span>
                     <span className="text-4xl font-black text-slate-900 block">{codeforcesStats?.rating || 0}</span>
                     <span className="text-[10px] text-slate-500 block text-center mt-1">(max : {codeforcesStats?.maxRating || 0})</span>
                   </div>
                 </div>
               </div>

               <div className="border-t border-slate-100 my-6 w-3/4 mx-auto"></div>

               {/* AtCoder */}
               <div className="space-y-2 text-center pb-2">
                 <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">AtCoder</h5>
                 <div className="flex items-center justify-center gap-6">
                   <div className="w-16 h-16 flex items-center justify-center drop-shadow-sm" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.atcoder.icon }}></div>
                   <div className="text-center">
                     <span className="text-sm font-bold text-slate-900 capitalize block mb-0.5">{atcoderStats?.rank || 'Unrated'}</span>
                     <span className="text-4xl font-black text-slate-900 block">{atcoderStats?.rating || 0}</span>
                     <span className="text-[10px] text-slate-500 block text-center mt-1">(max : {atcoderStats?.maxRating || 0})</span>
                   </div>
                 </div>
               </div>

              {/* GitHub */}
              {githubStats && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.github.icon }} />
                    <span>GitHub Stats:</span>
                  </span>
                  <span className="font-semibold">{githubStats.additionalMetrics?.stars || 0} Stars | {githubStats.additionalMetrics?.repos || 0} Repos</span>
                </div>
              )}
            </div>

          </div>

          {/* Individual Rating Progression Charts */}
          {codeforcesStats?.history && codeforcesStats.history.length > 0 && (
            <PlatformRatingChart
              platformName="Codeforces"
              history={codeforcesStats.history}
              currentRating={codeforcesStats?.rating || 0}
              maxRating={codeforcesStats?.maxRating || 0}
              themeColor="#ef4444"
              iconSvg={PLATFORM_CONFIGS.codeforces.icon}
            />
          )}

          {leetcodeStats?.history && leetcodeStats.history.length > 0 && (
            <PlatformRatingChart
              platformName="LeetCode"
              history={leetcodeStats.history}
              currentRating={leetcodeStats?.rating || 0}
              maxRating={leetcodeStats?.maxRating || 0}
              themeColor="#f59e0b"
              iconSvg={PLATFORM_CONFIGS.leetcode.icon}
            />
          )}

          {atcoderStats?.history && atcoderStats.history.length > 0 && (
            <PlatformRatingChart
              platformName="AtCoder"
              history={atcoderStats.history}
              currentRating={atcoderStats?.rating || 0}
              maxRating={atcoderStats?.maxRating || 0}
              themeColor="#222222"
              iconSvg={PLATFORM_CONFIGS.atcoder.icon}
            />
          )}

          {/* Badges / Awards Row and DSA Topic Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Badges and Awards Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100 pb-2">Awards & Badges</h4>
              
              {leetCodeBadges.length > 0 ? (
                <div className="grid grid-cols-4 gap-4 max-h-[160px] overflow-y-auto pr-1 py-1">
                  {leetCodeBadges.map((badge, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center space-y-1">
                      <img 
                        src={badge.icon} 
                        alt={badge.name} 
                        className="w-10 h-10 object-contain hover:scale-110 transition duration-200"
                        title={badge.name}
                      />
                      <span className="text-[8px] text-slate-500 font-semibold truncate w-full max-w-[64px]" title={badge.name}>
                        {badge.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No active badges found.
                </div>
              )}
            </div>

            {/* DSA Topic-wise solved counts Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100 pb-2">DSA Topic Analysis</h4>
              
              {dsaTags.length > 0 ? (
                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 text-xs">
                  {dsaTags.slice(0, showAllDsaTopics ? dsaTags.length : 10).map((tag, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="font-semibold text-slate-500 capitalize w-32 text-right truncate" title={tag.name}>{tag.name}</span>
                      <div className="flex-1 bg-slate-100 h-5 rounded-sm relative overflow-hidden group">
                        <div 
                          className="h-full bg-[#4285F4] rounded-sm transition-all duration-500 ease-out" 
                          style={{ width: `${Math.max((tag.solved / (dsaTags[0]?.solved || 1)) * 100, 2)}%` }}
                        ></div>
                        <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold text-white z-10 drop-shadow-md">
                          {tag.solved}
                        </span>
                      </div>
                    </div>
                  ))}
                  {dsaTags.length > 10 && (
                    <div className="pt-2 text-center pb-2">
                      <button 
                        onClick={() => setShowAllDsaTopics(!showAllDsaTopics)}
                        className="text-[#4285F4] hover:underline text-[11px] font-medium bg-transparent border-none cursor-pointer"
                      >
                        {showAllDsaTopics ? 'show less' : 'show more'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Topic analysis metrics unavailable.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
