import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => (
  <article className="group cursor-pointer">
    <Link to={`/product/${product.id}`}>
      <div className="relative mb-4 aspect-square overflow-hidden bg-[#f7f5f1]">
        {product.isBestSeller && <span className="absolute left-3 top-3 z-10 bg-white/90 px-2.5 py-1 font-inter text-[10px] font-light uppercase tracking-[0.12em] text-primary backdrop-blur">Best seller</span>}
        {product.isNew && <span className="absolute left-3 top-3 z-10 border border-[#e5e2dd] bg-white/90 px-2.5 py-1 font-inter text-[10px] font-light uppercase tracking-[0.12em] text-primary backdrop-blur">New</span>}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full transition-transform duration-300 ease-out group-hover:scale-105 ${product.imageFit === 'contain' ? 'object-contain p-10 sm:p-14' : 'object-cover'}`}
        />
      </div>
      <div className="space-y-2 text-left font-inter text-sm">
        <p className="font-light text-primary/45">{product.eyebrow ?? product.subtitle}</p>
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-normal text-primary">{product.name}</h3>
          <p className="shrink-0 font-light text-primary">{product.pricePrefix ? `${product.pricePrefix} ` : ''}R {product.price.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  </article>
);
