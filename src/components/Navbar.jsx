import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getLeafCategories } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
    </svg>
  );
}

function AnnouncementBar({ hidden }) {
  const items = ['NOUVELLE COLLECTION', 'PAIEMENT À LA LIVRAISON', 'TS MODE'];
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
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
  }

  return (
    <form className={`nav-search ${className}`} onSubmit={handleSubmit} role="search">
      <input type="search" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" />
      <button type="submit" aria-label="Search">
        <svg width="20" height="20" viewBox="0 0 24 24"><use href="#search"></use></svg>
      </button>
    </form>
  );
}

function Navbar() {
  const [leafCategories, setLeafCategories] = useState([]);
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { pathname, search } = useLocation();
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
              <h5 className="offcanvas-title">Menu</h5>
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-center flex-grow-1 gap-1 gap-lg-5">
                <li className="nav-item">
                  <Link className={`nav-link ${isHome ? 'active-link' : ''}`} to="/">Home</Link>
                </li>
                <li className="nav-item dropdown nav-shop">
                  <Link className={`nav-link ${pathname === '/products' ? 'active-link' : ''}`} to="/products">Shop</Link>
                  <ul className="dropdown-menu list-unstyled">
                    {leafCategories.map((cat) => (
                      <li key={cat._id}>
                        <Link to={`/products?category=${cat._id}`} className="dropdown-item item-anchor">
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${pathname === '/about' ? 'active-link' : ''}`} to="/about">About</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${pathname === '/contact' ? 'active-link' : ''}`} to="/contact">Contact</Link>
                </li>
                <li className="nav-item d-lg-none">
                  <Link className="nav-link" to={user ? '/profile' : '/login'}>
                    {user ? 'Profile' : 'Login'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="nav-actions d-flex align-items-center ms-auto ms-lg-0">
            <SearchForm className="me-2 me-lg-3" />
            <Link to="/cart" className="nav-icon position-relative" aria-label="Cart">
              <svg width="24" height="24" viewBox="0 0 24 24"><use href="#cart"></use></svg>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
            <Link to={user ? '/profile' : '/login'} className="nav-icon d-none d-lg-block ms-3" aria-label="Profile">
              <UserIcon />
            </Link>
            <button className="navbar-toggler d-lg-none ms-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-label="Menu">
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
