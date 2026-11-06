import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface FeatureImportanceItem {
  feature: string;
  label: string;
  importance: number;
  category: string;
}

interface FeatureImportanceChartProps {
  features: FeatureImportanceItem[];
}

export const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({ features }) => {
  // Sort descending and take top 10
  const sorted = [...(features || [])].sort((a, b) => b.importance - a.importance).slice(0, 10);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Global Feature Importance (Attribution Weights)</h3>
          <p className="text-xs text-slate-500">Relative impact contribution across the entire clinical training cohort</p>
        </div>
        <span className="text-xs text-slate-400 font-medium">Top 10 Clinical Variables</span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              domain={[0, 'dataMax + 2']}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
              width={140}
            />
            <Tooltip
              formatter={(val: any) => [`${val}%`, 'Relative Importance']}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            />
            <Bar
              dataKey="importance"
              fill="#0ea5e9"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

