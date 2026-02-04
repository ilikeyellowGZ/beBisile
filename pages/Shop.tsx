import React, { useState, useMemo } from 'react';
import { ProductCard } from '../components/UI/ProductCard';
import { PRODUCTS } from '../constants';
import { FadeIn } from '../components/UI/FadeIn';

export const Shop: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'parfum' | 'set'>('all');
  const [sort, setSort] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const handleFilterClick = () => {
    setFilter((prev) => {
      if (prev === 'all') return 'parfum';
      if (prev === 'parfum') return 'set';
      return 'all';
    });
  };

  const handleSortClick = () => {
    setSort((prev) => {
      if (prev === 'default') return 'price-asc';
      if (prev === 'price-asc') return 'price-desc';
      return 'default';
    });
  };

  const visibleProducts = useMemo(() => {
    let result = PRODUCTS;

    if (filter !== 'all') {
      result = result.filter((product) => product.category === filter);
    }

    if (sort === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [filter, sort]);

  return (
    <div className="pt-32 pb-24 bg-secondary min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-gray-300 pb-8">
          <div>
            <h1 className="font-serif text-5xl md:text-6xl mb-4">All Fragrances</h1>
            <p className="font-sans text-xs tracking-widest text-gray-500 uppercase max-w-md">
              100% Natural. Unisex. Created by Master Perfumers.
            </p>
          </div>
          <div className="flex space-x-6 mt-8 md:mt-0">
             <button
               onClick={handleFilterClick}
               className="font-sans text-xs uppercase tracking-widest hover:text-gray-500"
             >
               Filter
               {filter !== 'all' && (
                 <span className="ml-1 text-[10px] lowercase text-gray-500">
                   {filter === 'parfum' ? '(Fragrances)' : '(Discovery Sets)'}
                 </span>
               )}
             </button>
             <button
               onClick={handleSortClick}
               className="font-sans text-xs uppercase tracking-widest hover:text-gray-500"
             >
               Sort
               {sort === 'price-asc' && (
                 <span className="ml-1 text-[10px] lowercase text-gray-500">Price ↑</span>
               )}
               {sort === 'price-desc' && (
                 <span className="ml-1 text-[10px] lowercase text-gray-500">Price ↓</span>
               )}
             </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {visibleProducts.map((product, idx) => (
             <FadeIn key={product.id} delay={idx * 100}>
               <ProductCard product={product} />
             </FadeIn>
          ))}
        </div>

      </div>
    </div>
  );
};