  import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { I18nProvider } from './i18n/I18nContext';
import IconSprite from './components/IconSprite';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import TrackOrderPage from './pages/TrackOrderPage';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import Footer from './components/Footer';
import AdminRoute from './admin/AdminRoute';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import AdminOrders from './admin/pages/Orders';
import AdminProducts from './admin/pages/Products';
import ProductForm from './admin/pages/ProductForm';
import AdminCategories from './admin/pages/Categories';
import AdminDelivery from './admin/pages/Delivery';
import AdminCustomers from './admin/pages/Customers';
import AdminStaff from './admin/pages/Staff';
import AdminSettings from './admin/pages/Settings';

function AnimatedRoutes() {
  const { pathname } = useLocation();
  const firstRun = useRef(true);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (firstRun.current) { firstRun.current = false; return; }
    if (!pathname.startsWith('/admin') && window.fbq) window.fbq('track', 'PageView');
  }, [pathname]);
  return (
    <div key={pathname} className={`page-fade ${pathname.startsWith('/admin') ? 'is-admin' : ''}`}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/track" element={<TrackOrderPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminRoute ownerOnly><AdminProducts /></AdminRoute>} />
          <Route path="products/new" element={<AdminRoute ownerOnly><ProductForm /></AdminRoute>} />
          <Route path="products/:id" element={<AdminRoute ownerOnly><ProductForm /></AdminRoute>} />
          <Route path="categories" element={<AdminRoute ownerOnly><AdminCategories /></AdminRoute>} />
          <Route path="delivery" element={<AdminRoute ownerOnly><AdminDelivery /></AdminRoute>} />
          <Route path="customers" element={<AdminRoute ownerOnly><AdminCustomers /></AdminRoute>} />
          <Route path="staff" element={<AdminRoute ownerOnly><AdminStaff /></AdminRoute>} />
          <Route path="settings" element={<AdminRoute ownerOnly><AdminSettings /></AdminRoute>} />
        </Route>
      </Routes>
    </div>
  );
}

function ShopNavbar() {
  const { pathname } = useLocation();
  return pathname.startsWith('/admin') ? null : <Navbar />;
}

function ShopFooter() {
  const { pathname } = useLocation();
  return pathname.startsWith('/admin') ? null : <Footer />;
}

function App() {
  return (
    <I18nProvider>
    <AuthProvider>
    <SiteSettingsProvider>
    <CartProvider>
      <BrowserRouter>
        <IconSprite />
        <ShopNavbar />
        <AnimatedRoutes />
        <ShopFooter />
      </BrowserRouter>
    </CartProvider>
    </SiteSettingsProvider>
    </AuthProvider>
    </I18nProvider>
  );
}

export default App;