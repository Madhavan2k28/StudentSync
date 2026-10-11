import { initials } from '../util.js';

// Alternates black and red so neighbouring students are easy to tell apart.
const TONES = ['#141414', '#D7261E', '#4A4A4A', '#A51C16'];

export default function Avatar({ user, size = 36 }) {
  const tone = TONES[(user?.id ?? 0) % TONES.length];
  return (
    <span className="avatar" style={{ width: size, height: size, background: tone, fontSize: size * 0.38 }}>
      {initials(user?.name)}
    </span>
  );
}
