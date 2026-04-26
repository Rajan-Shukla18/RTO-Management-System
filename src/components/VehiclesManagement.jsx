import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Info,
  User,
  Settings,
  Fuel,
  Hash,
  Database,
  RefreshCw,
  AlertTriangle,
  Palette
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VehiclesManagement = () => {
  const { role, userId } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [lastSynced, setLastSynced] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    owner_id: '',
    chassis_number: '',
    engine_number: '',
    manufacturer: '',
    model_name: '',
    vehicle_type: 'Four Wheeler',
    fuel_type: 'Petrol',
    color: '',
    manufacturing_year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchVehicles();
    fetchOwners();
  }, [role, userId]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVehicles = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const [response] = await Promise.all([
        fetch(`http://localhost:5000/api/vehicles${query ? `?search=${query}` : ''}`, {
          headers: {
            'x-user-role': role,
            'x-user-id': userId.toString()
          }
        }),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      if (!response.ok) throw new Error('Inventory sync failed');
      const data = await response.json();
      setVehicles(data);
      setLastSynced(new Date());
      if (query === 'REFRESH') showToast('Vehicle records refreshed');
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchVehicles('REFRESH');

  const fetchOwners = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/owners');
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
      fetchVehicles(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = currentVehicle 
      ? `http://localhost:5000/api/vehicles/${currentVehicle.vehicle_id}`
      : 'http://localhost:5000/api/vehicles';
    const method = currentVehicle ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIsModalOpen(false);
        resetForm();
        fetchVehicles(searchTerm);
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      owner_id: '', chassis_number: '', engine_number: '',
      manufacturer: '', model_name: '', vehicle_type: 'Four Wheeler',
      fuel_type: 'Petrol', color: '', manufacturing_year: new Date().getFullYear()
    });
    setCurrentVehicle(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle record?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/vehicles/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) fetchVehicles(searchTerm);
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const openEditModal = (vehicle) => {
    setCurrentVehicle(vehicle);
    setFormData({
      owner_id: vehicle.owner_id || '',
      chassis_number: vehicle.chassis_number,
      engine_number: vehicle.engine_number || '',
      manufacturer: vehicle.manufacturer,
      model_name: vehicle.model_name,
      vehicle_type: vehicle.vehicle_type || 'Four Wheeler',
      fuel_type: vehicle.fuel_type || 'Petrol',
      color: vehicle.color || '',
      manufacturing_year: vehicle.manufacturing_year
    });
    setIsModalOpen(true);
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
              {role === 'admin' ? 'Vehicle Management' : 'My Vehicles'}
            </h1>
            <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-lg border border-secondary/20 uppercase tracking-wider">
              {loading ? '...' : vehicles.length} Records
            </span>
          </div>
          <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
            {role === 'admin' ? 'Inventory of all regional vehicles and technical specifications.' : 'View your personal registered vehicles and technical details.'}
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
                placeholder="Search chassis, engine..." 
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
              Register Vehicle
            </motion.button>
          )}
        </div>
      </header>

      {/* Vehicles Table Card */}
      <div className="card overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-surface/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-lg border border-border animate-bounce">
              <Database size={16} className="text-secondary animate-pulse" />
              <span className="text-xs font-black text-text-main uppercase tracking-widest">Scanning Inventory...</span>
            </div>
          </div>
        )}
        <div className="table-container border-none rounded-none">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Vehicle Model</th>
                <th>Ownership</th>
                <th>Technical Specs</th>
                <th>Identification</th>
                {role === 'admin' && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="relative">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-10 w-48 skeleton" /></td>
                    <td className="px-6 py-4"><div className="h-10 w-32 skeleton" /></td>
                    <td className="px-6 py-4"><div className="h-10 w-32 skeleton" /></td>
                    <td className="px-6 py-4"><div className="h-10 w-32 skeleton" /></td>
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
                      <h3 className="font-bold text-text-main">Database Connectivity Error</h3>
                      <p className="text-sm text-text-muted">{error}</p>
                      <button 
                        onClick={handleRefresh}
                        className="mt-2 text-primary font-bold text-sm flex items-center gap-2 hover:underline"
                      >
                        <RefreshCw size={14} /> Retry Connection
                      </button>
                    </div>
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Car size={48} className="text-text-muted" />
                      <p className="text-sm font-bold text-text-muted uppercase tracking-widest">No vehicles found in database.</p>
                      {role === 'admin' && (
                        <button 
                          onClick={() => { resetForm(); setIsModalOpen(true); }}
                          className="mt-2 bg-background border border-border px-4 py-2 rounded-lg text-xs font-bold text-text-main hover:bg-surface transition-colors"
                        >
                          Register First Vehicle
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.vehicle_id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-secondary border border-secondary/20">
                          <Car size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main">{vehicle.manufacturer} {vehicle.model_name}</p>
                          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{vehicle.vehicle_type} • {vehicle.manufacturing_year}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {vehicle.owner_name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm font-medium text-text-main">{vehicle.owner_name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Fuel size={12} className="text-secondary" />
                          <span className="text-xs font-semibold text-text-muted">{vehicle.fuel_type}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Palette size={12} className="text-secondary" />
                          <span className="text-xs font-semibold text-text-muted">{vehicle.color}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-text-light uppercase tracking-widest">Chassis</p>
                        <p className="text-xs font-mono font-bold text-text-main bg-background px-2 py-0.5 rounded border border-border inline-block">
                          {vehicle.chassis_number}
                        </p>
                      </div>
                    </td>
                    {role === 'admin' && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(vehicle)}
                            className="p-2 hover:bg-primary/10 text-text-muted hover:text-primary rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(vehicle.vehicle_id)}
                            className="p-2 hover:bg-error/10 text-text-muted hover:text-error rounded-lg transition-colors"
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

      {/* Vehicle Modal */}
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
                  <h2 className="text-xl font-black text-text-main tracking-tight">{currentVehicle ? 'Update Vehicle Details' : 'Register New Vehicle'}</h2>
                  <p className="text-xs font-medium text-text-muted mt-1 uppercase tracking-widest">Engine ID: {formData.engine_number || 'PENDING'}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-background rounded-full text-text-muted transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-6 h-[2px] bg-primary/20 rounded-full" />
                      Ownership & Type
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted ml-1">Vehicle Owner *</label>
                        <select 
                          required
                          value={formData.owner_id}
                          onChange={(e) => setFormData({...formData, owner_id: e.target.value})}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                          <option value="">Select Registered Owner</option>
                          {owners.map(owner => (
                            <option key={owner.owner_id} value={owner.owner_id}>{owner.full_name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted ml-1">Vehicle Category</label>
                        <select 
                          value={formData.vehicle_type}
                          onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                          <option>Two Wheeler</option>
                          <option>Three Wheeler</option>
                          <option>Four Wheeler</option>
                          <option>Heavy Vehicle</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Technical Specs */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-6 h-[2px] bg-secondary/20 rounded-full" />
                      Technical Specifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted ml-1">Manufacturer *</label>
                        <input 
                          required
                          type="text" 
                          value={formData.manufacturer}
                          onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                          placeholder="e.g. Tesla, Toyota"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted ml-1">Model Name *</label>
                        <input 
                          required
                          type="text" 
                          value={formData.model_name}
                          onChange={(e) => setFormData({...formData, model_name: e.target.value})}
                          placeholder="e.g. Model 3, Camry"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted ml-1">Fuel Type</label>
                        <select 
                          value={formData.fuel_type}
                          onChange={(e) => setFormData({...formData, fuel_type: e.target.value})}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                          <option>Petrol</option>
                          <option>Diesel</option>
                          <option>Electric</option>
                          <option>Hybrid</option>
                          <option>CNG</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted ml-1">Manufacturing Year</label>
                        <input 
                          type="number" 
                          value={formData.manufacturing_year}
                          onChange={(e) => setFormData({...formData, manufacturing_year: e.target.value})}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Identification */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-6 h-[2px] bg-border rounded-full" />
                      Registry Identification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted ml-1">Chassis Number *</label>
                        <input 
                          required
                          type="text" 
                          value={formData.chassis_number}
                          onChange={(e) => setFormData({...formData, chassis_number: e.target.value})}
                          placeholder="VIN Number"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted ml-1">Engine Number *</label>
                        <input 
                          required
                          type="text" 
                          value={formData.engine_number}
                          onChange={(e) => setFormData({...formData, engine_number: e.target.value})}
                          placeholder="Engine Series"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
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
                    {currentVehicle ? 'Save Technical Update' : 'Register Vehicle'}
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

export default VehiclesManagement;
