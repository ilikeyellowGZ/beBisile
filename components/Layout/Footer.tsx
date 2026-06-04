import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Music2 } from 'lucide-react';
import { CONTACT_EMAIL, CONTACT_PHONE, getWhatsAppUrl } from '../../constants';

export const Footer: React.FC = () => (
  <footer className="bg-secondary pt-24 pb-12 px-6 md:px-12 border-t border-gray-200">
    <div className="max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div>
          <Link to="/" className="inline-block mb-6"><img src="/media/logo 1.png" alt="BISILE - Be Luxury" className="h-10 w-auto object-cover" /></Link>
          <p className="font-sans text-xs tracking-wide leading-relaxed text-gray-600">
            Processed virgin hair.<br />BISILE fragrances.<br />Laundry services.<br />Be Luxury.
          </p>
        </div>
        <div>
          <h4 className="font-subhead uppercase text-sm mb-6">Shop</h4>
          <ul className="space-y-3 font-sans text-xs tracking-wide leading-relaxed text-gray-600">
            <li><Link to="/shop" className="hover:text-accent">Fragrances</Link></li>
            <li><Link to="/hair" className="hover:text-accent">Hair Collection</Link></li>
            <li><Link to="/pamper" className="hover:text-accent">Pamper Packages</Link></li>
            <li><Link to="/cart" className="hover:text-accent">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-subhead uppercase text-sm mb-6">Support</h4>
          <ul className="space-y-3 font-sans text-xs tracking-wide leading-relaxed text-gray-600">
            <li><Link to="/contact" className="hover:text-accent">Contact Us</Link></li>
            <li><a href={getWhatsAppUrl('Hello BISILE, I need help with an order.')} target="_blank" rel="noreferrer" className="hover:text-accent">WhatsApp Support</a></li>
            <li><Link to="/checkout" className="hover:text-accent">Checkout</Link></li>
            <li><Link to="/dashboard" className="hover:text-accent">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-subhead uppercase text-sm mb-6">Contact</h4>
          <p className="font-sans text-xs text-gray-500 mb-2">{CONTACT_PHONE}</p>
          <p className="font-sans text-xs text-gray-500 mb-4">{CONTACT_EMAIL}</p>
          <form onSubmit={(event) => event.preventDefault()} className="flex border-b border-black pb-2 focus-within:border-accent transition-colors">
            <input type="email" placeholder="Email Address" className="bg-transparent w-full outline-none font-sans text-sm placeholder-gray-400" />
            <button type="submit" className="uppercase text-xs tracking-widest hover:text-accent">Join</button>
          </form>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
        <a href="https://heyywebb.com" target="_blank" rel="noreferrer" className="font-sans text-[10px] tracking-widest text-gray-400 uppercase hover:text-accent">Made by HeyyWebb</a>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-accent" aria-label="Instagram"><Instagram size={18} strokeWidth={1.2} /></a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-accent" aria-label="TikTok"><Music2 size={18} strokeWidth={1.2} /></a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-accent" aria-label="Facebook"><Facebook size={18} strokeWidth={1.2} /></a>
        </div>
      </div>
    </div>
  </footer>
);
