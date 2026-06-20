import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://bisile.co.za').replace(/\/$/, '');
const DEFAULT_IMAGE = `${SITE_URL}/media/bisile/og-hero.jpg`;
const DEFAULT_TITLE = 'BISILE | Luxury Fragrance, Hair & Beauty Rituals';
const DEFAULT_DESCRIPTION = 'Shop BISILE luxury eau de parfum, processed virgin hair, wigs, bundles, closures, wig laundry, beauty rituals, and thoughtful gifting in South Africa.';

type SeoConfig = {
  title: string;
  description: string;
  image?: string;
  canonicalPath?: string;
  noindex?: boolean;
};

const routeSeo: Record<string, SeoConfig> = {
  '/': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  '/shop': {
    title: 'Shop BISILE | Fragrance, Hair, Wigs & Beauty Rituals',
    description: 'Shop BISILE eau de parfum, processed virgin hair, wigs, closures, bundles, wig laundry services, home fragrance, and gifting rituals.',
  },
  '/fragrances': {
    title: 'BISILE Fragrances | Imvelo Collection Eau de Parfum',
    description: 'Discover BISILE Imvelo Collection eau de parfum, including Indoniyamanzi, Inkanyezi, Sithelo, Langelihle, Ndalwenhle, Luyanda, and discovery sets.',
  },
  '/hair': {
    title: 'BISILE Hair | Processed Virgin Hair, Wigs, Bundles & Closures',
    description: 'Explore BISILE processed virgin hair, luxury wigs, bundles, closures, frontals, and professional wig laundry services.',
  },
  '/hair/wigs': {
    title: 'BISILE Wigs | Luxury Processed Virgin Hair Wigs',
    description: 'Shop Bhelekazi luxury wigs by BISILE, including lace closures, HD lace, glueless lace, straight, bob, jerry curl, and waterwave styles.',
  },
  '/hair/bundles': {
    title: 'BISILE Bundles | Processed Virgin Hair Bundles',
    description: 'Shop BISILE single and three-bundle processed virgin hair packages in straight, kinky curl, and waterwave textures.',
  },
  '/hair/closures': {
    title: 'BISILE Closures & Frontals | Premium Lace Pieces',
    description: 'Shop BISILE lace closures and frontals for premium installs, available in straight, kinky curl, and waterwave textures.',
  },
  '/hair/laundry': {
    title: 'BISILE Wig Laundry | Wig Wash, Treatment & Styling',
    description: 'Book BISILE wig laundry services for washing, treatment, straightening, curl activation, plucking, custom parting, and dye care.',
  },
  '/about': {
    title: 'About BISILE | Be Luxury',
    description: 'Learn about BISILE, a South African luxury beauty brand built around fragrance, processed virgin hair, care rituals, and thoughtful gifting.',
  },
  '/story': {
    title: 'BISILE Story | Be Luxury',
    description: 'Explore the story and ritual-first point of view behind BISILE fragrance, hair, beauty care, and gifting.',
    canonicalPath: '/about',
  },
  '/community': {
    title: 'BISILE Creator Community | Beauty & Lifestyle Creators',
    description: 'Apply to join the BISILE creator community for beauty, fragrance, hair, lifestyle, and ritual-led storytelling.',
  },
  '/contact': {
    title: 'Contact BISILE | Customer Care, Orders & Enquiries',
    description: 'Contact BISILE for order support, fragrance questions, hair enquiries, wig laundry bookings, delivery support, and customer care.',
  },
  '/care-packages': {
    title: 'BISILE Care Packages | Luxury Gifting Rituals',
    description: 'Discover upcoming BISILE care packages and curated pamper edits for thoughtful beauty, fragrance, and gifting moments.',
  },
  '/pamper': {
    title: 'BISILE Pamper Packages | Beauty Gifting Rituals',
    description: 'Discover upcoming BISILE pamper packages created for celebration, restoration, thoughtful care, and everyday luxury.',
  },
  '/diffusers': {
    title: 'BISILE Diffusers | Home Fragrance Rituals',
    description: 'Discover upcoming BISILE diffusers for a softer atmosphere and a refined home fragrance ritual.',
  },
  '/candles': {
    title: 'BISILE Candles | Luxury Home Fragrance',
    description: 'Discover upcoming BISILE candles for warm home fragrance, gifting, care packages, and daily beauty rituals.',
  },
  '/cart': {
    title: 'Your BISILE Bag',
    description: 'Review the BISILE products currently in your shopping bag.',
    noindex: true,
  },
  '/checkout': {
    title: 'BISILE Checkout | Delivery Details',
    description: 'Enter delivery details for your BISILE order before secure payment.',
    noindex: true,
  },
  '/payment': {
    title: 'BISILE Payment | Secure Paystack Checkout',
    description: 'Review your BISILE order and continue to secure Paystack checkout.',
    noindex: true,
  },
  '/payment/success': {
    title: 'BISILE Order Confirmation',
    description: 'BISILE order confirmation and payment verification.',
    noindex: true,
  },
  '/order-complete': {
    title: 'BISILE Order Complete',
    description: 'BISILE order completion and payment confirmation.',
    noindex: true,
  },
  '/dashboard': {
    title: 'BISILE Dashboard',
    description: 'BISILE admin dashboard.',
    noindex: true,
  },
};

const upsertMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setCanonical = (href: string) => {
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = href;
};

const setJsonLd = (id: string, payload: unknown) => {
  let script = document.head.querySelector<HTMLScriptElement>(`script[data-seo-json="${id}"]`);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seoJson = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(payload);
};

export const SeoManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname === '' ? '/' : location.pathname;
    if (path.startsWith('/product/')) return;

    const config = routeSeo[path] ?? {
      title: 'Page Not Found | BISILE',
      description: 'The requested BISILE page could not be found.',
      noindex: true,
    };
    const canonicalPath = config.canonicalPath ?? path;
    const canonical = `${SITE_URL}${canonicalPath === '/' ? '/' : canonicalPath}`;
    const image = config.image ?? DEFAULT_IMAGE;
    const robots = config.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';

    document.title = config.title;
    upsertMeta('meta[name="description"]', 'name', 'description', config.description);
    upsertMeta('meta[name="robots"]', 'name', 'robots', robots);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', config.title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', config.description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', image);
    upsertMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', 'BISILE luxury fragrance and hair brand');
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', config.title);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', config.description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);
    upsertMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', 'BISILE luxury fragrance and hair brand');
    setCanonical(canonical);

    setJsonLd('webpage', {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: config.title,
      description: config.description,
      url: canonical,
      isPartOf: {
        '@type': 'WebSite',
        name: 'BISILE',
        url: `${SITE_URL}/`,
      },
      inLanguage: 'en-ZA',
    });
  }, [location.pathname]);

  return null;
};
