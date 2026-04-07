import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';

export default function EditPage() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!slug) return;
    
    fetch(`/api/wp/pages?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data?.length > 0) {
          setPageData(data[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageData?.id) return;
    setSaving(true);
    
    try {
      const response = await fetch(`/api/wp/pages/${pageData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pageData.title?.rendered,
          content: pageData.content?.rendered,
        }),
      });
      if (response.ok) {
        alert('Page updated successfully!');
      } else {
        alert('Failed to update page.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating page.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={`Edit Page: ${slug || ''}`}>
      {loading ? (
        <p>Loading page data...</p>
      ) : pageData ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded shadow-md space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Title</label>
            <input 
              type="text" 
              value={pageData.title?.rendered || ''} 
              onChange={e => setPageData({...pageData, title: { rendered: e.target.value }})}
              className="w-full border p-3 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Content (HTML)</label>
            <textarea 
              value={pageData.content?.rendered || ''} 
              onChange={e => setPageData({...pageData, content: { rendered: e.target.value }})}
              className="w-full border p-3 rounded h-96 font-mono text-sm"
            />
          </div>
          <button disabled={saving} type="submit" className="bg-[#2271b1] text-white px-6 py-2 rounded font-bold disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      ) : (
        <p>Page not found. Please ensure it exists in WordPress.</p>
      )}
    </AdminLayout>
  );
}