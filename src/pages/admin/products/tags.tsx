import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import ProductSubNav from '../../../components/ProductSubNav';
import { Icons } from '../../../components/Icons';

export default function ProductTags() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wc/products/tags?per_page=100');
      if (!res.ok) throw new Error('Failed to fetch tags');
      const data = await res.json();
      setTags(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId 
        ? `/api/wc/products/tags/${editingId}` 
        : '/api/wc/products/tags';
      const method = editingId ? 'PUT' : 'POST';

      const body: any = { ...formData };
      if (!body.slug) delete body.slug;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Failed to ${editingId ? 'update' : 'create'} tag`);
      setFormData({ name: '', slug: '', description: '' });
      setEditingId(null);
      fetchTags();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tag: any) => {
    setEditingId(tag.id);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/wc/products/tags/${deleteConfirmId}?force=true`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete tag');
      setDeleteConfirmId(null);
      fetchTags();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Product Tags | WP Admin">
      <ProductSubNav />
      <div className="flex flex-col gap-4 mb-6">
          <h2 className="text-2xl font-normal text-[#1d2327]">Product tags</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-4 border border-[#dcdcde] shadow-sm sticky top-16">
            <h3 className="text-sm font-bold border-b border-[#f0f0f1] pb-2 mb-4">
                {editingId ? 'Edit tag' : 'Add new tag'}
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
                    {editingId ? 'Update tag' : 'Add new tag'}
                </button>
                {editingId && (
                    <button 
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ name: '', slug: '', description: '' });
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
                  <th className="px-3 py-3 w-10 text-center"><input type="checkbox" className="w-4 h-4" /></th>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3">Slug</th>
                  <th className="px-3 py-3 text-center">Count</th>
                </tr>
              </thead>
              <tbody className={loading ? 'opacity-50' : ''}>
                {tags.map((tag) => (
                  <tr key={tag.id} className={`border-b border-[#f0f0f1] hover:bg-[#f6f7f7] group/row relative transition-colors ${editingId === tag.id ? 'bg-[#f0f6fb]' : ''}`}>
                    <td className="px-3 py-4 text-center align-top"><input type="checkbox" className="w-4 h-4" /></td>
                    <td className="px-3 py-4 align-top">
                      <div className="flex flex-col">
                        <span className="text-[#2271b1] font-bold hover:text-[#135e96] cursor-pointer">{tag.name}</span>
                        <div className="flex items-center gap-2 text-[11px] text-[#2271b1] opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(tag)} className="hover:text-black">Edit</button>
                            <span className="text-[#dcdcde]">|</span>
                            <button onClick={() => setDeleteConfirmId(tag.id)} className="hover:text-destructive text-destructive">Delete</button>
                            <span className="text-[#dcdcde]">|</span>
                            <a href={tag.permalink || tag.link || '#'} target="_blank" rel="noreferrer" className="hover:text-black">View</a>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-gray-500 italic max-w-xs truncate">{tag.description || '—'}</td>
                    <td className="px-3 py-4 text-[#50575e] font-mono text-xs">{tag.slug}</td>
                    <td className="px-3 py-4 text-center">{tag.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {error && <div className="mt-4 p-4 bg-red-50 text-red-600 border-l-4 border-red-600 text-sm font-medium">{error}</div>}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#dcdcde]">
             <div className="p-4 bg-[#1d2327] text-white flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-widest">Confirm Deletion</h3>
                <button onClick={() => setDeleteConfirmId(null)}><Icons.X className="w-4 h-4 hover:text-red-500 transition-colors" /></button>
             </div>
             <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 text-gray-600">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <Icons.Trash2 className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#1d2327]">Permanently delete this tag?</p>
                        <p className="text-xs text-gray-500 mt-1">This action cannot be undone and will affect products using this tag.</p>
                    </div>
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-2">
                   <button 
                     onClick={() => setDeleteConfirmId(null)}
                     className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                   >
                     Keep it
                   </button>
                   <button 
                     onClick={handleDelete}
                     disabled={loading}
                     className="bg-red-600 text-white px-6 py-2 text-[11px] font-black uppercase tracking-widest rounded-sm shadow-md hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                   >
                     {loading ? 'Deleting...' : 'Confirm Delete'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
