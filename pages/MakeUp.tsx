import React from 'react';
import { Link } from 'react-router-dom';
import { FadeIn } from '../components/UI/FadeIn';

export const MakeUp: React.FC = () => {
  return (
    <div className="w-full bg-white pt-32 pb-24">
       <div className="max-w-[1440px] mx-auto px-6 md:px-12">
         
         {/* Split Layout */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
           
           {/* Image Side */}
           <div className="relative h-[60vh] lg:h-[80vh] overflow-hidden order-1 lg:order-1">
             <FadeIn className="h-full">
               <img 
                 src="public/media/image 61.png" 
                 alt="Luxury Make Up" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute bottom-8 left-8 bg-white p-6 shadow-lg max-w-xs hidden md:block">
                  <p className="font-serif italic text-2xl mb-2">"True beauty is timeless."</p>
                  <p className="font-sans text-[10px] tracking-widest uppercase text-gray-400">L'Essence Atelier</p>
               </div>
             </FadeIn>
           </div>

           {/* Content Side */}
           <div className="order-2 lg:order-2 flex flex-col justify-center">
             <FadeIn delay={200}>
               <h4 className="font-sans text-xs tracking-[0.2em] uppercase text-accent mb-6">Exclusive Service</h4>
               <h1 className="font-serif text-5xl md:text-7xl mb-8 leading-tight">
                 The Signature <br/> <span className="italic">Visage</span> Package
               </h1>
               
               <p className="font-sans text-sm leading-8 text-gray-600 mb-10 max-w-md">
                 An exclusive, one-tier experience for those who demand perfection. Our Signature Visage Package offers a complete makeup consultation and application session using only L'Essence mineral cosmetics.
               </p>

               <div className="bg-[#f9f9f9] p-8 mb-10 border-l-2 border-accent">
                 <h3 className="font-inter font-medium tracking-[-1px] uppercase text-lg mb-4">Package Inclusions</h3>
                 <ul className="space-y-4">
                   <li className="flex items-start">
                     <span className="text-accent mr-4">•</span>
                     <span className="font-serif italic text-gray-700">90-minute Colour Consultation</span>
                   </li>
                   <li className="flex items-start">
                     <span className="text-accent mr-4">•</span>
                     <span className="font-serif italic text-gray-700">Full Face Application by Senior Artist</span>
                   </li>
                   <li className="flex items-start">
                     <span className="text-accent mr-4">•</span>
                     <span className="font-serif italic text-gray-700">Curated Set of 3 Essential Products to keep</span>
                   </li>
                   <li className="flex items-start">
                     <span className="text-accent mr-4">•</span>
                     <span className="font-serif italic text-gray-700">Champagne & Refreshments</span>
                   </li>
                 </ul>
               </div>

               <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-8">
                 <div>
                   <span className="block font-sans text-[10px] uppercase tracking-widest text-gray-400 mb-1">Price</span>
                   <span className="font-serif text-3xl">R3500.00</span>
                 </div>
                 <Link 
                   to="/contact" 
                   className="inline-block px-12 py-4 bg-primary text-white text-xs tracking-[0.25em] uppercase hover:bg-accent transition-colors"
                 >
                   Book Appointment
                 </Link>
               </div>
             </FadeIn>
           </div>

         </div>

       </div>
    </div>
  );
};