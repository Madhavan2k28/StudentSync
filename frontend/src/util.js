export const CATEGORIES = [
  'Electronics', 'ID Card', 'Books & Notes', 'Bags', 'Keys',
  'Wallet', 'Bottles', 'Clothing', 'Accessories', 'Other',
];

export const LOCATIONS = [
  'Library', 'Main Block', 'Canteen', 'Auditorium', 'Labs',
  'Parking', 'Sports Ground', 'Bus Stop', 'Hostel',
];

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  });
}

export function today() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export const levelLabel = (l) => (l ? l[0] + l.slice(1).toLowerCase() : '');
export const statusLabel = (s) => (s ? s[0] + s.slice(1).toLowerCase() : '');
