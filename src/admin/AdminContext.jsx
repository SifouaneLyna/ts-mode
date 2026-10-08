import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, SITE_SUBDOMAIN } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const { token, user, logout } = useAuth();
  const { errorText } = useI18n();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [summary, setSummary] = useState({ pendingCount: 0, setup: null });

  // One place for every call to the backend: adds the token, handles expired sessions
  const api = useCallback(async (path, { method = 'GET', body, form } = {}) => {
    const headers = { 'x-site-subdomain': SITE_SUBDOMAIN };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body) headers['Content-Type'] = 'application/json';
    let res;
    try {
      res = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) });
    } catch {
      throw new Error('Failed to fetch');
    }
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { logout(); navigate('/login', { state: { from: '/admin' } }); }
    if (!res.ok) {
      const err = new Error(data.message || data.error || 'Request failed');
      err.status = res.status;
      throw err;
    }
    return data;
  }, [token, logout, navigate]);

  const notify = useCallback((message, type = 'ok') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast((cur) => (cur && Date.now() - cur.id >= 3400 ? null : cur)), 3500);
  }, []);

  const fail = useCallback((err) => notify(errorText(err), 'error'), [notify, errorText]);

  const refreshSummary = useCallback(() => api('/admin/summary').then(setSummary).catch(() => {}), [api]);
  useEffect(() => {
    refreshSummary();
    const id = setInterval(refreshSummary, 60000);
    return () => clearInterval(id);
  }, [refreshSummary]);

  const value = useMemo(() => ({ api, notify, fail, user, isOwner: user?.role === 'owner', summary, refreshSummary }), [api, notify, fail, user, summary, refreshSummary]);

  return (
    <AdminContext.Provider value={value}>
      {children}
      {toast && <div className={`adm-toast ${toast.type}`} role="status">{toast.message}</div>}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
