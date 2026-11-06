import React from 'react';

interface RiskGaugeProps {
  probability: number; // 0.0 to 1.0
  riskLevel: 'lower' | 'intermediate' | 'higher';
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ probability, riskLevel, size = 220 }) => {
  const percentage = Math.round(probability * 100);
  
  // Angle calculations for semi-circle gauge (-90deg to +90deg)
  const angle = -90 + (percentage / 100) * 180;
  
  let color = '#10b981'; // Green
  let label = 'Lower Estimated Model Risk';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (riskLevel === 'higher' || probability > 0.70) {
    color = '#ef4444'; // Red
    label = 'Higher Estimated Model Risk';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (riskLevel === 'intermediate' || probability >= 0.35) {
    color = '#f59e0b'; // Amber
    label = 'Intermediate Estimated Model Risk';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  const radius = 80;
  const strokeWidth = 14;
  const center = 100;
  // Circumference of semi-circle arc
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength * (1 - percentage / 100);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: size, height: size * 0.65 }}>
        <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Colored Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Threshold Tick Marks */}
          {/* 35% mark */}
          <line
            x1="73"
            y1="40"
            x2="78"
            y2="46"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          {/* 70% mark */}
          <line
            x1="127"
            y1="40"
            x2="122"
            y2="46"
            stroke="#94a3b8"
            strokeWidth="2"
          />

          {/* Center Text */}
          <text
            x={center}
            y={88}
            textAnchor="middle"
            className="text-3xl font-extrabold fill-slate-800"
            style={{ fontSize: '28px', fontWeight: 800 }}
          >
            {percentage}%
          </text>
          <text
            x={center}
            y={108}
            textAnchor="middle"
            className="text-xs font-medium fill-slate-500 uppercase tracking-wider"
            style={{ fontSize: '10px' }}
          >
            Model Probability
          </text>
        </svg>
      </div>

      {/* Risk Badge */}
      <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${badgeBg}`}>
        {label}
      </div>

      {/* Threshold Labels Guide */}
      <div className="flex justify-between w-full max-w-[240px] text-[10px] text-slate-400 mt-3 px-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Lower (&lt;35%)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span> Mid (35-70%)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span> High (&gt;70%)
        </span>
      </div>
    </div>
  );
};

