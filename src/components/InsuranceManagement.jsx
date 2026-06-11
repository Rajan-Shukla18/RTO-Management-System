import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  ShieldAlert,
  Car,
  Calendar,
  DollarSign,
  Briefcase,
  AlertTriangle,
  Database,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const InsuranceManagement = () => {
  const { role, userId } = useAuth();
  const [insurance, setInsurance] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState(null);
  const [lastSynced, setLastSynced] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    provider_name: '',
    policy_number: '',
    start_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    premium_amount: ''
  });

  useEffect(() => {
    fetchInsurance();
    fetchVehicles();
  }, [role, userId]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInsurance = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const [response] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5100'}`}/api/insurance${query ? `?search=${query}` : ''}`, {
          headers: {
            'x-user-role': role,
            'x-user-id': userId.toString()
          }
        }),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      if (!response.ok) throw new Error('Policy database sync failed');
      const data = await response.json();
      setInsurance(data);
      setLastSynced(new Date());
      if (query === 'REFRESH') showToast('Policies refreshed from database');
    } catch (error) {
      console.error('Error fetching insurance:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchInsurance('REFRESH');

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5100'}/api/vehicles`, {
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInsurance(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = currentPolicy 
      ? `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5100'}`}/api/insurance/${currentPolicy.insurance_id}`
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5100'}/api/insurance`;
    const method = currentPolicy ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIsModalOpen(false);
        resetForm();
        fetchInsurance(searchTerm);
      }
    } catch (error) {
      console.error('Error saving insurance:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicle_id: '', provider_name: '', policy_number: '',
      start_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      premium_amount: ''
    });
    setCurrentPolicy(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this insurance policy from records?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5100'}`}/api/insurance/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) fetchInsurance(searchTerm);
      } catch (error) {
        console.error('Error deleting insurance:', error);
      }
    }
  };

  const getPolicyStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Expired', badgeClass: 'badge-error', icon: ShieldAlert };
    if (diffDays <= 30) return { label: 'Expiring Soon', badgeClass: 'badge-warning', icon: AlertTriangle };
    return { label: 'Active', badgeClass: 'badge-success', icon: ShieldCheck };
  };

  return (
    <div className="space-y-8 fade-in-up">
      {toast && (
        <div className="toast-container">
          <div className="toast">
            <Database size={16} className="text-secondary" />
            {toast}
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight">
              {role === 'admin' ? 'Insurance Portfolio' : 'My Insurance'}
            </h1>
            <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-lg border border-secondary/20 uppercase tracking-wider">
              {loading ? '...' : insurance.length} Records
            </span>
          </div>
          <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
            {role === 'admin' ? 'Monitor vehicle coverage policies and compliance status.' : 'View your active vehicle insurance policies.'}
            <span className="w-1 h-1 bg-border rounded-full" />
            <span className="text-[10px] text-text-light uppercase font-bold">Sync: {lastSynced.toLocaleTimeString()}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh}
              className="p-2.5 bg-surface border border-border rounded-xl text-text-muted hover:text-secondary hover:border-secondary/30 transition-all shadow-sm"
              title="Refresh from Database"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="relative group flex-1 sm:flex-none">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search policies..." 
                value={searchTerm}
                onChange={handleSearch}
                className="bg-surface border border-border rounded-xl pl-11 pr-4 py-2.5 text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
              />
            </div>
          </div>
          {role === 'admin' && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-sm shadow-primary/20"
            >
              <Plus size={18} />
              Add Policy
            </motion.button>
          )}
        </div>
      </header>

      {/* Policies Table Card */}
      <div className="card overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-surface/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-lg border border-border animate-bounce">
              <Database size={16} className="text-primary animate-pulse" />
              <span className="text-xs font-black text-text-main uppercase tracking-widest">Validating Coverage...</span>
            </div>
          </div>
        )}
        <div className="table-container border-none rounded-none">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Policy & Provider</th>
                <th>Vehicle Coverage</th>
                <th>Validity & Premium</th>
                <th>Status</th>
                {role === 'admin' && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="relative">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-10 w-40 skeleton" /></td>
                    <td className="px-6 py-4"><div className="h-10 w-32 skeleton" /></td>
                    <td className="px-6 py-4"><div className="h-10 w-40 skeleton" /></td>
                    <td className="px-6 py-4"><div className="h-10 w-24 skeleton" /></td>
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
                      <h3 className="font-bold text-text-main">Database Sync Error</h3>
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
              ) : insurance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <ShieldCheck size={48} className="text-text-muted" />
                      <p className="text-sm font-bold text-text-muted uppercase tracking-widest">No insurance policies found in database.</p>
                      {role === 'admin' && (
                        <button 
                          onClick={() => { resetForm(); setIsModalOpen(true); }}
                          className="mt-2 bg-background border border-border px-4 py-2 rounded-lg text-xs font-bold text-text-main hover:bg-surface transition-colors"
                        >
                          Register Coverage
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                insurance.map((policy) => {
                  const status = getPolicyStatus(policy.expiry_date);
                  return (
                    <tr key={policy.insurance_id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold ${
                            status.label === 'Active' ? 'bg-success/10 border-success/20 text-success' : 
                            status.label === 'Expired' ? 'bg-error/10 border-error/20 text-error' : 
                            'bg-warning/10 border-warning/20 text-warning'
                          }`}>
                            <Briefcase size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-text-main tracking-tighter uppercase">{policy.policy_number}</p>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{policy.provider_name}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-text-main">{policy.manufacturer} {policy.model_name}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase">
                            <Database size={10} />
                            <span>{policy.registration_no || 'Pending Plate'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-2 font-bold text-text-main">
                            <Calendar size={12} className="text-secondary" />
                            <span>Expires: {new Date(policy.expiry_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 font-semibold text-text-muted">
                            <DollarSign size={12} className="text-success" />
                            <span>Premium: ₹{policy.premium_amount || '0'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${status.badgeClass} flex items-center gap-1.5 w-fit`}>
                          <status.icon size={12} />
                          {status.label}
                        </span>
                      </td>
                      {role === 'admin' && (
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setCurrentPolicy(policy);
                                setFormData({
                                  vehicle_id: policy.vehicle_id,
                                  provider_name: policy.provider_name,
                                  policy_number: policy.policy_number,
                                  start_date: policy.start_date,
                                  expiry_date: policy.expiry_date,
                                  premium_amount: policy.premium_amount || ''
                                });
                                setIsModalOpen(true);
                              }}
                              className="p-2 hover:bg-primary/10 text-text-muted hover:text-primary rounded-lg transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(policy.insurance_id)}
                              className="p-2 hover:bg-error/10 text-text-muted hover:text-error rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-text-main/20 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }} 
              className="bg-surface w-full max-w-xl relative z-[101] rounded-2xl shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-6 border-b border-border bg-surface-dim flex justify-between items-center">
                <h2 className="text-xl font-black text-text-main tracking-tight">{currentPolicy ? 'Update Policy' : 'New Policy Entry'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-background rounded-full text-text-muted transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted ml-1">Select Covered Vehicle *</label>
                  <select 
                    disabled={!!currentPolicy} 
                    required 
                    value={formData.vehicle_id} 
                    onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})} 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="">Choose vehicle for coverage</option>
                    {vehicles.map(v => (
                      <option key={v.vehicle_id} value={v.vehicle_id}>{v.manufacturer} {v.model_name} (VIN: {v.chassis_number})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted ml-1">Policy Number *</label>
                    <input required type="text" value={formData.policy_number} onChange={(e) => setFormData({...formData, policy_number: e.target.value})} placeholder="POL-XXXXXX" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted ml-1">Insurance Provider *</label>
                    <input required type="text" value={formData.provider_name} onChange={(e) => setFormData({...formData, provider_name: e.target.value})} placeholder="Carrier Name" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted ml-1 text-center block">Coverage Start</label>
                    <input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted ml-1 text-center block">Coverage End</label>
                    <input type="date" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted ml-1">Annual Premium (₹)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-success" />
                    <input type="number" value={formData.premium_amount} onChange={(e) => setFormData({...formData, premium_amount: e.target.value})} placeholder="Amount in INR" className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-text-muted hover:bg-background transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex-[2] bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
                    {currentPolicy ? 'Update Coverage' : 'Register Coverage'}
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

export default InsuranceManagement;
