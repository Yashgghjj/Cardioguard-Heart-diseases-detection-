import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  Download,
  Filter,
  Calendar,
  Eye,
  FileSpreadsheet,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { predictionService } from '../services/predictionService';
import { Assessment } from '../types';
import { PredictionReportModal } from '../components/PredictionReportModal';

export const PredictionHistoryPage: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [loading, setLoading] = useState(true);

  // Modal View
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await predictionService.list({
        search: search || undefined,
        risk_level: riskFilter || undefined,
        sort_by: sortBy,
        order,
        page,
        limit,
      });
      setAssessments(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load assessments history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, search, riskFilter, sortBy, order]);

  const handleExportCsv = async () => {
    try {
      await predictionService.exportCsv();
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-teal-600" />
            Prediction & Assessment History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete verifiable archive of all clinical inferences, confidence levels, and downloadable PDF reports.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors w-fit"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Export Complete Dataset (CSV)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search reference (ASM-...) or patient..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700"
          >
            <option value="">All Risk Tiers</option>
            <option value="lower">Lower Risk (&lt; 35%)</option>
            <option value="intermediate">Intermediate Risk (35-70%)</option>
            <option value="higher">Higher Risk (&gt; 70%)</option>
          </select>
          <span className="text-xs text-slate-400 font-mono">
            Total: <strong>{total}</strong> runs
          </span>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 cursor-pointer" onClick={() => handleSort('created_at')}>
                  <span className="flex items-center gap-1">
                    Assessment ID <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="px-5 py-3">Patient Context</th>
                <th className="px-5 py-3 cursor-pointer" onClick={() => handleSort('age')}>
                  <span className="flex items-center gap-1">
                    Age / Sex <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="px-5 py-3 cursor-pointer" onClick={() => handleSort('probability')}>
                  <span className="flex items-center gap-1">
                    Probability <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="px-5 py-3">Classification</th>
                <th className="px-5 py-3">Model</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Report Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <span className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin inline-block mb-2"></span>
                    <p>Loading historical prediction records...</p>
                  </td>
                </tr>
              ) : assessments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    No assessments recorded matching filter criteria.
                  </td>
                </tr>
              ) : (
                assessments.map((a) => {
                  const prob = Math.round(a.probability * 100);
                  const isHigh = a.risk_level === 'higher' || prob > 70;
                  const isMid = a.risk_level === 'intermediate' || (prob >= 35 && prob <= 70);

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-teal-700">
                        {a.assessment_reference}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-800 block">
                          {a.patient_name || 'Anonymous Patient'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {a.patient_code || 'PT-RECORD'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {Math.round(a.age)} yrs • {a.sex === 1 ? 'M' : 'F'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-extrabold text-slate-800">{prob}%</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isHigh
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isMid
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {a.predicted_label || (isHigh ? 'Higher Risk' : isMid ? 'Intermediate' : 'Lower Risk')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                        {a.model_version}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAssessment(a);
                            setIsReportOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors inline-block"
                        >
                          View Report
                        </button>
                        <button
                          onClick={() => predictionService.downloadPdfReport(a.id, a.assessment_reference)}
                          title="Download Official PDF"
                          className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors inline-block"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing Page <strong>{page}</strong> of {Math.max(1, Math.ceil(total / limit))}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total}
              className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal View for Report */}
      <PredictionReportModal
        assessment={selectedAssessment}
        isOpen={isReportOpen}
        onClose={() => {
          setIsReportOpen(false);
          setSelectedAssessment(null);
        }}
      />
    </div>
  );
};

