import { Router } from 'express';
import { createAppointment, listAppointments } from '../data/appointmentStore.js';

const router = Router();

const ALLOWED_SLOTS = new Set(['Morning', 'Afternoon', 'Evening', 'Call to Arrange']);

router.get('/', (_req, res) => {
  res.json({
    storage: 'in-memory',
    appointments: listAppointments(),
  });
});

router.post('/', (req, res) => {
  const { patientName, phone, service, preferredDate, timeSlot, notes } = req.body ?? {};

  const errors = {};
  if (typeof patientName !== 'string' || patientName.trim().length < 2) {
    errors.patientName = 'Please enter your full name (at least 2 characters).';
  }
  if (typeof phone !== 'string' || phone.replace(/[^\d+]/g, '').length < 8) {
    errors.phone = 'Please enter a valid contact phone number.';
  }
  if (typeof service !== 'string' || !service.trim()) {
    errors.service = 'Please select the dental service you need.';
  }
  if (typeof preferredDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate.trim())) {
    errors.preferredDate = 'Please choose a valid preferred date.';
  }
  if (typeof timeSlot !== 'string' || (!ALLOWED_SLOTS.has(timeSlot.trim()) && !timeSlot.trim())) {
    errors.timeSlot = 'Please choose a preferred time window.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: 'Please review the highlighted booking fields.',
      errors,
    });
  }

  const appointment = createAppointment({
    patientName,
    phone,
    service,
    preferredDate,
    timeSlot,
    notes: typeof notes === 'string' ? notes : '',
  });

  return res.status(201).json({
    message: 'Appointment request received. Our clinic will call to confirm your slot.',
    appointment,
  });
});

export default router;
