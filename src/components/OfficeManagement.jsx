import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  MapPin,
  Phone,
  Building,
  ShieldCheck,
  RefreshCw,
  Database,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OfficeManagement = () => {
  const { role } = useAuth();
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOffice, setCurrentOffice] = useState(null);
  const [lastSynced, setLastSynced] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    office_code: '',
    office_name: '',
    city: '',
    address: '',
    contact_no: '',
    jurisdiction_area: ''
  });

  useEffect(() => {
    fetchOffices();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOffices = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const [response] = await Promise.all([
        fetch(`http://localhost:5100/api/offices${query ? `?search=${query}` : ''}`),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      if (!response.ok) throw new Error('Database connection failed');
      const data = await response.json();
      setOffices(data);
      setLastSynced(new Date());
      if (query === 'REFRESH') showToast('Offices synchronized');
    } catch (error) {
      console.error('Error fetching offices:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchOffices('REFRESH');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOffices(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = currentOffice 
      ? `http://localhost:5100/api/offices/${currentOffice.office_id}`
      : 'http://localhost:5100/api/offices';
    const method = currentOffice ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIsModalOpen(false);
        resetForm();
        fetchOffices(searchTerm);
      }
    } catch (error) {
      console.error('Error saving office:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      office_code: '', office_name: '', city: '',
      address: '', contact_no: '', jurisdiction_area: ''
    });
    setCurrentOffice(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this RTO office from the regional network?')) {
      try {
        const response = await fetch(`http://localhost:5100/api/offices/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) fetchOffices(searchTerm);
      } catch (error) {
        console.error('Error deleting office:', error);
      }
    }
  };

  const openEditModal = (office) => {
    setCurrentOffice(office);
    setFormData({
      office_code: office.office_code,
      office_name: office.office_name,
      city: office.city,
      address: office.address || '',
      contact_no: office.contact_no || '',
      jurisdiction_area: office.jurisdiction_area || ''
    });
    setIsModalOpen(true);
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
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight">Regional Offices</h1>
            <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg border border-primary/20 uppercase tracking-wider">
              {loading ? '...' : offices.length} Records
            </span>
          </div>
          <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
            Network management and jurisdictional authority control.
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
                placeholder="Search code or city..." 
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
              Establish Office
            </motion.button>
          )}
        </div>
      </header>

      {/* Office Cards Grid */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-surface/40 backdrop-blur-[1px] z-10 flex items-center justify-center min-h-[300px]">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-lg border border-border animate-bounce">
              <Database size={16} className="text-primary animate-pulse" />
              <span className="text-xs font-black text-text-main uppercase tracking-widest">Mapping RTO Network...</span>
            </div>
          </div>
        )}
        {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-64 skeleton" />
          ))}
        </div>
      ) : error ? (
        <div className="card flex flex-col items-center justify-center py-20 gap-4">
          <div className="p-4 bg-error/10 text-error rounded-full">
            <AlertTriangle size={48} />
          </div>
          <h3 className="font-bold text-text-main">Database Sync Error</h3>
          <p className="text-sm text-text-muted">{error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20"
          >
            Retry Connection
          </button>
        </div>
      ) : offices.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 gap-4 opacity-40 border-dashed">
          <Building size={64} className="text-text-muted" />
          <p className="text-sm font-bold text-text-muted uppercase tracking-widest text-center px-6">No regional offices found in database registry.</p>
          {role === 'admin' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-2 bg-background border border-border px-4 py-2 rounded-lg text-xs font-bold text-text-main hover:bg-surface transition-colors"
            >
              Establish First Office
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {offices.map((office) => (
            <motion.div 
              key={office.office_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card group hover:border-primary/40 transition-all overflow-hidden p-0"
            >
              <div className="p-5 border-b border-border bg-surface-dim flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-text-main tracking-tight">{office.office_name}</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">{office.office_code}</p>
                  </div>
                </div>
                {role === 'admin' && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(office)} className="p-2 hover:bg-background rounded-lg text-text-muted hover:text-primary transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(office.office_id)} className="p-2 hover:bg-error/10 rounded-lg text-text-muted hover:text-error transition-colors"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-xs font-semibold text-text-main">
                    <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>{office.address || office.city}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-text-muted">
                    <Phone size={14} className="text-secondary shrink-0" />
                    <span>{office.contact_no || 'Admin line unlisted'}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-text-light uppercase tracking-widest">Jurisdiction</span>
                    <span className="text-[10px] font-bold bg-background text-text-main px-2 py-1 rounded border border-border uppercase">{office.city}</span>
                  </div>
                  <p className="text-xs font-medium text-text-muted leading-relaxed">
                    {office.jurisdiction_area || 'Standard municipal and regional boundaries apply.'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      </div>

      {/* Modern Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-text-main/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-surface w-full max-w-2xl relative z-[101] rounded-2xl shadow-2xl overflow-hidden border border-border">
              <div className="p-6 border-b border-border bg-surface-dim flex justify-between items-center">
                <h2 className="text-xl font-black text-text-main tracking-tight">{currentOffice ? 'Update Office Location' : 'Register New Regional Office'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-background rounded-full text-text-muted transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted ml-1">Office Code (MH-XX) *</label>
                    <input required type="text" value={formData.office_code} onChange={(e) => setFormData({...formData, office_code: e.target.value})} placeholder="e.g. MH-12" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-black uppercase tracking-widest text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted ml-1">Authority Name *</label>
                    <input required type="text" value={formData.office_name} onChange={(e) => setFormData({...formData, office_name: e.target.value})} placeholder="Regional Transport Office" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted ml-1">Primary City *</label>
                    <input required type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="e.g. Pune" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted ml-1">Administrative Contact</label>
                    <input type="tel" value={formData.contact_no} onChange={(e) => setFormData({...formData, contact_no: e.target.value})} placeholder="+91 XXXXX XXXXX" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-text-muted ml-1">Physical Address</label>
                    <textarea rows="2" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Full location details..." className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-text-muted ml-1">Jurisdictional Coverage</label>
                    <textarea rows="2" value={formData.jurisdiction_area} onChange={(e) => setFormData({...formData, jurisdiction_area: e.target.value})} placeholder="List municipalities or pincodes covered by this branch" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
                  </div>
                </div>
                <div className="pt-4 flex gap-3 sticky bottom-0 bg-surface">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-text-muted hover:bg-background transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex-[2] bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2">
                    <ShieldCheck size={18} />
                    {currentOffice ? 'Update Office Profile' : 'Establish RTO Authority'}
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

export default OfficeManagement;
