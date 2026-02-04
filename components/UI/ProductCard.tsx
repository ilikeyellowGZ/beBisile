import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group cursor-pointer">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden bg-white aspect-[4/5] mb-6">
          {product.isBestSeller && (
            <span className="absolute top-4 left-4 z-10 text-[10px] tracking-widest uppercase bg-accent text-white px-2 py-1">
              Best Seller
            </span>
          )}
          {product.isNew && (
            <span className="absolute top-4 left-4 z-10 text-[10px] tracking-widest uppercase bg-white border border-accent text-accent px-2 py-1">
              New
            </span>
          )}
          <img 
            src={product.image} 
            alt={product.name} 
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
          />
          <img 
            src={product.secondaryImage} 
            alt={`${product.name} alternate`} 
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100"
          />
        </div>
        
        <div className="text-left space-y-1">
          <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-gray-500">
            {product.name}
          </h3>
          <p className="font-sans text-sm font-meduim text-gray-900">
            R {product.price}
          </p>
        </div>
      </Link>
    </div>
  );
};