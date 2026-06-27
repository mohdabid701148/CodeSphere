import React, { useState, useEffect } from 'react';
import { PLATFORM_CONFIGS } from '../config/platforms';

// Utilities for date formatting
const formatTime = (isoString) => {
  return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const formatDateHeader = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-US');
};

const getDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const EventTrackerPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/contests/upcoming');
        if (!res.ok) throw new Error('Failed to fetch contests');
        const data = await res.json();
        setContests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  // Filter contests based on search
  const filteredContests = contests.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group contests by local date string (for the sidebar)
  const groupedContests = filteredContests.reduce((acc, contest) => {
    const d = new Date(contest.startTime);
    const dateStr = d.toDateString();
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(contest);
    return acc;
  }, {});

  // Generate Calendar Grid for current month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = daysInMonth[0].getDay(); // 0 = Sunday
  
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));

  // Build grid blocks
  const calendarBlocks = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarBlocks.push({ isPadding: true, key: `pad-start-${i}` });
  }
  daysInMonth.forEach(day => {
    // Find events for this day
    const dayEvents = filteredContests.filter(c => {
      const cDate = new Date(c.startTime);
      return cDate.toDateString() === day.toDateString();
    });
    calendarBlocks.push({ isPadding: false, date: day, events: dayEvents, key: `day-${day.getDate()}` });
  });

  return (
    <div className="py-8 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center shadow-sm">
          <span className="text-slate-400 mr-2">🔍</span>
          <input 
            type="text" 
            placeholder="Search Contests" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-700 text-sm font-medium placeholder-slate-400"
          />
        </div>
        <div className="w-full md:w-64 bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm text-sm text-slate-600 font-medium">
          <span>All Platforms Selected</span>
          <span>▼</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Sidebar: Upcoming Contests List */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Upcoming Contests</h2>
            <p className="text-sm text-slate-500 font-medium">Don't miss scheduled events</p>
          </div>

          <div className="space-y-6 mt-6 max-h-[800px] overflow-y-auto pr-2 pb-8 sidebar-scroll">
            {loading ? (
              <div className="text-center py-10 text-slate-400 text-sm font-semibold">Loading contests...</div>
            ) : error ? (
              <div className="text-center py-10 text-rose-500 text-sm font-semibold">{error}</div>
            ) : Object.keys(groupedContests).length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm font-semibold">No contests found.</div>
            ) : (
              Object.keys(groupedContests).sort((a,b) => new Date(a) - new Date(b)).map((dateKey) => (
                <div key={dateKey} className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{formatDateHeader(dateKey)}</h3>
                  {groupedContests[dateKey].map((contest) => {
                    const platform = PLATFORM_CONFIGS[contest.platform] || { icon: '' };
                    const endDate = new Date(new Date(contest.startTime).getTime() + contest.durationSeconds * 1000);
                    
                    return (
                      <div key={contest.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-200">
                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          {new Date(contest.startTime).toLocaleDateString('en-GB').replace(/\//g, '-')} {formatTime(contest.startTime)} - {formatTime(endDate.toISOString())}
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-4 h-4 flex items-center justify-center flex-shrink-0" dangerouslySetInnerHTML={{ __html: platform.icon }}></span>
                          <span className="font-semibold text-slate-800 text-sm truncate" title={contest.title}>{contest.title}</span>
                        </div>
                        <a 
                          href={contest.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1 w-fit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                          Add to Calendar
                        </a>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Area: Calendar View */}
        <div className="w-full lg:w-2/3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">&lt;</button>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">&gt;</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-white py-3 text-center text-xs font-bold text-slate-500 uppercase">
                {day}
              </div>
            ))}
            
            {calendarBlocks.map((block, i) => (
              <div key={block.key} className={`bg-white min-h-[120px] p-1.5 border-t border-slate-100 relative ${block.isPadding ? 'bg-slate-50/50' : ''}`}>
                {!block.isPadding && (
                  <>
                    <span className="absolute top-2 right-2 text-xs font-bold text-slate-400">
                      {block.date.getDate()}
                    </span>
                    <div className="mt-6 space-y-1">
                      {block.events.slice(0, 3).map(event => {
                        const platform = PLATFORM_CONFIGS[event.platform] || { icon: '' };
                        return (
                          <a 
                            key={event.id}
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded px-1.5 py-1 text-[10px] font-semibold text-slate-700 truncate cursor-pointer transition-colors"
                            title={event.title}
                          >
                            <span className="inline-block w-3 h-3 align-middle mr-1" dangerouslySetInnerHTML={{ __html: platform.icon }}></span>
                            {event.title}
                          </a>
                        )
                      })}
                      {block.events.length > 3 && (
                        <div className="text-[10px] text-center font-bold text-slate-400 py-0.5">
                          +{block.events.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventTrackerPage;
