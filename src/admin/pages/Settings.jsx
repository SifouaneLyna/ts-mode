import { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { useI18n } from '../../i18n/I18nContext';
import { Loading, PageHeader } from '../components/ui';
import { videoPoster } from '../../utils/img';
import { useReloadSettings } from '../../context/SiteSettingsContext';

const LANGS = [['en', 'a.langEn'], ['fr', 'a.langFr'], ['ar', 'a.langAr']];
const trio = (o) => ({ en: o?.en || '', fr: o?.fr || '', ar: o?.ar || '' });

function Settings() {
  const { api, notify, fail } = useAdmin();
  const { t } = useI18n();
  const reload = useReloadSettings();
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    api('/site-settings').then((d) => setS({
      contact: Object.fromEntries(['phone', 'whatsapp', 'instagram', 'facebook', 'tiktok', 'address', 'mapQuery'].map((k) => [k, d.contact?.[k] || ''])),
      announcements: (d.announcements || []).map(trio),
      about: { intro: trio(d.about?.intro), story: trio(d.about?.story) },
      attributes: (d.attributes || []).map(trio),
      lowStock: String(d.lowStock || 3),
      heroVideo: d.heroVideo || '',
    })).catch(fail);
  }, [api, fail]);

  if (!s) return <Loading />;
  const setContact = (k) => (e) => setS({ ...s, contact: { ...s.contact, [k]: e.target.value } });
  const setAnn = (i, l, v) => setS({ ...s, announcements: s.announcements.map((a, j) => (j === i ? { ...a, [l]: v } : a)) });
  const setAbout = (k, l, v) => setS({ ...s, about: { ...s.about, [k]: { ...s.about[k], [l]: v } } });

  // Big files go from the browser straight to Cloudinary (a one-time signed permission comes from our server)
  async function uploadVideo(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) return notify(t('a.set.heroTooBig'), 'error');
    try {
      setProgress(0);
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
        xhr.upload.onprogress = (ev) => ev.lengthComputable && setProgress(Math.round((ev.loaded / ev.total) * 100));
        xhr.onload = () => {
          const out = JSON.parse(xhr.responseText || '{}');
          xhr.status < 300 && out.secure_url ? resolve(out.secure_url) : reject(new Error(out.error?.message || 'Upload failed'));
        };
        xhr.onerror = () => reject(new Error('Failed to fetch'));
        xhr.send(form);
      });
      setS((cur) => ({ ...cur, heroVideo: url }));
      const mb = Math.round(file.size / 1048576);
      notify(mb > 20 ? t('a.set.heroBig', { n: mb }) : t('a.set.heroSaveHint'), mb > 20 ? 'warn' : 'ok');
    } catch (err) { fail(err); } finally { setProgress(null); }
  }

  async function save() {
    setSaving(true);
    try { await api('/site-settings', { method: 'PUT', body: s }); reload(); notify(t('a.saved')); } catch (err) { fail(err); } finally { setSaving(false); }
  }

  return (
    <>
      <PageHeader title={t('a.nav.settings')}>
        <button className="adm-btn primary" onClick={save} disabled={saving}>{saving ? t('a.saving') : t('a.save')}</button>
      </PageHeader>

      <details className="adm-fold" open>
        <summary>{t('a.set.contact')}</summary>
        <div className="adm-fold-body">
          <div className="adm-form-grid">
            <div><label className="adm-label">{t('a.set.phone')}</label><input className="form-control" dir="ltr" value={s.contact.phone} onChange={setContact('phone')} /></div>
            <div><label className="adm-label">{t('a.set.whatsapp')}</label><input className="form-control" dir="ltr" value={s.contact.whatsapp} onChange={setContact('whatsapp')} /><small className="adm-muted">{t('a.set.whatsappHint')}</small></div>
            <div><label className="adm-label">{t('a.set.instagram')}</label><input className="form-control" dir="ltr" value={s.contact.instagram} onChange={setContact('instagram')} /><small className="adm-muted">{t('a.set.linkHint')}</small></div>
            <div><label className="adm-label">{t('a.set.facebook')}</label><input className="form-control" dir="ltr" value={s.contact.facebook} onChange={setContact('facebook')} /><small className="adm-muted">{t('a.set.linkHint')}</small></div>
            <div><label className="adm-label">{t('a.set.tiktok')}</label><input className="form-control" dir="ltr" value={s.contact.tiktok} onChange={setContact('tiktok')} /><small className="adm-muted">{t('a.set.linkHint')}</small></div>
            <div><label className="adm-label">{t('a.set.address')}</label><input className="form-control" value={s.contact.address} onChange={setContact('address')} /></div>
          </div>
          <label className="adm-label mt-2">{t('a.set.map')}</label>
          <input className="form-control" value={s.contact.mapQuery} onChange={setContact('mapQuery')} />
          <small className="adm-muted">{t('a.set.mapHint')}</small>
        </div>
      </details>

      <details className="adm-fold">
        <summary>{t('a.set.hero')}</summary>
        <div className="adm-fold-body">
          <p className="adm-muted small">{t('a.set.heroHint')}</p>
          {s.heroVideo && <img src={videoPoster(s.heroVideo, 480) || ''} alt="" style={{ maxWidth: 260, borderRadius: 10, display: s.heroVideo.includes('/video/upload/') ? 'block' : 'none', marginBottom: 12 }} />}
          <div className="adm-row-actions mb-2">
            <label className="adm-btn primary" style={{ cursor: 'pointer', opacity: progress !== null ? 0.6 : 1 }}>
              {progress !== null ? t('a.set.heroUploading', { n: progress }) : t('a.set.heroUpload')}
              <input type="file" accept="video/mp4,video/webm,video/quicktime" hidden disabled={progress !== null} onChange={uploadVideo} />
            </label>
            {s.heroVideo && <button type="button" className="adm-btn ghost" onClick={() => setS({ ...s, heroVideo: '' })}>{t('a.set.heroDefault')}</button>}
          </div>
          <label className="adm-label">{t('a.set.heroUrl')}</label>
          <input className="form-control" dir="ltr" value={s.heroVideo} onChange={(e) => setS({ ...s, heroVideo: e.target.value.trim() })} placeholder="https://res.cloudinary.com/…" />
        </div>
      </details>

      <details className="adm-fold">
        <summary>{t('a.set.stockTitle')}</summary>
        <div className="adm-fold-body">
          <label className="adm-label">{t('a.set.lowStock')}</label>
          <input className="form-control" style={{ maxWidth: 120 }} inputMode="numeric" value={s.lowStock} onChange={(e) => setS({ ...s, lowStock: e.target.value.replace(/\D/g, '') })} />
          <small className="adm-muted d-block mt-1">{t('a.set.lowStockHint')}</small>
        </div>
      </details>

      <details className="adm-fold">
        <summary>{t('a.set.announce')}</summary>
        <div className="adm-fold-body">
        <p className="adm-muted small">{t('a.set.announceHint')}</p>
        {s.announcements.map((a, i) => (
          <div key={i} className="adm-ann">
            {LANGS.map(([l, key]) => (
              <input key={l} className="form-control" dir={l === 'ar' ? 'rtl' : 'ltr'} placeholder={t(key)} maxLength={120} value={a[l]} onChange={(e) => setAnn(i, l, e.target.value)} />
            ))}
            <button type="button" className="adm-btn danger ghost" onClick={() => setS({ ...s, announcements: s.announcements.filter((_, j) => j !== i) })} aria-label={t('a.remove')}>×</button>
          </div>
        ))}
        {s.announcements.length < 6 && <button type="button" className="adm-btn ghost" onClick={() => setS({ ...s, announcements: [...s.announcements, trio()] })}>+ {t('a.set.addMessage')}</button>}
        </div>
      </details>

      <details className="adm-fold">
        <summary>{t('a.set.words')}</summary>
        <div className="adm-fold-body">
        <p className="adm-muted small">{t('a.set.wordsHint')}</p>
        {s.attributes.map((a, i) => (
          <div key={i} className="adm-ann">
            {LANGS.map(([l, key]) => (
              <input key={l} className="form-control" dir={l === 'ar' ? 'rtl' : 'ltr'} placeholder={t(key)} maxLength={40} value={a[l]}
                onChange={(e) => setS({ ...s, attributes: s.attributes.map((x, j) => (j === i ? { ...x, [l]: e.target.value } : x)) })} />
            ))}
            <button type="button" className="adm-btn danger ghost" onClick={() => setS({ ...s, attributes: s.attributes.filter((_, j) => j !== i) })} aria-label={t('a.remove')}>×</button>
          </div>
        ))}
        <button type="button" className="adm-btn ghost" onClick={() => setS({ ...s, attributes: [...s.attributes, trio()] })}>+ {t('a.set.addWord')}</button>
        </div>
      </details>

      <details className="adm-fold">
        <summary>{t('a.set.about')}</summary>
        <div className="adm-fold-body">
        <p className="adm-muted small">{t('a.set.aboutHint')}</p>
        {[['intro', 'a.set.intro', 2], ['story', 'a.set.story', 5]].map(([k, label, rows]) => (
          <div key={k} className="mb-3">
            <label className="adm-label">{t(label)}</label>
            {LANGS.map(([l, key]) => (
              <textarea key={l} className="form-control mb-2" rows={rows} dir={l === 'ar' ? 'rtl' : 'ltr'} placeholder={t(key)} value={s.about[k][l]} onChange={(e) => setAbout(k, l, e.target.value)} />
            ))}
          </div>
        ))}
        </div>
      </details>
    </>
  );
}

export default Settings;
