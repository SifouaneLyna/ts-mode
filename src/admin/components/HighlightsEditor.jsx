import { useRef, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { useI18n } from '../../i18n/I18nContext';
import { img, videoPoster } from '../../utils/img';

const LANGS = [['en', 'a.langEn'], ['fr', 'a.langFr'], ['ar', 'a.langAr']];
const MAX_BLOCKS = 8;
export const emptyBlock = () => ({ type: 'image', url: '', translations: { en: { title: '', text: '' }, fr: { title: '', text: '' }, ar: { title: '', text: '' } } });

// Turns what the server sent into the shape the editor works with
export function blocksFromProduct(list, lang) {
  return (list || []).map((b) => {
    const translations = emptyBlock().translations;
    for (const l of ['en', 'fr', 'ar']) translations[l] = { title: b.translations?.[l]?.title || '', text: b.translations?.[l]?.text || '' };
    if (!translations.en.title && !translations.fr.title && !translations.ar.title && !translations.en.text && !translations.fr.text && !translations.ar.text) {
      translations[lang] = { title: b.title || '', text: b.text || '' };
    }
    return { type: b.type === 'video' ? 'video' : 'image', url: b.url || '', translations };
  });
}

// Turns the editor blocks into what the server stores (empty blocks are dropped)
export function blocksForSave(blocks) {
  return blocks
    .map((b) => {
      const first = (field) => ['fr', 'en', 'ar'].map((l) => b.translations[l][field].trim()).find(Boolean) || '';
      return { type: b.type, url: b.url, title: first('title'), text: first('text'), translations: b.translations };
    })
    .filter((b) => b.url || b.title || b.text);
}

// "More about this product": blocks with a title, a description and a picture or a video.
function HighlightsEditor({ blocks, onChange }) {
  const { api, notify, fail } = useAdmin();
  const { t, lang } = useI18n();
  const [tab, setTab] = useState(lang);
  const [progress, setProgress] = useState({}); // block index -> 0..100 while uploading
  const files = useRef({});

  const patch = (i, change) => onChange(blocks.map((b, j) => (j === i ? { ...b, ...change } : b)));
  const setText = (i, field, value) => onChange(blocks.map((b, j) => (j === i ? { ...b, translations: { ...b.translations, [tab]: { ...b.translations[tab], [field]: value } } } : b)));
  const move = (i, d) => {
    const to = i + d;
    if (to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[to]] = [next[to], next[i]];
    onChange(next);
  };
  const busy = (i) => progress[i] !== undefined;
  const setBusy = (i, v) => setProgress((p) => { const n = { ...p }; if (v === null) delete n[i]; else n[i] = v; return n; });

  async function upload(i, e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    try {
      setBusy(i, 0);
      if (!isVideo) {
        const form = new FormData();
        form.append('images', file);
        const data = await api('/uploads', { method: 'POST', form });
        patch(i, { type: 'image', url: data.images[0].url });
      } else {
        if (file.size > 100 * 1024 * 1024) { notify(t('a.set.heroTooBig'), 'error'); return; }
        // big files go straight from the browser to Cloudinary with a one-time signed permission
        const sign = await api('/uploads/sign', { method: 'POST', body: { resourceType: 'video' } });
        const form = new FormData();
        form.append('file', file);
        form.append('api_key', sign.apiKey);
        form.append('timestamp', sign.timestamp);
        form.append('folder', sign.folder);
        form.append('signature', sign.signature);
        const url = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', sign.uploadUrl);
          xhr.upload.onprogress = (ev) => ev.lengthComputable && setBusy(i, Math.round((ev.loaded / ev.total) * 100));
          xhr.onload = () => {
            const out = JSON.parse(xhr.responseText || '{}');
            xhr.status < 300 && out.secure_url ? resolve(out.secure_url) : reject(new Error(out.error?.message || 'Upload failed'));
          };
          xhr.onerror = () => reject(new Error('Failed to fetch'));
          xhr.send(form);
        });
        patch(i, { type: 'video', url });
        const mb = Math.round(file.size / 1048576);
        if (mb > 20) notify(t('a.set.heroBig', { n: mb }), 'warn');
      }
    } catch (err) { fail(err); } finally { setBusy(i, null); }
  }

  return (
    <section className="adm-card">
      <h3>{t('a.hl.title')}</h3>
      <p className="adm-muted small">{t('a.hl.hint')}</p>

      {blocks.length > 0 && (
        <div className="adm-tabs small">
          {LANGS.map(([l, key]) => <button type="button" key={l} className={tab === l ? 'active' : ''} onClick={() => setTab(l)}>{t(key)}</button>)}
        </div>
      )}

      {blocks.map((b, i) => (
        <div className="adm-hl" key={i}>
          <div className="adm-hl-head">
            <b>{t('a.hl.block', { n: i + 1 })}</b>
            <span className="adm-hl-tools">
              <button type="button" className="adm-linkbtn" disabled={i === 0} onClick={() => move(i, -1)} aria-label={t('a.hl.up')}>↑</button>
              <button type="button" className="adm-linkbtn" disabled={i === blocks.length - 1} onClick={() => move(i, 1)} aria-label={t('a.hl.down')}>↓</button>
              <button type="button" className="adm-linkbtn danger" onClick={() => onChange(blocks.filter((_, j) => j !== i))}>{t('a.remove')}</button>
            </span>
          </div>
          <div className="adm-hl-body">
            <div className="adm-hl-media">
              {b.url ? (
                b.type === 'video'
                  ? <div className="adm-hl-preview">{videoPoster(b.url, 480) ? <img src={videoPoster(b.url, 480)} alt="" /> : <video src={b.url} muted />}<span className="adm-hl-tag">▶ {t('a.hl.video')}</span></div>
                  : <div className="adm-hl-preview"><img src={img(b.url, 480)} alt="" /></div>
              ) : <div className="adm-hl-preview empty">{t('a.hl.noMedia')}</div>}
              <button type="button" className="adm-btn ghost" disabled={busy(i)} onClick={() => files.current[i]?.click()}>
                {busy(i) ? `${t('a.prod.uploading')} ${progress[i] ? progress[i] + '%' : ''}` : b.url ? t('a.hl.replace') : `+ ${t('a.hl.add')}`}
              </button>
              {b.url && !busy(i) && <button type="button" className="adm-linkbtn danger" onClick={() => patch(i, { url: '', type: 'image' })}>{t('a.hl.removeMedia')}</button>}
              <input ref={(el) => { files.current[i] = el; }} type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime" hidden onChange={(e) => upload(i, e)} />
            </div>
            <div dir={tab === 'ar' ? 'rtl' : 'ltr'} className="adm-hl-texts">
              <label className="adm-label">{t('a.hl.blockTitle')}</label>
              <input className="form-control mb-2" value={b.translations[tab].title} maxLength={120} onChange={(e) => setText(i, 'title', e.target.value)} />
              <label className="adm-label">{t('a.hl.blockText')}</label>
              <textarea className="form-control" rows={4} value={b.translations[tab].text} maxLength={1500} onChange={(e) => setText(i, 'text', e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      {blocks.length < MAX_BLOCKS && (
        <button type="button" className="adm-btn ghost" onClick={() => onChange([...blocks, emptyBlock()])}>+ {t('a.hl.addBlock')}</button>
      )}
    </section>
  );
}

export default HighlightsEditor;