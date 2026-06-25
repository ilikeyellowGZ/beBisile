import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { SeoManager } from './components/SEO/SeoManager';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Fragrances } from './pages/Fragrances';
import { ProductDetail } from './pages/ProductDetail';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { ComingSoon } from './pages/ComingSoon';
import { Hair } from './pages/Hair';
import { Wigs } from './pages/Wigs';
import { Bundles } from './pages/Bundles';
import { Closures } from './pages/Closures';
import { WigLaundry } from './pages/WigLaundry';
import { Community } from './pages/Community';
import { CartProvider } from './CartContext';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Payment } from './pages/Payment';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { backgroundImages, fragranceImages, packageImages } from './src/assets/images';
import { wakeBackend } from './utils/backendWake';

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
  React.useEffect(() => {
    void wakeBackend();
  }, []);

  return (
    <BrowserRouter>
      <SeoManager />
      <ScrollToTop />
      <CartProvider>
        <div className="flex flex-col min-h-screen bg-off-white text-primary font-sans antialiased selection:bg-accent selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/fragrances" element={<Fragrances />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/care-packages" element={<ComingSoon title="Care Packages" eyebrow="Gifting rituals" body="Care packages and pamper edits are being prepared for curated gifting, scent pairings, and thoughtful BISILE moments." image={backgroundImages.carePackages} />} />
              <Route path="/pamper" element={<ComingSoon title="Pamper Packages" eyebrow="Gifting rituals" body="Pamper packages are coming soon, with curated beauty rituals made for celebration, restoration, and thoughtful care." image={backgroundImages.carePackages} />} />
              <Route path="/diffusers" element={<ComingSoon title="Diffusers" eyebrow="Home fragrance" body="BISILE diffusers are coming soon for a softer atmosphere and a more considered room ritual." image={fragranceImages.product06} />} />
              <Route path="/candles" element={<ComingSoon title="Candles" eyebrow="Home fragrance" body="BISILE candles are coming soon as warm ritual pieces for gifting, care packages, and everyday luxury." image={packageImages.product07} />} />
              <Route path="/hair" element={<Hair />} />
              <Route path="/hair/wigs" element={<Wigs />} />
              <Route path="/hair/bundles" element={<Bundles />} />
              <Route path="/hair/closures" element={<Closures />} />
              <Route path="/hair/laundry" element={<WigLaundry />} />
              <Route path="/community" element={<Community />} />
              {/* Fallback / additional routes */}
              <Route path="/story" element={<About />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/order-complete" element={<PaymentSuccess />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/bisile-studio" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
