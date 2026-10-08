import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../AdminContext';
import { useI18n } from '../../i18n/I18nContext';
import { Loading, PageHeader } from '../components/ui';
import { loc } from '../../utils/localize';
import { useAttr } from '../../context/SiteSettingsContext';

function SalesChart({ series }) {
  const max = Math.max(...series.map((d) => d.revenue), 1);
  return (
    <svg viewBox="0 0 420 140" className="adm-chart" role="img" aria-label="sales" style={{ direction: 'ltr' }}>
      {series.map((d, i) => {
        const h = Math.round((d.revenue / max) * 100);
        return (
          <g key={d.date}>
            <rect x={i * 30 + 6} y={110 - h} width="20" height={Math.max(h, 1)} rx="3" className={d.revenue ? 'bar' : 'bar empty'}>
              <title>{`${d.date}: ${d.revenue} (${d.orders})`}</title>
            </rect>
            <text x={i * 30 + 16} y="128" textAnchor="middle">{d.date.slice(8)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Fold({ title, open = false, children }) {
  return (
    <details className="adm-fold" open={open}>
      <summary>{title}</summary>
      <div className="adm-fold-body">{children}</div>
    </details>
  );
}

function Dashboard() {
  const { api, fail, isOwner, summary } = useAdmin();
  const { t, money, lang, formatDateTime } = useI18n();
  const attr = useAttr();
  const [stats, setStats] = useState(null);

  useEffect(() => { api('/admin/stats').then(setStats).catch(fail); }, [api, fail]);
  if (!stats) return <Loading />;

  const setup = summary.setup || {};
  const steps = [
    { key: 'delivery', label: 'a.dash.setupDelivery', to: '/admin/delivery', done: setup.deliveryRates > 0 },
    { key: 'categories', label: 'a.dash.setupCategories', to: '/admin/categories', done: setup.categories > 0 },
    { key: 'products', label: 'a.dash.setupProducts', to: '/admin/products/new', done: setup.products > 0 },
    { key: 'contact', label: 'a.dash.setupContact', to: '/admin/settings', done: setup.contact },
  ];
  const showSetup = isOwner && summary.setup && steps.some((s) => !s.done);
  const lowCount = stats.lowStock.length;

  return (
    <>
      <PageHeader title={t('a.nav.dashboard')}>
        {isOwner && <Link to="/admin/products/new" className="adm-btn primary">+ {t('a.dash.addProduct')}</Link>}
      </PageHeader>

      {showSetup && (
        <section className="adm-card adm-setup">
          <h3>{t('a.dash.setupTitle')}</h3>
          <ul>
            {steps.map((s) => (
              <li key={s.key} className={s.done ? 'done' : ''}>
                <span className="adm-tick">{s.done ? '✓' : ''}</span>
                <span>{t(s.label)}</span>
                {!s.done && <Link to={s.to} className="adm-btn ghost">{t('a.dash.open')}</Link>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="adm-stats">
        <div className="adm-stat"><span>{t('a.dash.today')}</span><strong>{money(stats.today.revenue)}</strong><small>{t('a.dash.orders', { n: stats.today.orders })}</small></div>
        <div className="adm-stat"><span>{t('a.dash.last7')}</span><strong>{money(stats.last7.revenue)}</strong><small>{t('a.dash.orders', { n: stats.last7.orders })}</small></div>
        <div className={`adm-stat ${stats.pendingCount ? 'accent' : ''}`}><span>{t('a.dash.pending')}</span><strong>{stats.pendingCount}</strong><small><Link to="/admin/orders">{t('a.nav.orders')} →</Link></small></div>
      </div>

      <section className="adm-card">
        <h3>{t('a.dash.todo')}</h3>
        {stats.pendingCount === 0 && lowCount === 0 ? <p className="adm-muted mb-0">{t('a.dash.allGood')}</p> : (
          <div className="adm-todo">
            {stats.pendingCount > 0 && <div><span>{t('a.dash.toConfirm', { n: stats.pendingCount })}</span><Link to="/admin/orders" className="adm-btn">{t('a.dash.open')}</Link></div>}
            {lowCount > 0 && <div><span>{t('a.dash.toRestock', { n: lowCount })}</span>{isOwner && <Link to="/admin/products" className="adm-btn">{t('a.dash.open')}</Link>}</div>}
          </div>
        )}
      </section>

      <Fold title={t('a.dash.chart')}>
        <SalesChart series={stats.series} />
        <small className="adm-muted">{t('a.dash.salesNote')}</small>
      </Fold>
      {lowCount > 0 && (
        <Fold title={t('a.dash.low')}>
          <ul className="adm-list">
            {stats.lowStock.map((p, i) => (
              <li key={p.productId + i}>
                <span>{loc(p, 'name', lang)}{p.variant && <small className="adm-muted"> · {p.attributes ? attr.joinValues(p.attributes) : p.variant}</small>}</span>
                <b className={p.stock === 0 ? 'bad' : 'warn'}>{t('a.dash.left', { n: p.stock })}</b>
              </li>
            ))}
          </ul>
        </Fold>
      )}
      <Fold title={t('a.dash.recent')}>
        {stats.lastOrders.length === 0 ? <p className="adm-muted">{t('a.none')}</p> : (
          <ul className="adm-list">
            {stats.lastOrders.map((o) => (
              <li key={o._id}>
                <span>#{o.orderNumber || o._id.slice(-6).toUpperCase()} · {o.customerInfo?.name}<small className="adm-muted"> · {formatDateTime(o.createdAt)}</small></span>
                <span className={`adm-pill ${o.status}`}>{t(`status.${o.status}`)}</span>
              </li>
            ))}
          </ul>
        )}
      </Fold>
      <Fold title={t('a.dash.more')}>
        <ul className="adm-list">
          <li><span>{t('a.dash.last30')}</span><b>{money(stats.last30.revenue)} · {t('a.dash.orders', { n: stats.last30.orders })}</b></li>
          <li><span>{t('a.dash.totalOrders')}</span><b>{stats.totalOrders}</b></li>
          {isOwner && <li><span>{t('a.dash.customers')}</span><b>{stats.customersCount}</b></li>}
          {stats.topProducts.map((p) => <li key={p.name}><span>{t('a.dash.top')} · {p.name}</span><b>{t('a.dash.sold', { n: p.quantity })}</b></li>)}
        </ul>
      </Fold>
    </>
  );
}

export default Dashboard;
