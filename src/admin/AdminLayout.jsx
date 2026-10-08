import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from './AdminContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './admin.css';

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const ICONS = {
  dashboard: 'M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z',
  orders: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  products: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01',
  categories: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  delivery: 'M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  customers: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  staff: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
};
const LINKS = [
  { to: '/admin', end: true, key: 'dashboard', staff: true },
  { to: '/admin/orders', key: 'orders', staff: true },
  { to: '/admin/products', key: 'products' },
  { to: '/admin/categories', key: 'categories' },
  { to: '/admin/delivery', key: 'delivery' },
  { to: '/admin/customers', key: 'customers' },
  { to: '/admin/staff', key: 'staff' },
  { to: '/admin/settings', key: 'settings' },
];

function Shell() {
  const { summary } = useAdmin();
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = LINKS.filter((l) => user?.role === 'owner' || l.staff);

  return (
      <div className="adm">
        <aside className={`adm-side ${open ? 'open' : ''}`}>
          <div className="adm-brand">
            <img src="/template/images/logo.png" alt="TS Mode" />
            <span>{t('a.title')}</span>
          </div>
          <nav>
            {links.map((l) => (
              <NavLink key={l.key} to={l.to} end={l.end} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
                <Icon d={ICONS[l.key]} /><span>{t(`a.nav.${l.key}`)}</span>{l.key === 'orders' && summary.pendingCount > 0 && <b className="adm-badge">{summary.pendingCount}</b>}
              </NavLink>
            ))}
          </nav>
          <div className="adm-side-foot">
            <a href="/" target="_blank" rel="noreferrer">{t('a.viewShop')} ↗</a>
            <button onClick={() => { logout(); navigate('/'); }}>{t('a.logout')}</button>
          </div>
        </aside>
        {open && <div className="adm-scrim" onClick={() => setOpen(false)} />}

        <div className="adm-main">
          <header className="adm-top">
            <button className="adm-burger" onClick={() => setOpen(true)} aria-label={t('nav.menu')}>☰</button>
            <div className="adm-top-right">
              <LanguageSwitcher />
              <span className="adm-user">{user?.name} · {t(`a.role.${user?.role}`)}</span>
            </div>
          </header>
          <main className="adm-content"><Outlet /></main>
        </div>
      </div>
  );
}

function AdminLayout() {
  return (
    <AdminProvider>
      <Shell />
    </AdminProvider>
  );
}

export default AdminLayout;
