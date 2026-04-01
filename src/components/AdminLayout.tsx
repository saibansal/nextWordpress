import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icons } from './Icons';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();

  const menuSections = [
    {
      title: 'Dashboard',
      items: [
        { name: 'Home', href: '/admin', icon: Icons.Dashboard },
        { name: 'Analytics', href: '/admin/reports', icon: Icons.BarChart },
      ]
    },
    {
      title: 'Store Management',
      items: [
        { name: 'Orders', href: '/admin/orders', icon: Icons.ShoppingCart },
        { name: 'Products', href: '/admin/products', icon: Icons.Package },
        { name: 'Customers', href: '/admin/customers', icon: Icons.Users },
        { name: 'Coupons', href: '/admin/coupons', icon: Icons.Tag },
      ]
    },
    {
      title: 'Content',
      items: [
        { name: 'Pages', href: '/admin/pages', icon: Icons.FileText },
        { name: 'Media', href: '/admin/media', icon: Icons.Image },
        { name: 'Comments', href: '/admin/comments', icon: Icons.MessageSquare },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Storefront', href: '/', icon: Icons.Globe },
        { name: 'Settings', href: '/admin/settings', icon: Icons.Settings },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#F0F0F1] overflow-hidden"> {/* Using WP-style light gray bg */}
      {/* Sidebar */}
      <aside className="w-64 bg-[#1d2327] text-white flex flex-col shadow-xl"> {/* WordPress dark sidebar */}
        <div className="p-6 flex items-center gap-3 bg-[#1d2327]">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg">
            W
          </div>
          <span className="font-bold text-lg tracking-tight text-white/90">WP Admin Panel</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-hide">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                {section.title}
              </h3>
              {section.items.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all duration-200 group ${isActive
                      ? 'bg-[#2271b1] text-white' // WordPress Blue
                      : 'hover:bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 bg-[#1d2327] border-t border-white/5">
          <button className="flex items-center gap-3 px-4 py-2 w-full text-white/50 hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
            <Icons.LogOut className="w-4 h-4" />
            <span className="text-sm font-medium text-white/70 hover:text-white">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#F0F0F1]">
        {/* Top Navbar (WP Style Admin Bar) */}
        <header className="h-12 bg-[#1d2327] text-white/80 sticky top-0 z-10 flex items-center justify-between px-6 shadow-md">
          <div className="flex items-center gap-6">
            <h1 className="text-sm font-medium tracking-wide flex items-center gap-2">
              <span className="text-white/40 font-black">/</span> {title}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Icons.Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="Quick search..."
                className="bg-white/5 border-none rounded-md pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-white/20 w-48 text-white transition-all"
              />
            </div>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 px-2 py-1 rounded transition-colors group">
              <span className="text-xs font-semibold text-white/70 group-hover:text-white">Howdy, Admin</span>
              <div className="w-7 h-7 rounded bg-[#2271b1] flex items-center justify-center text-[10px] font-black shadow-inner">
                VS
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
