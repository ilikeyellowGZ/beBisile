import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FadeIn } from '../components/UI/FadeIn';
import { ProductCard } from '../components/UI/ProductCard';
import { PRODUCTS } from '../constants';

export const Home: React.FC = () => {
  const featuredProducts = PRODUCTS.slice(0, 3);

  const location = useLocation();

  // Smooth-scroll to targeted sections when Home is loaded with state.scrollTo
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      const el = document.getElementById(state.scrollTo);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location]);

  return (
    <div className="w-full overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center bg-[#1a1917] overflow-hidden">
        {/* Background Image/Video Placeholder */}
        <div className="absolute inset-0 z-0">
           <img 
             src="/public/media/image 33.png" 
             alt="Hero Texture" 
             className="w-full h-full object-cover opacity-40"
           />
           {/* Abstract Overlay Shapes */}
           <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#dccfb8] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
           <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#b8c6dc] rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        </div>

        {/* Hero Content - Replicating Abel Style */}
        <div className="relative z-10 w-full max-w-[1440px] px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full">
          <div className="md:col-span-7 flex flex-col justify-center">
            <FadeIn>
              <h1 className="font-serif text-6xl md:text-9xl leading-[0.9] text-white mb-8">
                RADICAL <br/>
                <span className="italic font-light ml-12 md:ml-24">FRAGRANCE</span>
              </h1>
            </FadeIn>
            <FadeIn delay={200}>
               <p className="max-w-md font-sans text-xs md:text-sm tracking-widest leading-relaxed uppercase border-l border-accent/70 text-gray-100 pl-6 ml-2 mb-12">
                 Leading a shift in fragrance through biotechnology, master perfumery and 100% natural ingredients.
               </p>
               <Link 
                 to="/shop" 
                 className="inline-block px-12 py-4 border border-white/80 text-xs tracking-[0.25em] uppercase text-white hover:border-accent hover:text-accent transition-all duration-300 w-fit"
               >
                 Discover Our Fragrance
               </Link>
            </FadeIn>
          </div>

          <div className="md:col-span-5 relative h-full flex items-end md:items-center justify-center md:justify-end pb-12 md:pb-0">
             <FadeIn delay={400} className="relative">
                <img 
                  src="/public/media/image 49.png" 
                  alt="Feature Perfume Bottle" 
                  className="w-48 md:w-80 h-auto object-contain drop-shadow-2xl relative z-10"
                />
                {/* Collage Element */}
                <div className="absolute -top-12 -right-12 w-40 h-56 bg-white p-2 shadow-lg transform rotate-6 z-0 hidden md:block">
                  <img src="public/media/image 47.png" className="w-full h-full object-cover opacity-80" alt="Ingredient"/>
                </div>
             </FadeIn>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 md:px-12 bg-secondary">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex justify-between items-end mb-16">
            <FadeIn>
              <h2 className="font-sans text-xs tracking-[0.2em] uppercase text-accent mb-3">Discover Be Bisile</h2>
              <p className="font-inter font-medium tracking-[-1.25px] leading-none uppercase text-4xl md:text-5xl text-primary">Best Sellers</p>
            </FadeIn>
            <Link to="/shop" className="hidden md:block font-sans text-xs tracking-widest border-b border-black pb-1 hover:text-accent hover:border-accent transition-all">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {featuredProducts.map((product, idx) => (
              <FadeIn key={product.id} delay={idx * 150}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>

          <div className="mt-12 md:hidden text-center">
             <Link to="/shop" className="font-sans text-xs tracking-widest border-b border-black pb-1">
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* Storytelling / Quote Section */}
      <section className="py-32 bg-[#f4f3f0] border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
           <FadeIn>
             <span className="font-serif text-6xl text-accent block mb-8">"</span>
             <h3 className="font-serif text-3xl md:text-5xl leading-tight mb-8">
               Be Bisile is dedicated to making 100% natural fragrances that don't rely on harsh petrochemicals to make boundary-pushing scents.
             </h3>
             <img 
               src="public/media/image 33.png" 
               alt="Press Logo" 
               className="h-6 mx-auto opacity-50" 
             />
           </FadeIn>
        </div>
      </section>

      {/* Split Banner Section – Discovery Set */}
      <section id="discovery-section" className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        <div className="relative h-[60vh] md:h-auto overflow-hidden">
          <img 
            src="public/media/image 35.png" 
            alt="Lifestyle Model" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center items-center p-12 md:p-24 bg-[#f9f9f9]">
           <FadeIn className="max-w-md text-center">
             <h4 className="font-sans text-xs tracking-[0.2em] uppercase text-accent mb-4">Natural Perfume</h4>
             <h2 className="font-inter font-medium tracking-[-1.25px] leading-none uppercase text-4xl md:text-5xl mb-8">Discovery Set</h2>
             <p className="font-sans text-sm leading-7 text-gray-600 mb-10">
               Take the guesswork out of finding your favourite 100% Natural Be Bisile Fragrance.
               <br/><br/>
               "You can always layer the spritzes for a fragrant impression that's entirely personal to you." — Byrdie
             </p>
             <Link 
               to="/product/5" 
               className="inline-block px-10 py-3 border border-gray-300 text-xs tracking-[0.25em] uppercase hover:border-accent hover:text-accent transition-colors"
             >
               Build Your Set
             </Link>
           </FadeIn>
        </div>
      </section>

      {/* Founder/About Section */}
      <section id="our-story" className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
         <div className="flex flex-col justify-center items-center p-12 md:p-24 bg-[#f0eee9] order-2 md:order-1">
           <FadeIn className="max-w-md">
             <h4 className="font-sans text-xs tracking-[0.2em] uppercase text-accent mb-4">About Be Bisile</h4>
             <h2 className="font-inter font-medium tracking-[-1.25px] leading-none uppercase text-4xl md:text-5xl mb-8">Our Story</h2>
             <p className="font-sans text-sm leading-7 text-gray-600 mb-10 text-justify">
               Founded by former winemaker Frances Shoemack in 2013, Be Bisile first emerged in Amsterdam and is now headquartered in Wellington, New Zealand. Operating across oceans, we work closely with master perfumer Isaac Sinclair to create the world's best natural perfume.
             </p>
             <Link 
               to="/story" 
               className="inline-block px-8 py-3 border border-gray-400 text-[10px] tracking-[0.25em] uppercase hover:border-accent hover:text-accent transition-all"
             >
               Read More
             </Link>
           </FadeIn>
        </div>
        <div className="relative h-[60vh] md:h-auto overflow-hidden order-1 md:order-2">
          <img 
            src="public/media/image 50.png" 
            alt="Founder Portrait" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Select Collection Grid – Care Packages & Make Up */}
      <section id="collections" className="py-24 px-6 md:px-0 bg-white">
        <div className="max-w-[1440px] mx-auto text-center mb-16">
          <h2 className="font-inter font-medium tracking-[-1.25px] leading-none uppercase text-4xl text-gray-800">Select Collection</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 h-[60vh]">
          {[
            { title: 'Care Packages', image: 'public/media/image 43.png', link: '/care-packages' },
            { title: 'Make Up', image: 'public/media/image 61.png', link: '/make-up' }
          ].map((item) => (
          <Link key={item.title} to={item.link} className="relative group overflow-hidden border-r border-b border-gray-100 last:border-r-0">
               <img 
                 src={item.image} 
                 alt={item.title}
                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
               />
               <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                 <span className="font-inter font-medium tracking-[-1.25px] leading-none uppercase text-3xl md:text-4xl text-white group-hover:text-accent transition-colors">
                   {item.title}
                 </span>               </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};