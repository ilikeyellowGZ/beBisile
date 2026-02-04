import React from 'react';
import { Link } from 'react-router-dom';
import { FadeIn } from '../components/UI/FadeIn';

const TIERS = [
  {
    name: "The Essential",
    price: 850,
    subtitle: "Normal Tier",
    description: "A thoughtful selection of our core essentials. Perfect for showing you care with elegance and simplicity.",
    includes: ["1x 15ml Signature Scent", "1x Hand Cream", "1x Scented Candle"],
    image: "/public/media/image 43.png",
    type: "normal"
  },
  {
    name: "The Indulgence",
    price: 1850,
    subtitle: "Premium Tier",
    description: "An elevated experience designed to pamper and delight. Includes our full-size bestsellers and exclusive accessories.",
    includes: ["1x 50ml Signature Parfum", "1x Luxury Bath Oil", "1x Silk Eye Mask", "1x Room Spray"],
    image: "public/media/image 45.png",
    type: "premium"
  },
  {
    name: "The Bespoke",
    price: null,
    subtitle: "Custom Tier",
    description: "The ultimate gesture. Fully customizable contents tailored to specific preferences for Valentine's, Study, or Wellness.",
    includes: ["Personalized Consultation", "Custom Engraving", "Choice of Any 5 Products", "Concierge Service"],
    image: "/public/media/image 44.png",
    type: "custom"
  }
];

export const CarePackages: React.FC = () => {
  return (
    <div className="w-full bg-[#faf9f6]">
      {/* Hero */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img 
           src="public/media/image 44.png" 
           alt="Care Packages Hero" 
           className="absolute inset-0 w-full h-full object-cover opacity-80 " /* oject positon hereerere */
        />
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center px-6">
          <FadeIn>
            <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 drop-shadow-lg italic">Curated Care</h1>
            <p className="font-sans text-xs md:text-sm tracking-[0.25em] text-white uppercase bg-black/20 px-6 py-3 inline-block backdrop-blur-sm border border-white/30">
              Valentine's &bull; Study &bull; Wellness
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Intro */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <FadeIn>
          <h2 className="font-inter font-medium tracking-[-1.25px] leading-none uppercase text-4xl text-gray-800 mb-8">The Collection</h2>
          <p className="font-sans text-sm leading-7 text-gray-600">
            Whether it is a gesture of love for Valentine's Day or a support booster for intense study sessions, our care packages are meticulously assembled to provide a moment of luxury and calm. Choose from our three exclusive tiers.
          </p>
        </FadeIn>
      </section>

      {/* Tiers Grid */}
      <section className="pb-32 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {TIERS.map((tier, idx) => (
            <FadeIn key={tier.name} delay={idx * 150} className="bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col h-full">
               <div className="aspect-[4/5] overflow-hidden relative">
                 <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1">
                   <span className="font-sans text-[10px] uppercase tracking-widest text-accent">{tier.subtitle}</span>
                 </div>
                 <img 
                   src={tier.image} 
                   alt={tier.name} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                 />
               </div>
               <div className="p-8 flex flex-col flex-grow text-center">
                 <h3 className="font-serif text-3xl mb-2">{tier.name}</h3>
                <p className="font-sans text-sm text-gray-500 mb-6">{tier.price ? `R ${tier.price}` : 'Price upon request'}</p>
                 <p className="font-sans text-xs leading-6 text-gray-600 mb-8 flex-grow">
                   {tier.description}
                 </p>
                 
                 <div className="border-t border-gray-100 pt-6 mb-8">
                   <p className="font-sans text-[10px] uppercase tracking-widest text-gray-400 mb-4">Includes</p>
                   <ul className="space-y-2">
                     {tier.includes.map(item => (
                       <li key={item} className="font-serif italic text-gray-700">{item}</li>
                     ))}
                   </ul>
                 </div>

                 <Link 
                   to={tier.type === 'custom' ? '/contact' : '/contact'} // Simplified to contact for demo
                   className={`w-full py-4 text-xs uppercase tracking-[0.2em] transition-colors border ${
                     tier.type === 'premium' 
                     ? 'bg-primary text-white border-primary hover:bg-accent hover:border-accent' 
                     : 'bg-transparent text-primary border-primary hover:bg-primary hover:text-white'
                   }`}
                 >
                   {tier.type === 'custom' ? 'Inquire Now' : 'Select Package'}
                 </Link>
               </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
};