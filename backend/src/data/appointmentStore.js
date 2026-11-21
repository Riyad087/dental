import crypto from 'node:crypto';

/**
 * In-memory appointment store.
 * Replace these functions with database queries (e.g., PostgreSQL, MongoDB, Prisma)
 * when adding persistent storage later.
 */
const appointments = [];

export function listAppointments() {
  return [...appointments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createAppointment({
  patientName,
  phone,
  service,
  preferredDate,
  timeSlot,
  notes = '',
}) {
  const record = {
    id: `RD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    patientName: patientName.trim(),
    phone: phone.trim(),
    service: service.trim(),
    preferredDate: preferredDate.trim(),
    timeSlot: timeSlot.trim(),
    notes: notes.trim(),
    status: 'requested',
    createdAt: new Date().toISOString(),
  };

  appointments.push(record);
  return record;
}
