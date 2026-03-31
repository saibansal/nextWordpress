import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';

export default function AdminProducts() {
  const products = [
    { id: 1, name: 'LuminaBook Pro 16"', category: 'Laptops', price: '$2,499', stock: 12, status: 'In Stock' },
    { id: 2, name: 'AirSync Max Headphones', category: 'Audio', price: '$549', stock: 45, status: 'In Stock' },
    { id: 3, name: 'S-Pro Tablet Pro', category: 'Tablets', price: '$1,199', stock: 3, status: 'Low Stock' },
    { id: 4, name: 'TimeGen Watch Elite', category: 'Wearables', price: '$499', stock: 0, status: 'Out of Stock' },
    { id: 5, name: 'Nexus Keyboard', category: 'Accessories', price: '$199', stock: 28, status: 'In Stock' },
  ];

  return (
    <AdminLayout title="Product Inventory">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Icons.Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              className="bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-80 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
            Filter
          </button>
        </div>
        <button className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95">
          <Icons.Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-secondary/30 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-secondary/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
                      {product.category === 'Laptops' ? '💻' : product.category === 'Audio' ? '🎧' : '📦'}
                    </div>
                    <span className="font-semibold text-sm">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{product.category}</td>
                <td className="px-6 py-4 font-bold">{product.price}</td>
                <td className="px-6 py-4 font-mono text-sm">{product.stock}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    product.status === 'In Stock' ? 'bg-primary/10 text-primary' :
                    product.status === 'Low Stock' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                    <Icons.Settings className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
