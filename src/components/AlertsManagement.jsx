import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Trash2, 
  Filter, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Clock, 
  Settings,
  MoreVertical,
  Activity,
  ShieldAlert,
  RefreshCw,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AlertsManagement = () => {
  const { role, userId } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [lastSynced, setLastSynced] = useState(new Date());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, [role, userId]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const getHeaders = () => ({
    'x-user-role': role,
    'x-user-id': userId.toString()
  });

  const fetchAlerts = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const [response] = await Promise.all([
        fetch(`http://localhost:5000/api/alerts${query === 'REFRESH' ? '' : ''}`, { headers: getHeaders() }),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      if (!response.ok) throw new Error('Intelligence feed disconnected');
      const data = await response.json();
      setAlerts(data);
      setLastSynced(new Date());
      if (query === 'REFRESH') showToast('System alerts synchronized');
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchAlerts('REFRESH');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || alert.type === filterType;
    return matchesSearch && matchesType;
  });

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <ShieldAlert className="text-error" size={20} />;
      case 'warning': return <AlertTriangle className="text-warning" size={20} />;
      case 'success': return <CheckCircle2 className="text-success" size={20} />;
      default: return <Info className="text-primary" size={20} />;
    }
  };

  return (
    <div className="space-y-8 fade-in-up">
      {toast && (
        <div className="toast-container">
          <div className="toast">
            <Database size={16} className="text-error" />
            {toast}
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight">
              {role === 'admin' ? 'System Alerts' : 'My Alerts'}
            </h1>
            <span className="px-2.5 py-1 bg-error/10 text-error text-[10px] font-black rounded-lg border border-error/20 uppercase tracking-wider">
              {loading ? '...' : filteredAlerts.length} Active
            </span>
          </div>
          <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
            {role === 'admin' ? 'Critical system notifications and operational intelligence feed.' : 'Important notifications regarding your vehicles, insurance, and licenses.'}
            <span className="w-1 h-1 bg-border rounded-full" />
            <span className="text-[10px] text-text-light uppercase font-bold">Sync: {lastSynced.toLocaleTimeString()}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh}
              className="p-2.5 bg-surface border border-border rounded-xl text-text-muted hover:text-error hover:border-error/30 transition-all shadow-sm"
              title="Poll Intelligence Feed"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="relative group flex-1 sm:flex-none">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Filter by keyword..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-surface border border-border rounded-xl pl-11 pr-4 py-2.5 text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
              />
            </div>
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-main focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer h-[46px]"
          >
            <option value="all">All Levels</option>
            <option value="error">Critical Only</option>
            <option value="warning">Warnings Only</option>
            <option value="info">System Info</option>
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 relative">
        {loading && (
          <div className="absolute inset-0 bg-surface/40 backdrop-blur-[1px] z-10 flex items-center justify-center min-h-[200px]">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-lg border border-border animate-bounce">
              <Database size={16} className="text-error animate-pulse" />
              <span className="text-xs font-black text-text-main uppercase tracking-widest">Polling Intelligence Feed...</span>
            </div>
          </div>
        )}
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="card h-28 skeleton" />
          ))
        ) : error ? (
          <div className="card flex flex-col items-center justify-center py-20 gap-4">
            <div className="p-4 bg-error/10 text-error rounded-full">
              <AlertTriangle size={48} />
            </div>
            <h3 className="font-bold text-text-main">Intelligence Feed Interrupted</h3>
            <p className="text-sm text-text-muted">{error}</p>
            <button 
              onClick={handleRefresh}
              className="bg-error text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-error/20"
            >
              Reconnect to Feed
            </button>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 gap-4 opacity-40 border-dashed">
            <Activity size={64} className="text-text-muted" />
            <p className="text-sm font-bold text-text-muted uppercase tracking-widest">No active alerts detected in database.</p>
          </div>
        ) : (
          filteredAlerts.map((alert, idx) => (
            <motion.div 
              key={alert.id || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`card p-0 overflow-hidden border-l-4 transition-all hover:shadow-md ${
                alert.type === 'error' ? 'border-l-error' : 
                alert.type === 'warning' ? 'border-l-warning' : 
                alert.type === 'success' ? 'border-l-success' : 'border-l-primary'
              }`}
            >
              <div className="p-5 flex items-start gap-5">
                <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${
                  alert.type === 'error' ? 'bg-error/10' : 
                  alert.type === 'warning' ? 'bg-warning/10' : 
                  alert.type === 'success' ? 'bg-success/10' : 'bg-primary/10'
                }`}>
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h3 className="text-base font-black text-text-main tracking-tight">{alert.title}</h3>
                    <span className="text-[10px] font-bold text-text-light flex items-center gap-1.5 uppercase tracking-widest bg-background px-2 py-1 rounded border border-border">
                      <Clock size={12} />
                      Just Now
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text-muted leading-relaxed max-w-3xl">
                    {alert.description}
                  </p>
                  
                  {role === 'admin' && (
                    <div className="mt-4 flex items-center gap-4">
                      <button className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary-hover transition-colors">
                        Investigate Origin
                      </button>
                      <div className="w-1 h-1 bg-border rounded-full" />
                      <button className="text-[11px] font-black uppercase tracking-widest text-text-light hover:text-text-main transition-colors">
                        Mark as Resolved
                      </button>
                    </div>
                  )}
                </div>
                
                {role === 'admin' && (
                  <button className="p-2 hover:bg-background rounded-lg text-text-light transition-colors">
                    <MoreVertical size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Background Stats Card */}
      {role === 'admin' && (
        <div className="card p-8 bg-gradient-to-r from-text-main to-slate-800 text-white border-none shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">System Uptime</p>
              <h4 className="text-3xl font-black">99.98%</h4>
              <div className="h-1 w-20 bg-primary rounded-full" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Avg. Response Time</p>
              <h4 className="text-3xl font-black">24ms</h4>
              <div className="h-1 w-20 bg-success rounded-full" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Active Session ID</p>
              <h4 className="text-xl font-mono opacity-80">RTO-SRV-0012</h4>
              <div className="h-1 w-20 bg-secondary rounded-full" />
            </div>
          </div>
          <Settings size={180} className="absolute -right-20 -bottom-20 opacity-5 rotate-12" />
        </div>
      )}
    </div>
  );
};

export default AlertsManagement;
