import React, { useState, useEffect } from 'react';
import {
  Heart,
  Activity,
  Wind,
  Dumbbell,
  Brain,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  User,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Stethoscope,
  Sparkles,
  Info,
  ChevronDown,
  Layers,
  Play,
  Pause
} from 'lucide-react';
import { Patient, Assessment } from '../types';
import { useNavigate } from 'react-router-dom';
import { Interactive3DAnatomy } from './Interactive3DAnatomy';

interface AnatomicalDashboardProps {
  patients: Patient[];
  recentAssessments: Assessment[];
  doctorName?: string;
  onOpenReport?: (assessment: Assessment) => void;
}

export const AnatomicalDashboard: React.FC<AnatomicalDashboardProps> = ({
  patients,
  recentAssessments,
  doctorName = 'Dr. Alex',
  onOpenReport,
}) => {
  const navigate = useNavigate();

  // Selected Patient for the 3D Hologram Inspection
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [activeOrgan, setActiveOrgan] = useState<'heart' | 'lungs' | 'muscles' | 'mental' | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [layerFilter, setLayerFilter] = useState<'all' | 'cardiac' | 'pulmonary' | 'metabolic'>('all');

  // Set default selected patient
  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const patientAssessment = recentAssessments.find((a) => a.patient_id === currentPatient?.id) || recentAssessments[0];

  // Dynamic calculations based on selected patient's latest risk profile
  const prob = patientAssessment ? patientAssessment.probability : 0.08;
  const isHighRisk = patientAssessment?.risk_level === 'higher' || prob > 0.70;
  const isMidRisk = patientAssessment?.risk_level === 'intermediate' || (prob >= 0.35 && prob <= 0.70);

  // Overall Health Score (0 - 100)
  const healthScore = Math.max(25, Math.round((1 - prob) * 100));
  const healthLabel = healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Moderate' : 'Critical';
  const healthColor = healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#f59e0b' : '#ef4444';

  const heartRate = patientAssessment?.thalach ? Math.round(patientAssessment.thalach * 0.5) : (isHighRisk ? 96 : 72);

  const resetControls = () => {
    setZoomLevel(1);
    setAutoRotate(false);
    setActiveOrgan(null);
    setLayerFilter('all');
  };

  const handleOrganCardClick = (organ: 'heart' | 'lungs' | 'muscles' | 'mental') => {
    if (activeOrgan === organ) {
      setActiveOrgan(null);
      setLayerFilter('all');
    } else {
      setActiveOrgan(organ);
      if (organ === 'heart') setLayerFilter('cardiac');
      else if (organ === 'lungs') setLayerFilter('pulmonary');
      else if (organ === 'muscles') setLayerFilter('all');
      else if (organ === 'mental') setLayerFilter('all');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8 relative">
      {/* 1. Header Greeting Section (Exact Match to User Reference) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Good morning, {doctorName} <span className="inline-block animate-wave origin-bottom-right">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here's an overview of your patients and key health insights.
          </p>
        </div>

        {/* Patient Switcher & Clinical Quick Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedPatientId || ''}
              onChange={(e) => setSelectedPatientId(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs appearance-none cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  👤 {p.patient_code} - {p.first_name} {p.last_name} ({p.age}y, {p.gender})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => navigate('/assessment/new')}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Activity className="w-3.5 h-3.5" />
            Assess Patient
          </button>
        </div>
      </div>

      {/* 2. Main 3D Interactive Animated Body Canvas Container */}
      <div className="relative w-full min-h-[580px] lg:min-h-[640px] bg-gradient-to-b from-slate-50/60 via-white to-slate-50/90 rounded-2xl border border-slate-200/80 flex items-center justify-center overflow-hidden">
        
        {/* Subtle Ambient Tech Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>

        {/* 3D DRAG HINT INSTRUCTION OVERLAY */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <span className="text-[10px] font-semibold text-slate-400 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200/80 shadow-xs flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-teal-600" />
            Interactive 3D WebGL Model • Drag to Rotate 360° • Real-Time Heartbeat Animation
          </span>
        </div>

        {/* LEFT FLOATING ORGAN STATUS CARDS (Matches Image Reference) */}
        <div className="absolute left-4 sm:left-6 top-6 z-20 flex flex-col gap-3 max-w-[130px] sm:max-w-[150px]">
          {/* Card 1: Heart */}
          <div
            onClick={() => handleOrganCardClick('heart')}
            className={`p-3 rounded-2xl bg-white/95 backdrop-blur-md border transition-all cursor-pointer shadow-sm hover:shadow-md ${
              activeOrgan === 'heart'
                ? 'border-rose-400 ring-2 ring-rose-400/20 shadow-rose-500/10 scale-105'
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/90 flex items-center justify-center shadow-inner relative">
                <Heart className={`w-5 h-5 text-rose-500 fill-rose-500 animate-pulse`} />
              </div>
              <span className="text-xs font-bold text-slate-800 mt-1.5">Heart</span>
              <span
                className={`text-[10px] font-semibold mt-0.5 px-2 py-0.5 rounded-full ${
                  isHighRisk
                    ? 'text-rose-700 bg-rose-50 border border-rose-200'
                    : isMidRisk
                    ? 'text-amber-700 bg-amber-50 border border-amber-200'
                    : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                }`}
              >
                {isHighRisk ? 'Elevated' : isMidRisk ? 'Borderline' : 'Normal'}
              </span>
            </div>
          </div>

          {/* Card 2: Lungs */}
          <div
            onClick={() => handleOrganCardClick('lungs')}
            className={`p-3 rounded-2xl bg-white/95 backdrop-blur-md border transition-all cursor-pointer shadow-sm hover:shadow-md ${
              activeOrgan === 'lungs'
                ? 'border-cyan-400 ring-2 ring-cyan-400/20 shadow-cyan-500/10 scale-105'
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100/90 flex items-center justify-center shadow-inner">
                <Wind className="w-5 h-5 text-cyan-500 stroke-[2.2] animate-pulse" />
              </div>
              <span className="text-xs font-bold text-slate-800 mt-1.5">Lungs</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 mt-0.5 px-2 py-0.5 rounded-full">
                Good
              </span>
            </div>
          </div>

          {/* Card 3: Muscles */}
          <div
            onClick={() => handleOrganCardClick('muscles')}
            className={`p-3 rounded-2xl bg-white/95 backdrop-blur-md border transition-all cursor-pointer shadow-sm hover:shadow-md ${
              activeOrgan === 'muscles'
                ? 'border-purple-400 ring-2 ring-purple-400/20 shadow-purple-500/10 scale-105'
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/90 flex items-center justify-center shadow-inner">
                <Dumbbell className="w-5 h-5 text-purple-600 stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold text-slate-800 mt-1.5">Muscles</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 mt-0.5 px-2 py-0.5 rounded-full">
                Strong
              </span>
            </div>
          </div>

          {/* Card 4: Mental */}
          <div
            onClick={() => handleOrganCardClick('mental')}
            className={`p-3 rounded-2xl bg-white/95 backdrop-blur-md border transition-all cursor-pointer shadow-sm hover:shadow-md ${
              activeOrgan === 'mental'
                ? 'border-teal-400 ring-2 ring-teal-400/20 shadow-teal-500/10 scale-105'
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-100/90 flex items-center justify-center shadow-inner">
                <Brain className="w-5 h-5 text-teal-600 stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold text-slate-800 mt-1.5">Mental</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 mt-0.5 px-2 py-0.5 rounded-full">
                Stable
              </span>
            </div>
          </div>
        </div>

        {/* 3. WORKING 3D WEBGL ANATOMICAL BODY SCENE */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Interactive3DAnatomy
            selectedOrgan={activeOrgan}
            onSelectOrgan={setActiveOrgan}
            layer={layerFilter}
            isHighRisk={isHighRisk}
            heartRate={heartRate}
            zoomLevel={zoomLevel}
            autoRotate={autoRotate}
          />
        </div>

        {/* BOTTOM-LEFT FLOATING DARK HEALTH SCORE WIDGET (Matching Image Reference) */}
        <div className="absolute left-4 sm:left-6 bottom-5 z-20 bg-slate-900/95 backdrop-blur-xl border border-slate-800 text-white rounded-2xl p-4 shadow-2xl min-w-[210px]">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-2">
            Overall Health Score
          </span>
          <div className="flex items-center gap-4">
            {/* Radial Circular Progress Gauge */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  stroke="#1e293b"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  stroke="#06b6d4"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray="144"
                  strokeDashoffset={144 - (144 * healthScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-base font-extrabold text-white leading-none">{healthScore}</span>
              </div>
            </div>

            {/* Sparkline & Status */}
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">/100</span>
              <div className="flex items-center gap-1.5 mt-1">
                {/* SVG Live Animated Pulse Wave */}
                <svg width="48" height="18" viewBox="0 0 50 20" fill="none" className="overflow-visible">
                  <path
                    d="M 2 15 Q 12 5, 22 13 T 42 4"
                    fill="none"
                    stroke={healthColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="42" cy="4" r="3" fill={healthColor} className="animate-ping opacity-75" />
                  <circle cx="42" cy="4" r="2.5" fill={healthColor} />
                </svg>
                <span className="text-xs font-bold capitalize" style={{ color: healthColor }}>
                  {healthLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM-RIGHT FLOATING ACTION BAR CONTROLS (Functional & Working) */}
        <div className="absolute right-4 sm:right-6 bottom-5 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-1.5 shadow-md">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? 'Pause 3D Spin' : 'Start 360° Auto-Spin'}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              autoRotate ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
            title="Zoom Out"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-base transition-colors"
          >
            -
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
            title="Zoom In"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-base transition-colors"
          >
            +
          </button>
          <button
            onClick={() => {
              if (layerFilter === 'all') setLayerFilter('cardiac');
              else if (layerFilter === 'cardiac') setLayerFilter('pulmonary');
              else if (layerFilter === 'pulmonary') setLayerFilter('metabolic');
              else setLayerFilter('all');
            }}
            title={`Layer: ${layerFilter.toUpperCase()}`}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              layerFilter !== 'all' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
          </button>
        </div>

        {/* TOP-RIGHT LIVE CLINICAL VITALS OVERLAY */}
        <div className="absolute right-4 sm:right-6 top-6 z-20 hidden md:flex flex-col gap-2.5 max-w-[210px]">
          <div className="p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Live Telemetry</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Online
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Blood Pressure</span>
                <span className="font-bold text-slate-800">{patientAssessment?.trestbps || 128} mm Hg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Cholesterol</span>
                <span className="font-bold text-slate-800">{patientAssessment?.chol || 215} mg/dl</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Active Heart Rate</span>
                <span className="font-bold text-rose-600 font-mono flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500 animate-ping" />
                  {heartRate} bpm
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">ST Depression</span>
                <span className="font-bold text-slate-800">{patientAssessment?.oldpeak || 0.8} mm</span>
              </div>
            </div>

            {patientAssessment && onOpenReport && (
              <button
                onClick={() => onOpenReport(patientAssessment)}
                className="w-full mt-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                Inspect AI Report <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
