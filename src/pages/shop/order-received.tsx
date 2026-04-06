import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SakoonLayout from '../../components/frontend/sakoon/SakoonLayout';
import { Icons } from '../../components/Icons';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  total: string;
  meta_data: Array<{ key: string; value: string }>;
}

interface OrderInfo {
  id: number;
  status: string;
  total: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  payment_method_title: string;
  line_items: OrderItem[];
}

export default function OrderReceivedPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!id) return;

    const orderId = Array.isArray(id) ? id[0] : id;

    // Handle local testing fallback if WooCommerce API wasn't connected yet
    if (orderId === 'simulated-order') {
      setOrder({
        id: 9999,
        status: 'processing',
        total: '0.00',
        billing: { first_name: 'Test', last_name: 'User', email: '', phone: '', address_1: '', city: '', state: '', postcode: '', country: '' },
        payment_method_title: 'Simulated Gateway',
        line_items: []
      });
      setLoading(false);
      return;
    }

    // Fetch real order data from WooCommerce via your proxy API
    fetch(`/api/wc/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch order');
        return res.json();
      })
      .then((data: OrderInfo) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Order Fetch Error:', err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!loading && order) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/shop/banquet'); // Automatically redirects to banquet page
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, order, router]);

  if (loading) {
    return (
      <SakoonLayout title="Loading Order...">
        <div className="py-32 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-[#F2002D] rounded-full animate-spin"></div>
        </div>
      </SakoonLayout>
    );
  }

  if (!order) {
    return (
      <SakoonLayout title="Order Not Found">
        <div className="py-32 text-center">
          <h1 className="text-3xl font-black mb-4 text-[#1B1B1B]">Order Not Found</h1>
          <p className="text-gray-500 mb-8">We could not find the details for this order.</p>
          <button onClick={() => router.push('/shop')} className="bg-[#F2002D] text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-black transition-all">Return to Shop</button>
        </div>
      </SakoonLayout>
    );
  }

  return (
    <SakoonLayout title="Order Received">
      <div className="py-24 px-6 md:px-16 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-rubik font-black text-[#1B1B1B] mb-4">Thank You!</h1>
          <p className="text-xl text-gray-600 mb-6">Your order has been received successfully.</p>
          <p className="text-sm font-bold text-[#F2002D] bg-[#F2002D]/10 inline-block px-6 py-3 rounded-full animate-pulse">
            Redirecting to Banquets in {countdown} seconds...
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between mb-8 pb-8 border-b border-gray-100">
            <div><p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Order Number</p><p className="text-xl font-black text-[#1B1B1B]">#{order.id}</p></div>
            <div className="mt-4 md:mt-0"><p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Date</p><p className="text-base font-bold text-[#1B1B1B]">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
            <div className="mt-4 md:mt-0"><p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total</p><p className="text-base font-bold text-[#F2002D]">${order.total}</p></div>
            <div className="mt-4 md:mt-0"><p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Payment Method</p><p className="text-base font-bold text-[#1B1B1B]">{order.payment_method_title || 'Paid'}</p></div>
          </div>

          <h2 className="text-2xl font-rubik font-black text-[#1B1B1B] mb-6">Order Invoice</h2>
          <div className="space-y-4 mb-8 pb-8 border-b border-gray-100">
            {order.line_items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm items-start">
                <div className="flex-1 pr-4">
                  <span className="font-bold text-gray-800">{item.name}</span><span className="text-gray-400 font-bold ml-2">x {item.quantity}</span>
                  {item.meta_data && item.meta_data.length > 0 && <div className="mt-1 space-y-1">{item.meta_data.map(meta => (<p key={meta.key} className="text-xs text-gray-500">- {meta.value}</p>))}</div>}
                </div>
                <span className="font-bold text-[#1B1B1B]">${item.total}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-2xl font-black text-[#1B1B1B]">
            <span>Grand Total</span>
            <span>${order.total}</span>
          </div>
        </div>
      </div>
    </SakoonLayout>
  );
}