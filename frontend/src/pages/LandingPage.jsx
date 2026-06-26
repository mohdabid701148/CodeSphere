import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="max-w-4xl text-center space-y-8">
        <div className="flex justify-center mb-6">
          <Logo size={96} />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Now in Public Beta (v1.0)
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold font-display tracking-tight text-white leading-tight">
          Showcase Your Coding <br />
          <span className="bg-gradient-to-r from-indigo-400 via-blue-500 to-sky-400 bg-clip-text text-transparent">
            Journey in One Sphere
          </span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-sans leading-relaxed">
          Aggregating your profiles from GitHub, Codeforces, and more into a single dashboard and beautiful, shareable developer portfolio.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 text-center cursor-pointer"
          >
            Get Started Free
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/10 hover:bg-slate-900/30 text-gray-300 font-semibold hover:text-white transition-all duration-300 text-center"
          >
            Star on GitHub
          </a>
        </div>

        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 shadow-2xl p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
              CF
            </div>
            <h3 className="text-white font-semibold text-lg">Codeforces Sync</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Showcase your ranking, rating changes, and contest performance history visually.
            </p>
          </div>
          
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 shadow-2xl p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
              GH
            </div>
            <h3 className="text-white font-semibold text-lg">GitHub Summary</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Consolidate your stars, repository count, and display primary language breakdowns.
            </p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 shadow-2xl p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
              ★
            </div>
            <h3 className="text-white font-semibold text-lg">Public Portfolio</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Create a personalized portfolio URL to share with recruiters or link on your socials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
