import React from 'react';
import SakoonLayout from '../../components/frontend/sakoon/SakoonLayout';

export default function SakoonAbout() {
  return (
    <SakoonLayout title="About Us">
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://sakoon.vismaad.com/wp-content/uploads/2026/03/4.webp"
          alt="Sakoon Chef"
          className="absolute inset-0 w-full h-full object-cover brightness-75 scale-110"
        />
        {/* <div className="absolute inset-0 bg-black/40"></div> */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-rubik font-black uppercase tracking-widest drop-shadow-2xl">
            OUR STORY
          </h1>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto text-center">
        <h2 className="text-[#F2002D] font-black uppercase tracking-[0.3em] text-xs mb-8">Crafting Excellence Since Day One</h2>
        <h3 className="text-3xl md:text-5xl font-rubik font-black mb-12">The Sakoon Philosophy</h3>
        <p className="text-lg md:text-xl text-gray-600 leading-[1.8] max-w-4xl mx-auto italic mb-16">
          "Our goal is not only to feed you, but to give you an experience that will stay with you long after you leave our restaurant."
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-left">
          <div className="p-10 bg-gray-50 rounded-3xl space-y-6">
            <h4 className="text-xl font-rubik font-black text-[#F2002D]">The Name</h4>
            <p className="text-gray-600 font-medium leading-relaxed">
              Sakoon, derived from the Sanskrit word 'Sukoon', signifies peace and tranquility. This essence is reflected in our ambiance and culinary creations.
            </p>
          </div>
          <div className="p-10 bg-gray-50 rounded-3xl space-y-6">
            <h4 className="text-xl font-rubik font-black text-[#F2002D]">Our Ingredients</h4>
            <p className="text-gray-600 font-medium leading-relaxed">
              We believe in purity. From farm-to-table produce to authentic Indian spices, every element is chosen to reflect the true spirit of India.
            </p>
          </div>
        </div>
      </section>
    </SakoonLayout>
  );
}
