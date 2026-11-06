import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Heart, Activity, Wind, Dumbbell, Brain, Zap, Shield, Sparkles } from 'lucide-react';

interface Interactive3DAnatomyProps {
  selectedOrgan: 'heart' | 'lungs' | 'muscles' | 'mental' | null;
  onSelectOrgan: (organ: 'heart' | 'lungs' | 'muscles' | 'mental' | null) => void;
  layer: 'all' | 'cardiac' | 'pulmonary' | 'metabolic';
  isHighRisk?: boolean;
  heartRate?: number; // bpm
  zoomLevel: number;
  autoRotate: boolean;
}

interface Particle {
  pathIndex: number;
  t: number; // 0 to 1 along path
  speed: number;
  size: number;
  color: string;
  glow: string;
}

export const Interactive3DAnatomy: React.FC<Interactive3DAnatomyProps> = ({
  selectedOrgan,
  onSelectOrgan,
  layer = 'all',
  isHighRisk = false,
  heartRate = 72,
  zoomLevel = 1,
  autoRotate = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 3D Mouse Parallax Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  // Dynamic animation rate based on heart rate
  const beatDuration = useMemo(() => {
    return Math.max(0.5, 60 / (heartRate || 72));
  }, [heartRate]);

  // 1. Mouse Move Parallax Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1; // -1 to 1
    const normY = (y / rect.height) * 2 - 1; // -1 to 1

    // Smooth tilt angles
    setTilt({
      x: -normY * 10, // max 10 deg vertical tilt
      y: normX * 14,  // max 14 deg horizontal tilt
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // 2. Active Arterial Blood Flow Particle Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 500;
      height = canvas.height = canvas.parentElement.clientHeight || 650;
    };
    window.addEventListener('resize', handleResize);

    // Coordinate conversion helper (normalized 0..1 to canvas pixels)
    // Matches exact anatomical landmarks from reference image
    const P = (nx: number, ny: number) => ({
      x: nx * width,
      y: ny * height,
    });

    // Spline curve evaluator
    const getPointOnPath = (points: { x: number; y: number }[], t: number) => {
      if (points.length < 2) return points[0] || { x: 0, y: 0 };
      const segmentCount = points.length - 1;
      const index = Math.min(Math.floor(t * segmentCount), segmentCount - 1);
      const subT = (t * segmentCount) - index;

      const p0 = points[index];
      const p1 = points[index + 1];

      return {
        x: p0.x + (p1.x - p0.x) * subT,
        y: p0.y + (p1.y - p0.y) * subT,
      };
    };

    // Define Cardiovascular Circulation Paths
    // Path 0: Heart -> Left Shoulder -> Left Elbow -> Left Wrist
    // Path 1: Heart -> Aorta -> Left Hip -> Left Knee -> Left Ankle
    // Path 2: Heart -> Aorta -> Right Hip -> Right Knee -> Right Ankle
    // Path 3: Heart -> Carotid -> Cranium / Brain
    const paths = [
      // Left Arm
      [
        { nx: 0.567, ny: 0.240 }, // Heart
        { nx: 0.650, ny: 0.210 }, // Clavicle
        { nx: 0.821, ny: 0.213 }, // Left Shoulder Node
        { nx: 0.880, ny: 0.300 }, // Brachial Artery
        { nx: 0.923, ny: 0.398 }, // Left Elbow Node
        { nx: 0.950, ny: 0.470 }, // Radial Artery
        { nx: 0.980, ny: 0.553 }, // Left Wrist Node
      ],
      // Left Leg
      [
        { nx: 0.567, ny: 0.240 }, // Heart
        { nx: 0.530, ny: 0.350 }, // Abdominal Aorta
        { nx: 0.520, ny: 0.480 }, // Common Iliac Bifurcation
        { nx: 0.620, ny: 0.550 }, // External Iliac
        { nx: 0.726, ny: 0.634 }, // Left Hip / Femoral Node
        { nx: 0.730, ny: 0.720 }, // Femoral Artery
        { nx: 0.738, ny: 0.812 }, // Left Knee / Popliteal Node
        { nx: 0.740, ny: 0.910 }, // Tibial Artery
        { nx: 0.745, ny: 0.965 }, // Left Ankle
      ],
      // Right Leg
      [
        { nx: 0.567, ny: 0.240 }, // Heart
        { nx: 0.520, ny: 0.350 }, // Abdominal Aorta
        { nx: 0.480, ny: 0.480 }, // Right Common Iliac
        { nx: 0.400, ny: 0.550 }, // Right Iliac
        { nx: 0.340, ny: 0.634 }, // Right Hip Node
        { nx: 0.335, ny: 0.720 }, // Right Femoral
        { nx: 0.326, ny: 0.830 }, // Right Knee Node
        { nx: 0.320, ny: 0.910 }, // Right Tibial
        { nx: 0.315, ny: 0.965 }, // Right Ankle
      ],
      // Brain / Carotid
      [
        { nx: 0.567, ny: 0.240 }, // Heart
        { nx: 0.530, ny: 0.170 }, // Carotid
        { nx: 0.510, ny: 0.110 }, // Brain Stem
        { nx: 0.500, ny: 0.050 }, // Cerebral Cortex
      ],
    ];

    // Initialize 80 glowing corpuscle particles
    const particleCount = 80;
    const particles: Particle[] = [];
    const colors = [
      { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.8)' }, // Arterial Red
      { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.8)' }, // Amber
      { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.8)' }, // Cyan Flow
    ];

    for (let i = 0; i < particleCount; i++) {
      const pIdx = Math.floor(Math.random() * paths.length);
      const scheme = colors[i % colors.length];
      particles.push({
        pathIndex: pIdx,
        t: Math.random(),
        speed: 0.003 + Math.random() * 0.005,
        size: 2.2 + Math.random() * 2.5,
        color: scheme.color,
        glow: scheme.glow,
      });
    }

    // Animation Loop
    let lastTime = performance.now();
    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Only draw particles if layer is 'all' or 'cardiac'
      if (layer === 'all' || layer === 'cardiac') {
        // Draw faint glowing vascular lines
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
        paths.forEach((rawPath) => {
          ctx.beginPath();
          const first = P(rawPath[0].nx, rawPath[0].ny);
          ctx.moveTo(first.x, first.y);
          for (let k = 1; k < rawPath.length; k++) {
            const pt = P(rawPath[k].nx, rawPath[k].ny);
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();
        });

        // Update and draw particles
        particles.forEach((p) => {
          // Surge forward during cardiac systole
          const rawPath = paths[p.pathIndex];
          const pixelPoints = rawPath.map((pt) => P(pt.nx, pt.ny));

          p.t += p.speed;
          if (p.t >= 1) {
            p.t = 0;
            p.pathIndex = Math.floor(Math.random() * paths.length);
          }

          const pos = getPointOnPath(pixelPoints, p.t);

          // Draw Glowing Corpuscle
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.glow;
          ctx.shadowBlur = 8;
          ctx.fill();

          // Reset shadow
          ctx.shadowBlur = 0;
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [layer]);

  // Compute Organ-Focus Zoom and Translation
  const getTransformStyle = () => {
    let focusScale = zoomLevel;
    let focusX = 0;
    let focusY = 0;

    if (selectedOrgan === 'heart') {
      focusScale *= 1.35;
      focusX = -8;
      focusY = 12;
    } else if (selectedOrgan === 'lungs') {
      focusScale *= 1.25;
      focusX = 0;
      focusY = 10;
    } else if (selectedOrgan === 'muscles') {
      focusScale *= 1.15;
      focusX = 0;
      focusY = -8;
    } else if (selectedOrgan === 'mental') {
      focusScale *= 1.4;
      focusX = 0;
      focusY = 28;
    }

    const rotX = autoRotate ? 0 : tilt.x;
    const rotY = autoRotate ? 0 : tilt.y;

    return {
      transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${focusScale}) translate(${focusX}%, ${focusY}%)`,
      transition: isHovered && !autoRotate ? 'transform 0.12s cubic-bezier(0.2, 0, 0, 1)' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    };
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full flex items-center justify-center select-none cursor-grab active:cursor-grabbing ${
        autoRotate ? 'animate-auto-sway' : ''
      }`}
      style={{ perspective: 1200 }}
    >
      {/* 3D SCENE PERSPECTIVE WRAPPER */}
      <div
        style={getTransformStyle()}
        className="relative w-[340px] sm:w-[410px] lg:w-[460px] h-[520px] sm:h-[580px] lg:h-[620px] flex items-center justify-center"
      >
        {/* 1. AMBIENT BACKLIGHT GLOW (Holographic Blue/Teal Aura) */}
        <div
          className={`absolute w-72 h-96 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
            isHighRisk
              ? 'bg-gradient-to-t from-rose-500/15 via-rose-400/20 to-transparent'
              : 'bg-gradient-to-t from-teal-400/15 via-sky-400/20 to-transparent'
          }`}
          style={{ top: '15%', left: '20%' }}
        />

        {/* 2. BASE HIGH-DEFINITION ANATOMICAL HUMAN BODY (User's Exact Character) */}
        <img
          src="/body_transparent_clean.png"
          onError={(e) => {
            // Fallback to hq jpg if transparent png fails
            e.currentTarget.src = '/anatomy_body_cropped.png';
          }}
          alt="Holographic Anatomical Human Model"
          className={`relative z-10 w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(2,132,199,0.15)] transition-all duration-500 ${
            layer === 'cardiac'
              ? 'brightness-95 contrast-110'
              : layer === 'pulmonary'
              ? 'brightness-95 hue-rotate-15'
              : ''
          }`}
        />

        {/* 3. WORKING ANIMATED BEATING HEART LAYER (Over Chest: x=56.7%, y=24.0%) */}
        <div
          className={`absolute z-20 pointer-events-auto cursor-pointer transition-all duration-300 ${
            layer === 'pulmonary' ? 'opacity-30' : 'opacity-100'
          }`}
          style={{ left: '56.7%', top: '24.0%', transform: 'translate(-50%, -50%)' }}
          onClick={() => onSelectOrgan(selectedOrgan === 'heart' ? null : 'heart')}
          title="Cardiac Core: Click to inspect telemetry"
        >
          {/* A. Triple Concentric Sonar Pulse Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="w-16 h-16 rounded-full border-2 border-rose-500/80 animate-heart-shockwave absolute"
              style={{ animationDuration: `${beatDuration}s` }}
            />
            <span
              className="w-24 h-24 rounded-full border border-rose-400/50 animate-heart-shockwave absolute"
              style={{ animationDuration: `${beatDuration}s`, animationDelay: `${beatDuration * 0.25}s` }}
            />
          </div>

          {/* B. Anatomical Glowing Heart Graphic (Lub-Dub Contraction Cycle) */}
          <div
            className={`relative flex items-center justify-center animate-heartbeat-cardio ${
              selectedOrgan === 'heart' ? 'scale-125' : ''
            }`}
            style={{ animationDuration: `${beatDuration}s` }}
          >
            {/* SVG Glowing Ventricle Core */}
            <svg width="44" height="48" viewBox="0 0 50 54" fill="none" className="overflow-visible">
              <defs>
                <radialGradient id="heartGradient" cx="45%" cy="40%" r="55%">
                  <stop offset="0%" stopColor="#ff4d4f" />
                  <stop offset="60%" stopColor="#e11d48" />
                  <stop offset="100%" stopColor="#881337" />
                </radialGradient>
                <filter id="cardiacGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Aortic Arch Tubes */}
              <path
                d="M 23 15 C 23 6, 32 4, 34 11 C 35 15, 30 18, 28 22"
                stroke="#fda4af"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 29 11 L 32 4"
                stroke="#fda4af"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Muscular Ventricles */}
              <path
                d="M 25 18 C 17 10, 8 16, 9 26 C 10 38, 23 46, 25 50 C 27 46, 40 38, 41 26 C 42 16, 33 10, 25 18 Z"
                fill="url(#heartGradient)"
                filter="url(#cardiacGlow)"
              />

              {/* Coronary Artery Surface Branches */}
              <path
                d="M 24 20 Q 22 28, 17 34 M 25 25 Q 30 32, 28 42"
                stroke="#ffedd5"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
                opacity="0.85"
              />
            </svg>

            {/* Live BPM Badge */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-rose-950/90 border border-rose-500/80 backdrop-blur-md px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[9px] font-extrabold text-rose-200 font-mono tracking-tight">
                {heartRate} BPM
              </span>
            </div>
          </div>
        </div>

        {/* 4. WORKING RESPIRATORY BREATHING LUNGS LAYER (x=48.5%, y=23.5%) */}
        <div
          className={`absolute z-15 pointer-events-auto cursor-pointer transition-all duration-300 ${
            layer === 'cardiac' ? 'opacity-20' : 'opacity-100'
          }`}
          style={{ left: '48.5%', top: '23.5%', transform: 'translate(-50%, -50%)' }}
          onClick={() => onSelectOrgan(selectedOrgan === 'lungs' ? null : 'lungs')}
          title="Pulmonary Lungs: Click to inspect respiratory telemetry"
        >
          {/* Gentle Sine-Wave Breathing Glow Aura */}
          <div className="relative w-36 h-28 flex items-center justify-between pointer-events-none animate-lungs-breathe">
            {/* Right Lung Glow (Viewer Left) */}
            <div className="w-14 h-24 rounded-[45%_55%_45%_55%] bg-gradient-to-br from-cyan-400/40 via-sky-500/30 to-transparent blur-md transform -rotate-6" />
            {/* Left Lung Glow (Viewer Right) */}
            <div className="w-14 h-24 rounded-[55%_45%_55%_45%] bg-gradient-to-bl from-cyan-400/40 via-sky-500/30 to-transparent blur-md transform rotate-6" />
          </div>
        </div>

        {/* 5. METABOLIC INTESTINE / ABDOMINAL GLOW LAYER (x=51.0%, y=46.5%) */}
        <div
          className={`absolute z-15 pointer-events-auto cursor-pointer transition-all duration-300 ${
            layer === 'cardiac' || layer === 'pulmonary' ? 'opacity-25' : 'opacity-100'
          }`}
          style={{ left: '51.0%', top: '46.5%', transform: 'translate(-50%, -50%)' }}
          onClick={() => onSelectOrgan(selectedOrgan === 'muscles' ? null : 'muscles')}
          title="Metabolic Core"
        >
          {/* Subtle Magenta/Purple Digestive Glow */}
          <div className="w-24 h-20 rounded-full bg-gradient-to-r from-purple-500/25 via-fuchsia-500/25 to-pink-500/20 blur-md animate-pulse" />
        </div>

        {/* 6. HTML5 CANVAS: ACTIVE ARTERIAL BLOOD CIRCULATION PARTICLES */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-20 pointer-events-none w-full h-full"
        />

        {/* 7. DIAGNOSTIC CT LASER SCANLINE */}
        <div className="absolute inset-x-0 z-25 pointer-events-none overflow-hidden h-full">
          <div className="relative w-full h-full">
            <div className="absolute w-full h-6 animate-ct-scanline flex flex-col justify-center">
              {/* Glowing horizontal laser line */}
              <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8]" />
              {/* Telemetry coordinate tag */}
              <div className="flex justify-end pr-6">
                <span className="text-[8px] font-mono font-bold text-cyan-600 bg-cyan-50/90 border border-cyan-200 px-1 rounded shadow-xs">
                  LASER SCAN ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 8. PULSING JOINT NODES & BIO-RETICLES (Exact Coordinates from Reference) */}
        
        {/* Node 1: Left Shoulder (Orange: x=82.1%, y=21.3%) */}
        <div
          className="absolute z-30 cursor-pointer group"
          style={{ left: '82.1%', top: '21.3%', transform: 'translate(-50%, -50%)' }}
          onMouseEnter={() => setActiveNode('shoulder')}
          onMouseLeave={() => setActiveNode(null)}
        >
          <div className="relative flex items-center justify-center">
            <span className="w-6 h-6 rounded-full bg-amber-500/40 animate-ping absolute" />
            <span className="w-4 h-4 rounded-full border-2 border-white bg-amber-500 shadow-md group-hover:scale-125 transition-transform" />
            <span className="w-1.5 h-1.5 rounded-full bg-white absolute" />
          </div>
          {activeNode === 'shoulder' && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[9px] font-semibold px-2 py-0.5 rounded shadow-lg z-40">
              Brachial Node: Normal
            </div>
          )}
        </div>

        {/* Node 2: Left Elbow (Orange: x=92.3%, y=39.8%) */}
        <div
          className="absolute z-30 cursor-pointer group"
          style={{ left: '92.3%', top: '39.8%', transform: 'translate(-50%, -50%)' }}
          onMouseEnter={() => setActiveNode('elbow')}
          onMouseLeave={() => setActiveNode(null)}
        >
          <div className="relative flex items-center justify-center">
            <span className="w-5 h-5 rounded-full bg-amber-500/40 animate-ping absolute" />
            <span className="w-3.5 h-3.5 rounded-full border-2 border-white bg-amber-500 shadow-md group-hover:scale-125 transition-transform" />
          </div>
          {activeNode === 'elbow' && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[9px] font-semibold px-2 py-0.5 rounded shadow-lg z-40">
              Cubital Artery: 100% Flow
            </div>
          )}
        </div>

        {/* Node 3: Left Wrist (Orange: x=98.0%, y=55.3%) */}
        <div
          className="absolute z-30 cursor-pointer group"
          style={{ left: '98.0%', top: '55.3%', transform: 'translate(-50%, -50%)' }}
          onMouseEnter={() => setActiveNode('wrist')}
          onMouseLeave={() => setActiveNode(null)}
        >
          <div className="relative flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-amber-500/40 animate-ping absolute" />
            <span className="w-3 h-3 rounded-full border-2 border-white bg-amber-500 shadow-md group-hover:scale-125 transition-transform" />
          </div>
          {activeNode === 'wrist' && (
            <div className="absolute -top-7 right-0 whitespace-nowrap bg-slate-900 text-white text-[9px] font-semibold px-2 py-0.5 rounded shadow-lg z-40">
              Radial Pulse: Active
            </div>
          )}
        </div>

        {/* Node 4: Left Hip (Orange: x=72.6%, y=63.4%) */}
        <div
          className="absolute z-30 cursor-pointer group"
          style={{ left: '72.6%', top: '63.4%', transform: 'translate(-50%, -50%)' }}
          onMouseEnter={() => setActiveNode('hip_left')}
          onMouseLeave={() => setActiveNode(null)}
        >
          <div className="relative flex items-center justify-center">
            <span className="w-6 h-6 rounded-full bg-amber-500/40 animate-ping absolute" />
            <span className="w-4 h-4 rounded-full border-2 border-white bg-amber-500 shadow-md group-hover:scale-125 transition-transform" />
          </div>
          {activeNode === 'hip_left' && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[9px] font-semibold px-2 py-0.5 rounded shadow-lg z-40">
              Femoral Artery: Stable
            </div>
          )}
        </div>

        {/* Node 5: Left Knee (Orange: x=73.8%, y=81.2%) */}
        <div
          className="absolute z-30 cursor-pointer group"
          style={{ left: '73.8%', top: '81.2%', transform: 'translate(-50%, -50%)' }}
          onMouseEnter={() => setActiveNode('knee_left')}
          onMouseLeave={() => setActiveNode(null)}
        >
          <div className="relative flex items-center justify-center">
            <span className="w-7 h-7 rounded-full bg-amber-500/50 animate-ping absolute" />
            <span className="w-4.5 h-4.5 rounded-full border-2 border-white bg-amber-500 shadow-md group-hover:scale-125 transition-transform" />
            <span className="w-2 h-2 rounded-full bg-white absolute" />
          </div>
          {activeNode === 'knee_left' && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[9px] font-semibold px-2 py-0.5 rounded shadow-lg z-40">
              Patellar Node: Mobility 98%
            </div>
          )}
        </div>

        {/* Node 6: Right Hip (Blue: x=34.0%, y=63.4%) */}
        <div
          className="absolute z-30 cursor-pointer group"
          style={{ left: '34.0%', top: '63.4%', transform: 'translate(-50%, -50%)' }}
          onMouseEnter={() => setActiveNode('hip_right')}
          onMouseLeave={() => setActiveNode(null)}
        >
          <div className="relative flex items-center justify-center">
            <span className="w-5 h-5 rounded-full bg-cyan-400/40 animate-ping absolute" />
            <span className="w-3.5 h-3.5 rounded-full border-2 border-white bg-cyan-500 shadow-md group-hover:scale-125 transition-transform" />
          </div>
          {activeNode === 'hip_right' && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[9px] font-semibold px-2 py-0.5 rounded shadow-lg z-40">
              Right Femoral: Symmetrical
            </div>
          )}
        </div>

        {/* Node 7: Right Knee (Blue: x=32.6%, y=83.0%) */}
        <div
          className="absolute z-30 cursor-pointer group"
          style={{ left: '32.6%', top: '83.0%', transform: 'translate(-50%, -50%)' }}
          onMouseEnter={() => setActiveNode('knee_right')}
          onMouseLeave={() => setActiveNode(null)}
        >
          <div className="relative flex items-center justify-center">
            <span className="w-6 h-6 rounded-full bg-cyan-400/50 animate-ping absolute" />
            <span className="w-4 h-4 rounded-full border-2 border-white bg-cyan-500 shadow-md group-hover:scale-125 transition-transform" />
            <span className="w-1.5 h-1.5 rounded-full bg-white absolute" />
          </div>
          {activeNode === 'knee_right' && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[9px] font-semibold px-2 py-0.5 rounded shadow-lg z-40">
              Right Patella: Healthy
            </div>
          )}
        </div>

        {/* 9. CONNECTING RETICLE GUIDELINES (Connecting to Left Cards) */}
        <div className="absolute inset-0 pointer-events-none z-25 overflow-visible">
          {/* Heart Guideline */}
          <div
            className={`absolute flex items-center transition-opacity duration-300 ${
              selectedOrgan === 'heart' ? 'opacity-100 scale-105' : 'opacity-70'
            }`}
            style={{ left: '16%', top: '24%' }}
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-500 bg-white flex items-center justify-center shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </div>
            <div className="w-12 sm:w-20 h-[1.5px] bg-gradient-to-r from-rose-400 to-transparent" />
          </div>

          {/* Lungs Guideline */}
          <div
            className={`absolute flex items-center transition-opacity duration-300 ${
              selectedOrgan === 'lungs' ? 'opacity-100 scale-105' : 'opacity-70'
            }`}
            style={{ left: '16%', top: '35%' }}
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-500 bg-white flex items-center justify-center shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            </div>
            <div className="w-12 sm:w-20 h-[1.5px] bg-gradient-to-r from-cyan-400 to-transparent" />
          </div>

          {/* Muscles Guideline */}
          <div
            className={`absolute flex items-center transition-opacity duration-300 ${
              selectedOrgan === 'muscles' ? 'opacity-100 scale-105' : 'opacity-70'
            }`}
            style={{ left: '16%', top: '55%' }}
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 border-purple-500 bg-white flex items-center justify-center shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            </div>
            <div className="w-12 sm:w-20 h-[1.5px] bg-gradient-to-r from-purple-400 to-transparent" />
          </div>

          {/* Knee / Extremities Guideline */}
          <div
            className="absolute flex items-center opacity-70"
            style={{ left: '16%', top: '75%' }}
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 bg-white flex items-center justify-center shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </div>
            <div className="w-12 sm:w-20 h-[1.5px] bg-gradient-to-r from-amber-400 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
};
