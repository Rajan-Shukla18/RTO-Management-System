import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Car, 
  FileText, 
  ChevronRight,
  Users, 
  BadgeCheck,
  ShieldCheck,
  Activity,
  Database,
  Clock,
  ArrowUpRight,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = ({ setActiveTab }) => {
  const { role, userId } = useAuth();
  const [stats, setStats] = useState({
    counts: { owners: 0, vehicles: 0, registrations: 0, pending: 0, licenses: 0 },
    recentRegistrations: []
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState(new Date());

  useEffect(() => {
    refreshAll();
  }, [role, userId]); // Re-fetch when role changes

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(), 
      fetchAlerts(),
      new Promise(resolve => setTimeout(resolve, 1000)) // 1s delay for dashboard sync
    ]);
    setLastSynced(new Date());
    setLoading(false);
  };

  const getHeaders = () => ({
    'x-user-role': role,
    'x-user-id': userId.toString()
  });

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5100/api/stats', { headers: getHeaders() });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:5100/api/alerts', { headers: getHeaders() });
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const adminStatCards = [
    { label: 'Total Owners', value: stats.counts.owners, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Vehicles', value: stats.counts.vehicles, icon: Car, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { label: 'Registrations', value: stats.counts.registrations, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Driving Licenses', value: stats.counts.licenses, icon: BadgeCheck, color: 'text-violet-500', bg: 'bg-violet-50' },
  ];

  const citizenStatCards = [
    { label: 'My Vehicles', value: stats.counts.vehicles, icon: Car, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { label: 'My Registrations', value: stats.counts.registrations, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Active Insurance', value: stats.counts.pending || 0, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'My Licenses', value: stats.counts.licenses, icon: BadgeCheck, color: 'text-violet-500', bg: 'bg-violet-50' },
  ];

  const statCards = role === 'admin' ? adminStatCards : citizenStatCards;

  return (
    <div className="space-y-8 fade-in-up">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight">
            {role === 'admin' ? 'Overview Dashboard' : 'My Dashboard'}
          </h2>
          <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
            {role === 'admin' ? "Welcome back, Captain. Here's what's happening today." : "Welcome back. Here's your personal vehicle summary."}
            <span className="w-1 h-1 bg-border rounded-full" />
            <span className="text-[10px] text-primary uppercase font-bold tracking-tight">Sync: {lastSynced.toLocaleTimeString()}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-text-muted bg-surface px-4 py-2 rounded-xl border border-border shadow-sm">
          <Clock size={16} className="text-primary" />
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 h-32 skeleton" />
          ))
        ) : (
          statCards.map((card, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -4 }}
              className="card p-6 flex flex-col gap-4 relative group"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${card.bg} ${card.color} transition-colors group-hover:bg-primary group-hover:text-white`}>
                  <card.icon size={24} />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{card.label}</p>
                <h2 className="text-3xl font-black mt-1 text-text-main tabular-nums">{card.value}</h2>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              {role === 'admin' ? (
                <><Activity size={18} className="text-primary" /> Recent Operations</>
              ) : (
                <><FileText size={18} className="text-primary" /> My Recent Registrations</>
              )}
            </h3>
            {role === 'admin' && (
              <button 
                onClick={() => setActiveTab && setActiveTab('activities')}
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors cursor-pointer"
              >
                Full Activity Log <ArrowUpRight size={14} />
              </button>
            )}
          </div>
          
          <div className="card overflow-hidden relative min-h-[200px]">
            {loading && (
              <div className="absolute inset-0 bg-surface/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-lg border border-border animate-bounce">
                  <Database size={16} className="text-primary animate-pulse" />
                  <span className="text-xs font-black text-text-main uppercase tracking-widest">Synchronizing Database...</span>
                </div>
              </div>
            )}
            <div className="table-container border-none rounded-none">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th>Plate Number</th>
                    <th>Owner Name</th>
                    <th>Vehicle Details</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i}>
                        <td className="px-6 py-4"><div className="h-8 w-24 skeleton" /></td>
                        <td className="px-6 py-4"><div className="h-8 w-32 skeleton" /></td>
                        <td className="px-6 py-4"><div className="h-8 w-40 skeleton" /></td>
                        <td className="px-6 py-4"><div className="h-8 w-20 skeleton mx-auto" /></td>
                      </tr>
                    ))
                  ) : stats.recentRegistrations.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-text-muted italic">No recent registrations found.</td></tr>
                  ) : (
                    stats.recentRegistrations.map((reg, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className="font-mono font-bold text-primary bg-primary-light px-2 py-1 rounded border border-primary/10">
                            {reg.registration_no || 'PENDING'}
                          </span>
                        </td>
                        <td className="font-semibold text-text-main">{reg.owner_name}</td>
                        <td className="text-text-muted">
                          {reg.manufacturer} <span className="text-text-light">|</span> {reg.model_name}
                        </td>
                        <td className="text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            reg.status === 'Approved' ? 'bg-success/10 text-success' : 
                            reg.status === 'Pending' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System Insights & Feed */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Bell size={18} className="text-primary" />
              {role === 'admin' ? 'Intelligence Feed' : 'My Alerts'}
            </h3>
            <div className="space-y-5">
              {loading ? (
                <div className="flex flex-col gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                      <div className="w-2 h-2 rounded-full skeleton flex-shrink-0 mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/2 skeleton" />
                        <div className="h-10 w-full skeleton" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center text-success mb-3">
                    <ShieldCheck size={24} />
                  </div>
                  <p className="text-sm font-bold text-text-main">{role === 'admin' ? 'System Optimal' : 'All Clear'}</p>
                  <p className="text-[12px] text-text-muted mt-1">
                    {role === 'admin' ? 'No critical issues detected in the regional network.' : 'You have no pending alerts or upcoming expiries.'}
                  </p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex gap-4 group">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${alert.type === 'error' ? 'bg-error' : 'bg-warning'}`}></div>
                    <div>
                      <h4 className="text-sm font-bold text-text-main group-hover:text-primary transition-colors cursor-pointer">{alert.title}</h4>
                      <p className="text-[12px] text-text-muted mt-1 leading-relaxed">{alert.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-primary to-blue-600 text-white border-none shadow-lg shadow-primary/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Database size={18} />
                Live Connection
              </h3>
              <p className="text-sm opacity-90 leading-relaxed mb-4 font-medium">
                Your database is synchronized with the regional SQLite cluster. All updates are real-time.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 w-fit px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Region: Active
              </div>
            </div>
            {/* Background pattern */}
            <Database size={120} className="absolute -right-8 -bottom-8 opacity-10 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
