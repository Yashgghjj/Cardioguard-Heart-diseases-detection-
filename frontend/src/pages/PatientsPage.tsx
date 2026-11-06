import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Filter,
  UserCheck,
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  HeartPulse,
  Activity,
  AlertCircle
} from 'lucide-react';
import { patientService, PatientListResponse } from '../services/patientService';
import { Patient, Assessment } from '../types';
import { PatientModal } from '../components/PatientModal';
import { PatientDetailModal } from '../components/PatientDetailModal';
import { PredictionReportModal } from '../components/PredictionReportModal';
import { predictionService } from '../services/predictionService';

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Assessment Report Modal from history
  const [viewingAssessment, setViewingAssessment] = useState<Assessment | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await patientService.list({
        search: search || undefined,
        gender: genderFilter || undefined,
        page,
        limit,
      });
      setPatients(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load patients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, search, genderFilter]);

  const handleCreatePatient = async (data: any) => {
    try {
      if (patientToEdit) {
        await patientService.update(patientToEdit.id, data);
      } else {
        await patientService.create(data);
      }
      setIsCreateModalOpen(false);
      setPatientToEdit(null);
      fetchPatients();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save patient');
    }
  };

  const handleDeletePatient = async (id: number, code: string) => {
    if (window.confirm(`Are you sure you want to delete patient record ${code}? All historical assessments linked to this patient will also be removed.`)) {
      try {
        await patientService.delete(id);
        fetchPatients();
      } catch (err) {
        alert('Failed to delete patient');
      }
    }
  };

  const handleViewAssessment = async (assessmentId: number) => {
    try {
      const asm = await predictionService.get(assessmentId);
      setViewingAssessment(asm);
      setIsReportOpen(true);
    } catch (err) {
      alert('Failed to load assessment report');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            Patient Clinical Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Secure de-identified patient cohorts, clinical history, and longitudinal risk monitoring.
          </p>
        </div>

        <button
          onClick={() => {
            setPatientToEdit(null);
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md flex items-center gap-1.5 transition-all w-fit"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Register Patient
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by code or patient name..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <span className="text-xs text-slate-400 font-mono">
            Total: <strong>{total}</strong> patients
          </span>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Patient Code</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Age / Gender</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Assessments</th>
                <th className="px-5 py-3">Latest Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <span className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin inline-block mb-2"></span>
                    <p>Loading patient records...</p>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No patients match your search criteria.
                  </td>
                </tr>
              ) : (
                patients.map((p) => {
                  const risk = p.latest_risk_level;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-teal-700">
                        {p.patient_code}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-800 block">
                          {p.first_name} {p.last_name}
                        </span>
                        {p.medical_notes && (
                          <span className="text-[10px] text-slate-400 line-clamp-1">
                            {p.medical_notes}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 capitalize">
                        {p.age} yrs • {p.gender}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                        <div>{p.contact_email || 'No email'}</div>
                        <div className="text-[10px] text-slate-400">{p.contact_phone || ''}</div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-700">
                        {p.assessment_count || 0} run(s)
                      </td>
                      <td className="px-5 py-3.5">
                        {risk ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              risk === 'higher'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : risk === 'intermediate'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {risk.toUpperCase()} RISK
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No tests</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedPatientId(p.id);
                            setIsDetailModalOpen(true);
                          }}
                          title="View Patient Profile & History"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors inline-block"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setPatientToEdit(p);
                            setIsCreateModalOpen(true);
                          }}
                          title="Edit Patient"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-700 hover:bg-slate-100 transition-colors inline-block"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(p.id, p.patient_code)}
                          title="Delete Patient"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors inline-block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
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

      {/* Add / Edit Patient Modal */}
      <PatientModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setPatientToEdit(null);
        }}
        onSubmit={handleCreatePatient}
        patientToEdit={patientToEdit}
      />

      {/* Patient Profile Detail Modal */}
      <PatientDetailModal
        patientId={selectedPatientId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPatientId(null);
        }}
        onViewAssessment={handleViewAssessment}
      />

      {/* Report Modal */}
      <PredictionReportModal
        assessment={viewingAssessment}
        isOpen={isReportOpen}
        onClose={() => {
          setIsReportOpen(false);
          setViewingAssessment(null);
        }}
      />
    </div>
  );
};

