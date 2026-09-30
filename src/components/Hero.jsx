function Hero() {
  return (
    <section className="position-relative overflow-hidden" style={{ height: '75vh' }}>
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
          <h1 className="mb-2" style={{ fontFamily: "'Merriweather', serif", color: '#FFFFFF', fontWeight: 700, letterSpacing: '0.1em' }}>
            TS MODE
          </h1>
          <p
            className="mb-0"
            style={{
              color: '#FDF0A6',
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              letterSpacing: '0.1em',
              fontSize: '1.2rem',
            }}
          >
            Élégance • Style • Féminité
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;