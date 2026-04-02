import React from 'react';
import SakoonLayout from '../../components/frontend/sakoon/SakoonLayout';
import ProductList from '../../components/frontend/sakoon/ProductList';

export default function SakoonFineDine() {
  return (
    <SakoonLayout title="Fine Dining Experience">
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-[#1B1B1B]">
        <img
          src="https://sakoon.vismaad.com/wp-content/uploads/2026/03/fremont.webp"
          alt="Sakoon Interior"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-4">
           <h1 className="text-4xl md:text-7xl font-rubik font-black uppercase tracking-[0.2em] drop-shadow-2xl">
             FINE DINE
           </h1>
           <p className="mt-8 text-sm md:text-xl font-black tracking-[0.4em] uppercase text-[#F2002D]">A Culinary Journey Redefined</p>
        </div>
      </section>

      <section className="py-32 px-6 md:px-16 max-w-7xl mx-auto text-center font-montserrat">
        <h3 className="text-4xl md:text-5xl font-rubik font-black mb-12 uppercase tracking-tight">The Ultimate Dining Experience</h3>
        <p className="text-lg md:text-xl text-gray-500 max-w-4xl mx-auto mb-24 leading-[2] font-medium italic">
            "Experience the fusion of art and flavor in our elegantly designed spaces. From curated private dining to a full sensory journey, fine dining at Sakoon is meant to be unforgettable."
        </p>

        <ProductList />
      </section>
    </SakoonLayout>
  );
}
