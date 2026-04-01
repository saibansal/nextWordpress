import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

interface MediaPickerProps {
    onSelect: (images: any[]) => void;
    onClose: () => void;
    multiple?: boolean;
    selectedIds?: number[];
}

export default function MediaPicker({ onSelect, onClose, multiple = false, selectedIds = [] }: MediaPickerProps) {
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
    const [selected, setSelected] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (activeTab === 'library') {
            fetchMedia();
        }
    }, [activeTab]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/wp/media?per_page=80");
            if (!response.ok) throw new Error("Failed to fetch media");
            const data = await response.json();
            setMediaItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (item: any) => {
        if (!multiple) {
            setSelected([item]);
            return;
        }

        const isSelected = selected.find(i => i.id === item.id);
        if (isSelected) {
            setSelected(selected.filter(i => i.id !== item.id));
        } else {
            setSelected([...selected, item]);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file: event.target?.result as string,
                        name: file.name,
                        type: file.type
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (!multiple) {
                        onSelect([{ id: data.id, src: data.source_url }]);
                        onClose();
                    } else {
                        setActiveTab('library');
                        fetchMedia();
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const confirmSelection = () => {
        onSelect(selected.map(item => ({
            id: item.id,
            src: item.source_url,
            alt: item.alt_text || item.title.rendered
        })));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden border border-border animate-in zoom-in-95">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/10">
                    <h3 className="font-bold text-lg">Add Media</h3>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <Icons.X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-secondary/5 border-b border-border">
                    <button 
                        onClick={() => setActiveTab('upload')}
                        className={`px-8 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'upload' ? 'border-primary text-primary bg-white' : 'border-transparent text-muted-foreground hover:bg-black/5'}`}
                    >
                        Upload Files
                    </button>
                    <button 
                         onClick={() => setActiveTab('library')}
                        className={`px-8 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'library' ? 'border-primary text-primary bg-white' : 'border-transparent text-muted-foreground hover:bg-black/5'}`}
                    >
                        Media Library
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {activeTab === 'upload' ? (
                        <div className="h-full flex flex-col items-center justify-center border-4 border-dashed border-border rounded-3xl group hover:border-primary/50 transition-colors">
                            <input type="file" id="media-upload" hidden onChange={handleUpload} accept="image/*" />
                            <label htmlFor="media-upload" className="flex flex-col items-center cursor-pointer">
                                {uploading ? (
                                    <Icons.RefreshCW className="w-20 h-20 text-primary animate-spin mb-6" />
                                ) : (
                                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Icons.Plus className="w-12 h-12 text-primary" />
                                    </div>
                                )}
                                <h4 className="text-xl font-bold mb-2">{uploading ? 'Processing File...' : 'Drop files to upload'}</h4>
                                <p className="text-sm text-muted-foreground">or click to select your files</p>
                                <div className="mt-8 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20">
                                    Select Files
                                </div>
                            </label>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 animate-in slide-in-from-bottom-4">
                            {loading ? (
                                Array.from({ length: 24 }).map((_, i) => (
                                    <div key={i} className="aspect-square bg-secondary/20 animate-pulse rounded-lg" />
                                ))
                            ) : (
                                mediaItems.map((item) => {
                                    const isSelected = !!selected.find(s => s.id === item.id);
                                    return (
                                        <div 
                                            key={item.id} 
                                            onClick={() => toggleSelect(item)}
                                            className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden transition-all group ${isSelected ? 'ring-4 ring-primary ring-offset-2 scale-95 shadow-lg' : 'hover:scale-105 shadow-sm'}`}
                                        >
                                            <img src={item.media_details?.sizes?.thumbnail?.source_url || item.source_url} className="w-full h-full object-cover" />
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                    <div className="bg-primary text-primary-foreground p-1 rounded-full shadow-xl">
                                                        <Icons.Check className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                                                <p className="text-[8px] text-white truncate w-full">{item.title.rendered}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border flex items-center justify-between bg-secondary/5">
                    <div className="text-sm text-muted-foreground font-medium">
                        {selected.length > 0 ? `${selected.length} items selected` : 'No items selected'}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-black/5 transition-colors uppercase tracking-widest">
                            Cancel
                        </button>
                        <button 
                            disabled={selected.length === 0}
                            onClick={confirmSelection}
                            className="bg-primary text-primary-foreground px-10 py-3 rounded-xl text-sm font-black uppercase tracking-[0.1em] shadow-xl shadow-primary/20 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all"
                        >
                            {multiple ? 'Insert Gallery' : 'Set Product Image'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
