import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';

export default function AdminPages() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'publish',
    slug: ''
  });

  const fetchPages = async (searchQuery = '') => {
    setLoading(true);
    try {
      const url = new URL("/api/wp/pages", window.location.origin);
      url.searchParams.append('per_page', '100');
      url.searchParams.append('status', 'publish,draft,private,pending');
      url.searchParams.append('_fields', 'id,title,content,status,slug,link,date'); // Get content too
      if (searchQuery) url.searchParams.append('search', searchQuery);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 503) {
          setError(`WordPress not configured. ${data.hint || 'Set WP_USERNAME and WP_APP_PASSWORD in .env.local'}`);
          setPages([]);
        } else {
          throw new Error(data.message || "Failed to fetch pages from WordPress");
        }
      } else {
        setPages(data);
        setError(null);
      }
    } catch (err: any) {
      console.error("Error fetching pages:", err);
      setError(err.message || "Unable to connect to WordPress");
      setPages([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchPages();
  }, []);

  const handleEdit = (page: any) => {
    setEditingPageId(page.id);
    setFormData({
      title: page.title.rendered,
      content: page.content.rendered,
      status: page.status,
      slug: page.slug
    });
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingPageId ? 'PUT' : 'POST';
      const url = editingPageId ? `/api/wp/pages/${editingPageId}` : "/api/wp/pages";
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: formData.title,
            content: formData.content,
            status: formData.status,
            slug: formData.slug
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Failed to ${editingPageId ? 'update' : 'create'} page`);
      
      closeModal();
      fetchPages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setEditingPageId(null);
    setFormData({ title: '', content: '', status: 'publish', slug: '' });
    setShowAddModal(false);
  };

  const deletePage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    try {
      const response = await fetch(`/api/wp/pages/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Failed to delete page");
      fetchPages();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AdminLayout title="Site Pages">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Icons.Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPages(search)}
              className="bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-80 shadow-sm"
            />
          </div>
        </div>
        <button 
          onClick={() => { setEditingPageId(null); setShowAddModal(true); }}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Icons.Plus className="w-5 h-5" />
          Add New Page
        </button>
      </div>

      {loading && pages.length === 0 ? (
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
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-[#2271b1] hover:text-[#135e96] cursor-pointer" onClick={() => handleEdit(page)}>
                        {page.title.rendered || '(no title)'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                      page.status === 'publish' ? 'bg-emerald-500/10 text-emerald-600' :
                      page.status === 'draft' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-slate-500/10 text-slate-600'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                    {new Date(page.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEdit(page)}
                        className="text-muted-foreground hover:text-primary p-2 transition-colors rounded-lg hover:bg-primary/10"
                        title="Edit Page"
                      >
                        <Icons.Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deletePage(page.id)}
                        className="text-muted-foreground hover:text-destructive p-2 transition-colors rounded-lg hover:bg-destructive/10"
                        title="Move to Trash"
                      >
                        <Icons.Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pages.length === 0 && (
            <div className="p-12 text-center text-muted-foreground italic text-sm">No pages found on your WordPress site.</div>
          )}
        </div>
      )}

      {/* Page Editor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-background rounded-3xl border border-border shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-border flex items-center justify-between bg-secondary/20">
              <div>
                <h3 className="text-xl font-bold">{editingPageId ? 'Edit Site Page' : 'Add New WordPress Page'}</h3>
                {editingPageId && <p className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-widest">Page ID: #{editingPageId}</p>}
              </div>
              <button onClick={closeModal} className="hover:rotate-90 transition-transform p-2 bg-background rounded-full shadow-sm">
                <Icons.X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col h-[75vh]">
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Page Title</label>
                            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-card border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/50 text-2xl font-bold placeholder:opacity-30" placeholder="Enter title here..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">HTML Content</label>
                            <textarea rows={16} required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-card border border-border rounded-2xl px-6 py-6 outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono leading-relaxed min-h-[400px]" placeholder="Write your page content using HTML or standard text..." />
                        </div>
                    </div>
                    <div className="space-y-6 bg-secondary/10 p-6 rounded-3xl border border-border flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Publishing Status</label>
                                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-xs font-bold uppercase tracking-widest">
                                    <option value="publish">Published</option>
                                    <option value="draft">Draft</option>
                                    <option value="private">Private</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">URL Slug</label>
                                <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-white border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-xs font-mono" placeholder="slug-name" />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border space-y-4">
                            <button type="submit" disabled={loading} className="w-full bg-[#2271b1] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 hover:bg-[#135e96] active:scale-95 transition-all shadow-xl shadow-[#2271b1]/20">
                                {loading ? <Icons.RefreshCW className="w-4 h-4 animate-spin" /> : <Icons.Check className="w-4 h-4" />}
                                {editingPageId ? 'Update Live Page' : 'Publish Page'}
                            </button>
                            <button type="button" onClick={closeModal} className="w-full bg-white border border-border text-foreground/50 py-3 rounded-2xl font-bold text-xs hover:bg-red-50 hover:text-red-500 transition-all">
                                Discard Changes
                            </button>
                        </div>
                    </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
