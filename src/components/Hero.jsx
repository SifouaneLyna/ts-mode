import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="position-relative overflow-hidden" style={{ height: '100vh', minHeight: '560px' }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src="/template/videos/hero-video.mp4" type="video/mp4" />
      </video>

      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '55%',
          height: '100%',
          background: 'linear-gradient(to left, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)',
          zIndex: 1,
        }}
      ></div>

      <div
        className="position-relative h-100 d-flex flex-column align-items-end justify-content-center fade-in"
        style={{ zIndex: 2, paddingRight: '8%', paddingLeft: '20%' }}
      >
        {/* This inner block centers the two lines relative to EACH OTHER,
            while the outer block above keeps the same right-side position as before */}
        <div className="d-flex flex-column align-items-center text-center">
          <h1 className="hero-title text-gold-metallic mb-2" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, letterSpacing: '0.18em', fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}>
            TS MODE
          </h1>
          <hr className="gold-rule" />
          <p
            className="mb-4"
            style={{
              color: '#FDF0A6',
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              letterSpacing: '0.12em',
              fontSize: '1.15rem',
            }}
          >
            Élégance • Style • Féminité
          </p>
          <Link to="/products" className="btn btn-outline-gold on-dark">Shop the Collection</Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;