import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { Icons } from '../../../components/Icons';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProductSubNav from '../../../components/ProductSubNav';

export default function AddNewProduct() {
  const router = useRouter();
  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryImagesRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [shippingClasses, setShippingClasses] = useState<any[]>([]);
  const [taxClasses, setTaxClasses] = useState<any[]>([]);
  const [globalAttributes, setGlobalAttributes] = useState<any[]>([]);
  const [selectedAttrId, setSelectedAttrId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'simple',
    status: 'publish',
    virtual: false,
    downloadable: false,
    regular_price: '',
    sale_price: '',
    tax_status: 'taxable',
    tax_class: '',
    external_url: '',
    button_text: 'Buy product',
    description: '',
    short_description: '',
    sku: '',
    gtin: '',
    manage_stock: false,
    stock_quantity: 0,
    stock_status: 'instock',
    sold_individually: false,
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    shipping_class: '',
    reviews_allowed: true,
    purchase_note: '',
    menu_order: 0,
    categories: [] as any[],
    tags: [] as any[],
    grouped_products: [] as number[],
    upsell_ids: [] as number[],
    cross_sell_ids: [] as number[],
    attributes: [] as any[],
    default_attributes: [] as any[],
    variations: [] as any[],
    images: [] as any[],
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [compressing, setCompressing] = useState(false);

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

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes, shipRes, taxRes, attrRes] = await Promise.all([
          fetch('/api/wc/products/categories?per_page=100'),
          fetch('/api/wc/products?per_page=100'),
          fetch('/api/wc/products/shipping_classes'),
          fetch('/api/wc/taxes/classes'),
          fetch('/api/wc/products/attributes')
        ]);
        
        if (catRes.ok) setCategories(await catRes.json());
        if (prodRes.ok) setAllProducts(await prodRes.json());
        if (shipRes.ok) setShippingClasses(await shipRes.json());
        if (taxRes.ok) setTaxClasses(await taxRes.json());
        if (attrRes.ok) setGlobalAttributes(await attrRes.json());
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    }
    fetchData();
  }, []);

  const compressAndConvertToWebP = (file: File): Promise<{ blob: Blob, base64: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1200;
          if (width > MAX_WIDTH) { height = (MAX_WIDTH / width) * height; width = MAX_WIDTH; }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Failed to get canvas context');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
                const reader2 = new FileReader();
                reader2.onloadend = () => resolve({ blob, base64: reader2.result as string });
                reader2.readAsDataURL(blob);
            } else reject('Failed to create blob');
          }, 'image/webp', 0.8);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompressing(true);
      try {
        const { blob, base64 } = await compressAndConvertToWebP(file);
        const previewUrl = URL.createObjectURL(blob);
        setMainImagePreview(previewUrl);
        setFormData(prev => ({
          ...prev,
          images: [{ src: previewUrl, alt: 'Main Image', isLocal: true, base64, fileName: file.name }, ...prev.images.filter((img: any) => !img.isLocal || img.alt !== 'Main Image')]
        }));
      } catch (err) {
        console.error("Image processing failed:", err);
      } finally {
        setCompressing(false);
      }
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setCompressing(true);
      try {
        const processedList = await Promise.all(files.map(f => compressAndConvertToWebP(f)));
        const previewUrls = processedList.map(p => URL.createObjectURL(p.blob));
        setGalleryPreviews(prev => [...prev, ...previewUrls]);
        const newImages = processedList.map((p, i) => ({ src: previewUrls[i], alt: 'Gallery Image', isLocal: true, base64: p.base64, fileName: files[i].name }));
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages]
        }));
      } catch (err) {
        console.error("Gallery processing failed:", err);
      } finally {
        setCompressing(false);
      }
    }
  };

  const uploadImages = async () => {
      const localImages = formData.images.filter((img: any) => img.isLocal);
      const uploadedImageIds: number[] = [];
      const uploadedUrls: string[] = [];

      for (const img of localImages) {
          const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ file: img.base64, name: img.fileName, type: 'image/webp' })
          });
          const data = await res.json();
          if (!res.ok) {
              throw new Error(data.message || 'Image upload failed');
          }
          uploadedImageIds.push(data.id);
      }
      return uploadedImageIds;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const uploadedIds = await uploadImages();
      
      const finalAttributes = formData.attributes.map(attr => ({
        id: attr.id,
        name: attr.name,
        position: attr.position,
        visible: attr.visible,
        variation: attr.variation,
        options: (attr.value_string || '').split('|').map((v: string) => v.trim()).filter((v: string) => v !== '')
      }));

      // Merge existing images with newly uploaded ones
      const finalImages = [
          ...formData.images.filter((img: any) => !img.isLocal).map((img: any) => ({ id: img.id, src: img.src })),
          ...uploadedIds.map(id => ({ id }))
      ];

      const productPayload = {
        ...formData,
        attributes: finalAttributes,
        images: finalImages,
        variations: formData.type === 'variable' ? formData.variations.map(v => ({
            ...v,
            attributes: v.attributes.map((a: any) => ({ id: a.id, name: a.name, option: a.option }))
        })) : []
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error?.message || 'Failed to create product');

      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (categories, attributes, UI components remain mostly the same)
  const handleCategoryToggle = (id: number) => {
    setFormData(prev => {
      const exists = prev.categories.find(c => c.id === id);
      const newCategories = exists 
        ? prev.categories.filter(c => c.id !== id)
        : [...prev.categories, { id }];
      return { ...prev, categories: newCategories };
    });
  };
  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'shipping', label: 'Shipping', icon: '🚛' },
    { id: 'linked', label: 'Linked Products', icon: '🔗' },
    { id: 'attributes', label: 'Attributes', icon: '🏷️' },
    { id: 'advanced', label: 'Advanced', icon: '⭐' },
  ];
  const getDynamicTabs = () => {
    if (formData.type === 'grouped') return tabs.filter(t => !['general', 'shipping'].includes(t.id));
    if (formData.type === 'external') return tabs.filter(t => t.id !== 'shipping');
    if (formData.type === 'variable') return [...tabs.filter(t => t.id !== 'general'), { id: 'variations', label: 'Variations', icon: '🔄' }];
    return tabs;
  };
  const activeTabs = getDynamicTabs();

  const addAttribute = () => {
    let newAttr;
    if (selectedAttrId) {
      const attrId = parseInt(selectedAttrId);
      const globalAttr = globalAttributes.find(a => a.id === attrId);
      if (!globalAttr || formData.attributes.find(a => a.id === attrId)) return;
      newAttr = { id: globalAttr.id, name: globalAttr.name, position: formData.attributes.length, visible: true, variation: false, value_string: '', expanded: true };
    } else {
        const customId = Date.now();
        newAttr = { id: 0, custom_id: customId, name: '', position: formData.attributes.length, visible: true, variation: false, value_string: '', expanded: true };
    }
    setFormData({ ...formData, attributes: [...formData.attributes, newAttr] });
    setSelectedAttrId('');
  };
  const removeAttribute = (uniqueKey: any) => {
    setFormData({ ...formData, attributes: formData.attributes.filter(a => (a.id !== 0 ? a.id : a.custom_id) !== uniqueKey) });
  };
  const toggleAttrExpand = (uniqueKey: any) => {
      setFormData({ ...formData, attributes: formData.attributes.map(a => { const currentKey = a.id !== 0 ? a.id : a.custom_id; if (currentKey === uniqueKey) return { ...a, expanded: !a.expanded }; return a; }) });
  };
  const generateVariations = () => {
    const variationAttrs = formData.attributes.filter(a => a.variation && a.value_string?.trim() !== '');
    if (variationAttrs.length === 0) return alert('Please add attributes and check "Used for variations" first.');
    const combinations = (arrays: any[]): any[] => {
      const result: any[] = [];
      const f = (prefix: any[], remaining: any[]) => {
        if (remaining.length === 0) { result.push(prefix); return; }
        const [first, ...rest] = remaining;
        const opts = first.value_string.split('|').map((v: string) => v.trim()).filter((v: string) => v !== '');
        opts.forEach((opt: string) => { f([...prefix, { id: first.id, name: first.name, option: opt }], rest); });
      };
      f([], arrays); return result;
    };
    const generated = combinations(variationAttrs).map(combo => ({
        regular_price: formData.regular_price,
        sale_price: formData.sale_price,
        sku: `${formData.sku}-${combo.map((c: any) => c.option.toLowerCase().replace(/\s+/g, '-')).join('-')}`,
        stock_status: 'instock',
        attributes: combo
    }));
    setFormData({ ...formData, variations: generated });
  };

  const removeGalleryImage = (index: number) => {
      setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
      setFormData(prev => {
          const newImages = [...prev.images];
          let galleryEntries = prev.images.filter((img: any) => img.alt === 'Gallery Image');
          if (galleryEntries.length > 0) {
              const target = galleryEntries[index];
              const realIndex = prev.images.indexOf(target);
              if (realIndex > -1) newImages.splice(realIndex, 1);
          }
          return { ...prev, images: newImages };
      });
  };

  return (
    <AdminLayout title="Add New Product | WP Admin">
      <ProductSubNav />
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center">
            <Icons.RefreshCW className="w-12 h-12 text-[#2271b1] animate-spin mb-4" />
            <h3 className="text-lg font-bold">Publishing your product...</h3>
            <p className="text-sm text-gray-500">Uploading optimized WebP images</p>
        </div>
      )}
      <div className="max-w-6xl mx-auto pb-24">
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-xs animate-in slide-in-from-top-2">{error}</div>}
        <div className="flex items-center gap-4 mb-6"><h2 className="text-2xl font-normal text-[#1d2327]">Add New Product</h2></div>
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-white border border-[#dcdcde] p-3 shadow-sm rounded-sm">
                <input type="text" placeholder="Product name" required className="w-full text-2xl font-normal border border-[#dcdcde] px-4 py-2 outline-none focus:border-[#2271b1]" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <div className="mt-6 flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-[#f6f7f7] border border-[#dcdcde] p-2 text-sm font-semibold">Product Description</div>
                    <textarea rows={8} className="w-full border border-[#dcdcde] p-4 outline-none focus:border-[#2271b1]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
            </div>
            <div className="bg-white border border-[#dcdcde] shadow-sm rounded-sm">
                <div className="px-4 py-2 bg-[#f6f7f7] border-b border-[#dcdcde] flex items-center justify-between font-bold text-sm text-[#1d2327]">
                    <div className="flex items-center gap-3">
                        <span>Product data —</span>
                        <select className="border border-[#8c8f94] rounded px-2 py-0.5 text-sm outline-none bg-white font-normal" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}><option value="simple">Simple product</option><option value="grouped">Grouped product</option><option value="external">External/Affiliate product</option><option value="variable">Variable product</option></select>
                    </div>
                </div>
                <div className="flex min-h-[400px]">
                    <div className="w-48 bg-[#f6f7f7] border-r border-[#dcdcde] py-2">
                        {activeTabs.map((tab) => (
                            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`w-full text-left px-5 py-3 text-xs font-semibold flex items-center gap-2 border-l-4 ${activeTab === tab.id ? 'bg-white border-[#2271b1] text-black shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]' : 'border-transparent text-[#2271b1] hover:bg-white'}`}><span>{tab.icon}</span> {tab.label}</button>
                        ))}
                    </div>
                    <div className="flex-1 p-8 text-sm overflow-y-auto max-h-[600px] space-y-4">
                        {activeTab === 'general' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 items-center gap-4"><label className="text-gray-600 font-bold">Regular price ($)</label><input type="number" step="0.01" className="col-span-3 max-w-xs border border-[#8c8f94] px-3 py-1 outline-none" value={formData.regular_price} onChange={e => setFormData({...formData, regular_price: e.target.value})} /></div>
                                <div className="grid grid-cols-4 items-center gap-4"><label className="text-gray-600 font-bold">Sale price ($)</label><input type="number" step="0.01" className="col-span-3 max-w-xs border border-[#8c8f94] px-3 py-1 outline-none" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} /></div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-gray-600 font-bold">Tax status</label>
                                    <select className="col-span-3 max-w-xs border border-[#8c8f94] px-3 py-1 outline-none bg-white" value={formData.tax_status} onChange={e => setFormData({...formData, tax_status: e.target.value})}>
                                        <option value="taxable">Taxable</option>
                                        <option value="shipping">Shipping only</option>
                                        <option value="none">None</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-gray-600 font-bold">Tax class</label>
                                    <select className="col-span-3 max-w-xs border border-[#8c8f94] px-3 py-1 outline-none bg-white" value={formData.tax_class} onChange={e => setFormData({...formData, tax_class: e.target.value})}>
                                        <option value="">Standard</option>
                                        {taxClasses.map((tc: any) => <option key={tc.slug} value={tc.slug}>{tc.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                        {activeTab === 'inventory' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 items-center gap-4"><label className="text-gray-600 font-bold">SKU</label><input type="text" className="col-span-3 max-w-xs border border-[#8c8f94] px-3 py-1 outline-none" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} /></div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-gray-600 font-bold">Manage stock?</label>
                                    <div className="col-span-3 flex items-center gap-2">
                                        <input type="checkbox" checked={formData.manage_stock} onChange={e => setFormData({...formData, manage_stock: e.target.checked})} />
                                        <span className="text-xs text-gray-500">Track inventory for this product</span>
                                    </div>
                                </div>
                                {formData.manage_stock && (
                                    <div className="grid grid-cols-4 items-center gap-4 animate-in fade-in duration-300">
                                        <label className="text-gray-600 font-bold">Stock quantity</label>
                                        <input type="number" className="col-span-3 max-w-[100px] border border-[#8c8f94] px-3 py-1 outline-none" value={formData.stock_quantity || 0} onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})} />
                                    </div>
                                )}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-gray-600 font-bold">Stock status</label>
                                    <select className="col-span-3 max-w-xs border border-[#8c8f94] px-3 py-1 outline-none bg-white" value={formData.stock_status} onChange={e => setFormData({...formData, stock_status: e.target.value})}>
                                        <option value="instock">In stock</option>
                                        <option value="outofstock">Out of stock</option>
                                        <option value="onbackorder">On backorder</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-gray-600 font-bold">Sold individually</label>
                                    <div className="col-span-3 flex items-center gap-2">
                                        <input type="checkbox" checked={formData.sold_individually} onChange={e => setFormData({...formData, sold_individually: e.target.checked})} />
                                        <span className="text-xs text-gray-500">Limit purchases to 1 item per order</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'shipping' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 items-center gap-4"><label className="text-gray-600 font-bold">Weight (kg)</label><input type="text" placeholder="0" className="col-span-3 max-w-[100px] border border-[#8c8f94] px-3 py-1 outline-none" value={formData.weight || ''} onChange={e => setFormData({...formData, weight: e.target.value})} /></div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <label className="text-gray-600 font-bold pt-1">Dimensions (cm)</label>
                                    <div className="col-span-3 flex gap-2">
                                        <input type="text" placeholder="Length" className="w-20 border border-[#8c8f94] px-3 py-1 outline-none text-center" value={formData.dimensions?.length || ''} onChange={e => setFormData({...formData, dimensions: {...formData.dimensions, length: e.target.value}})} />
                                        <input type="text" placeholder="Width" className="w-20 border border-[#8c8f94] px-3 py-1 outline-none text-center" value={formData.dimensions?.width || ''} onChange={e => setFormData({...formData, dimensions: {...formData.dimensions, width: e.target.value}})} />
                                        <input type="text" placeholder="Height" className="w-20 border border-[#8c8f94] px-3 py-1 outline-none text-center" value={formData.dimensions?.height || ''} onChange={e => setFormData({...formData, dimensions: {...formData.dimensions, height: e.target.value}})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-gray-600 font-bold">Shipping class</label>
                                    <select className="col-span-3 max-w-xs border border-[#8c8f94] px-3 py-1 outline-none bg-white" value={formData.shipping_class} onChange={e => setFormData({...formData, shipping_class: e.target.value})}>
                                        <option value="">No shipping class</option>
                                        {shippingClasses.map((sc: any) => <option key={sc.slug} value={sc.slug}>{sc.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                        {activeTab === 'linked' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <label className="text-gray-600 font-bold pt-1">Upsells</label>
                                    <div className="col-span-3">
                                        <select multiple className="w-full border border-[#8c8f94] p-2 min-h-[120px] outline-none bg-white" value={formData.upsell_ids?.map(String) || []} onChange={e => {
                                            const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                            setFormData({...formData, upsell_ids: values});
                                        }}>
                                            {allProducts.map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.name} (#{p.id})</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-gray-400 mt-1 italic">Upsells are products which you recommend instead of the currently viewed product.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <label className="text-gray-600 font-bold pt-1">Cross-sells</label>
                                    <div className="col-span-3">
                                        <select multiple className="w-full border border-[#8c8f94] p-2 min-h-[120px] outline-none bg-white" value={formData.cross_sell_ids?.map(String) || []} onChange={e => {
                                            const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                            setFormData({...formData, cross_sell_ids: values});
                                        }}>
                                            {allProducts.map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.name} (#{p.id})</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-gray-400 mt-1 italic">Cross-sells are products which you promote in the cart, based on the current product.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'advanced' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <label className="text-gray-600 font-bold pt-1">Purchase note</label>
                                    <textarea className="col-span-3 w-full border border-[#8c8f94] px-3 py-2 outline-none h-24" value={formData.purchase_note || ''} onChange={e => setFormData({...formData, purchase_note: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-gray-600 font-bold">Menu order</label>
                                    <input type="number" className="col-span-3 max-w-[100px] border border-[#8c8f94] px-3 py-1 outline-none" value={formData.menu_order || 0} onChange={e => setFormData({...formData, menu_order: parseInt(e.target.value)})} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-gray-600 font-bold">Enable reviews</label>
                                    <div className="col-span-3 flex items-center gap-2">
                                        <input type="checkbox" checked={formData.reviews_allowed} onChange={e => setFormData({...formData, reviews_allowed: e.target.checked})} />
                                        <span className="text-xs text-gray-500">Allow customers to leave reviews</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'attributes' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-4 border-b border-[#f0f0f1]">
                                    <select className="border border-[#8c8f94] px-3 py-1 outline-none bg-white min-w-[200px]" value={selectedAttrId} onChange={e => setSelectedAttrId(e.target.value)}><option value="">Custom product attribute</option>{globalAttributes.map(attr => <option key={attr.id} value={attr.id}>{attr.name}</option>)}</select>
                                    <button type="button" onClick={addAttribute} className="bg-[#f6f7f7] border border-[#dcdcde] px-4 py-1 font-bold text-xs hover:bg-white text-[#1d2327]">Add</button>
                                </div>
                                <div className="space-y-3">
                                    {formData.attributes.map((attr, index) => {
                                        const uniqueKey = attr.id !== 0 ? attr.id : attr.custom_id;
                                        return (
                                            <div key={uniqueKey} className="bg-white border border-[#dcdcde] rounded-sm overflow-hidden">
                                                <div className="px-4 py-2 bg-[#f6f7f7] border-b border-[#dcdcde] flex justify-between items-center cursor-pointer" onClick={() => toggleAttrExpand(uniqueKey)}>
                                                    <span className="font-bold flex items-center gap-2 text-xs">{attr.expanded ? <Icons.ChevronDown className="w-3 h-3" /> : <Icons.ChevronRight className="w-3 h-3" />} {attr.id !== 0 ? attr.name : (attr.name || 'Custom attribute')}</span>
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); removeAttribute(uniqueKey); }} className="text-red-500 text-xs">Remove</button>
                                                </div>
                                                {attr.expanded && (
                                                    <div className="p-4 grid grid-cols-2 gap-8">
                                                        <div className="space-y-3">
                                                            {attr.id === 0 && (<div className="space-y-1"><label className="text-[10px] font-bold text-gray-500">Name:</label><input type="text" className="w-full border border-[#8c8f94] px-2 py-1 outline-none text-xs" value={attr.name} onChange={e => { let newAttrs = [...formData.attributes]; newAttrs[index].name = e.target.value; setFormData({...formData, attributes: newAttrs}); }} /></div>)}
                                                            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-500">Value(s):</label><textarea className="w-full border border-[#8c8f94] p-2 h-20 outline-none text-xs" value={attr.value_string} onChange={e => { let newAttrs = [...formData.attributes]; newAttrs[index].value_string = e.target.value; setFormData({...formData, attributes: newAttrs}); }} placeholder='Values separated by "|"' /></div>
                                                        </div>
                                                        <div className="space-y-4 pt-4">
                                                            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer"><input type="checkbox" checked={attr.visible} onChange={e => { let newAttrs = [...formData.attributes]; newAttrs[index].visible = e.target.checked; setFormData({...formData, attributes: newAttrs}); }} /> Visible on the product page</label>
                                                            {formData.type === 'variable' && (<label className="flex items-center gap-2 text-xs font-semibold cursor-pointer"><input type="checkbox" checked={attr.variation} onChange={e => { let newAttrs = [...formData.attributes]; newAttrs[index].variation = e.target.checked; setFormData({...formData, attributes: newAttrs}); }} /> Used for variations</label>)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {activeTab === 'variations' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f1]"><button type="button" onClick={generateVariations} className="bg-[#2271b1] text-white px-4 py-1.5 rounded-sm font-bold text-xs hover:bg-[#135e96]">Generate variations</button></div>
                                <div className="space-y-4">
                                    {formData.variations.map((v, i) => (
                                        <div key={i} className="border border-[#dcdcde] rounded-sm bg-white overflow-hidden text-xs">
                                            <div className="px-4 py-2 bg-[#f6f7f7] border-b border-[#dcdcde] flex justify-between">
                                                <div className="flex items-center gap-2"> {v.attributes.map((a: any) => (<span key={`${a.id}-${a.name}-${a.option}`} className="bg-gray-200 px-1.5 py-0.5 rounded font-bold uppercase">{a.name}: {a.option}</span>))} </div>
                                                <button type="button" onClick={() => { const newV = [...formData.variations]; newV.splice(i, 1); setFormData({...formData, variations: newV}); }} className="text-red-500">Remove</button>
                                            </div>
                                            <div className="p-4 grid grid-cols-2 gap-4"><input type="text" className="border border-[#dcdcde] p-1 outline-none" value={v.regular_price} onChange={e => {const newV = [...formData.variations]; newV[i].regular_price = e.target.value; setFormData({...formData, variations: newV});}} placeholder="Price" /><input type="text" className="border border-[#dcdcde] p-1 outline-none" value={v.sku} onChange={e => {const newV = [...formData.variations]; newV[i].sku = e.target.value; setFormData({...formData, variations: newV});}} placeholder="SKU" /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
          <div className="w-80 space-y-6">
            <div className="bg-white border border-[#dcdcde] shadow-sm rounded-sm">
                <div className="p-4 flex justify-between bg-[#f6f7f7] border-b border-[#dcdcde] font-bold text-sm">Publish</div>
                <div className="p-4 py-3 flex justify-between bg-white"><button type="button" className="text-red-600 text-xs hover:underline">Cancel</button><button type="submit" disabled={loading} className="bg-[#2271b1] text-white px-5 py-1.5 rounded-sm font-bold text-xs flex items-center gap-2">{loading && <Icons.RefreshCW className="w-3 h-3 animate-spin" />} {loading ? 'Publishing...' : 'Publish'}</button></div>
            </div>
            <div className="bg-white border border-[#dcdcde] shadow-sm rounded-sm"><div className="px-4 py-2 bg-[#f6f7f7] border-b border-[#dcdcde] font-bold text-sm">Product categories</div><div className="p-4 h-48 overflow-y-auto">{hierarchicalCategories.map(cat => (<div key={cat.id} className="flex gap-2 text-xs py-1" style={{ paddingLeft: `${cat.depth * 15}px` }}> <input type="checkbox" checked={!!formData.categories.find(c => c.id === cat.id)} onChange={() => handleCategoryToggle(cat.id)} /> {cat.name} </div>))}</div></div>
            <div className="bg-white border border-[#dcdcde] shadow-sm rounded-sm overflow-hidden">
                <div className="px-4 py-2 bg-[#f6f7f7] border-b border-[#dcdcde] font-bold text-sm flex justify-between"><span>Product image</span> {compressing && <Icons.RefreshCW className="w-3 h-3 animate-spin text-[#2271b1]" />}</div>
                <div className="p-4">
                    <input type="file" hidden ref={mainImageRef} accept="image/*" onChange={handleMainImageChange} />
                    {mainImagePreview ? (<div className="relative group border border-[#dcdcde]"><img src={mainImagePreview} alt="WebP Preview" className="w-full aspect-square object-cover" /><div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center gap-4 text-white"><button type="button" onClick={() => mainImageRef.current?.click()} className="text-[10px] uppercase font-bold">Replace</button><button type="button" onClick={() => { setMainImagePreview(null); setFormData(p => ({...p, images: p.images.filter((img: any) => img.alt !== 'Main Image')})); }} className="text-[10px] uppercase font-bold">Remove</button></div></div>) : (<div onClick={() => mainImageRef.current?.click()} className="w-full aspect-square bg-[#f6f7f7] border-2 border-dashed border-[#dcdcde] flex flex-col items-center justify-center gap-2 cursor-pointer text-[#2271b1] hover:bg-gray-50"><Icons.Plus className="w-8 h-8 opacity-40" /><span className="text-xs font-bold font-normal">Upload</span></div>)}
                </div>
            </div>
            <div className="bg-white border border-[#dcdcde] shadow-sm rounded-sm overflow-hidden">
                <div className="px-4 py-2 bg-[#f6f7f7] border-b border-[#dcdcde] font-bold text-sm">Product gallery</div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-4 gap-2">{galleryPreviews.map((url, i) => (<div key={url} className="relative group aspect-square border border-[#dcdcde]"><img src={url} className="w-full h-full object-cover" /><button type="button" onClick={() => removeGalleryImage(i)} className="absolute -top-1 -right-1 bg-white rounded-full w-4 h-4 shadow flex items-center justify-center text-red-500 text-[10px] hidden group-hover:flex">×</button></div>))}</div>
                    <input type="file" hidden multiple ref={galleryImagesRef} accept="image/*" onChange={handleGalleryChange} /><button type="button" onClick={() => galleryImagesRef.current?.click()} className="text-xs text-[#2271b1] font-semibold hover:underline">Add gallery images</button>
                </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
