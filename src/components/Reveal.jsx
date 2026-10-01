import { useEffect, useRef, useState } from 'react';

// Content is visible by default. Only items that start below the fold are hidden,
// then revealed as they scroll into view (with a timeout so nothing can stay hidden).
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [mode, setMode] = useState('idle'); // idle (visible) | hidden | shown

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setMode('hidden');
    const show = () => setMode('shown');
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) show();
    }, { rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    const fallback = setTimeout(show, 4000);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${mode === 'hidden' ? 'is-hidden' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default Reveal;
