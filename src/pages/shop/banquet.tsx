import React from 'react';
import SakoonLayout from '../../components/frontend/sakoon/SakoonLayout';
import ProductList from '../../components/frontend/sakoon/ProductList';

export default function SakoonBanquet() {
  return (
    <SakoonLayout title="Banquet Services">
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-[#1B1B1B]">
        <img
          src="https://sakoon.vismaad.com/wp-content/uploads/2026/03/3.webp"
          alt="Sakoon Banquet"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-8xl font-rubik font-black uppercase tracking-[0.2em] mb-4">
            BANQUET
          </h1>
          <p className="mt-8 text-sm md:text-xl font-black tracking-[0.5em] uppercase text-[#F2002D]">Grand Celebrations Redefined</p>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto text-center font-montserrat">
        {/* <h3 className="text-4xl md:text-5xl font-rubik font-black mb-12 uppercase tracking-tight">Elegant Spaces for Every Occasion</h3>
        <p className="text-lg md:text-xl text-gray-400 max-w-4xl mx-auto mb-16 leading-[2] font-medium italic">
          "Our banquet halls are designed to offer a perfect setting for weddings, corporate events, and private gatherings. With state-of-the-art facilities and a dedicated event team, we turn your dreams into unforgettable celebrations."
        </p> */}

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center mt-24 opacity-80 border-b border-gray-100 pb-24">
          <div className="space-y-4">
            <span className="text-4xl font-rubik font-black text-[#F2002D]">350+</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1B1B1B]">Capacity (Guests)</p>
          </div>
          <div className="space-y-4">
            <span className="text-4xl font-rubik font-black text-[#F2002D]">10K+</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1B1B1B]">Square Footage</p>
          </div>
          <div className="space-y-4">
            <span className="text-4xl font-rubik font-black text-[#F2002D]">24/7</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1B1B1B]">Venue Access</p>
          </div>
          <div className="space-y-4">
            <span className="text-4xl font-rubik font-black text-[#F2002D]">Full</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1B1B1B]">Event Catering</p>
          </div>
        </div> */}

        <div className="text-left">
          <h2 className="text-[#F2002D] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Event Packages</h2>
          <h3 className="text-4xl font-rubik font-black text-[#1B1B1B]">Crafted for Perfection</h3>
          <ProductList categorySlug="banquet" />
        </div>
      </section>
    </SakoonLayout>
  );
}