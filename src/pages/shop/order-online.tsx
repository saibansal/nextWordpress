import React, { useEffect, useState } from 'react';
import SakoonLayout from '../../components/frontend/sakoon/SakoonLayout';
import ProductList from '../../components/frontend/sakoon/ProductList';

export default function SakoonOrderOnline() {
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    fetch('/api/wp/pages?slug=order-online')
      .then(res => res.json())
      .then(data => {
        if (data?.length > 0) setPage(data[0]);
      })
      .catch(console.error);
  }, []);

  const title = page?.title?.rendered || "ORDER ONLINE";

  return (
    <SakoonLayout title={page?.title?.rendered || "Order Online"}>
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-[#1B1B1B]">
        <img
          src="https://sakoon.vismaad.com/wp-content/uploads/2026/03/3.webp"
          alt="Sakoon Delivery"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-4">
           <h1 className="text-4xl md:text-6xl font-rubik font-black uppercase tracking-widest drop-shadow-2xl mb-4">
             {title}
           </h1>
           <p className="mt-8 text-sm md:text-xl font-black tracking-[0.5em] uppercase text-[#F2002D]">Fast & Fresh to Your Doorstep</p>
        </div>
      </section>

      <section className="py-32 px-6 md:px-16 max-w-7xl mx-auto text-center font-montserrat">
        {page?.content?.rendered ? (
           <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} className="mb-24 mx-auto" />
        ) : (
          <>
            <h3 className="text-4xl md:text-5xl font-rubik font-black mb-12 uppercase tracking-tight">Direct to Your Doorstep</h3>
            <p className="text-lg md:text-xl text-gray-500 max-w-4xl mx-auto mb-24 leading-[2] font-medium italic">
                "Savor the flavors of Sakoon from the comfort of your own home. Our online ordering system ensures that your order is routed to the closest Sakoon kitchen for the freshest experience."
            </p>
          </>
        )}

        <ProductList />
      </section>
    </SakoonLayout>
  );
}
