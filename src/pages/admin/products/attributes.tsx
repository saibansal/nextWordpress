import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import ProductSubNav from '../../../components/ProductSubNav';
import { Icons } from '../../../components/Icons';

export default function ProductAttributes() {
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', type: 'select', order_by: 'menu_order', has_archives: true });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchAttributes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wc/products/attributes?per_page=100');
      if (!res.ok) throw new Error('Failed to fetch attributes');
      const data = await res.json();
      setAttributes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId 
        ? `/api/wc/products/attributes/${editingId}` 
        : '/api/wc/products/attributes';
      const method = editingId ? 'PUT' : 'POST';

      const body: any = { ...formData };
      if (!body.slug) delete body.slug;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Failed to ${editingId ? 'update' : 'create'} attribute`);
      setFormData({ name: '', slug: '', type: 'select', order_by: 'menu_order', has_archives: true });
      setEditingId(null);
      fetchAttributes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (attr: any) => {
    setEditingId(attr.id);
    setFormData({
      name: attr.name,
      slug: attr.slug,
      type: attr.type || 'select',
      order_by: attr.order_by || 'menu_order',
      has_archives: attr.has_archives ?? true
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this attribute?')) return;
    try {
      const res = await fetch(`/api/wc/products/attributes/${id}?force=true`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete attribute');
      fetchAttributes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AdminLayout title="Product Attributes | WP Admin">
      <ProductSubNav />
      <div className="flex flex-col gap-4 mb-6">
          <h2 className="text-2xl font-normal text-[#1d2327]">Attributes</h2>
          <p className="text-sm text-gray-600 max-w-4xl">Attributes let you define extra product data, such as size or color. You can use these attributes in the shop sidebar using the “layered nav” widgets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-4 border border-[#dcdcde] shadow-sm sticky top-16">
            <h3 className="text-sm font-bold border-b border-[#f0f0f1] pb-2 mb-4">
                {editingId ? 'Edit attribute' : 'Add new attribute'}
            </h3>
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
                <p className="text-[11px] text-gray-500">Name for the attribute (shown on the front-end).</p>
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

              <div className="flex items-center gap-2 py-2">
                  <input 
                    type="checkbox" 
                    id="has_archives" 
                    className="w-4 h-4"
                    checked={formData.has_archives}
                    onChange={e => setFormData({...formData, has_archives: e.target.checked})}
                  />
                  <label htmlFor="has_archives" className="font-semibold">Enable archives?</label>
              </div>

              <div className="space-y-1">
                <label className="font-semibold block">Default sort order</label>
                <select 
                  className="w-full border border-[#8c8f94] p-2 outline-none"
                  value={formData.order_by}
                  onChange={e => setFormData({...formData, order_by: e.target.value})}
                >
                  <option value="menu_order">Custom ordering</option>
                  <option value="name">Name</option>
                  <option value="id">Term ID</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#2271b1] text-white px-4 py-2 text-sm font-bold rounded-sm shadow-sm hover:bg-[#135e96] disabled:opacity-50"
                >
                    {editingId ? 'Update attribute' : 'Add attribute'}
                </button>
                {editingId && (
                    <button 
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ name: '', slug: '', type: 'select', order_by: 'menu_order', has_archives: true });
                        }}
                        className="bg-white border border-[#dcdcde] text-[#2271b1] px-4 py-2 text-sm font-bold rounded-sm hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 overflow-x-auto">
          <div className="bg-white border border-[#dcdcde] shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#f6f7f7] border-b border-[#dcdcde] font-bold text-[11px] uppercase tracking-wider text-[#1d2327]">
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Slug</th>
                  <th className="px-3 py-3">Order by</th>
                  <th className="px-3 py-3">Terms</th>
                </tr>
              </thead>
              <tbody className={loading ? 'opacity-50' : ''}>
                {attributes.map((attr) => (
                  <tr key={attr.id} className={`border-b border-[#f0f0f1] hover:bg-[#f6f7f7] group/row relative transition-colors ${editingId === attr.id ? 'bg-[#f0f6fb]' : ''}`}>
                    <td className="px-3 py-4 align-top">
                      <div className="flex flex-col">
                        <span className="text-[#2271b1] font-bold hover:text-[#135e96] cursor-pointer">{attr.name}</span>
                        <div className="flex items-center gap-2 text-[11px] text-[#2271b1] opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(attr)} className="hover:text-black">Edit</button>
                            <span className="text-[#dcdcde]">|</span>
                            <button onClick={() => handleDelete(attr.id)} className="hover:text-destructive text-destructive">Delete</button>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-[#50575e] font-mono text-xs">{attr.slug}</td>
                    <td className="px-3 py-4 text-gray-500 capitalize">{attr.order_by.replace('_', ' ')}</td>
                    <td className="px-3 py-4">
                        <button className="text-[#2271b1] hover:underline font-semibold text-xs border border-[#2271b1] px-2 py-1 rounded-sm">Configure terms</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {error && <div className="mt-4 p-4 bg-red-50 text-red-600 border-l-4 border-red-600 text-sm font-medium">{error}</div>}
    </AdminLayout>
  );
}
