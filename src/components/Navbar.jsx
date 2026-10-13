import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getLeafCategories } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { loc } from '../utils/localize';

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
    </svg>
  );
}

function AnnouncementBar({ hidden }) {
  const { t, lang } = useI18n();
  const settings = useSiteSettings();
  const custom = (settings.announcements || []).map((a) => a[lang] || a.en || a.fr || a.ar).filter(Boolean);
  const items = custom.length ? custom : [t('announce.1'), t('announce.2'), t('announce.3')];
  const group = Array.from({ length: 6 }, (_, i) => items[i % items.length]);
  return (
    <div className={`announce ${hidden ? 'is-hidden' : ''}`}>
      <div className="announce-track">
        {[0, 1].map((k) => (
          <div className="announce-group" key={k} aria-hidden={k === 1}>
            {group.map((text, i) => <span key={i}>{text}<i>✦</i></span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchForm({ className }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
  }

  return (
    <form className={`nav-search ${className}`} onSubmit={handleSubmit} role="search">
      <input type="search" placeholder={t('nav.search')} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t('nav.search')} />
      <button type="submit" aria-label={t('nav.search')}>
        <svg width="20" height="20" viewBox="0 0 24 24"><use href="#search"></use></svg>
      </button>
    </form>
  );
}

function Navbar() {
  const [leafCategories, setLeafCategories] = useState([]);
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const { pathname, search } = useLocation();
  const isStaff = user && ['owner', 'staff'].includes(user.role);
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    getLeafCategories().then(setLeafCategories).catch(() => {});
  }, []);

  // Close the mobile menu after any navigation (links stay plain router links)
  useEffect(() => {
    const el = document.getElementById('offcanvasNavbar');
    window.bootstrap?.Offcanvas.getInstance(el)?.hide();
  }, [pathname, search]);

  const transparent = isHome && !scrolled;

  return (
    <>
      <header className="site-header">
      <AnnouncementBar hidden={scrolled} />
      <nav className={`navbar navbar-expand-lg navbar-ts text-uppercase fs-6 p-3 align-items-center ${transparent ? 'is-top' : ''}`}>
        <div className="container-fluid flex-nowrap">
          <Link className="navbar-brand py-0 m-0" to="/">
            <img src="/template/images/logo.png" alt="TS Mode" className="d-block" style={{ height: '60px', margin: '-8px 0' }} />
          </Link>

          <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title">{t('nav.menu')}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-center flex-grow-1 gap-1 gap-lg-5">
                <li className="nav-item">
                  <Link className={`nav-link ${isHome ? 'active-link' : ''}`} to="/">{t('nav.home')}</Link>
                </li>
                <li className="nav-item dropdown nav-shop">
                  <Link className={`nav-link ${pathname === '/products' ? 'active-link' : ''}`} to="/products">{t('nav.shop')}</Link>
                  <ul className="dropdown-menu list-unstyled" hidden={leafCategories.length === 0}>
                    {leafCategories.map((cat) => (
                      <li key={cat._id}>
                        <Link to={`/products?category=${cat._id}`} className="dropdown-item item-anchor">
                          {loc(cat, 'name', lang)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${pathname === '/about' ? 'active-link' : ''}`} to="/about">{t('nav.about')}</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${pathname === '/contact' ? 'active-link' : ''}`} to="/contact">{t('nav.contact')}</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${pathname === '/track' ? 'active-link' : ''}`} to="/track">{t('nav.track')}</Link>
                </li>
                <li className="nav-item d-lg-none">
                  <Link className="nav-link" to={isStaff ? '/admin' : user ? '/profile' : '/login'}>
                    {user ? t('nav.profile') : t('nav.login')}
                  </Link>
                </li>
                <li className="nav-item d-lg-none">
                  <LanguageSwitcher className="mt-3" />
                </li>
              </ul>
            </div>
          </div>

          <div className="nav-actions d-flex align-items-center ms-auto ms-lg-0">
            <SearchForm className="me-2 me-lg-3" />
            <Link to="/cart" className="nav-icon position-relative" aria-label={t('nav.cart')}>
              <svg width="24" height="24" viewBox="0 0 24 24"><use href="#cart"></use></svg>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
            <Link to={isStaff ? '/admin' : user ? '/profile' : '/login'} className="nav-icon d-none d-lg-block ms-3" aria-label={t('nav.profile')}>
              <UserIcon />
            </Link>
            <LanguageSwitcher className="d-none d-lg-flex ms-3" />
            <button className="navbar-toggler d-lg-none ms-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-label={t('nav.menu')}>
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
      </nav>
      </header>
      {!isHome && <div className="nav-spacer" />}
    </>
  );
}

export default Navbar;
