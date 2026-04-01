import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';
import Link from 'next/link';

export default function AdminPages() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  
  const [newPage, setNewPage] = useState({
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
      if (searchQuery) url.searchParams.append('search', searchQuery);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch pages from WordPress");
      }
      
      setPages(data);
    } catch (err: any) {
      console.error("Error fetching pages:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/wp/pages", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPage)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create page");
      
      setNewPage({ title: '', content: '', status: 'publish', slug: '' });
      setShowAddModal(false);
      fetchPages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          onClick={() => setShowAddModal(true)}
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
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
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
                      <span className="font-bold text-sm text-[#2271b1] hover:underline cursor-pointer">
                        {page.title.rendered || '(no title)'}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[300px]">
                        {page.link}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
                      page.status === 'publish' ? 'bg-emerald-500/10 text-emerald-600' :
                      page.status === 'draft' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-slate-500/10 text-slate-600'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(page.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <Link href={page.link} target="_blank" className="text-muted-foreground hover:text-primary p-2 transition-colors rounded-lg hover:bg-primary/10">
                        <Icons.ExternalLink className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => deletePage(page.id)}
                        className="text-muted-foreground hover:text-destructive p-2 transition-colors rounded-lg hover:bg-destructive/10"
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
            <div className="p-12 text-center text-muted-foreground italic">No pages found on your WordPress site.</div>
          )}
        </div>
      )}

      {/* Add New Page Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-background rounded-3xl border border-border shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-border flex items-center justify-between bg-secondary/20">
              <h3 className="text-xl font-bold">Add New WordPress Page</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform">
                <Icons.X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Page Title</label>
                  <input required type="text" value={newPage.title} onChange={e => setNewPage({...newPage, title: e.target.value})} className="w-full bg-card border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-lg font-bold" placeholder="e.g. About Us" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Status</label>
                    <select value={newPage.status} onChange={e => setNewPage({...newPage, status: e.target.value})} className="w-full bg-card border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                      <option value="publish">Publish Immediately</option>
                      <option value="draft">Save as Draft</option>
                      <option value="private">Private</option>
                      <option value="pending">Pending Review</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">URL Slug</label>
                    <input type="text" value={newPage.slug} onChange={e => setNewPage({...newPage, slug: e.target.value})} className="w-full bg-card border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono" placeholder="leave blank for auto-generate" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Page Content (HTML/Text)</label>
                  <textarea rows={12} required value={newPage.content} onChange={e => setNewPage({...newPage, content: e.target.value})} className="w-full bg-card border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono leading-relaxed" placeholder="Write your page content here..." />
                </div>
              </div>
              <div className="flex gap-4 pt-6 border-t border-border">
                <button type="submit" disabled={loading} className="flex-1 bg-[#2271b1] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#135e96] active:scale-95 transition-all shadow-lg shadow-[#2271b1]/20">
                  {loading ? <Icons.RefreshCW className="w-5 h-5 animate-spin" /> : <Icons.Check className="w-5 h-5" />}
                  {newPage.status === 'publish' ? 'Publish Page' : 'Save Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
