import React, { useState } from 'react';
import companyData from '../data/companyKit.json';
import { Briefcase, Search, ExternalLink, X, MapPin } from 'lucide-react';

export default function CompanyKitPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const filteredCompanies = companyData.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="relative mb-12 rounded-3xl overflow-hidden bg-white/60 backdrop-blur-2xl border border-slate-200/60 shadow-xl shadow-indigo-100/40 p-8 sm:p-12">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Briefcase size={200} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-6">
            <MapPin size={16} /> DTU Placement Season
          </div>
          <h1 className="text-4xl sm:text-5xl font-black font-display text-slate-900 tracking-tight mb-4">
            Company Wise <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">Kit</span>
          </h1>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">
            Curated preparation materials, top asked DSA patterns, and problem sets for the top 50 companies visiting Delhi Technological University.
          </p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search companies or topics..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company, index) => (
          <div 
            key={company.id}
            onClick={() => setSelectedCompany(company)}
            className="group cursor-pointer bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 transition-all duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex justify-between items-start mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md"
                style={{ backgroundColor: company.color }}
              >
                {company.name.charAt(0)}
              </div>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                company.difficulty === 'Hard' ? 'bg-red-50 text-red-600 border-red-100' : 
                'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {company.difficulty}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {company.name}
            </h3>
            
            <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[40px]">
              {company.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-auto">
              {company.topics.slice(0, 3).map((topic, i) => (
                <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold uppercase tracking-wider">
                  {topic}
                </span>
              ))}
              {company.topics.length > 3 && (
                <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-semibold uppercase">
                  +{company.topics.length - 3}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-20">
          <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No companies found</h3>
          <p className="text-slate-500">Try adjusting your search terms.</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedCompany(null)}
          ></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="h-32" style={{ backgroundColor: selectedCompany.color, opacity: 0.1 }}></div>
            
            <button 
              onClick={() => setSelectedCompany(null)}
              className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="px-8 pb-8 -mt-12 relative">
              <div 
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg border-4 border-white mb-6"
                style={{ backgroundColor: selectedCompany.color }}
              >
                {selectedCompany.name.charAt(0)}
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedCompany.name}</h2>
              <p className="text-slate-600 mb-6">{selectedCompany.description}</p>
              
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Top Assessed Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCompany.topics.map((topic, i) => (
                    <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-sm font-semibold">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Curated Top Problems ({selectedCompany.problems?.length || 0})</h4>
                <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="flex flex-col gap-3">
                    {selectedCompany.problems?.map((problem, i) => (
                      <a 
                        key={i} 
                        href={`https://leetcode.com/problems/${problem.slug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                              {i + 1}. {problem.title} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{problem.topic}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                          problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {problem.difficulty}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
