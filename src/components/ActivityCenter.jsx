import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  Database, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Search,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Download,
  FileSpreadsheet,
  FileJson,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';

const ActivityCenter = () => {
  const { role, userId } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);
  
  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastSynced, setLastSynced] = useState(new Date());

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchActivities('SILENT');
      }, 5000); // Poll every 5 seconds for real-time feel
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchActivities = async (mode = '') => {
    try {
      if (mode !== 'SILENT') setLoading(true);
      else setIsPolling(true);
      
      setError(null);
      
      const fetchPromise = fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5100'}/api/activities`);
      const [response] = mode !== 'SILENT' 
        ? await Promise.all([fetchPromise, new Promise(resolve => setTimeout(resolve, 800))])
        : await Promise.all([fetchPromise]);

      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      setActivities(data);
      setLastSynced(new Date());
    } catch (error) {
      console.error('Error fetching activities:', error);
      if (mode !== 'SILENT') setError(error.message);
    } finally {
      if (mode !== 'SILENT') setLoading(false);
      setIsPolling(false);
    }
  };

  const handleRefresh = () => fetchActivities('REFRESH');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'error': return <ShieldAlert className="text-error" size={16} />;
      case 'warning': return <AlertTriangle className="text-warning" size={16} />;
      case 'success': return <CheckCircle2 className="text-success" size={16} />;
      default: return <Info className="text-primary" size={16} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'error': return 'bg-error/10 text-error border-error/20';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      case 'success': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.related_entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.performed_by.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleExport = async (format) => {
    setIsExporting(true);
    setShowExportMenu(false);
    
    // Simulate enterprise compiling delay for professional feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      let content = '';
      let filename = `rto_audit_log_${new Date().toISOString().split('T')[0]}`;
      let mimeType = '';

      if (format === 'EXCEL') {
        // Professional Native Excel (.xlsx) formatting
        const formatDate = (isoString) => {
          const d = new Date(isoString);
          return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
        };

        const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

        // Prepare raw JSON data mapped perfectly for Excel
        const excelData = filteredActivities.map(a => ({
          'Ref ID': a.activity_id,
          'Operation Detail': a.title || '',
          'Target Entity': a.related_entity || '',
          'Authorized By': a.performed_by || '',
          'Timestamp': formatDate(a.timestamp),
          'State': capitalize(a.status)
        }));

        // Create a new Workbook and Worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Auto-size columns to prevent ######## on dates
        ws['!cols'] = [
          { wch: 10 }, // Ref ID
          { wch: 45 }, // Operation Detail
          { wch: 30 }, // Target Entity
          { wch: 25 }, // Authorized By
          { wch: 22 }, // Timestamp
          { wch: 15 }  // State
        ];

        // Append Worksheet to Workbook
        XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");

        // Generate native XLSX file and download immediately
        XLSX.writeFile(wb, `RTO_System_Audit_Log_${new Date().toISOString().split('T')[0]}.xlsx`);

        setIsExporting(false);
        return; // Early return since XLSX library handles the browser download automatically
      } else if (format === 'JSON') {
        content = JSON.stringify(filteredActivities, null, 2);
        filename += '.json';
        mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Close dropdown if clicking outside (simplified for React without explicit ref logic, or just relying on onMouseLeave)

  return (
    <div className="space-y-8 fade-in-up pb-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Activity className="text-primary" size={28} />
            </div>
            Full Activity Log
          </h1>
          <p className="text-text-muted mt-2 font-medium flex items-center gap-2">
            System audit trail and real-time operational feed.
            <span className="w-1 h-1 bg-border rounded-full" />
            <span className="text-[10px] text-primary uppercase font-bold tracking-tight">Sync: {lastSynced.toLocaleTimeString()}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex gap-2">
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2.5 border rounded-xl flex items-center justify-center transition-all shadow-sm ${
                autoRefresh 
                  ? 'bg-success/10 border-success/20 text-success hover:bg-success/20' 
                  : 'bg-surface border-border text-text-muted hover:bg-background'
              }`}
              title={autoRefresh ? "Pause Live Feed" : "Resume Live Feed"}
            >
              {autoRefresh ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button 
              onClick={handleRefresh}
              className="p-2.5 bg-surface border border-border rounded-xl text-text-muted hover:text-primary hover:border-primary/30 transition-all shadow-sm group"
              title="Manual Sync"
            >
              <RefreshCw size={18} className={(loading || isPolling) ? 'animate-spin text-primary' : 'group-hover:rotate-180 transition-transform duration-500'} />
            </button>
            <div className="relative group flex-1 sm:flex-none">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search logs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-surface border border-border rounded-xl pl-11 pr-4 py-2.5 text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
              />
            </div>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-main focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer h-[46px]"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="info">Info</option>
          </select>
          <div className="relative" onMouseLeave={() => setShowExportMenu(false)}>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting || filteredActivities.length === 0}
              className={`bg-surface border border-border px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                isExporting 
                  ? 'opacity-80 text-primary bg-primary/5 cursor-wait' 
                  : filteredActivities.length === 0 
                    ? 'opacity-50 cursor-not-allowed text-text-muted'
                    : 'hover:bg-background text-text-main hover:border-primary/30 hover:text-primary'
              }`}
            >
              {isExporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
              {isExporting ? 'Compiling...' : 'Export'}
              {!isExporting && <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />}
            </button>

            <AnimatePresence>
              {showExportMenu && !isExporting && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-2 border-b border-border/50 bg-background/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted px-2">Download Format</p>
                  </div>
                  <div className="p-1.5 space-y-1">
                    <button 
                      onClick={() => handleExport('EXCEL')}
                      className="w-full text-left px-3 py-2.5 text-sm font-bold text-text-main hover:bg-background rounded-lg transition-colors flex items-center gap-2.5 group"
                    >
                      <FileSpreadsheet size={16} className="text-success" />
                      Microsoft Excel
                      <span className="ml-auto text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">.xlsx</span>
                    </button>
                    <button 
                      onClick={() => handleExport('JSON')}
                      className="w-full text-left px-3 py-2.5 text-sm font-bold text-text-main hover:bg-background rounded-lg transition-colors flex items-center gap-2.5 group"
                    >
                      <FileJson size={16} className="text-primary" />
                      Raw JSON
                      <span className="ml-auto text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">.json</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5 flex flex-col gap-1 border-l-4 border-l-primary bg-surface shadow-sm">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            Total Logs <Activity size={14} className="text-primary" />
          </span>
          <span className="text-2xl font-black text-text-main">{activities.length}</span>
        </div>
        <div className="card p-5 flex flex-col gap-1 border-l-4 border-l-success bg-surface shadow-sm">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            Successful <CheckCircle2 size={14} className="text-success" />
          </span>
          <span className="text-2xl font-black text-text-main">
            {activities.filter(a => a.status === 'success').length}
          </span>
        </div>
        <div className="card p-5 flex flex-col gap-1 border-l-4 border-l-warning bg-surface shadow-sm">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            Warnings <AlertTriangle size={14} className="text-warning" />
          </span>
          <span className="text-2xl font-black text-text-main">
            {activities.filter(a => a.status === 'warning').length}
          </span>
        </div>
        <div className="card p-5 flex flex-col gap-1 border-l-4 border-l-error bg-surface shadow-sm">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            Errors <ShieldAlert size={14} className="text-error" />
          </span>
          <span className="text-2xl font-black text-text-main">
            {activities.filter(a => a.status === 'error').length}
          </span>
        </div>
      </div>

      <div className="card overflow-hidden relative min-h-[400px] border-border shadow-sm">
        {loading && (
          <div className="absolute inset-0 bg-surface/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-lg border border-border animate-bounce">
              <Database size={16} className="text-primary animate-pulse" />
              <span className="text-xs font-black text-text-main uppercase tracking-widest">Compiling Log Feed...</span>
            </div>
          </div>
        )}
        
        {/* Floating live indicator when polling */}
        {isPolling && !loading && (
           <div className="absolute top-2 right-2 z-10">
             <span className="flex h-3 w-3 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
             </span>
           </div>
        )}

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-surface/90 backdrop-blur-md z-20 border-b border-border shadow-sm">
              <tr>
                <th className="p-4 text-xs font-black text-text-muted uppercase tracking-widest w-16 text-center">Ref</th>
                <th className="p-4 text-xs font-black text-text-muted uppercase tracking-widest">Operation Detail</th>
                <th className="p-4 text-xs font-black text-text-muted uppercase tracking-widest">Target Entity</th>
                <th className="p-4 text-xs font-black text-text-muted uppercase tracking-widest">Authorized By</th>
                <th className="p-4 text-xs font-black text-text-muted uppercase tracking-widest">Timestamp</th>
                <th className="p-4 text-xs font-black text-text-muted uppercase tracking-widest">State</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="p-4"><div className="h-4 w-6 bg-border/50 rounded mx-auto animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 w-48 bg-border/50 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 w-32 bg-border/50 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-border/50 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 w-36 bg-border/50 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-6 w-20 bg-border/50 rounded-full animate-pulse" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan="6" className="p-16 text-center text-error font-medium">
                    <Database size={32} className="mx-auto mb-3 opacity-50" />
                    Failed to connect to audit trail: {error}
                  </td>
                </tr>
              ) : filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-16 text-center text-text-muted bg-surface/30 border-dashed border-t border-b border-border">
                    <Search size={32} className="mx-auto mb-3 opacity-40 text-primary" />
                    <p className="font-bold text-text-main text-lg tracking-tight">No records found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredActivities.map((activity, idx) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx < 15 ? idx * 0.03 : 0 }}
                      key={activity.activity_id} 
                      className="border-b border-border/50 hover:bg-surface/80 transition-colors group cursor-default"
                    >
                      <td className="p-4 text-xs text-text-light font-mono font-black text-center bg-surface/20">
                        #{activity.activity_id}
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold text-text-main group-hover:text-primary transition-colors">
                          {activity.title}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-[11px] font-mono font-bold text-text-muted bg-background px-2 py-1.5 rounded border border-border inline-block">
                          {activity.related_entity}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-xs font-bold text-text-main">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            {activity.performed_by.charAt(0)}
                          </div>
                          {activity.performed_by}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-text-light uppercase tracking-wider">
                          <Clock size={12} className="text-primary/70" />
                          {new Date(activity.timestamp).toLocaleString(undefined, { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit', second:'2-digit'
                          })}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded border inline-flex shadow-sm ${getStatusClass(activity.status)}`}>
                          {getStatusIcon(activity.status)}
                          {activity.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Monitoring Status Footer */}
      <div className="card p-5 bg-surface border-border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex h-3 w-3">
            {autoRefresh ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-warning"></span>
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">
              {autoRefresh ? 'Live Audit Stream Active' : 'Live Stream Paused'}
            </h4>
            <p className="text-xs font-medium text-text-muted mt-0.5">
              {autoRefresh ? 'Tracking operations and changes in real-time.' : 'Manual sync required for updates.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
             <p className="text-[10px] font-black text-text-light uppercase tracking-widest">Stream Status</p>
             <p className={`text-xs font-bold ${autoRefresh ? 'text-success' : 'text-warning'}`}>
               {autoRefresh ? 'Connected (5s)' : 'Suspended'}
             </p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-right">
             <p className="text-[10px] font-black text-text-light uppercase tracking-widest">Last Synced</p>
             <p className="text-xs font-bold text-text-main">{lastSynced.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCenter;
