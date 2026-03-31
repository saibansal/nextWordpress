import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';
import api from '../../lib/woocommerce';

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { title: 'Total Revenue', value: '...', trend: '+0%', isUp: true },
    { title: 'Total Orders', value: '...', trend: '+0%', isUp: true },
    { title: 'Total Products', value: '...', trend: '+0%', isUp: true },
    { title: 'Customers', value: '...', trend: '+0%', isUp: true },
  ]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch recent orders
        const ordersRes = await api.get("orders", { per_page: 5 });
        setRecentOrders(ordersRes.data);

        // Fetch products for stock alerts
        const productsRes = await api.get("products", { per_page: 100, stock_status: 'outofstock' });
        const lowStockRes = await api.get("products", { per_page: 100 });
        
        const lowStockItems = lowStockRes.data
          .filter((p: any) => p.manage_stock && p.stock_quantity <= 5)
          .slice(0, 3);
        setStockAlerts(lowStockItems);

        // Calculate basic stats (In a real app, you'd use a dedicated stats endpoint or aggregate)
        const allOrders = await api.get("orders", { per_page: 100 });
        const totalRevenue = allOrders.data.reduce((acc: number, order: any) => acc + parseFloat(order.total), 0);
        const totalOrders = allOrders.headers['x-wp-total'] || allOrders.data.length;
        
        const allProducts = await api.get("products", { per_page: 1 });
        const totalProducts = allProducts.headers['x-wp-total'] || 0;

        const allCustomers = await api.get("customers", { per_page: 1 });
        const totalCustomers = allCustomers.headers['x-wp-total'] || 0;

        setStats([
          { title: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, trend: '', isUp: true },
          { title: 'Total Orders', value: totalOrders.toString(), trend: '', isUp: true },
          { title: 'Total Products', value: totalProducts.toString(), trend: '', isUp: true },
          { title: 'Customers', value: totalCustomers.toString(), trend: '', isUp: true },
        ]);

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
              <div className={`p-1 rounded-md bg-secondary/50`}>
                <Icons.ArrowUpRight className={`w-4 h-4 ${stat.isUp ? 'text-primary' : 'text-destructive rotate-90'}`} />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl font-bold">{loading ? '...' : stat.value}</h2>
              {stat.trend && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stat.isUp ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                  {stat.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 rounded-2xl bg-card border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-lg">Recent Orders</h3>
            <button className="text-sm text-primary font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/30 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-4 font-mono text-sm">#{order.id}</td>
                    <td className="px-6 py-4 font-medium">{order.billing.first_name} {order.billing.last_name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(order.date_created).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'completed' ? 'bg-primary/10 text-primary' :
                        order.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                        order.status === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{order.currency_symbol}{order.total}</td>
                  </tr>
                ))}
                {!loading && recentOrders.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">No recent orders found.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-2">New Product</h3>
              <p className="text-primary-foreground/80 text-sm mb-6 leading-relaxed">
                Add a new product to your WooCommerce store from here.
              </p>
              <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-black/10 hover:bg-neutral-100 transition-all active:scale-95 flex items-center gap-2" onClick={() => window.location.href='/admin/products'}>
                <Icons.Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
            <Icons.Package className="w-32 h-32 absolute -right-8 -bottom-8 opacity-20 group-hover:scale-110 transition-transform duration-500" />
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Stock Alerts</h3>
            <div className="space-y-4">
              {stockAlerts.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl overflow-hidden">
                    {item.images?.[0] ? <img src={item.images[0].src} className="w-full h-full object-cover" /> : '📦'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-destructive font-semibold">Stock: {item.stock_quantity ?? 0} left</p>
                  </div>
                </div>
              ))}
              {!loading && stockAlerts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">All products in stock!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

