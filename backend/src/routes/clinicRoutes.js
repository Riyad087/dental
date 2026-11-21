import { Router } from 'express';
import { clinicInfo, faqs, pillars, services } from '../data/clinicData.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    clinic: clinicInfo,
    pillars,
    services,
    faqs,
  });
});

export default router;
