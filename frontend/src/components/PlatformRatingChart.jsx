import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PlatformRatingChart({ 
  platformName, 
  history, 
  currentRating, 
  maxRating, 
  themeColor,
  iconSvg 
}) {
  const [filter, setFilter] = useState('All Time');

  if (!history || history.length === 0) return null;

  // Determine available years from history
  const availableYears = Array.from(new Set(
    history
      .map(item => item.timestamp ? new Date(item.timestamp).getFullYear() : null)
      .filter(year => year !== null && !isNaN(year))
  )).sort((a, b) => b - a);

  const hasYears = availableYears.length > 0;

  // We map from the FULL history to preserve accurate deltas and Match numbers, 
  // and THEN we filter for the view.
  const fullChartData = history.map((item, index) => {
    const delta = index > 0 ? item.value - history[index - 1].value : null;
    let matchName = `Match ${index + 1}`;
    if (item.timestamp) {
      const date = new Date(item.timestamp);
      // Format as "Jan 15, 2024"
      matchName = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return {
      ...item,
      matchName,
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
        displayData = fullChartData.filter(item => item.timestamp && new Date(item.timestamp).getFullYear() === year);
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const { delta, description, value } = data;
      
      const isPositiveDelta = delta > 0;
      const isNegativeDelta = delta < 0;
      const deltaColor = isPositiveDelta ? 'text-emerald-500' : isNegativeDelta ? 'text-rose-500' : 'text-slate-500';
      const sign = isPositiveDelta ? '+' : '';

      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-md text-[11px] max-w-xs">
          <div className="text-slate-500 font-bold mb-2 break-words">{label} - {description}</div>
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
            <defs>
              <linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="matchName" 
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
              stroke={themeColor} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#${chartId})`}
              activeDot={{ r: 6, strokeWidth: 0, fill: themeColor }}
              dot={{ r: 3, fill: '#fff', stroke: themeColor, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
