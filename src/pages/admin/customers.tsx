import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';
// import api from '../../lib/woocommerce';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  const fetchCustomers = async (searchQuery = '') => {
    setLoading(true);
    try {
      const url = new URL("/api/wc/customers", window.location.origin);
      url.searchParams.append('per_page', '100');
      if (searchQuery) url.searchParams.append('search', searchQuery);
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();
      setCustomers(data);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      setError("Failed to fetch customers. Please check your API credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  return (
    <AdminLayout title="Customer Management">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <Icons.Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-80 shadow-sm"
            />
          </form>
        </div>
      </div>


      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Last Order</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                        {customer.first_name?.[0]}{customer.last_name?.[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{customer.first_name} {customer.last_name}</span>
                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{customer.orders_count}</td>
                  <td className="px-6 py-4 font-bold">${customer.total_spent}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {customer.last_order ? new Date(customer.last_order.date).toLocaleDateString() : 'N/A'}
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
          {customers.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              No customers found.
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
