import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { vehicles } from '../data/mockData';

const VehiclesRegistry = () => {
  return (
    <div style={{ padding: 'var(--container-padding)' }}>
      <header style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '4px' }}>Vehicles Registry</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>Manage and monitor all registered vehicles in the system.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="glass" style={{ 
            padding: '8px 16px', 
            borderRadius: 'var(--radius-base)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '14px',
            color: 'var(--on-surface)'
          }}>
            <Download size={16} /> Export
          </button>
          <button style={{ 
            backgroundColor: 'var(--primary)', 
            color: 'var(--on-primary)', 
            padding: '8px 16px', 
            borderRadius: 'var(--radius-base)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <Plus size={16} /> Register Vehicle
          </button>
        </div>
      </header>

      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid var(--outline-variant)', 
          display: 'flex', 
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div className="glass" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-base)',
            flex: 1
          }}>
            <Search size={16} color="var(--on-surface-variant)" />
            <input 
              type="text" 
              placeholder="Filter by plate, owner, or VIN..." 
              style={{ background: 'transparent', border: 'none', padding: 0, width: '100%', fontSize: '13px' }} 
            />
          </div>
          <button className="glass" style={{ padding: '6px 12px', borderRadius: 'var(--radius-base)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <Filter size={16} /> Filters
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: 'var(--surface-container-low)', borderBottom: '1px solid var(--outline-variant)' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: '500' }}>PLATE NUMBER</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: '500' }}>OWNER</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: '500' }}>TYPE</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: '500' }}>CATEGORY</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: '500' }}>FUEL</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: '500' }}>EXPIRY</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: '500' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v, idx) => (
              <motion.tr 
                key={v.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                style={{ borderBottom: '1px solid var(--outline-variant)' }}
              >
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500', fontFamily: 'var(--font-mono)' }}>{v.plate}</td>
                <td style={{ padding: '16px', fontSize: '14px' }}>{v.owner}</td>
                <td style={{ padding: '16px', fontSize: '13px', color: 'var(--on-surface-variant)' }}>{v.type}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: 'var(--surface-container-high)', borderRadius: '4px', border: '1px solid var(--outline-variant)' }}>
                    {v.category}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '13px' }}>{v.fuel}</td>
                <td style={{ padding: '16px', fontSize: '13px', color: v.expiry < '2030' ? '#fc7c78' : 'var(--on-surface-variant)' }}>{v.expiry}</td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button style={{ color: 'var(--on-surface-variant)', hover: { color: 'var(--primary)' } }}>
                      <Eye size={18} />
                    </button>
                    <button style={{ color: 'var(--on-surface-variant)' }}>
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>Showing 1-10 of 1,240 vehicles</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="glass" style={{ padding: '4px', borderRadius: '4px' }} disabled><ChevronLeft size={18} /></button>
            <button className="glass" style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '13px', backgroundColor: 'var(--primary)', color: 'var(--on-primary)', border: 'none' }}>1</button>
            <button className="glass" style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '13px' }}>2</button>
            <button className="glass" style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '13px' }}>3</button>
            <button className="glass" style={{ padding: '4px', borderRadius: '4px' }}><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiclesRegistry;
