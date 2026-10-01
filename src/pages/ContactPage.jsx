import Reveal from '../components/Reveal';

// Fill these in; anything left empty is hidden.
const CONTACT = {
  whatsapp: '',   // e.g. '0555 12 34 56' or '+213 555 12 34 56'
  instagram: '',  // handle (e.g. 'ts_mode') or full profile URL
  mapQuery: '',   // address, place name, or 'latitude,longitude'
};

const whatsappDigits = (n) => {
  const d = n.replace(/\D/g, '');
  return d.startsWith('0') ? `213${d.slice(1)}` : d;
};
const instagramUrl = (v) => (v.startsWith('http') ? v : `https://instagram.com/${v.replace('@', '')}`);

function ContactPage() {
  const { whatsapp, instagram, mapQuery } = CONTACT;
  const empty = !whatsapp && !instagram && !mapQuery;

  return (
    <div className="container py-5" style={{ maxWidth: 960 }}>
      <h2 className="section-heading mb-0">Contact</h2>
      <hr className="gold-rule" />
      {empty && <p className="text-center text-muted">Contact details coming soon.</p>}

      <div className="row g-4 align-items-stretch">
        {(whatsapp || instagram) && (
          <div className="col-lg-5">
            <Reveal>
              <div className="contact-panel">
                {whatsapp && (
                  <div className="mb-4">
                    <span className="pd-label d-block">WhatsApp</span>
                    <div className="mb-3">{whatsapp}</div>
                    <a className="btn btn-outline-gold" href={`https://wa.me/${whatsappDigits(whatsapp)}`} target="_blank" rel="noreferrer">
                      Chat on WhatsApp
                    </a>
                  </div>
                )}
                {instagram && (
                  <div>
                    <span className="pd-label d-block">Instagram</span>
                    <div className="mb-3">{instagram.startsWith('http') ? 'Our Instagram page' : `@${instagram.replace('@', '')}`}</div>
                    <a className="btn btn-outline-gold" href={instagramUrl(instagram)} target="_blank" rel="noreferrer">
                      Visit our Instagram
                    </a>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        )}
        {mapQuery && (
          <div className={whatsapp || instagram ? 'col-lg-7' : 'col-12'}>
            <Reveal className="h-100">
              <div className="map-frame">
                <iframe
                  title="Our location"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="text-center mt-2">
                <a className="small" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noreferrer">
                  Open in Google Maps
                </a>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactPage;
