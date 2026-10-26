import { useEffect, useRef, useState } from 'react';
import { img } from '../utils/img';
import { useI18n } from '../i18n/I18nContext';

// Product pictures in a decorated frame: swipe (phone), arrows (computer), thumbnails, dots and a full-screen view.
function ProductGallery({ images, alt = '', badge = '' }) {
  const { t } = useI18n();
  const list = images && images.length ? images : ['/template/images/product-item-1.jpg'];
  const count = list.length;
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const touch = useRef(null);
  const safe = Math.min(index, count - 1);
  const go = (i) => setIndex(((i % count) + count) % count);
  const next = () => go(safe + 1);
  const prev = () => go(safe - 1);

  // another color was chosen: start again from its first picture
  const signature = list.join('|');
  useEffect(() => { setIndex(0); }, [signature]);

  // full-screen view: arrows + Escape, and the page behind doesn't scroll
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowRight') go(safe + 1);
      if (e.key === 'ArrowLeft') go(safe - 1);
    };
    document.addEventListener('keydown', onKey);
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = old; };
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const swipe = {
    onTouchStart: (e) => { const p = e.touches[0]; touch.current = { x: p.clientX, y: p.clientY }; },
    onTouchEnd: (e) => {
      if (!touch.current) return;
      const p = e.changedTouches[0];
      const dx = p.clientX - touch.current.x;
      const dy = p.clientY - touch.current.y;
      touch.current = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) (dx < 0 ? next : prev)();
    },
  };
  const onKeyDown = (e) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); };

  return (
    <div className="pg" dir="ltr">
      <div className="pg-frame">
        <div className="pg-mat">
          <div className="pg-viewport" tabIndex={0} onKeyDown={onKeyDown} {...swipe}>
            <div className="pg-track" style={{ transform: `translateX(-${safe * 100}%)` }}>
              {list.map((url, i) => (
                <button type="button" key={url + i} className="pg-slide" onClick={() => setOpen(true)} aria-label={alt}>
                  <img src={img(url, 1400, 'best')} alt={i === 0 ? alt : ''} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" draggable="false" />
                </button>
              ))}
            </div>
            {badge && <span className="pg-badge">{badge}</span>}
            {count > 1 && <span className="pg-count">{safe + 1} / {count}</span>}
            {count > 1 && (
              <>
                <button type="button" className="pg-arrow prev" onClick={prev} aria-label={t('a.prev')}>‹</button>
                <button type="button" className="pg-arrow next" onClick={next} aria-label={t('a.next')}>›</button>
              </>
            )}
          </div>
        </div>
      </div>

      {count > 1 && (
        <>
          <div className="pg-dots">
            {list.map((url, i) => <button type="button" key={url + i} className={i === safe ? 'on' : ''} onClick={() => go(i)} aria-label={`${i + 1}`} />)}
          </div>
          <div className="pg-thumbs">
            {list.map((url, i) => (
              <button type="button" key={url + i} className={i === safe ? 'on' : ''} onClick={() => go(i)} aria-label={`${i + 1}`}>
                <img src={img(url, 240, 'good')} alt="" loading="lazy" draggable="false" />
              </button>
            ))}
          </div>
        </>
      )}

      {open && (
        <div className="pg-lightbox" onClick={() => setOpen(false)} {...swipe}>
          <img src={img(list[safe], 2400, 'best')} alt={alt} onClick={(e) => e.stopPropagation()} draggable="false" />
          <button type="button" className="pg-close" onClick={() => setOpen(false)} aria-label={t('a.close')}>×</button>
          {count > 1 && (
            <>
              <button type="button" className="pg-arrow prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label={t('a.prev')}>‹</button>
              <button type="button" className="pg-arrow next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label={t('a.next')}>›</button>
              <span className="pg-count">{safe + 1} / {count}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;