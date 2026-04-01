import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import ProductSubNav from '../../../components/ProductSubNav';
import { Icons } from '../../../components/Icons';

export default function ProductCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', parent: 0, description: '' });

  const [editingId, setEditingId] = useState<number | null>(null);

  const organizeCategories = (cats: any[], parentId = 0, depth = 0): any[] => {
    let result: any[] = [];
    cats
      .filter(cat => cat.parent === parentId)
      .forEach(cat => {
        result.push({ ...cat, depth });
        const children = organizeCategories(cats, cat.id, depth + 1);
        result = [...result, ...children];
      });
    return result;
  };

  const hierarchicalCategories = organizeCategories(categories);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wc/products/categories?per_page=100');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId 
        ? `/api/wc/products/categories?id=${editingId}` 
        : '/api/wc/products/categories';
      const method = editingId ? 'PUT' : 'POST';

      const body: any = { ...formData };
      if (!body.slug) delete body.slug;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) throw new Error(`Failed to ${editingId ? 'update' : 'create'} category`);
      
      setFormData({ name: '', slug: '', parent: 0, description: '' });
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      parent: cat.parent,
      description: cat.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/wc/products/categories?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AdminLayout title="Product Categories | WP Admin">
      <ProductSubNav />
      <div className="flex flex-col gap-4 mb-6">
          <h2 className="text-2xl font-normal text-[#1d2327]">Product categories</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Add/Edit Form */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-4 border border-[#dcdcde] shadow-sm sticky top-16">
            <h3 className="text-sm font-bold border-b border-[#f0f0f1] pb-2 mb-4">
                {editingId ? 'Edit category' : 'Add new category'}
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
                <p className="text-[11px] text-gray-500">The name is how it appears on your site.</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold block">Slug</label>
                <input 
                  type="text" 
                  className="w-full border border-[#8c8f94] p-2 outline-none focus:border-[#2271b1]" 
                  value={formData.slug}
                  onChange={e => setFormData({...formData, slug: e.target.value})}
                />
                <p className="text-[11px] text-gray-500">The “slug” is the URL-friendly version of the name.</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold block">Parent category</label>
                <select 
                  className="w-full border border-[#8c8f94] p-2 outline-none"
                  value={formData.parent}
                  onChange={e => setFormData({...formData, parent: parseInt(e.target.value)})}
                >
                  <option value={0}>None</option>
                  {hierarchicalCategories.filter(c => c.id !== editingId).map(cat => (
                    <option key={cat.id} value={cat.id}>
                        {cat.depth > 0 ? '\u00A0'.repeat(cat.depth * 3) + '— ' : ''}{cat.name}
                    </option>
                  ))}
                </select>
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

              <div className="flex items-center gap-2">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#2271b1] text-white px-4 py-2 text-sm font-bold rounded-sm shadow-sm hover:bg-[#135e96] disabled:opacity-50"
                >
                    {editingId ? 'Update category' : 'Add new category'}
                </button>
                {editingId && (
                    <button 
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ name: '', slug: '', parent: 0, description: '' });
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

        {/* Right Column: List Table */}
        <div className="md:col-span-2 overflow-x-auto">
          <div className="bg-white border border-[#dcdcde] shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#f6f7f7] border-b border-[#dcdcde] font-bold text-[11px] uppercase tracking-wider text-[#1d2327]">
                  <th className="px-3 py-3 w-10 text-center"><input type="checkbox" className="w-4 h-4" /></th>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3">Slug</th>
                  <th className="px-3 py-3 text-center">Count</th>
                </tr>
              </thead>
              <tbody className={loading ? 'opacity-50' : ''}>
                {hierarchicalCategories.map((cat) => (
                  <tr key={cat.id} className={`border-b border-[#f0f0f1] hover:bg-[#f6f7f7] group/row relative transition-colors ${editingId === cat.id ? 'bg-[#f0f6fb]' : ''}`}>
                    <td className="px-3 py-4 text-center align-top"><input type="checkbox" className="w-4 h-4" /></td>
                    <td className="px-3 py-4 align-top" style={{ paddingLeft: `${cat.depth * 20 + 12}px` }}>
                      <div className="flex flex-col">
                        <span className="text-[#2271b1] font-bold hover:text-[#135e96] cursor-pointer">
                            {cat.depth > 0 ? '— ' : ''}{cat.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-[#2271b1] opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(cat)} className="hover:text-black">Edit</button>
                            <span className="text-[#dcdcde]">|</span>
                            <button 
                                onClick={() => handleDelete(cat.id)}
                                className="hover:text-destructive text-destructive"
                            >Delete</button>
                            <span className="text-[#dcdcde]">|</span>
                            <a href={cat.permalink || cat.link || '#'} target="_blank" rel="noreferrer" className="hover:text-black">View</a>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-gray-500 italic max-w-xs truncate">{cat.description || '—'}</td>
                    <td className="px-3 py-4 text-[#50575e] font-mono text-xs">{cat.slug}</td>
                    <td className="px-3 py-4 text-center">{cat.count}</td>
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
