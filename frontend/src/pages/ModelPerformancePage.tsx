import React, { useEffect, useState } from 'react';
import {
  Cpu,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  Layers,
  Sparkles,
  GitBranch
} from 'lucide-react';
import { modelService } from '../services/modelService';
import { ModelMetadata, ModelComparisonItem } from '../types';
import { ConfusionMatrixCard } from '../components/ConfusionMatrixCard';
import { ROCCurveChart } from '../components/ROCCurveChart';
import { FeatureImportanceChart } from '../components/FeatureImportanceChart';

export const ModelPerformancePage: React.FC = () => {
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    modelService
      .getModelInfo()
      .then((data) => setMetadata(data))
      .catch((err) => console.error('Failed to load model metadata', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !metadata) {
    return (
      <div className="py-24 text-center text-slate-400">
        <span className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin inline-block mb-3"></span>
        <p className="text-xs font-medium">Loading model benchmarking artifacts...</p>
      </div>
    );
  }

  const selectedModel = metadata.selected_model;
  const metrics = metadata.metrics;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-teal-600" />
            Machine Learning Engine & Model Benchmarks
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Empirical evaluation of 5 machine learning architectures trained on the genuine UCI Cleveland Heart Disease dataset.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-4 h-4 text-teal-600" />
            Selected: {selectedModel} ({metadata.model_version})
          </span>
        </div>
      </div>

      {/* Dataset & Training Provenance Card */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Dataset Benchmark</span>
          <span className="font-bold text-slate-800 block mt-0.5">{metadata.dataset_name}</span>
          <span className="text-[10px] text-slate-500">UCI Repository Ref #45</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Cohort Partition</span>
          <span className="font-bold text-slate-800 block mt-0.5">
            {metadata.train_samples} Train / {metadata.test_samples} Test
          </span>
          <span className="text-[10px] text-slate-500">80/20 Stratified Split</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Validation Scheme</span>
          <span className="font-bold text-slate-800 block mt-0.5">5-Fold Stratified CV</span>
          <span className="text-[10px] text-slate-500">Hyperparameter Grid Refit</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Target Definition</span>
          <span className="font-bold text-slate-800 block mt-0.5">&gt; 50% Coronary Stenosis</span>
          <span className="text-[10px] text-slate-500">Angiographic narrow status</span>
        </div>
      </div>

      {/* Algorithm Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Multi-Model Performance Comparison</h3>
            <p className="text-xs text-slate-500">
              Evaluated across Accuracy, Sensitivity, Specificity, F1-Score, and ROC-AUC
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400">Selected by Composite ROC-AUC</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Algorithm</th>
                <th className="px-5 py-3">CV ROC-AUC</th>
                <th className="px-5 py-3">Test Accuracy</th>
                <th className="px-5 py-3">Recall (Sensitivity)</th>
                <th className="px-5 py-3">Specificity</th>
                <th className="px-5 py-3">F1-Score</th>
                <th className="px-5 py-3">Test ROC-AUC</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metadata.model_comparison.map((m, idx) => {
                const isSelected = m.model_name === selectedModel;
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isSelected ? 'bg-teal-50/40 font-semibold text-slate-900' : 'hover:bg-slate-50/60 text-slate-700'
                    }`}
                  >
                    <td className="px-5 py-3.5 flex items-center gap-2">
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />}
                      <span className="font-bold">{m.model_name}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono">{(m.cv_roc_auc_mean * 100).toFixed(1)}%</td>
                    <td className="px-5 py-3.5 font-mono">{(m.test_accuracy * 100).toFixed(1)}%</td>
                    <td className="px-5 py-3.5 font-mono">{(m.test_recall * 100).toFixed(1)}%</td>
                    <td className="px-5 py-3.5 font-mono">{(m.test_specificity * 100).toFixed(1)}%</td>
                    <td className="px-5 py-3.5 font-mono">{(m.test_f1 * 100).toFixed(1)}%</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-teal-700">
                      {(m.test_roc_auc * 100).toFixed(1)}%
                    </td>
                    <td className="px-5 py-3.5">
                      {isSelected ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white shadow-xs">
                          Active Production
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-normal">Candidate</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Confusion Matrix & ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfusionMatrixCard matrix={metrics.confusion_matrix} totalSamples={metadata.test_samples} />
        <ROCCurveChart rocCurve={metrics.roc_curve} auc={metrics.roc_auc} />
      </div>

      {/* Global Feature Importance Chart */}
      <FeatureImportanceChart features={metadata.feature_importance} />

      {/* AI Explainability & Clinical Methodology Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Layers className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-800">
            Explainable AI (XAI) & Methodological Integrity
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Info className="w-4 h-4 text-teal-600" /> Global vs. Local Feature Attribution
            </h4>
            <p>
              In CardioGuard AI, <strong>Global Feature Importance</strong> depicts the relative predictive weight of each clinical variable across the entire cohort (e.g. fluoroscopy vessel counts, ST depression, maximum exercise heart rate).
            </p>
            <p>
              Conversely, <strong>Local Feature Attribution</strong> applies per-patient decomposition (utilizing model coefficients and scaled feature deviations inspired by SHAP game-theoretic Shapley values) to isolate whether a patient’s specific measurement increases or decreases their statistical risk score.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Correlation vs. Medical Causality
            </h4>
            <p>
              Machine learning models identify predictive statistical associations within observational datasets. High feature weight does not imply an isolated causal pathology.
            </p>
            <p>
              For example, asymptomatic chest pain (cp=4) carrying higher statistical risk in the dataset reflects patient referral patterns where asymptomatic presentations with underlying severe coronary obstruction are typically detected later during advanced screening.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

