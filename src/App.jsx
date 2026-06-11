import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, User } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VehiclesManagement from './components/VehiclesManagement';
import OwnersManagement from './components/OwnersManagement';
import RegistrationManagement from './components/RegistrationManagement';
import InsuranceManagement from './components/InsuranceManagement';
import LicenseManagement from './components/LicenseManagement';
import OfficeManagement from './components/OfficeManagement';
import AlertsManagement from './components/AlertsManagement';
import ActivityCenter from './components/ActivityCenter';
import GlobalSearch from './components/GlobalSearch';
import SplashScreen from './components/SplashScreen';
import VehicleProfile from './components/VehicleProfile';
import SupportCenter from './components/SupportCenter';
import Login from './components/auth/Login';
import { useAuth } from './context/AuthContext';

function App() {
  const { role, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (role === 'user' && ['owners', 'registrations', 'offices'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [role, activeTab]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-background text-text-main font-sans">
      {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar Container */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 transform 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          w-[260px]
        `}>
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setIsSidebarOpen(false);
            }} 
          />
        </div>
        
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Top Bar - Modern & Clean */}
          <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-surface border-b border-border sticky top-0 z-30">
            <div className="flex items-center gap-4 shrink-0">
              <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-background rounded-lg transition-colors">
                <Menu size={20} />
              </button>
              <h1 className="text-lg font-bold text-text-main capitalize">
                {role === 'admin' ? activeTab.replace('-', ' ') : `My ${activeTab.replace('-', ' ')}`}
              </h1>
            </div>
            <GlobalSearch setActiveTab={setActiveTab} />

            <div className="flex items-center gap-2 md:gap-6">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-success/5 border border-success/10 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <div className="flex flex-col -space-y-1">
                  <span className="text-[10px] font-black text-success uppercase tracking-widest">Live DB</span>
                  <span className="text-[9px] font-bold text-text-muted">Sync: Just Now</span>
                </div>
              </div>
              
              <button className="p-2 text-text-muted hover:text-text-main hover:bg-background rounded-lg transition-all relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-surface"></span>
              </button>
              <div className="h-8 w-[1px] bg-border mx-1"></div>
              
              <div className="flex items-center gap-3 pl-1">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold leading-none capitalize">{role === 'admin' ? 'Admin User' : 'Rajan Shukla'}</p>
                  <p className="text-[11px] text-text-muted mt-1 uppercase font-bold">{role === 'admin' ? 'RTO Officer' : 'Citizen'}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <User size={20} />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
      {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
      {activeTab === 'owners' && <OwnersManagement />}
      {activeTab === 'vehicles' && (
        <VehiclesManagement
          onSelectVehicle={(vehicle) => {
            setSelectedVehicle(vehicle);
            setActiveTab('vehicle-profile');
          }}
        />
      )}
      {activeTab === 'registrations' && <RegistrationManagement />}
      {activeTab === 'insurance' && <InsuranceManagement />}
      {activeTab === 'licenses' && <LicenseManagement />}
      {activeTab === 'offices' && <OfficeManagement />}
      {activeTab === 'alerts' && <AlertsManagement />}
      {activeTab === 'activities' && <ActivityCenter />}
      {activeTab === 'support' && <SupportCenter />}
      {activeTab === 'vehicle-profile' && selectedVehicle && (
        <VehicleProfile vehicle={selectedVehicle} onBack={() => setActiveTab('vehicles')} />
      )}
      {/* Fallback for undeveloped modules */}
                </motion.div>
              </AnimatePresence>
              
              {/* Fallback for undeveloped modules */}
              {!['dashboard', 'owners', 'vehicles', 'registrations', 'insurance', 'licenses', 'offices', 'alerts', 'activities'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center h-[50vh] text-text-muted">
                  <h2 className="text-xl font-semibold mb-2">Section Under Development</h2>
                  <p className="text-sm">We are working on bringing the {activeTab} module live.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
  );
}

export default App;
