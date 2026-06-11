import React, { useEffect, useState } from 'react';
import { X, Calendar, CheckCircle, AlertTriangle, Activity, User, Car, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * VehicleProfile – a clean SaaS‑style detail page.
 * Props:
 *   vehicle   – object from VehiclesManagement (must contain vehicle_id, manufacturer, model_name, etc.)
 *   onBack    – callback to return to the list view.
 */
export default function VehicleProfile({ vehicle, onBack }) {
  const { role } = useAuth();
  const [owner, setOwner] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [insurance, setInsurance] = useState(null);
  const [license, setLicense] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to format dates
  const fmt = (date) => (date ? new Date(date).toLocaleDateString() : '—');

  // Determine if a date is past due
  const isExpired = (date) => date && new Date(date) < new Date();

  useEffect(() => {
    async function fetchDetails() {
      try {
        // Owner – vehicle has owner_id
        if (vehicle.owner_id) {
          const res = await fetch(`http://localhost:5100/api/owners/${vehicle.owner_id}`);
          if (res.ok) setOwner(await res.json());
        }
        // Registration
        const regRes = await fetch(`http://localhost:5100/api/registrations?vehicle_id=${vehicle.vehicle_id}`);
        if (regRes.ok) {
          const regs = await regRes.json();
          setRegistration(regs[0] || null);
        }
        // Insurance
        const insRes = await fetch(`http://localhost:5100/api/insurance?vehicle_id=${vehicle.vehicle_id}`);
        if (insRes.ok) {
          const ins = await insRes.json();
          setInsurance(ins[0] || null);
        }
        // License
        const licRes = await fetch(`http://localhost:5100/api/licenses?vehicle_id=${vehicle.vehicle_id}`);
        if (licRes.ok) {
          const lic = await licRes.json();
          setLicense(lic[0] || null);
        }
        // Alerts (compliance)
        const alRes = await fetch(`http://localhost:5100/api/alerts?vehicle_id=${vehicle.vehicle_id}`);
        if (alRes.ok) setAlerts(await alRes.json());
        // Activity history
        const actRes = await fetch(`http://localhost:5100/api/activities?vehicle_id=${vehicle.vehicle_id}`);
        if (actRes.ok) setActivities(await actRes.json());
      } catch (e) {
        console.error('Failed to load vehicle details', e);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [vehicle]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Loading vehicle profile…</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
          <Car size={24} className="text-primary" />
          {vehicle.manufacturer} {vehicle.model_name}
        </h2>
        <button onClick={onBack} className="p-2 hover:bg-surface rounded-lg transition-colors">
          <X size={20} className="text-text-muted" />
        </button>
      </div>

      {/* Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Vehicle Info Card */}
        <section className="card p-6 bg-surface">
          <h3 className="text-lg font-semibold text-text-main mb-3 flex items-center gap-2">
            <Car size={20} className="text-secondary" /> Vehicle Information
          </h3>
          <dl className="grid grid-cols-2 gap-2 text-sm text-text-muted">
            <dt className="font-medium">Chassis</dt><dd>{vehicle.chassis_number}</dd>
            <dt className="font-medium">Engine</dt><dd>{vehicle.engine_number}</dd>
            <dt className="font-medium">Fuel</dt><dd>{vehicle.fuel_type}</dd>
            <dt className="font-medium">Color</dt><dd>{vehicle.color}</dd>
            <dt className="font-medium">Year</dt><dd>{vehicle.manufacturing_year}</dd>
          </dl>
        </section>

        {/* Owner Card */}
        <section className="card p-6 bg-surface">
          <h3 className="text-lg font-semibold text-text-main mb-3 flex items-center gap-2">
            <User size={20} className="text-primary" /> Owner
          </h3>
          {owner ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {owner.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-text-main">{owner.full_name}</p>
                <p className="text-xs text-text-muted">{owner.mobile_no}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-muted">No owner assigned</p>
          )}
        </section>
      </div>

      {/* Registration, Insurance, License */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Registration */}
        <section className="card p-4 bg-surface">
          <h4 className="flex items-center gap-2 font-medium text-text-main mb-2">
            <Calendar size={18} className="text-success" /> Registration
          </h4>
          {registration ? (
            <div className="space-y-1 text-sm text-text-muted">
              <p>Number: {registration.registration_no || '—'}</p>
              <p>Issued: {fmt(registration.issued_date)}</p>
              <p>Expires: <span className={isExpired(registration.expiry_date) ? 'text-error' : 'text-success'}>{fmt(registration.expiry_date)}</span></p>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${isExpired(registration.expiry_date) ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                {isExpired(registration.expiry_date) ? 'Expired' : 'Valid'}
              </span>
            </div>
          ) : (
            <p className="text-sm text-text-muted">No registration data</p>
          )}
        </section>
        {/* Insurance */}
        <section className="card p-4 bg-surface">
          <h4 className="flex items-center gap-2 font-medium text-text-main mb-2">
            <Shield size={18} className="text-primary" /> Insurance
          </h4>
          {insurance ? (
            <div className="space-y-1 text-sm text-text-muted">
              <p>Provider: {insurance.provider || '—'}</p>
              <p>Policy #: {insurance.policy_number || '—'}</p>
              <p>Expires: <span className={isExpired(insurance.expiry_date) ? 'text-error' : 'text-success'}>{fmt(insurance.expiry_date)}</span></p>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${isExpired(insurance.expiry_date) ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                {isExpired(insurance.expiry_date) ? 'Expired' : 'Active'}
              </span>
            </div>
          ) : (
            <p className="text-sm text-text-muted">No insurance data</p>
          )}
        </section>
        {/* License */}
        <section className="card p-4 bg-surface">
          <h4 className="flex items-center gap-2 font-medium text-text-main mb-2">
            <CheckCircle size={18} className="text-info" /> License
          </h4>
          {license ? (
            <div className="space-y-1 text-sm text-text-muted">
              <p>Number: {license.license_number || '—'}</p>
              <p>Issued: {fmt(license.issued_date)}</p>
              <p>Expires: <span className={isExpired(license.expiry_date) ? 'text-error' : 'text-success'}>{fmt(license.expiry_date)}</span></p>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${isExpired(license.expiry_date) ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                {isExpired(license.expiry_date) ? 'Expired' : 'Valid'}
              </span>
            </div>
          ) : (
            <p className="text-sm text-text-muted">No license data</p>
          )}
        </section>
      </div>

      {/* Compliance Alerts */}
      <section className="card p-4 bg-surface">
        <h3 className="flex items-center gap-2 font-semibold text-text-main mb-3">
          <AlertTriangle size={20} className="text-warning" /> Compliance Alerts
        </h3>
        {alerts.length > 0 ? (
          <ul className="space-y-2 text-sm text-text-muted">
            {alerts.map((a) => (
              <li key={a.alert_id} className="flex items-start gap-2">
                <span className="text-warning"><AlertTriangle size={14} /></span>
                <span>{a.message}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">No active alerts</p>
        )}
      </section>

      {/* Activity History */}
      <section className="card p-4 bg-surface">
        <h3 className="flex items-center gap-2 font-semibold text-text-main mb-3">
          <Activity size={20} className="text-primary" /> Activity History
        </h3>
        {activities.length > 0 ? (
          <ul className="space-y-2 text-sm text-text-muted">
            {activities.map((act) => (
              <li key={act.activity_id} className="flex justify-between">
                <span>{act.action}</span>
                <span className="text-xs text-text-light">{new Date(act.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">No recent activity</p>
        )}
      </section>
    </div>
  );
}
