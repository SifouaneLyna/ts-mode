import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';

// Only owner / staff accounts get in; everybody else is sent to login or told no.
function AdminRoute({ children, ownerOnly = false }) {
  const { token, user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  const allowed = ownerOnly ? user?.role === 'owner' : ['owner', 'staff'].includes(user?.role);
  if (!allowed) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: 520 }}>
        <h2 className="section-heading mb-0">{t('a.denied')}</h2>
        <hr className="gold-rule" />
        <p className="text-muted">{t('a.deniedText')}</p>
        <Link to="/" className="btn btn-outline-gold">{t('nav.home')}</Link>
      </div>
    );
  }
  return children;
}

export default AdminRoute;
