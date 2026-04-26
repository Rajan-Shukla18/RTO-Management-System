export const mockStats = [
  { label: 'Total Vehicles', value: '1.2M', trend: '+2.4%', icon: 'Car' },
  { label: 'Pending Registrations', value: '12,450', trend: '-1.2%', icon: 'FileText' },
  { label: 'Active Licenses', value: '850K', trend: '+0.8%', icon: 'IdCard' },
  { label: 'Revenue (MTD)', value: '$4.2M', trend: '+12%', icon: 'DollarSign' },
];

export const recentRegistrations = [
  { id: '1', plate: 'KA-01-MG-1234', owner: 'Rajan Shukla', model: 'Tesla Model 3', status: 'Approved', date: '2026-04-25' },
  { id: '2', plate: 'MH-12-AB-5678', owner: 'Priya Sharma', model: 'Honda City', status: 'Pending', date: '2026-04-24' },
  { id: '3', plate: 'DL-04-XY-9012', owner: 'Amit Patel', model: 'Hyundai Creta', status: 'Rejected', date: '2026-04-24' },
  { id: '4', plate: 'KA-05-NB-3456', owner: 'Sneha Reddy', model: 'Toyota Fortuner', status: 'Approved', date: '2026-04-23' },
  { id: '5', plate: 'TS-09-ER-7890', owner: 'Vikram Singh', model: 'Mahindra XUV700', status: 'Approved', date: '2026-04-23' },
];

export const alerts = [
  { id: '1', title: '12 Pending Appeals', description: 'Review challenged challans exceeding 30 days SLA.', type: 'warning' },
  { id: '2', title: 'Smart Card Batch Ready', description: 'Batch #882 requires final authorization for printing.', type: 'info' },
  { id: '3', title: 'System Alert: Server Node 3', description: 'Database synchronization delayed by 45 minutes.', type: 'error' },
];

export const vehicles = [
  { id: '1', plate: 'KA-01-MG-1234', owner: 'Rajan Shukla', type: 'Private', category: 'LMV', fuel: 'Electric', expiry: '2031-10-12' },
  { id: '2', plate: 'MH-12-AB-5678', owner: 'Priya Sharma', type: 'Private', category: 'LMV', fuel: 'Petrol', expiry: '2036-05-20' },
  { id: '3', plate: 'DL-04-XY-9012', owner: 'Amit Patel', type: 'Commercial', category: 'HMV', fuel: 'Diesel', expiry: '2028-11-15' },
];
