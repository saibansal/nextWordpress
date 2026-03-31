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

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: Icons.Dashboard },
    { name: 'Products', href: '/admin/products', icon: Icons.Package },
    { name: 'Orders', href: '/admin/orders', icon: Icons.ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Icons.Users },
    { name: 'Storefront', href: '/', icon: Icons.Globe }, // Assuming landing page is storefront
    { name: 'Settings', href: '/admin/settings', icon: Icons.Settings },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            A
          </div>
          <span className="font-bold text-xl tracking-tight">Antigravity</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'group-hover:text-foreground'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button className="flex items-center gap-3 px-4 py-2.5 w-full text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10">
            <Icons.LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold">{title}</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Icons.Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-secondary/50 border border-border rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
              />
            </div>
            <div className="w-8 h-8 rounded-full bg-accent border border-border flex items-center justify-center text-xs font-bold">
              VS
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
