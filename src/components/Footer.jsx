import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { socialUrl } from '../utils/social';
import { FacebookIcon, InstagramIcon, PhoneIcon, TikTokIcon, WhatsAppIcon } from './SocialIcons';

function Footer() {
  const { t } = useI18n();
  const c = useSiteSettings().contact || {};
  const socials = [
    [c.instagram, 'instagram', InstagramIcon, 'Instagram'],
    [c.facebook, 'facebook', FacebookIcon, 'Facebook'],
    [c.tiktok, 'tiktok', TikTokIcon, 'TikTok'],
    [c.whatsapp, 'whatsapp', WhatsAppIcon, 'WhatsApp'],
  ].filter(([v]) => v);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-5">
            <img src="/template/images/logo.png" alt="TS Mode" className="footer-logo" />
            <p className="footer-tagline">{t('footer.tagline')}</p>
            {socials.length > 0 && (
              <div className="footer-social" aria-label={t('footer.follow')}>
                {socials.map(([v, key, Icon, label]) => (
                  <a key={key} href={socialUrl[key](v)} target="_blank" rel="noreferrer" aria-label={label} title={label}><Icon /></a>
                ))}
              </div>
            )}
          </div>
          <div className="col-6 col-lg-3">
            <h6>{t('footer.explore')}</h6>
            <ul>
              <li><Link to="/">{t('nav.home')}</Link></li>
              <li><Link to="/products">{t('nav.shop')}</Link></li>
              <li><Link to="/about">{t('nav.about')}</Link></li>
              <li><Link to="/contact">{t('nav.contact')}</Link></li>
              <li><Link to="/track">{t('checkout.trackLink')}</Link></li>
            </ul>
          </div>
          <div className="col-6 col-lg-4">
            <h6>{t('footer.contact')}</h6>
            <ul>
              {c.phone && <li><a href={`tel:${c.phone.replace(/\s/g, '')}`}><PhoneIcon /> <span dir="ltr">{c.phone}</span></a></li>}
              {c.whatsapp && <li><a href={socialUrl.whatsapp(c.whatsapp)} target="_blank" rel="noreferrer"><WhatsAppIcon /> <span dir="ltr">{c.whatsapp}</span></a></li>}
              {c.address && <li className="footer-address">{c.address}</li>}
              <li className="footer-cod">{t('footer.cod')}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} TS MODE · {t('footer.rights')}</div>
      </div>
    </footer>
  );
}

export default Footer;
