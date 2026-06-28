import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    headline: '',
    college: '',
    avatar: user?.avatar || '',
    bio: '',
    linkedin: '',
    twitter: '',
    website: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image file size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Display name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.patch('/profile', {
        name: form.name.trim(),
        headline: form.headline.trim(),
        college: form.college.trim(),
        avatar: form.avatar.trim(),
        bio: form.bio.trim(),
        socialLinks: {
          linkedin: form.linkedin.trim(),
          twitter: form.twitter.trim(),
          website: form.website.trim(),
        },
        onboardingCompleted: true,
      });

      await refreshUser();
      navigate('/connect');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await api.patch('/profile', { onboardingCompleted: true });
      await refreshUser();
      navigate('/connect');
    } catch (err) {
      setError('Failed to skip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto pt-8 pb-16">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white text-2xl mb-2">
          👋
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome to CodeSphere!</h1>
        <p className="text-slate-500 text-xs max-w-sm mx-auto">
          Tell us a bit about yourself. This info will appear on your public developer portfolio.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        {/* Display Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block">
            Display Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Mohd Abid"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition"
            required
          />
        </div>

        {/* Headline */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block">
            Headline
          </label>
          <input
            type="text"
            name="headline"
            value={form.headline}
            onChange={handleChange}
            placeholder="e.g. Full-Stack Developer | Competitive Programmer"
            maxLength={100}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition"
          />
          <span className="text-[9px] text-slate-400 block text-right">{form.headline.length}/100</span>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block">
            About You
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Share a short bio about yourself, your interests, goals..."
            maxLength={500}
            rows={3}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition resize-none"
          />
          <span className="text-[9px] text-slate-400 block text-right">{form.bio.length}/500</span>
        </div>

        {/* College / Institution */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block">
            College / Institution
          </label>
          <input
            type="text"
            name="college"
            value={form.college}
            onChange={handleChange}
            placeholder="e.g. Delhi Technological University"
            maxLength={150}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition"
          />
        </div>

        {/* Profile Logo Upload */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block">
            Profile Photo
          </label>
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <img
              src={form.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Developer'}
              alt="Avatar Preview"
              className="w-14 h-14 rounded-full border border-slate-200 object-cover bg-white"
            />
            <div className="space-y-1 flex-1">
              <label
                htmlFor="avatar-upload"
                className="inline-block px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer shadow-sm transition"
              >
                Upload Photo
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-[9px] text-slate-400 block leading-tight">
                Recommended: Square image, max 2MB
              </span>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block">
            Social Links
          </label>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm w-6 flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </span>
            <input
              type="url"
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourprofile"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm w-6 flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </span>
            <input
              type="url"
              name="twitter"
              value={form.twitter}
              onChange={handleChange}
              placeholder="https://x.com/yourhandle"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm w-6 flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </span>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading && <div className="w-3.5 h-3.5 rounded-full border-t-2 border-white animate-spin"></div>}
            Save & Continue
          </button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-medium cursor-pointer transition disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
      </form>

      <p className="text-center text-[10px] text-slate-400 mt-4">
        You can always update this later from your dashboard settings.
      </p>
    </div>
  );
}
