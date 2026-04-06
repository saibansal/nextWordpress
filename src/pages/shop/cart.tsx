import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ShopLayout from '../../components/ShopLayout';
import { Icons } from '../../components/Icons';

interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const savedCart = localStorage.getItem('sakoon_cart');
    if (!savedCart) return [];
    try {
      return JSON.parse(savedCart) as CartItem[];
    } catch (error) {
      console.error('Failed to parse cart', error);
      return [];
    }
  });

  const updateCart = (nextCart: CartItem[]) => {
    setCartItems(nextCart);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sakoon_cart', JSON.stringify(nextCart));
    }
  };

  const removeItem = (id: number) => {
    updateCart(cartItems.filter((item) => item.id !== id));
  };

  const changeQuantity = (id: number, quantity: number) => {
    const nextCart = cartItems.map((item) => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item);
    updateCart(nextCart);
  };

  const total = cartItems.reduce((sum, item) => {
    const price = Number(item.price?.replace(/[^0-9.]/g, '')) || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <ShopLayout>
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tight">Your Cart</h1>
            <p className="text-sm text-muted-foreground mt-2">Review items before checkout.</p>
          </div>
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80">
            <Icons.ArrowUpRight className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        {!mounted ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-[#F2002D] rounded-full animate-spin"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-secondary/50 p-12 text-center">
            <p className="text-2xl font-bold mb-4">Your cart is empty.</p>
            <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-bold hover:opacity-90 transition-all">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6">
              {cartItems.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6 rounded-3xl border border-border p-6 items-center">
                  <div className="aspect-square rounded-3xl overflow-hidden bg-[#f8f8f8]">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-muted-foreground">No image</div>}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold">{item.name}</h2>
                        <p className="text-sm text-muted-foreground mt-2">{item.price}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-sm text-red-500 font-semibold hover:underline">
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="text-sm font-semibold">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => changeQuantity(item.id, Number(e.target.value))}
                        className="w-24 border border-border rounded-xl px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-border bg-white p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">Order total</p>
                <p className="text-4xl font-black">${total.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => router.push('/shop/checkout')}
                className="bg-[#F2002D] text-white px-10 py-4 rounded-full font-black uppercase tracking-widest hover:bg-black transition-all"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
