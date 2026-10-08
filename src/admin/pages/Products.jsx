import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../AdminContext';
import { useI18n } from '../../i18n/I18nContext';
import { Loading, PageHeader, nameOf } from '../components/ui';
import { loc } from '../../utils/localize';
import { img } from '../../utils/img';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const stockOf = (p) => (p.hasVariants ? p.variants.reduce((s, v) => s + v.stockQty, 0) : p.stockQty);
const lowCountOf = (p, limit) => (p.hasVariants ? p.variants.filter((v) => v.stockQty <= limit).length : (p.stockQty <= limit ? 1 : 0));

// A number box that saves itself when you leave it (price / stock)
function InlineNumber({ value, onSave, width = 90 }) {
  const [text, setText] = useState(null);
  return (
    <input
      className="form-control adm-inline" style={{ maxWidth: width }} inputMode="numeric"
      value={text ?? value}
      onFocus={(e) => e.target.select()}
      onChange={(e) => setText(e.target.value.replace(/[^\d]/g, ''))}
      onBlur={() => { if (text !== null && text !== '' && Number(text) !== Number(value)) onSave(Number(text)); setText(null); }}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
    />
  );
}

function Products() {
  const { api, notify, fail, refreshSummary } = useAdmin();
  const { t, money, lang } = useI18n();
  const navigate = useNavigate();
  const limit = Number(useSiteSettings().lowStock) || 3;
  const isLow = (p) => lowCountOf(p, limit) > 0;
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [cat, setCat] = useState('');

  useEffect(() => {
    api('/products/admin/list').then(setProducts).catch(fail);
    api('/categories').then(setCategories).catch(() => {});
  }, [api, fail]);

  const replace = (updated) => setProducts((list) => list.map((x) => (x._id === updated._id ? updated : x)));
  async function patch(p, body) { try { replace(await api(`/products/${p._id}`, { method: 'PUT', body })); notify(t('a.saved')); } catch (err) { fail(err); } }
  async function toggle(p) { try { replace(await api(`/products/${p._id}/visibility`, { method: 'PATCH' })); } catch (err) { fail(err); } }
  async function remove(p) {
    if (!window.confirm(t('a.confirmDelete'))) return;
    try { await api(`/products/${p._id}`, { method: 'DELETE' }); setProducts((l) => l.filter((x) => x._id !== p._id)); refreshSummary(); notify(t('a.deleted')); } catch (err) { fail(err); }
  }
  async function duplicate(p) {
    const suffix = ` ${t('a.prod.copySuffix')}`;
    const translations = {};
    for (const l of ['en', 'fr', 'ar']) { const tr = p.translations?.[l] || {}; translations[l] = { name: tr.name ? tr.name + suffix : '', description: tr.description || '' }; }
    try {
      const created = await api('/products', { method: 'POST', body: {
        name: p.name + suffix, description: p.description, translations, basePrice: p.basePrice, categoryId: p.categoryId || null, images: p.images,
        onSale: p.onSale, salePercentage: p.salePercentage, isVisible: false, hasVariants: p.hasVariants, stockQty: p.stockQty,
        variants: (p.variants || []).map((v) => ({ attributes: v.attributes, stockQty: v.stockQty, images: v.images || [] })),
      } });
      notify(t('a.prod.duplicated'));
      navigate(`/admin/products/${created._id}`);
    } catch (err) { fail(err); }
  }

  // only the categories customers actually browse (the ones that have a parent)
  const children = useMemo(() => categories.filter((c) => c.parentCategoryId), [categories]);
  const catName = useMemo(() => Object.fromEntries(categories.map((c) => [c._id, nameOf(c, lang)])), [categories, lang]);
  const shown = (products || []).filter((p) => {
    if (filter === 'visible' && !p.isVisible) return false;
    if (filter === 'hidden' && p.isVisible) return false;
    if (filter === 'low' && !isLow(p)) return false;
    if (cat && p.categoryId !== cat) return false;
    const needle = q.trim().toLowerCase();
    return !needle || `${p.name} ${loc(p, 'name', lang)}`.toLowerCase().includes(needle);
  });

  return (
    <>
      <PageHeader title={t('a.nav.products')}>
        <Link to="/admin/products/new" className="adm-btn primary">+ {t('a.prod.new')}</Link>
      </PageHeader>
      <div className="adm-toolbar">
        <input className="form-control adm-search" placeholder={t('a.search')} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="form-select" style={{ maxWidth: 220 }} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">{t('a.prod.allCategories')}</option>
          {children.map((c) => <option key={c._id} value={c._id}>{nameOf(c, lang)}</option>)}
        </select>
      </div>
      <div className="adm-tabs small">
        {[['all', 'a.prod.filterAll'], ['visible', 'a.prod.filterVisible'], ['hidden', 'a.prod.filterHidden'], ['low', 'a.prod.filterLow']].map(([k, key]) => (
          <button key={k} className={filter === k ? 'active' : ''} onClick={() => setFilter(k)} title={k === 'low' ? t('a.prod.lowRule', { n: limit }) : undefined}>{t(key)}{k === 'low' ? ` (≤ ${limit})` : ''}</button>
        ))}
      </div>

      {!products ? <Loading /> : products.length === 0 ? (
        <div className="adm-empty"><p>{t('a.prod.empty')}</p><Link to="/admin/products/new" className="adm-btn primary">+ {t('a.prod.new')}</Link></div>
      ) : shown.length === 0 ? <p className="adm-muted">{t('a.none')}</p> : (
        <div className="adm-rows">
          <div className="adm-rowhead adm-prodrow"><span>{t('a.prod.product')}</span><span>{t('a.prod.price')}</span><span>{t('a.prod.stock')}</span><span>{t('a.prod.visible')}</span><span /></div>
          {shown.map((p) => (
            <div key={p._id} className={`adm-row adm-prodrow ${p.isVisible ? '' : 'is-hidden'}`}>
              <Link to={`/admin/products/${p._id}`} className="adm-prodcell c-name">
                <img src={img(p.images?.[0], 160) || '/template/images/product-item-1.jpg'} alt="" />
                <div><b>{loc(p, 'name', lang)}</b><span className="adm-muted small">{catName[p.categoryId] || t('a.prod.noCategory')}{p.hasVariants && ` · ${p.variants.length === 1 ? t('a.prod.variantsOne') : t('a.prod.variantsCount', { n: p.variants.length })}`}</span></div>
              </Link>
              <div className="c-price">
                <InlineNumber value={p.basePrice} onSave={(n) => patch(p, { basePrice: n })} width={110} />
                {p.onSale && <div className="small adm-muted">−{p.salePercentage}% → {money(Math.round(p.basePrice * (1 - p.salePercentage / 100)))}</div>}
              </div>
              <div className="c-stock">
                {p.hasVariants ? (
                  <>
                    <Link to={`/admin/products/${p._id}`} className={`adm-stocklink ${isLow(p) ? 'low' : ''}`} title={isLow(p) ? t('a.prod.lowRule', { n: limit }) : undefined}>{stockOf(p)} · {t('a.prod.editStock')}</Link>
                    {isLow(p) && <small className="adm-lowhint">{t('a.prod.lowVariants', { n: lowCountOf(p, limit) })}</small>}
                  </>
                ) : (
                  <>
                    <span className={isLow(p) ? 'adm-lowbox' : ''}><InlineNumber value={p.stockQty} onSave={(n) => patch(p, { stockQty: n })} /></span>
                    {isLow(p) && <small className="adm-lowhint">{t('a.prod.lowRule', { n: limit })}</small>}
                  </>
                )}
              </div>
              <div className="c-vis"><button className={`adm-switch ${p.isVisible ? 'on' : ''}`} onClick={() => toggle(p)} aria-pressed={p.isVisible} title={p.isVisible ? t('a.prod.visible') : t('a.prod.hidden')}><span /></button></div>
              <div className="c-act">
                <details className="adm-menu">
                  <summary aria-label={t('a.menu.more')}>⋯</summary>
                  <div className="adm-menu-list">
                    <Link to={`/admin/products/${p._id}`}>{t('a.edit')}</Link>
                    <button onClick={() => duplicate(p)}>{t('a.prod.duplicate')}</button>
                    <button className="danger" onClick={() => remove(p)}>{t('a.delete')}</button>
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default Products;
