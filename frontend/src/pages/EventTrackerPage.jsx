import React, { useState, useEffect } from 'react';
import { PLATFORM_CONFIGS } from '../config/platforms';
import api from '../utils/api';

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

const generateGoogleCalendarUrl = (contest) => {
  const start = new Date(contest.startTime);
  const end = new Date(start.getTime() + (contest.durationSeconds || 0) * 1000);
  
  const formatDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', contest.title);
  url.searchParams.append('dates', `${formatDate(start)}/${formatDate(end)}`);
  url.searchParams.append('details', `Contest URL: ${contest.url}`);
  url.searchParams.append('location', PLATFORM_CONFIGS[contest.platform]?.title || contest.platform);
  
  return url.toString();
};

const EventTrackerPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(Object.keys(PLATFORM_CONFIGS));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await api.get('/contests/upcoming', { timeout: 30000 });
        setContests(res.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch contests');
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  // Filter contests based on search and selected platforms
  const filteredContests = contests.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    selectedPlatforms.includes(c.platform)
  );

  // Group upcoming contests by local date string (for the sidebar)
  const groupedContests = filteredContests
    .filter(c => new Date(c.startTime).getTime() + (c.durationSeconds * 1000 || 0) > Date.now())
    .reduce((acc, contest) => {
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

  const togglePlatform = (platformKey) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformKey)
        ? prev.filter(p => p !== platformKey)
        : [...prev, platformKey]
    );
  };

  const allPlatformsKeys = Object.keys(PLATFORM_CONFIGS);
  const isAllSelected = selectedPlatforms.length === allPlatformsKeys.length;

  const toggleAllPlatforms = () => {
    if (isAllSelected) {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms(allPlatformsKeys);
    }
  };

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
        <div className="relative w-full md:w-72">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm text-sm text-slate-600 font-medium transition-colors cursor-pointer"
          >
            <span>{isAllSelected ? 'All Platforms Selected' : `${selectedPlatforms.length} Platforms Selected`}</span>
            <span className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 right-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50">
              <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  onChange={toggleAllPlatforms}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-sm font-bold text-slate-800">Select All</span>
              </label>
              <div className="border-t border-slate-100 my-1"></div>
              {allPlatformsKeys.map(key => (
                <label key={key} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedPlatforms.includes(key)}
                    onChange={() => togglePlatform(key)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS[key].icon }}></span>
                    <span className="text-sm font-medium text-slate-700">{PLATFORM_CONFIGS[key].title}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Sidebar: Contests List */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Contest Schedule</h2>
            <p className="text-sm text-slate-500 font-medium">Recent & upcoming events</p>
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
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          {new Date(contest.startTime).toLocaleDateString('en-GB').replace(/\//g, '-')} &nbsp;&bull;&nbsp; {formatTime(contest.startTime)} - {formatTime(endDate.toISOString())}
                        </div>
                        <a 
                          href={contest.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity cursor-pointer w-fit"
                          title="Click to register on platform"
                        >
                          <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: platform.icon }}></span>
                          <span className="font-bold text-slate-800 text-[15px] truncate hover:text-indigo-600 transition-colors">{contest.title}</span>
                        </a>
                        <a 
                          href={generateGoogleCalendarUrl(contest)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1 w-fit bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors">&lt;</button>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors">&gt;</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-white py-3 text-center text-xs font-bold text-slate-500 uppercase">
                {day}
              </div>
            ))}
            
            {calendarBlocks.map((block, i) => {
              if (block.isPadding) {
                return <div key={block.key} className="bg-white min-h-[110px] p-1.5 border-t border-slate-100 bg-slate-50/30"></div>;
              }
              
              const isExpanded = expandedDay === block.key;
              const visibleEvents = isExpanded ? block.events : block.events.slice(0, 3);
              
              return (
              <div key={block.key} className="bg-white min-h-[110px] p-1.5 border-t border-slate-100 relative hover:bg-slate-50/50 transition-colors">
                  <>
                    <div className="flex justify-end mb-1">
                      <span className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${block.date.toDateString() === new Date().toDateString() ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                        {block.date.getDate()}
                      </span>
                    </div>
                    <div className="space-y-1 w-full px-0.5">
                      {visibleEvents.map(event => {
                        const platform = PLATFORM_CONFIGS[event.platform] || { icon: '' };
                        return (
                          <a 
                            key={event.id}
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 w-full bg-slate-50/60 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded px-1.5 py-1 text-[10px] font-semibold text-slate-600 hover:text-indigo-600 cursor-pointer transition-all hover:shadow-sm"
                            title={event.title}
                          >
                            <span 
                              className="flex items-center justify-center w-3 h-3 flex-shrink-0 [&>svg]:w-full [&>svg]:h-full" 
                              dangerouslySetInnerHTML={{ __html: platform.icon }}
                            ></span>
                            <span className="truncate">{event.title}</span>
                          </a>
                        )
                      })}
                      {block.events.length > 3 && !isExpanded && (
                        <div 
                          onClick={(e) => { e.stopPropagation(); setExpandedDay(block.key); }}
                          className="text-[10px] font-bold text-slate-400 text-center py-0.5 cursor-pointer hover:text-indigo-500 transition-colors bg-slate-50 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200" 
                          title={`Show ${block.events.length - 3} more contests`}
                        >
                          +{block.events.length - 3} more
                        </div>
                      )}
                      {isExpanded && block.events.length > 3 && (
                        <div 
                          onClick={(e) => { e.stopPropagation(); setExpandedDay(null); }}
                          className="text-[10px] font-bold text-slate-400 text-center py-0.5 cursor-pointer hover:text-indigo-500 transition-colors bg-slate-50 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200" 
                        >
                          Show less
                        </div>
                      )}
                    </div>
                  </>
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventTrackerPage;
