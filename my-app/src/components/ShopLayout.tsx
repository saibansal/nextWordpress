import React from 'react';
import Link from 'next/link';
import { Icons } from './Icons';

interface ShopLayoutProps {
  children: React.ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-['Inter',system-ui,sans-serif]">
      {/* Premium Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-4 bg-background/70 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/shop" className="text-2xl font-black tracking-tightest group">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400 group-hover:from-indigo-400 group-hover:to-primary transition-all duration-700">LUMINA</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8">
            {['Shop', 'Categories', 'Bestsellers', 'New Arrivals'].map((link) => (
              <Link 
                key={link} 
                href="/shop/products" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5"
              >
                {link}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Icons.Search className="w-5 h-5" />
          </button>
          <Link href="/shop/cart" className="relative group">
            <Icons.ShoppingCart className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-all" />
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </Link>
          <Link href="/admin" className="px-5 py-2.5 rounded-full bg-foreground text-background text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10">
            ADMIN PANEL
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 pt-24 pb-20">
        {children}
      </main>

      {/* Ultra-modern Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-md pt-20 pb-10 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2">
            <h2 className="text-3xl font-black mb-6">LUMINA</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-sm leading-relaxed">
              Redefining high-performance tech and minimal aesthetics. Experience future of commerce today.
            </p>
            <div className="flex items-center gap-4">
              <input 
                type="email" 
                placeholder="Join the waitlist..." 
                className="bg-secondary/50 border border-border px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
              />
              <button className="bg-foreground text-background px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all active:scale-95">GO</button>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-muted-foreground">Company</h4>
            <ul className="space-y-4 text-muted-foreground font-medium">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Sustainability</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Press</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-muted-foreground">Support</h4>
            <ul className="space-y-4 text-muted-foreground font-medium">
              <li><Link href="#" className="hover:text-primary transition-colors">Order Status</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Returns</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-widest">
          <p>© 2024 LUMINA LTD. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link href="#">TERMS</Link>
            <Link href="#">PRIVACY</Link>
            <Link href="#">COOKIES</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
