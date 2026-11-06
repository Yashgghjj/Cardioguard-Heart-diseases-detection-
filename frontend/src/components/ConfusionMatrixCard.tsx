import React from 'react';

interface ConfusionMatrixCardProps {
  matrix: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
  };
  totalSamples?: number;
}

export const ConfusionMatrixCard: React.FC<ConfusionMatrixCardProps> = ({ matrix, totalSamples = 61 }) => {
  const { tn, fp, fn, tp } = matrix;
  const total = tn + fp + fn + tp || totalSamples;

  const sensitivity = ((tp / (tp + fn)) * 100).toFixed(1);
  const specificity = ((tn / (tn + fp)) * 100).toFixed(1);
  const accuracy = (((tp + tn) / total) * 100).toFixed(1);
  const precision = ((tp / (tp + fp)) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Confusion Matrix (Held-out Test Split)</h3>
          <p className="text-xs text-slate-500">20% stratified holdout sample ({total} evaluated patients)</p>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          Accuracy: {accuracy}%
        </span>
      </div>

      {/* 2x2 Matrix Grid */}
      <div className="grid grid-cols-2 gap-3 my-4">
        {/* True Negatives */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            True Negative (TN)
          </span>
          <span className="text-3xl font-extrabold text-emerald-900 block my-1">{tn}</span>
          <span className="text-[11px] text-emerald-700">
            Correctly classified as Lower Risk ({((tn / total) * 100).toFixed(1)}%)
          </span>
        </div>

        {/* False Positives */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            False Positive (FP - Type I Error)
          </span>
          <span className="text-3xl font-extrabold text-amber-900 block my-1">{fp}</span>
          <span className="text-[11px] text-amber-700">
            Predicted disease, actual healthy ({((fp / total) * 100).toFixed(1)}%)
          </span>
        </div>

        {/* False Negatives */}
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
            False Negative (FN - Type II Error)
          </span>
          <span className="text-3xl font-extrabold text-rose-900 block my-1">{fn}</span>
          <span className="text-[11px] text-rose-700">
            Missed disease detection ({((fn / total) * 100).toFixed(1)}%)
          </span>
        </div>

        {/* True Positives */}
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-center">
          <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
            True Positive (TP)
          </span>
          <span className="text-3xl font-extrabold text-teal-900 block my-1">{tp}</span>
          <span className="text-[11px] text-teal-700">
            Correctly detected Higher Risk ({((tp / total) * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
        <div className="p-2 rounded-lg bg-slate-50">
          <span className="text-slate-400 text-[10px] uppercase block">Sensitivity / Recall</span>
          <span className="font-bold text-slate-800">{sensitivity}%</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-50">
          <span className="text-slate-400 text-[10px] uppercase block">Specificity (TNR)</span>
          <span className="font-bold text-slate-800">{specificity}%</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-50">
          <span className="text-slate-400 text-[10px] uppercase block">Precision (PPV)</span>
          <span className="font-bold text-slate-800">{precision}%</span>
        </div>
      </div>
    </div>
  );
};

