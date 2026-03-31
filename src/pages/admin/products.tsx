import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';
import api from '../../lib/woocommerce';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const perPage = 20;

  const wpAdminUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "http://localhost/wordpress/wordpress-backend/";

  const fetchProducts = useCallback(async (searchQuery = '', currentPage = 1, append = false) => {
    if (!append) setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/products', window.location.origin);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('per_page', perPage.toString());
      if (searchQuery) url.searchParams.append('search', searchQuery);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch products');
      }

      const data = await response.json();
      
      if (append) {
        setProducts(prev => [...prev, ...data]);
      } else {
        setProducts(data);
      }
      
      const totalPagesHeader = response.headers.get('x-wp-totalpages');
      const totalCountHeader = response.headers.get('x-wp-total');
      
      if (totalPagesHeader) setTotalPages(parseInt(totalPagesHeader));
      if (totalCountHeader) setTotalProducts(parseInt(totalCountHeader));
      
      setLastSync(new Date().toLocaleTimeString());

    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError("Failed to connect to WooCommerce. Please check if your WordPress server is running and ensure API keys are correct.");
    } finally {
      if (!append) setLoading(false);
    }
  }, []);

  const fetchAllProducts = async () => {
    setLoadingAll(true);
    setSyncProgress(0);
    setProducts([]);
    try {
      let allProducts: any[] = [];
      let currentPage = 1;
      let totalPagesInFetch = totalPages || 1;

      while (currentPage <= totalPagesInFetch) {
        const url = new URL('/api/products', window.location.origin);
        url.searchParams.append('page', currentPage.toString());
        url.searchParams.append('per_page', '100'); 
        
        const response = await fetch(url.toString());
        if (!response.ok) break;
        
        const data = await response.json();
        allProducts = [...allProducts, ...data];
        setProducts([...allProducts]); 
        
        const totalPagesHeader = response.headers.get('x-wp-totalpages');
        if (totalPagesHeader) totalPagesInFetch = parseInt(totalPagesHeader);
        
        setSyncProgress(Math.round((currentPage / totalPagesInFetch) * 100));
        currentPage++;
      }
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Error fetching all products:", err);
    } finally {
      setLoadingAll(false);
      setSyncProgress(0);
    }
  };

  useEffect(() => {
    fetchProducts(search, page);
  }, [page, fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(search, 1);
  };

  return (
    <AdminLayout title="Inventory | Admin">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 relative">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Icons.Package className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-4xl font-black tracking-tight">Products</h2>
          </div>
          <p className="text-muted-foreground text-sm font-medium pl-1">
            Managing <span className="text-foreground font-black underline decoration-primary/30 underline-offset-4">{totalProducts}</span> items from your WooCommerce catalog.
          </p>
          {lastSync && (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 pl-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Last Synced: {lastSync}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={handleSearch} className="relative group min-w-[320px]">
            <Icons.Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card/50 backdrop-blur-xl border-2 border-border/50 rounded-[1.5rem] pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all outline-none"
            />
          </form>
          
          <button 
            onClick={fetchAllProducts}
            disabled={loadingAll || loading}
            className="group relative flex items-center gap-3 px-6 py-4 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 overflow-hidden"
          >
            {loadingAll ? (
              <Icons.RefreshCW className="w-4 h-4 animate-spin" />
            ) : (
              <Icons.Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            )}
            <span>{loadingAll ? `Syncing ${syncProgress}%` : 'Full Sync'}</span>
            {loadingAll && (
              <div 
                className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-500" 
                style={{ width: `${syncProgress}%` }}
              />
            )}
          </button>

          <button className="flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-foreground/10 hover:scale-[1.02] transition-all active:scale-95">
            <Icons.Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading && products.length === 0 ? (
        <div className="grid gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-card/40 border-2 border-border/30 rounded-[2.5rem] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-20 rounded-[3rem] bg-destructive/5 border-2 border-destructive/10 text-center backdrop-blur-sm">
          <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Icons.RefreshCW className="w-12 h-12 text-destructive animate-spin-slow" />
          </div>
          <h3 className="text-3xl font-black mb-4">Connection Interrupted</h3>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-lg font-medium leading-relaxed">
            We couldn't reach your WordPress instance at <code className="bg-destructive/10 px-2 py-0.5 rounded text-destructive">{wpAdminUrl}</code>. 
            Please ensure your server is active and API keys are valid.
          </p>
          <button 
            onClick={() => fetchProducts(search, page)}
            className="px-12 py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-xl shadow-foreground/20"
          >
            Re-establish Link
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="group flex flex-col md:flex-row items-center gap-8 p-6 bg-card/60 backdrop-blur-sm border-2 border-border/40 rounded-[2.5rem] hover:border-primary/40 hover:bg-card hover:shadow-3xl hover:shadow-primary/5 transition-all duration-500 relative"
              >
                {/* Image & Status Overlay */}
                <div className="relative shrink-0">
                  <div className="w-28 h-28 rounded-3xl overflow-hidden bg-secondary/50 border-2 border-border/50 group-hover:scale-105 transition-transform duration-700">
                    {product.images?.[0] ? (
                      <img src={product.images[0].src} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icons.Package className="w-12 h-12 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                  {product.stock_status !== 'instock' && (
                    <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full shadow-lg border-4 border-background">
                      <Icons.ShoppingCart className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-black truncate max-w-[400px]">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2.5 py-1 bg-primary/10 text-primary rounded-lg uppercase tracking-tighter">
                        ID: {product.id}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-secondary rounded-lg text-secondary-foreground/60 uppercase font-mono">
                        {product.sku || 'NO-SKU'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-black uppercase tracking-widest">
                      <Icons.Dashboard className="w-4 h-4 text-primary/40" />
                      {product.categories?.[0]?.name || 'General Inventory'}
                    </div>
                    <div className="w-1 h-1 bg-border/60 rounded-full" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                       <span className={product.manage_stock ? 'text-foreground' : 'opacity-50'}>
                         Inventory: {product.stock_quantity ?? 'Manage Manually'}
                       </span>
                    </div>
                  </div>
                </div>

                {/* Performance / Price */}
                <div className="flex flex-row md:flex-col items-end gap-2 pr-4 min-w-[140px] border-r-2 border-border/20">
                   <div className="text-2xl font-black tracking-tight" dangerouslySetInnerHTML={{ __html: product.price_html || `${product.price}` }} />
                   <div className={`px-4 py-1.5 rounded-[1rem] text-[9px] font-black uppercase tracking-[0.2em] border-2 transition-colors ${
                      product.stock_status === 'instock' ? 'bg-green-500/5 text-green-600 border-green-500/10' :
                      product.stock_status === 'onbackorder' ? 'bg-amber-500/5 text-amber-500 border-amber-500/10' :
                      'bg-destructive/5 text-destructive border-destructive/10'
                    }`}>
                      {product.stock_status.replace('instock', 'Available').replace('outofstock', 'Sold Out').replace('onbackorder', 'Backorder')}
                    </div>
                </div>

                {/* Action Dock */}
                <div className="flex items-center gap-3">
                  <a 
                    href={`${wpAdminUrl}wp-admin/post.php?post=${product.id}&action=edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-secondary/30 hover:bg-primary hover:text-primary-foreground rounded-2xl transition-all shadow-sm group/link"
                    title="Edit in WordPress"
                  >
                    <Icons.ExternalLink className="w-5 h-5 group-hover/link:rotate-12 transition-transform" />
                  </a>
                  <button className="p-4 bg-secondary/30 hover:bg-foreground hover:text-background rounded-2xl transition-all shadow-sm">
                    <Icons.Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && !loading && (
            <div className="p-40 text-center flex flex-col items-center bg-card/40 rounded-[4rem] border-4 border-dashed border-border/30 backdrop-blur-sm">
              <div className="w-32 h-32 bg-secondary/50 rounded-full flex items-center justify-center mb-10">
                <Icons.Package className="w-16 h-16 text-muted-foreground/10" />
              </div>
              <h4 className="text-3xl font-black mb-4 uppercase tracking-tighter">Inventory Silent</h4>
              <p className="text-muted-foreground max-w-sm text-lg font-medium leading-relaxed">
                Your WooCommerce catalog seems to be empty or the current search yielded no results.
              </p>
            </div>
          )}

          {/* Pagination Dock */}
          {!loadingAll && products.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 px-10 py-10 mt-16 bg-card/40 border-2 border-border/40 rounded-[3rem] backdrop-blur-xl">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                  Navigation Module
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black">Page {page}</span>
                  <span className="text-muted-foreground font-bold">of {totalPages}</span>
                </div>
                <p className="text-[10px] font-black text-primary uppercase bg-primary/5 px-3 py-1 rounded-full w-fit">
                  Indexing {products.length} / {totalProducts} Products
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => {
                    setPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={page === 1 || loading}
                  className="px-10 py-5 bg-card border-2 border-border/50 rounded-[1.75rem] text-xs font-black uppercase tracking-widest hover:border-primary/50 disabled:opacity-20 transition-all active:scale-95"
                >
                  Previous
                </button>
                <button 
                  onClick={() => {
                    setPage(p => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={page >= totalPages || loading}
                  className="px-12 py-5 bg-foreground text-background rounded-[1.75rem] text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 disabled:opacity-20 shadow-2xl shadow-foreground/20 transition-all"
                >
                  Next Index
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
}
