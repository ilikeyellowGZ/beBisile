import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Contact } from './pages/Contact';
import { CarePackages } from './pages/CarePackages';
import { Hair } from './pages/Hair';
import { Community } from './pages/Community';
import { CartProvider } from './CartContext';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Payment } from './pages/Payment';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { Dashboard } from './pages/Dashboard';

// Scroll to top on route change wrapper, but allow section scrolling via state
const ScrollToTop = () => {
  const location = useLocation();

  React.useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    // If a specific section scroll is requested, don't force-scroll to top here.
    if (location.pathname === '/' && state?.scrollTo) return;
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <CartProvider>
        <div className="flex flex-col min-h-screen bg-off-white text-primary font-sans antialiased selection:bg-accent selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/care-packages" element={<CarePackages />} />
              <Route path="/pamper" element={<CarePackages />} />
              <Route path="/hair" element={<Hair />} />
              <Route path="/community" element={<Community />} />
              {/* Fallback / additional routes */}
              <Route path="/story" element={<Home />} /> 
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </HashRouter>
  );
};

export default App;
