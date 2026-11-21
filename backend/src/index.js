import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import clinicRoutes from './routes/clinicRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
const corsOrigin = process.env.CORS_ORIGIN;

app.use(cors(corsOrigin ? { origin: corsOrigin } : undefined));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Righteous Dental API is running',
    storage: 'in-memory (ready for database)',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/clinic', clinicRoutes);
app.use('/api/appointments', appointmentRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

export default app;

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}
