import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { Minus, Plus, Star } from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'notes' | 'ingredients'>('desc');
  const { addItem } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
    const found = PRODUCTS.find(p => p.id === id);
    if (found) setProduct(found);
  }, [id]);

  if (!product) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="pt-24 bg-white min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2">
        
        {/* Left: Images */}
        <div className="bg-[#f4f3f0] h-[50vh] md:h-[calc(100vh-6rem)] relative overflow-hidden group">
           <img 
             src={product.image} 
             alt={product.name} 
             className="w-full h-full object-cover object-center"
           />
           <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
             <div className="w-2 h-2 bg-black rounded-full"></div>
             <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
           </div>
        </div>

        {/* Right: Info */}
        <div className="px-6 py-12 md:px-16 md:py-24 flex flex-col justify-center h-full overflow-y-auto">
           
           {/* Breadcrumbs */}
           <div className="mb-8 font-sans text-[10px] tracking-widest uppercase text-gray-500">
             <Link to="/" className="hover:text-accent transition-colors">Home</Link> / <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link> / {product.name}
           </div>

           <h1 className="font-serif text-4xl md:text-5xl mb-2">{product.name}</h1>
           <p className="font-serif text-xl italic text-gray-500 mb-6">{product.subtitle}</p>
           
          <div className="flex items-center space-x-4 mb-8">
            <span className="font-sans text-lg font-medium">R {product.price}.00</span>
             <div className="flex items-center">
               {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#d4af37" className="text-accent" />)}
               <span className="ml-2 text-xs text-gray-500">(24 Reviews)</span>
             </div>
           </div>

           <div className="mb-10">
             <p className="font-sans text-sm leading-7 text-gray-600 text-justify">
               {product.description}
             </p>
           </div>

           {/* Size Selector */}
           <div className="mb-10">
              <span className="block font-sans text-[10px] uppercase tracking-widest mb-3">Size</span>
              <div className="flex space-x-3">
                <button className="px-6 py-3 border border-black bg-black text-white text-xs uppercase tracking-widest">50ml</button>
                <button className="px-6 py-3 border border-gray-300 text-gray-500 text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors">15ml</button>
              </div>
           </div>

           {/* Actions */}
           <div className="flex space-x-4 mb-12">
             <div className="flex items-center border border-gray-300 px-4">
               <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:text-accent"><Minus size={16} /></button>
               <span className="px-4 font-sans text-sm">{quantity}</span>
               <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:text-accent"><Plus size={16} /></button>
             </div>
             <button
               className="flex-1 bg-primary text-white text-xs uppercase tracking-[0.2em] py-4 hover:bg-accent transition-colors"
               onClick={() => addItem(product, quantity)}
             >
               Add to Bag
             </button>
           </div>

           {/* Tabs / Accordionish */}
           <div className="border-t border-gray-200">
             <div className="grid grid-cols-3 border-b border-gray-200">
               <button 
                onClick={() => setActiveTab('desc')}
                className={`py-4 text-[10px] uppercase tracking-widest transition-colors ${activeTab === 'desc' ? 'text-black font-semibold border-b-2 border-accent' : 'text-gray-400 hover:text-accent'}`}
               >
                 Description
               </button>
               <button 
                onClick={() => setActiveTab('notes')}
                className={`py-4 text-[10px] uppercase tracking-widest transition-colors ${activeTab === 'notes' ? 'text-black font-semibold border-b-2 border-accent' : 'text-gray-400 hover:text-accent'}`}
               >
                 Notes
               </button>
               <button 
                onClick={() => setActiveTab('ingredients')}
                className={`py-4 text-[10px] uppercase tracking-widest transition-colors ${activeTab === 'ingredients' ? 'text-black font-semibold border-b-2 border-accent' : 'text-gray-400 hover:text-accent'}`}
               >
                 Ingredients
               </button>
             </div>
             <div className="py-6 min-h-[100px]">
               {activeTab === 'desc' && <p className="font-sans text-xs leading-6 text-gray-600">Discover the full profile of {product.name}. Created with natural ingredients that evolve on your skin.</p>}
               {activeTab === 'notes' && (
                 <ul className="font-sans text-xs leading-6 text-gray-600 grid grid-cols-2 gap-2">
                   {product.notes.map(note => <li key={note}>• {note}</li>)}
                 </ul>
               )}
               {activeTab === 'ingredients' && <p className="font-sans text-xs leading-6 text-gray-600">Alcohol, Parfum (Fragrance), Aqua (Water), Limonene, Linalool. 100% Natural origin.</p>}
             </div>
           </div>

        </div>
      </div>
    </div>
  );
};