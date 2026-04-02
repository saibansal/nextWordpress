import React, { useEffect, useState } from 'react';
import { useLocation } from '../../../context/LocationContext';
import { Icons } from '../../Icons';

export default function LocationPopup() {
  const { selectedLocation, selectLocation, isLoading, isPopupOpen, setPopupOpen } = useLocation();
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('sakoon_locations');
    if (saved) {
      setLocations(JSON.parse(saved));
    } else {
        const initialData = [
            { id: '1', name: 'Sakoon Fremont', address: '35700 Fremont Blvd, Fremont, CA 94536', phone: '(510) 744-7000' },
            { id: '2', name: 'Sakoon Santa Clara', address: '3570 Homestead Rd, Santa Clara, CA 95051', phone: '(408) 244-4424' },
            { id: '3', name: 'Sakoon Mountain View', address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043', phone: '(650) 253-0000' },
        ];
        setLocations(initialData);
        localStorage.setItem('sakoon_locations', JSON.stringify(initialData));
    }
  }, []);

  if (!isPopupOpen || isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden p-10 text-center animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
        <button 
          onClick={() => setPopupOpen(false)}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-all font-bold text-lg"
        >
          ×
        </button>
        <img 
          src="https://sakoon.vismaad.com/wp-content/uploads/2022/06/sakoonlogo__.png" 
          alt="Sakoon Logo" 
          className="h-16 mx-auto mb-8 animate-bounce-slow" 
        />
        <h2 className="text-3xl font-rubik font-black mb-4 uppercase tracking-widest text-[#1B1B1B]">Select Your Location</h2>
        <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">To provide you with the freshest flavors and fastest service, please select your nearest Sakoon branch.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => selectLocation(loc)}
              className="group p-6 border-2 border-gray-100 rounded-3xl hover:border-[#F2002D] hover:bg-gray-50 transition-all text-left flex items-start gap-4 active:scale-95"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#F2002D]/10 text-gray-400 group-hover:text-[#F2002D] transition-colors">
                <Icons.MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[15px] text-[#1B1B1B]">{loc.name}</h3>
                <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-[180px] mt-1">{loc.address}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-12 text-[10px] uppercase font-black tracking-[0.2em] text-gray-300">Experience Indian Fine Dining</p>
      </div>
    </div>
  );
}
