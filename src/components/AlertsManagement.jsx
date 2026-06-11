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
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [lastSynced, setLastSynced] = useState(new Date());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAlerts();
    
    // Real-time polling every 10 seconds for professional efficiency
    const interval = setInterval(() => {
      fetchAlerts('SILENT');
    }, 10000);
    
    return () => clearInterval(interval);
  }, [role, userId]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const getHeaders = () => ({
    'x-user-role': role,
    'x-user-id': userId.toString()
  });

  const fetchAlerts = async (mode = '') => {
    try {
      if (mode !== 'SILENT') {
        setLoading(true);
      } else {
        setIsPolling(true);
      }
      setError(null);
      
      const fetchPromise = fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5100'}`}/api/alerts`, { headers: getHeaders() });
      const [response] = mode !== 'SILENT' 
        ? await Promise.all([fetchPromise, new Promise(resolve => setTimeout(resolve, 800))])
        : await Promise.all([fetchPromise]);

      if (!response.ok) throw new Error('Intelligence feed disconnected');
      const data = await response.json();
      setAlerts(data);
      setLastSynced(new Date());
      if (mode === 'REFRESH') showToast('Compliance data synchronized');
    } catch (error) {
      console.error('Error fetching alerts:', error);
      if (mode !== 'SILENT') setError(error.message);
    } finally {
      if (mode !== 'SILENT') setLoading(false);
      setIsPolling(false);
    }
  };

  const handleRefresh = () => fetchAlerts('REFRESH');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || alert.alertType === filterType;
    const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority;
    return matchesSearch && matchesType && matchesPriority;
  });

  const stats = {
    critical: alerts.filter(a => a.priority === 'High').length,
    expiringSoon: alerts.filter(a => a.daysRemaining >= 0 && a.daysRemaining <= 30).length,
    expired: alerts.filter(a => a.daysRemaining < 0).length,
    incomplete: alerts.filter(a => a.alertType === 'Registration').length
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <ShieldAlert size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      case 'success': return <CheckCircle2 size={20} />;
      default: return <Info size={20} />;
    }
  };

  return (
    <div className="space-y-8 fade-in-up pb-8">
      {toast && (
        <div className="toast-container">
          <div className="toast">
            <Database size={16} className="text-primary" />
            {toast}
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight">
              {role === 'admin' ? 'Compliance Center' : 'My Compliance Center'}
            </h1>
            <span className="px-2.5 py-1 bg-error/10 text-error text-[10px] font-black rounded-lg border border-error/20 uppercase tracking-wider flex items-center gap-1.5">
              {loading ? '...' : filteredAlerts.length} Active
              {isPolling && <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />}
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
              className="p-2.5 bg-surface border border-border rounded-xl text-text-muted hover:text-primary hover:border-primary/30 transition-all shadow-sm group relative"
              title="Poll Intelligence Feed"
            >
              <RefreshCw size={18} className={(loading || isPolling) ? 'animate-spin text-primary' : 'group-hover:rotate-180 transition-transform duration-500'} />
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
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-main focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer h-[46px]"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-main focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer h-[46px]"
          >
            <option value="all">All Types</option>
            <option value="Insurance">Insurance</option>
            <option value="License">License</option>
            <option value="Registration">Registration</option>
          </select>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 flex flex-col gap-1 border-l-4 border-l-error bg-surface shadow-sm hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            Critical Issues <ShieldAlert size={14} className="text-error" />
          </span>
          <span className="text-2xl font-black text-text-main">{stats.critical}</span>
        </div>
        <div className="card p-4 flex flex-col gap-1 border-l-4 border-l-warning bg-surface shadow-sm hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            Expiring Soon <Clock size={14} className="text-warning" />
          </span>
          <span className="text-2xl font-black text-text-main">{stats.expiringSoon}</span>
        </div>
        <div className="card p-4 flex flex-col gap-1 border-l-4 border-l-error bg-surface shadow-sm hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            Expired Records <AlertTriangle size={14} className="text-error" />
          </span>
          <span className="text-2xl font-black text-text-main">{stats.expired}</span>
        </div>
        <div className="card p-4 flex flex-col gap-1 border-l-4 border-l-primary bg-surface shadow-sm hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            Incomplete <Info size={14} className="text-primary" />
          </span>
          <span className="text-2xl font-black text-text-main">{stats.incomplete}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 bg-surface/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-lg border border-border animate-bounce">
              <Database size={16} className="text-primary animate-pulse" />
              <span className="text-xs font-black text-text-main uppercase tracking-widest">Polling Intelligence Feed...</span>
            </div>
          </div>
        )}
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="card h-32 skeleton border border-border/50" />
          ))
        ) : error ? (
          <div className="card flex flex-col items-center justify-center py-20 gap-4">
            <div className="p-4 bg-error/10 text-error rounded-full">
              <AlertTriangle size={48} />
            </div>
            <h3 className="font-bold text-text-main text-lg">Intelligence Feed Interrupted</h3>
            <p className="text-sm text-text-muted">{error}</p>
            <button 
              onClick={handleRefresh}
              className="bg-error text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-error/20 hover:bg-red-600 transition-colors mt-2"
            >
              Reconnect to Feed
            </button>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 gap-4 border-dashed bg-success/5 border-success/20">
            <div className="p-4 bg-success/10 rounded-full">
              <CheckCircle2 size={48} className="text-success" />
            </div>
            <p className="text-sm font-bold text-success uppercase tracking-widest">All records are compliant.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredAlerts.map((alert) => (
              <motion.div 
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`card p-0 overflow-hidden border-l-4 transition-all shadow-sm hover:shadow-md bg-white ${
                  alert.type === 'error' ? 'border-l-error border border-error/20' : 
                  alert.type === 'warning' ? 'border-l-warning border border-warning/20' : 
                  alert.type === 'success' ? 'border-l-success border border-success/20' : 'border-l-primary border border-primary/20'
                }`}
              >
                <div className="p-5 flex items-start gap-5">
                  <div className={`mt-1 p-2.5 rounded-xl flex-shrink-0 shadow-sm ${
                    alert.type === 'error' ? 'bg-error text-white shadow-error/30' : 
                    alert.type === 'warning' ? 'bg-warning text-white shadow-warning/30' : 
                    alert.type === 'success' ? 'bg-success text-white shadow-success/30' : 'bg-primary text-white shadow-primary/30'
                  }`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-base font-black tracking-tight ${alert.type === 'error' ? 'text-error' : 'text-text-main'}`}>
                          {alert.title}
                        </h3>
                        {alert.priority && (
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            alert.priority === 'High' ? 'bg-error text-white' :
                            alert.priority === 'Medium' ? 'bg-warning text-white' :
                            'bg-primary text-white'
                          }`}>
                            {alert.priority}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.daysRemaining !== undefined && alert.daysRemaining >= 0 && (
                          <span className="text-[10px] font-bold text-text-main flex items-center gap-1.5 uppercase tracking-widest bg-surface px-2.5 py-1 rounded-md border border-border">
                            <Clock size={12} className={alert.daysRemaining <= 15 ? 'text-warning' : 'text-text-light'} />
                            {alert.daysRemaining === 0 ? 'Expiring Today' : `${alert.daysRemaining} Days Left`}
                          </span>
                        )}
                        {alert.daysRemaining !== undefined && alert.daysRemaining < 0 && (
                          <span className="text-[10px] font-bold text-error flex items-center gap-1.5 uppercase tracking-widest bg-error/10 px-2.5 py-1 rounded-md border border-error/30 animate-pulse">
                            <Clock size={12} />
                            Expired {Math.abs(alert.daysRemaining)} Days Ago
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-text-muted leading-relaxed max-w-4xl mt-1">
                      {alert.description}
                    </p>
                    {alert.action && (
                      <div className={`mt-3.5 p-3 rounded-lg inline-block border ${
                        alert.type === 'error' ? 'bg-error/5 border-error/10' : 'bg-surface border-border'
                      }`}>
                        <p className="text-xs font-bold text-text-main flex items-center gap-2">
                          <Activity size={14} className={alert.type === 'error' ? 'text-error' : 'text-primary'} />
                          Recommended Action: <span className="text-text-muted font-medium">{alert.action}</span>
                        </p>
                      </div>
                    )}
                    
                    {role === 'admin' && (
                      <div className="mt-4 flex items-center gap-4">
                        <button className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary-hover transition-colors">
                          Investigate Origin
                        </button>
                        <div className="w-1 h-1 bg-border rounded-full" />
                        <button className="text-[11px] font-black uppercase tracking-widest text-text-light hover:text-text-main transition-colors">
                          Acknowledge
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {role === 'admin' && (
                    <button className="p-2 hover:bg-background rounded-lg text-text-light hover:text-text-main transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Real-time Monitoring Status Footer */}
      <div className="card p-5 bg-surface border-border flex flex-col md:flex-row items-center justify-between gap-4 mt-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">Real-Time Connectivity Active</h4>
            <p className="text-xs font-medium text-text-muted mt-0.5">Systems are fully operational and fetching live records efficiently.</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
             <p className="text-[10px] font-black text-text-light uppercase tracking-widest">Polling Interval</p>
             <p className="text-xs font-bold text-text-main">Every 10s</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-right">
             <p className="text-[10px] font-black text-text-light uppercase tracking-widest">Last Synced</p>
             <p className="text-xs font-bold text-text-main">{lastSynced.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Background Stats Card for Admin */}
      {role === 'admin' && (
        <div className="card p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none shadow-xl relative overflow-hidden mt-6">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em]">System Uptime</p>
              <h4 className="text-3xl font-black">99.99%</h4>
              <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 w-[99.99%]" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-green-300 uppercase tracking-[0.2em]">Avg. API Latency</p>
              <h4 className="text-3xl font-black">12ms</h4>
              <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 w-1/4" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-purple-300 uppercase tracking-[0.2em]">Active Edge Nodes</p>
              <h4 className="text-xl font-mono opacity-90 tracking-widest">RTO-SRV-0012</h4>
              <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 w-full" />
              </div>
            </div>
          </div>
          <Settings size={200} className="absolute -right-10 -bottom-10 opacity-[0.03] rotate-45" />
          <Database size={120} className="absolute right-40 top-4 opacity-[0.03] -rotate-12" />
        </div>
      )}
    </div>
  );
};

export default AlertsManagement;
