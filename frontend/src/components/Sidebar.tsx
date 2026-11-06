import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  HeartPulse,
  Users,
  History,
  BarChart3,
  Cpu,
  Settings,
  LogOut,
  ShieldAlert,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Assessment', path: '/assessment/new', icon: HeartPulse, highlight: true },
    { name: 'Patients', path: '/patients', icon: Users },
    { name: 'Prediction History', path: '/history', icon: History },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Model Performance', path: '/model-performance', icon: Cpu },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } border-r border-slate-800`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/40">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-teal-500/20">
            <Activity className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight flex items-center gap-1">
              CardioGuard <span className="text-teal-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-teal-950/60 border border-teal-800/50">AI</span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium">Risk Assessment Platform</p>
          </div>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Clinical Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 font-semibold border-l-2 border-teal-400 pl-3'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                } ${item.highlight ? 'ring-1 ring-teal-500/30 bg-teal-950/20 text-teal-300' : ''}`
              }
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors group-hover:text-teal-400`}
                />
                <span>{item.name}</span>
              </div>
              {item.highlight ? (
                <span className="text-[10px] bg-teal-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full">
                  New
                </span>
              ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* ML System Status Pill */}
      <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium text-[11px]">ML Engine: Online</span>
          </div>
          <span className="text-[10px] text-teal-400 font-mono">v1.0.0</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">UCI Cleveland Benchmark • 86.9% Acc</p>
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-teal-300 font-bold text-xs uppercase flex-shrink-0">
              {user?.full_name?.charAt(0) || 'D'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Clinician'}</p>
              <p className="text-[10px] text-slate-400 capitalize truncate">{user?.role?.replace('_', ' ') || 'Healthcare Staff'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

