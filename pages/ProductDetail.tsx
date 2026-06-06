import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Heart, Minus, Plus, ShieldCheck, Truck, X, ZoomIn } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../CartContext';
import { FRAGRANCE_PRODUCTS, HAIR_PRODUCTS, PRODUCTS, SERVICE_PRODUCTS } from '../constants';
import { FadeIn } from '../components/UI/FadeIn';
import { ProductCard } from '../components/UI/ProductCard';

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

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = PRODUCTS.find((item) => item.id === id);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const lightboxImageCount = product ? 4 : 0;

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
    const imageUrl = new URL(product.image, window.location.origin).toString();

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
      image: [imageUrl, new URL(product.secondaryImage, window.location.origin).toString()],
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
    return <div className="flex min-h-screen items-center justify-center bg-white pt-16 font-inter text-sm">Product not found.</div>;
  }

  const copy = detailCopy[product.collection];
  const backPath = product.collection === 'hair' || product.collection === 'service' ? '/hair' : '/shop';
  const galleryImages = [product.image, product.secondaryImage, product.image, product.secondaryImage];
  const relatedSource = product.collection === 'fragrance' ? FRAGRANCE_PRODUCTS : product.collection === 'hair' ? HAIR_PRODUCTS : SERVICE_PRODUCTS;
  const relatedProducts = relatedSource.filter((item) => item.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-white pt-16 text-primary">
      <section className="grid w-full gap-0 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)]">
        <div className="grid gap-px bg-[#e5e2dd] lg:grid-cols-2">
          {galleryImages.map((image, index) => (
            <div key={`${image}-${index}`} className={`bg-[#f7f5f1] ${index === 0 ? 'lg:col-span-2' : ''}`}>
              <div className={index === 0 ? 'aspect-[4/3]' : 'aspect-square'}>
                <button
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className="group relative block h-full w-full overflow-hidden text-left"
                  aria-label={`Open ${product.name} image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={index === 0 ? product.name : `${product.name} detail ${index + 1}`}
                    className="editorial-image h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                  <span className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center bg-white/85 text-primary opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <ZoomIn size={18} strokeWidth={1.25} />
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-white px-6 py-8 md:px-8 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:px-10 lg:py-10">
          <Link to={backPath} className="mb-10 inline-flex items-center gap-2 font-inter text-sm font-light text-primary/55 transition-colors hover:text-accent">
            <ArrowLeft size={15} strokeWidth={1.25} /> Back to {product.collection === 'fragrance' ? 'fragrance' : 'hair'}
          </Link>

          <div className="font-inter">
            <p className="mb-3 text-sm font-light text-primary/45">Home / {product.collection} / {product.name}</p>
            <p className="mb-4 text-sm font-light text-primary/55">{product.eyebrow ?? product.subtitle}</p>
            <h1 className="text-4xl font-light leading-tight md:text-5xl">{product.name}</h1>
            <p className="mt-4 text-sm font-light leading-6 text-primary/60">{product.subtitle}</p>
            <p className="mt-8 text-2xl font-light">R {product.price.toFixed(2)}</p>
            <p className="mt-8 max-w-xl text-sm font-light leading-7 text-primary/62">{product.description}</p>

            <div className="mt-8 flex flex-wrap gap-2">
              {product.notes.map((note) => (
                <span key={note} className="border border-[#e5e2dd] px-3 py-2 text-xs font-light text-primary/55">{note}</span>
              ))}
            </div>

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
                addItem(product, quantity);
                setAdded(true);
              }}
              className="mt-6 flex h-12 w-full items-center justify-center bg-primary px-6 text-sm font-light text-white transition-colors hover:bg-accent"
            >
              {added ? 'Added to bag' : 'Add to bag'}
            </button>

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
              {[
                ['Description', product.description],
                [product.collection === 'fragrance' ? 'Scent and finish' : 'Material and finish', copy.material],
                ['Care', copy.care],
                ['Shipping', copy.shipping],
              ].map(([title, body]) => (
                <details key={title} className="group py-5" open={title === 'Description'}>
                  <summary className="flex cursor-pointer list-none items-center justify-between text-primary">
                    <span>{title}</span>
                    <span className="text-lg font-light text-primary/45 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 max-w-xl leading-7 text-primary/58">{body}</p>
                </details>
              ))}
            </div>
          </div>
        </aside>
      </section>

      {selectedImage !== null && (
        <div className="fixed inset-0 z-[80] bg-white text-primary" role="dialog" aria-modal="true" aria-label={`${product.name} image viewer`}>
          <div className="flex h-16 items-center justify-between px-5 md:px-8">
            <p className="font-inter text-sm font-light text-primary/60">{product.name} / {selectedImage + 1} of {galleryImages.length}</p>
            <button type="button" onClick={() => setSelectedImage(null)} className="flex h-11 w-11 items-center justify-center hover:text-accent" aria-label="Close image viewer">
              <X size={22} strokeWidth={1.25} />
            </button>
          </div>

          <div className="relative flex h-[calc(100vh-9rem)] items-center justify-center bg-[#f7f5f1] px-5 md:px-16">
            <button
              type="button"
              onClick={() => setSelectedImage((current) => current === null ? 0 : (current - 1 + galleryImages.length) % galleryImages.length)}
              className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white/85 backdrop-blur hover:text-accent md:left-8"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} strokeWidth={1.25} />
            </button>

            <img
              src={galleryImages[selectedImage]}
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
                <img src={image} alt="" className="h-full w-full object-cover" />
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
