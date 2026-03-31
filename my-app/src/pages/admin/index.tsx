import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Revenue', value: '$45,231', trend: '+12.5%', isUp: true },
    { title: 'Total Orders', value: '1,234', trend: '+5.2%', isUp: true },
    { title: 'Active Users', value: '567', trend: '-2.1%', isUp: false },
    { title: 'Conversion Rate', value: '3.4%', trend: '+0.8%', isUp: true },
  ];

  const recentOrders = [
    { id: '#1234', customer: 'Vismaad Singh', date: 'Oct 23, 2023', status: 'Delivered', amount: '$120.00' },
    { id: '#1235', customer: 'Jane Doe', date: 'Oct 22, 2023', status: 'Pending', amount: '$75.00' },
    { id: '#1236', customer: 'John Smith', date: 'Oct 21, 2023', status: 'Processing', amount: '$210.00' },
    { id: '#1237', customer: 'Alice Brown', date: 'Oct 20, 2023', status: 'Cancelled', amount: '$45.00' },
  ];

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
              <h2 className="text-3xl font-bold">{stat.value}</h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stat.isUp ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Orders */}
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
                    <td className="px-6 py-4 font-mono text-sm">{order.id}</td>
                    <td className="px-6 py-4 font-medium">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{order.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Delivered' ? 'bg-primary/10 text-primary' :
                        order.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                        order.status === 'Processing' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-2">New Product</h3>
              <p className="text-primary-foreground/80 text-sm mb-6 leading-relaxed">
                Add a new product to your catalog and start selling immediately.
              </p>
              <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-black/10 hover:bg-neutral-100 transition-all active:scale-95 flex items-center gap-2">
                <Icons.Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
            <Icons.Package className="w-32 h-32 absolute -right-8 -bottom-8 opacity-20 group-hover:scale-110 transition-transform duration-500" />
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Stock Alerts</h3>
            <div className="space-y-4">
              {[
                { name: 'MacBook Pro M3', stock: 2, image: '💻' },
                { name: 'iPhone 15 Pro', stock: 5, image: '📱' },
                { name: 'AirPods Max', stock: 1, image: '🎧' },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                    {item.image}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-destructive font-semibold">Low Stock: {item.stock} left</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
