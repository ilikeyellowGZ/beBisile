import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { CONTACT_EMAIL, CONTACT_PHONE, INSTAGRAM_URL, PINTEREST_URL, getWhatsAppUrl } from '../../constants';
import { brandImages } from '../../src/assets/images';
import { OptimizedImage } from '../UI/OptimizedImage';

export const Footer: React.FC = () => (
  <footer className="relative z-10 border-t border-[#A3915D]/24 bg-[var(--bisile-forest)] px-6 pb-8 pt-14 text-[#F7F4EF]">
    <div className="w-full">
      <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-[1.1fr_2.6fr]">
          <div>
            <Link to="/" className="mb-6 inline-block"><OptimizedImage src={brandImages.logo} width={220} widths={[120, 180, 220, 320]} sizes="160px" alt="BISILE - Be Luxury" className="h-10 w-auto object-contain brightness-0 invert" /></Link>
          <p className="max-w-xs font-inter text-sm font-light leading-6 text-[#E9E6DF]/70">
            Bhelekazi Hair Collection<br />IMVELO Collection<br />Luxury Hair Laundry service
          </p>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <h4 className="mb-5 font-inter text-sm font-normal text-[#F7F4EF]">Shop</h4>
            <ul className="space-y-3 font-inter text-sm font-light leading-relaxed text-[#E9E6DF]/66">
              <li><Link to="/shop" className="hover:text-[#A3915D]">Fragrances</Link></li>
              <li><Link to="/hair/wigs" className="hover:text-[#A3915D]">Wigs</Link></li>
              <li><Link to="/hair/bundles" className="hover:text-[#A3915D]">Bundles</Link></li>
              <li><Link to="/hair/closures" className="hover:text-[#A3915D]">Closures &amp; Frontals</Link></li>
              <li><Link to="/hair/laundry" className="hover:text-[#A3915D]">Wig Laundry</Link></li>
              <li><Link to="/pamper" className="hover:text-[#A3915D]">Pamper Packages</Link></li>
              <li><Link to="/cart" className="hover:text-[#A3915D]">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-5 font-inter text-sm font-normal text-[#F7F4EF]">Support</h4>
            <ul className="space-y-3 font-inter text-sm font-light leading-relaxed text-[#E9E6DF]/66">
              <li><Link to="/contact" className="hover:text-[#A3915D]">Contact Us</Link></li>
              <li><a href={getWhatsAppUrl('Hello BISILE, I need help with an order.')} target="_blank" rel="noreferrer" className="hover:text-[#A3915D]">WhatsApp Support</a></li>
              <li><Link to="/checkout" className="hover:text-[#A3915D]">Checkout</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#A3915D]">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-5 font-inter text-sm font-normal text-[#F7F4EF]">Connect</h4>
            <p className="mb-2 font-inter text-sm font-light text-[#E9E6DF]/66">{CONTACT_PHONE}</p>
            <p className="mb-5 font-inter text-sm font-light text-[#E9E6DF]/66">{CONTACT_EMAIL}</p>
            <form onSubmit={(event) => event.preventDefault()} className="flex border-b border-[#A3915D]/45 pb-2 transition-colors focus-within:border-[#D8D0C3]">
              <input type="email" placeholder="Email address" className="w-full bg-transparent font-inter text-sm font-light text-[#F7F4EF] outline-none placeholder:text-[#E9E6DF]/40" />
              <button type="submit" className="font-inter text-sm font-light hover:text-[#A3915D]">Join</button>
            </form>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between border-t border-[#A3915D]/24 pt-6 md:flex-row">
        <a href="https://heyywebb.com" target="_blank" rel="noreferrer" className="font-inter text-xs font-light text-[#E9E6DF]/45 hover:text-[#A3915D]">Made by HeyyWebb</a>
        <div className="mt-4 flex items-center gap-6 md:mt-0">
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-inter text-xs font-light uppercase tracking-[0.14em] text-[#E9E6DF]/55 transition-colors hover:text-[#A3915D]" aria-label="BISILE Instagram">
            <Instagram size={17} strokeWidth={1.2} /> Instagram
          </a>
          <a href={PINTEREST_URL} target="_blank" rel="noreferrer" className="font-inter text-xs font-light uppercase tracking-[0.14em] text-[#E9E6DF]/55 transition-colors hover:text-[#A3915D]" aria-label="BISILE Pinterest">
            Pinterest
          </a>
        </div>
      </div>
    </div>
  </footer>
);
