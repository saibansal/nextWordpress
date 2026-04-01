import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import ProductSubNav from '../../../components/ProductSubNav';
import { Icons } from '../../../components/Icons';

export default function ProductBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      // Trying to fetch from common brands taxonomy endpoints
      const res = await fetch('/api/wc/products/brands?per_page=100');
      if (!res.ok) {
          // If the endpoint doesn't exist, it might be because the plugin is not installed
          const errData = await res.json();
          if (errData.error?.code === 'rest_no_route' || errData.status === 404) {
              console.warn("Brands endpoint not found. WooCommerce Brands plugin might be required.");
              setError("Brands functionality usually requires a specific WooCommerce plugin (like WooCommerce Brands). Please ensure it's installed and REST API is enabled for it.");
              setBrands([]);
              return;
          }
          throw new Error('Failed to fetch brands');
      }
      const data = await res.json();
      setBrands(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/wc/products/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to create brand');
      setFormData({ name: '', slug: '', description: '' });
      fetchBrands();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Product Brands | WP Admin">
      <ProductSubNav />
      <div className="flex flex-col gap-4 mb-6">
          <h2 className="text-2xl font-normal text-[#1d2327]">Brands</h2>
      </div>

      {!error ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-4 border border-[#dcdcde] shadow-sm">
                <h3 className="text-sm font-bold border-b border-[#f0f0f1] pb-2 mb-4">Add new brand</h3>
                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div className="space-y-1">
                    <label className="font-semibold block">Name</label>
                    <input 
                    type="text" 
                    className="w-full border border-[#8c8f94] p-2 outline-none focus:border-[#2271b1]" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                    />
                </div>

                <div className="space-y-1">
                    <label className="font-semibold block">Slug</label>
                    <input 
                    type="text" 
                    className="w-full border border-[#8c8f94] p-2 outline-none focus:border-[#2271b1]" 
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    />
                </div>

                <div className="space-y-1">
                    <label className="font-semibold block">Description</label>
                    <textarea 
                    rows={4} 
                    className="w-full border border-[#8c8f94] p-2 outline-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#2271b1] text-white px-4 py-2 text-sm font-bold rounded-sm shadow-sm hover:bg-[#135e96] disabled:opacity-50"
                >
                    Add new brand
                </button>
                </form>
            </div>
            </div>

            <div className="md:col-span-2 overflow-x-auto">
            <div className="bg-white border border-[#dcdcde] shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                <thead>
                    <tr className="bg-[#f6f7f7] border-b border-[#dcdcde] font-bold text-[11px] uppercase tracking-wider text-[#1d2327]">
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Description</th>
                    <th className="px-3 py-3">Slug</th>
                    <th className="px-3 py-3 text-center">Count</th>
                    </tr>
                </thead>
                <tbody className={loading ? 'opacity-50' : ''}>
                    {brands.length > 0 ? brands.map((brand) => (
                    <tr key={brand.id} className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7] group/row relative transition-colors">
                        <td className="px-3 py-4 align-top">
                        <div className="flex flex-col">
                            <span className="text-[#2271b1] font-bold hover:text-[#135e96] cursor-pointer">{brand.name}</span>
                        </div>
                        </td>
                        <td className="px-3 py-4 text-gray-500 italic max-w-xs truncate">{brand.description || '—'}</td>
                        <td className="px-3 py-4 text-[#50575e] font-mono text-xs">{brand.slug}</td>
                        <td className="px-3 py-4 text-center">{brand.count}</td>
                    </tr>
                    )) : !loading && (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-500 italic">No brands found.</td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
            </div>
        </div>
      ) : (
          <div className="p-12 text-center bg-white border border-[#dcdcde] rounded-sm">
              <Icons.Globe className="w-12 h-12 text-[#2271b1] mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-[#1d2327] mb-2">Brands Plugin Required</h3>
              <p className="text-gray-600 max-w-lg mx-auto mb-6 text-sm">{error}</p>
              <a 
                href="https://woocommerce.com/products/brands/" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#2271b1] text-white px-6 py-2 rounded-sm font-bold text-sm shadow-sm hover:bg-[#135e96] transition-colors"
              >
                  Get WooCommerce Brands
              </a>
          </div>
      )}
    </AdminLayout>
  );
}
