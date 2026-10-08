import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '../AdminContext';
import { useI18n } from '../../i18n/I18nContext';
import { useAttr, useReloadSettings } from '../../context/SiteSettingsContext';
import { Loading, PageHeader, nameOf } from '../components/ui';
import ImageUploader from '../components/ImageUploader';
import ChipsInput from '../components/ChipsInput';
import { BUILTIN, SIZE_SUGGESTIONS, isColorName, isSizeName, isUniversalWord, normalize } from '../../utils/attributes';
import { comboKey, combinations, optionsFromVariants, variantsFromOptions } from '../optionsModel';

const LANGS = [['en', 'a.langEn'], ['fr', 'a.langFr'], ['ar', 'a.langAr']];
const emptyTexts = () => ({ en: { name: '', description: '' }, fr: { name: '', description: '' }, ar: { name: '', description: '' } });
const digits = (v) => v.replace(/\D/g, '');

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, notify, fail, refreshSummary } = useAdmin();
  const { t, lang } = useI18n();
  const attr = useAttr();
  const reloadSettings = useReloadSettings();

  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(!id);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(lang);
  const [f, setF] = useState({ texts: emptyTexts(), basePrice: '', categoryId: '', images: [], onSale: false, salePercentage: '', isVisible: true, stockQty: '0' });
  const [kind, setKind] = useState('simple'); // simple | options
  const [options, setOptions] = useState([]);
  const [stock, setStock] = useState({});
  const [colorImages, setColorImages] = useState({});
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [wordTr, setWordTr] = useState({}); // normalized word -> { en, fr, ar }
  const [baseline, setBaseline] = useState(null);

  // ---- load ----
  useEffect(() => {
    api('/categories').then(setCategories).catch(fail);
    if (!id) { setLoaded(true); return; }
    api(`/products/admin/${id}`).then((p) => {
      const texts = emptyTexts();
      for (const l of ['en', 'fr', 'ar']) texts[l] = { name: p.translations?.[l]?.name || '', description: p.translations?.[l]?.description || '' };
      // old products have one text only: show it in the language you are using
      if (!texts.en.name && !texts.fr.name && !texts.ar.name) texts[lang] = { name: p.name || '', description: p.description || '' };
      setF({ texts, basePrice: String(p.basePrice), categoryId: p.categoryId || '', images: p.images || [], onSale: p.onSale, salePercentage: String(p.salePercentage || ''), isVisible: p.isVisible, stockQty: String(p.stockQty || 0) });
      if (p.hasVariants) {
        const m = optionsFromVariants(p.variants || [], (w) => attr.canonical(w), (n) => (attr.known(n) ? attr.canonical(n).toLowerCase() : n));
        setKind('options'); setOptions(m.options); setStock(m.stock); setColorImages(m.colorImages);
      }
      setLoaded(true);
    }).catch(fail);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, fail, id, lang]);

  // ---- unsaved changes ----
  const snapshot = useMemo(() => JSON.stringify({ f, kind, options, stock, colorImages }), [f, kind, options, stock, colorImages]);
  useEffect(() => { if (loaded && baseline === null) setBaseline(snapshot); }, [loaded, baseline, snapshot]);
  const dirty = baseline !== null && snapshot !== baseline;
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const setText = (field) => (e) => setF({ ...f, texts: { ...f.texts, [tab]: { ...f.texts[tab], [field]: e.target.value } } });
  const copyTexts = () => setF({ ...f, texts: Object.fromEntries(LANGS.map(([l]) => [l, { name: f.texts[l].name || f.texts[tab].name, description: f.texts[l].description || f.texts[tab].description }])) });

  // ---- options ----
  const hasOption = (test) => options.some((o) => test(o.name));
  const addOption = (name) => {
    const clean = name.trim();
    if (!clean || options.some((o) => normalize(o.name) === normalize(clean))) return;
    setOptions([...options, { name: clean, values: [] }]);
  };
  const setValues = (i, values) => setOptions(options.map((o, j) => (j === i ? { ...o, values } : o)));
  const combos = combinations(options);
  const labelOf = (vals) => vals.map((v) => attr.value(v)).join(' / ');
  const setCell = (vals, value) => setStock((s) => ({ ...s, [comboKey(vals)]: digits(value) }));
  const cell = (vals) => stock[comboKey(vals)] ?? '0';
  const totalStock = combos.reduce((s, c) => s + (Number(cell(c)) || 0), 0);

  // words (option names / values) the dictionary doesn't know yet
  const unknown = useMemo(() => {
    const words = [...options.map((o) => o.name), ...options.flatMap((o) => o.values)];
    const seen = new Set();
    return words.filter((w) => {
      const k = normalize(w);
      if (!k || seen.has(k) || attr.known(w) || isUniversalWord(w)) return false;
      seen.add(k);
      return true;
    });
  }, [options, attr]);

  const colorIdx = options.findIndex((o) => isColorName(o.name));
  const sizeSuggestions = SIZE_SUGGESTIONS;
  const suggestionsFor = (name) => (isColorName(name) ? BUILTIN.colors.map((c) => c.en) : isSizeName(name) ? sizeSuggestions : []);

  // ---- save ----
  async function save(e) {
    e.preventDefault();
    const name = ['fr', 'en', 'ar'].map((l) => f.texts[l].name.trim()).find(Boolean);
    const description = ['fr', 'en', 'ar'].map((l) => f.texts[l].description.trim()).find(Boolean) || '';
    if (!name) return notify(t('a.prod.nameRequired'), 'error');
    if (f.basePrice === '' || Number.isNaN(Number(f.basePrice)) || Number(f.basePrice) < 0) return notify(t('a.prod.priceRequired'), 'error');
    const withOptions = kind === 'options';
    if (withOptions && (options.length === 0 || options.some((o) => o.values.length === 0))) return notify(t('a.pf.needValues'), 'error');

    const body = {
      name, description, translations: f.texts, basePrice: Number(f.basePrice), categoryId: f.categoryId || null, images: f.images,
      onSale: f.onSale, salePercentage: f.onSale ? Number(f.salePercentage) || 0 : 0, isVisible: f.isVisible,
      hasVariants: withOptions, stockQty: withOptions ? 0 : Number(f.stockQty) || 0,
      variants: withOptions ? variantsFromOptions(options, stock, colorImages) : [],
    };
    setSaving(true);
    try {
      await api(id ? `/products/${id}` : '/products', { method: id ? 'PUT' : 'POST', body });

      // translations typed for new words go to the shop's dictionary
      const entries = unknown.map((w) => ({ w, ...(wordTr[normalize(w)] || {}) })).filter((x) => x.en || x.fr || x.ar)
        .map((x) => ({ en: x.en || x.w, fr: x.fr || x.w, ar: x.ar || x.w }));
      if (withOptions && entries.length) {
        try {
          const current = await api('/site-settings');
          const known = new Set((current.attributes || []).flatMap((a) => ['en', 'fr', 'ar'].map((l) => normalize(a[l]))));
          const fresh = entries.filter((en) => !['en', 'fr', 'ar'].some((l) => known.has(normalize(en[l]))));
          await api('/site-settings', { method: 'PUT', body: { ...current, attributes: [...(current.attributes || []), ...fresh] } });
          reloadSettings();
        } catch (err) { fail(err); }
      }
      refreshSummary();
      setBaseline(snapshot);
      notify(t('a.saved'));
      navigate('/admin/products');
    } catch (err) { fail(err); } finally { setSaving(false); }
  }

  function cancel() {
    if (dirty && !window.confirm(t('a.pf.leave'))) return;
    navigate('/admin/products');
  }

  if (!loaded) return <Loading />;

  // only the categories customers browse (the main one, e.g. Clothing, is not offered)
  const catRows = categories.filter((c) => c.parentCategoryId).map((c) => ({ c, depth: 0 }));
  const optLabel = (name) => attr.name(name);

  return (
    <form onSubmit={save} noValidate className="adm-pf">
      <PageHeader title={id ? t('a.prod.edit') : t('a.prod.new')}>
        <Link to="/admin/products" className="adm-link" onClick={(e) => { if (dirty && !window.confirm(t('a.pf.leave'))) e.preventDefault(); }}>← {t('a.nav.products')}</Link>
      </PageHeader>

      <div className="adm-twocol">
        <div className="main">
          <section className="adm-card">
            <div className="adm-tabs small">
              {LANGS.map(([l, key]) => (
                <button type="button" key={l} className={tab === l ? 'active' : ''} onClick={() => setTab(l)}>{t(key)}{f.texts[l].name.trim() ? ' ✓' : ''}</button>
              ))}
              <button type="button" className="adm-linkbtn" onClick={copyTexts}>{t('a.pf.copyTexts')}</button>
            </div>
            <div dir={tab === 'ar' ? 'rtl' : 'ltr'}>
              <label className="adm-label">{t('a.prod.name')}</label>
              <input className="form-control mb-3" value={f.texts[tab].name} onChange={setText('name')} maxLength={150} autoFocus={!id} />
              <label className="adm-label">{t('a.prod.description')}</label>
              <textarea className="form-control" rows={4} value={f.texts[tab].description} onChange={setText('description')} maxLength={4000} />
            </div>
            <p className="adm-muted small mt-2 mb-0">{t('a.prod.textsHint')}</p>
          </section>

          <section className="adm-card">
            <h3>{t('a.prod.images')}</h3>
            <p className="adm-muted small">{t('a.prod.imagesHint')}</p>
            <ImageUploader images={f.images} onChange={(images) => setF({ ...f, images })} />
          </section>

          <section className="adm-card">
            <h3>{t('a.pf.options')}</h3>
            <div className="adm-seg">
              <button type="button" className={kind === 'simple' ? 'active' : ''} onClick={() => setKind('simple')}>{t('a.pf.simple')}</button>
              <button type="button" className={kind === 'options' ? 'active' : ''} onClick={() => setKind('options')}>{t('a.pf.withOptions')}</button>
            </div>

            {kind === 'simple' ? (
              <div style={{ maxWidth: 220, marginTop: 14 }}>
                <label className="adm-label">{t('a.pf.simpleStock')}</label>
                <input className="form-control" inputMode="numeric" value={f.stockQty} onChange={(e) => setF({ ...f, stockQty: digits(e.target.value) })} />
              </div>
            ) : (
              <div className="mt-3">
                {options.map((o, i) => (
                  <div key={o.name} className="adm-option">
                    <div className="adm-option-head">
                      <b>{optLabel(o.name)}</b>
                      <button type="button" className="adm-linkbtn danger" onClick={() => setOptions(options.filter((_, j) => j !== i))}>{t('a.pf.removeOption')}</button>
                    </div>
                    <ChipsInput values={o.values} onChange={(v) => setValues(i, v)} suggestions={suggestionsFor(o.name)} placeholder={t('a.pf.valuesPh')} />
                  </div>
                ))}

                {options.length < 3 && (
                  <div className="adm-row-actions mt-2">
                    <small className="adm-muted">{t('a.pf.addOption')}:</small>
                    {!hasOption(isSizeName) && <button type="button" className="adm-btn ghost" onClick={() => addOption('size')}>+ {t('a.pf.optSize')}</button>}
                    {!hasOption(isColorName) && <button type="button" className="adm-btn ghost" onClick={() => addOption('color')}>+ {t('a.pf.optColor')}</button>}
                    {!showCustom ? (
                      <button type="button" className="adm-btn ghost" onClick={() => setShowCustom(true)}>+ {t('a.pf.optOther')}</button>
                    ) : (
                      <span className="adm-inline-add">
                        <input className="form-control" autoFocus placeholder={t('a.pf.optionName')} value={customName} onChange={(e) => setCustomName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(customName.toLowerCase()); setCustomName(''); setShowCustom(false); } }} />
                        <button type="button" className="adm-btn primary" onClick={() => { addOption(customName.toLowerCase()); setCustomName(''); setShowCustom(false); }}>{t('a.add')}</button>
                      </span>
                    )}
                  </div>
                )}

                {combos.length > 0 && (
                  <div className="adm-stockbox">
                    <h4>{t('a.pf.matrix')} <small className="adm-muted">· {t('a.prod.totalStock', { n: totalStock })}</small></h4>
                    <p className="adm-muted small">{t('a.pf.matrixHint')}</p>
                    {options.length === 2 ? (
                      <div className="adm-scrollx">
                        <table className="adm-matrix">
                          <thead><tr><th>{optLabel(options[0].name)} ↓ / {optLabel(options[1].name)} →</th>{options[1].values.map((c) => <th key={c}>{attr.value(c)}</th>)}</tr></thead>
                          <tbody>
                            {options[0].values.map((r) => (
                              <tr key={r}>
                                <th>{attr.value(r)}</th>
                                {options[1].values.map((c) => (
                                  <td key={c}><input className="form-control" inputMode="numeric" aria-label={labelOf([r, c])} value={cell([r, c])} onFocus={(e) => e.target.select()} onChange={(e) => setCell([r, c], e.target.value)} /></td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="adm-stocklist">
                        {combos.map((c) => (
                          <label key={comboKey(c)}><span>{labelOf(c)}</span><input className="form-control" inputMode="numeric" value={cell(c)} onFocus={(e) => e.target.select()} onChange={(e) => setCell(c, e.target.value)} /></label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {colorIdx >= 0 && options[colorIdx].values.length > 0 && (
                  <details className="adm-stockbox adm-opt">
                    <summary><b>{t('a.pf.colorPictures')}</b> <small className="adm-muted">· {t('a.pf.optional')}</small></summary>
                    <p className="adm-muted small mt-2">{t('a.pf.colorPicturesHint')}</p>
                    {options[colorIdx].values.map((v) => (
                      <div key={v} className="adm-colorrow">
                        <b>{attr.value(v)}</b>
                        <ImageUploader compact images={colorImages[v] || []} onChange={(imgs) => setColorImages({ ...colorImages, [v]: imgs })} max={6} />
                      </div>
                    ))}
                  </details>
                )}

                {unknown.length > 0 && (
                  <details className="adm-stockbox adm-opt" open>
                    <summary><b>{t('a.pf.translateWords')}</b> <small className="adm-muted">· {t('a.pf.optional')}</small></summary>
                    <p className="adm-muted small">{t('a.pf.translateHint')}</p>
                    {unknown.map((w) => (
                      <div key={w} className="adm-wordrow">
                        <b>{w}</b>
                        {LANGS.map(([l, key]) => (
                          <input key={l} className="form-control" dir={l === 'ar' ? 'rtl' : 'ltr'} placeholder={t(key)}
                            value={wordTr[normalize(w)]?.[l] || ''}
                            onChange={(e) => setWordTr({ ...wordTr, [normalize(w)]: { ...wordTr[normalize(w)], [l]: e.target.value } })} />
                        ))}
                      </div>
                    ))}
                  </details>
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="side">
          <section className="adm-card">
            <h3>{t('a.pf.status')}</h3>
            <label className="adm-toggle">
              <button type="button" className={`adm-switch ${f.isVisible ? 'on' : ''}`} aria-pressed={f.isVisible} onClick={() => setF({ ...f, isVisible: !f.isVisible })}><span /></button>
              <span>{f.isVisible ? t('a.prod.visible') : t('a.prod.hidden')}</span>
            </label>
            <small className="adm-muted">{t('a.prod.showInShop')}</small>
          </section>
          <section className="adm-card">
            <h3>{t('a.pf.pricing')}</h3>
            <label className="adm-label">{t('a.prod.price')}</label>
            <input className="form-control mb-3" inputMode="decimal" value={f.basePrice} onChange={(e) => setF({ ...f, basePrice: e.target.value.replace(/[^\d.]/g, '') })} />
            <label className="adm-check"><input type="checkbox" checked={f.onSale} onChange={set('onSale')} /> {t('a.prod.onSale')}</label>
            {f.onSale && (
              <>
                <label className="adm-label mt-2">{t('a.prod.salePct')}</label>
                <input className="form-control" inputMode="numeric" value={f.salePercentage} onChange={(e) => setF({ ...f, salePercentage: digits(e.target.value) })} />
                {Number(f.basePrice) > 0 && Number(f.salePercentage) > 0 && <small className="adm-muted">→ {Math.round(Number(f.basePrice) * (1 - Number(f.salePercentage) / 100))} DA</small>}
              </>
            )}
          </section>
          <section className="adm-card">
            <h3>{t('a.prod.category')}</h3>
            <select className="form-select" value={f.categoryId} onChange={set('categoryId')}>
              <option value="">{t('a.prod.noCategory')}</option>
              {catRows.map(({ c, depth }) => <option key={c._id} value={c._id}>{'— '.repeat(depth)}{nameOf(c, lang)}</option>)}
            </select>
          </section>
        </aside>
      </div>

      <div className="adm-savebar">
        {dirty && <span className="adm-unsaved">● {t('a.pf.unsaved')}</span>}
        <button type="button" className="adm-btn ghost" onClick={cancel}>{t('a.cancel')}</button>
        <button className="adm-btn primary" disabled={saving}>{saving ? t('a.saving') : t('a.save')}</button>
      </div>
    </form>
  );
}

export default ProductForm;
