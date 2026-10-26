import { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal';
import { img, videoPoster } from '../utils/img';
import { loc } from '../utils/localize';
import { useI18n } from '../i18n/I18nContext';

// A product video: plays silently in a loop while it is on screen, pauses when you scroll away.
function AutoVideo({ src, alt }) {
  const ref = useRef(null);
  const [muted, setMuted] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  return (
    <>
      <video ref={ref} src={src} poster={videoPoster(src, 1000)} muted={muted} loop playsInline preload="metadata" aria-label={alt} />
      <button type="button" className="hl-sound" onClick={() => setMuted((m) => !m)} aria-label={muted ? t('pd.soundOn') : t('pd.soundOff')}>
        {muted ? '🔇' : '🔊'}
      </button>
    </>
  );
}

// "More about this product": a list of blocks, each with a title, a description and a picture or a video.
// Every block is a card of the same size: title, then the picture or video, then the text.
function ProductHighlights({ blocks }) {
  const { t, lang } = useI18n();
  const list = (blocks || []).filter((b) => b && (b.url || loc(b, 'title', lang) || loc(b, 'text', lang)));
  if (!list.length) return null;

  return (
    <section className="hl" aria-label={t('pd.more')}>
      <header className="hl-head">
        <h3 className="section-heading">{t('pd.more')}</h3>
        <div className="hl-ornament" aria-hidden="true"><span>✦</span></div>
      </header>
      <div className="hl-list">
        {list.map((b, i) => {
          const title = loc(b, 'title', lang);
          const text = loc(b, 'text', lang);
          const media = b.url ? (
            <div className={`hl-media ${b.type === 'video' ? 'is-video' : ''}`}>
              <span className="hl-corner" aria-hidden="true" />
              {b.type === 'video'
                ? <AutoVideo src={b.url} alt={title} />
                : <img src={img(b.url, 1200)} alt={title} loading="lazy" decoding="async" />}
            </div>
          ) : null;

          // every block has the same size: title first, then the picture / video (if any), then the text
          return (
            <Reveal delay={(i % 3) * 100} className="hl-item" key={i}>
              <div className={`hl-card ${media ? '' : 'no-media'}`}>
                <h3 className="hl-title">{title}</h3>
                <hr className="gold-rule" />
                {media}
                {text && <p className="hl-desc">{text}</p>}
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

export default ProductHighlights;