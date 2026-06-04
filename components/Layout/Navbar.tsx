import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { NAV_ITEMS } from '../../constants';
import { useCart } from '../../CartContext';

export const Navbar: React.FC = () => {
  const [isPastHero, setIsPastHero] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsPastHero(window.scrollY > window.innerHeight * 0.8);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setIsMobileMenuOpen(false), [location]);

  const isHome = location.pathname === '/';
  const showHeroLightState = isHome && !isPastHero && !isMobileMenuOpen;

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    label: string,
    path: string
  ) => {
    event.preventDefault();
    if (label === 'Our Story') {
      if (location.pathname === '/') document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else navigate('/', { state: { scrollTo: 'our-story' } });
      return;
    }
    navigate(path);
  };

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-500 ${isMobileMenuOpen ? 'bg-primary/95 text-white py-4 shadow-sm' : showHeroLightState ? 'bg-transparent text-white py-6' : 'bg-secondary/95 text-primary py-4 shadow-sm'}`}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="hidden md:flex space-x-8">
            {NAV_ITEMS.slice(0, 2).map((item) => (
              <Link key={item.label} to={item.path} onClick={(e) => handleNavClick(e, item.label, item.path)} className={`text-xs tracking-[0.2em] font-sans hover:text-accent transition-colors uppercase ${showHeroLightState ? 'text-white' : 'text-primary'}`}>
                {item.label}
              </Link>
            ))}
          </div>

          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 z-20 hover:opacity-80 transition-opacity flex items-center justify-center">
            <img src="/media/logo 1.png" alt="BISILE - Be Luxury" className={`h-10 md:h-12 w-auto object-contain transition-all duration-500 ${showHeroLightState ? 'filter invert contrast-150 saturate-150' : ''}`} />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.slice(2).map((item) => (
              <Link key={item.label} to={item.path} onClick={(e) => handleNavClick(e, item.label, item.path)} className={`text-xs tracking-[0.2em] font-sans hover:text-accent transition-colors uppercase ${showHeroLightState ? 'text-white' : 'text-primary'}`}>
                {item.label}
              </Link>
            ))}
            <div className={`flex items-center space-x-6 border-l pl-6 ml-4 ${showHeroLightState ? 'border-gray-500/60' : 'border-gray-300'}`}>
              <button className={`${showHeroLightState ? 'text-white' : 'text-primary'} hover:text-accent transition-colors`} aria-label="Search">
                <Search size={18} strokeWidth={1} />
              </button>
              <Link to="/cart" className={`relative ${showHeroLightState ? 'text-white' : 'text-primary'} hover:text-accent transition-colors`}>
                <ShoppingBag size={18} strokeWidth={1} />
                {totalItems > 0 && <span className="absolute -top-2 -right-3 bg-accent text-[10px] text-white rounded-full px-1.5 py-0.5 leading-none">{totalItems}</span>}
              </Link>
            </div>
          </div>

          <div className="flex md:hidden items-center space-x-4">
            <Link to="/cart" className={`relative ${showHeroLightState ? 'text-white' : 'text-primary'}`}>
              <ShoppingBag size={20} strokeWidth={1} />
              {totalItems > 0 && <span className="absolute -top-1 -right-2 bg-accent text-[10px] text-white rounded-full px-1.5 py-0.5 leading-none">{totalItems}</span>}
            </Link>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={showHeroLightState ? 'text-white' : 'text-primary'} aria-label="Toggle menu">
              {isMobileMenuOpen ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 bg-secondary z-40 transform transition-transform duration-500 ease-in-out ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'} pt-32 px-6 md:hidden flex flex-col items-center space-y-8`}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.label} to={item.path} onClick={(e) => handleNavClick(e, item.label, item.path)} className="text-2xl font-serif italic tracking-wide hover:text-accent">
            {item.label}
          </Link>
        ))}
        <div className="pt-12 border-t border-gray-200 w-full flex justify-center space-x-8">
          <Link to="/contact" className="text-sm tracking-widest uppercase hover:text-accent">Contact</Link>
          <Link to="/dashboard" className="text-sm tracking-widest uppercase hover:text-accent">Dashboard</Link>
        </div>
      </div>
    </>
  );
};
