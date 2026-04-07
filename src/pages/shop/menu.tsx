import React, { useEffect, useState } from 'react';
import SakoonLayout from '../../components/frontend/sakoon/SakoonLayout';
import ProductList from '../../components/frontend/sakoon/ProductList';

export default function ShopMenu() {
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    fetch('/api/wp/pages?slug=menu')
      .then(res => res.json())
      .then(data => {
        if (data?.length > 0) setPage(data[0]);
      })
      .catch(console.error);
  }, []);

  const title = page?.title?.rendered || "Our Menu";

  return (
    <SakoonLayout title={page?.title?.rendered || "Our Menu"}>
      {/* Hero Banner Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://sakoon.vismaad.com/wp-content/uploads/2026/03/fremont.webp"
          alt={title}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.6] transition-transform duration-[10s] hover:scale-105"
        />
        <div className="relative z-10 text-center text-white px-4 mt-16">
          <h1 className="text-5xl md:text-7xl font-rubik font-black uppercase tracking-widest drop-shadow-2xl mb-6">{title}</h1>
          <div className="w-20 h-1 bg-[#F2002D] mx-auto mb-8"></div>
          {page?.content?.rendered ? (
            <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} className="text-lg md:text-xl font-medium tracking-widest max-w-2xl mx-auto drop-shadow-md" />
          ) : (
            <p className="text-lg md:text-xl font-medium tracking-widest max-w-2xl mx-auto drop-shadow-md">
              Explore our authentic Indian cuisine crafted with the finest ingredients.
            </p>
          )}
        </div>
      </section>

      <div className="py-24 max-w-7xl mx-auto">
        <ProductList />
      </div>
    </SakoonLayout>
  );
}