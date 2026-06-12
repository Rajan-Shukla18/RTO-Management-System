import supabase from '../db/supabase.js';

export const getAlerts = async (req, res) => {
  try {
    const alerts = [];
    const today = new Date().toISOString().split('T')[0];
    const nextMonthDate = new Date(new Date().setDate(new Date().getDate() + 30));
    const nextMonth = nextMonthDate.toISOString().split('T')[0];

    const role = req.headers['x-user-role'] || 'admin';
    const userId = req.headers['x-user-id'] || '1';

    const calculateDaysRemaining = (expiryStr) => {
      return Math.ceil((new Date(expiryStr) - new Date(today)) / (1000 * 60 * 60 * 24));
    };

    // 1. Check Insurance Expiries
    const { data: insuranceRecords, error: insError } = await supabase
      .from('insurance')
      .select(`
        *,
        vehicles (
          manufacturer, model_name, owner_id,
          owners ( user_id )
        )
      `)
      .lte('expiry_date', nextMonth);

    if (insError) return res.status(500).json({ error: insError.message });

    (insuranceRecords || []).forEach(item => {
      // Filter by user if citizen role
      if (role === 'user' && item.vehicles?.owners?.user_id?.toString() !== userId.toString()) return;

      const daysRemaining = calculateDaysRemaining(item.expiry_date);
      const isExpired = daysRemaining < 0;
      
      alerts.push({
        id: `ins-exp-${item.insurance_id}`,
        type: isExpired ? 'error' : 'warning',
        priority: isExpired ? 'High' : 'Medium',
        title: isExpired ? 'Insurance Expired' : 'Insurance Expiring Soon',
        description: `Policy ${item.policy_number} for ${item.vehicles?.manufacturer} ${item.vehicles?.model_name} ${isExpired ? 'expired' : 'expires'} on ${item.expiry_date}.`,
        category: 'Insurance',
        alertType: 'Insurance',
        daysRemaining: daysRemaining,
        action: 'Renew Insurance immediately'
      });
    });

    // 2. Check Pending Registrations (Admin only)
    if (role === 'admin') {
      const { count, error: regError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending');

      if (regError) return res.status(500).json({ error: regError.message });

      if (count > 0) {
        alerts.push({
          id: 'reg-pending',
          type: 'warning',
          priority: 'Medium',
          title: 'Pending Approvals',
          description: `There are ${count} registration applications awaiting review.`,
          category: 'Registration',
          alertType: 'Registration',
          daysRemaining: 0,
          action: 'Review pending applications'
        });
      }
    }

    // 3. Check License Expiries
    const { data: licenses, error: licError } = await supabase
      .from('driving_licenses')
      .select(`
        *,
        owners ( full_name, user_id )
      `)
      .lte('expiry_date', nextMonth);

    if (licError) return res.status(500).json({ error: licError.message });

    (licenses || []).forEach(lic => {
      // Filter by user if citizen role
      if (role === 'user' && lic.owners?.user_id?.toString() !== userId.toString()) return;

      const daysRemaining = calculateDaysRemaining(lic.expiry_date);
      const isExpired = daysRemaining < 0;
      
      alerts.push({
        id: `lic-${lic.license_id}`,
        type: isExpired ? 'error' : 'warning',
        priority: isExpired ? 'High' : 'Medium',
        title: isExpired ? 'License Expired' : 'License Renewal Due',
        description: `${lic.owners?.full_name}'s license (${lic.license_number}) ${isExpired ? 'expired' : 'expires'} on ${lic.expiry_date}.`,
        category: 'License',
        alertType: 'License',
        daysRemaining: daysRemaining,
        action: 'Apply for License Renewal'
      });
    });

    res.json(alerts);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ error: err.message });
  }
};
