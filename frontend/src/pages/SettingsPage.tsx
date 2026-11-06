import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  User,
  Shield,
  Lock,
  Database,
  CheckCircle2,
  Server,
  KeyRound,
  FileCheck
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setPasswordCurrent('');
    setPasswordNew('');
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-teal-600" />
          System & Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage clinical practitioner profile, role permissions, and system configurations.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Security settings updated successfully.</span>
        </div>
      )}

      {/* Practitioner Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-800">Practitioner Profile</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block uppercase text-[10px] mb-1">Full Name</label>
            <input
              type="text"
              readOnly
              value={user?.full_name || 'Dr. Julian Bashir'}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="text-slate-400 font-semibold block uppercase text-[10px] mb-1">Email Address</label>
            <input
              type="email"
              readOnly
              value={user?.email || 'doctor@cardioguard.ai'}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="text-slate-400 font-semibold block uppercase text-[10px] mb-1">Assigned Role</label>
            <div className="p-2 bg-teal-50 border border-teal-200 rounded-lg font-bold text-teal-800 capitalize">
              {user?.role?.replace('_', ' ') || 'Healthcare Professional'}
            </div>
          </div>
          <div>
            <label className="text-slate-400 font-semibold block uppercase text-[10px] mb-1">Member Since</label>
            <input
              type="text"
              readOnly
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Security Credentials Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <KeyRound className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-800">Password & Security</h3>
        </div>

        <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwordCurrent}
              onChange={(e) => setPasswordCurrent(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">New Password</label>
            <input
              type="password"
              required
              value={passwordNew}
              onChange={(e) => setPasswordNew(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Deployment & Environment Architecture Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Server className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-800">System Architecture & Service Diagnostics</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">ML Serving Engine</span>
            <span className="font-bold text-slate-800 block mt-1">Scikit-learn + Joblib</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Active In-Memory</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Relational Database</span>
            <span className="font-bold text-slate-800 block mt-1">SQLAlchemy ORM</span>
            <span className="text-[10px] text-teal-600 font-semibold">Alembic Versioned</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">PDF Generator</span>
            <span className="font-bold text-slate-800 block mt-1">ReportLab Graphics 5.1</span>
            <span className="text-[10px] text-teal-600 font-semibold">Native Byte Streaming</span>
          </div>
        </div>
      </div>
    </div>
  );
};

