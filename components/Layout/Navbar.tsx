import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useCart } from '../../CartContext';
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

const shopPreviews: MenuPreview[] = [
  { label: 'Fragrance', path: '/shop', image: '/media/bisile/perfume-bottles.jpg' },
  { label: 'Processed hair', path: '/hair', image: '/media/bisile/wig-straight.jpg' },
  { label: 'Pamper packages', path: '/pamper', image: '/media/bisile/perfume-picnic.jpg' },
  { label: 'Wig laundry', path: '/hair', image: '/media/bisile/laundry.png' },
];

const leftLinks: MenuLink[] = [
  {
    label: 'Shop',
    path: '/shop',
    preview: shopPreviews,
    links: [
      { label: 'Fragrance', path: '/shop', description: 'BISILE eau de parfum and scent rituals' },
      { label: 'Processed hair', path: '/hair', description: 'Wigs, bundles, closures, and frontals' },
      { label: 'Pamper packages', path: '/pamper', description: 'Curated gifting and care moments' },
      { label: 'Wig laundry', path: '/hair', description: 'Wash, treatment, styling, and customisation' },
    ],
  },
  {
    label: 'Our Story',
    path: '/',
    scrollTo: 'our-story',
    preview: [
      { label: 'Beauty that feels considered', path: '/', image: '/media/bisile/perfume-basket.jpg' },
      { label: 'Create with intention', path: '/community', image: '/media/bisile/hero-perfume.jpg' },
    ],
    links: [
      { label: 'About BISILE', path: '/', scrollTo: 'our-story', description: 'The fragrance, hair, and care world behind the brand' },
      { label: 'Creator community', path: '/community', description: 'For creators aligned with BISILE beauty' },
      { label: 'Be Luxury', path: '/', scrollTo: 'our-story', description: 'A quiet ritual-first point of view' },
    ],
  },
  {
    label: 'Community',
    path: '/community',
    preview: [
      { label: 'Creator circle', path: '/community', image: '/media/bisile/hero-perfume.jpg' },
      { label: 'BISILE packaging', path: '/community', image: '/media/bisile/packaging-black.jpg' },
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
      { label: 'Customer care', path: '/contact', image: '/media/bisile/perfume-bottles.jpg' },
      { label: 'Delivery support', path: '/contact', image: '/media/bisile/laundry.png' },
    ],
    links: [
      { label: 'Contact us', path: '/contact', description: 'Questions, quotes, and order support' },
      { label: 'Checkout', path: '/checkout', description: 'Review delivery details before payment' },
      { label: 'Your bag', path: '/cart', description: 'Return to your current selections' },
    ],
  },
];

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuLink | null>(null);
  const [activePreview, setActivePreview] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveMenu(null);
  }, [location]);

  useEffect(() => setActivePreview(0), [activeMenu?.label]);

  const goTo = (item: { path: string; scrollTo?: string }) => {
    setActiveMenu(null);
    if (item.scrollTo) {
      if (location.pathname === item.path) document.getElementById(item.scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else navigate(item.path, { state: { scrollTo: item.scrollTo } });
      return;
    }
    navigate(item.path);
  };

  const renderNavLink = (item: MenuLink) => (
    <button
      key={item.label}
      onMouseEnter={() => setActiveMenu(item)}
      onFocus={() => setActiveMenu(item)}
      onClick={() => goTo(item)}
      className="font-inter text-sm font-light text-primary/80 transition-colors hover:text-accent"
    >
      {item.label}
    </button>
  );

  return (
    <>
      <nav onMouseLeave={() => setActiveMenu(null)} className="fixed top-0 z-50 w-full bg-white/95 text-primary backdrop-blur">
        <div className="bisile-shell grid h-16 grid-cols-[1fr_auto_1fr] items-center">
          <div className="hidden items-center gap-7 md:flex">
            {leftLinks.map(renderNavLink)}
          </div>

          <Link to="/" className="z-20 flex items-center justify-center transition-opacity hover:opacity-75">
            <img src="/media/logo 1.png" alt="BISILE - Be Luxury" className="h-9 w-auto object-contain md:h-10" />
          </Link>

          <div className="hidden items-center justify-end gap-7 md:flex">
            {rightLinks.map(renderNavLink)}
            <div className="ml-1 flex items-center gap-5 border-l border-[#e5e2dd] pl-6">
              <button className="text-primary/80 transition-colors hover:text-accent" aria-label="Search">
                <Search size={19} strokeWidth={1.25} />
              </button>
              <Link to="/dashboard" className="text-primary/80 transition-colors hover:text-accent" aria-label="Account">
                <UserRound size={19} strokeWidth={1.25} />
              </Link>
              <Link to="/cart" className="relative text-primary/80 transition-colors hover:text-accent" aria-label="Shopping bag">
                <ShoppingBag size={19} strokeWidth={1.25} />
                {totalItems > 0 && <span className="absolute -right-3 -top-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] leading-none text-white">{totalItems}</span>}
              </Link>
            </div>
          </div>

          <div className="col-start-3 flex items-center justify-end gap-4 md:hidden">
            <Link to="/cart" className="relative text-primary" aria-label="Shopping bag">
              <ShoppingBag size={20} strokeWidth={1.25} />
              {totalItems > 0 && <span className="absolute -right-2 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] leading-none text-white">{totalItems}</span>}
            </Link>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-primary" aria-label="Toggle menu">
              {isMobileMenuOpen ? <X size={24} strokeWidth={1.25} /> : <Menu size={24} strokeWidth={1.25} />}
            </button>
          </div>
        </div>

        <div className={`hidden overflow-hidden bg-white transition-all duration-300 ease-out md:block ${activeMenu ? 'max-h-[640px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {activeMenu && (
            <>
            {activeMenu.label === 'Shop' && <DiscoverGrid onNavigate={goTo} />}
            <div className={`${activeMenu.label === 'Shop' ? 'hidden' : 'grid'} bisile-shell gap-12 border-t border-[#efede9] py-8 md:grid-cols-[0.65fr_1.35fr]`}>
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
                    <p className="mt-3 font-inter text-sm font-light text-primary">{item.label} <span className="transition-transform group-hover:translate-x-1">→</span></p>
                  </Link>
                ))}
              </div>
            </div>
            </>
          )}
        </div>
      </nav>

      <div className={`fixed inset-0 z-40 flex transform flex-col bg-white px-6 pt-28 transition-transform duration-500 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        {[...leftLinks, ...rightLinks].map((item) => (
          <button key={item.label} onClick={() => goTo(item)} className="border-b border-[#e5e2dd] py-5 text-left font-inter text-2xl font-light hover:text-accent">
            {item.label}
          </button>
        ))}
        <div className="mt-8 flex justify-center gap-8">
          <Link to="/contact" className="text-sm font-light hover:text-accent">Contact</Link>
          <Link to="/dashboard" className="text-sm font-light hover:text-accent">Dashboard</Link>
        </div>
      </div>
    </>
  );
};
