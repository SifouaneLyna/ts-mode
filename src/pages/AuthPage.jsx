import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, signup } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';
import { cleanPhone, validateLogin, validateSignup } from '../utils/validators';

function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const { saveSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', username: '', phone: '', identifier: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);

  const errors = isSignup ? validateSignup(form) : validateLogin(form);
  const show = (f) => (submitted || touched[f]) && errors[f];
  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const blur = (f) => () => setTouched({ ...touched, [f]: true });
  const field = (f) => ({ value: form[f], onChange: set(f), onBlur: blur(f), error: show(f) });

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    if (Object.keys(errors).length) return;
    setLoading(true);
    const timer = setTimeout(() => setSlow(true), 4000);
    try {
      const data = isSignup
        ? await signup({ name: form.name.trim(), username: form.username.trim().toLowerCase(), phone: cleanPhone(form.phone), password: form.password })
        : await login({ identifier: form.identifier.trim(), password: form.password });
      saveSession(data);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      clearTimeout(timer);
      setSlow(false);
      setLoading(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 460 }}>
      <h2 className="section-heading mb-0">{isSignup ? 'Create Account' : 'Login'}</h2>
      <hr className="gold-rule" />
      <form onSubmit={handleSubmit} noValidate>
        {isSignup ? (
          <>
            <Field label="Full name" autoComplete="name" {...field('name')} />
            <Field label="Username" autoComplete="username" {...field('username')} />
            <Field label="Phone" inputMode="tel" autoComplete="tel" placeholder="0555 12 34 56" {...field('phone')} />
          </>
        ) : (
          <Field label="Username or phone" autoComplete="username" {...field('identifier')} />
        )}
        <Field label="Password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} {...field('password')} />
        {isSignup && <Field label="Confirm password" type="password" autoComplete="new-password" {...field('confirm')} />}
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {slow && <p className="small text-muted">The server is waking up, this can take up to a minute on the first request.</p>}
        <button className="btn btn-outline-gold w-100" disabled={loading}>
          {loading ? 'Please wait…' : isSignup ? 'Sign up' : 'Login'}
        </button>
      </form>
      <p className="text-center mt-4 small">
        {isSignup ? 'Already have an account?' : 'New here?'}{' '}
        <Link to={isSignup ? '/login' : '/signup'} state={location.state}>
          {isSignup ? 'Login' : 'Create an account'}
        </Link>
      </p>
      <p className="text-center small"><Link to="/track">Track an order without an account</Link></p>
    </div>
  );
}

export default AuthPage;
