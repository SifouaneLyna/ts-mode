import { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { useI18n } from '../../i18n/I18nContext';
import { Loading, PageHeader } from '../components/ui';

function Customers() {
  const { api, fail } = useAdmin();
  const { t, money, formatDate } = useI18n();
  const [q, setQ] = useState('');
  const [list, setList] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => {
      api(`/admin/customers?q=${encodeURIComponent(q.trim())}`).then(setList).catch(fail);
    }, q ? 350 : 0);
    return () => clearTimeout(id);
  }, [api, fail, q]);

  return (
    <>
      <PageHeader title={t('a.nav.customers')}>
        <input className="form-control adm-search" placeholder={t('a.search')} value={q} onChange={(e) => setQ(e.target.value)} />
      </PageHeader>
      <p className="adm-muted small">{t('a.cust.note')}</p>
      {!list ? <Loading /> : list.length === 0 ? <p className="adm-muted">{t('a.none')}</p> : (
        <div className="adm-card flush">
          <table className="adm-table">
            <thead><tr><th>{t('a.cust.name')}</th><th>{t('a.cust.phone')}</th><th>{t('a.cust.orders')}</th><th>{t('a.cust.spent')}</th><th>{t('a.cust.joined')}</th></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td data-label={t('a.cust.name')}><b>{c.name}</b><small className="adm-muted"> · @{c.username}</small></td>
                  <td data-label={t('a.cust.phone')}>{c.phone}</td>
                  <td data-label={t('a.cust.orders')}>{c.ordersCount}</td>
                  <td data-label={t('a.cust.spent')}>{money(c.totalSpent)}</td>
                  <td data-label={t('a.cust.joined')}>{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default Customers;
