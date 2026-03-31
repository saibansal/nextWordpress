import React from 'react';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <main className="min-h-screen bg-background" />;
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
            PROJECT <br />REDEFINED.
          </h1>
          <p className="text-muted-foreground text-xl max-w-xl mx-auto font-medium leading-relaxed">
            Choose your destination. A premium e-commerce experience or a powerful administrative command center.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/shop" className="group">
            <div className="p-10 rounded-[3rem] bg-card border border-border hover:border-primary/50 transition-all duration-500 text-left h-full flex flex-col justify-between hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 cursor-pointer">
              <div>
                <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground mb-8 shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                </div>
                <h3 className="text-3xl font-black mb-4">Storefront</h3>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                  Full-featured e-commerce template with modern design, product grids, and premium aesthetics.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                Explore Shop 
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
              </div>
            </div>
          </Link>

          <Link href="/admin" className="group">
            <div className="p-10 rounded-[3rem] bg-foreground text-background transition-all duration-500 text-left h-full flex flex-col justify-between hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-2 cursor-pointer">
              <div>
                <div className="w-16 h-16 rounded-3xl bg-background text-foreground flex items-center justify-center mb-8 shadow-xl shadow-black/30 group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
                </div>
                <h3 className="text-3xl font-black mb-4 text-white">Admin Panel</h3>
                <p className="text-background/60 font-medium text-lg leading-relaxed">
                  Comprehensive dashboard for managing products, tracking orders, and viewing real-time analytics.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-2 text-white font-black uppercase text-xs tracking-widest">
                Manage Data
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
