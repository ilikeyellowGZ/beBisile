import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { CONTACT_EMAIL, CONTACT_PHONE, INSTAGRAM_URL, PINTEREST_URL, getWhatsAppUrl } from '../../constants';
import { brandImages } from '../../src/assets/images';

export const Footer: React.FC = () => (
  <footer className="relative z-10 border-t border-[#e5e2dd] bg-white px-6 pb-8 pt-14">
    <div className="w-full">
      <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_2fr]">
        <div>
          <Link to="/" className="mb-6 inline-block"><img src={brandImages.logo} alt="BISILE - Be Luxury" className="h-10 w-auto object-contain" /></Link>
          <p className="max-w-xs font-inter text-sm font-light leading-6 text-primary/60">
            Processed virgin hair.<br />BISILE fragrances.<br />Laundry services.<br />Be Luxury.
          </p>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <h4 className="mb-5 font-inter text-sm font-normal">Shop</h4>
            <ul className="space-y-3 font-inter text-sm font-light leading-relaxed text-primary/60">
              <li><Link to="/shop" className="hover:text-accent">Fragrances</Link></li>
              <li><Link to="/hair/wigs" className="hover:text-accent">Wigs</Link></li>
              <li><Link to="/hair/bundles" className="hover:text-accent">Bundles</Link></li>
              <li><Link to="/hair/closures" className="hover:text-accent">Closures & Frontals</Link></li>
              <li><Link to="/hair/laundry" className="hover:text-accent">Wig Laundry</Link></li>
              <li><Link to="/pamper" className="hover:text-accent">Pamper Packages</Link></li>
              <li><Link to="/cart" className="hover:text-accent">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-5 font-inter text-sm font-normal">Support</h4>
            <ul className="space-y-3 font-inter text-sm font-light leading-relaxed text-primary/60">
              <li><Link to="/contact" className="hover:text-accent">Contact Us</Link></li>
              <li><a href={getWhatsAppUrl('Hello BISILE, I need help with an order.')} target="_blank" rel="noreferrer" className="hover:text-accent">WhatsApp Support</a></li>
              <li><Link to="/checkout" className="hover:text-accent">Checkout</Link></li>
              <li><Link to="/dashboard" className="hover:text-accent">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-5 font-inter text-sm font-normal">Connect</h4>
            <p className="mb-2 font-inter text-sm font-light text-primary/60">{CONTACT_PHONE}</p>
            <p className="mb-5 font-inter text-sm font-light text-primary/60">{CONTACT_EMAIL}</p>
            <form onSubmit={(event) => event.preventDefault()} className="flex border-b border-primary/30 pb-2 transition-colors focus-within:border-accent">
              <input type="email" placeholder="Email address" className="w-full bg-transparent font-inter text-sm font-light outline-none placeholder:text-primary/35" />
              <button type="submit" className="font-inter text-sm font-light hover:text-accent">Join</button>
            </form>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between border-t border-[#e5e2dd] pt-6 md:flex-row">
        <a href="https://heyywebb.com" target="_blank" rel="noreferrer" className="font-inter text-xs font-light text-primary/40 hover:text-accent">Made by HeyyWebb</a>
        <div className="mt-4 flex items-center gap-6 md:mt-0">
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-inter text-xs font-light uppercase tracking-[0.14em] text-primary/45 transition-colors hover:text-accent" aria-label="BISILE Instagram">
            <Instagram size={17} strokeWidth={1.2} /> Instagram
          </a>
          <a href={PINTEREST_URL} target="_blank" rel="noreferrer" className="font-inter text-xs font-light uppercase tracking-[0.14em] text-primary/45 transition-colors hover:text-accent" aria-label="BISILE Pinterest">
            Pinterest
          </a>
        </div>
      </div>
    </div>
  </footer>
);
