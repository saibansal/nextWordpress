import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';
import Link from 'next/link';

export default function AdminMedia() {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/wp/media?per_page=50");
      if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to fetch media library");
      }
      const data = await response.json();
      setMediaItems(data);
    } catch (err: any) {
      console.error("Error fetching media:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64 = event.target?.result as string;
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: base64,
            name: file.name,
            type: file.type
          })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Upload failed");
        }
        
        // Refresh gallery
        fetchMedia();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteMedia = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image? This cannot be undone.")) return;
    try {
      const response = await fetch(`/api/wp/media/${id}?force=true`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Failed to delete media item");
      fetchMedia();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AdminLayout title="Media Library">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
           {/* Add filter or search here if needed */}
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/media/new"
            className="bg-[#2271b1] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#2271b1]/20 hover:scale-[1.02] active:scale-95 transition-all outline-none"
          >
            <Icons.Plus className="w-5 h-5" />
            Add New Media
          </Link>
        </div>

      </div>

      {error && (
        <div className="p-8 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive mb-8">
          <h3 className="font-bold mb-2 uppercase text-xs tracking-widest">Error</h3>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading && mediaItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-sm font-medium">Scanning Media Library...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {mediaItems.map((item) => (
            <div key={item.id} className="group relative bg-white border border-border rounded-xl overflow-hidden shadow-sm aspect-square transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20">
              <img 
                src={item.media_details?.sizes?.medium?.source_url || item.source_url} 
                alt={item.alt_text || item.title.rendered}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-white">
                <p className="text-[10px] font-bold truncate w-full text-center mb-4">{item.title.rendered || 'Untitled'}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.open(item.source_url, '_blank')}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Icons.ExternalLink className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteMedia(item.id)}
                    className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <Icons.Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-md text-[8px] font-black tracking-widest uppercase text-white shadow-sm ring-1 ring-white/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                {item.media_details?.file?.split('.').pop()?.toUpperCase() || 'IMG'}
              </div>
            </div>
          ))}
          {mediaItems.length === 0 && !loading && (
             <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl text-muted-foreground bg-secondary/10">
                <Icons.Image className="w-16 h-16 opacity-20 mb-4" />
                <p className="text-xl font-bold">Your Media Library is Empty</p>
                <p className="text-sm opacity-60">Upload images to get started!</p>
             </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
