import React from 'react';
import SakoonLayout from '../../components/frontend/sakoon/SakoonLayout';

export default function About() {
  return (
    <SakoonLayout title="About Us">
      {/* Hero Banner Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://sakoon.vismaad.com/wp-content/uploads/2026/03/fremont.webp"
          alt="About Us"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.6] transition-transform duration-[10s] hover:scale-105"
        />
        <div className="relative z-10 text-center text-white px-4 mt-16">
          <h1 className="text-5xl md:text-7xl font-rubik font-black uppercase tracking-widest drop-shadow-2xl mb-6">About Sakoon</h1>
          <div className="w-20 h-1 bg-[#F2002D] mx-auto mb-8"></div>
        </div>
      </section>

      <div className="py-24 px-6 md:px-16 max-w-4xl mx-auto text-center">
        <div className="bg-gray-50/50 p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Sakoon invites you on a culinary journey that transcends borders and awakens your senses. 
            Step into a world of opulence and flavor, where timeless traditions of Indian cuisine blend 
            seamlessly with contemporary elegance.
          </p>
          <p className="text-lg text-gray-500 leading-relaxed">
            At Sakoon, we have mastered the art of Indian fine dining, curating a menu that showcases the finest 
            culinary treasures from across the subcontinent. Each dish is a symphony of flavors, meticulously 
            prepared by our skilled chefs, using the freshest locally sourced produce and exotic spices.
          </p>
        </div>
      </div>
    </SakoonLayout>
  );
}