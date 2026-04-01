import React, { useState, useCallback } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { Icons } from '../../../components/Icons';
import Link from 'next/link';

interface UploadFile {
    file: File;
    name: string;
    size: number;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
    id?: number;
    url?: string;
}

export default function MediaNew() {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);


    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    }, []);

    const handleFiles = (newFiles: File[]) => {
        const uploadFiles: UploadFile[] = newFiles.map(f => ({
            file: f,
            name: f.name,
            size: f.size,
            progress: 0,
            status: 'pending'
        }));
        setFiles(prev => [...uploadFiles, ...prev]);
        uploadFiles.forEach(uploadFile);
    };

    const uploadFile = async (item: UploadFile) => {
        const index = files.findIndex(f => f.name === item.name && f.size === item.size);
        
        const updateStatus = (updates: Partial<UploadFile>) => {
            setFiles(prev => prev.map(f => (f.file === item.file ? { ...f, ...updates } : f)));
        };

        updateStatus({ status: 'uploading', progress: 10 });

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file: e.target?.result as string,
                        name: item.name,
                        type: item.file.type
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    updateStatus({ status: 'completed', progress: 100, id: data.id, url: data.source_url });
                } else {
                    const data = await response.json();
                    updateStatus({ status: 'error', error: data.message || 'Upload failed' });
                }
            } catch (err: any) {
                updateStatus({ status: 'error', error: err.message });
            }
        };
        reader.readAsDataURL(item.file);
    };

    const copyToClipboard = (id: number, url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };


    return (
        <AdminLayout title="Upload New Media | WP Admin">
            <div className="max-w-4xl mx-auto py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-normal text-[#1d2327]">Upload New Media</h2>
                    <Link href="/admin/media" className="text-[#2271b1] hover:text-[#135e96] text-sm font-semibold flex items-center gap-1 group transition-colors">
                        <Icons.ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Media Library
                    </Link>
                </div>

                {/* Drop Zone */}
                <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    className={`relative border-2 border-dashed rounded-3xl p-20 flex flex-col items-center justify-center transition-all duration-300 group ${isDragging ? 'border-[#2271b1] bg-[#2271b1]/5 scale-102' : 'border-[#dcdcde] hover:border-[#2271b1] bg-white'}`}
                >
                    <div className="w-24 h-24 bg-[#f0f0f1] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#2271b1]/10 transition-all duration-500">
                        <Icons.Image className={`w-12 h-12 transition-colors duration-500 ${isDragging ? 'text-[#2271b1]' : 'text-gray-400 group-hover:text-[#2271b1]'}`} />
                    </div>
                    <h3 className="text-xl font-bold text-[#1d2327] mb-2">Drop files to upload</h3>
                    <p className="text-gray-500 mb-8">or</p>
                    <label className="cursor-pointer bg-[#f6f7f7] border border-[#2271b1] text-[#2271b1] px-10 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#2271b1] hover:text-white transition-all shadow-lg active:scale-95">
                        Select Files
                        <input type="file" multiple hidden onChange={(e) => handleFiles(Array.from(e.target.files || []))} accept="image/*" />
                    </label>
                    <p className="mt-8 text-xs text-gray-400">Maximum upload file size: 10 MB.</p>
                </div>

                {/* Upload Queue */}
                {files.length > 0 && (
                    <div className="mt-12 space-y-4 animate-in slide-in-from-bottom-6 duration-500">
                        <div className="flex items-center justify-between px-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                            <span>Queue — {files.length} Files</span>
                            <span>{files.filter(f => f.status === 'completed').length} Completed</span>
                        </div>
                        {files.map((file, i) => (
                            <div key={`${file.name}-${i}`} className="bg-white border border-[#dcdcde] p-5 rounded-2xl shadow-sm flex items-center gap-6 group hover:shadow-md transition-shadow">
                                <div className="w-16 h-16 bg-[#f0f0f1] rounded-xl overflow-hidden flex-shrink-0 border border-black/5 ring-1 ring-black/5">
                                    {file.url ? (
                                        <img src={file.url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><Icons.Image className="w-6 h-6 text-gray-300" /></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-[#1d2327] truncate pr-4">{file.name}</h4>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="h-1.5 bg-[#f0f0f1] rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 rounded-full ${file.status === 'error' ? 'bg-red-500' : 'bg-[#2271b1]'}`}
                                            style={{ width: `${file.progress}%` }}
                                        />
                                    </div>

                                    {file.status === 'error' && (
                                        <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                                            <Icons.AlertTriangle className="w-3 h-3" />
                                            {file.error}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2 pr-2">
                                    {file.status === 'completed' ? (
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => copyToClipboard(file.id!, file.url!)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${copiedId === file.id ? 'bg-green-500 text-white' : 'bg-secondary/20 hover:bg-secondary/40 text-muted-foreground'}`}
                                            >
                                                {copiedId === file.id ? <Icons.Check className="w-3 h-3" /> : <Icons.Copy className="w-3 h-3" />}
                                                {copiedId === file.id ? 'Copied' : 'Copy URL'}
                                            </button>
                                            <div className="flex items-center gap-2 text-[#2271b1]">
                                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Ready</span>
                                                <Icons.Check className="w-5 h-5 bg-[#2271b1]/10 p-1 rounded-full" />
                                            </div>
                                        </div>
                                    ) : file.status === 'uploading' ? (

                                        <Icons.RefreshCW className="w-5 h-5 text-[#2271b1] animate-spin" />
                                    ) : file.status === 'error' ? (
                                        <Icons.X className="w-5 h-5 text-red-500 bg-red-100 p-1 rounded-full" />
                                    ) : (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Wait...</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
