import React, { useEffect, useState } from 'react';
import { X, Calendar, User, FileText, Download, Activity, Heart, ArrowUpRight } from 'lucide-react';
import { patientService } from '../services/patientService';
import { Patient, Assessment } from '../types';
import { predictionService } from '../services/predictionService';

interface PatientDetailModalProps {
  patientId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onViewAssessment: (assessmentId: number) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patientId,
  isOpen,
  onClose,
  onViewAssessment,
}) => {
  const [patientData, setPatientData] = useState<(Patient & { assessments: any[] }) | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && patientId) {
      setLoading(true);
      patientService
        .get(patientId)
        .then((data) => setPatientData(data))
        .catch((err) => console.error('Failed to get patient detail', err))
        .finally(() => setLoading(false));
    } else {
      setPatientData(null);
    }
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-800">
              Patient Clinical Profile ({patientData?.patient_code || 'Loading...'})
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading || !patientData ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <span className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin inline-block mb-2"></span>
              <p>Loading patient clinical data...</p>
            </div>
          ) : (
            <>
              {/* Profile Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Full Name</span>
                  <span className="font-bold text-slate-800">{patientData.first_name} {patientData.last_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Age / Gender</span>
                  <span className="font-bold text-slate-800 capitalize">{patientData.age} yrs • {patientData.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Contact Email</span>
                  <span className="font-medium text-slate-700 truncate block">{patientData.contact_email || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Phone</span>
                  <span className="font-medium text-slate-700">{patientData.contact_phone || 'N/A'}</span>
                </div>
                {patientData.medical_notes && (
                  <div className="col-span-2 sm:col-span-4 mt-2 pt-2 border-t border-slate-200 text-slate-600">
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Medical Baseline Notes:</span>
                    <p className="mt-0.5">{patientData.medical_notes}</p>
                  </div>
                )}
              </div>

              {/* Assessment History Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  Chronological Risk Assessments ({patientData.assessments?.length || 0})
                </h4>

                {(!patientData.assessments || patientData.assessments.length === 0) ? (
                  <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-400 text-xs border border-dashed border-slate-200">
                    No risk assessments recorded for this patient yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patientData.assessments.map((a: any) => {
                      const prob = Math.round((a.probability || 0) * 100);
                      const isHigh = a.risk_level === 'higher' || prob > 70;
                      const isMid = a.risk_level === 'intermediate' || (prob >= 35 && prob <= 70);

                      return (
                        <div
                          key={a.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isHigh ? 'bg-rose-100 text-rose-700' : isMid ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {prob}%
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{a.assessment_reference}</p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(a.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              isHigh ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              isMid ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {a.predicted_label || (isHigh ? 'Higher Risk' : isMid ? 'Intermediate' : 'Lower Risk')}
                            </span>
                            <button
                              onClick={() => {
                                onClose();
                                onViewAssessment(a.id);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              View Report <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

