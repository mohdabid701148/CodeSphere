import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="max-w-4xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          Now in Public Beta (v1.0)
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold font-display tracking-tight text-white leading-tight">
          Showcase Your Coding <br />
          <span className="bg-gradient-to-r from-purple-400 via-violet-500 to-cyan-400 bg-clip-text text-transparent glow-purple">
            Journey in One Sphere
          </span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-sans leading-relaxed">
          Aggregating your profiles from GitHub, Codeforces, and more into a single dashboard and beautiful, shareable developer portfolio.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/25 text-center cursor-pointer"
          >
            Get Started Free
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-gray-700 hover:border-gray-500 text-gray-300 font-semibold hover:text-white transition-all duration-300 text-center"
          >
            Star on GitHub
          </a>
        </div>

        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              CF
            </div>
            <h3 className="text-white font-semibold text-lg">Codeforces Sync</h3>
            <p className="text-gray-400 text-sm">
              Showcase your ranking, rating changes, and contest performance history visually.
            </p>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
              GH
            </div>
            <h3 className="text-white font-semibold text-lg">GitHub Summary</h3>
            <p className="text-gray-400 text-sm">
              Consolidate your stars, repository count, and display primary language breakdowns.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              ★
            </div>
            <h3 className="text-white font-semibold text-lg">Public Portfolio</h3>
            <p className="text-gray-400 text-sm">
              Create a personalized portfolio URL to share with recruiters or link on your socials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
