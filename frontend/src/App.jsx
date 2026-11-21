import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { fallbackClinicData } from './data/clinicFallback.js';
import { ClinicLogo } from './components/ClinicLogo.jsx';
import { ServiceIcon } from './components/ServiceIcon.jsx';
import { AppointmentModal } from './components/AppointmentModal.jsx';

const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening', 'Call to Arrange'];

function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function validateField(name, value) {
  const trimmed = value.trim();
  switch (name) {
    case 'patientName':
      if (!trimmed) return 'Please enter your full name.';
      if (trimmed.length < 2) return 'Name must be at least 2 characters.';
      return '';
    case 'phone': {
      const digits = trimmed.replace(/[^\d+]/g, '');
      if (!trimmed) return 'Please enter a phone number for appointment confirmation.';
      if (digits.length < 8) return 'Enter a valid phone number (at least 8 digits).';
      return '';
    }
    case 'service':
      if (!trimmed) return 'Please choose a dental treatment.';
      return '';
    case 'preferredDate':
      if (!trimmed) return 'Please choose a preferred date.';
      return '';
    default:
      return '';
  }
}

export default function App() {
  const [clinicData, setClinicData] = useState(fallbackClinicData);
  const [activeCategory, setActiveCategory] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formValues, setFormValues] = useState({
    patientName: '',
    phone: '',
    service: fallbackClinicData.services[0].name,
    preferredDate: getTodayIsoDate(),
    timeSlot: 'Afternoon',
    notes: '',
  });
  const [touchedFields, setTouchedFields] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ type: 'idle', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [copyFeedback, setCopyFeedback] = useState('');

  const bookingSectionRef = useRef(null);
  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const serviceSelectRef = useRef(null);
  const dateInputRef = useRef(null);

  const formHeadingId = useId();
  const faqHeadingId = useId();

  useEffect(() => {
    let active = true;

    async function loadClinicAndBookings() {
      try {
        const [clinicRes, appointmentsRes] = await Promise.all([
          fetch('/api/clinic'),
          fetch('/api/appointments'),
        ]);

        if (active && clinicRes.ok) {
          const data = await clinicRes.json();
          if (data?.clinic && Array.isArray(data?.services)) {
            setClinicData(data);
          }
        }

        if (active && appointmentsRes.ok) {
          const bookingPayload = await appointmentsRes.json();
          if (Array.isArray(bookingPayload?.appointments)) {
            setRecentRequests(bookingPayload.appointments);
          }
        }
      } catch {
        // Fallback clinic data keeps UI responsive if backend is offline.
      }
    }

    loadClinicAndBookings();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(clinicData.services.map((item) => item.category));
    return ['All', ...unique];
  }, [clinicData.services]);

  const visibleServices = useMemo(() => {
    if (activeCategory === 'All') return clinicData.services;
    return clinicData.services.filter((item) => item.category === activeCategory);
  }, [activeCategory, clinicData.services]);

  const handleSelectServiceForBooking = (serviceName) => {
    setFormValues((prev) => ({ ...prev, service: serviceName }));
    setFieldErrors((prev) => ({ ...prev, service: '' }));
    bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      nameInputRef.current?.focus({ preventScroll: true });
    }, 350);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setTouchedFields((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
    if (fieldErrors[name]) {
      const nextErr = validateField(name, value);
      if (!nextErr) {
        setFieldErrors((prev) => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleInputBlur = (event) => {
    const { name, value } = event.target;
    if (!value && !touchedFields[name]) return;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fieldsToValidate = ['patientName', 'phone', 'service', 'preferredDate'];
    const nextErrors = {};
    for (const key of fieldsToValidate) {
      const message = validateField(key, formValues[key]);
      if (message) nextErrors[key] = message;
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setSubmitStatus({
        type: 'error',
        message: 'Please complete the required fields highlighted below.',
      });

      const refMap = {
        patientName: nameInputRef,
        phone: phoneInputRef,
        service: serviceSelectRef,
        preferredDate: dateInputRef,
      };
      const firstInvalidKey = fieldsToValidate.find((k) => nextErrors[k]);
      refMap[firstInvalidKey]?.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });
      const payload = await response.json();

      if (!response.ok) {
        if (payload?.errors) {
          setFieldErrors(payload.errors);
        }
        setSubmitStatus({
          type: 'error',
          message: payload?.message || 'Unable to submit booking. Please check your details.',
        });
        return;
      }

      const created = payload.appointment;
      setConfirmedAppointment(created);
      setRecentRequests((prev) => [created, ...prev]);
      setSubmitStatus({
        type: 'success',
        message: `Booking request ${created.id} submitted for ${created.preferredDate}.`,
      });
      setFormValues((prev) => ({
        ...prev,
        patientName: '',
        phone: '',
        notes: '',
      }));
      setTouchedFields({});
      setFieldErrors({});
    } catch {
      setSubmitStatus({
        type: 'error',
        message: `Could not reach the booking server. Please call ${clinicData.clinic.contact.phone} directly.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = useCallback(() => {
    setConfirmedAppointment(null);
  }, []);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(clinicData.clinic.contact.fullAddress);
      setCopyFeedback('Clinic address copied to clipboard.');
    } catch {
      setCopyFeedback('Address: ' + clinicData.clinic.contact.fullAddress);
    }
    setTimeout(() => setCopyFeedback(''), 3500);
  };

  const { clinic, pillars, faqs } = clinicData;
  const mapsQuery = encodeURIComponent(clinic.contact.fullAddress);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <div className="container header-inner">
          <a className="brand-link" href="#top" aria-label={`${clinic.name} home`}>
            <ClinicLogo className="brand-logo" />
            <span className="brand-text">
              <strong className="brand-name">{clinic.name}</strong>
              <span className="brand-sub">Maijdee, Noakhali</span>
            </span>
          </a>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={mobileMenuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? 'Close Menu' : 'Menu'}
          </button>

          <nav
            id="primary-navigation"
            className={`primary-nav ${mobileMenuOpen ? 'is-open' : ''}`}
            aria-label="Primary"
          >
            <ul className="nav-list">
              <li>
                <a href="#approach" onClick={() => setMobileMenuOpen(false)}>
                  Our Approach
                </a>
              </li>
              <li>
                <a href="#services" onClick={() => setMobileMenuOpen(false)}>
                  Services
                </a>
              </li>
              <li>
                <a href="#doctor" onClick={() => setMobileMenuOpen(false)}>
                  Our Doctor
                </a>
              </li>
              <li>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)}>
                  FAQ
                </a>
              </li>
              <li>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
                  Visit Us
                </a>
              </li>
            </ul>
            <div className="nav-actions">
              <a className="phone-pill" href={clinic.contact.phoneHref}>
                {clinic.contact.phone}
              </a>
              <a
                className="btn btn-primary btn-sm"
                href="#book"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Visit
              </a>
            </div>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section id="top" className="hero-section">
          <div className="container hero-grid">
            <div className="hero-content">
              <p className="eyebrow-pill">
                <span>{clinic.doctor.registration}</span>
                <span aria-hidden="true">•</span>
                <span>Maijdee, Noakhali</span>
              </p>

              <h1>{clinic.slogan}</h1>

              <p className="hero-lead">{clinic.tagline}.</p>
              <p className="hero-body">
                Compassionate, evidence-based dental care led by{' '}
                <strong>{clinic.doctor.name}</strong> ({clinic.doctor.degree},{' '}
                {clinic.doctor.title}) — helping patients across Noakhali protect their natural
                smiles comfortably.
              </p>

              <div className="hero-cta-row">
                <a className="btn btn-primary" href="#book">
                  Request an Appointment
                </a>
                <a className="btn btn-secondary" href={clinic.contact.phoneHref}>
                  Call {clinic.contact.phone}
                </a>
              </div>

              <div className="doctor-strip">
                <div>
                  <p className="doctor-strip-name">{clinic.doctor.name}</p>
                  <p className="doctor-strip-meta">
                    {clinic.doctor.degree} • {clinic.doctor.title} • {clinic.doctor.affiliation}
                  </p>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-frame">
                <img
                  src="/images/hero-dental.jpg"
                  alt="Dentist speaking warmly with a relaxed smiling patient in a bright modern dental suite"
                  width="1200"
                  height="675"
                  fetchpriority="high"
                />
              </div>
              <div className="hero-floating-card">
                <span className="floating-kicker">Focused Dental Care</span>
                <strong>Root Canal, Cosmetic &amp; Preventive Dentistry</strong>
                <span>{clinic.contact.addressLine1}</span>
              </div>
            </div>
          </div>
        </section>

        <section id="approach" className="pillars-section" aria-labelledby="pillars-heading">
          <div className="container">
            <div className="section-heading">
              <p className="section-kicker">Why Righteous Dental</p>
              <h2 id="pillars-heading">Three Pillars Behind Every Visit</h2>
              <p>
                Modern dental care should feel clear, calm, and deeply personalized from your first
                checkup onward.
              </p>
            </div>

            <div className="pillars-grid">
              {pillars.map((pillar, index) => (
                <article key={pillar.id} className="pillar-card">
                  <div className="pillar-top">
                    <span className="icon-badge">
                      <ServiceIcon id={pillar.id} />
                    </span>
                    <span className="pillar-index">0{index + 1}</span>
                  </div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="services-section" aria-labelledby="services-heading">
          <div className="container">
            <div className="services-header">
              <div className="section-heading">
                <p className="section-kicker">Clinical Treatments</p>
                <h2 id="services-heading">Comprehensive Dental Care Under One Roof</h2>
                <p>
                  Explore our core treatments and select any service to pre-fill your appointment
                  request.
                </p>
              </div>

              <div className="filter-group" role="group" aria-label="Filter dental services">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`filter-pill ${activeCategory === category ? 'is-active' : ''}`}
                    aria-pressed={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="services-grid">
              {visibleServices.map((service) => (
                <article key={service.id} className="service-card">
                  <div className="service-card-head">
                    <span className="icon-badge icon-badge-soft">
                      <ServiceIcon id={service.id} />
                    </span>
                    <span className="category-tag">{service.category}</span>
                  </div>

                  <h3>{service.name}</h3>
                  <p className="service-summary">{service.summary}</p>

                  <ul className="service-highlights">
                    {service.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  <div className="service-card-footer">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleSelectServiceForBooking(service.name)}
                    >
                      Book This Treatment
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="doctor" className="doctor-section" aria-labelledby="doctor-heading">
          <div className="container doctor-grid">
            <div className="doctor-photo-wrap">
              <img
                src="/images/doctor-consultation.jpg"
                alt="Dental surgeon reviewing a tailored oral care plan on a tablet with a smiling patient"
                width="1024"
                height="683"
                loading="lazy"
              />
            </div>

            <div className="doctor-details">
              <p className="section-kicker">Meet Your Dental Surgeon</p>
              <h2 id="doctor-heading">{clinic.doctor.name}</h2>
              <p className="doctor-credentials">
                {clinic.doctor.degree} — {clinic.doctor.title}
              </p>

              <p className="doctor-bio">
                Dedicated to gentle root canal therapy, aesthetic restorations, and preventive oral
                care in Maijdee, Noakhali. With clinical experience alongside{' '}
                <strong>{clinic.doctor.affiliation}</strong>, Dr. Motaleb provides attentive
                treatment planning tailored to each patient&apos;s general health and comfort.
              </p>

              <dl className="credential-list">
                <div>
                  <dt>Qualification</dt>
                  <dd>{clinic.doctor.degree}, Oral &amp; Dental Surgeon</dd>
                </div>
                <div>
                  <dt>Medical Affiliation</dt>
                  <dd>{clinic.doctor.affiliation}</dd>
                </div>
                <div>
                  <dt>Registration</dt>
                  <dd>{clinic.doctor.registration}</dd>
                </div>
                <div>
                  <dt>Clinic Location</dt>
                  <dd>{clinic.contact.addressLine2}</dd>
                </div>
              </dl>

              <div className="hero-cta-row">
                <a className="btn btn-primary" href="#book">
                  Schedule Consultation
                </a>
                <a className="btn btn-secondary" href={clinic.contact.phoneHref}>
                  Speak With Clinic
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="book"
          ref={bookingSectionRef}
          className="booking-section"
          aria-labelledby={formHeadingId}
        >
          <div className="container booking-layout">
            <div className="booking-intro">
              <p className="section-kicker">Book Your Visit</p>
              <h2 id={formHeadingId}>Request an Appointment</h2>
              <p>
                Fill in your preferred treatment and contact details. Our clinic team will call you
                to confirm your appointment time.
              </p>

              <div className="booking-direct-box">
                <h3>Prefer calling directly?</h3>
                <p>
                  Speak with Righteous Dental directly for urgent toothache or same-day availability.
                </p>
                <a className="direct-phone-link" href={clinic.contact.phoneHref}>
                  {clinic.contact.phone}
                </a>
                <p className="direct-address">{clinic.contact.fullAddress}</p>
              </div>

              {recentRequests.length > 0 && (
                <aside className="recent-bookings" aria-label="Recent session appointment requests">
                  <h3>Submitted Requests (Session Preview)</h3>
                  <ul>
                    {recentRequests.slice(0, 3).map((item) => (
                      <li key={item.id}>
                        <strong>{item.id}</strong> — {item.patientName} ({item.service},{' '}
                        {item.preferredDate})
                      </li>
                    ))}
                  </ul>
                </aside>
              )}
            </div>

            <form
              className="booking-form"
              action="/api/appointments"
              method="POST"
              aria-labelledby={formHeadingId}
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="field">
                <label htmlFor="patient-name">
                  Full Name <span aria-hidden="true">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="patient-name"
                  name="patientName"
                  type="text"
                  autoComplete="name"
                  enterKeyHint="next"
                  required
                  value={formValues.patientName}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  aria-invalid={fieldErrors.patientName ? 'true' : undefined}
                  aria-describedby={fieldErrors.patientName ? 'patient-name-error' : undefined}
                />
                {fieldErrors.patientName && (
                  <span id="patient-name-error" className="field-error">
                    {fieldErrors.patientName}
                  </span>
                )}
              </div>

              <div className="field">
                <label htmlFor="patient-phone">
                  Phone Number <span aria-hidden="true">*</span>
                </label>
                <input
                  ref={phoneInputRef}
                  id="patient-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  enterKeyHint="next"
                  required
                  value={formValues.phone}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  aria-invalid={fieldErrors.phone ? 'true' : undefined}
                  aria-describedby={`phone-hint${fieldErrors.phone ? ' phone-error' : ''}`}
                />
                <span id="phone-hint" className="field-hint">
                  Example: +880 17XX-XXXXXX
                </span>
                {fieldErrors.phone && (
                  <span id="phone-error" className="field-error">
                    {fieldErrors.phone}
                  </span>
                )}
              </div>

              <div className="field">
                <label htmlFor="service-select">
                  Dental Service <span aria-hidden="true">*</span>
                </label>
                <select
                  ref={serviceSelectRef}
                  id="service-select"
                  name="service"
                  required
                  value={formValues.service}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  aria-invalid={fieldErrors.service ? 'true' : undefined}
                  aria-describedby={fieldErrors.service ? 'service-error' : undefined}
                >
                  {clinicData.services.map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.service && (
                  <span id="service-error" className="field-error">
                    {fieldErrors.service}
                  </span>
                )}
              </div>

              <div className="field">
                <label htmlFor="preferred-date">
                  Preferred Date <span aria-hidden="true">*</span>
                </label>
                <input
                  ref={dateInputRef}
                  id="preferred-date"
                  name="preferredDate"
                  type="date"
                  min={getTodayIsoDate()}
                  required
                  value={formValues.preferredDate}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  aria-invalid={fieldErrors.preferredDate ? 'true' : undefined}
                  aria-describedby={fieldErrors.preferredDate ? 'date-error' : undefined}
                />
                {fieldErrors.preferredDate && (
                  <span id="date-error" className="field-error">
                    {fieldErrors.preferredDate}
                  </span>
                )}
              </div>

              <fieldset className="field-group">
                <legend>Preferred Time Window</legend>
                <div className="radio-pill-grid">
                  {TIME_SLOTS.map((slot) => (
                    <label key={slot} className="radio-pill">
                      <input
                        type="radio"
                        name="timeSlot"
                        value={slot}
                        checked={formValues.timeSlot === slot}
                        onChange={handleInputChange}
                      />
                      <span>{slot}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="field">
                <label htmlFor="patient-notes">Symptoms or Notes (Optional)</label>
                <textarea
                  id="patient-notes"
                  name="notes"
                  rows="3"
                  maxLength="400"
                  enterKeyHint="done"
                  value={formValues.notes}
                  onChange={handleInputChange}
                  aria-describedby="notes-hint"
                />
                <span id="notes-hint" className="field-hint">
                  Mention tooth sensitivity, diabetic history, or preferred callback time.
                </span>
              </div>

              <div className="form-status-region" role="status" aria-live="polite">
                {submitStatus.type !== 'idle' && (
                  <p className={`status-banner status-${submitStatus.type}`}>
                    {submitStatus.message}
                  </p>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending Request...' : 'Confirm Appointment Request'}
              </button>
            </form>
          </div>
        </section>

        <section id="faq" className="faq-section" aria-labelledby={faqHeadingId}>
          <div className="container faq-container">
            <div className="section-heading">
              <p className="section-kicker">Patient Information</p>
              <h2 id={faqHeadingId}>Frequently Asked Questions</h2>
            </div>

            <div className="faq-list">
              {faqs.map((item, idx) => (
                <details key={item.id} name="dental-faq" open={idx === 0}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section" aria-labelledby="contact-heading">
          <div className="container contact-card">
            <div className="contact-info">
              <p className="section-kicker">Visit Our Clinic</p>
              <h2 id="contact-heading">Find Righteous Dental in Maijdee</h2>
              <p className="contact-address">{clinic.contact.fullAddress}</p>
              <div className="contact-actions">
                <a className="btn btn-primary" href={clinic.contact.phoneHref}>
                  Call {clinic.contact.phone}
                </a>
                <a
                  className="btn btn-secondary"
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Google Maps
                </a>
                <button type="button" className="btn btn-outline" onClick={handleCopyAddress}>
                  Copy Address
                </button>
              </div>
              <div className="copy-status" role="status" aria-live="polite">
                {copyFeedback && <span>{copyFeedback}</span>}
              </div>
            </div>

            <div className="contact-summary-panel">
              <h3>Clinic Quick Card</h3>
              <dl>
                <div>
                  <dt>Clinic</dt>
                  <dd>{clinic.name}</dd>
                </div>
                <div>
                  <dt>Surgeon</dt>
                  <dd>
                    {clinic.doctor.name} ({clinic.doctor.degree})
                  </dd>
                </div>
                <div>
                  <dt>Registration</dt>
                  <dd>{clinic.doctor.registration}</dd>
                </div>
                <div>
                  <dt>Appointment Line</dt>
                  <dd>
                    <a href={clinic.contact.phoneHref}>{clinic.contact.phone}</a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <ClinicLogo className="footer-logo" />
            <div>
              <strong>{clinic.name}</strong>
              <p>{clinic.tagline}</p>
            </div>
          </div>

          <div className="footer-meta">
            <p>
              {clinic.doctor.name} • {clinic.doctor.registration} • {clinic.doctor.affiliation}
            </p>
            <p>{clinic.contact.fullAddress}</p>
          </div>
        </div>
      </footer>

      <AppointmentModal
        appointment={confirmedAppointment}
        clinicPhone={clinic.contact.phone}
        clinicPhoneHref={clinic.contact.phoneHref}
        onClose={handleCloseModal}
      />
    </>
  );
}
