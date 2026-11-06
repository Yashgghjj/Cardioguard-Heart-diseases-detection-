import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Heart,
  ShieldCheck,
  Cpu,
  BarChart2,
  FileCheck2,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Microscope,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-md shadow-teal-500/20">
              <Activity className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">CardioGuard</span>
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">AI</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-xs font-bold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              Launch Platform <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Genuine UCI Cleveland Clinical Benchmark • 96.3% ROC-AUC
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Advanced Heart Disease Detection & <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-navy-700">Risk Assessment Platform</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            CardioGuard AI equips clinicians, cardiologists, and healthcare researchers with high-precision machine learning risk stratification, explainable feature attributions, and automated patient assessment reports.
          </p>

          {/* Call to action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-navy-900/10 hover:shadow-xl transition-all"
            >
              Enter Clinical Workspace <ArrowRight className="w-4 h-4 text-teal-400" />
            </button>
            <button
              onClick={() => navigate('/assessment/new')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Heart className="w-4 h-4 text-teal-600" /> Run New Assessment
            </button>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-200 max-w-4xl mx-auto text-left">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
              <span className="text-2xl font-black text-slate-900">86.9%</span>
              <p className="text-xs text-slate-500 mt-0.5">Test Classification Accuracy</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
              <span className="text-2xl font-black text-teal-600">0.963</span>
              <p className="text-xs text-slate-500 mt-0.5">ROC-AUC Discrimination</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
              <span className="text-2xl font-black text-slate-900">13 Features</span>
              <p className="text-xs text-slate-500 mt-0.5">Standardized UCI Parameters</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
              <span className="text-2xl font-black text-emerald-600">5 Models</span>
              <p className="text-xs text-slate-500 mt-0.5">Cross-Validated & Tuned</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-teal-600 tracking-wider uppercase">Clinical Workflow</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              End-to-End Diagnostic Decision Support
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Structured clinical parameter ingestion with instant model probability inference and audit tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h4 className="text-base font-bold text-slate-800">13-Feature Patient Ingestion</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless multi-step entry of resting hemodynamics, treadmill stress kinetics, electrocardiography, and fluoroscopic markers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-navy-100 text-navy-800 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h4 className="text-base font-bold text-slate-800">Multi-Algorithm Inference</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Trained and hyperparameter-tuned pipeline cross-validated across Logistic Regression, Random Forest, SVM, and XGBoost.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h4 className="text-base font-bold text-slate-800">Explainable PDF Clinical Reports</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Local feature attribution explanations, stratified risk tiers (Lower, Mid, Higher), and instant downloadable ReportLab PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Medical Disclaimer Banner */}
      <section className="py-8 bg-amber-50/70 border-b border-amber-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-start gap-4 text-xs text-amber-900 leading-relaxed">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-950 block text-sm mb-1">Healthcare Research & Educational Disclaimer</strong>
            "This AI tool is designed for educational and research purposes. It is not a medical diagnosis or a substitute for professional medical advice. Consult a qualified healthcare professional for medical decisions. Predictive associations in statistical benchmarks do not establish definitive medical causality."
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-900 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-white">CardioGuard AI</span>
            <span>• Full-Stack Healthcare Platform</span>
          </div>
          <p>© 2026 CardioGuard AI. All rights reserved. UCI Heart Disease Benchmark.</p>
        </div>
      </footer>
    </div>
  );
};

