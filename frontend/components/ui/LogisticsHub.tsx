import React from "react";

export interface LogisticsHubSvgProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  text?: string;
  showConnections?: boolean;
  lineMarkerSize?: number;
  animateText?: boolean;
  animateLines?: boolean;
  animateMarkers?: boolean;
}

const LogisticsHub = ({
  className,
  width = "100%",
  height = "100%",
  text = "SUPPLY",
  showConnections = true,
  animateText = true,
  lineMarkerSize = 18,
  animateLines = true,
  animateMarkers = true,
}: LogisticsHubSvgProps) => {
  return (
    <svg
      className={`text-muted ${className || ""}`.trim()}
      width={width}
      height={height}
      viewBox="0 0 200 100"
    >
      {/* Paths */}
      <g
        stroke="currentColor"
        fill="none"
        strokeWidth="0.3"
        strokeDasharray="100 100"
        pathLength="100"
        markerStart="url(#bol-circle-marker)"
      >
        {/* 1st */}
        <path
          strokeDasharray="100 100"
          pathLength="100"
          d="M 10 20 h 79.5 q 5 0 5 5 v 30"
        />
        {/* 2nd */}
        <path
          strokeDasharray="100 100"
          pathLength="100"
          d="M 180 10 h -69.7 q -5 0 -5 5 v 30"
        />
        {/* 3rd */}
        <path d="M 130 20 v 21.8 q 0 5 -5 5 h -10" />
        {/* 4th */}
        <path d="M 170 80 v -21.8 q 0 -5 -5 -5 h -50" />
        {/* 5th */}
        <path
          strokeDasharray="100 100"
          pathLength="100"
          d="M 135 65 h 15 q 5 0 5 5 v 10 q 0 5 -5 5 h -39.8 q -5 0 -5 -5 v -20"
        />
        {/* 6th */}
        <path d="M 94.8 95 v -36" />
        {/* 7th */}
        <path d="M 88 88 v -15 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -5 q 0 -5 5 -5 h 14" />
        {/* 8th */}
        <path d="M 30 30 h 25 q 5 0 5 5 v 6.5 q 0 5 5 5 h 20" />
        {/* Animation For Path Starting */}
        {animateLines && (
          <animate
            attributeName="stroke-dashoffset"
            from="100"
            to="0"
            dur="1s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25,0.1,0.5,1"
            keyTimes="0; 1"
          />
        )}
      </g>

      {/* Nodes matching DHL Palette (Yellow, Red, Warm White) */}
      <g mask="url(#bol-mask-1)">
        <circle className="cpu-architecture cpu-line-1" cx="0" cy="0" r="8" fill="url(#bol-yellow-grad)" />
      </g>
      <g mask="url(#bol-mask-2)">
        <circle className="cpu-architecture cpu-line-2" cx="0" cy="0" r="8" fill="url(#bol-red-grad)" />
      </g>
      <g mask="url(#bol-mask-3)">
        <circle className="cpu-architecture cpu-line-3" cx="0" cy="0" r="8" fill="url(#bol-white-grad)" />
      </g>
      <g mask="url(#bol-mask-4)">
        <circle className="cpu-architecture cpu-line-4" cx="0" cy="0" r="8" fill="url(#bol-yellow-grad)" />
      </g>
      <g mask="url(#bol-mask-5)">
        <circle className="cpu-architecture cpu-line-5" cx="0" cy="0" r="8" fill="url(#bol-red-grad)" />
      </g>
      <g mask="url(#bol-mask-6)">
        <circle className="cpu-architecture cpu-line-6" cx="0" cy="0" r="8" fill="url(#bol-white-grad)" />
      </g>
      <g mask="url(#bol-mask-7)">
        <circle className="cpu-architecture cpu-line-7" cx="0" cy="0" r="8" fill="url(#bol-yellow-grad)" />
      </g>
      <g mask="url(#bol-mask-8)">
        <circle className="cpu-architecture cpu-line-8" cx="0" cy="0" r="8" fill="url(#bol-red-grad)" />
      </g>

      {/* Central Node Box */}
      <g>
        {/* Connections */}
        {showConnections && (
          <g fill="url(#bol-connection-gradient)">
            <rect x="91" y="37" width="2.5" height="5" rx="0.7" />
            <rect x="106" y="37" width="2.5" height="5" rx="0.7" />
            <rect x="118.3" y="44" width="2.5" height="5" rx="0.7" transform="rotate(90 118.25 45.5)" />
            <rect x="124.8" y="44" width="2.5" height="5" rx="0.7" transform="rotate(90 118.25 45.5)" />
            <rect x="106" y="16" width="2.5" height="5" rx="0.7" transform="rotate(180 107.25 39.5)" />
            <rect x="116.5" y="16" width="2.5" height="5" rx="0.7" transform="rotate(180 107.25 39.5)" />
            <rect x="78" y="-13.6" width="2.5" height="5" rx="0.7" transform="rotate(270 113.25 19.5)" />
            <rect x="85" y="-13.6" width="2.5" height="5" rx="0.7" transform="rotate(270 113.25 19.5)" />
          </g>
        )}
        
        {/* Main Central Rectangle */}
        <rect
          x="82"
          y="40"
          width="36"
          height="20"
          rx="2"
          fill="#141414"
          stroke="rgba(255, 204, 0, 0.2)"
          strokeWidth="0.5"
          filter="url(#bol-light-shadow)"
        />
        
        {/* Central Text */}
        <text
          x="100"
          y="52.5"
          fontSize="6"
          fill={animateText ? "url(#bol-text-gradient)" : "white"}
          fontWeight="700"
          letterSpacing="0.08em"
          textAnchor="middle"
        >
          {text}
        </text>
      </g>
      
      {/* Masks & Gradients */}
      <defs>
        <mask id="bol-mask-1"><path d="M 10 20 h 79.5 q 5 0 5 5 v 24" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="bol-mask-2"><path d="M 180 10 h -69.7 q -5 0 -5 5 v 24" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="bol-mask-3"><path d="M 130 20 v 21.8 q 0 5 -5 5 h -10" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="bol-mask-4"><path d="M 170 80 v -21.8 q 0 -5 -5 -5 h -50" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="bol-mask-5"><path d="M 135 65 h 15 q 5 0 5 5 v 10 q 0 5 -5 5 h -39.8 q -5 0 -5 -5 v -20" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="bol-mask-6"><path d="M 94.8 95 v -36" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="bol-mask-7"><path d="M 88 88 v -15 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -5 q 0 -5 5 -5 h 14" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="bol-mask-8"><path d="M 30 30 h 25 q 5 0 5 5 v 6.5 q 0 5 5 5 h 20" strokeWidth="0.5" stroke="white" /></mask>
        
        {/* DHL Palette Gradients */}
        <radialGradient id="bol-yellow-grad" fx="1">
          <stop offset="0%" stopColor="#FFF2A8" />
          <stop offset="50%" stopColor="#FFCC00" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="bol-red-grad" fx="1">
          <stop offset="0%" stopColor="#FF4D56" />
          <stop offset="50%" stopColor="#D40511" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="bol-white-grad" fx="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F5F5F0" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        <filter id="bol-light-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="1.5" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.5" />
        </filter>

        <marker
          id="bol-circle-marker"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth={lineMarkerSize}
          markerHeight={lineMarkerSize}
        >
          <circle cx="5" cy="5" r="2" fill="#0A0A08" stroke="#FFCC00" strokeWidth="0.5">
            {animateMarkers && <animate attributeName="r" values="0; 3; 2" dur="0.5s" />}
          </circle>
        </marker>

        <linearGradient id="bol-connection-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A2A24" />
          <stop offset="60%" stopColor="#141414" />
        </linearGradient>

        <linearGradient id="bol-text-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9A9A8E">
            <animate attributeName="offset" values="-2; -1; 0" dur="5s" repeatCount="indefinite" calcMode="spline" keyTimes="0; 0.5; 1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          </stop>
          <stop offset="25%" stopColor="#FFCC00">
            <animate attributeName="offset" values="-1; 0; 1" dur="5s" repeatCount="indefinite" calcMode="spline" keyTimes="0; 0.5; 1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          </stop>
          <stop offset="50%" stopColor="#9A9A8E">
            <animate attributeName="offset" values="0; 1; 2;" dur="5s" repeatCount="indefinite" calcMode="spline" keyTimes="0; 0.5; 1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          </stop>
        </linearGradient>
      </defs>
    </svg>
  );
};

export { LogisticsHub };
