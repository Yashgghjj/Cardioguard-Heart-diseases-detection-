import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Activity,
  Heart,
  Stethoscope,
  Microscope,
  Info
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { Patient } from '../types';

const assessmentSchema = z.object({
  patient_id: z.number().optional(),
  patient_name: z.string().optional(),
  age: z.number().min(18, 'Age must be between 18 and 110').max(110),
  sex: z.number().min(0).max(1),
  cp: z.number().min(1).max(4),
  trestbps: z.number().min(70, 'Resting BP must be 70 - 240 mm Hg').max(240),
  chol: z.number().min(100, 'Cholesterol must be 100 - 600 mg/dl').max(600),
  fbs: z.number().min(0).max(1),
  restecg: z.number().min(0).max(2),
  thalach: z.number().min(50, 'Max heart rate must be 50 - 230 bpm').max(230),
  exang: z.number().min(0).max(1),
  oldpeak: z.number().min(0.0, 'ST depression 0.0 - 8.0 mm').max(8.0),
  slope: z.number().min(1).max(3),
  ca: z.number().min(0).max(3),
  thal: z.number(),
  clinical_notes: z.string().optional(),
});

export type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface AssessmentFormProps {
  onSubmit: (data: AssessmentFormData) => Promise<void>;
  isLoading?: boolean;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ onSubmit, isLoading = false }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [patients, setPatients] = useState<Patient[]>([]);

  const defaultValues: AssessmentFormData = {
    age: 55,
    sex: 1,
    cp: 2,
    trestbps: 130,
    chol: 220,
    fbs: 0,
    restecg: 0,
    thalach: 150,
    exang: 0,
    oldpeak: 1.0,
    slope: 2,
    ca: 0,
    thal: 3,
    patient_name: 'Walk-in Patient',
    clinical_notes: ''
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues
  });

  const selectedPatientId = watch('patient_id');

  useEffect(() => {
    patientService.list({ limit: 50 }).then((res) => {
      setPatients(res.items);
    }).catch((err) => console.error('Failed to load patients for selector', err));
  }, []);

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value ? Number(e.target.value) : undefined;
    setValue('patient_id', pId);
    if (pId) {
      const p = patients.find((item) => item.id === pId);
      if (p) {
        setValue('patient_name', `${p.first_name} ${p.last_name}`);
        setValue('age', p.age);
        setValue('sex', p.gender === 'male' ? 1 : 0);
      }
    }
  };

  const applyPreset = (type: 'high' | 'normal' | 'intermediate') => {
    if (type === 'high') {
      reset({
        ...defaultValues,
        patient_name: 'Sample Case: Higher Risk Profile',
        age: 64,
        sex: 1,
        cp: 4,
        trestbps: 165,
        chol: 295,
        fbs: 1,
        restecg: 2,
        thalach: 110,
        exang: 1,
        oldpeak: 2.8,
        slope: 2,
        ca: 2,
        thal: 7,
        clinical_notes: 'Patient reports exertional angina and family history of myocardial infarction.'
      });
    } else if (type === 'normal') {
      reset({
        ...defaultValues,
        patient_name: 'Sample Case: Healthy Baseline',
        age: 42,
        sex: 0,
        cp: 2,
        trestbps: 116,
        chol: 178,
        fbs: 0,
        restecg: 0,
        thalach: 175,
        exang: 0,
        oldpeak: 0.0,
        slope: 1,
        ca: 0,
        thal: 3,
        clinical_notes: 'Routine executive physical exam with high exercise tolerance.'
      });
    } else {
      reset({
        ...defaultValues,
        patient_name: 'Sample Case: Intermediate Profile',
        age: 57,
        sex: 1,
        cp: 3,
        trestbps: 138,
        chol: 242,
        fbs: 0,
        restecg: 1,
        thalach: 142,
        exang: 0,
        oldpeak: 1.2,
        slope: 2,
        ca: 1,
        thal: 3,
        clinical_notes: 'Moderate cardiovascular risk profile undergoing outpatient monitoring.'
      });
    }
  };

  const steps = [
    { id: 1, name: 'Demographics', desc: 'Age, Sex & Patient Context' },
    { id: 2, name: 'Vitals & Blood', desc: 'BP, Lipids, Glucose, ECG' },
    { id: 3, name: 'Cardiac Stress', desc: 'Exercise Heart Rate & ST Segments' },
    { id: 4, name: 'Scans & Review', desc: 'Fluoroscopy, Thallium & Submit' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Form Header with Presets */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-teal-600 fill-teal-100" />
              Patient Assessment Ingestion Form
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Input 13 standardized clinical features aligned with the UCI Cleveland Heart Disease benchmark.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Presets:
            </span>
            <button
              type="button"
              onClick={() => applyPreset('normal')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              Normal Baseline
            </button>
            <button
              type="button"
              onClick={() => applyPreset('intermediate')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              Intermediate
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              Higher Risk
            </button>
          </div>
        </div>

        {/* Multi-step progress bar */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          {steps.map((s) => {
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(s.id)}
                className={`text-left p-2.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-white border-teal-500 shadow-sm ring-1 ring-teal-500/20'
                    : isCompleted
                    ? 'bg-slate-100/80 border-slate-200 text-slate-600'
                    : 'bg-transparent border-transparent text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? 'bg-teal-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.id}
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-slate-800' : 'text-slate-600'}`}>
                      {s.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{s.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {/* STEP 1: Demographics */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Step 1: Patient Context & Demographics</h3>
              <p className="text-xs text-slate-500">Select an existing registered patient or enter anonymous details.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Link Existing Patient Record (Optional)
                </label>
                <select
                  value={selectedPatientId || ''}
                  onChange={handlePatientSelect}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="">-- Or enter new/walk-in patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.patient_code} - {p.first_name} {p.last_name} ({p.age}y, {p.gender})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Patient Name or Clinical Reference
                </label>
                <input
                  type="text"
                  {...register('patient_name')}
                  placeholder="e.g. John Doe or PT-2026-X"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Age in Years (18 - 110)</label>
                  <span className="text-[10px] text-slate-400">Continuous feature</span>
                </div>
                <input
                  type="number"
                  {...register('age', { valueAsNumber: true })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                {errors.age && <p className="text-[11px] text-rose-500 mt-1">{errors.age.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Biological Sex
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                    <input
                      type="radio"
                      value={1}
                      {...register('sex', { valueAsNumber: true })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>Male (1)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                    <input
                      type="radio"
                      value={0}
                      {...register('sex', { valueAsNumber: true })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>Female (0)</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    Chest Pain Type (cp)
                    <span title="1: Typical Angina, 2: Atypical Angina, 3: Non-anginal pain, 4: Asymptomatic">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                    </span>
                  </label>
                </div>
                <select
                  {...register('cp', { valueAsNumber: true })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value={1}>Value 1: Typical Angina (Substernal chest pressure triggered by physical exertion)</option>
                  <option value={2}>Value 2: Atypical Angina (Chest discomfort with atypical triggers or duration)</option>
                  <option value={3}>Value 3: Non-anginal Chest Pain (Sharp, musculoskeletal or pleuritic pain)</option>
                  <option value={4}>Value 4: Asymptomatic (No overt chest pain; common in diabetic/silent ischemia)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Vitals & Blood Tests */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Step 2: Clinical Vitals & Lab Chemistry</h3>
              <p className="text-xs text-slate-500">Resting hemodynamic markers and blood serum measurements.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    Resting Blood Pressure (trestbps)
                    <span title="Resting systolic blood pressure upon admission (mm Hg). Normal <120, Hypertensive >= 130.">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">mm Hg</span>
                </div>
                <input
                  type="number"
                  {...register('trestbps', { valueAsNumber: true })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                {errors.trestbps && <p className="text-[11px] text-rose-500 mt-1">{errors.trestbps.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    Serum Cholesterol (chol)
                    <span title="Total serum cholesterol in mg/dl. Desirable <200, Borderline 200-239, High >= 240.">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">mg/dl</span>
                </div>
                <input
                  type="number"
                  {...register('chol', { valueAsNumber: true })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                {errors.chol && <p className="text-[11px] text-rose-500 mt-1">{errors.chol.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Fasting Blood Sugar &gt; 120 mg/dl (fbs)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                    <input
                      type="radio"
                      value={0}
                      {...register('fbs', { valueAsNumber: true })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>False (&le; 120 mg/dl)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                    <input
                      type="radio"
                      value={1}
                      {...register('fbs', { valueAsNumber: true })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>True (&gt; 120 mg/dl)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  Resting Electrocardiogram (restecg)
                  <span title="Baseline 12-lead resting electrocardiogram findings.">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </label>
                <select
                  {...register('restecg', { valueAsNumber: true })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value={0}>0: Normal Sinus Electrocardiogram</option>
                  <option value={1}>1: ST-T Wave Abnormality (T-wave inversion, ST elevation &gt; 0.05 mV)</option>
                  <option value={2}>2: Left Ventricular Hypertrophy (by Estes criteria)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Cardiac Stress Profile */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Step 3: Cardiac Stress & Exercise Profile</h3>
              <p className="text-xs text-slate-500">Treadmill/ergometer stress test measurements and ST-segment kinetics.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    Maximum Heart Rate Achieved (thalach)
                    <span title="Peak heart rate achieved during maximal exercise stress test.">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">bpm</span>
                </div>
                <input
                  type="number"
                  {...register('thalach', { valueAsNumber: true })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                {errors.thalach && <p className="text-[11px] text-rose-500 mt-1">{errors.thalach.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  Exercise-Induced Angina (exang)
                  <span title="Presence of ischemic chest pain during physical exertion.">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                    <input
                      type="radio"
                      value={0}
                      {...register('exang', { valueAsNumber: true })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>No (0)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                    <input
                      type="radio"
                      value={1}
                      {...register('exang', { valueAsNumber: true })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>Yes (1)</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    ST Depression Induced by Exercise (oldpeak)
                    <span title="ST segment depression induced by exercise relative to rest (in mm).">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">mm</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  {...register('oldpeak', { valueAsNumber: true })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                {errors.oldpeak && <p className="text-[11px] text-rose-500 mt-1">{errors.oldpeak.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  Slope of Peak Exercise ST Segment (slope)
                  <span title="1: Upsloping (generally benign), 2: Flat (ischemic indicator), 3: Downsloping (severe ischemia indicator).">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </label>
                <select
                  {...register('slope', { valueAsNumber: true })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value={1}>1: Upsloping (ST segment ascending rapidly)</option>
                  <option value={2}>2: Flat (Horizontal ST displacement - ischemic)</option>
                  <option value={3}>3: Downsloping (Downward displacement - severe ischemia)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Scans, Notes & Review */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Step 4: Angiographic Imaging & Scintigraphy</h3>
              <p className="text-xs text-slate-500">Fluoroscopic vessel count and thallium radionuclide stress scan.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  Major Vessels Colored by Fluoroscopy (ca)
                  <span title="Number of major coronary vessels (0-3) colored during fluoroscopy. Non-zero values correlate with stenosis.">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </label>
                <select
                  {...register('ca', { valueAsNumber: true })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value={0}>0 Vessels Colored (Unobstructed)</option>
                  <option value={1}>1 Major Vessel Colored</option>
                  <option value={2}>2 Major Vessels Colored</option>
                  <option value={3}>3 Major Vessels Colored</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  Thallium Stress Test Scintigraphy (thal)
                  <span title="Thallium-201 nuclear perfusion scan: 3 = Normal perfusion, 6 = Fixed defect (prior scar), 7 = Reversible defect (active inducible ischemia).">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </label>
                <select
                  {...register('thal', { valueAsNumber: true })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value={3}>3: Normal Myocardial Perfusion</option>
                  <option value={6}>6: Fixed Defect (Previous myocardial infarction / scar tissue)</option>
                  <option value={7}>7: Reversable Defect (Exercise-induced transient ischemia)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Clinical Assessment Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  {...register('clinical_notes')}
                  placeholder="Clinical observations, referring physician comments, medications (e.g. beta blockers, statins)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Ready for Inference Evaluation</p>
                <p className="text-[11px] text-teal-800 mt-0.5">
                  Submitting will pass all 13 clinical parameters through the trained preprocessor and logistic regression/ensemble pipeline, saving the record, generating explainability attributions, and drafting a PDF report.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <button
              type="button"
              onClick={() => reset(defaultValues)}
              className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Form
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
                className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 text-xs font-bold text-white bg-navy-900 hover:bg-navy-800 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Running Diagnostic Model...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 text-teal-400" />
                    Submit & Generate Risk Report
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
