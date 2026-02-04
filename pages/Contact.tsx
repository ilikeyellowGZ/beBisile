import React from 'react';
import { FadeIn } from '../components/UI/FadeIn';

export const Contact: React.FC = () => {
  return (
    <div className="pt-32 pb-24 bg-white min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl mb-4">Contact Us</h1>
            <p className="font-sans text-sm text-gray-500 tracking-wide">
              We are here to help you find your signature scent.
            </p>
          </div>

          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col space-y-2">
                <label className="font-sans text-[10px] uppercase tracking-widest text-gray-500">First Name</label>
                <input type="text" className="border-b border-gray-300 py-2 outline-none focus:border-black transition-colors bg-transparent" />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="font-sans text-[10px] uppercase tracking-widest text-gray-500">Last Name</label>
                <input type="text" className="border-b border-gray-300 py-2 outline-none focus:border-black transition-colors bg-transparent" />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="font-sans text-[10px] uppercase tracking-widest text-gray-500">Email Address</label>
              <input type="email" className="border-b border-gray-300 py-2 outline-none focus:border-black transition-colors bg-transparent" />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="font-sans text-[10px] uppercase tracking-widest text-gray-500">Message</label>
              <textarea rows={4} className="border-b border-gray-300 py-2 outline-none focus:border-black transition-colors bg-transparent resize-none"></textarea>
            </div>

            <div className="pt-4 text-center">
              <button className="px-12 py-4 bg-black text-white font-sans text-xs uppercase tracking-[0.2em] hover:opacity-80 transition-opacity">
                Send Message
              </button>
            </div>
          </form>

          <div className="mt-20 text-center space-y-2">
             <p className="font-serif italic text-lg text-gray-800">Customer Service</p>
             <p className="font-sans text-xs text-gray-500">hello@lessence-parfums.com</p>
             <p className="font-sans text-xs text-gray-500">+1 (555) 123-4567</p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};