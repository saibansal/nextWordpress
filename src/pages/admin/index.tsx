import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';
import Link from 'next/link';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [salesReport, setSalesReport] = useState<any>(null);
  const [topSellers, setTopSellers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState<any>({
      total_sales: '0',
      net_sales: '0',
      orders_count: 0,
      avg_order_value: '0',
      total_customers: 0
  });


  useEffect(() => {
    setIsMounted(true);
    async function fetchAdminData() {

      setLoading(true);
      try {
        const [salesRes, sellersRes, ordersRes, customersRes] = await Promise.all([
          fetch("/api/wc/reports/sales?period=month"),
          fetch("/api/wc/reports/top_sellers?period=month"),
          fetch("/api/wc/orders?per_page=6"),
          fetch("/api/wc/customers?per_page=1")
        ]);

        if (salesRes.ok) {
            const data = await salesRes.json();
            const current = data[0] || {};
            setSalesReport(current);
            setStats((prev: any) => ({
                ...prev,
                total_sales: current.total_sales || '0',
                net_sales: current.net_sales || '0',
                orders_count: current.orders_count || 0,
                avg_order_value: (parseFloat(current.total_sales || '0') / (current.orders_count || 1)).toFixed(2)
            }));
        }

        if (sellersRes.ok) setTopSellers(await sellersRes.json());
        if (ordersRes.ok) setRecentOrders(await ordersRes.json());
        
        const totalCustomers = customersRes.headers.get('x-wp-total') || '0';
        setStats((prev: any) => ({ ...prev, total_customers: parseInt(totalCustomers) }));

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  const managementLinks = [
      { name: 'Add Product', icon: <Icons.Plus className="w-5 h-5" />, href: '/admin/products/new', color: 'bg-blue-500' },
      { name: 'View Orders', icon: <Icons.ShoppingCart className="w-5 h-5" />, href: '/admin/orders', color: 'bg-purple-500' },
      { name: 'Manage Media', icon: <Icons.Image className="w-5 h-5" />, href: '/admin/media', color: 'bg-pink-500' },
      { name: 'Store Settings', icon: <Icons.Settings className="w-5 h-5" />, href: '/admin/settings', color: 'bg-amber-500' },
  ];

  return (
    <AdminLayout title="WooCommerce Central | Store Overview">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
              { label: 'Total Sales', value: `$${stats.total_sales}`, sub: 'this month', icon: <Icons.BarChart className="w-4 h-4" /> },
              { label: 'Net Sales', value: `$${stats.net_sales}`, sub: 'after discounts', icon: <Icons.Check className="w-4 h-4" /> },
              { label: 'Orders', value: stats.orders_count, sub: 'total placed', icon: <Icons.ShoppingCart className="w-4 h-4" /> },
              { label: 'Avg Order', value: `$${stats.avg_order_value}`, sub: 'revenue/order', icon: <Icons.ArrowUpRight className="w-4 h-4" /> },
              { label: 'Customers', value: stats.total_customers, sub: 'lifetime unique', icon: <Icons.Users className="w-4 h-4" /> },
          ].map((item, i) => (
              <div key={i} className="bg-white border border-[#dcdcde] p-5 shadow-sm rounded-xl group hover:border-[#2271b1] transition-all">
                  <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#2271b1] transition-colors">{item.label}</span>
                      <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-[#2271b1]/10 group-hover:text-[#2271b1] transition-all">
                          {item.icon}
                      </div>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1d2327] mb-1">{loading ? '...' : item.value}</h2>
                  <p className="text-[10px] text-gray-400 font-medium italic">{item.sub}</p>
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Chart/Orders Area */}
          <div className="xl:col-span-2 space-y-8">
              {/* Performance Chart Placeholder (Premium Look) */}
              <div className="bg-white border border-[#dcdcde] rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#dcdcde] flex items-center justify-between bg-gray-50/50">
                      <h3 className="font-bold text-sm text-[#1d2327]">Store Performance (Sales)</h3>
                      <div className="flex gap-2">
                          <span className="px-2 py-1 bg-white border border-[#dcdcde] rounded text-[10px] font-bold">Month</span>
                          <span className="px-2 py-1 bg-white border border-[#dcdcde] rounded text-[10px] font-bold opacity-50">Year</span>
                      </div>
                  </div>
                  <div className="p-8 h-64 flex items-end justify-between gap-2 relative">
                      {/* Stylized Bar Chart using Divs */}
                      {[40, 70, 45, 90, 65, 80, 55, 95, 30, 85, 60, 75].map((h, i) => (
                          <div key={i} className="flex-1 bg-[#2271b1]/10 rounded-t-lg group relative hover:bg-[#2271b1] transition-all cursor-pointer" style={{ height: `${h}%` }}>
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Day {i+1}: ${isMounted ? (150 + i * 20) : '...'}
                              </div>
                          </div>
                      ))}

                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         {loading && <Icons.RefreshCW className="w-8 h-8 text-[#2271b1] animate-spin opacity-20" />}
                      </div>
                  </div>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white border border-[#dcdcde] rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#dcdcde] flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[#1d2327]">Recent Orders</h3>
                      <Link href="/admin/orders" className="text-xs text-[#2271b1] font-bold hover:underline">View All Orders</Link>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                          <thead>
                              <tr className="bg-gray-50 text-gray-400 font-black uppercase tracking-widest border-b border-[#dcdcde]">
                                  <th className="px-6 py-3">Order</th>
                                  <th className="px-6 py-3">Customer</th>
                                  <th className="px-6 py-3">Status</th>
                                  <th className="px-6 py-3 text-right">Total</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-[#dcdcde]">
                              {recentOrders.map(order => (
                                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-6 py-4 font-bold text-[#2271b1]">#{order.id}</td>
                                      <td className="px-6 py-4">
                                          <div className="font-bold">{order.billing.first_name} {order.billing.last_name}</div>
                                          <div className="text-[10px] text-gray-400">{isMounted ? new Date(order.date_created).toLocaleDateString() : '...'}</div>
                                      </td>

                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-1 rounded-md font-bold uppercase text-[9px] ${
                                              order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                              order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                              'bg-gray-100 text-gray-600'
                                          }`}>
                                              {order.status}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 text-right font-black text-sm">
                                          {order.currency_symbol}{order.total}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
              {/* Setup / Management Links */}
              <div className="bg-white border border-[#dcdcde] rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-sm text-[#1d2327] mb-6">Store Management</h3>
                  <div className="grid grid-cols-2 gap-4">
                      {managementLinks.map((link, i) => (
                          <Link key={i} href={link.href} className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#dcdcde] hover:border-[#2271b1] hover:bg-[#2271b1]/5 transition-all group">
                              <div className={`w-10 h-10 rounded-full ${link.color} text-white flex items-center justify-center mb-3 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
                                  {link.icon}
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-[#1d2327] text-center">{link.name}</span>
                          </Link>
                      ))}
                  </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-white border border-[#dcdcde] rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#dcdcde] bg-gray-50/50">
                      <h3 className="font-bold text-sm text-[#1d2327]">Top Sellers</h3>
                  </div>
                  <div className="p-2">
                      {topSellers.map((item, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-black text-[#2271b1] border border-[#dcdcde]">
                                  {i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-sm text-[#1d2327] truncate">{item.name}</h4>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.quantity} Sold</p>
                              </div>
                          </div>
                      ))}
                      {topSellers.length === 0 && !loading && (
                          <div className="p-8 text-center text-gray-400 text-xs italic">No sales found for this period.</div>
                      )}
                  </div>
              </div>

              {/* Quick Actions / Tips */}
              <div className="bg-[#2271b1] rounded-2xl p-6 text-white shadow-xl shadow-[#2271b1]/20 relative overflow-hidden group">
                  <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                          <Icons.Plus className="w-6 h-6 bg-white/20 p-1 rounded-lg" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quick Tip</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2">New Site Launch?</h3>
                      <p className="text-white/70 text-xs mb-6 leading-relaxed">
                          Remember to verify your shipping zones and tax settings before going live to ensure accurate checkout values.
                      </p>
                      <button className="bg-white text-[#2271b1] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                          Read Guide
                      </button>
                  </div>
                  <Icons.ShoppingCart className="w-32 h-32 absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700" />
              </div>
          </div>
      </div>
    </AdminLayout>
  );
}
