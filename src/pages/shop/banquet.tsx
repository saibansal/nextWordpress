import React, { useEffect, useState } from 'react';
import SakoonLayout from '../../components/frontend/sakoon/SakoonLayout';
import ProductList from '../../components/frontend/sakoon/ProductList';

export default function SakoonBanquet() {
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    fetch('/api/wp/pages?slug=banquet')
      .then(res => res.json())
      .then(data => {
        if (data?.length > 0) setPage(data[0]);
      })
      .catch(console.error);
  }, []);

  const title = page?.title?.rendered || "BANQUET";

  return (
    <SakoonLayout title={page?.title?.rendered || "Banquet Services"}>
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-[#1B1B1B]">
        <img
          src="https://sakoon.vismaad.com/wp-content/uploads/2026/03/3.webp"
          alt="Sakoon Banquet"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-8xl font-rubik font-black uppercase tracking-[0.2em] mb-4">
            {title}
          </h1>
          <p className="mt-8 text-sm md:text-xl font-black tracking-[0.5em] uppercase text-[#F2002D]">Grand Celebrations Redefined</p>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto text-center font-montserrat">
        {page?.content?.rendered && (
          <div className="mb-24 text-left" dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
        )}
        <div className="text-left">
          <h2 className="text-[#F2002D] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Event Packages</h2>
          <h3 className="text-4xl font-rubik font-black text-[#1B1B1B]">Crafted for Perfection</h3>
          <ProductList categorySlug="banquet" />
        </div>
      </section>
    </SakoonLayout>
  );
}