import React from 'react';
import { useParams } from 'react-router-dom';

export default function PublicProfilePage() {
  const { slug } = useParams();
  return (
    <div className="p-8 text-center">
      <div className="glass-panel p-8 rounded-3xl max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2">Public Portfolio</h2>
        <p className="text-purple-400 font-mono mb-4">slug: {slug}</p>
        <p className="text-gray-400">This is the public profile view for {slug || 'a developer'}.</p>
      </div>
    </div>
  );
}
