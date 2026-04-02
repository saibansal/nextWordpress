import React from 'react';
import SakoonLayout from '../../components/frontend/sakoon/SakoonLayout';

export default function SakoonBar() {
  return (
    <SakoonLayout title="The Bar">
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://sakoon.vismaad.com/wp-content/uploads/2026/03/fine-dine.webp"
          alt="Sakoon Bar"
          className="absolute inset-0 w-full h-full object-cover brightness-50 contrast-125 transition-transform duration-[10s] hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div className="relative z-10 text-center text-white px-4 mt-20">
           <h1 className="text-5xl md:text-8xl font-rubik font-black uppercase tracking-[0.2em] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
             THE BAR
           </h1>
           <p className="mt-8 text-sm md:text-lg font-black tracking-[0.4em] uppercase text-[#F2002D] animate-pulse">Crafted Mixology & Premium Spirits</p>
        </div>
      </section>

      <section className="py-32 px-6 md:px-16 max-w-7xl mx-auto text-center flex flex-col items-center">
        <div className="w-16 h-1 bg-[#F2002D] mb-12"></div>
        <h3 className="text-4xl md:text-5xl font-rubik font-black mb-12 tracking-tight">Elevated Libations</h3>
        <p className="text-gray-500 text-lg md:text-xl leading-[2] max-w-4xl font-medium mb-24 px-4">
            Our bar offers an extensive selection of the world's finest whiskies, wine and spirits and a collection of house-crafted cocktails. Be sure to try any of our exotic cocktails which are inspired by the distinct flavors of Indian and Southeast Asian cuisine.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-16 w-full opacity-60">
            <div className="flex flex-col gap-4">
                <span className="text-5xl font-rubik font-black">100+</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#F2002D]">Fine Whiskies</span>
            </div>
            <div className="flex flex-col gap-4 border-x border-gray-100">
                <span className="text-5xl font-rubik font-black">50+</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#F2002D]">Crafted Cocktails</span>
            </div>
            <div className="flex flex-col gap-4">
                <span className="text-5xl font-rubik font-black">20+</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#F2002D]">Champagne Varietals</span>
            </div>
        </div>
      </section>
    </SakoonLayout>
  );
}
