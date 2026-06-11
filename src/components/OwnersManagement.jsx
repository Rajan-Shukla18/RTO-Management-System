import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  User,
  Phone,
  Mail,
  CreditCard,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OwnersManagement = () => {
  const { role, userId } = useAuth();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOwner, setCurrentOwner] = useState(null);
  const [lastSynced, setLastSynced] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'Male',
    mobile_no: '',
    email: '',
    aadhar_no: '',
    permanent_address: ''
  });

  useEffect(() => {
    fetchOwners();
  }, [role, userId]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOwners = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const [response] = await Promise.all([
        fetch(`http://localhost:5100/api/owners${query ? `?search=${query}` : ''}`, {
          headers: {
            'x-user-role': role,
            'x-user-id': userId.toString()
          }
        }),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      if (!response.ok) throw new Error('Database connection failed');
      const data = await response.json();
      setOwners(data);
      setLastSynced(new Date());
      if (query === 'REFRESH') showToast('Data refreshed from database');
    } catch (error) {
      console.error('Error fetching owners:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchOwners('REFRESH');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (searchTerm === '') return;
    const timeoutId = setTimeout(() => {
      fetchOwners(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = currentOwner 
      ? `http://localhost:5100/api/owners/${currentOwner.owner_id}`
      : 'http://localhost:5100/api/owners';
    const method = currentOwner ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIsModalOpen(false);
        setFormData({
          full_name: '', date_of_birth: '', gender: 'Male',
          mobile_no: '', email: '', aadhar_no: '', permanent_address: ''
        });
        setCurrentOwner(null);
        showToast(currentOwner ? 'Profile updated in database' : 'Owner registered in database');
        fetchOwners(searchTerm);
      }
    } catch (error) {
      console.error('Error saving owner:', error);
      showToast('Error saving to database');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this owner record?')) {
      try {
        const response = await fetch(`http://localhost:5100/api/owners/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          showToast('Record removed from database');
          fetchOwners(searchTerm);
        }
      } catch (error) {
        console.error('Error deleting owner:', error);
        showToast('Error deleting from database');
      }
    }
  };

  const openEditModal = (owner) => {
    setCurrentOwner(owner);
    setFormData({
      full_name: owner.full_name,
      date_of_birth: owner.date_of_birth || '',
      gender: owner.gender || 'Male',
      mobile_no: owner.mobile_no,
      email: owner.email || '',
      aadhar_no: owner.aadhar_no,
      permanent_address: owner.permanent_address || ''
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
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight">Owner Management</h1>
            <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg border border-primary/20 uppercase tracking-wider">
              {loading ? '...' : owners.length} Records
            </span>
          </div>
          <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
            Register and manage regional vehicle owner profiles.
            <span className="w-1 h-1 bg-border rounded-full" />
            <span className="text-[10px] text-text-light uppercase font-bold">Last Sync: {lastSynced.toLocaleTimeString()}</span>
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
                placeholder="Search registry..." 
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
              onClick={() => { setCurrentOwner(null); setIsModalOpen(true); }}
              className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-sm shadow-primary/20"
            >
              <Plus size={18} />
              Add New Owner
            </motion.button>
          )}
        </div>
      </header>

      {/* Owners Table Card */}
      <div className="card overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-surface/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-lg border border-border animate-bounce">
              <Database size={16} className="text-primary animate-pulse" />
              <span className="text-xs font-black text-text-main uppercase tracking-widest">Accessing Registry...</span>
            </div>
          </div>
        )}
        <div className="table-container border-none rounded-none">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Owner Profile</th>
                <th>Contact Details</th>
                <th>Identification</th>
                <th>Registered</th>
                {role === 'admin' && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="relative">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-10 w-40 skeleton" /></td>
                    <td className="px-6 py-4"><div className="h-10 w-32 skeleton" /></td>
                    <td className="px-6 py-4"><div className="h-10 w-24 skeleton" /></td>
                    <td className="px-6 py-4"><div className="h-10 w-20 skeleton" /></td>
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
                      <h3 className="font-bold text-text-main">Database Connection Error</h3>
                      <p className="text-sm text-text-muted max-w-xs mx-auto">{error}</p>
                      <button 
                        onClick={handleRefresh}
                        className="mt-2 text-primary font-bold text-sm flex items-center gap-2 hover:underline"
                      >
                        <RefreshCw size={14} /> Retry Connection
                      </button>
                    </div>
                  </td>
                </tr>
              ) : owners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Users size={48} className="text-text-muted" />
                      <p className="text-sm font-bold text-text-muted uppercase tracking-widest">No owner records found in database.</p>
                      {role === 'admin' && (
                        <button 
                          onClick={() => { setCurrentOwner(null); setIsModalOpen(true); }}
                          className="mt-2 bg-background border border-border px-4 py-2 rounded-lg text-xs font-bold text-text-main hover:bg-surface transition-colors"
                        >
                          Add Your First Owner
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                owners.map((owner) => (
                  <tr key={owner.owner_id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 font-bold">
                          {owner.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main">{owner.full_name}</p>
                          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{owner.gender} • {owner.date_of_birth || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-text-main">
                          <Phone size={12} className="text-primary" />
                          <span>{owner.mobile_no}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <Mail size={12} className="text-secondary" />
                          <span>{owner.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-background rounded-lg text-text-muted border border-border">
                          <CreditCard size={14} />
                        </div>
                        <span className="text-xs font-mono font-bold tracking-wider text-text-main">{owner.aadhar_no}</span>
                      </div>
                    </td>
                    <td>
                      <p className="text-xs font-semibold text-text-muted">
                        {new Date(owner.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    {role === 'admin' && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(owner)}
                            className="p-2 hover:bg-primary/10 text-text-muted hover:text-primary rounded-lg transition-colors"
                            title="Edit Profile"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(owner.owner_id)}
                            className="p-2 hover:bg-error/10 text-text-muted hover:text-error rounded-lg transition-colors"
                            title="Delete Record"
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

      {/* Modern Modal */}
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
              className="bg-surface w-full max-w-2xl relative z-[101] rounded-2xl shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-surface-dim">
                <div>
                  <h2 className="text-xl font-black text-text-main tracking-tight">{currentOwner ? 'Edit Owner Profile' : 'Register New Owner'}</h2>
                  <p className="text-xs font-medium text-text-muted mt-1 uppercase tracking-widest">Entry ID: {currentOwner?.owner_id || 'NEW_ENTRY'}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-background rounded-full text-text-muted transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Info */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-6 h-[2px] bg-primary/20 rounded-full" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted ml-1">Full Legal Name *</label>
                        <input 
                          required
                          type="text" 
                          value={formData.full_name}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          placeholder="John Doe"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted ml-1">Aadhaar Number *</label>
                        <input 
                          required
                          type="text" 
                          value={formData.aadhar_no}
                          onChange={(e) => setFormData({...formData, aadhar_no: e.target.value})}
                          placeholder="0000 0000 0000"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted ml-1">Date of Birth</label>
                        <input 
                          type="date" 
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted ml-1">Gender Identity</label>
                        <select 
                          value={formData.gender}
                          onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-6 h-[2px] bg-secondary/20 rounded-full" />
                      Contact Channels
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted ml-1">Primary Mobile *</label>
                        <input 
                          required
                          type="tel" 
                          value={formData.mobile_no}
                          onChange={(e) => setFormData({...formData, mobile_no: e.target.value})}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted ml-1">Email Address</label>
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="name@example.com"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-6 h-[2px] bg-border rounded-full" />
                      Residential Address
                    </h3>
                    <div className="space-y-1.5">
                      <textarea 
                        value={formData.permanent_address}
                        onChange={(e) => setFormData({...formData, permanent_address: e.target.value})}
                        placeholder="Enter full permanent residence details..."
                        rows="3"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 sticky bottom-0 bg-surface">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-text-muted hover:bg-background transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                  >
                    {currentOwner ? 'Update Profile' : 'Register Profile'}
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

export default OwnersManagement;
