import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  FileCheck, 
  ShieldCheck, 
  BadgeCheck, 
  Building2, 
  Bell, 
  LifeBuoy, 
  LogOut,
  ChevronRight,
  Activity
} from 'lucide-react';
import Logo from './Logo';

import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { role, logout } = useAuth();

  const navItems = role === 'admin' 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'owners', label: 'Owners', icon: Users },
        { id: 'vehicles', label: 'Vehicles', icon: Car },
        { id: 'registrations', label: 'Registrations', icon: FileCheck },
        { id: 'insurance', label: 'Insurance', icon: ShieldCheck },
        { id: 'licenses', label: 'Driving Licenses', icon: BadgeCheck },
        { id: 'offices', label: 'RTO Offices', icon: Building2 },
        { id: 'alerts', label: 'Compliance Center', icon: Bell },
        { id: 'activities', label: 'Activity Center', icon: Activity },
      ]
    : [
        { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
        { id: 'vehicles', label: 'My Vehicles', icon: Car },
        { id: 'insurance', label: 'My Insurance', icon: ShieldCheck },
        { id: 'licenses', label: 'My License', icon: BadgeCheck },
        { id: 'alerts', label: 'My Alerts', icon: Bell },
      ];
  return (
    <aside className="h-full w-[260px] flex flex-col bg-surface border-r border-border py-6">
      {/* Original Logo Restored */}
      <div className="px-6 mb-8">
        <Logo size="small" />
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3">
        <p className="text-[10px] font-bold text-text-light uppercase tracking-widest px-4 mb-3">
          Main Menu
        </p>
        
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            whileTap={{ scale: 0.97 }}
            className={`
              group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
              ${activeTab === item.id 
                ? 'bg-primary-light text-primary font-semibold' 
                : 'text-text-muted hover:bg-background hover:text-text-main'
              }
            `}
          >
            <item.icon 
              size={18} 
              className={activeTab === item.id ? 'text-primary' : 'text-text-light group-hover:text-text-muted'} 
            />
            <span className="text-[14px]">
              {item.label}
            </span>
            {activeTab === item.id && (
              <ChevronRight size={14} className="ml-auto opacity-50" />
            )}
          </motion.button>
        ))}
      </nav>

      <div className="mt-auto px-4 pt-6 border-t border-border flex flex-col gap-1">
        <button 
          onClick={() => setActiveTab('support')}
          className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'support'
              ? 'bg-primary-light text-primary font-semibold'
              : 'text-text-muted hover:text-text-main hover:bg-background'
          }`}
        >
          <LifeBuoy size={18} className={activeTab === 'support' ? 'text-primary' : 'text-text-light group-hover:text-text-muted'} />
          <span className="text-[14px]">Support</span>
        </button>
        <button 
          onClick={logout}
          className="group flex items-center gap-3 px-4 py-2.5 text-error/80 hover:text-error hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={18} className="opacity-70 group-hover:opacity-100" />
          <span className="text-[14px]">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
