import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';
// import api from '../../lib/woocommerce';
import ProductSubNav from '../../components/ProductSubNav';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const perPage = 20;

  const wpAdminUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "http://localhost/wordpress/wordpress-backend";

  const fetchProducts = useCallback(async (searchQuery = '', currentPage = 1, append = false) => {
    if (!append) setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/products', window.location.origin);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('per_page', perPage.toString());
      if (searchQuery) url.searchParams.append('search', searchQuery);

      const response = await fetch(url.toString());

      const contentType = response.headers.get("content-type");
      let data: any;
      let errorMessage = 'Failed to fetch products';

      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText.length > 100 ? `Server Error (${response.status})` : errorText;
        }
        throw new Error(errorMessage);
      }

      data = await response.json();

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
      setError("Failed to connect to WooCommerce. Please check if your WordPress server is running.");
    } finally {
      if (!append) setLoading(false);
    }
  }, []);

  const fetchAllProducts = async () => {
    setLoadingAll(true);
    setSyncProgress(0);
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
    } catch (err) {
      console.error("Error fetching all products:", err);
    } finally {
      setLoadingAll(false);
      setSyncProgress(0);
    }
  };

  useEffect(() => {
    fetchProducts(search, page);
  }, [page, search, fetchProducts]);

  useEffect(() => {
    const saved = localStorage.getItem('sakoon_locations');
    if (saved) setLocations(JSON.parse(saved));
  }, []);

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to move this product to trash?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/wc/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = 'Failed to delete product';
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          errorMessage = `Server Error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      // Remove from state immediately
      setProducts(prev => prev.filter(p => p.id !== id));
      setTotalProducts(prev => prev - 1);

    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!confirm(`Are you sure you want to move ${selectedProducts.length} products to trash?`)) return;

    setLoading(true);
    try {
      // WooCommerce doesn't have a bulk delete endpoint in the same way, we loop for simplicity here
      // or we could implement a batch endpoint in the proxy.
      await Promise.all(selectedProducts.map(id => fetch(`/api/wc/products/${id}`, { method: 'DELETE' })));

      setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
      setTotalProducts(prev => prev - selectedProducts.length);
      setSelectedProducts([]);

    } catch (err: any) {
      setError("Failed to delete some products.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Products | WP Admin">
      <ProductSubNav />

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#1d2327]">
            <span className="font-bold text-black border-r border-[#dcdcde] pr-2 uppercase text-[11px] tracking-wider">All ({totalProducts})</span>
            <span className="text-[#2271b1] border-r border-[#dcdcde] pr-2 uppercase text-[11px] tracking-wider">Published ({totalProducts})</span>
          </div>

          <button
            onClick={fetchAllProducts}
            className="bg-[#2271b1] text-white hover:bg-[#135e96] px-4 py-2 text-sm font-semibold rounded-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            {loadingAll ? <Icons.RefreshCW className="w-4 h-4 animate-spin" /> : <Icons.Globe className="w-4 h-4" />}
            {loadingAll ? `Syncing ${syncProgress}%` : 'Sync Products'}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/products/new" className="bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f6f7f7] px-4 py-1.5 text-sm font-bold rounded-sm uppercase tracking-tight">Add New</Link>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-[#8c8f94] px-3 py-1 text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none h-8 w-64"
              />
              <button
                onClick={() => { setPage(1); fetchProducts(search, 1); }}
                className="bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f6f7f7] px-4 py-1 text-sm font-semibold h-8"
              >
                Search
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              id="bulk-action"
              className="bg-white border border-[#8c8f94] px-2 py-1 text-sm h-8 outline-none focus:border-[#2271b1]"
            >
              <option value="">Bulk actions</option>
              <option value="trash">Move to Trash</option>
            </select>
            <button
              onClick={() => {
                const selectElement = document.getElementById('bulk-action') as HTMLSelectElement;
                if (selectElement.value === 'trash') handleBulkDelete();
              }}
              className="bg-white border border-[#2271b1] text-[#2271b1] px-3 py-1 text-xs font-semibold h-8 uppercase transition-all hover:bg-gray-50 active:translate-y-0.5"
            >
              Apply
            </button>

            <div className="flex gap-1 ml-4 overflow-hidden border border-[#dcdcde] rounded-sm h-8">
              <select className="bg-white border-r border-[#dcdcde] px-2 py-1 text-sm outline-none">
                <option>Filter by category</option>
              </select>
              <select className="bg-white border-r border-[#dcdcde] px-2 py-1 text-sm outline-none">
                <option>Filter by type</option>
              </select>
            </div>
            <button className="bg-white border border-[#2271b1] text-[#2271b1] px-4 py-1 text-sm font-semibold h-8 rounded-sm uppercase">Filter</button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#dcdcde] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f6f7f7] border-b border-[#dcdcde] text-[11px] uppercase tracking-wider text-[#1d2327]">
              <th className="px-3 py-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-[#2271b1]"
                />
              </th>
              <th className="px-3 py-3 w-16 text-center">
                <Icons.Image className="w-4 h-4 mx-auto text-[#8c8f94]" />
              </th>
              <th className="px-3 py-3 font-bold">Name</th>
              <th className="px-3 py-3 font-bold w-24">SKU</th>
              <th className="px-3 py-3 font-bold w-24 text-center">Stock</th>
              <th className="px-3 py-3 font-bold w-32">Price</th>
              <th className="px-3 py-3 font-bold w-40">Categories</th>
              <th className="px-3 py-3 font-bold w-40">Locations</th>
              <th className="px-3 py-3 font-bold w-32">Date</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7] text-sm group/row relative transition-colors">
                <td className="px-3 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="w-4 h-4 accent-[#2271b1]"
                  />
                </td>
                <td className="px-3 py-4">
                  <div className="w-10 h-10 bg-gray-100 border border-[#dcdcde] mx-auto overflow-hidden rounded-sm shadow-sm group-hover/row:scale-105 transition-transform">
                    {product.images?.[0] ? (
                      <img src={product.images[0].src} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Icons.Package className="w-4 h-4 text-gray-300" /></div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-4 align-top">
                  <div className="flex flex-col gap-1">
                    <span className="text-[#2271b1] font-semibold text-[14px] leading-tight cursor-pointer hover:text-[#135e96]">{product.name}</span>
                    <div className="flex items-center gap-2 text-[11px] text-[#2271b1] opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <Link href={`/admin/products/edit/${product.id}`} className="hover:text-black font-bold">Edit</Link>
                      <span className="text-[#dcdcde]">|</span>
                      <button onClick={() => handleDelete(product.id)} className="hover:text-destructive text-destructive/80">Trash</button>
                      <span className="text-[#dcdcde]">|</span>
                      <a href={product.permalink} target="_blank" rel="noreferrer" className="hover:text-black">View</a>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-[#50575e] font-mono text-xs">{product.sku || '—'}</td>
                <td className="px-3 py-4 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${product.stock_status === 'instock' ? 'bg-green-50 text-[#00a32a]' : 'bg-red-50 text-destructive'}`}>
                    {product.stock_status === 'instock' ? (product.stock_quantity ?? 'In stock') : 'Out of stock'}
                  </span>
                </td>
                <td className="px-3 py-4 font-normal" dangerouslySetInnerHTML={{ __html: product.price_html || `$${product.price}` }} />
                <td className="px-3 py-4 text-[#2271b1] text-xs">
                  {product.categories?.map((c: any) => (
                    <span key={c.id} className="hover:text-black cursor-pointer mr-1 underline decoration-dotted">{c.name},</span>
                  ))}
                </td>
                <td className="px-3 py-4 text-[#50575e] text-xs">
                  {(() => {
                    const locMeta = (product.meta_data || []).find((m: any) => m.key === '_sakoon_locations');
                    const locationIds = locMeta ? locMeta.value : [];
                    if (!locationIds || locationIds.length === 0) return <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-400">GLOBAL</span>;
                    return (
                      <div className="flex flex-wrap gap-1">
                        {locationIds.map((id: string) => {
                          const loc = locations.find(l => l.id === id);
                          return <span key={id} className="bg-[#2271b1]/10 text-[#2271b1] px-2 py-0.5 rounded text-[10px] font-bold uppercase">{loc ? loc.name.replace('Sakoon ', '') : `ID: ${id}`}</span>;
                        })}
                      </div>
                    );
                  })()}
                </td>
                <td className="px-3 py-4 text-[#50575e] leading-tight text-xs">
                  <span className="block font-semibold text-[#1d2327]">Published</span>
                  <span>{new Date(product.date_created).toLocaleDateString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && !loading && (
          <div className="p-12 text-center text-gray-500 italic bg-gray-50/50">
            <Icons.Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
            No products found matching your search.
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between p-4 bg-white border border-t-0 border-[#dcdcde]">
        <div className="text-xs font-medium text-[#1d2327]">
          Showing {products.length} of {totalProducts} items
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => { setPage(1); window.scrollTo(0, 0); }}
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#dcdcde] disabled:opacity-50 hover:bg-[#f6f7f7] transition-colors"
          >
            «
          </button>
          <button
            disabled={page === 1}
            onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#dcdcde] disabled:opacity-50 hover:bg-[#f6f7f7] transition-colors"
          >
            ‹
          </button>
          <span className="bg-white border border-[#dcdcde] px-4 h-8 flex items-center text-xs font-bold">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#dcdcde] disabled:opacity-50 hover:bg-[#f6f7f7] transition-colors"
          >
            ›
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => { setPage(totalPages); window.scrollTo(0, 0); }}
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#dcdcde] disabled:opacity-50 hover:bg-[#f6f7f7] transition-colors"
          >
            »
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
