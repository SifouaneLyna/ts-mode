import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, signup } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';
import { useI18n } from '../i18n/I18nContext';
import { cleanPhone, validateLogin, validateSignup } from '../utils/validators';

function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const { t, errorText } = useI18n();
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
  const show = (f) => ((submitted || touched[f]) && errors[f] ? t(errors[f]) : '');
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
      const isStaff = ['owner', 'staff'].includes(data.user?.role);
      navigate(location.state?.from || (isStaff ? '/admin' : '/'), { replace: true });
    } catch (err) {
      setError(errorText(err));
    } finally {
      clearTimeout(timer);
      setSlow(false);
      setLoading(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 460 }}>
      <h2 className="section-heading mb-0">{isSignup ? t('auth.createTitle') : t('auth.loginTitle')}</h2>
      <hr className="gold-rule" />
      <form onSubmit={handleSubmit} noValidate>
        {isSignup ? (
          <>
            <Field label={t('auth.fullName')} autoComplete="name" {...field('name')} />
            <Field label={t('auth.username')} autoComplete="username" {...field('username')} />
            <Field label={t('auth.phone')} inputMode="tel" autoComplete="tel" placeholder="0555 12 34 56" {...field('phone')} />
          </>
        ) : (
          <Field label={t('auth.identifier')} autoComplete="username" {...field('identifier')} />
        )}
        <Field label={t('auth.password')} type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} {...field('password')} />
        {isSignup && <Field label={t('auth.confirm')} type="password" autoComplete="new-password" {...field('confirm')} />}
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {slow && <p className="small text-muted">{t('auth.waking')}</p>}
        <button className="btn btn-outline-gold w-100" disabled={loading}>
          {loading ? t('auth.wait') : isSignup ? t('auth.signup') : t('auth.loginTitle')}
        </button>
      </form>
      <p className="text-center mt-4 small">
        {isSignup ? t('auth.haveAccount') : t('auth.newHere')}{' '}
        <Link to={isSignup ? '/login' : '/signup'} state={location.state}>
          {isSignup ? t('auth.loginTitle') : t('auth.createLink')}
        </Link>
      </p>
      <p className="text-center small"><Link to="/track">{t('auth.trackGuest')}</Link></p>
    </div>
  );
}

export default AuthPage;
