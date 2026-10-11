import { initials } from '../util.js';

// Each student gets a stable colour from their id.
const TONES = ['#5B3FD6', '#1F8A6E', '#C2410C', '#1D4ED8', '#9D174D', '#4D7C0F'];

export default function Avatar({ user, size = 36 }) {
  const tone = TONES[(user?.id ?? 0) % TONES.length];
  return (
    <span className="avatar" style={{ width: size, height: size, background: tone, fontSize: size * 0.38 }}>
      {initials(user?.name)}
    </span>
  );
}
