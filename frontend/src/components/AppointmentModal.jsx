import { useEffect, useRef } from 'react';

export function AppointmentModal({ appointment, clinicPhone, clinicPhoneHref, onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (appointment && !dialog.open) {
      dialog.showModal();
    } else if (!appointment && dialog.open) {
      dialog.close();
    }
  }, [appointment]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const handleClose = () => {
      dialog.returnValue = '';
      onClose();
    };

    dialog.addEventListener('close', handleClose);

    // Progressive enhancement light-dismiss fallback when closedby is unsupported
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const isOutside = (event) => {
        const rect = dialog.getBoundingClientRect();
        return (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        );
      };

      const onPointerDown = (event) => {
        pressedOutside = isOutside(event);
      };
      const onPointerUp = (event) => {
        if (pressedOutside && isOutside(event)) {
          dialog.close();
        }
      };

      dialog.addEventListener('pointerdown', onPointerDown);
      dialog.addEventListener('pointerup', onPointerUp);

      return () => {
        dialog.removeEventListener('close', handleClose);
        dialog.removeEventListener('pointerdown', onPointerDown);
        dialog.removeEventListener('pointerup', onPointerUp);
      };
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="booking-dialog"
      closedby="any"
      aria-labelledby="booking-dialog-title"
    >
      <div className="booking-dialog-inner">
        <div className="dialog-badge" aria-hidden="true">
          ✓
        </div>
        <h2 id="booking-dialog-title">Appointment Request Received</h2>
        <p className="dialog-lead">
          Thank you, <strong>{appointment?.patientName}</strong>. Our clinic desk will contact you
          shortly to confirm your exact time.
        </p>

        {appointment && (
          <dl className="booking-summary">
            <div>
              <dt>Reference ID</dt>
              <dd>{appointment.id}</dd>
            </div>
            <div>
              <dt>Treatment</dt>
              <dd>{appointment.service}</dd>
            </div>
            <div>
              <dt>Preferred Date</dt>
              <dd>{appointment.preferredDate}</dd>
            </div>
            <div>
              <dt>Preferred Window</dt>
              <dd>{appointment.timeSlot}</dd>
            </div>
            <div>
              <dt>Contact Phone</dt>
              <dd>{appointment.phone}</dd>
            </div>
          </dl>
        )}

        <form method="dialog" className="dialog-actions">
          <a href={clinicPhoneHref} className="btn btn-secondary">
            Call {clinicPhone}
          </a>
          <button ref={closeButtonRef} type="submit" value="done" className="btn btn-primary" autoFocus>
            Done
          </button>
        </form>
      </div>
    </dialog>
  );
}
