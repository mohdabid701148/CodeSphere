import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PlatformRatingChart({ 
  platformName, 
  history, 
  currentRating, 
  maxRating, 
  themeColor,
  iconSvg 
}) {
  if (!history || history.length === 0) return null;

  // Calculate improvement
  const firstRating = history[0]?.value || 0;
  const improvement = currentRating - firstRating;
  
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
    // Default fallback
    return {
      bgLight: 'bg-slate-50',
      textDark: 'text-slate-600',
      borderLight: 'border-slate-100',
      badgeBg: 'bg-slate-500',
    };
  };

  const theme = getThemeClasses(themeColor);
  const chartId = `color-${platformName.toLowerCase()}`;

  // Reverse history if it's currently sorted newest to oldest.
  // Wait, let's assume it is chronologically ordered based on the graph in the screenshot.
  // We'll map the data to ensure Recharts can use it easily.
  const chartData = history.map((item, index) => ({
    ...item,
    matchName: `Match ${index + 1}`
  }));

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
        
        {/* Mock Dropdown */}
        <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 bg-white cursor-pointer hover:bg-slate-50">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          All Time
          <svg className="w-3 h-3 text-slate-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
          <div className={`${theme.bgLight} rounded-xl p-3 min-w-[120px] flex flex-col justify-center`}>
            <div className={`text-[10px] uppercase font-bold ${theme.textDark} mb-1`}>Current Rating</div>
            <div className={`text-2xl font-extrabold ${theme.textDark}`}>{currentRating}</div>
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
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#0f172a' }}
              labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
              formatter={(value) => [`${value}`, 'Rating']}
              labelFormatter={(label, payload) => {
                const desc = payload && payload.length > 0 ? payload[0].payload.description : '';
                return desc ? `${label} - ${desc}` : label;
              }}
            />
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
