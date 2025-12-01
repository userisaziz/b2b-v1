"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  min_order_quantity: number;
  category?: { name: string };
  users?: { company: string };
  seller_id?: string;
  category_id?: string;
  specifications?: Record<string, any>;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProductSliderProps {
  products: Product[];
  title: string;
  categoryId?: string;
}

export default function ProductSlider({ products, title, categoryId }: ProductSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(4);

  // Update items to show based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsToShow(1);
      } else if (window.innerWidth < 768) {
        setItemsToShow(2);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(3);
      } else {
        setItemsToShow(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      Math.min(prevIndex + 1, Math.max(0, products.length - itemsToShow))
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  // Filter out products without valid IDs
  const validProducts = products.filter(product => product.id && product.id !== 'undefined');

  if (validProducts.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {categoryId && (
            <Link 
              href={`/categories/${categoryId}`} 
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              View all products
            </Link>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`p-2 rounded-full border ${
              currentIndex === 0 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex >= validProducts.length - itemsToShow}
            className={`p-2 rounded-full border ${
              currentIndex >= validProducts.length - itemsToShow
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
        >
          {validProducts.map((product) => (
            <div 
              key={product.id} 
              className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 px-2"
            >
              <Link
                href={`/products/${product.id}`}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm text-slate-700">
                      Verified
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {product.category?.name || "General"}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {product.users?.company || "Verified Seller"}
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Price per unit</p>
                      <p className="text-xl font-bold text-slate-900">
                        ₹{product.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">MOQ</p>
                      <p className="text-sm font-medium text-slate-700">
                        {product.min_order_quantity} units
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}