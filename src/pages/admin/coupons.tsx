import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [editingCouponId, setEditingCouponId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
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
      url.searchParams.append('status', 'any');
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

  const handleEdit = (coupon: any) => {
    setEditingCouponId(coupon.id);
    setFormData({
      code: coupon.code.toUpperCase(),
      discount_type: coupon.discount_type,
      amount: coupon.amount,
      description: coupon.description || '',
      expiry_date: coupon.date_expires ? coupon.date_expires.split('T')[0] : '',
      usage_limit: coupon.usage_limit ? coupon.usage_limit.toString() : '',
      individual_use: coupon.individual_use || false,
      free_shipping: coupon.free_shipping || false,
      exclude_sale_items: coupon.exclude_sale_items || false
    });
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingCouponId ? 'PUT' : 'POST';
      const url = editingCouponId ? `/api/wc/coupons/${editingCouponId}` : "/api/wc/coupons";
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error(`Failed to ${editingCouponId ? 'update' : 'create'} coupon`);
      
      closeModal();
      fetchCoupons();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setEditingCouponId(null);
    setFormData({
      code: '', discount_type: 'fixed_cart', amount: '', description: '',
      expiry_date: '', usage_limit: '', individual_use: false,
      free_shipping: false, exclude_sale_items: false
    });
    setShowAddModal(false);
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
          onClick={() => { setEditingCouponId(null); setShowAddModal(true); }}
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
              <tr className="bg-secondary/30 text-muted-foreground text-[10px] font-black uppercase tracking-widest border-b border-border">
                <th className="px-6 py-4">Coupon Code</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Usage</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-4">
                    <span 
                        onClick={() => handleEdit(coupon)}
                        className="font-mono text-xs font-black text-primary p-2 bg-primary/5 rounded border border-primary/20 tracking-wider shadow-sm cursor-pointer hover:bg-primary/10"
                    >
                      {coupon.code.toUpperCase()}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-2 font-medium italic">{coupon.description || 'No description assigned'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-secondary/80 capitalize text-gray-600 border border-border">
                      {coupon.discount_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-sm">
                    {coupon.discount_type === 'percentage' ? `${coupon.amount}%` : `$${coupon.amount}`}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                      coupon.status === 'publish' ? 'bg-emerald-500/10 text-emerald-600' :
                      coupon.status === 'draft' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-slate-500/10 text-slate-600'
                    }`}>
                      {coupon.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-black text-center text-muted-foreground">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-primary text-sm">{coupon.usage_count}</span>
                        <span className="opacity-50">OF {coupon.usage_limit || '∞'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                    {coupon.date_expires ? new Date(coupon.date_expires).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEdit(coupon)}
                        className="text-muted-foreground hover:text-primary p-2 transition-colors rounded-lg hover:bg-primary/10"
                        title="Edit Coupon"
                      >
                        <Icons.Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteCoupon(coupon.id)}
                        className="text-muted-foreground hover:text-destructive p-2 transition-colors rounded-lg hover:bg-destructive/10"
                        title="Delete Coupon"
                      >
                        <Icons.Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && (
            <div className="p-12 text-center text-muted-foreground italic text-sm font-medium">No coupons found in your store's database.</div>
          )}
        </div>
      )}

      {/* Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-background rounded-3xl border border-border shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-border flex items-center justify-between bg-secondary/20">
              <div>
                <h3 className="text-xl font-bold">{editingCouponId ? `Edit Coupon: ${formData.code}` : 'Generate New Coupon'}</h3>
                {editingCouponId && <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest">Database ID: #{editingCouponId}</p>}
              </div>
              <button onClick={closeModal} className="hover:rotate-90 transition-transform p-2 bg-background rounded-full shadow-sm">
                <Icons.X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Coupon Code</label>
                  <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-card border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/50 text-lg font-black tracking-widest placeholder:opacity-20" placeholder="HAPPYNEWYEAR" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Discount Type</label>
                  <select value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})} className="w-full bg-card border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/50 text-xs font-bold uppercase tracking-widest leading-6">
                    <option value="fixed_cart">Fixed Cart Discount ($)</option>
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed_product">Fixed Product Discount ($)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Coupon Amount</label>
                  <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-muted-foreground opacity-30">{formData.discount_type === 'percentage' ? '%' : '$'}</span>
                      <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-card border border-border rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-primary/50 text-lg font-bold" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Expiry Date</label>
                  <input type="date" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} className="w-full bg-card border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Usage Limit</label>
                  <input type="number" value={formData.usage_limit} onChange={e => setFormData({...formData, usage_limit: e.target.value})} className="w-full bg-card border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold" placeholder="∞ (unlimited)" />
                </div>
                <div className="space-y-6 pt-4 flex flex-col justify-center">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={formData.individual_use} onChange={e => setFormData({...formData, individual_use: e.target.checked})} className="w-5 h-5 accent-primary" />
                        <span className="text-xs font-bold text-gray-600 group-hover:text-primary transition-colors">Individual use only</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={formData.free_shipping} onChange={e => setFormData({...formData, free_shipping: e.target.checked})} className="w-5 h-5 accent-primary" />
                        <span className="text-xs font-bold text-gray-600 group-hover:text-primary transition-colors">Apply free shipping</span>
                    </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Internal Notes / Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-card border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/50 text-sm leading-relaxed" placeholder="Internal notes about this promotion..." />
              </div>

              <div className="flex gap-4 pt-6 border-t border-border">
                <button type="submit" disabled={loading} className="flex-1 bg-[#2271b1] text-white py-5 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 hover:bg-[#135e96] active:scale-[0.98] transition-all shadow-xl shadow-[#2271b1]/20">
                  {loading ? <Icons.RefreshCW className="w-5 h-5 animate-spin" /> : <Icons.Check className="w-5 h-5 font-black" />}
                  {editingCouponId ? 'Save Store Updates' : 'Generate Live Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
