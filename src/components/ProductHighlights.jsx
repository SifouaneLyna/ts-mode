import { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal';
import { img, videoPoster } from '../utils/img';
import { loc } from '../utils/localize';
import { useI18n } from '../i18n/I18nContext';

// A product video: plays silently in a loop while it is on screen, pauses when you scroll away.
function AutoVideo({ src, alt, onRatio }) {
  const ref = useRef(null);
  const [muted, setMuted] = useState(true);
  const { t } = useI18n();
    // metadata can already be there before the event handler exists
  useEffect(() => {
    const v = ref.current;
    if (v && v.readyState >= 1 && v.videoWidth && v.videoHeight) onRatio?.(+(v.videoWidth / v.videoHeight).toFixed(4));
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps
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
      <video
        ref={ref}
        src={src}
        poster={videoPoster(src, 1000)}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
        onLoadedMetadata={(e) => { const v = e.currentTarget; if (v.videoWidth && v.videoHeight) onRatio?.(+(v.videoWidth / v.videoHeight).toFixed(4)); }}
      />
      <button type="button" className="hl-sound" onClick={() => setMuted((m) => !m)} aria-label={muted ? t('pd.soundOn') : t('pd.soundOff')}>
        {muted ? '🔇' : '🔊'}
      </button>
    </>
  );
}

// The box takes the real shape of its picture / video, so the whole thing is shown with no empty bars.
function Media({ block, title }) {
  const [ratio, setRatio] = useState(null);
  const isVideo = block.type === 'video';
  const imgRef = useRef(null);

  // a video's poster has the same shape as the video and loads on every phone
  useEffect(() => {
    if (!isVideo) return undefined;
    const poster = videoPoster(block.url, 600);
    if (!poster) return undefined;
    const probe = new Image();
    probe.onload = () => { if (probe.naturalWidth && probe.naturalHeight) setRatio((r) => r ?? +(probe.naturalWidth / probe.naturalHeight).toFixed(4)); };
    probe.src = poster;
    return () => { probe.onload = null; };
  }, [isVideo, block.url]);

  // a picture that was already loaded before the handler existed
  useEffect(() => {
    const i = imgRef.current;
    if (i && i.complete && i.naturalWidth && i.naturalHeight) setRatio(+(i.naturalWidth / i.naturalHeight).toFixed(4));
  }, [block.url]);

  return (
    <div className={`hl-media ${isVideo ? 'is-video' : ''}`} style={ratio ? { '--ratio': ratio } : undefined}>
      <span className="hl-corner" aria-hidden="true" />
      {isVideo
        ? <AutoVideo src={block.url} alt={title} onRatio={setRatio} />
        : (
            <img
            ref={imgRef}
            src={img(block.url, 1200)}
            alt={title}
            loading="lazy"
            decoding="async"
            onLoad={(e) => { const i = e.currentTarget; if (i.naturalWidth && i.naturalHeight) setRatio(+(i.naturalWidth / i.naturalHeight).toFixed(4)); }}
          />
        )}
    </div>
  );
}

// "More about this product": a list of blocks, each with a title, a description and a picture or a video.
// Every block is a card of the same width (its height follows its content): title, then the picture or video, then the text.
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
          const media = b.url ? <Media block={b} title={title} /> : null;

          // every block has the same width and its height follows its content: title first, then the picture / video (if any), then the text
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