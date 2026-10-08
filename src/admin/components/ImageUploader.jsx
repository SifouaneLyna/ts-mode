import { useRef, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { useI18n } from '../../i18n/I18nContext';
import { img } from '../../utils/img';

// Uploads pictures to Cloudinary through the backend and keeps the list of links.
function ImageUploader({ images, onChange, max = 10, compact = false }) {
  const { api, fail, notify } = useAdmin();
  const { t } = useI18n();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(e) {
    const files = [...e.target.files].slice(0, Math.max(max - images.length, 0));
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    try {
      // small pictures look blurry on the shop: tell the owner before it's a surprise
      const small = [];
      for (const f of files) {
        try {
          const bmp = await createImageBitmap(f);
          if (Math.max(bmp.width, bmp.height) < 1000) small.push(`${bmp.width}×${bmp.height}`);
          bmp.close?.();
        } catch { /* unreadable preview: the server will judge the file */ }
      }
      if (small.length) {
        const [w, h] = small[0].split('×');
        notify(t('a.up.lowRes', { w, h }), 'warn');
      }
      const uploaded = [];
      // 4 at a time keeps each request small and well under the 8-file limit
      for (let i = 0; i < files.length; i += 4) {
        const form = new FormData();
        files.slice(i, i + 4).forEach((f) => form.append('images', f));
        const data = await api('/uploads', { method: 'POST', form });
        uploaded.push(...data.images.map((x) => x.url));
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  const move = (i) => { const next = [...images]; const [item] = next.splice(i, 1); next.unshift(item); onChange(next); };

  return (
    <div className={`adm-images ${compact ? 'compact' : ''}`}>
      {images.map((url, i) => (
        <div key={url + i} className="adm-thumb">
          <img src={img(url, 300)} alt="" />
          {i === 0 && <span className="adm-cover">{t('a.prod.cover')}</span>}
          <div className="adm-thumb-actions">
            {i > 0 && <button type="button" onClick={() => move(i)}>{t('a.prod.makeCover')}</button>}
            <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))}>{t('a.remove')}</button>
          </div>
        </div>
      ))}
      {images.length < max && (
        <button type="button" className="adm-add-thumb" disabled={busy} onClick={() => input.current.click()}>
          {busy ? t('a.prod.uploading') : `+ ${t('a.prod.addImages')}`}
        </button>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={handleFiles} />
    </div>
  );
}

export default ImageUploader;
