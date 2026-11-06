import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Heart,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Users,
  Download,
  Plus,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { AnatomicalDashboard } from '../components/AnatomicalDashboard';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { predictionService } from '../services/predictionService';
import { patientService } from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import {
  OverviewMetrics,
  RiskDistributionItem,
  TrendItem,
  AgeGroupItem,
  ChestPainItem,
  Assessment,
  Patient,
} from '../types';
import { PredictionReportModal } from '../components/PredictionReportModal';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [riskDist, setRiskDist] = useState<RiskDistributionItem[]>([]);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroupItem[]>([]);
  const [chestPainData, setChestPainData] = useState<ChestPainItem[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Viewing Report
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [ov, rd, tr, ag, cp, asm, pts] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getRiskDistribution(),
        analyticsService.getTrends(),
        analyticsService.getAgeGroups(),
        analyticsService.getChestPainAnalysis(),
        predictionService.list({ limit: 10, sort_by: 'created_at', order: 'desc' }),
        patientService.list({ limit: 50 })
      ]);
      setOverview(ov);
      setRiskDist(rd);
      setTrends(tr);
      setAgeGroups(ag);
      setChestPainData(cp);
      setRecentAssessments(asm.items);
      setPatients(pts.items);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      await predictionService.exportCsv();
    } catch (e) {
      alert('Failed to export CSV');
    }
  };

  const openReport = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsReportOpen(true);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <span className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin inline-block mb-3"></span>
        <p className="text-xs font-medium">Aggregating live clinical records & metrics...</p>
      </div>
    );
  }

  const doctorGreeting = user?.full_name ? user.full_name.split(' (')[0] : 'Dr. Alex';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. ANATOMICAL 3D HOLOGRAPHIC BODY DASHBOARD (Matching User's Reference) */}
      <AnatomicalDashboard
        patients={patients}
        recentAssessments={recentAssessments}
        doctorName={doctorGreeting}
        onOpenReport={openReport}
      />

      {/* 2. Top Summary KPI Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            Epidemiological & ML Performance Metrics
          </h2>
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Assessments"
            value={overview?.total_assessments || 0}
            subtitle="Processed Records"
            icon={Activity}
            iconColor="text-teal-600"
            iconBg="bg-teal-50"
          />
          <StatCard
            title="Higher Risk Cases"
            value={overview?.higher_risk_count || 0}
            subtitle="Probability > 70%"
            icon={AlertTriangle}
            iconColor="text-rose-600"
            iconBg="bg-rose-50"
          />
          <StatCard
            title="Lower Risk Cases"
            value={overview?.lower_risk_count || 0}
            subtitle="Probability < 35%"
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            title="Mean Probability"
            value={`${overview?.average_confidence || 0}%`}
            subtitle="Cohort Confidence"
            icon={TrendingUp}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <StatCard
            title="Model ROC-AUC"
            value={`${overview?.model_roc_auc || 96.3}%`}
            subtitle="Held-out Test Split"
            icon={ShieldCheck}
            iconColor="text-navy-700"
            iconBg="bg-navy-50"
            trend={{ value: '86.9%', label: 'Accuracy', isPositive: true }}
          />
        </div>
      </div>

      {/* 3. Interactive Charts: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Risk Distribution Profile</h3>
              <p className="text-xs text-slate-500">Patient cohort stratified by model risk tiers</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {riskDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} patients`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Area Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Monthly Assessment Volume & Trajectory</h3>
              <p className="text-xs text-slate-500">Longitudinal distribution of risk outcomes over time</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Live Database Aggregation</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="total" name="Total Ingestions" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="higher_risk" name="Higher Risk" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorHigh)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Interactive Charts: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Group Analysis Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Age Group Risk Stratification</h3>
              <p className="text-xs text-slate-500">Correlation of patient age brackets with predicted risk</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageGroups} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="group" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="lower_risk" name="Lower Risk" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="higher_risk" name="Higher / Mid Risk" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chest Pain Symptom Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Chest Pain Symptom Correlation (cp)</h3>
              <p className="text-xs text-slate-500">Distribution and associated risk rates per angina category</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chestPainData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="%" domain={[0, 100]} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Risk Ratio']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="risk_percentage" name="Elevated Risk %" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Recent Clinical Assessments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Recent Patient Assessments</h3>
            <p className="text-xs text-slate-500">Live feed of diagnostic runs and model classifications</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            View Complete History <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Reference ID</th>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Age / Sex</th>
                <th className="px-5 py-3">Key Vitals</th>
                <th className="px-5 py-3">Probability</th>
                <th className="px-5 py-3">Risk Category</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAssessments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No assessments recorded yet. Run your first assessment above!
                  </td>
                </tr>
              ) : (
                recentAssessments.map((a) => {
                  const prob = Math.round(a.probability * 100);
                  const isHigh = a.risk_level === 'higher' || prob > 70;
                  const isMid = a.risk_level === 'intermediate' || (prob >= 35 && prob <= 70);

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-700">
                        {a.assessment_reference}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-800 block">
                          {a.patient_name || 'Anonymous'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {a.patient_code || 'PT-RECORD'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {Math.round(a.age)} yrs • {a.sex === 1 ? 'M' : 'F'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        BP: {a.trestbps} • Chol: {a.chol}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-extrabold text-slate-800">{prob}%</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isHigh
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isMid
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                        >
                          {a.predicted_label || (isHigh ? 'Higher Risk' : isMid ? 'Intermediate' : 'Lower Risk')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => openReport(a)}
                          className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                        >
                          Report
                        </button>
                        <button
                          onClick={() => predictionService.downloadPdfReport(a.id, a.assessment_reference)}
                          title="Download PDF"
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors inline-block"
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
      </div>

      {/* Modal View for Detailed Prediction Report */}
      <PredictionReportModal
        assessment={selectedAssessment}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};
