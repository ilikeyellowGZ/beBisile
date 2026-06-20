import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import { FadeIn } from '../components/UI/FadeIn';
import { OptimizedImage } from '../components/UI/OptimizedImage';
import {
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
  getLaundryPrice,
} from '../data/hairCatalog';
import { getWhatsAppUrl } from '../constants';
import type { Product } from '../types';

const serviceTypes = Object.keys(WIG_LAUNDRY_SERVICE_PRICES) as LaundryServiceType[];
const addOnOptions = Object.keys(WIG_LAUNDRY_ADDON_PRICES) as LaundryAddon[];

const steps = [
  'Choose your wig laundry service.',
  'Select your parting and styling preferences.',
  'Add any extra treatments if needed.',
  'Submit your order or checkout.',
  'BISILE confirms collection/drop-off and turnaround time.',
  'Your wig is washed, conditioned, dried and styled according to your choices.',
];

export const WigLaundry: React.FC = () => {
  const { addItem } = useCart();
  const [serviceType, setServiceType] = useState<LaundryServiceType>('Wig Wash Only');
  const [parting, setParting] = useState<LaundryParting>('Middle Part');
  const [finish, setFinish] = useState<LaundryFinish>('Straightened');
  const [addOns, setAddOns] = useState<LaundryAddon[]>([]);
  const [added, setAdded] = useState(false);
  const price = getLaundryPrice(serviceType, addOns);

  const summary = useMemo(() => {
    const addOnText = addOns.length ? addOns.join(', ') : 'No add-ons';
    return `${serviceType}; ${parting}; ${finish}; ${addOnText}.`;
  }, [addOns, finish, parting, serviceType]);

  const configuredProduct: Product = {
    ...WIG_LAUNDRY_PRODUCT,
    id: `wig-laundry-${serviceType.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${finish.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${addOns.join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'no-addons'}`,
    name: `Wig Laundry - ${serviceType}`,
    price,
    description: `Wig laundry booking: ${summary}`,
    selectedOptions: { 'Service type': serviceType, Parting: parting, 'Styling finish': finish, 'Add-ons': addOns.length ? addOns.join(', ') : 'None' },
    specs: { 'Service type': serviceType, Parting: parting, 'Styling finish': finish, 'Add-ons': addOns.length ? addOns.join(', ') : 'None' },
  };

  const toggleAddOn = (addOn: LaundryAddon) => {
    setAddOns((current) => current.includes(addOn) ? current.filter((item) => item !== addOn) : [...current, addOn]);
  };

  return (
    <div className="min-h-screen bg-off-white pt-16 text-primary">
      <section className="bisile-shell border-b bisile-rule py-10 md:py-14">
        <FadeIn>
          <p className="mb-3 font-inter text-sm font-light text-primary/45">Hair / Wig Laundry</p>
          <p className="bisile-kicker mb-3">Wig Laundry</p>
          <h1 className="font-inter text-4xl font-light leading-tight md:text-5xl">Refresh, revive and restyle your unit.</h1>
          <p className="mt-5 max-w-2xl font-inter text-sm font-light leading-7 text-primary/60">
            Our wig laundry service is designed to clean, detangle, condition and refresh your wig while maintaining the quality of the hair and lace.
          </p>
        </FadeIn>
      </section>

      <section className="bisile-shell bisile-section grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <FadeIn>
          <div className="bisile-image-frame aspect-[4/5]">
            <OptimizedImage src={WIG_LAUNDRY_PRODUCT.image} width={1000} widths={[480, 720, 960, 1200]} sizes="(min-width: 1024px) 48vw, 100vw" alt="BISILE wig laundry service" className="editorial-image" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {WIG_LAUNDRY_PRODUCT.galleryImages?.slice(1, 4).map((image, index) => (
              <div key={image} className="bisile-image-frame aspect-square">
                <OptimizedImage src={image} width={360} widths={[180, 240, 360, 480]} sizes="(min-width: 1024px) 16vw, 33vw" alt={`BISILE wig laundry detail ${index + 1}`} className="editorial-image" />
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div className="border-y bisile-rule py-8 font-inter">
            <p className="bisile-kicker mb-3">Premium wig care service</p>
            <h2 className="text-3xl font-light leading-tight md:text-5xl">Wig Laundry</h2>
            <p className="mt-4 max-w-xl text-sm font-light leading-7 text-primary/60">
              Keep your wig looking fresh, soft and ready to wear. Select your service type and preferred finish before checkout.
            </p>
            <p className="mt-8 text-2xl font-light">{formatPrice(price)}</p>

            <div className="mt-8 grid gap-5">
              <label className="grid gap-2 text-sm font-light text-primary/60">
                Service type
                <select value={serviceType} onChange={(event) => setServiceType(event.target.value as LaundryServiceType)} className="field-light px-4 py-4 text-sm text-primary">
                  {serviceTypes.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-light text-primary/60">
                Parting
                <select value={parting} onChange={(event) => setParting(event.target.value as LaundryParting)} className="field-light px-4 py-4 text-sm text-primary">
                  {LAUNDRY_PARTINGS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-light text-primary/60">
                Styling finish
                <select value={finish} onChange={(event) => setFinish(event.target.value as LaundryFinish)} className="field-light px-4 py-4 text-sm text-primary">
                  {LAUNDRY_FINISHES.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <div>
                <p className="mb-3 text-sm font-light text-primary/60">Add-ons</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {addOnOptions.map((addOn) => (
                    <label key={addOn} className="flex cursor-pointer items-center justify-between gap-4 border border-[#e5e2dd] px-4 py-3 text-sm font-light text-primary/65">
                      <span>{addOn}</span>
                      <span className="flex items-center gap-3">
                        <span>{formatPrice(WIG_LAUNDRY_ADDON_PRICES[addOn])}</span>
                        <input type="checkbox" checked={addOns.includes(addOn)} onChange={() => toggleAddOn(addOn)} />
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 border-y border-[#e5e2dd] py-5 text-sm font-light leading-7 text-primary/60">
              <p>Turnaround time and collection/drop-off details are confirmed via WhatsApp after booking.</p>
            </div>

            <button onClick={() => { addItem(configuredProduct); setAdded(true); }} className="mt-8 flex h-12 w-full items-center justify-center bg-primary px-6 text-sm font-light text-white transition-colors hover:bg-accent">
              {added ? 'Booked in bag' : 'Add to Cart / Book Service'}
            </button>
            <div className="mt-5 flex flex-wrap gap-5">
              <Link to={`/product/${WIG_LAUNDRY_PRODUCT.id}`} className="bisile-link">View Details <ArrowRight size={14} /></Link>
              <a href={getWhatsAppUrl(`Hello BISILE, I would like to book Wig Laundry. ${summary}`)} target="_blank" rel="noreferrer" className="bisile-link">
                <MessageCircle size={15} /> WhatsApp Us
              </a>
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="bisile-shell bisile-section border-t bisile-rule">
        <FadeIn>
          <p className="bisile-kicker mb-3">Service menu</p>
          <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">All services and prices.</h2>
          <p className="mt-5 max-w-2xl font-inter text-sm font-light leading-7 text-primary/60">
            Every wig laundry service and optional add-on, with transparent pricing. Build your booking above.
          </p>
        </FadeIn>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <FadeIn>
            <p className="bisile-kicker mb-4">Wash &amp; styling services</p>
            <ul className="border-t bisile-rule">
              {serviceTypes.map((service) => (
                <li key={service} className="flex items-center justify-between gap-4 border-b bisile-rule py-3 font-inter text-sm font-light text-primary/70">
                  <span>{service}</span>
                  <span className="text-primary/55">{formatPrice(WIG_LAUNDRY_SERVICE_PRICES[service])}</span>
                </li>
              ))}
            </ul>
          </FadeIn>
          <FadeIn delay={60}>
            <p className="bisile-kicker mb-4">Add-ons</p>
            <ul className="border-t bisile-rule">
              {addOnOptions.map((addOn) => (
                <li key={addOn} className="flex items-center justify-between gap-4 border-b bisile-rule py-3 font-inter text-sm font-light text-primary/70">
                  <span>{addOn}</span>
                  <span className="text-primary/55">{formatPrice(WIG_LAUNDRY_ADDON_PRICES[addOn])}</span>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      <section className="bisile-shell bisile-section border-t bisile-rule">
        <FadeIn>
          <p className="bisile-kicker mb-3">How it works</p>
          <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Clean, refresh, finish.</h2>
        </FadeIn>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <FadeIn key={step} delay={index * 45}>
              <div className="border-t border-[#e5e2dd] pt-5">
                <p className="font-inter text-xs font-light text-primary/35">0{index + 1}</p>
                <p className="mt-3 flex gap-3 font-inter text-sm font-light leading-7 text-primary/62"><Check size={14} className="mt-1 shrink-0" />{step}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
};
