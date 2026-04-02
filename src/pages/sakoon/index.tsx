import React from 'react';
import SakoonLayout from '../../components/frontend/sakoon/SakoonLayout';

export default function SakoonHome() {
  return (
    <SakoonLayout title="Celebrating Indian Flavours">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://sakoon.vismaad.com/wp-content/uploads/2026/03/fremont.webp"
          alt="Sakoon Storefront"
          className="absolute inset-0 w-full h-full object-cover brightness-90 transition-transform duration-[10s] hover:scale-110"
        />

        {/* <div className="relative z-10 text-center text-white px-4 mt-20">
          <h1 className="text-4xl md:text-7xl font-rubik font-black tracking-tight drop-shadow-2xl">
            CELEBRATING<br />INDIAN FLAVOURS
          </h1>
        </div> */}
      </section>

      {/* Welcome Section */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto text-center">
        <div className="mb-20">
          <p className="text-lg md:text-2xl text-[#1b1b1b] font-medium leading-[1.6] max-w-5xl mx-auto mb-12">
            Sakoon invites you on a culinary journey that transcends borders and awakens your senses. Step into a world of opulence and flavor, where timeless traditions of Indian cuisine blend seamlessly with contemporary elegance at four locations in the Bay Area.
          </p>
          <div className="w-20 h-0.5 bg-[#F2002D] mx-auto mb-16"></div>

          <div className="relative rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] mb-24 group">
            <img
              src="https://sakoon.vismaad.com/wp-content/uploads/2026/03/3.webp"
              alt="Sakoon Banquet"
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <p className="text-lg md:text-xl text-gray-600 leading-[1.8] max-w-4xl mx-auto">
            At Sakoon, we have mastered the art of Indian fine dining, curating a menu that showcases the finest culinary treasures from across the subcontinent. Each dish is a symphony of flavors, meticulously prepared by our skilled chefs, using the freshest locally sourced produce and the exotic spices from India.
          </p>
        </div>
      </section>
    </SakoonLayout>
  );
}
