import React, { useState } from 'react';
import { Assessment } from '../types';
import { RiskGauge } from './RiskGauge';
import {
  X,
  Download,
  Printer,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  User,
  Heart,
  Activity,
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { predictionService } from '../services/predictionService';

interface PredictionReportModalProps {
  assessment: Assessment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PredictionReportModal: React.FC<PredictionReportModalProps> = ({
  assessment,
  isOpen,
  onClose,
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !assessment) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await predictionService.downloadPdfReport(assessment.id, assessment.assessment_reference);
    } catch (err) {
      console.error('Failed to download PDF report', err);
      alert('Could not download PDF report. Please verify connection.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const prob = assessment.probability;
  const risk = assessment.risk_level;

  let headerColor = 'bg-emerald-600';
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (risk === 'higher' || prob > 0.70) {
    headerColor = 'bg-rose-600';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (risk === 'intermediate' || prob >= 0.35) {
    headerColor = 'bg-amber-600';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className={`${headerColor} text-white px-6 py-4 flex items-center justify-between transition-colors`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Clinical Assessment Report</h2>
                <span className="text-xs bg-white/25 px-2 py-0.5 rounded font-mono font-semibold">
                  {assessment.assessment_reference}
                </span>
              </div>
              <p className="text-xs text-white/80">
                CardioGuard AI Diagnostic Inference Engine • Model {assessment.model_version}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Summary Banner: Patient Demographics & Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 rounded-xl p-5 border border-slate-200">
            {/* Patient Meta */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Patient Information
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {assessment.patient_name || 'Anonymous Assessment'}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Code: {assessment.patient_code || 'PT-RECORD'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] uppercase block">Age / Sex</span>
                  <span className="font-semibold text-slate-700">
                    {Math.round(assessment.age)} yrs • {assessment.sex === 1 ? 'Male' : 'Female'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] uppercase block">Date</span>
                  <span className="font-semibold text-slate-700">
                    {new Date(assessment.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200/80 text-xs">
                <span className="text-slate-400 text-[10px] uppercase block">Evaluated By</span>
                <span className="font-semibold text-slate-700">
                  {assessment.assessed_by_name || 'CardioGuard Clinical Staff'}
                </span>
              </div>
            </div>

            {/* Gauge Column */}
            <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-x border-slate-200 px-2 py-1">
              <RiskGauge probability={assessment.probability} riskLevel={assessment.risk_level} size={200} />
            </div>

            {/* Clinical Classification Summary */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Model Output Classification
                </span>
                <div className="mt-2">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
                    {assessment.predicted_label}
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Estimated statistical probability of significant coronary artery disease (&gt;50% arterial diameter narrowing) based on the UCI Cleveland clinical benchmark.
                </p>
              </div>

              <div className="text-[11px] bg-slate-100 p-2.5 rounded-lg text-slate-500 border border-slate-200">
                <span className="font-semibold text-slate-700">Decision Thresholds:</span>
                <div className="grid grid-cols-3 gap-1 mt-1 text-[10px]">
                  <span>Lower: &lt; 35%</span>
                  <span>Mid: 35-70%</span>
                  <span>Higher: &gt; 70%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Features Snapshot (The 13 inputs) */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Observed Clinical Measurements (UCI Cleveland Features)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Resting BP (trestbps)</span>
                <span className="font-bold text-slate-700">{assessment.trestbps} mm Hg</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Cholesterol (chol)</span>
                <span className="font-bold text-slate-700">{assessment.chol} mg/dl</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Max Heart Rate (thalach)</span>
                <span className="font-bold text-slate-700">{assessment.thalach} bpm</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block">ST Depression (oldpeak)</span>
                <span className="font-bold text-slate-700">{assessment.oldpeak} mm</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Chest Pain Type</span>
                <span className="font-bold text-slate-700">
                  {assessment.cp === 1 ? 'Typical Angina' : assessment.cp === 2 ? 'Atypical' : assessment.cp === 3 ? 'Non-anginal' : 'Asymptomatic'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Exercise Angina</span>
                <span className="font-bold text-slate-700">{assessment.exang === 1 ? 'Yes' : 'No'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Fluoroscopy Vessels</span>
                <span className="font-bold text-slate-700">{Math.round(assessment.ca)} vessel(s)</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Thallium Perfusion</span>
                <span className="font-bold text-slate-700">
                  {assessment.thal === 3 ? 'Normal' : assessment.thal === 6 ? 'Fixed Defect' : 'Reversable'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Explainability & Contributing Factors */}
          {assessment.feature_contributions && assessment.feature_contributions.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                AI Explainability: Local Feature Attributions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assessment.feature_contributions.map((c, idx) => {
                  const isRisk = c.direction === 'increases_risk';
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-start gap-3 ${
                        isRisk ? 'bg-rose-50/50 border-rose-200' : 'bg-emerald-50/50 border-emerald-200'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg mt-0.5 ${isRisk ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isRisk ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{c.label}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isRisk ? 'bg-rose-200/80 text-rose-800' : 'bg-emerald-200/80 text-emerald-800'}`}>
                            {isRisk ? '+ Risk Factor' : '- Protective'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{c.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clinical & Lifestyle Recommendations */}
          {assessment.recommendations && assessment.recommendations.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                Personalized Educational & Clinical Guidance
              </h3>
              <div className="space-y-2">
                {assessment.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-0.5 ${
                      rec.priority === 'high' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      rec.priority === 'medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {rec.category}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-800">{rec.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prominent Medical Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Medical Disclaimer:</strong> This AI tool is designed for educational and research decision support. It is not a medical diagnosis or a substitute for professional medical advice. Statistical associations identify correlation patterns in benchmark data and do not establish direct medical causality. Always consult a qualified physician or cardiologist for medical decisions.
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Model: <strong className="text-slate-700">{assessment.model_name}</strong> • Reference: <strong className="text-slate-700">{assessment.assessment_reference}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              {downloading ? 'Generating PDF...' : 'Download Official PDF Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

