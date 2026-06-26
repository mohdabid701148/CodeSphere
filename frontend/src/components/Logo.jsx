import React from 'react';

export default function Logo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <defs>
        {/* Modern Brand Gradient */}
        <linearGradient id="prism-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" /> {/* Prism Indigo */}
          <stop offset="50%" stopColor="#8b5cf6" /> {/* Purple blend */}
          <stop offset="100%" stopColor="#10b981" /> {/* Prism Teal */}
        </linearGradient>

        <linearGradient id="top-face-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#34d399" stopOpacity={0.15} />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="prism-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ambient background glow circle */}
      <circle
        cx="50"
        cy="50"
        r="32"
        fill="url(#prism-grad)"
        opacity="0.08"
      />

      {/* Slow spinning outer dotted orbital ring */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke="url(#prism-grad)"
        strokeWidth="1.5"
        strokeDasharray="5 12"
        opacity="0.4"
        className="origin-center"
      />

      {/* 3D Isometric Cube / Prism */}
      <g className="origin-center" filter="url(#prism-glow)">
        {/* Top Face */}
        <path
          d="M 50 16 L 78 32 L 50 48 L 22 32 Z"
          fill="url(#top-face-grad)"
          stroke="url(#prism-grad)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Left Face */}
        <path
          d="M 22 32 L 50 48 L 50 80 L 22 64 Z"
          fill="rgba(99, 102, 241, 0.1)"
          stroke="url(#prism-grad)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Right Face */}
        <path
          d="M 50 48 L 78 32 L 78 64 L 50 80 Z"
          fill="rgba(16, 185, 129, 0.05)"
          stroke="url(#prism-grad)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Isometric Code Brackets: '<' on Left Face */}
        <path
          d="M 40 53 L 30 59 L 40 65"
          stroke="#f3f4f6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Isometric Code Brackets: '>' on Right Face */}
        <path
          d="M 60 53 L 70 59 L 60 65"
          stroke="url(#prism-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Central Data Spark - Dot in the absolute center */}
        <circle
          cx="50"
          cy="48"
          r="2.5"
          fill="#10b981"
        />
      </g>
    </svg>
  );
}
