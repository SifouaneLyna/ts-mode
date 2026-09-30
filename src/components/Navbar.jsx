import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getLeafCategories } from '../services/api';
import { useCart } from '../context/CartContext';

function Navbar() {
  const [leafCategories, setLeafCategories] = useState([]);
  const { totalItems } = useCart();
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const transparent = isHome && !scrolled;

  useEffect(() => {
  getLeafCategories().then(setLeafCategories).catch(() => {});
  }, []);

  return (
    <>
    <nav className={`navbar navbar-expand-lg navbar-ts text-uppercase fs-6 p-3 align-items-center ${transparent ? 'is-top' : ''}`}>
      <div className="container-fluid">
        <div className="row justify-content-between align-items-center w-100">

<div className="col-auto">
  <Link className="navbar-brand py-0 m-0" to="/">
    <img
      src="/template/images/logo.png"
      alt="TS Mode"
      className="d-block"
      style={{ height: '60px', margin: '-8px 0' }}
    />
  </Link>
</div>

          <div className="col-auto">
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasNavbar"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar">
              <div className="offcanvas-header">
                <h5 className="offcanvas-title">Menu</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
              </div>
              <div className="offcanvas-body">
                <ul className="navbar-nav justify-content-end flex-grow-1 gap-1 gap-md-5 pe-3">
                  <li className="nav-item">
                    <Link className="nav-link" to="/">Home</Link>
                  </li>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="dropdownShop" data-bs-toggle="dropdown">
                      Shop
                    </a>
                    <ul className="dropdown-menu list-unstyled" aria-labelledby="dropdownShop">
                      {leafCategories.map(cat => (
                        <li key={cat._id}>
                          <Link to={`/products?category=${cat._id}`} className="dropdown-item item-anchor">
                            {cat.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">Contact</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-3 col-lg-auto">
            <ul className="list-unstyled d-flex m-0">
              <li className="d-none d-lg-block">
                <a href="#" className="text-uppercase mx-3">
                  Wishlist <span className="wishlist-count">(0)</span>
                </a>
              </li>
              <li className="d-none d-lg-block">
                <Link to="/cart" className="text-uppercase mx-3">
                  Cart <span className="cart-count">({totalItems})</span>
                </Link>
              </li>

              <li className="d-lg-none">
                <a href="#" className="mx-2">
                  <svg width="24" height="24" viewBox="0 0 24 24"><use href="#heart"></use></svg>
                </a>
              </li>
              <li className="d-lg-none">
                <Link to="/cart" className="mx-2">
                  <svg width="24" height="24" viewBox="0 0 24 24"><use href="#cart"></use></svg>
                </Link>
              </li>

              <li className="mx-2">
                <a href="#" className="search-button">
                  <svg width="24" height="24" viewBox="0 0 24 24"><use href="#search"></use></svg>
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </nav>
    {!isHome && <div className="nav-spacer" />}
    </>
  );
}

export default Navbar;