import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

export default function PlatformRatingChart({ 
  platformName, 
  history, 
  currentRating, 
  maxRating, 
  themeColor,
  iconSvg 
}) {
  const [filter, setFilter] = useState('All Time');

  const renderRatingBands = () => {
    const isCodeforces = platformName.toLowerCase() === 'codeforces';
    const isAtCoder = platformName.toLowerCase() === 'atcoder';

    if (isCodeforces) {
      return (
        <>
          <ReferenceArea y1={0} y2={1200} fill="#cccccc" fillOpacity={0.35} />
          <ReferenceArea y1={1200} y2={1400} fill="#77ff77" fillOpacity={0.35} />
          <ReferenceArea y1={1400} y2={1600} fill="#77ddbb" fillOpacity={0.35} />
          <ReferenceArea y1={1600} y2={1900} fill="#aaaaff" fillOpacity={0.35} />
          <ReferenceArea y1={1900} y2={2100} fill="#ff88ff" fillOpacity={0.35} />
          <ReferenceArea y1={2100} y2={2400} fill="#ffcc88" fillOpacity={0.35} />
          <ReferenceArea y1={2400} y2={4000} fill="#ff8888" fillOpacity={0.35} />
        </>
      );
    }
    if (isAtCoder) {
      return (
        <>
          <ReferenceArea y1={0} y2={400} fill="#cccccc" fillOpacity={0.35} />
          <ReferenceArea y1={400} y2={800} fill="#c6b095" fillOpacity={0.35} />
          <ReferenceArea y1={800} y2={1200} fill="#77ff77" fillOpacity={0.35} />
          <ReferenceArea y1={1200} y2={1600} fill="#77dddd" fillOpacity={0.35} />
          <ReferenceArea y1={1600} y2={2000} fill="#aaaaff" fillOpacity={0.35} />
          <ReferenceArea y1={2000} y2={2400} fill="#ffff77" fillOpacity={0.35} />
          <ReferenceArea y1={2400} y2={2800} fill="#ffcc88" fillOpacity={0.35} />
          <ReferenceArea y1={2800} y2={5000} fill="#ff8888" fillOpacity={0.35} />
        </>
      );
    }
    return null;
  };

  if (!history || history.length === 0) return null;

  // Pre-sort history by timestamp to ensure chronological order
  const sortedHistory = [...history].sort((a, b) => {
    const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tA - tB;
  });

  // Determine available years from history
  const availableYears = Array.from(new Set(
    sortedHistory
      .map(item => item.timestamp ? new Date(item.timestamp).getFullYear() : null)
      .filter(year => year !== null && !isNaN(year))
  )).sort((a, b) => b - a);

  const hasYears = availableYears.length > 0;

  // We map from the FULL history to preserve accurate deltas and Match numbers, 
  // and THEN we filter for the view.
  const fullChartData = sortedHistory.map((item, index) => {
    const delta = index > 0 ? item.value - sortedHistory[index - 1].value : null;
    
    let timestampVal;
    if (item.timestamp) {
      timestampVal = new Date(item.timestamp).getTime();
    } else {
      // Fallback: space out matches by 7 days backwards from today or from the next item
      timestampVal = Date.now() - (sortedHistory.length - index) * 7 * 24 * 60 * 60 * 1000;
    }

    const dateObj = new Date(timestampVal);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });

    return {
      ...item,
      timestampVal,
      formattedDate,
      delta
    };
  });

  let displayData = fullChartData;
  if (filter !== 'All Time') {
    if (filter.startsWith('Last')) {
      const num = parseInt(filter.replace('Last ', ''));
      if (!isNaN(num)) displayData = fullChartData.slice(-num);
    } else {
      const year = parseInt(filter);
      if (!isNaN(year)) {
        displayData = fullChartData.filter(item => {
          return new Date(item.timestampVal).getFullYear() === year;
        });
      }
    }
  }

  // Calculate improvement based on the currently filtered window
  const firstFilteredRating = displayData.length > 0 ? displayData[0].value : 0;
  const lastFilteredRating = displayData.length > 0 ? displayData[displayData.length - 1].value : currentRating;
  const improvement = lastFilteredRating - firstFilteredRating;
  const isPositive = improvement >= 0;
  
  const getThemeClasses = (color) => {
    if (color === '#ef4444') { // Codeforces Red
      return {
        bgLight: 'bg-red-50',
        textDark: 'text-red-600',
        borderLight: 'border-red-100',
        badgeBg: 'bg-red-500',
      };
    } else if (color === '#f59e0b') { // LeetCode Yellow
      return {
        bgLight: 'bg-amber-50',
        textDark: 'text-amber-600',
        borderLight: 'border-amber-100',
        badgeBg: 'bg-amber-500',
      };
    }
    return {
      bgLight: 'bg-slate-50',
      textDark: 'text-slate-600',
      borderLight: 'border-slate-100',
      badgeBg: 'bg-slate-500',
    };
  };

  const theme = getThemeClasses(themeColor);
  const chartId = `color-${platformName.toLowerCase()}`;

  let strokeColor = themeColor;
  if (platformName.toLowerCase() === 'codeforces') {
    strokeColor = '#ffd800'; // Codeforces Yellow line
  } else if (platformName.toLowerCase() === 'leetcode') {
    strokeColor = '#ffa116'; // LeetCode Gold line
  } else if (platformName.toLowerCase() === 'atcoder') {
    strokeColor = '#222222'; // AtCoder dark line
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const { delta, description, value, formattedDate } = data;
      
      const isPositiveDelta = delta > 0;
      const isNegativeDelta = delta < 0;
      const deltaColor = isPositiveDelta ? 'text-emerald-500' : isNegativeDelta ? 'text-rose-500' : 'text-slate-500';
      const sign = isPositiveDelta ? '+' : '';

      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-md text-[11px] max-w-xs text-slate-800">
          <div className="text-slate-500 font-bold mb-1 break-words">{description}</div>
          <div className="text-slate-400 mb-2">{formattedDate}</div>
          <div className="flex items-center gap-2">
            <span className="text-slate-900 font-semibold">Rating: {value}</span>
            {delta !== null && (
               <span className={`font-bold ${deltaColor}`}>({sign}{delta})</span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 w-full">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${theme.badgeBg} flex items-center justify-center text-white shrink-0`} dangerouslySetInnerHTML={{ __html: iconSvg }} />
          <div>
            <h3 className="text-base font-bold text-slate-800">{platformName} Rating Progression</h3>
            <p className="text-xs text-slate-500">Your {platformName} rating over time</p>
          </div>
        </div>
        
        {/* Functional Dropdown */}
        <div className="relative">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none pl-8 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 bg-white cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All Time">All Time</option>
            {hasYears ? (
              availableYears.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))
            ) : (
              <>
                <option value="Last 50">Last 50 Matches</option>
                <option value="Last 20">Last 20 Matches</option>
                <option value="Last 10">Last 10 Matches</option>
              </>
            )}
          </select>
          <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <svg className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
          <div className={`${theme.bgLight} rounded-xl p-3 min-w-[120px] flex flex-col justify-center`}>
            <div className={`text-[10px] uppercase font-bold ${theme.textDark} mb-1`}>Current Rating</div>
            <div className={`text-2xl font-extrabold ${theme.textDark}`}>{lastFilteredRating}</div>
          </div>
          <div className={`${theme.bgLight} rounded-xl p-3 min-w-[120px] flex flex-col justify-center`}>
            <div className={`text-[10px] uppercase font-bold ${theme.textDark} mb-1`}>Max Rating</div>
            <div className={`text-2xl font-extrabold ${theme.textDark}`}>{maxRating}</div>
          </div>
        </div>

        <div className={`flex flex-col items-end justify-center px-4 py-2 rounded-xl h-[60px] ${isPositive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          <div className={`text-xs font-bold flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isPositive ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"} />
            </svg>
            {isPositive ? '+' : ''}{improvement}
          </div>
          <div className={`text-[10px] mt-0.5 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            Improvement
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mt-4 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {renderRatingBands()}
            <defs>
              <linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="timestampVal" 
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(tick) => {
                const dateObj = new Date(tick);
                return dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
              }}
              stroke="#94a3b8" 
              style={{ fontSize: '10px' }} 
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              domain={['dataMin - 100', 'dataMax + 100']} 
              style={{ fontSize: '10px' }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={strokeColor} 
              strokeWidth={2}
              fillOpacity={platformName.toLowerCase() === 'leetcode' ? 1 : 0} 
              fill={`url(#${chartId})`}
              activeDot={{ r: 6, strokeWidth: 0, fill: strokeColor }}
              dot={{ r: 3, fill: '#fff', stroke: strokeColor, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
