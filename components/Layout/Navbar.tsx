import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useCart } from '../../CartContext';
import { ALL_HAIR_PRODUCTS, FRAGRANCE_PRODUCTS } from '../../constants';
import { brandImages, carouselImages, fragranceImages, hairImages, heroImages, packageImages } from '../../src/assets/images';
import { DiscoverGrid } from './DiscoverGrid';

type MenuPreview = {
  label: string;
  path: string;
  image: string;
};

type MenuLink = {
  label: string;
  path: string;
  scrollTo?: string;
  description?: string;
  preview?: MenuPreview[];
  links?: Array<{ label: string; path: string; scrollTo?: string; description?: string }>;
};

type SearchItem = {
  label: string;
  path: string;
  type: string;
  description: string;
  image?: string;
};

const shopPreviews: MenuPreview[] = [
  { label: 'Fragrances', path: '/fragrances', image: carouselImages.perfumeDisplay04 },
  { label: 'Bhelekazi wigs', path: '/hair/wigs', image: hairImages.straightWig01 },
  { label: 'Pamper packages', path: '/pamper', image: packageImages.product04 },
  { label: 'Wig laundry', path: '/hair/laundry', image: hairImages.straightWig07 },
];

const leftLinks: MenuLink[] = [
  {
    label: 'Shop',
    path: '/shop',
    preview: shopPreviews,
    links: [
      { label: 'Fragrances', path: '/fragrances', description: 'Imvelo Collection eau de parfum and scent rituals' },
      { label: 'Premium Hair', path: '/hair', description: 'Bhelekazi wigs, closures, bundles, and wig laundry' },
      { label: 'Bhelekazi wigs', path: '/hair/wigs', description: 'Luxury wigs with refined lace finishes' },
      { label: 'Bundles', path: '/hair/bundles', description: 'Single and three-bundle processed virgin hair' },
      { label: 'Closures & frontals', path: '/hair/closures', description: 'Premium lace closures and frontals' },
      { label: 'Wig laundry', path: '/hair/laundry', description: 'Wash, treatment, styling, and customisation' },
    ],
  },
  {
    label: 'Our Story',
    path: '/about',
    preview: [
      { label: 'Beauty that elevates your presence', path: '/about', image: packageImages.product06 },
      { label: 'Create with intention', path: '/community', image: heroImages.fragrance11 },
    ],
    links: [
      { label: 'About BISILE', path: '/about', description: 'The fragrance, hair, and care world behind the brand' },
      { label: 'Creator community', path: '/community', description: 'For creators aligned with BISILE beauty' },
      { label: 'Be Luxury', path: '/about', description: 'A quiet ritual-first point of view' },
    ],
  },
  {
    label: 'Community',
    path: '/community',
    preview: [
      { label: 'Creator circle', path: '/community', image: heroImages.fragrance10 },
      { label: 'BISILE packaging', path: '/community', image: brandImages.packagingWhite },
    ],
    links: [
      { label: 'Creator applications', path: '/community', description: 'Apply to create with BISILE' },
      { label: 'Brand fit', path: '/community', description: 'Storytelling, ritual, and luxury beauty' },
    ],
  },
];

const rightLinks: MenuLink[] = [
  {
    label: 'Contact',
    path: '/contact',
    preview: [
      { label: 'Customer care', path: '/contact', image: fragranceImages.product07 },
      { label: 'Delivery support', path: '/contact', image: hairImages.straightWig07 },
    ],
    links: [
      { label: 'Contact us', path: '/contact', description: 'Questions, quotes, and order support' },
      { label: 'Checkout', path: '/checkout', description: 'Review delivery details before payment' },
      { label: 'Your bag', path: '/cart', description: 'Return to your current selections' },
    ],
  },
];

const pageSearchItems: SearchItem[] = [
  { label: 'Shop BISILE', path: '/shop', type: 'Page', description: 'Fragrance, hair, services, and BISILE products' },
  { label: 'Fragrances', path: '/fragrances', type: 'Page', description: 'Imvelo Collection and best-selling BISILE eau de parfum' },
  { label: 'Premium Hair', path: '/hair', type: 'Page', description: 'Bhelekazi wigs, closures, bundles, and wig laundry' },
  { label: 'Bhelekazi Wigs', path: '/hair/wigs', type: 'Hair', description: 'Luxury processed virgin hair wigs' },
  { label: 'Bundles', path: '/hair/bundles', type: 'Hair', description: 'Single and three-bundle processed virgin hair' },
  { label: 'Closures & Frontals', path: '/hair/closures', type: 'Hair', description: 'Premium lace closures and frontals' },
  { label: 'Wig Laundry', path: '/hair/laundry', type: 'Service', description: 'Refresh, revive, and restyle your wig' },
  { label: 'Pamper Packages', path: '/pamper', type: 'Page', description: 'Gifting and care packages' },
  { label: 'About BISILE', path: '/about', type: 'Page', description: 'The story of Be Luxury' },
  { label: 'Contact', path: '/contact', type: 'Page', description: 'WhatsApp, email, and customer care' },
];

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuLink | null>(null);
  const [activePreview, setActivePreview] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [navTheme, setNavTheme] = useState<'hero' | 'discovery' | 'default'>('default');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveMenu(null);
    setIsSearchOpen(false);
  }, [location]);

  useEffect(() => setActivePreview(0), [activeMenu?.label]);

  useEffect(() => {
    const updateNavTheme = () => {
      if (location.pathname !== '/') {
        setNavTheme('default');
        return;
      }

      const navHeight = 64;
      const probeY = navHeight + 2;
      const hero = document.getElementById('bisile-hero');
      const discovery = document.getElementById('bisile-discovery');
      const heroRect = hero?.getBoundingClientRect();
      const discoveryRect = discovery?.getBoundingClientRect();

      if (heroRect && heroRect.top <= probeY && heroRect.bottom > probeY) {
        setNavTheme('hero');
        return;
      }

      if (discoveryRect && discoveryRect.top <= probeY && discoveryRect.bottom > probeY) {
        setNavTheme('discovery');
        return;
      }

      setNavTheme('default');
    };

    updateNavTheme();
    window.addEventListener('scroll', updateNavTheme, { passive: true });
    window.addEventListener('resize', updateNavTheme);
    return () => {
      window.removeEventListener('scroll', updateNavTheme);
      window.removeEventListener('resize', updateNavTheme);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const focusTimer = window.setTimeout(() => searchInputRef.current?.focus(), 80);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSearchOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  const searchItems = useMemo<SearchItem[]>(() => {
    const productItems = [...FRAGRANCE_PRODUCTS, ...ALL_HAIR_PRODUCTS].map((product) => ({
      label: product.name,
      path: `/product/${product.id}`,
      type: product.collection === 'fragrance' ? 'Fragrance' : product.category === 'laundry' ? 'Service' : 'Hair',
      description: `${product.subtitle}. ${product.description}`,
      image: product.image,
    }));

    return [...pageSearchItems, ...productItems];
  }, []);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return searchItems.slice(0, 8);

    return searchItems
      .filter((item) => `${item.label} ${item.type} ${item.description}`.toLowerCase().includes(query))
      .slice(0, 12);
  }, [searchItems, searchQuery]);

  const goTo = (item: { path: string; scrollTo?: string }) => {
    setActiveMenu(null);
    setIsSearchOpen(false);
    if (item.scrollTo) {
      if (location.pathname === item.path) document.getElementById(item.scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else navigate(item.path, { state: { scrollTo: item.scrollTo } });
      return;
    }
    navigate(item.path);
  };

  const openSearch = () => {
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(true);
  };

  const isHeroNav = navTheme === 'hero' && !activeMenu && !isMobileMenuOpen;
  const isDiscoveryNav = navTheme === 'discovery' && !activeMenu && !isMobileMenuOpen;
  const navTextClass = isHeroNav ? 'text-[#F7F4EF]/90 hover:text-[#F7F4EF]' : 'text-[#2A2114]/82 hover:text-[#8A6F35]';
  const navIconClass = isHeroNav ? 'text-[#F7F4EF]/88 hover:text-[#F7F4EF]' : 'text-[#2A2114]/82 hover:text-[#8A6F35]';
  const navBorderClass = isHeroNav ? 'border-[#F7F4EF]/24' : 'border-[#A3915D]/28';
  const logoClass = isHeroNav ? 'brightness-0 invert' : '';
  const navSurfaceClass = (activeMenu || isMobileMenuOpen)
    ? 'border-[#A3915D]/24 bg-[#F7F4EF] text-[#2A2114] shadow-[0_10px_35px_rgba(42,33,20,0.05)]'
    : isHeroNav
      ? 'border-transparent bg-transparent text-[#F7F4EF] shadow-none'
      : isDiscoveryNav
        ? 'border-[#A3915D]/24 bg-[#E9E6DF] text-[#2A2114] shadow-[0_10px_35px_rgba(42,33,20,0.04)]'
        : 'border-[#A3915D]/24 bg-[#F7F4EF] text-[#2A2114] shadow-[0_10px_35px_rgba(42,33,20,0.05)]';

  const renderNavLink = (item: MenuLink) => (
    <button
      key={item.label}
      onMouseEnter={() => setActiveMenu(item)}
      onFocus={() => setActiveMenu(item)}
      onClick={() => goTo(item)}
      className={`font-inter text-sm font-light transition-colors duration-500 ease-out ${navTextClass}`}
    >
      {item.label}
    </button>
  );

  return (
    <>
      <nav onMouseLeave={() => setActiveMenu(null)} className={`fixed top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow,color,backdrop-filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${navSurfaceClass}`}>
        <div className="bisile-shell relative flex h-16 items-center justify-between">
          <div className="hidden items-center gap-7 md:flex">
            {leftLinks.map(renderNavLink)}
          </div>

          <Link to="/" className="absolute left-1/2 z-20 flex -translate-x-1/2 items-center justify-center transition-opacity hover:opacity-75">
            <img src={brandImages.logo} alt="BISILE - Be Luxury" className={`h-9 w-auto object-contain transition-all duration-500 ease-out md:h-10 ${logoClass}`} />
          </Link>

          <div className="hidden items-center justify-end gap-7 md:flex">
            {rightLinks.map(renderNavLink)}
            <div className={`ml-1 flex items-center gap-5 border-l pl-6 transition-all duration-500 ease-out ${navBorderClass}`}>
              <button onClick={openSearch} className={`transition-colors duration-500 ease-out ${navIconClass}`} aria-label="Search">
                <Search size={19} strokeWidth={1.25} />
              </button>
              <Link to="/dashboard" className={`transition-colors duration-500 ease-out ${navIconClass}`} aria-label="Account">
                <UserRound size={19} strokeWidth={1.25} />
              </Link>
              <Link to="/cart" className={`relative transition-colors duration-500 ease-out ${navIconClass}`} aria-label="Shopping bag">
                <ShoppingBag size={19} strokeWidth={1.25} />
                {totalItems > 0 && <span className="absolute -right-3 -top-2 rounded-full bg-[#8A6F35] px-1.5 py-0.5 text-[10px] leading-none text-[#F7F4EF]">{totalItems}</span>}
              </Link>
            </div>
          </div>

          <div className="ml-auto flex items-center justify-end gap-4 md:hidden">
            <button onClick={openSearch} className={`transition-colors duration-500 ease-out ${isHeroNav ? 'text-[#F7F4EF]' : 'text-[#2A2114]'}`} aria-label="Search">
              <Search size={20} strokeWidth={1.25} />
            </button>
            <Link to="/cart" className={`relative transition-colors duration-500 ease-out ${isHeroNav ? 'text-[#F7F4EF]' : 'text-[#2A2114]'}`} aria-label="Shopping bag">
              <ShoppingBag size={20} strokeWidth={1.25} />
              {totalItems > 0 && <span className="absolute -right-2 -top-1 rounded-full bg-[#8A6F35] px-1.5 py-0.5 text-[10px] leading-none text-[#F7F4EF]">{totalItems}</span>}
            </Link>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`transition-colors duration-500 ease-out ${isHeroNav ? 'text-[#F7F4EF]' : 'text-[#2A2114]'}`} aria-label="Toggle menu">
              {isMobileMenuOpen ? <X size={24} strokeWidth={1.25} /> : <Menu size={24} strokeWidth={1.25} />}
            </button>
          </div>
        </div>

        <div className={`hidden overflow-hidden border-b border-[#A3915D]/20 bg-[#F7F4EF] transition-all duration-300 ease-out md:block ${activeMenu ? 'max-h-[640px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {activeMenu && (
            <>
            {activeMenu.label === 'Shop' && <DiscoverGrid onNavigate={goTo} />}
            <div className={`${activeMenu.label === 'Shop' ? 'hidden' : 'grid'} bisile-shell gap-12 border-t border-[#A3915D]/22 py-8 md:grid-cols-[0.65fr_1.35fr]`}>
              <div className="space-y-7">
                {activeMenu.links?.map((item, index) => (
                  <button
                    key={`${activeMenu.label}-${item.label}`}
                    onMouseEnter={() => setActivePreview(Math.min(index, (activeMenu.preview?.length ?? 1) - 1))}
                    onFocus={() => setActivePreview(Math.min(index, (activeMenu.preview?.length ?? 1) - 1))}
                    onClick={() => goTo(item)}
                    className="block w-full text-left"
                  >
                    <span className="block font-inter text-sm font-light text-primary transition-colors hover:text-accent">{item.label}</span>
                    {item.description && <span className="mt-1 block max-w-xs font-inter text-xs font-light leading-5 text-primary/45">{item.description}</span>}
                  </button>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {(activeMenu.preview ?? []).slice(activePreview, activePreview + 2).concat((activeMenu.preview ?? []).slice(0, Math.max(0, activePreview + 2 - (activeMenu.preview?.length ?? 0)))).slice(0, 2).map((item) => (
                  <Link key={`${activeMenu.label}-${item.label}-${activePreview}`} to={item.path} onClick={() => setActiveMenu(null)} className="group animate-fade-in block">
                    <div className="bisile-image-frame aspect-[4/3]">
                      <img src={item.image} alt={item.label} className="editorial-image" />
                    </div>
                    <p className="mt-3 inline-flex items-center gap-2 font-inter text-sm font-light text-primary transition-colors group-hover:text-accent">
                      {item.label}
                      <ArrowRight size={15} strokeWidth={1.2} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </p>
                  </Link>
                ))}
              </div>
            </div>
            </>
          )}
        </div>
      </nav>

      <div className={`fixed inset-0 z-[70] overflow-y-auto bg-[#F7F4EF] text-primary transition-all duration-500 ease-out ${isSearchOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} role="dialog" aria-modal="true" aria-label="Search BISILE">
        <div className={`min-h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSearchOpen ? 'translate-y-0' : '-translate-y-5'}`}>
          <div className="bisile-shell relative flex h-16 items-center justify-end border-b border-[#A3915D]/24 bg-[#F7F4EF]">
            <Link to="/" onClick={() => setIsSearchOpen(false)} className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center transition-opacity hover:opacity-75">
              <img src={brandImages.logo} alt="BISILE - Be Luxury" className="h-8 w-auto object-contain md:h-9" />
            </Link>
            <button onClick={() => setIsSearchOpen(false)} className="flex h-11 w-11 items-center justify-center text-[#2A2114]/70 transition-colors hover:text-[#8A6F35]" aria-label="Close search">
              <X size={23} strokeWidth={1.15} />
            </button>
          </div>

          <div className="bisile-shell pb-12 pt-11 md:pb-20 md:pt-16">
            <div className="mx-auto max-w-[980px]">
              <p className="bisile-kicker mb-4">Search</p>
              <h2 className="font-serif text-4xl font-light leading-none md:text-6xl">Search BISILE.</h2>

              <div className="mt-8 border-b border-[#A3915D]/34 pb-4 md:mt-10">
                <label className="sr-only" htmlFor="bisile-search">Search BISILE</label>
                <div className="flex items-center gap-3 md:gap-5">
                  <Search size={21} strokeWidth={1.15} className="shrink-0 text-[#8A6F35]/70" />
                  <input
                    id="bisile-search"
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Fragrance, wigs, bundles, services"
                    className="w-full bg-transparent font-inter text-2xl font-light leading-tight text-[#2A2114] outline-none placeholder:text-[#2A2114]/30 sm:text-3xl md:text-4xl"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between gap-6">
                <span className="bisile-kicker text-primary/55">{searchQuery.trim() ? `${searchResults.length} results` : 'Suggested searches'}</span>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="font-inter text-[11px] font-light uppercase tracking-[0.18em] text-primary/50 transition-colors hover:text-accent">
                    Clear
                  </button>
                )}
              </div>

              <div className="mt-5 divide-y divide-[#A3915D]/22 border-y border-[#A3915D]/22">
                {searchResults.map((item, index) => (
                  <Link
                    key={`${item.type}-${item.label}`}
                    to={item.path}
                    onClick={() => setIsSearchOpen(false)}
                    style={{ transitionDelay: `${index * 35}ms` }}
                    className={`group grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 py-4 transition-all duration-300 hover:bg-[#E9E6DF]/60 sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:gap-6 sm:px-4 ${isSearchOpen ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
                  >
                    <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden bg-[#E9E6DF] sm:h-24 sm:w-20">
                      {item.image ? <img src={item.image} alt="" className="h-full w-full object-contain p-2" /> : <Search size={18} strokeWidth={1.15} className="text-primary/32" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-inter text-[10px] font-light uppercase tracking-[0.18em] text-accent">{item.type}</p>
                      <h3 className="mt-2 truncate font-inter text-base font-light text-primary md:text-lg">{item.label}</h3>
                      <p className="mt-1 line-clamp-2 font-inter text-xs font-light leading-5 text-primary/52 md:max-w-xl">{item.description}</p>
                    </div>
                    <ArrowRight size={17} strokeWidth={1.15} className="shrink-0 text-primary/35 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
                  </Link>
                ))}
              </div>

              {searchResults.length === 0 && (
                <div className="mt-6 border-y border-[#A3915D]/22 py-8 font-inter text-sm font-light text-primary/58">
                  No results found. Try searching for perfume, wig, bundles, closures, laundry, or contact.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`fixed inset-0 z-40 overflow-y-auto bg-[#F7F4EF] px-6 pb-10 pt-24 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className={`transition-all duration-500 ease-out ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'}`}>
          <p className="bisile-kicker mb-6 text-primary/50">Menu</p>
          <div className="border-y border-[#A3915D]/24">
            {[...leftLinks, ...rightLinks].map((item, index) => (
              <button
                key={item.label}
                onClick={() => goTo(item)}
                className="group grid w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#A3915D]/24 py-5 text-left last:border-b-0"
              >
                <span className="font-inter text-[10px] font-light uppercase tracking-[0.18em] text-accent">{String(index + 1).padStart(2, '0')}</span>
                <span>
                  <span className="block font-serif text-4xl font-light leading-none text-primary transition-colors group-hover:text-accent">{item.label}</span>
                  <span className="mt-2 block font-inter text-xs font-light leading-5 text-primary/52">{item.links?.[0]?.description ?? item.description}</span>
                </span>
                <ArrowRight size={17} strokeWidth={1.15} className="text-primary/35 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="field-light flex h-12 items-center justify-center font-inter text-[11px] font-light uppercase tracking-[0.16em] text-primary/70 transition-colors hover:border-primary/25 hover:text-accent"
            >
              Contact
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="field-light flex h-12 items-center justify-center font-inter text-[11px] font-light uppercase tracking-[0.16em] text-primary/70 transition-colors hover:border-primary/25 hover:text-accent"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
