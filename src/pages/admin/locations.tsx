import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
}

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  // Initial Sample Data if none in local storage
  const initialData: Location[] = [
    { id: '1', name: 'Sakoon Fremont', address: '35700 Fremont Blvd, Fremont, CA 94536', phone: '(510) 744-7000', email: 'sakoonfremont@gmail.com', hours: 'Mon-Sun: 11:30 AM - 10:00 PM' },
    { id: '2', name: 'Sakoon Santa Clara', address: '3570 Homestead Rd, Santa Clara, CA 95051', phone: '(408) 244-4424', email: 'sakoonsantaclara@gmail.com', hours: 'Mon-Sun: 11:30 AM - 10:00 PM' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('sakoon_locations');
    if (saved) {
      setLocations(JSON.parse(saved));
    } else {
      setLocations(initialData);
      localStorage.setItem('sakoon_locations', JSON.stringify(initialData));
    }
  }, []);

  const saveToStorage = (updated: Location[]) => {
    localStorage.setItem('sakoon_locations', JSON.stringify(updated));
    setLocations(updated);
  };

  const handleAdd = () => {
    setCurrentLocation({ id: Math.random().toString(36).substr(2, 9), name: '', address: '', phone: '', email: '', hours: '' });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (loc: Location) => {
    setCurrentLocation({ ...loc });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      saveToStorage(locations.filter(l => l.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLocation) return;
    
    let updated;
    if (isEditing) {
      updated = locations.map(l => l.id === currentLocation.id ? currentLocation : l);
    } else {
      updated = [...locations, currentLocation];
    }
    
    saveToStorage(updated);
    setShowModal(false);
  };

  const filtered = locations.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Locations | WP Admin">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-[#1d2327]">Locations</h2>
            <button 
              onClick={handleAdd}
              className="bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f6f7f7] px-3 py-1 text-sm font-bold rounded-sm uppercase tracking-tight transition-all active:translate-y-0.5"
            >
              Add New
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-[#8c8f94] px-3 py-1.5 text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none w-64 shadow-sm"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white border border-[#dcdcde] shadow-sm rounded-sm">
          <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-[#f6f7f7] border-b border-[#dcdcde] text-[11px] uppercase tracking-[0.1em] text-[#1d2327] font-black">
                 <th className="px-4 py-3">Location Name</th>
                 <th className="px-4 py-3">Address</th>
                 <th className="px-4 py-3">Contact</th>
                 <th className="px-4 py-3">Hours</th>
               </tr>
             </thead>
             <tbody>
               {filtered.map((loc) => (
                 <tr key={loc.id} className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7] text-sm group transition-colors">
                   <td className="px-4 py-4 align-top">
                     <div className="flex flex-col gap-1">
                       <span className="text-[#2271b1] font-bold text-[14px] cursor-pointer hover:text-[#135e96]">{loc.name}</span>
                       <div className="flex items-center gap-2 text-[11px] text-[#2271b1] opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleEdit(loc)} className="hover:text-black font-bold uppercase tracking-tight">Edit</button>
                         <span className="text-[#dcdcde]">|</span>
                         <button onClick={() => handleDelete(loc.id)} className="text-destructive hover:text-destructive/80 font-bold uppercase tracking-tight">Delete</button>
                       </div>
                     </div>
                   </td>
                   <td className="px-4 py-4 text-[#50575e] text-xs leading-relaxed max-w-xs">{loc.address}</td>
                   <td className="px-4 py-4 text-[11px] font-medium leading-relaxed">
                      <div className="flex items-center gap-2 text-[#2271b1] mb-1">
                         <Icons.Phone className="w-3 h-3" /> {loc.phone}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                         <Icons.Mail className="w-3 h-3" /> {loc.email}
                      </div>
                   </td>
                   <td className="px-4 py-4 text-[#50575e] text-[11px] font-medium italic">{loc.hours}</td>
                 </tr>
               ))}
               {filtered.length === 0 && (
                 <tr>
                   <td colSpan={4} className="p-12 text-center text-gray-400 italic">No locations found.</td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over or Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm shadow-2xl">
           <div className="bg-white w-full max-w-xl rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="p-4 bg-[#1d2327] text-white flex items-center justify-between">
                <h3 className="font-bold text-sm tracking-wide uppercase">{isEditing ? 'Edit Location' : 'Add New Location'}</h3>
                <button onClick={() => setShowModal(false)}><Icons.X className="w-5 h-5 hover:text-destructive transition-colors" /></button>
             </div>
             
             <form onSubmit={handleSave} className="p-6 space-y-4 bg-[#f0f0f1]">
                <div className="space-y-4 bg-white p-6 border border-[#dcdcde] rounded-sm shadow-sm">
                   <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-[#1d2327]">Location Name</label>
                      <input 
                        required 
                        value={currentLocation?.name} 
                        onChange={e => setCurrentLocation({...currentLocation!, name: e.target.value})}
                        className="border border-[#8c8f94] p-2 text-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]" 
                      />
                   </div>
                   <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-[#1d2327]">Full Address</label>
                      <textarea 
                        required 
                        rows={2}
                        value={currentLocation?.address} 
                        onChange={e => setCurrentLocation({...currentLocation!, address: e.target.value})}
                        className="border border-[#8c8f94] p-2 text-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]" 
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                         <label className="text-xs font-black uppercase tracking-widest text-[#1d2327]">Phone</label>
                         <input 
                           value={currentLocation?.phone} 
                           onChange={e => setCurrentLocation({...currentLocation!, phone: e.target.value})}
                           className="border border-[#8c8f94] p-2 text-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]" 
                         />
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <label className="text-xs font-black uppercase tracking-widest text-[#1d2327]">Email</label>
                         <input 
                           type="email"
                           value={currentLocation?.email} 
                           onChange={e => setCurrentLocation({...currentLocation!, email: e.target.value})}
                           className="border border-[#8c8f94] p-2 text-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]" 
                         />
                      </div>
                   </div>
                   <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-[#1d2327]">Operating Hours</label>
                      <input 
                        value={currentLocation?.hours} 
                        onChange={e => setCurrentLocation({...currentLocation!, hours: e.target.value})}
                        className="border border-[#8c8f94] p-2 text-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]" 
                      />
                   </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                   <button 
                     type="button" 
                     onClick={() => setShowModal(false)}
                     className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     className="bg-[#2271b1] text-white px-8 py-2 text-xs font-black uppercase tracking-widest rounded-sm shadow-md hover:bg-[#135e96] transition-all active:scale-95"
                   >
                     {isEditing ? 'Save Changes' : 'Publish Location'}
                   </button>
                </div>
             </form>
           </div>
        </div>
      )}
    </AdminLayout>
  );
}
