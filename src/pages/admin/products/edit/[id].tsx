import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../../../components/AdminLayout';
import { Icons } from '../../../../components/Icons';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProductSubNav from '../../../../components/ProductSubNav';
import MediaPicker from '../../../../components/MediaPicker';


export default function EditProduct() {
    const router = useRouter();
    const { id } = router.query;
    const mainImageRef = useRef<HTMLInputElement>(null);
    const galleryImagesRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('general');
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [shippingClasses, setShippingClasses] = useState<any[]>([]);
    const [taxClasses, setTaxClasses] = useState<any[]>([]);
    const [globalAttributes, setGlobalAttributes] = useState<any[]>([]);
    const [selectedAttrId, setSelectedAttrId] = useState<string>('');
    const [locations, setLocations] = useState<any[]>([]);


    const [formData, setFormData] = useState<any>({
        name: '', type: 'simple', status: 'publish', virtual: false, downloadable: false,
        regular_price: '', sale_price: '', tax_status: 'taxable', tax_class: '',
        external_url: '', button_text: 'Buy product', description: '', short_description: '',
        sku: '', gtin: '', manage_stock: false, stock_quantity: 0, stock_status: 'instock',
        sold_individually: false, weight: '', dimensions: { length: '', width: '', height: '' },
        shipping_class: '', reviews_allowed: true, purchase_note: '', menu_order: 0,
        upsell_ids: [] as number[], cross_sell_ids: [] as number[],
        categories: [] as any[], tags: [] as any[],
        grouped_products: [] as number[],
        attributes: [] as any[], default_attributes: [] as any[], variations: [] as any[],
        images: [] as any[],
        meta_data: [] as any[],
        addon_packages: [] as any[],
    });

    const [categories, setCategories] = useState<any[]>([]);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'main' | 'gallery'>('main');


    const organizeCategories = (cats: any[], parentId = 0, depth = 0): any[] => {
        let result: any[] = [];
        cats.filter(cat => cat.parent === parentId).forEach(cat => {
            result.push({ ...cat, depth });
            const children = organizeCategories(cats, cat.id, depth + 1);
            result = [...result, ...children];
        });
        return result;
    };

    const hierarchicalCategories = organizeCategories(categories);

    useEffect(() => {
        if (!id) return;
        async function fetchData() {
            setLoading(true);
            try {
                const [catRes, prodRes, shipRes, taxRes, attrRes, productRes] = await Promise.all([
                    fetch('/api/wc/products/categories?per_page=100'),
                    fetch('/api/wc/products?per_page=100'),
                    fetch('/api/wc/products/shipping_classes'),
                    fetch('/api/wc/taxes/classes'),
                    fetch('/api/wc/products/attributes'),
                    fetch(`/api/wc/products/${id}`)
                ]);

                if (catRes.ok) setCategories(await catRes.json());
                if (prodRes.ok) setAllProducts(await prodRes.json());
                if (shipRes.ok) setShippingClasses(await shipRes.json());
                if (taxRes.ok) setTaxClasses(await taxRes.json());
                if (attrRes.ok) setGlobalAttributes(await attrRes.json());

                if (productRes.ok) {
                    const product = await productRes.json();
                    const addonMeta = (product.meta_data || []).find((m: any) => m.key === '_addon_packages');
                    let addonPackages = [];
                    if (addonMeta) {
                        try {
                            addonPackages = typeof addonMeta.value === 'string' ? JSON.parse(addonMeta.value) : addonMeta.value;
                        } catch {
                            addonPackages = addonMeta.value || [];
                        }
                    }
                    addonPackages = (addonPackages || []).map((group: any) => ({
                        ...group,
                        id: group.id || Date.now(),
                        title: group.title || 'Package group',
                        instructions: group.instructions || 'Choose any 1 from the following',
                        selection_type: group.selection_type === 'multiple' ? 'multiple' : 'single',
                        min_selected: typeof group.min_selected === 'number' ? group.min_selected : Number(group.min_selected) || 1,
                        items: (group.items || []).map((item: any) => ({
                            ...item,
                            id: item.id || Date.now() + 1,
                            name: item.name || '',
                            cost: item.cost || ''
                        }))
                    }));
                    setFormData({
                        ...product,
                        attributes: (product.attributes || []).map((a: any) => ({
                            ...a,
                            value_string: a.options?.join(' | ') || '',
                            expanded: false
                        })),
                        addon_packages: addonPackages,
                        meta_data: product.meta_data || []
                    });
                }
                
                const savedLocs = localStorage.getItem('sakoon_locations');
                if (savedLocs) setLocations(JSON.parse(savedLocs));

            } catch (err) {

                console.error("Failed to fetch product data:", err);
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleMediaSelect = (selectedImages: any[]) => {
        if (pickerMode === 'main') {
            const selected = selectedImages[0];
            setFormData((prev: any) => ({
                ...prev,
                images: [{ id: selected.id, src: selected.src, alt: selected.alt || 'Main Image' }, ...prev.images.filter((img: any) => img.alt !== 'Main Image')]
            }));
        } else {
            setFormData((prev: any) => ({
                ...prev,
                images: [...prev.images, ...selectedImages.map(img => ({ id: img.id, src: img.src, alt: img.alt || 'Gallery Image' }))]
            }));
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            // Prepared attributes
            const finalAttributes = formData.attributes.map((attr: any) => ({

                id: attr.id, name: attr.name, position: attr.position, visible: attr.visible, variation: attr.variation,
                options: (attr.value_string || '').split('|').map((v: string) => v.trim()).filter((v: string) => v !== '')
            }));

            // 3. Prepare final image sequence (keep original IDs + new uploaded IDs)
            const finalImages = formData.images.map((img: any) => ({ id: img.id }));


                const addonMeta = { key: '_addon_packages', value: formData.addon_packages || [] };
                const filteredMeta = (formData.meta_data || []).filter((m: any) => m.key !== '_addon_packages');
                const productPayload = {
                    name: formData.name,
                    type: formData.type,
                    status: formData.status,
                    description: formData.description,
                    short_description: formData.short_description,
                    regular_price: formData.regular_price,
                    sale_price: formData.sale_price,
                    tax_status: formData.tax_status,
                    tax_class: formData.tax_class,
                    sku: formData.sku,
                    manage_stock: formData.manage_stock,
                    stock_quantity: formData.manage_stock ? formData.stock_quantity : null,
                    stock_status: formData.stock_status,
                    sold_individually: formData.sold_individually,
                    weight: formData.weight,
                    dimensions: formData.dimensions,
                    shipping_class: formData.shipping_class,
                    upsell_ids: formData.upsell_ids,
                    cross_sell_ids: formData.cross_sell_ids,
                    grouped_products: formData.grouped_products || [],
                    purchase_note: formData.purchase_note,
                    menu_order: formData.menu_order,
                    reviews_allowed: formData.reviews_allowed,
                    categories: formData.categories.map((c: any) => ({ id: c.id })),
                    tags: (formData.tags || []).map((t: any) => ({ id: t.id })),
                    attributes: finalAttributes,
                    images: finalImages,
                    meta_data: [...filteredMeta, addonMeta],
                    variations: formData.type === 'variable' ? (formData.variations || []).map((v: any) => ({
                        ...v, attributes: v.attributes.map((a: any) => ({ id: a.id, name: a.name, option: a.option }))
                    })) : []
                };

            const response = await fetch(`/api/wc/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productPayload),
            });

            const resData = await response.json();
            if (!response.ok) throw new Error(resData.message || resData.error?.message || 'Failed to update product');

            router.push('/admin/products');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'inventory', label: 'Inventory', icon: '📦' },
        { id: 'shipping', label: 'Shipping', icon: '🚛' },
        { id: 'linked', label: 'Linked Products', icon: '🔗' },
        { id: 'attributes', label: 'Attributes', icon: '🏷️' },
        { id: 'addons', label: 'Addon Packages', icon: '➕' },
        { id: 'advanced', label: 'Advanced', icon: '⭐' },
    ];
    const getDynamicTabs = () => {
        if (formData.type === 'grouped') return tabs.filter(t => !['general', 'shipping'].includes(t.id));
        if (formData.type === 'external') return tabs.filter(t => t.id !== 'shipping');
        if (formData.type === 'variable') return [...tabs.filter(t => t.id !== 'general'), { id: 'variations', label: 'Variations', icon: '🔄' }];
        return tabs;
    };
    const activeTabs = getDynamicTabs();

    const handleCategoryToggle = (catId: number) => {
        setFormData((prev: any) => {
            const exists = prev.categories.find((c: any) => c.id === catId);
            const newCats = exists ? prev.categories.filter((c: any) => c.id !== catId) : [...prev.categories, { id: catId }];
            return { ...prev, categories: newCats };
        });
    };

    const handleLocationToggle = (id: string) => {
        setFormData((prev: any) => {
          const meta = prev.meta_data || [];
          const locMeta = meta.find((m: any) => m.key === '_sakoon_locations');
          let currentLocs = locMeta ? locMeta.value : [];
          
          const newLocs = currentLocs.includes(id)
            ? currentLocs.filter((l: string) => l !== id)
            : [...currentLocs, id];
            
          const newMeta = locMeta
            ? meta.map((m: any) => m.key === '_sakoon_locations' ? { ...m, value: newLocs } : m)
            : [...meta, { key: '_sakoon_locations', value: newLocs }];
            
          return { ...prev, meta_data: newMeta };
        });
      };

    const addAddonGroup = () => {
        setFormData((prev: any) => ({
            ...prev,
            addon_packages: [
                ...prev.addon_packages,
                { id: Date.now(), title: 'New package group', instructions: 'Choose any 1 from the following', selection_type: 'single', min_selected: 1, items: [{ id: Date.now() + 1, name: '', cost: '' }] }
            ]
        }));
    };

    const removeAddonGroup = (groupId: number) => {
        setFormData((prev: any) => ({
            ...prev,
            addon_packages: prev.addon_packages.filter((group: any) => group.id !== groupId)
        }));
    };

    const updateAddonGroup = (groupId: number, changes: any) => {
        setFormData((prev: any) => ({
            ...prev,
            addon_packages: prev.addon_packages.map((group: any) => group.id === groupId ? { ...group, ...changes } : group)
        }));
    };

    const addAddonItem = (groupId: number) => {
        setFormData((prev: any) => ({
            ...prev,
            addon_packages: prev.addon_packages.map((group: any) => group.id === groupId ? {
                ...group,
                items: [...group.items, { id: Date.now(), name: '', cost: '' }]
            } : group)
        }));
    };

    const updateAddonItem = (groupId: number, itemId: number, changes: any) => {
        setFormData((prev: any) => ({
            ...prev,
            addon_packages: prev.addon_packages.map((group: any) => {
                if (group.id !== groupId) return group;
                return {
                    ...group,
                    items: group.items.map((item: any) => item.id === itemId ? { ...item, ...changes } : item)
                };
            })
        }));
    };

    const removeAddonItem = (groupId: number, itemId: number) => {
        setFormData((prev: any) => ({
            ...prev,
            addon_packages: prev.addon_packages.map((group: any) => group.id === groupId ? {
                ...group,
                items: group.items.filter((item: any) => item.id !== itemId)
            } : group)
        }));
    };


    const toggleAttrExpand = (uniqueKey: any) => {
        setFormData((prev: any) => ({
            ...prev, attributes: prev.attributes.map((a: any) => {
                const currentKey = a.id !== 0 ? a.id : a.custom_id;
                if (currentKey === uniqueKey) return { ...a, expanded: !a.expanded };
                return a;
            })
        }));
    };

    const addAttribute = () => {
        let newAttr;
        if (selectedAttrId) {
            const attrId = parseInt(selectedAttrId);
            const globalAttr = globalAttributes.find(a => a.id === attrId);
            if (!globalAttr || formData.attributes.find((a: any) => a.id === attrId)) return;
            newAttr = { id: globalAttr.id, name: globalAttr.name, position: formData.attributes.length, visible: true, variation: false, value_string: '', expanded: true };
        } else {
            const customId = Date.now();
            newAttr = { id: 0, custom_id: customId, name: '', position: formData.attributes.length, visible: true, variation: false, value_string: '', expanded: true };
        }
        setFormData((prev: any) => ({ ...prev, attributes: [...prev.attributes, newAttr] }));
        setSelectedAttrId('');
    };

    const removeGalleryImage = (id: number) => {
        setFormData((prev: any) => ({
            ...prev,
            images: prev.images.filter((img: any) => img.id !== id)
        }));
    };


    if (loading) return (
        <AdminLayout title="Edit Product | WP Admin">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
                <Icons.RefreshCW className="w-10 h-10 animate-spin mb-4 text-[#2271b1]" />
                <span className="font-bold text-sm uppercase tracking-widest">Loading Store Data...</span>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout title={`Edit ${formData.name} | WP Admin`}>
            <ProductSubNav />
            {saving && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <Icons.RefreshCW className="w-12 h-12 text-[#2271b1] animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-[#1d2327]">Synchronizing...</h3>
                    <p className="text-sm text-gray-500 font-medium">Updating WooCommerce product & media library</p>
                </div>
            )}
            <div className="max-w-6xl mx-auto pb-24">
                {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8 text-sm flex items-start gap-3 shadow-md">
                    <Icons.AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div className="flex flex-col gap-1">
                        <span className="font-bold uppercase text-xs">Update Error</span>
                        <p>{error}</p>
                    </div>
                </div>}
                <div className="flex items-center gap-4 mb-6"><h2 className="text-2xl font-normal text-[#1d2327]">Edit Product</h2></div>
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 text-[#1d2327]">
                    <div className="flex-1 space-y-6">
                        <div className="bg-white border border-[#dcdcde] p-3 shadow-sm rounded-sm">
                            <input type="text" required className="w-full text-2xl font-normal border border-[#dcdcde] px-4 py-2 outline-none focus:border-[#2271b1]" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            <div className="mt-6 flex flex-col gap-2">
                                <div className="flex items-center gap-2 bg-[#f6f7f7] border border-[#dcdcde] p-2 text-sm font-semibold">Product Description</div>
                                <textarea rows={8} className="w-full border border-[#dcdcde] p-4 outline-none focus:border-[#2271b1]" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                        </div>

                        <div className="bg-white border border-[#dcdcde] shadow-sm rounded-sm">
                            <div className="px-4 py-2 bg-[#f6f7f7] border-b border-[#dcdcde] flex items-center justify-between font-bold text-sm">
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
                                            <div className="grid grid-cols-4 items-center gap-4"><label className="text-gray-600 font-bold">Regular price ($)</label><input type="number" step="0.01" className="col-span-3 max-w-xs border border-[#8c8f94] px-3 py-1 outline-none" value={formData.regular_price} onChange={e => setFormData({ ...formData, regular_price: e.target.value })} /></div>
                                            <div className="grid grid-cols-4 items-center gap-4"><label className="text-gray-600 font-bold">Sale price ($)</label><input type="number" step="0.01" className="col-span-3 max-w-xs border border-[#8c8f94] px-3 py-1 outline-none" value={formData.sale_price} onChange={e => setFormData({ ...formData, sale_price: e.target.value })} /></div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-gray-600 font-bold">Tax status</label>
                                                <select className="col-span-3 max-w-xs border border-[#8c8f94] px-3 py-1 outline-none bg-white" value={formData.tax_status} onChange={e => setFormData({ ...formData, tax_status: e.target.value })}>
                                                    <option value="taxable">Taxable</option>
                                                    <option value="shipping">Shipping only</option>
                                                    <option value="none">None</option>
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-gray-600 font-bold">Tax class</label>
                                                <select className="col-span-3 max-w-xs border border-[#8c8f94] px-3 py-1 outline-none bg-white" value={formData.tax_class} onChange={e => setFormData({ ...formData, tax_class: e.target.value })}>
                                                    <option value="">Standard</option>
                                                    {taxClasses.map((tc: any) => <option key={tc.slug} value={tc.slug}>{tc.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'inventory' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-4 items-center gap-4"><label className="text-gray-600 font-bold">SKU</label><input type="text" className="col-span-3 max-w-xs border border-[#8c8f94] px-3 py-1 outline-none" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} /></div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-gray-600 font-bold">Manage stock?</label>
                                                <div className="col-span-3 flex items-center gap-2">
                                                    <input type="checkbox" checked={formData.manage_stock} onChange={e => setFormData({ ...formData, manage_stock: e.target.checked })} />
                                                    <span className="text-xs text-gray-500">Track inventory for this product</span>
                                                </div>
                                            </div>
                                            {formData.manage_stock && (
                                                <div className="grid grid-cols-4 items-center gap-4 animate-in fade-in duration-300">
                                                    <label className="text-gray-600 font-bold">Stock quantity</label>
                                                    <input type="number" className="col-span-3 max-w-[100px] border border-[#8c8f94] px-3 py-1 outline-none" value={formData.stock_quantity || 0} onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })} />
                                                </div>
                                            )}
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-gray-600 font-bold">Stock status</label>
                                                <select className="col-span-3 max-w-xs border border-[#8c8f94] px-3 py-1 outline-none bg-white" value={formData.stock_status} onChange={e => setFormData({ ...formData, stock_status: e.target.value })}>
                                                    <option value="instock">In stock</option>
                                                    <option value="outofstock">Out of stock</option>
                                                    <option value="onbackorder">On backorder</option>
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-gray-600 font-bold">Sold individually</label>
                                                <div className="col-span-3 flex items-center gap-2">
                                                    <input type="checkbox" checked={formData.sold_individually} onChange={e => setFormData({ ...formData, sold_individually: e.target.checked })} />
                                                    <span className="text-xs text-gray-500">Limit purchases to 1 item per order</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'shipping' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-4 items-center gap-4"><label className="text-gray-600 font-bold">Weight (kg)</label><input type="text" placeholder="0" className="col-span-3 max-w-[100px] border border-[#8c8f94] px-3 py-1 outline-none" value={formData.weight || ''} onChange={e => setFormData({ ...formData, weight: e.target.value })} /></div>
                                            <div className="grid grid-cols-4 items-start gap-4">
                                                <label className="text-gray-600 font-bold pt-1">Dimensions (cm)</label>
                                                <div className="col-span-3 flex gap-2">
                                                    <input type="text" placeholder="Length" className="w-20 border border-[#8c8f94] px-3 py-1 outline-none text-center" value={formData.dimensions?.length || ''} onChange={e => setFormData({ ...formData, dimensions: { ...formData.dimensions, length: e.target.value } })} />
                                                    <input type="text" placeholder="Width" className="w-20 border border-[#8c8f94] px-3 py-1 outline-none text-center" value={formData.dimensions?.width || ''} onChange={e => setFormData({ ...formData, dimensions: { ...formData.dimensions, width: e.target.value } })} />
                                                    <input type="text" placeholder="Height" className="w-20 border border-[#8c8f94] px-3 py-1 outline-none text-center" value={formData.dimensions?.height || ''} onChange={e => setFormData({ ...formData, dimensions: { ...formData.dimensions, height: e.target.value } })} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-gray-600 font-bold">Shipping class</label>
                                                <select className="col-span-3 max-w-xs border border-[#8c8f94] px-3 py-1 outline-none bg-white" value={formData.shipping_class} onChange={e => setFormData({ ...formData, shipping_class: e.target.value })}>
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
                                                        setFormData({ ...formData, upsell_ids: values });
                                                    }}>
                                                        {allProducts.filter((p: any) => p.id !== parseInt(id as string)).map((p: any) => (
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
                                                        setFormData({ ...formData, cross_sell_ids: values });
                                                    }}>
                                                        {allProducts.filter((p: any) => p.id !== parseInt(id as string)).map((p: any) => (
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
                                                <textarea className="col-span-3 w-full border border-[#8c8f94] px-3 py-2 outline-none h-24" value={formData.purchase_note || ''} onChange={e => setFormData({ ...formData, purchase_note: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-gray-600 font-bold">Menu order</label>
                                                <input type="number" className="col-span-3 max-w-[100px] border border-[#8c8f94] px-3 py-1 outline-none" value={formData.menu_order || 0} onChange={e => setFormData({ ...formData, menu_order: parseInt(e.target.value) })} />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-gray-600 font-bold">Enable reviews</label>
                                                <div className="col-span-3 flex items-center gap-2">
                                                    <input type="checkbox" checked={formData.reviews_allowed} onChange={e => setFormData({ ...formData, reviews_allowed: e.target.checked })} />
                                                    <span className="text-xs text-gray-500">Allow customers to leave reviews</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'addons' && (
                                        <div className="space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div>
                                                    <h3 className="text-lg font-bold text-[#1d2327]">Addon Packages</h3>
                                                    <p className="text-xs text-gray-500">Add package groups and item costs for this product.</p>
                                                </div>
                                                <button type="button" onClick={addAddonGroup} className="bg-[#2271b1] text-white px-3 py-2 rounded-sm text-xs font-semibold hover:bg-[#135e96]">Add package group</button>
                                            </div>
                                            {formData.addon_packages?.length === 0 ? (
                                                <div className="p-4 border border-dashed border-[#dcdcde] rounded-sm text-sm text-gray-500">No addon packages yet. Use the button above to add your first package group.</div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {formData.addon_packages.map((group: any) => (
                                                        <div key={group.id} className="rounded-sm border border-[#dcdcde] bg-white shadow-sm overflow-hidden">
                                                            <div className="p-4 border-b border-[#f0f0f1]">
                                                                <div className="grid grid-cols-1 lg:grid-cols-[1fr_160px] gap-3 mb-3">
                                                                    <input type="text" className="w-full border border-[#8c8f94] px-3 py-2 outline-none" value={group.title} placeholder="Package group title" onChange={e => updateAddonGroup(group.id, { title: e.target.value })} />
                                                                    <input type="text" className="w-full border border-[#8c8f94] px-3 py-2 outline-none" value={group.instructions || 'Choose any 1 from the following'} placeholder="Instructions" onChange={e => updateAddonGroup(group.id, { instructions: e.target.value })} />
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-[160px_120px] gap-3 mb-3">
                                                                    <select className="border border-[#8c8f94] px-3 py-2 bg-white outline-none" value={group.selection_type} onChange={e => updateAddonGroup(group.id, { selection_type: e.target.value, min_selected: e.target.value === 'single' ? 1 : group.min_selected || 1 })}>
                                                                        <option value="single">Radio</option>
                                                                        <option value="multiple">Checkbox</option>
                                                                    </select>
                                                                    <input type="number" min={1} disabled={group.selection_type === 'single'} className="w-full border border-[#8c8f94] px-3 py-2 outline-none disabled:cursor-not-allowed disabled:bg-[#f5f5f5]" value={group.min_selected || 1} placeholder="Select min option" onChange={e => updateAddonGroup(group.id, { min_selected: Math.max(1, Number(e.target.value) || 1) })} />
                                                                </div>
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="text-[11px] text-gray-500">{group.selection_type === 'multiple' ? `Select at least ${group.min_selected || 1} option${(group.min_selected || 1) === 1 ? '' : 's'} from this package.` : 'Choose one option from this package.'}</p>
                                                                    <button type="button" onClick={() => removeAddonGroup(group.id)} className="text-red-600 text-xs font-semibold hover:underline">Remove group</button>
                                                                </div>
                                                            </div>
                                                            <div className="p-4 space-y-3">
                                                                {group.items.map((item: any) => (
                                                                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_80px] gap-2 items-center">
                                                                        <input type="text" className="w-full border border-[#8c8f94] px-3 py-2 outline-none" value={item.name} placeholder="Item name" onChange={e => updateAddonItem(group.id, item.id, { name: e.target.value })} />
                                                                        <input type="number" step="0.01" className="w-full border border-[#8c8f94] px-3 py-2 outline-none" value={item.cost} placeholder="Cost" onChange={e => updateAddonItem(group.id, item.id, { cost: e.target.value })} />
                                                                        <button type="button" onClick={() => removeAddonItem(group.id, item.id)} className="text-red-500 text-xs font-semibold hover:underline">Remove</button>
                                                                    </div>
                                                                ))}
                                                                <button type="button" onClick={() => addAddonItem(group.id)} className="text-[#2271b1] text-xs font-semibold hover:underline">Add package item</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'attributes' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 pb-4 border-b border-[#f0f0f1]">
                                                <select className="border border-[#8c8f94] px-3 py-1 outline-none bg-white min-w-[200px]" value={selectedAttrId} onChange={e => setSelectedAttrId(e.target.value)}><option value="">Custom product attribute</option>{globalAttributes.map(attr => <option key={attr.id} value={attr.id}>{attr.name}</option>)}</select>
                                                <button type="button" onClick={addAttribute} className="bg-[#f6f7f7] border border-[#dcdcde] px-4 py-1 font-bold text-xs hover:bg-white">Add</button>
                                            </div>
                                            <div className="space-y-3">
                                                {(formData.attributes || []).map((attr: any, index: number) => {
                                                    const uniqueKey = attr.id !== 0 ? attr.id : attr.custom_id;
                                                    return (
                                                        <div key={uniqueKey} className="bg-white border border-[#dcdcde] rounded-sm overflow-hidden shadow-sm">
                                                            <div className="px-4 py-2 bg-[#f6f7f7] border-b border-[#dcdcde] flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => toggleAttrExpand(uniqueKey)}>
                                                                <span className="font-bold flex items-center gap-2 text-xs">{attr.expanded ? <Icons.ChevronDown className="w-3 h-3 opacity-60" /> : <Icons.ChevronRight className="w-3 h-3 opacity-60" />} {attr.id !== 0 ? attr.name : (attr.name || 'Custom attribute')}</span>
                                                                <button type="button" onClick={(e) => { e.stopPropagation(); setFormData((prev: any) => ({ ...prev, attributes: prev.attributes.filter((a: any) => (a.id !== 0 ? a.id : a.custom_id) !== uniqueKey) })); }} className="text-red-500 text-xs font-normal hover:underline">Remove</button>
                                                            </div>
                                                            {attr.expanded && (
                                                                <div className="p-4 grid grid-cols-2 gap-8 animate-in slide-in-from-top-1">
                                                                    <div className="space-y-3">
                                                                        {attr.id === 0 && (<div className="space-y-1"><label className="text-[10px] font-bold text-gray-500 uppercase">Name:</label><input type="text" className="w-full border border-[#8c8f94] px-2 py-1 outline-none text-xs" value={attr.name} onChange={e => { let newAttrs = [...formData.attributes]; newAttrs[index].name = e.target.value; setFormData({ ...formData, attributes: newAttrs }); }} /></div>)}
                                                                        <div className="space-y-1"><label className="text-[10px] font-bold text-gray-500 uppercase">Value(s):</label><textarea className="w-full border border-[#8c8f94] p-2 h-20 outline-none text-xs" value={attr.value_string} onChange={e => { let newAttrs = [...formData.attributes]; newAttrs[index].value_string = e.target.value; setFormData({ ...formData, attributes: newAttrs }); }} placeholder='Values separated by "|"' /></div>
                                                                    </div>
                                                                    <div className="space-y-4 pt-4">
                                                                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer"><input type="checkbox" checked={attr.visible} onChange={e => { let newAttrs = [...formData.attributes]; newAttrs[index].visible = e.target.checked; setFormData({ ...formData, attributes: newAttrs }); }} /> Visible on the product page</label>
                                                                        {formData.type === 'variable' && (<label className="flex items-center gap-2 text-xs font-semibold cursor-pointer"><input type="checkbox" checked={attr.variation} onChange={e => { let newAttrs = [...formData.attributes]; newAttrs[index].variation = e.target.checked; setFormData({ ...formData, attributes: newAttrs }); }} /> Used for variations</label>)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-80 space-y-6">
                        <div className="bg-white border border-[#dcdcde] shadow-sm rounded-sm">
                            <div className="p-4 flex justify-between bg-[#f6f7f7] border-b border-[#dcdcde] font-bold text-sm">Update</div>
                            <div className="p-4 py-3 flex justify-between bg-white items-center">
                                <button type="button" onClick={() => router.back()} className="text-red-600 text-xs hover:underline">Cancel</button>
                                <button type="submit" disabled={saving} className="bg-[#2271b1] text-white px-5 py-1.5 rounded-sm font-bold text-xs flex items-center gap-2 transition-all hover:bg-[#135e96] active:scale-95">{saving && <Icons.RefreshCW className="w-3 h-3 animate-spin" />} {saving ? 'Updating...' : 'Update'}</button>
                            </div>
                        </div>

                        <div className="bg-white border border-[#dcdcde] shadow-sm rounded-sm"><div className="px-4 py-2 bg-[#f6f7f7] border-b border-[#dcdcde] font-bold text-sm">Product categories</div><div className="p-4 h-48 overflow-y-auto">{hierarchicalCategories.map(cat => (<div key={cat.id} className="flex gap-2 text-xs py-1" style={{ paddingLeft: `${cat.depth * 15}px` }}> <input type="checkbox" checked={!!formData.categories.find((c: any) => c.id === cat.id)} onChange={() => handleCategoryToggle(cat.id)} /> {cat.name} </div>))}</div></div>

                        <div className="bg-white border border-[#dcdcde] shadow-sm rounded-sm">
                            <div className="px-4 py-2 bg-[#f6f7f7] border-b border-[#dcdcde] font-bold text-sm flex justify-between items-center">
                                <span>Product Locations</span>
                                <span className="text-[10px] bg-red-50 text-[#F2002D] px-2 py-0.5 rounded uppercase font-black tracking-widest">New</span>
                            </div>
                            <div className="p-4 space-y-2">
                                {locations.map(loc => (
                                    <div key={loc.id} className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:bg-gray-50 p-1 rounded transition-colors cursor-pointer" onClick={() => handleLocationToggle(loc.id)}>
                                        <input 
                                          type="checkbox" 
                                          readOnly
                                          checked={!!(formData.meta_data || []).find((m: any) => m.key === '_sakoon_locations')?.value?.includes(loc.id)} 
                                        />
                                        <span>{loc.name}</span>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-gray-100 mt-2">
                                    <p className="text-[10px] text-gray-400 italic">If no location is selected, the product will be visible across ALL branches (Global).</p>
                                </div>
                            </div>
                        </div>


                        <div className="bg-white border border-[#dcdcde] shadow-sm rounded-sm">
                            <div className="px-4 py-2 bg-[#f6f7f7] border-b border-[#dcdcde] font-bold text-sm flex justify-between"><span>Product image</span></div>
                            <div className="p-4">
                                {formData.images.find((img: any) => img.alt === 'Main Image' || formData.images.indexOf(img) === 0) ? (
                                    <div className="relative group border border-[#dcdcde]">
                                        <img src={formData.images.find((img: any) => img.alt === 'Main Image' || formData.images.indexOf(img) === 0).src} alt="Preview" className="w-full aspect-square object-cover" />
                                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center gap-4 text-white">
                                            <button type="button" onClick={() => { setPickerMode('main'); setShowMediaPicker(true); }} className="text-[10px] uppercase font-bold">Replace</button>
                                            <button type="button" onClick={() => setFormData((p: any) => ({ ...p, images: p.images.filter((img: any) => p.images.indexOf(img) > 0) }))} className="text-[10px] uppercase font-bold">Remove</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div onClick={() => { setPickerMode('main'); setShowMediaPicker(true); }} className="w-full aspect-square bg-[#f6f7f7] border-2 border-dashed border-[#dcdcde] flex flex-col items-center justify-center gap-2 cursor-pointer text-[#2271b1] hover:bg-gray-50">
                                        <Icons.Plus className="w-8 h-8 opacity-40" />
                                        <span className="text-xs font-bold leading-none mt-1">Set product image</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-white border border-[#dcdcde] shadow-sm rounded-sm overflow-hidden">
                            <div className="px-4 py-2 bg-[#f6f7f7] border-b border-[#dcdcde] font-bold text-sm flex justify-between items-center"><span>Product gallery</span></div>
                            <div className="p-4 space-y-4 text-sm font-normal">
                                <div className="grid grid-cols-4 gap-2">
                                    {formData.images.filter((img: any, i: number) => img.alt === 'Gallery Image' || i > 0).map((img: any) => (
                                        <div key={img.id} className="relative group aspect-square border border-[#dcdcde]">
                                            <img src={img.src} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeGalleryImage(img.id)} className="absolute -top-1 -right-1 bg-white rounded-full w-4 h-4 shadow flex items-center justify-center text-red-500 text-[10px] hidden group-hover:flex">×</button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={() => { setPickerMode('gallery'); setShowMediaPicker(true); }} className="text-xs text-[#2271b1] font-semibold hover:underline">Add gallery images</button>
                            </div>
                        </div>

                        {showMediaPicker && (
                            <MediaPicker 
                                multiple={pickerMode === 'gallery'}
                                onClose={() => setShowMediaPicker(false)}
                                onSelect={handleMediaSelect}
                            />
                        )}

                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
