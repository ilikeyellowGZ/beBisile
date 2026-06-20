import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Heart, MessageCircle, Minus, Plus, ShieldCheck, Truck, X, ZoomIn } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../CartContext';
import { ALL_HAIR_PRODUCTS, CONTACT_PHONE, FRAGRANCE_PRODUCTS, HAIR_PRODUCTS, LAYBYE_TERMS, ORDER_EMAIL, PRODUCTS, SERVICE_PRODUCTS, getWhatsAppUrl } from '../constants';
import { FadeIn } from '../components/UI/FadeIn';
import { OptimizedImage } from '../components/UI/OptimizedImage';
import { ProductCard } from '../components/UI/ProductCard';
import { getImageUrl } from '../utils/images';
import {
  BUNDLE_PRODUCTS,
  CLOSURE_PRODUCT,
  CLOSURE_PRICES,
  ClosureLaceSize,
  ClosureLength,
  ClosureTexture,
  BundleLength,
  BundlePackageType,
  BundleTexture,
  BUNDLE_PRICES,
  LAUNDRY_FINISHES,
  LAUNDRY_PARTINGS,
  LaundryAddon,
  LaundryFinish,
  LaundryParting,
  LaundryServiceType,
  WIG_LAUNDRY_ADDON_PRICES,
  WIG_LAUNDRY_PRODUCT,
  WIG_LAUNDRY_SERVICE_PRICES,
  formatPrice,
  getBundlePrice,
  getClosurePrice,
  getLaundryPrice,
  hairGallery,
} from '../data/hairCatalog';
import type { Product } from '../types';

const detailCopy = {
  fragrance: {
    material: 'BISILE Eau de Parfum selected for a polished everyday scent ritual.',
    care: 'Store away from direct sunlight and heat. Apply to pulse points and allow the scent to settle naturally.',
    shipping: 'Delivery is selected after checkout details. WhatsApp support is available for delivery quotes and order care.',
  },
  hair: {
    material: 'Processed virgin hair with the finish, closure, density, and colour details listed for this piece.',
    care: 'Use gentle products, avoid excessive heat, and book BISILE laundry services when the unit needs a professional refresh.',
    shipping: 'Delivery is selected after checkout details. Proof of payment is required to confirm and process hair orders.',
  },
  service: {
    material: 'A BISILE care service prepared for wig maintenance, refresh, styling, or customisation.',
    care: 'Bring or send the unit in its current condition so the team can advise the best finish before service starts.',
    shipping: 'Collection and delivery arrangements are confirmed with the BISILE team after booking.',
  },
};

const slugifyOption = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const getWigSpecs = (product: Product) => {
  if (product.specs) return product.specs;
  const description = product.description;
  const texture = /waterwave/i.test(description) ? 'Waterwave Curls' : /kinky/i.test(description) ? 'Kinky Jerry Curl' : /jerry/i.test(description) ? 'Jerry Curls' : /bob straight/i.test(description) ? 'Bob Straight' : /straight/i.test(description) ? 'Straight' : undefined;
  const specs: Record<string, string> = {
    'Tier/collection': product.subtitle,
    'Hair type': 'Processed Virgin Hair',
  };
  const length = description.match(/\d+\s*inch/i)?.[0];
  const closure = description.match(/\d+x\d+\s*closure/i)?.[0];
  const density = description.match(/\d+%\s*density/i)?.[0];
  const laceType = /HD lace/i.test(description) ? 'HD lace' : /glueless lace/i.test(description) ? 'Glueless lace' : undefined;
  const colour = description.match(/ombre[^.]+|natural black|natural colour|colour\s*#[0-9]+/i)?.[0];
  const finish = /blunt cut/i.test(description) ? 'Blunt cut' : /bob straight/i.test(description) ? 'Bob straight' : texture;
  if (length) specs.Length = length;
  if (closure) specs['Closure size'] = closure;
  if (laceType) specs['Lace type'] = laceType;
  if (texture) specs.Texture = texture;
  if (density) specs.Density = density;
  if (colour) specs.Colour = colour;
  if (finish) specs.Finish = finish;
  return specs;
};

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = [...PRODUCTS, ...BUNDLE_PRODUCTS, CLOSURE_PRODUCT, WIG_LAUNDRY_PRODUCT].find((item) => item.id === id);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [bundlePackageType, setBundlePackageType] = useState<BundlePackageType>('Single Bundle');
  const [bundleTexture, setBundleTexture] = useState<BundleTexture>('Straight');
  const [bundleLength, setBundleLength] = useState<BundleLength>('10 inch');
  const [closureLaceSize, setClosureLaceSize] = useState<ClosureLaceSize>('4x4 Closure');
  const [closureTexture, setClosureTexture] = useState<ClosureTexture>('Straight');
  const [closureLength, setClosureLength] = useState<ClosureLength>('10 inch');
  const [laundryServiceType, setLaundryServiceType] = useState<LaundryServiceType>('Wig Wash Only');
  const [laundryParting, setLaundryParting] = useState<LaundryParting>('Middle Part');
  const [laundryFinish, setLaundryFinish] = useState<LaundryFinish>('Straightened');
  const [laundryAddOns, setLaundryAddOns] = useState<LaundryAddon[]>([]);
  const [openDetailSections, setOpenDetailSections] = useState<Record<string, boolean>>({ Description: true });
  const fallbackGallery = product?.category === 'wig' && product.notes.some((note) => /curl|waterwave|kinky/i.test(note)) ? hairGallery.curly : hairGallery.straight;
  const galleryImages = product ? Array.from(new Set([product.image, ...(product.galleryImages ?? [product.secondaryImage, product.tertiaryImage, ...fallbackGallery])].filter((image): image is string => Boolean(image)).map((image) => getImageUrl(image)))).slice(0, 4) : [];
  const lightboxImageCount = galleryImages.length;

  useEffect(() => {
    if (id === 'three-bundles') setBundlePackageType('Three Bundles');
    if (id === 'single-bundle') setBundlePackageType('Single Bundle');
  }, [id]);

  const configuredProduct = useMemo<Product | null>(() => {
    if (!product) return null;
    if (product.category === 'bundle') {
      const price = getBundlePrice(bundlePackageType, bundleTexture, bundleLength);
      return {
        ...product,
        id: `bundle-${slugifyOption(bundlePackageType)}-${slugifyOption(bundleTexture)}-${slugifyOption(bundleLength)}`,
        name: `${bundlePackageType} - ${bundleTexture} - ${bundleLength}`,
        price,
        selectedOptions: { 'Package type': bundlePackageType, Texture: bundleTexture, Length: bundleLength, 'Hair type': 'Processed Virgin Hair' },
        specs: { 'Package type': bundlePackageType, Texture: bundleTexture, Length: bundleLength, 'Hair type': 'Processed Virgin Hair' },
      };
    }
    if (product.category === 'closure') {
      const price = getClosurePrice(closureLaceSize, closureTexture, closureLength);
      return {
        ...product,
        id: `closure-${slugifyOption(closureLaceSize)}-${slugifyOption(closureTexture)}-${slugifyOption(closureLength)}`,
        name: `${closureLaceSize} - ${closureTexture} - ${closureLength}`,
        price,
        selectedOptions: { 'Lace size': closureLaceSize, Texture: closureTexture, Length: closureLength, 'Hair type': 'Processed Virgin Hair' },
        specs: { 'Lace size': closureLaceSize, Texture: closureTexture, Length: closureLength, 'Hair type': 'Processed Virgin Hair' },
      };
    }
    if (product.id === WIG_LAUNDRY_PRODUCT.id) {
      const price = getLaundryPrice(laundryServiceType, laundryAddOns);
      const addonSlug = (Object.keys(WIG_LAUNDRY_ADDON_PRICES) as LaundryAddon[])
        .filter((addOn) => laundryAddOns.includes(addOn))
        .map(slugifyOption)
        .join('-') || 'no-addons';
      return {
        ...product,
        id: `wig-laundry-${slugifyOption(laundryServiceType)}-${slugifyOption(laundryParting)}-${slugifyOption(laundryFinish)}-${addonSlug}`,
        name: `Wig Laundry - ${laundryServiceType}`,
        price,
        selectedOptions: { 'Service type': laundryServiceType, Parting: laundryParting, 'Styling finish': laundryFinish, 'Add-ons': laundryAddOns.length ? laundryAddOns.join(', ') : 'None' },
        specs: { 'Service type': laundryServiceType, Parting: laundryParting, 'Styling finish': laundryFinish, 'Add-ons': laundryAddOns.length ? laundryAddOns.join(', ') : 'None' },
      };
    }
    return product;
  }, [bundleLength, bundlePackageType, bundleTexture, closureLaceSize, closureLength, closureTexture, laundryAddOns, laundryFinish, laundryParting, laundryServiceType, product]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setAdded(false);
  }, [id]);

  useEffect(() => {
    if (!product) {
      document.title = 'BISILE | Be Luxury';
      return;
    }

    const title = `${product.name} | BISILE`;
    const description = `${product.subtitle}. ${product.description}`;
    const productImages = Array.from(new Set([product.image, ...(product.galleryImages ?? [product.secondaryImage, product.tertiaryImage])].filter((image): image is string => Boolean(image))));
    const imageUrl = new URL(getImageUrl(product.image), window.location.origin).toString();

    document.title = title;

    const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
      let tag = document.head.querySelector<HTMLMetaElement>(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'product');
    setMeta('meta[property="og:url"]', 'property', 'og:url', window.location.href);
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);

    const structuredData = document.createElement('script');
    structuredData.type = 'application/ld+json';
    structuredData.dataset.bisileProductSeo = product.id;
    structuredData.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: productImages.map((image) => new URL(getImageUrl(image), window.location.origin).toString()),
      description,
      brand: { '@type': 'Brand', name: 'BISILE' },
      category: product.collection,
      offers: {
        '@type': 'Offer',
        price: product.price.toFixed(2),
        priceCurrency: 'ZAR',
        availability: 'https://schema.org/InStock',
        url: window.location.href,
      },
    });
    document.head.querySelectorAll('script[data-bisile-product-seo]').forEach((script) => script.remove());
    document.head.appendChild(structuredData);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;

    return () => {
      structuredData.remove();
    };
  }, [product]);

  useEffect(() => {
    if (selectedImage === null) return;
    if (!lightboxImageCount) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedImage(null);
      if (event.key === 'ArrowLeft') setSelectedImage((current) => current === null ? 0 : (current - 1 + lightboxImageCount) % lightboxImageCount);
      if (event.key === 'ArrowRight') setSelectedImage((current) => current === null ? 0 : (current + 1) % lightboxImageCount);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage, lightboxImageCount]);

  if (!product) {
    return <div className="flex min-h-screen items-center justify-center bg-off-white pt-16 font-inter text-sm">Product not found.</div>;
  }

  const copy = detailCopy[product.collection];
  const backPath = product.category === 'bundle' ? '/hair/bundles' : product.category === 'closure' ? '/hair/closures' : product.category === 'laundry' ? '/hair/laundry' : product.collection === 'hair' ? '/hair/wigs' : '/shop';
  const relatedSource = product.collection === 'fragrance' ? FRAGRANCE_PRODUCTS : product.collection === 'hair' ? ALL_HAIR_PRODUCTS : SERVICE_PRODUCTS;
  const relatedProducts = relatedSource.filter((item) => item.id !== product.id).slice(0, 4);
  const detailSections = [
    { title: 'Description', body: product.description },
    { title: product.collection === 'fragrance' ? 'Scent and finish' : 'Material and finish', body: copy.material },
    { title: 'Care', body: copy.care },
    { title: 'Shipping', body: copy.shipping },
    { title: 'Bhelekazi Laybye Payments', body: `${LAYBYE_TERMS.join(' ')} Proof of payment is required to confirm and process your order. Without proof of payment, your order will be cancelled. WhatsApp: ${CONTACT_PHONE}. Email: ${ORDER_EMAIL}.` },
  ];
  const toggleDetailSection = (title: string) => {
    setOpenDetailSections((current) => ({ ...current, [title]: !current[title] }));
  };

  return (
    <div className="min-h-screen bg-off-white pt-16 text-primary">
      <section className="grid w-full gap-0 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)]">
        <div className="grid gap-px bg-[#D8D0C3] lg:grid-cols-2">
          {galleryImages.map((image, index) => (
            <div key={`${image}-${index}`} className={`bg-[#E9E6DF] ${index === 0 ? 'lg:col-span-2' : ''}`}>
              <div className={index === 0 ? 'aspect-[4/3]' : 'aspect-square'}>
                <button
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className="group relative block h-full w-full overflow-hidden text-left"
                  aria-label={`Open ${product.name} image ${index + 1}`}
                >
                  <OptimizedImage
                    src={image}
                    width={index === 0 ? 1400 : 900}
                    widths={index === 0 ? [640, 960, 1280, 1600] : [360, 540, 720, 960]}
                    sizes={index === 0 ? '(min-width: 1024px) 54vw, 100vw' : '(min-width: 1024px) 27vw, 50vw'}
                    alt={index === 0 ? product.name : `${product.name} detail ${index + 1}`}
                    className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.025] ${product.imageFit === 'contain' && index === 0 ? 'object-contain p-12 md:p-16 lg:p-20' : 'editorial-image object-cover'}`}
                  />
                  <span className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center bg-white/85 text-primary opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <ZoomIn size={18} strokeWidth={1.25} />
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-[#F7F4EF] px-6 py-8 md:px-8 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:px-10 lg:py-10">
          <Link to={backPath} className="mb-10 inline-flex items-center gap-2 font-inter text-sm font-light text-primary/55 transition-colors hover:text-accent">
            <ArrowLeft size={15} strokeWidth={1.25} /> Back to {product.collection === 'fragrance' ? 'fragrance' : 'hair'}
          </Link>

          <div className="font-inter">
            <p className="mb-3 text-sm font-light text-primary/45">Home / {product.collection} / {product.name}</p>
            <p className="mb-4 text-sm font-light text-primary/55">{product.eyebrow ?? product.subtitle}</p>
            <h1 className="text-4xl font-light leading-tight md:text-5xl">{product.name}</h1>
            {product.tagline && <p className="mt-4 max-w-xl font-serif text-base font-light italic leading-7 text-primary/70">{product.tagline}</p>}
            <p className="mt-4 text-sm font-light leading-6 text-primary/60">{product.subtitle}</p>
            <p className="mt-8 text-2xl font-light">{formatPrice(configuredProduct?.price ?? product.price)}</p>
            <p className="mt-8 max-w-xl text-sm font-light leading-7 text-primary/62">{product.description}</p>

            <div className="mt-8 flex flex-wrap gap-2">
              {product.notes.map((note) => (
                <span key={note} className="border border-[#e5e2dd] px-3 py-2 text-xs font-light text-primary/55">{note}</span>
              ))}
            </div>

            <div className="mt-8 border-y border-[#e5e2dd] py-6">
              <h2 className="mb-4 text-sm font-normal text-primary">{product.collection === 'fragrance' ? 'Scent notes & details' : product.collection === 'service' ? 'Service details' : 'Hair specifications'}</h2>
              <div className="grid gap-3 text-sm font-light text-primary/60">
                {Object.entries(configuredProduct?.specs ?? getWigSpecs(product)).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-5 border-b border-[#e5e2dd] pb-2 last:border-b-0">
                    <span>{label}</span>
                    <span className="text-right text-primary">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {product.category === 'bundle' && (
              <div className="mt-8 grid gap-5 border-b border-[#e5e2dd] pb-8">
                <label className="grid gap-2 text-sm font-light text-primary/60">
                  Package type
                  <select value={bundlePackageType} onChange={(event) => setBundlePackageType(event.target.value as BundlePackageType)} className="field-light px-4 py-4 text-sm text-primary">
                    {(Object.keys(BUNDLE_PRICES) as BundlePackageType[]).map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-light text-primary/60">
                  Texture
                  <select value={bundleTexture} onChange={(event) => setBundleTexture(event.target.value as BundleTexture)} className="field-light px-4 py-4 text-sm text-primary">
                    {(Object.keys(BUNDLE_PRICES['Single Bundle']) as BundleTexture[]).map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-light text-primary/60">
                  Length
                  <select value={bundleLength} onChange={(event) => setBundleLength(event.target.value as BundleLength)} className="field-light px-4 py-4 text-sm text-primary">
                    {(Object.keys(BUNDLE_PRICES['Single Bundle'].Straight) as BundleLength[]).map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              </div>
            )}

            {product.category === 'closure' && (
              <div className="mt-8 grid gap-5 border-b border-[#e5e2dd] pb-8">
                <label className="grid gap-2 text-sm font-light text-primary/60">
                  Lace size
                  <select value={closureLaceSize} onChange={(event) => setClosureLaceSize(event.target.value as ClosureLaceSize)} className="field-light px-4 py-4 text-sm text-primary">
                    {(Object.keys(CLOSURE_PRICES) as ClosureLaceSize[]).map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-light text-primary/60">
                  Texture
                  <select value={closureTexture} onChange={(event) => setClosureTexture(event.target.value as ClosureTexture)} className="field-light px-4 py-4 text-sm text-primary">
                    {(Object.keys(CLOSURE_PRICES['4x4 Closure']) as ClosureTexture[]).map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-light text-primary/60">
                  Length
                  <select value={closureLength} onChange={(event) => setClosureLength(event.target.value as ClosureLength)} className="field-light px-4 py-4 text-sm text-primary">
                    {(Object.keys(CLOSURE_PRICES['4x4 Closure'].Straight) as ClosureLength[]).map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              </div>
            )}

            {product.id === WIG_LAUNDRY_PRODUCT.id && (
              <div className="mt-8 grid gap-5 border-b border-[#e5e2dd] pb-8">
                <label className="grid gap-2 text-sm font-light text-primary/60">
                  Service type
                  <select value={laundryServiceType} onChange={(event) => setLaundryServiceType(event.target.value as LaundryServiceType)} className="field-light px-4 py-4 text-sm text-primary">
                    {(Object.keys(WIG_LAUNDRY_SERVICE_PRICES) as LaundryServiceType[]).map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-light text-primary/60">
                  Parting
                  <select value={laundryParting} onChange={(event) => setLaundryParting(event.target.value as LaundryParting)} className="field-light px-4 py-4 text-sm text-primary">
                    {LAUNDRY_PARTINGS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-light text-primary/60">
                  Styling finish
                  <select value={laundryFinish} onChange={(event) => setLaundryFinish(event.target.value as LaundryFinish)} className="field-light px-4 py-4 text-sm text-primary">
                    {LAUNDRY_FINISHES.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <div>
                  <p className="mb-3 text-sm font-light text-primary/60">Add-ons</p>
                  <div className="grid gap-3">
                    {(Object.keys(WIG_LAUNDRY_ADDON_PRICES) as LaundryAddon[]).map((addOn) => (
                      <label key={addOn} className="flex cursor-pointer items-center justify-between gap-4 border border-[#e5e2dd] px-4 py-3 text-sm font-light text-primary/65">
                        <span>{addOn}</span>
                        <span className="flex items-center gap-3">
                          <span>{formatPrice(WIG_LAUNDRY_ADDON_PRICES[addOn])}</span>
                          <input type="checkbox" checked={laundryAddOns.includes(addOn)} onChange={() => setLaundryAddOns((current) => current.includes(addOn) ? current.filter((item) => item !== addOn) : [...current, addOn])} />
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-10 border-y border-[#e5e2dd] py-6">
              <p className="mb-4 text-sm font-light text-primary/55">Quantity</p>
              <div className="flex items-center justify-between gap-5">
                <div className="flex h-12 items-center border border-[#e5e2dd]">
                  <button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-12 w-12 items-center justify-center hover:text-accent">
                    <Minus size={14} strokeWidth={1.25} />
                  </button>
                  <span className="min-w-10 text-center text-sm font-light">{quantity}</span>
                  <button aria-label="Increase quantity" onClick={() => setQuantity(Math.min(99, quantity + 1))} className="flex h-12 w-12 items-center justify-center hover:text-accent">
                    <Plus size={14} strokeWidth={1.25} />
                  </button>
                </div>
                <button className="flex h-12 w-12 items-center justify-center border border-[#e5e2dd] transition-colors hover:border-primary" aria-label="Save product">
                  <Heart size={17} strokeWidth={1.25} />
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                addItem(configuredProduct ?? product, quantity);
                setAdded(true);
              }}
              className="mt-6 flex h-12 w-full items-center justify-center bg-primary px-6 text-sm font-light text-white transition-colors hover:bg-accent"
            >
              {added ? 'Added to bag' : 'Add to bag'}
            </button>

            <a
              href={getWhatsAppUrl(`Hello BISILE, I would like to enquire about ${configuredProduct?.name ?? product.name}.`)}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-light text-primary/60 transition-colors hover:text-accent"
            >
              <MessageCircle size={15} strokeWidth={1.25} /> WhatsApp enquiry
            </a>

            {added && (
              <Link to="/cart" className="mt-5 inline-flex items-center gap-2 text-sm font-light text-accent">
                <Check size={15} strokeWidth={1.25} /> View your bag
              </Link>
            )}

            <div className="mt-8 grid gap-4 border-b border-[#e5e2dd] pb-8 text-sm font-light leading-6 text-primary/58">
              <div className="flex gap-3">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" strokeWidth={1.25} />
                <span>Secure checkout follows your delivery-details review.</span>
              </div>
              <div className="flex gap-3">
                <Truck size={18} className="mt-0.5 shrink-0 text-primary" strokeWidth={1.25} />
                <span>Delivery options are confirmed before payment.</span>
              </div>
            </div>

            <div className="divide-y divide-[#e5e2dd] text-sm font-light">
              {detailSections.map(({ title, body }) => {
                const isOpen = Boolean(openDetailSections[title]);
                const contentId = `product-detail-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

                return (
                  <div key={title} className="py-5">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={contentId}
                      onClick={() => toggleDetailSection(title)}
                      className="flex w-full items-center justify-between gap-6 text-left text-primary transition-colors duration-300 hover:text-accent"
                    >
                      <span>{title}</span>
                      <span className={`text-lg font-light text-primary/45 transition-transform duration-300 ease-out ${isOpen ? 'rotate-45' : 'rotate-0'}`}>+</span>
                    </button>
                    <div
                      id={contentId}
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                    >
                      <div className="overflow-hidden">
                        <p className={`max-w-xl pt-4 leading-7 text-primary/58 transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : '-translate-y-1'}`}>
                          {body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </section>

      {selectedImage !== null && (
        <div className="fixed inset-0 z-[80] bg-off-white text-primary" role="dialog" aria-modal="true" aria-label={`${product.name} image viewer`}>
          <div className="flex h-16 items-center justify-between px-5 md:px-8">
            <p className="font-inter text-sm font-light text-primary/60">{product.name} / {selectedImage + 1} of {galleryImages.length}</p>
            <button type="button" onClick={() => setSelectedImage(null)} className="flex h-11 w-11 items-center justify-center hover:text-accent" aria-label="Close image viewer">
              <X size={22} strokeWidth={1.25} />
            </button>
          </div>

          <div className="relative flex h-[calc(100vh-9rem)] items-center justify-center bg-[#E9E6DF] px-5 md:px-16">
            <button
              type="button"
              onClick={() => setSelectedImage((current) => current === null ? 0 : (current - 1 + galleryImages.length) % galleryImages.length)}
              className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white/85 backdrop-blur hover:text-accent md:left-8"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} strokeWidth={1.25} />
            </button>

            <OptimizedImage
              src={galleryImages[selectedImage]}
              width={1800}
              widths={[720, 960, 1280, 1600, 2000]}
              sizes="100vw"
              alt={`${product.name} enlarged view ${selectedImage + 1}`}
              className="max-h-full max-w-full object-contain"
            />

            <button
              type="button"
              onClick={() => setSelectedImage((current) => current === null ? 0 : (current + 1) % galleryImages.length)}
              className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white/85 backdrop-blur hover:text-accent md:right-8"
              aria-label="Next image"
            >
              <ChevronRight size={24} strokeWidth={1.25} />
            </button>
          </div>

          <div className="flex h-20 items-center gap-3 overflow-x-auto border-t border-[#e5e2dd] px-5 md:px-8">
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-thumb-${index}`}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={`h-12 w-12 shrink-0 overflow-hidden border ${index === selectedImage ? 'border-primary' : 'border-transparent'}`}
                aria-label={`View image ${index + 1}`}
              >
                <OptimizedImage src={image} width={120} widths={[120, 180, 240]} sizes="48px" alt="" className={`h-full w-full ${product.imageFit === 'contain' && index === 0 ? 'object-contain p-1' : 'object-cover'}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {relatedProducts.length > 0 && (
        <section className="bisile-shell bisile-section border-t bisile-rule">
          <div className="mb-8 flex items-end justify-between gap-6">
            <FadeIn>
              <p className="bisile-kicker mb-3">{product.collection === 'fragrance' ? 'More fragrance' : product.collection === 'hair' ? 'More hair' : 'More services'}</p>
              <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">You may also like.</h2>
            </FadeIn>
            <Link to={backPath} className="bisile-link hidden md:inline-flex">View all <ArrowRight size={15} strokeWidth={1.3} /></Link>
          </div>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item, index) => (
              <FadeIn key={item.id} delay={index * 45}>
                <ProductCard product={item} />
              </FadeIn>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
