import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'fixed_cart',
    amount: '',
    description: '',
    expiry_date: '',
    usage_limit: '',
    individual_use: false,
    free_shipping: false,
    exclude_sale_items: false
  });

  const fetchCoupons = async (searchQuery = '') => {
    setLoading(true);
    try {
      const url = new URL("/api/wc/coupons", window.location.origin);
      url.searchParams.append('per_page', '100');
      url.searchParams.append('status', 'any'); // Fetch draft, publish, etc.
      if (searchQuery) url.searchParams.append('search', searchQuery);
      
      const response = await fetch(url.toString());

      if (!response.ok) throw new Error("Failed to fetch coupons");
      const data = await response.json();
      setCoupons(data);
    } catch (err: any) {
      console.error("Error fetching coupons:", err);
      setError("Failed to fetch coupons. Please check your API credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/wc/coupons", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon)
      });
      
      if (!response.ok) throw new Error("Failed to create coupon");
      
      // Reset form and refresh
      setNewCoupon({
        code: '', discount_type: 'fixed_cart', amount: '', description: '',
        expiry_date: '', usage_limit: '', individual_use: false,
        free_shipping: false, exclude_sale_items: false
      });
      setShowAddModal(false);
      fetchCoupons();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const response = await fetch(`/api/wc/coupons/${id}?force=true`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Failed to delete coupon");
      fetchCoupons();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AdminLayout title="Coupon Management">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Icons.Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter coupons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCoupons(search)}
              className="bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-80 shadow-sm"
            />
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Icons.Plus className="w-5 h-5" />
          Add New Coupon
        </button>
      </div>

      {loading && coupons.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive mb-6">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Coupon Code</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Usage Limit</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-black text-primary p-1 bg-primary/5 rounded border border-primary/10 tracking-widest leading-none">
                      {coupon.code.toUpperCase()}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[200px]">{coupon.description || 'No description'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-secondary/50 capitalize">
                      {coupon.discount_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {coupon.discount_type === 'percentage' ? `${coupon.amount}%` : `$${coupon.amount}`}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      coupon.status === 'publish' ? 'bg-emerald-500/10 text-emerald-600' :
                      coupon.status === 'draft' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-slate-500/10 text-slate-600'
                    }`}>
                      {coupon.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">

                    {coupon.usage_count} / {coupon.usage_limit || '∞'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {coupon.date_expires ? new Date(coupon.date_expires).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => deleteCoupon(coupon.id)}
                      className="text-muted-foreground hover:text-destructive p-2 transition-colors rounded-lg hover:bg-destructive/10"
                    >
                      <Icons.Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && (
            <div className="p-12 text-center text-muted-foreground italic">No coupons found.</div>
          )}
        </div>
      )}

      {/* Add New Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-background rounded-3xl border border-border shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-border flex items-center justify-between bg-secondary/20 font-bold text-xl">
              <h3>Create New Coupon</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform">
                <Icons.X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Coupon Code</label>
                  <input required type="text" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="w-full bg-card border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono tracking-widest" placeholder="SALE50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Discount Type</label>
                  <select value={newCoupon.discount_type} onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value})} className="w-full bg-card border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                    <option value="fixed_cart">Fixed Cart Discount ($)</option>
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed_product">Fixed Product Discount ($)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Amount</label>
                  <input required type="number" step="0.01" value={newCoupon.amount} onChange={e => setNewCoupon({...newCoupon, amount: e.target.value})} className="w-full bg-card border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="10.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Expiry Date</label>
                  <input type="date" value={newCoupon.expiry_date} onChange={e => setNewCoupon({...newCoupon, expiry_date: e.target.value})} className="w-full bg-card border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                <textarea rows={2} value={newCoupon.description} onChange={e => setNewCoupon({...newCoupon, description: e.target.value})} className="w-full bg-card border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Explain the discount logic..." />
              </div>
              <div className="flex gap-4 pt-4 border-t border-border">
                <button type="submit" disabled={loading} className="flex-1 bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
                  {loading ? <Icons.RefreshCW className="w-5 h-5 animate-spin" /> : <Icons.Check className="w-5 h-5" />}
                  Generate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
