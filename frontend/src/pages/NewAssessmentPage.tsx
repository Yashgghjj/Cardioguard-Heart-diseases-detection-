import React, { useState } from 'react';
import { AssessmentForm, AssessmentFormData } from '../components/AssessmentForm';
import { PredictionReportModal } from '../components/PredictionReportModal';
import { predictionService } from '../services/predictionService';
import { Assessment } from '../types';
import { HeartPulse, ShieldAlert, Sparkles } from 'lucide-react';

export const NewAssessmentPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [createdAssessment, setCreatedAssessment] = useState<Assessment | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleSubmit = async (formData: AssessmentFormData) => {
    setIsLoading(true);
    try {
      const res = await predictionService.create(formData);
      setCreatedAssessment(res);
      setIsReportOpen(true);
    } catch (err: any) {
      console.error('Failed to submit assessment', err);
      alert(err.response?.data?.detail || 'Failed to submit clinical assessment. Please verify values.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-teal-600" />
          Conduct Patient Cardiovascular Assessment
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete the 13 clinical diagnostic fields to evaluate estimated statistical risk, generate SHAP feature attributions, and produce a medical report.
        </p>
      </div>

      {/* Main Form Component */}
      <AssessmentForm onSubmit={handleSubmit} isLoading={isLoading} />

      {/* Prediction Result Modal upon Submission */}
      <PredictionReportModal
        assessment={createdAssessment}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};

