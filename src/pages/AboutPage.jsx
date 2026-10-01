import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';

// Edit this copy to tell your own story.
const ABOUT = {
  intro: 'TS MODE is a women\'s fashion label built around timeless elegance. Every piece is chosen to make you feel confident, polished and entirely yourself.',
  story: 'We believe good style is not about following every trend, it is about well-made pieces with a refined finish that you reach for again and again. From the first sketch to the final stitch, we care about the details you notice and the ones you only feel.',
  pillars: [
    { title: 'Élégance', text: 'Clean cuts, rich fabrics and a quiet sense of luxury in every piece.' },
    { title: 'Style', text: 'A collection that moves with the season while staying unmistakably ours.' },
    { title: 'Féminité', text: 'Designs that celebrate women, in all their confidence and individuality.' },
  ],
};

function AboutPage() {
  return (
    <div className="container py-5" style={{ maxWidth: 900 }}>
      <Reveal>
        <div className="text-center mb-5">
          <img src="/template/images/logo.png" alt="TS Mode" style={{ height: 110, marginBottom: '1rem' }} />
          <h2 className="section-heading mb-0">Our Story</h2>
          <hr className="gold-rule" />
          <p className="about-lead">{ABOUT.intro}</p>
          <p className="about-text">{ABOUT.story}</p>
        </div>
      </Reveal>
      <div className="row g-4 mb-5">
        {ABOUT.pillars.map((p, i) => (
          <div className="col-md-4" key={p.title}>
            <Reveal delay={i * 100}>
              <div className="pillar-card">
                <h5>{p.title}</h5>
                <p>{p.text}</p>
              </div>
            </Reveal>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Link to="/products" className="btn btn-outline-gold">Discover the collection</Link>
      </div>
    </div>
  );
}

export default AboutPage;
