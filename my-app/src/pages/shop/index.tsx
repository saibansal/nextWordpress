import React from 'react';
import ShopLayout from '../../components/ShopLayout';
import { Icons } from '../../components/Icons';
import Link from 'next/link';

export default function ShopHome() {
  const featuredProducts = [
    { id: 1, name: 'LuminaBook Pro', price: '$1,999', category: 'Laptops', image: '/hero.png' },
    { id: 2, name: 'AirSync Max', price: '$549', category: 'Audio', image: '/products.png' },
    { id: 3, name: 'S-Pro Tablet', price: '$899', category: 'Tablets', image: '/products.png' },
    { id: 4, name: 'TimeGen Watch', price: '$399', category: 'Wearables', image: '/products.png' },
  ];

  return (
    <ShopLayout>
      {/* Hero Section */}
      <section className="relative px-8 mb-24">
        <div className="max-w-7xl mx-auto rounded-[2rem] overflow-hidden bg-foreground relative min-h-[600px] flex items-center">
          <img 
            src="/hero.png" 
            alt="Hero Visual" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-105 transition-all duration-[3000ms]"
          />
          <div className="relative z-10 p-12 lg:p-20 max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest mb-6">
              Spring Collection 2024
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-tight mb-8 tracking-tighter">
              BEYOND THE <br />
              <span className="text-primary italic">ORDINARY.</span>
            </h1>
            <p className="text-white/70 text-lg mb-10 leading-relaxed max-w-sm">
              Discover a new era of high-precision tech and minimalist craftsmanship. Designed for those who demand excellence.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/shop/products" className="bg-white text-black px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all active:scale-95 text-sm uppercase tracking-widest">
                Explore Now
              </Link>
              <Link href="#" className="text-white font-bold flex items-center gap-3 hover:gap-5 transition-all text-sm uppercase tracking-widest">
                Learn More <Icons.ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-8 max-w-7xl mx-auto mb-32 grid grid-cols-2 md:grid-cols-4 gap-8">
        {['Laptops', 'Audio', 'Tablets', 'Wearables'].map((cat) => (
          <div key={cat} className="group p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden">
            <h3 className="font-black text-xl mb-2 relative z-10">{cat}</h3>
            <p className="text-muted-foreground text-sm relative z-10">Browse Items</p>
            <Icons.Package className="w-20 h-20 absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform" />
          </div>
        ))}
      </section>

      {/* Featured Products */}
      <section className="px-8 max-w-7xl mx-auto mb-20">
        <div className="flex items-end justify-between mb-16">
          <div>
            <span className="text-primary font-black uppercase text-xs tracking-widest mb-4 block">Our Picks</span>
            <h2 className="text-5xl font-black tracking-tight">Featured Selection</h2>
          </div>
          <Link href="/shop/products" className="text-sm font-bold uppercase tracking-widest border-b-2 border-primary pb-1">Shop Everything</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {featuredProducts.map((product) => (
            <div key={product.id} className="group relative">
              <div className="aspect-[4/5] rounded-[2rem] bg-secondary/50 overflow-hidden mb-6 relative hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" 
                />
                <button className="absolute bottom-6 right-6 w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl shadow-black/20">
                  <Icons.ShoppingCart className="w-6 h-6" />
                </button>
              </div>
              <div className="px-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 block">{product.category}</span>
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors mb-1">{product.name}</h3>
                <p className="font-black text-xl tracking-tighter">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Ethos */}
      <section className="px-8 py-32 bg-secondary/30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-12">
            <Icons.Dashboard className="w-10 h-10" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-10 tracking-tight leading-tight">
            Designed for a life without boundaries. Built to last for generations.
          </h2>
          <p className="text-muted-foreground text-xl mb-12 italic leading-relaxed">
            "Everything we make is a statement. A statement that premium tech shouldn't compromise on durability or ethical sourcing. This is Lumina."
          </p>
          <div className="h-px w-20 bg-primary mx-auto"></div>
        </div>
      </section>
    </ShopLayout>
  );
}
