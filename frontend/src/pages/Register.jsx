import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { ErrorNote } from '../components/Feedback.jsx';
import { useAuth } from '../auth.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', rollNo: '', branch: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setBusy(true);
    setError('');
    try {
      await register(form);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <Logo />
        <h1>Create your account</h1>
        <form onSubmit={submit} className="form">
          <label>Full name<input required value={form.name} onChange={set('name')} autoComplete="name" /></label>
          <label>College email<input type="email" required value={form.email} onChange={set('email')} autoComplete="email" /></label>
          <div className="form-row">
            <label>Roll number<input value={form.rollNo} onChange={set('rollNo')} placeholder="24EG107C55" /></label>
            <label>Branch &amp; section<input value={form.branch} onChange={set('branch')} placeholder="AIML-C" /></label>
          </div>
          <label>Password<input type="password" required minLength={6} value={form.password} onChange={set('password')} autoComplete="new-password" /></label>
          <ErrorNote error={error} />
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p className="auth-switch">Already registered? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
