import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SakoonLayout from '../../../components/frontend/sakoon/SakoonLayout';
import { useLocation } from '../../../context/LocationContext';
import { Icons } from '../../../components/Icons';

interface Product {
  id: number;
  name: string;
  description: string;
  short_description: string;
  price: string;
  price_html: string;
  images: Array<{ src: string; alt: string }>;
  categories: Array<{ id: number; name: string; slug: string }>;
  stock_status: string;
  meta_data: Array<{ key: string; value: any }>;
}

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { selectedLocation, setPopupOpen } = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !selectedLocation) return;

    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id, selectedLocation]);

  useEffect(() => {
    if (!selectedLocation && !loading) {
      setPopupOpen(true);
    }
  }, [selectedLocation, loading, setPopupOpen]);

  if (loading) {
    return (
      <SakoonLayout title="Loading...">
        <div className="flex items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-[#F2002D] rounded-full animate-spin"></div>
        </div>
      </SakoonLayout>
    );
  }

  if (error || !product) {
    return (
      <SakoonLayout title="Product Not Found">
        <div className="py-24 text-center">
          <Icons.Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
          <h4 className="text-xl font-rubik font-black text-[#1B1B1B] uppercase tracking-widest mb-4">
            {error || 'Product Not Found'}
          </h4>
          <button
            onClick={() => router.back()}
            className="bg-[#F2002D] text-white px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-[#F2002D]/20 active:scale-95"
          >
            Go Back
          </button>
        </div>
      </SakoonLayout>
    );
  }

  return (
    <SakoonLayout title={product.name}>
      <div className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Image */}
          <div className="relative">
            {product.images?.[0] ? (
              <img
                src={product.images[0].src}
                alt={product.name}
                className="w-full h-auto object-cover rounded-3xl shadow-2xl"
              />
            ) : (
              <div className="w-full h-96 bg-gray-50 flex items-center justify-center text-gray-200 rounded-3xl">
                <Icons.Package className="w-24 h-24" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#F2002D]">
                  {product.categories?.[0]?.name || 'Menu Item'}
                </span>
                <div className="h-0.5 flex-1 bg-gray-50"></div>
              </div>
              <h1 className="text-4xl md:text-5xl font-rubik font-black text-[#1B1B1B] tracking-tight leading-tight mb-6">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${product.stock_status === 'instock' ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}></div>
                  <span className="text-[10px] font-black text-[#1B1B1B] uppercase tracking-widest">
                    {product.stock_status === 'instock' ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
                <div className="text-2xl font-rubik font-black text-[#F2002D]" dangerouslySetInnerHTML={{ __html: product.price_html || `$${product.price}` }}></div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: product.description || product.short_description }} />
            </div>

            <div className="flex items-center gap-4 pt-8 border-t border-gray-50">
              <button
                className="bg-[#F2002D] text-white px-12 py-4 rounded-full text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-[#F2002D]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={product.stock_status !== 'instock'}
              >
                {product.stock_status === 'instock' ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                onClick={() => router.back()}
                className="border border-gray-200 text-gray-600 px-8 py-4 rounded-full text-sm font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    </SakoonLayout>
  );
}