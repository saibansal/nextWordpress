import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useLocation } from '../../../context/LocationContext';
import { Icons } from '../../Icons';

interface ProductListProps {
    categorySlug?: string;
    showLocationSpecials?: boolean;
    layout?: 'grid' | 'list';
}

export default function ProductList({ categorySlug, showLocationSpecials = true, layout = 'grid' }: ProductListProps) {
    const router = useRouter();
    const { selectedLocation, setPopupOpen, clearLocation, isLoading } = useLocation();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const handleClearLocation = () => {
        clearLocation();
        setPopupOpen(true);
    };

    // 1. Logic to prompt for location if missing
    useEffect(() => {
        if (!selectedLocation && !isLoading) {
            setPopupOpen(true);
        }
    }, [selectedLocation, isLoading, setPopupOpen]);

    // 2. Logic to fetch products
    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                // If NO location is selected, we do NOT fetch/show any products (Local state is Global/Empty)
                if (!selectedLocation) {
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                const url = new URL('/api/products', window.location.origin);
                url.searchParams.append('per_page', '100');
                if (categorySlug) url.searchParams.append('category', categorySlug);

                const response = await fetch(url.toString());

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server error: ${response.status}`);
                }

                const data = await response.json();

                const filtered = data.filter((p: any) => {
                    const locMeta = (p.meta_data || []).find((m: any) => m.key === '_sakoon_locations');

                    // Filter: Must have a location assigned and match current selection
                    if (!locMeta || !locMeta.value || !Array.isArray(locMeta.value) || locMeta.value.length === 0) {
                        return true; // Global items still show in ANY selected branch
                    }

                    const targetId = String(selectedLocation.id);
                    return locMeta.value.some((id: any) => String(id) === targetId);
                });
                setProducts(filtered);
            } catch (err) {
                console.error('Failed to fetch products:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [selectedLocation, categorySlug]);

    const handleProductClick = (product: any) => {
        if (!selectedLocation) {
            setPopupOpen(true);
            return;
        }
        // Navigate to product detail page
        router.push(`/sakoon/product/${product.id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-[#F2002D] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!selectedLocation) {
        return (
            <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/30">
                <Icons.MapPin className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                <h4 className="text-xl font-rubik font-black text-[#1B1B1B] uppercase tracking-widest mb-4">Select Location to View Packages</h4>
                <p className="text-gray-400 text-xs mb-10 max-w-sm mx-auto font-medium italic">"Banquet packages and pricing vary by location to ensure the best local experience."</p>
                <button
                    onClick={() => setPopupOpen(true)}
                    className="bg-[#F2002D] text-white px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-[#F2002D]/20 active:scale-95"
                >
                    Choose Your Sakoon
                </button>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div
                onClick={handleClearLocation}
                className="py-24 text-center cursor-pointer group"
            >
                <Icons.Package className="w-16 h-16 text-gray-100 mx-auto mb-6 group-hover:text-[#F2002D] transition-colors" />
                <p className="text-gray-400 font-medium text-lg uppercase tracking-widest text-[10px] mb-2">No products found.</p>
                <p className="text-[#F2002D] font-black text-xs uppercase tracking-widest hover:underline italic">Click here to select location</p>
            </div>
        );
    }

    return (
        <div className="mt-12">
            {showLocationSpecials && selectedLocation && (
                <div className="flex items-center justify-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="h-px w-12 bg-gray-100"></div>
                    <div className="bg-[#F2002D]/10 px-6 py-2 rounded-full flex items-center gap-3 border border-[#F2002D]/5 group/loc">
                        <div className="flex items-center gap-2">
                            <Icons.MapPin className="w-4 h-4 text-[#F2002D]" />
                            <span className="text-[10px] font-black text-[#F2002D] uppercase tracking-[0.2em]">{selectedLocation.name} Specials</span>
                        </div>
                        <div className="w-px h-3 bg-[#F2002D]/20"></div>
                        <button
                            onClick={handleClearLocation}
                            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-[#F2002D] transition-colors"
                        >
                            <Icons.RefreshCW className="w-3 h-3 group-hover/loc:rotate-180 transition-transform duration-700" />
                            Change
                        </button>
                    </div>
                    <div className="h-px w-12 bg-gray-100"></div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-4">
                {products.map((product) => (
                    <div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="group bg-white overflow-hidden hover:shadow-2xl hover:shadow-black/5 transition-all duration-700 relative border border-gray-50 cursor-pointer"
                    >
                        <div className="relative">
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
                            {/* <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#F2002D]">{product.categories?.[0]?.name || 'Menu Item'}</span>
                                <div className="h-0.5 flex-1 bg-gray-50 group-hover:bg-[#F2002D]/10 transition-colors"></div>
                            </div> */}
                            <h4 className="text-2xl font-rubik font-black text-[#1B1B1B] tracking-tight leading-tight transition-colors group-hover:text-[#F2002D]">{product.name}</h4>
                            <div className="text-gray-400 text-xs font-medium leading-[1.8] line-clamp-2 italic" dangerouslySetInnerHTML={{ __html: product.short_description || product.description }}></div>

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
