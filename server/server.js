import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db/database.js';
import ownerRoutes from './routes/ownerRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import insuranceRoutes from './routes/insuranceRoutes.js';
import licenseRoutes from './routes/licenseRoutes.js';
import officeRoutes from './routes/officeRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import alertRoutes from './routes/alertRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/owners', ownerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/alerts', alertRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RTO Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
