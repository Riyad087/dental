export function ServiceIcon({ id }) {
  switch (id) {
    case 'prevention':
    case 'general-checkup':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
          <path
            d="M12 3L4.5 6.2V11.8C4.5 16.5 7.7 20.4 12 21.5C16.3 20.4 19.5 16.5 19.5 11.8V6.2L12 3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9.2 12.2L11.2 14.2L15 10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'tailored':
    case 'diabetic-dental':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
          <path
            d="M12 20.5C12 20.5 4.5 15.8 4.5 9.8C4.5 7.2 6.5 5 9.1 5C10.5 5 11.4 5.7 12 6.6C12.6 5.7 13.5 5 14.9 5C17.5 5 19.5 7.2 19.5 9.8C19.5 15.8 12 20.5 12 20.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M12 9.2V13.6M9.8 11.4H14.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'root-canal':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
          <path
            d="M8.5 4.5C6.2 4.5 4.5 6.4 4.5 9C4.5 12.8 6.8 16.8 8.1 19.5C8.5 20.3 9.7 20.2 9.9 19.3L11.1 14.8C11.3 14 12.7 14 12.9 14.8L14.1 19.3C14.3 20.2 15.5 20.3 15.9 19.5C17.2 16.8 19.5 12.8 19.5 9C19.5 6.4 17.8 4.5 15.5 4.5C13.9 4.5 12.8 5.4 12 5.7C11.2 5.4 10.1 4.5 8.5 4.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M12 8.5V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'cosmetic-dentistry':
    case 'preserving':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
          <path
            d="M12 3.5L13.9 8.6L19 10.5L13.9 12.4L12 17.5L10.1 12.4L5 10.5L10.1 8.6L12 3.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M18.5 16V20M16.5 18H20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
          <rect x="4.5" y="4.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8.5V15.5M8.5 12H15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
  }
}
