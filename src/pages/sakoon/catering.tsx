import React from 'react';
import SakoonLayout from '../../components/frontend/sakoon/SakoonLayout';
import ProductList from '../../components/frontend/sakoon/ProductList';

export default function SakoonCatering() {
  return (
    <SakoonLayout title="Catering Services">
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-[#1B1B1B]">
        <img
          src="https://sakoon.vismaad.com/wp-content/uploads/2026/03/4.webp"
          alt="Sakoon Catering"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-4">
           <h1 className="text-5xl md:text-8xl font-rubik font-black uppercase tracking-[0.3em] mb-4">
             CATERING
           </h1>
           <p className="mt-8 text-sm md:text-xl font-black tracking-[0.5em] uppercase text-[#F2002D]">Bringing the Sakoon Experience to You</p>
        </div>
      </section>

      <section className="py-32 px-6 md:px-16 max-w-7xl mx-auto text-center font-montserrat">
        <h3 className="text-4xl md:text-5xl font-rubik font-black mb-12 uppercase tracking-tight">The Art of Off-Site Catering</h3>
        <p className="text-lg md:text-xl text-gray-500 max-w-4xl mx-auto mb-24 leading-[2] font-medium italic">
            "Whether it's an intimate dinner or a grand gala, Sakoon provides unparalleled catering services. Our master chefs and staff work together to ensure your event's culinary journey is just as opulent as dining in our own restaurant."
        </p>

        <ProductList />
      </section>
    </SakoonLayout>
  );
}
