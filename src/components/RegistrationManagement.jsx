import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCheck, 
  Search, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  X,
  Car,
  User,
  Calendar,
  Shield,
  FileText,
  AlertCircle,
  RefreshCw,
  Database,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegistrationManagement = () => {
  const { role, userId } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSynced, setLastSynced] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    registration_date: new Date().toISOString().split('T')[0],
    registration_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 15)).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchRegistrations();
    fetchVehicles();
  }, [role, userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRegistrations(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRegistrations = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      // Added artificial delay to make the "Fetching from Database" indicator visible
      // since local SQLite is extremely fast.
      const [response] = await Promise.all([
        fetch(`http://localhost:5000/api/registrations${query ? `?search=${query}` : ''}`, {
          headers: {
            'x-user-role': role,
            'x-user-id': userId.toString()
          }
        }),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      
      if (!response.ok) throw new Error('Database connection failed');
      const data = await response.json();
      setRegistrations(data);
      setLastSynced(new Date());
      if (query === 'REFRESH') showToast('Registrations synchronized');
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchRegistrations('REFRESH');

  const fetchVehicles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vehicles', {
        headers: {
          'x-user-role': role,
          'x-user-id': userId.toString()
        }
      });
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/registrations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) fetchRegistrations(searchTerm);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIsModalOpen(false);
        fetchRegistrations(searchTerm);
      }
    } catch (error) {
      console.error('Error creating registration:', error);
    }
  };

  return (
    <div className="space-y-8 fade-in-up">
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
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight">Registration Workflow</h1>
            <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg border border-primary/20 uppercase tracking-wider">
              {loading ? '...' : registrations.length} Records
            </span>
          </div>
          <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
            Process vehicle applications and manage license assignments.
            <span className="w-1 h-1 bg-border rounded-full" />
            <span className="text-[10px] text-text-light uppercase font-bold">Sync: {lastSynced.toLocaleTimeString()}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh}
              className="p-2.5 bg-surface border border-border rounded-xl text-text-muted hover:text-primary hover:border-primary/30 transition-all shadow-sm"
              title="Refresh from Database"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="relative group flex-1 sm:flex-none">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search plate or owner..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-surface border border-border rounded-xl pl-11 pr-4 py-2.5 text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
              />
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-sm shadow-primary/20"
          >
            <Plus size={18} />
            New Application
          </motion.button>
        </div>
      </header>

      {/* Workflow Table Card */}
      <div className="card overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-surface/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-lg border border-border animate-bounce">
              <Database size={16} className="text-primary animate-pulse" />
              <span className="text-xs font-black text-text-main uppercase tracking-widest">Fetching from Database...</span>
            </div>
          </div>
        )}
        <div className="table-container border-none rounded-none">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Plate / Application</th>
                <th>Vehicle & Owner</th>
                <th>Timeline</th>
                <th>Status</th>
                {role === 'admin' && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="relative">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-10 w-40 skeleton" /></td>
                    <td className="px-6 py-4"><div className="h-10 w-48 skeleton" /></td>
                    <td className="px-6 py-4"><div className="h-10 w-32 skeleton" /></td>
                    <td className="px-6 py-4"><div className="h-10 w-24 skeleton mx-auto" /></td>
                    {role === 'admin' && <td className="px-6 py-4"><div className="h-10 w-16 skeleton ml-auto" /></td>}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-error/10 text-error rounded-full">
                        <AlertTriangle size={32} />
                      </div>
                      <h3 className="font-bold text-text-main">Database Synchronization Failed</h3>
                      <p className="text-sm text-text-muted">{error}</p>
                      <button 
                        onClick={handleRefresh}
                        className="mt-2 text-primary font-bold text-sm flex items-center gap-2 hover:underline"
                      >
                        <RefreshCw size={14} /> Retry Sync
                      </button>
                    </div>
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <FileText size={48} className="text-text-muted" />
                      <p className="text-sm font-bold text-text-muted uppercase tracking-widest">No registration records found.</p>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="mt-2 bg-background border border-border px-4 py-2 rounded-lg text-xs font-bold text-text-main hover:bg-surface transition-colors"
                      >
                        Create Application
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.registration_id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold ${
                          reg.status === 'Approved' ? 'bg-success/10 border-success/20 text-success' : 
                          reg.status === 'Rejected' ? 'bg-error/10 border-error/20 text-error' : 
                          'bg-warning/10 border-warning/20 text-warning'
                        }`}>
                          <Shield size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-mono font-black text-text-main">
                            {reg.registration_no || `APP-${reg.registration_id.toString().padStart(4, '0')}`}
                          </p>
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">ID: {reg.registration_id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-bold text-text-main">
                          <Car size={14} className="text-text-muted" />
                          {reg.manufacturer} {reg.model_name}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                          <User size={12} className="text-primary/60" />
                          {reg.owner_name}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2 font-bold text-text-main">
                          <Calendar size={12} className="text-secondary" />
                          Reg: {new Date(reg.registration_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-text-muted opacity-60">
                          <FileText size={12} />
                          Exp: {new Date(reg.registration_expiry).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        reg.status === 'Approved' ? 'badge-success' : 
                        reg.status === 'Pending' ? 'badge-warning' : 
                        'badge-error'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                    {role === 'admin' && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {reg.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(reg.registration_id, 'Approved')}
                                className="p-2 hover:bg-success/10 text-success rounded-lg transition-colors"
                                title="Approve Application"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(reg.registration_id, 'Rejected')}
                                className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors"
                                title="Reject Application"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={async () => {
                              if(window.confirm('Delete registration record?')) {
                                await fetch(`http://localhost:5000/api/registrations/${reg.registration_id}`, { method: 'DELETE' });
                                fetchRegistrations(searchTerm);
                              }
                            }}
                            className="p-2 hover:bg-error/10 text-text-muted hover:text-error rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-text-main/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface w-full max-w-lg relative z-[101] rounded-2xl shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-6 border-b border-border bg-surface-dim flex justify-between items-center">
                <h2 className="text-xl font-black text-text-main tracking-tight">New Registration Request</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-background rounded-full text-text-muted transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted ml-1">Select Vehicle *</label>
                  <select 
                    required
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="">Choose a vehicle for registry</option>
                    {vehicles.map(v => (
                      <option key={v.vehicle_id} value={v.vehicle_id}>
                        {v.manufacturer} {v.model_name} — VIN: {v.chassis_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted ml-1 text-center block">Registration Date</label>
                    <input 
                      type="date" 
                      value={formData.registration_date}
                      onChange={(e) => setFormData({...formData, registration_date: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted ml-1 text-center block">Expiry Date</label>
                    <input 
                      type="date" 
                      value={formData.registration_expiry}
                      onChange={(e) => setFormData({...formData, registration_expiry: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-text-muted hover:bg-background transition-colors border border-transparent"
                  >
                    Discard
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-[2] bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                  >
                    Submit Application
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegistrationManagement;
