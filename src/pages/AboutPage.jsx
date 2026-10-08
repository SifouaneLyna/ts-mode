import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { useI18n } from '../i18n/I18nContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

// The story text is in src/i18n/translations.js (keys about.*), in all three languages.
function AboutPage() {
  const { t, lang } = useI18n();
  const about = useSiteSettings().about || {};
  return (
    <div className="container py-5" style={{ maxWidth: 900 }}>
      <Reveal>
        <div className="text-center mb-5">
          <img src="/template/images/logo.png" alt="TS Mode" style={{ height: 110, marginBottom: '1rem' }} />
          <h2 className="section-heading mb-0">{t('about.title')}</h2>
          <hr className="gold-rule" />
          <p className="about-lead">{about.intro?.[lang] || t('about.intro')}</p>
          <p className="about-text">{about.story?.[lang] || t('about.story')}</p>
        </div>
      </Reveal>
      <div className="row g-4 mb-5">
        {[1, 2, 3].map((n, i) => (
          <div className="col-md-4" key={n}>
            <Reveal delay={i * 100}>
              <div className="pillar-card">
                <h5>{t(`about.p${n}.title`)}</h5>
                <p>{t(`about.p${n}.text`)}</p>
              </div>
            </Reveal>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Link to="/products" className="btn btn-outline-gold">{t('about.cta')}</Link>
      </div>
    </div>
  );
}

export default AboutPage;
