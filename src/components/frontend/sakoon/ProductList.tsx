import React, { useEffect, useState } from 'react';
import { useLocation } from '../../../context/LocationContext';
import { Icons } from '../../Icons';

interface ProductListProps {
    categorySlug?: string;
    showLocationSpecials?: boolean;
    layout?: 'grid' | 'list';
}

export default function ProductList({ categorySlug, showLocationSpecials = true, layout = 'grid' }: ProductListProps) {
    const { selectedLocation } = useLocation();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const url = new URL('/api/products', window.location.origin);
                url.searchParams.append('per_page', '100');
                if (categorySlug) url.searchParams.append('category', categorySlug);

                const response = await fetch(url.toString());
                const data = await response.json();

                if (selectedLocation) {
                    const filtered = data.filter((p: any) => {
                        const locMeta = (p.meta_data || []).find((m: any) => m.key === '_sakoon_locations');
                        const locationIds = locMeta ? locMeta.value : [];
                        return locationIds.length === 0 || locationIds.includes(selectedLocation.id);
                    });
                    setProducts(filtered);
                } else {
                    setProducts(data);
                }
            } catch (err) {
                console.error('Failed to fetch products:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [selectedLocation, categorySlug]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-[#F2002D] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="py-24 text-center">
                <Icons.Package className="w-16 h-16 text-gray-100 mx-auto mb-6" />
                <p className="text-gray-400 font-medium text-lg italic uppercase tracking-widest text-[10px]">No items available for this location.</p>
            </div>
        );
    }

    return (
        <div className="mt-12">
            {showLocationSpecials && selectedLocation && (
                <div className="flex items-center justify-center gap-2 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="h-px w-12 bg-gray-100"></div>
                    <div className="bg-[#F2002D]/10 px-6 py-2 rounded-full flex items-center gap-2 border border-[#F2002D]/5">
                        <Icons.MapPin className="w-4 h-4 text-[#F2002D]" />
                        <span className="text-[10px] font-black text-[#F2002D] uppercase tracking-[0.2em]">{selectedLocation.name} Specials</span>
                    </div>
                    <div className="h-px w-12 bg-gray-100"></div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-4">
                {products.map((product) => (
                    <div key={product.id} className="group bg-white rounded-[3rem] overflow-hidden hover:shadow-2xl hover:shadow-black/5 transition-all duration-700 relative border border-gray-50">
                        <div className="relative h-72 overflow-hidden">
                            {product.images?.[0] ? (
                                <img src={product.images[0].src} alt={product.name} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200">
                                    <Icons.Package className="w-12 h-12" />
                                </div>
                            )}
                            {/* <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-6 py-3 rounded-[2rem] shadow-xl border border-white/50 animate-in zoom-in-90 group-hover:bg-[#F2002D] group-hover:text-white transition-all duration-500">
                                <span className="font-rubik font-black text-sm" dangerouslySetInnerHTML={{ __html: product.price_html || `$${product.price}` }}></span>
                            </div> */}
                        </div>
                        <div className="p-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#F2002D]">{product.categories?.[0]?.name || 'Menu Item'}</span>
                                <div className="h-0.5 flex-1 bg-gray-50 group-hover:bg-[#F2002D]/10 transition-colors"></div>
                            </div>
                            <h4 className="text-2xl font-rubik font-black text-[#1B1B1B] tracking-tight leading-tight transition-colors group-hover:text-[#F2002D]">{product.name}</h4>
                            <p className="text-gray-400 text-xs font-medium leading-[1.8] line-clamp-2 italic" dangerouslySetInnerHTML={{ __html: product.short_description || product.description }}></p>

                            <div className="pt-8 flex items-center justify-between border-t border-gray-50 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/20"></div>
                                    <span className="text-[10px] font-black text-[#1B1B1B] uppercase tracking-widest">{product.stock_status === 'instock' ? 'Freshly Available' : 'Out of Stock'}</span>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#F2002D] group-hover:rotate-[360deg] transition-all duration-700">
                                    <Icons.ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
