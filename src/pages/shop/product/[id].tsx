import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  meta_data: Array<{ key: string; value: unknown }>;
}

interface AddonItem {
  id: number;
  name: string;
  cost: string;
}

interface AddonGroup {
  id: number;
  title: string;
  instructions: string;
  selection_type: string;
  min_selected: number;
  items: AddonItem[];
}

interface CartItem {
  cartItemId?: string;
  id: number;
  name: string;
  price: string;
  basePrice?: string;
  image: string;
  quantity: number;
  addons?: any[];
}

export default function ShopProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { selectedLocation, setPopupOpen } = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addonSelections, setAddonSelections] = useState<Record<number, number[]>>({});
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  const addonPackages = product ? (() => {
    const addonMeta = product.meta_data?.find((m: { key: string; value: unknown }) => m.key === '_addon_packages');
    if (!addonMeta) return [] as AddonGroup[];
    if (typeof addonMeta.value === 'string') {
      try {
        return JSON.parse(addonMeta.value) as AddonGroup[];
      } catch {
        return (addonMeta.value as AddonGroup[]) || [];
      }
    }
    return (addonMeta.value as AddonGroup[]) || [];
  })() : [];

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


  const handleAddToCart = () => {
    if (!product) return;
    setAddingToCart(true);

    // Validate required addons
    let isValid = true;
    for (const group of addonPackages) {
      const selectedCount = addonSelections[group.id]?.length || 0;
      const minSelected = group.min_selected !== undefined && group.min_selected !== null ? Number(group.min_selected) : 1;
      
      if (group.selection_type === 'multiple' && selectedCount < minSelected) {
        isValid = false;
        alert(`Please select at least ${minSelected} option(s) for ${group.title}.`);
        break;
      }
      if (group.selection_type === 'single' && minSelected > 0 && selectedCount === 0) {
        isValid = false;
        alert(`Please select an option for ${group.title}.`);
        break;
      }
    }

    if (!isValid) {
      setAddingToCart(false);
      return;
    }

    let addonsTotal = 0;
    const selectedAddons: any[] = [];

    Object.entries(addonSelections).forEach(([groupId, itemIds]) => {
      const group = addonPackages.find((g: AddonGroup) => g.id === Number(groupId));
      if (group) {
        itemIds.forEach((itemId) => {
          const item = group.items.find((i: AddonItem) => i.id === Number(itemId));
          if (item) {
            addonsTotal += parseFloat(item.cost || '0');
            selectedAddons.push({
              groupId: group.id,
              groupName: group.title,
              itemId: item.id,
              itemName: item.name,
              cost: item.cost
            });
          }
        });
      }
    });

    const finalPrice = (parseFloat(product.price || '0') + addonsTotal).toFixed(2);
    const addonsKey = selectedAddons.map(a => a.itemId).sort().join('-');
    const cartItemId = `${product.id}-${addonsKey}`;

    const cartItem: CartItem = {
      cartItemId,
      id: product.id,
      name: product.name,
      price: finalPrice,
      basePrice: product.price,
      image: product.images?.[0]?.src || '',
      quantity: 1,
      addons: selectedAddons,
    };

    let currentCart: CartItem[] = [];
    const savedCart = typeof window !== 'undefined' ? localStorage.getItem('sakoon_cart') : null;
    if (savedCart) {
      try {
        currentCart = JSON.parse(savedCart as string) as CartItem[];
      } catch (e) {
        currentCart = [];
      }
    }

    const existingItemIndex = currentCart.findIndex((item) => 
      (item.cartItemId && item.cartItemId === cartItem.cartItemId) || 
      (!item.cartItemId && item.id === cartItem.id && (!item.addons || item.addons.length === 0))
    );

    if (existingItemIndex >= 0) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push(cartItem);
    }

    localStorage.setItem('sakoon_cart', JSON.stringify(currentCart));
    
    // Trigger events to immediately update cart count on the header icon
    window.dispatchEvent(new CustomEvent('cart_updated', { detail: currentCart }));
    window.dispatchEvent(new Event('cart-updated')); // Fallback common event name
    window.dispatchEvent(new StorageEvent('storage', { key: 'sakoon_cart', newValue: JSON.stringify(currentCart) }));
    
    setCartMessage('Added to cart');
    setTimeout(() => setCartMessage(null), 2500);
    setAddingToCart(false);
  };

  useEffect(() => {
    if (!product) return;
    const parsedPackages = (() => {
      const addonMeta = product.meta_data?.find((m: { key: string; value: unknown }) => m.key === '_addon_packages');
      if (!addonMeta) return [] as AddonGroup[];
      if (typeof addonMeta.value === 'string') {
        try {
          return JSON.parse(addonMeta.value) as AddonGroup[];
        } catch {
          return (addonMeta.value as AddonGroup[]) || [];
        }
      }
      return (addonMeta.value as AddonGroup[]) || [];
    })();

    const initialSelections: Record<number, number[]> = {};
    parsedPackages.forEach((group: AddonGroup) => {
      initialSelections[group.id] = [];
    });
    setAddonSelections(initialSelections);
  }, [product]);

  const handleAddonSelection = (groupId: number, itemId: number, selectionType: string) => {
    setAddonSelections(prev => {
      const current = prev[groupId] || [];
      if (selectionType === 'multiple') {
        return {
          ...prev,
          [groupId]: current.includes(itemId)
            ? current.filter(id => id !== itemId)
            : [...current, itemId],
        };
      }
      return { ...prev, [groupId]: [itemId] };
    });
  };

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

  const calculateTotalPrice = () => {
    if (!product) return '0.00';
    let addonsTotal = 0;
    Object.entries(addonSelections).forEach(([groupId, itemIds]) => {
      const group = addonPackages.find((g: AddonGroup) => g.id === Number(groupId));
      if (group) {
        itemIds.forEach((itemId) => {
          const item = group.items.find((i: AddonItem) => i.id === Number(itemId));
          if (item) {
            addonsTotal += parseFloat(item.cost || '0');
          }
        });
      }
    });
    return (parseFloat(product.price || '0') + addonsTotal).toFixed(2);
  };

  const displayPrice = calculateTotalPrice();
  const hasAddonsSelected = product && parseFloat(displayPrice) > parseFloat(product.price || '0');

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
                {hasAddonsSelected ? (
                  <div className="text-2xl font-rubik font-black text-[#F2002D]">
                    ${displayPrice}
                  </div>
                ) : (
                  <div className="text-2xl font-rubik font-black text-[#F2002D]" dangerouslySetInnerHTML={{ __html: product.price_html || `$${product.price}` }}></div>
                )}
              </div>
            </div>

            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: product.description || product.short_description }} />
            </div>

            {addonPackages?.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-sm">
                <h2 className="text-2xl font-rubik font-black text-[#1B1B1B] mb-4">Addon Packages</h2>
                <div className="space-y-6">
                  {addonPackages.map((group: AddonGroup, index: number) => (
                    <div key={group.id || index} className="rounded-3xl border border-[#E5E7EB] p-4">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-[#1B1B1B]">{group.title || `Package ${index + 1}`}</h3>
                          <p className="text-xs text-gray-500 mt-1">{group.instructions || 'Choose any 1 from the following'}</p>
                          <p className="text-xs text-gray-500 mt-1">{group.selection_type === 'multiple' ? `Select at least ${group.min_selected || 1} option${(group.min_selected || 1) === 1 ? '' : 's'}.` : 'Choose one option.'}</p>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {group.items?.map((item: AddonItem) => (
                          <label key={item.id || item.name} className="flex items-center gap-3 rounded-2xl border border-[#D1D5DB] p-3 cursor-pointer hover:border-[#F2002D] transition-colors">
                            <input
                              type={group.selection_type === 'multiple' ? 'checkbox' : 'radio'}
                              name={`addon-${group.id}`}
                              checked={addonSelections[group.id]?.includes(item.id) || false}
                              onChange={() => handleAddonSelection(group.id, item.id, group.selection_type)}
                              className="h-4 w-4 text-[#F2002D] accent-[#F2002D]"
                            />
                            <div className="flex-1 text-sm">
                              <div className="font-semibold text-[#1B1B1B]">{item.name || 'Unnamed item'}</div>
                              {item.cost ? <div className="text-xs text-gray-500">${item.cost}</div> : null}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-8 border-t border-gray-50">
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                <button
                  className="bg-[#F2002D] text-white px-12 py-4 rounded-full text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-[#F2002D]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={product.stock_status !== 'instock' || addingToCart}
                  onClick={handleAddToCart}
                >
                  {product.stock_status === 'instock' ? (addingToCart ? 'Adding…' : 'Add to Cart') : 'Out of Stock'}
                </button>
                {cartMessage && (
                  <div className="text-sm text-green-600 font-semibold flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <span>{cartMessage}</span>
                    <Link href="/shop/cart" className="underline hover:text-black">
                      View Cart
                    </Link>
                  </div>
                )}
              </div>

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