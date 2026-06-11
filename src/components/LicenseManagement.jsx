import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BadgeCheck, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  User,
  Calendar,
  Building2,
  AlertCircle,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LicenseManagement = () => {
  const { role, userId } = useAuth();
  const [licenses, setLicenses] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLicense, setCurrentLicense] = useState(null);
  const [lastSynced, setLastSynced] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    owner_id: '',
    license_number: '',
    license_type: 'LMV',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 20)).toISOString().split('T')[0],
    issuing_rto: ''
  });

  const licenseTypes = ['MCWG', 'MCWOG', 'LMV', 'HMV', 'Transport', 'LDRX'];

  useEffect(() => {
    fetchLicenses();
    fetchOwners();
  }, [role, userId]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLicenses = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const [response] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5100'}`}/api/licenses${query ? `?search=${query}` : ''}`, {
          headers: {
            'x-user-role': role,
            'x-user-id': userId.toString()
          }
        }),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      if (!response.ok) throw new Error('Database sync failed');
      const data = await response.json();
      setLicenses(data);
      setLastSynced(new Date());
      if (query === 'REFRESH') showToast('License database synchronized');
    } catch (error) {
      console.error('Error fetching licenses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchLicenses('REFRESH');

  const fetchOwners = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5100'}/api/owners`, {
        headers: {
          'x-user-role': role,
          'x-user-id': userId.toString()
        }
      });
      const data = await response.json();
      setOwners(data);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLicenses(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = currentLicense 
      ? `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5100'}`}/api/licenses/${currentLicense.license_id}`
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5100'}/api/licenses`;
    const method = currentLicense ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIsModalOpen(false);
        resetForm();
        fetchLicenses(searchTerm);
      }
    } catch (error) {
      console.error('Error saving license:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      owner_id: '', license_number: '', license_type: 'LMV',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 20)).toISOString().split('T')[0],
      issuing_rto: ''
    });
    setCurrentLicense(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this license record?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5100'}`}/api/licenses/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) fetchLicenses(searchTerm);
      } catch (error) {
        console.error('Error deleting license:', error);
      }
    }
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - today;
    if (diff < 0) return { label: 'Expired', badgeClass: 'badge-error' };
    if (diff < 1000 * 60 * 60 * 24 * 365) return { label: 'Expiring Soon', badgeClass: 'badge-warning' };
    return { label: 'Valid', badgeClass: 'badge-success' };
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
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight">
              {role === 'admin' ? 'Operator Certification' : 'My License'}
            </h1>
            <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg border border-primary/20 uppercase tracking-wider">
              {loading ? '...' : licenses.length} Records
            </span>
          </div>
          <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
            {role === 'admin' ? 'Regional driving license registry and validity tracking.' : 'View your personal driving license details and validity.'}
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
                placeholder="Search license ID..." 
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
              Issue License
            </motion.button>
          )}
        </div>
      </header>

      {/* Licenses Table Card */}
      <div className="card overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-surface/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-lg border border-border animate-bounce">
              <Database size={16} className="text-primary animate-pulse" />
              <span className="text-xs font-black text-text-main uppercase tracking-widest">Checking Certifications...</span>
            </div>
          </div>
        )}
        <div className="table-container border-none rounded-none">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>License Profile</th>
                <th>Operator Details</th>
                <th>Issuance Authority</th>
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
              ) : licenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <BadgeCheck size={48} className="text-text-muted" />
                      <p className="text-sm font-bold text-text-muted uppercase tracking-widest">No licenses found in database.</p>
                      {role === 'admin' && (
                        <button 
                          onClick={() => { resetForm(); setIsModalOpen(true); }}
                          className="mt-2 bg-background border border-border px-4 py-2 rounded-lg text-xs font-bold text-text-main hover:bg-surface transition-colors"
                        >
                          Issue New License
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                licenses.map((lic) => {
                  const status = getExpiryStatus(lic.expiry_date);
                  return (
                    <tr key={lic.license_id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-text-main tracking-tight uppercase">{lic.license_number}</p>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-0.5">{lic.license_type}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-text-muted">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-main">{lic.owner_name}</p>
                            <p className="text-[10px] font-semibold text-text-muted">UID: {lic.aadhar_no}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-text-main">
                            <Building2 size={12} className="text-primary" />
                            <span>{lic.issuing_rto || 'Regional Center'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-text-muted opacity-70">
                            <Calendar size={12} />
                            <span>Issued: {new Date(lic.issue_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col items-start gap-1">
                          <span className={`badge ${status.badgeClass}`}>
                            {status.label}
                          </span>
                          <p className="text-[10px] font-bold text-text-muted ml-1">Exp: {new Date(lic.expiry_date).toLocaleDateString()}</p>
                        </div>
                      </td>
                      {role === 'admin' && (
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setCurrentLicense(lic);
                                setFormData({
                                  owner_id: lic.owner_id,
                                  license_number: lic.license_number,
                                  license_type: lic.license_type,
                                  issue_date: lic.issue_date,
                                  expiry_date: lic.expiry_date,
                                  issuing_rto: lic.issuing_rto || ''
                                });
                                setIsModalOpen(true);
                              }}
                              className="p-2 hover:bg-primary/10 text-text-muted hover:text-primary rounded-lg transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(lic.license_id)}
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

      {/* License Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-text-main/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-surface w-full max-w-2xl relative z-[101] rounded-2xl shadow-2xl overflow-hidden border border-border">
              <div className="p-6 border-b border-border bg-surface-dim flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary"><BadgeCheck size={24} /></div>
                  <h2 className="text-xl font-black text-text-main tracking-tight">{currentLicense ? 'Update License Certification' : 'Issue Professional License'}</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-background rounded-full text-text-muted transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-text-muted ml-1">Assigned Operator *</label>
                    <select disabled={!!currentLicense} required value={formData.owner_id} onChange={(e) => setFormData({...formData, owner_id: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                      <option value="">Select registered person from database</option>
                      {owners.map(o => (
                        <option key={o.owner_id} value={o.owner_id}>{o.full_name} — UID: {o.aadhar_no}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted ml-1">Official License Number *</label>
                    <input required type="text" value={formData.license_number} onChange={(e) => setFormData({...formData, license_number: e.target.value})} placeholder="DL-XXXXXXXXXXXX" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono tracking-[0.2em] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all uppercase" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted ml-1">License Category *</label>
                    <select required value={formData.license_type} onChange={(e) => setFormData({...formData, license_type: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                      {licenseTypes.map(type => <option key={type} value={type}>{type} — {type === 'LMV' ? 'Light Motor Vehicle' : type === 'HMV' ? 'Heavy Motor Vehicle' : 'Authorized Vehicle Class'}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-text-muted ml-1">Issuing Authority (RTO Office)</label>
                    <input type="text" value={formData.issuing_rto} onChange={(e) => setFormData({...formData, issuing_rto: e.target.value})} placeholder="Enter office branch name" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted ml-1 text-center block">Date of Issuance</label>
                    <input type="date" value={formData.issue_date} onChange={(e) => setFormData({...formData, issue_date: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted ml-1 text-center block">Certification Expiry</label>
                    <input type="date" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
                <div className="pt-4 flex gap-3 sticky bottom-0 bg-surface">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-text-muted hover:bg-background transition-colors">Discard</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex-[2] bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2">
                    <ShieldCheck size={18} />
                    {currentLicense ? 'Update Authorization' : 'Grant Authorization'}
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

export default LicenseManagement;
