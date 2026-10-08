import Reveal from '../components/Reveal';
import { useI18n } from '../i18n/I18nContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { socialUrl } from '../utils/social';
import { FacebookIcon, InstagramIcon, PhoneIcon, PinIcon, TikTokIcon, WhatsAppIcon } from '../components/SocialIcons';

// The owner fills these in from the admin page (Settings). Anything left empty is hidden.
// The values below are only a fallback.
const FALLBACK = { phone: '', whatsapp: '', instagram: '', facebook: '', tiktok: '', address: '', mapQuery: '' };

function ContactPage() {
  const { t } = useI18n();
  const settings = useSiteSettings();
  const c = { ...FALLBACK, ...Object.fromEntries(Object.entries(settings.contact || {}).filter(([, v]) => v)) };
  const socials = [
    [c.instagram, 'instagram', InstagramIcon, t('contact.instagramBtn')],
    [c.facebook, 'facebook', FacebookIcon, t('contact.facebookBtn')],
    [c.tiktok, 'tiktok', TikTokIcon, t('contact.tiktokBtn')],
  ].filter(([v]) => v);
  const hasDetails = c.phone || c.whatsapp || c.address || socials.length > 0;
  const empty = !hasDetails && !c.mapQuery;

  return (
    <div className="container py-5" style={{ maxWidth: 1000 }}>
      <h2 className="section-heading mb-0">{t('contact.title')}</h2>
      <hr className="gold-rule" />
      {empty && <p className="text-center text-muted">{t('contact.soon')}</p>}

      <div className="row g-4 align-items-stretch">
        {hasDetails && (
          <div className={c.mapQuery ? 'col-lg-5' : 'col-12'}>
            <Reveal className="h-100">
              <div className="contact-panel">
                {c.phone && (
                  <div className="contact-item">
                    <span className="contact-ico"><PhoneIcon /></span>
                    <div>
                      <span className="pd-label d-block">{t('contact.phone')}</span>
                      <a className="contact-number" href={`tel:${c.phone.replace(/\s/g, '')}`} dir="ltr">{c.phone}</a>
                    </div>
                  </div>
                )}
                {c.whatsapp && (
                  <div className="contact-item">
                    <span className="contact-ico"><WhatsAppIcon /></span>
                    <div>
                      <span className="pd-label d-block">{t('contact.whatsappLabel')}</span>
                      <div className="contact-number" dir="ltr">{c.whatsapp}</div>
                      <a className="btn btn-outline-gold mt-2" href={socialUrl.whatsapp(c.whatsapp)} target="_blank" rel="noreferrer">{t('contact.whatsappBtn')}</a>
                    </div>
                  </div>
                )}
                {c.address && (
                  <div className="contact-item">
                    <span className="contact-ico"><PinIcon /></span>
                    <div><span className="pd-label d-block">{t('contact.address')}</span>{c.address}</div>
                  </div>
                )}
                {socials.length > 0 && (
                  <div className="contact-item">
                    <div className="w-100">
                      <span className="pd-label d-block">{t('contact.social')}</span>
                      <div className="contact-socials">
                        {socials.map(([v, key, Icon, label]) => (
                          <a key={key} className="contact-social" href={socialUrl[key](v)} target="_blank" rel="noreferrer"><Icon /> {label}</a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        )}
        {c.mapQuery && (
          <div className={hasDetails ? 'col-lg-7' : 'col-12'}>
            <Reveal className="h-100">
              <div className="map-frame">
                <iframe title={t('contact.mapTitle')} src={`https://www.google.com/maps?q=${encodeURIComponent(c.mapQuery)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              </div>
              <div className="text-center mt-2">
                <a className="small" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.mapQuery)}`} target="_blank" rel="noreferrer">{t('contact.openMap')}</a>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactPage;
