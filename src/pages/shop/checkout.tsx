import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SakoonLayout from '../../components/frontend/sakoon/SakoonLayout';
import { Icons } from '../../components/Icons';

interface CartItem {
  cartItemId?: string;
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
  addons?: any[];
}

interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });
  const [selectedGateway, setSelectedGateway] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    const savedCart = localStorage.getItem('sakoon_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart) as CartItem[];
        if (parsed.length === 0) {
          router.push('/shop/cart');
        } else {
          setCartItems(parsed);
        }
      } catch (e) {
        router.push('/shop/cart');
      }
    } else {
      router.push('/shop/cart');
    }

    // Fetch payment gateways from your WC settings
    fetch('/api/wc/payment_gateways')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load gateways');
        return res.json();
      })
      .then((data: PaymentGateway[]) => {
        const active = data.filter((g) => g.enabled);
        setGateways(active);
        if (active.length > 0) {
          setSelectedGateway(active[0].id);
        }
        setLoadingGateways(false);
      })
      .catch((err) => {
        console.error('Failed to load gateways', err);
        setLoadingGateways(false);
        // Fallback for development if API fails
        const fallbackGateways = [
          { id: 'cod', title: 'Cash on Delivery', description: 'Pay with cash upon delivery.', enabled: true },
        ];
        setGateways(fallbackGateways);
        setSelectedGateway('cod');
      });
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.price?.replace(/[^0-9.]/g, '')) || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacingOrder(true);
    setError(null);

    // Construct the WooCommerce REST API standard Order Payload
    const orderPayload = {
      payment_method: selectedGateway,
      payment_method_title: gateways.find((g) => g.id === selectedGateway)?.title || '',
      set_paid: false,
      billing: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        state: formData.state,
        postcode: formData.zip,
        country: formData.country,
        email: formData.email,
        phone: formData.phone,
      },
      shipping: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        state: formData.state,
        postcode: formData.zip,
        country: formData.country,
      },
      line_items: cartItems.map((item) => {
        const itemPrice = Number(item.price?.replace(/[^0-9.]/g, '')) || 0;
        const lineTotal = String(itemPrice * item.quantity);
        return {
          product_id: item.id,
          quantity: item.quantity,
          subtotal: lineTotal,
          total: lineTotal,
          meta_data: item.addons?.map((addon: any) => ({
            key: addon.groupName || 'Addon',
            value: `${addon.itemName} (+$${addon.cost || '0.00'})`
          })) || []
        };
      }),
    };

    try {
      const response = await fetch('/api/wc/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      // Allow UI bypass if API route doesn't exist yet during development
      if (response.status === 404) {
        console.warn('Orders API missing. Simulating success.');
        localStorage.removeItem('sakoon_cart');
        window.dispatchEvent(new Event('cart_updated'));
        router.push('/shop/order-received?id=simulated-order');
        return;
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create order. Please try again.');
      }

      const result = await response.json();

      // Clear cart & sync cross-tab event on success
      localStorage.removeItem('sakoon_cart');
      window.dispatchEvent(new Event('cart_updated'));

      router.push(`/shop/order-received?id=${result.id}`);
    } catch (err: any) {
      setError(err.message);
      setPlacingOrder(false);
    }
  };

  if (!mounted || cartItems.length === 0) return null;

  const inputClass = "w-full bg-[#f8f8f8] border border-[#E5E7EB] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#F2002D]/20 focus:border-[#F2002D] transition-all text-sm font-medium";
  const labelClass = "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2";

  return (
    <SakoonLayout title="Checkout">
      <div className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-rubik font-black text-[#1B1B1B] mb-12">Checkout</h1>
        
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Billing Details - Left Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-sm">
              <h2 className="text-2xl font-rubik font-black text-[#1B1B1B] mb-8">Billing Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>First Name *</label>
                  <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Last Name *</label>
                  <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Email Address *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Phone *</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Street Address *</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="House number and street name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>City *</label>
                  <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>State / Province *</label>
                  <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>ZIP / Postal Code *</label>
                  <input required type="text" name="zip" value={formData.zip} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Country *</label>
                  <select required name="country" value={formData.country} onChange={handleInputChange} className={inputClass}>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="IN">India</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary & Payment - Right Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-sm sticky top-24">
              <h2 className="text-2xl font-rubik font-black text-[#1B1B1B] mb-6">Your Order</h2>
              
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                {cartItems.map((item) => (
                  <div key={item.cartItemId || item.id} className="flex justify-between items-start text-sm">
                    <span className="text-gray-600 flex-1 pr-4">{item.name} <span className="text-gray-400 font-bold ml-1">x {item.quantity}</span></span>
                    <span className="font-bold text-[#1B1B1B]">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center text-xl font-black text-[#1B1B1B] mb-8">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>

              <h3 className="text-lg font-rubik font-black text-[#1B1B1B] mb-4">Payment Method</h3>
              {loadingGateways ? (
                <div className="text-sm text-gray-500 mb-8 flex items-center gap-2"><Icons.RefreshCW className="w-4 h-4 animate-spin"/> Loading methods...</div>
              ) : (
                <div className="space-y-3 mb-8">
                  {gateways.map((gateway) => (
                    <label key={gateway.id} className={`block p-4 rounded-2xl border cursor-pointer transition-colors ${selectedGateway === gateway.id ? 'border-[#F2002D] bg-[#F2002D]/5' : 'border-[#E5E7EB] hover:border-gray-300'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="payment_method" value={gateway.id} checked={selectedGateway === gateway.id} onChange={() => setSelectedGateway(gateway.id)} className="w-4 h-4 text-[#F2002D] focus:ring-[#F2002D] accent-[#F2002D]" />
                        <span className="font-bold text-sm text-[#1B1B1B]">{gateway.title}</span>
                      </div>
                      {selectedGateway === gateway.id && gateway.description && (
                        <p className="mt-3 text-xs text-gray-500 pl-7 leading-relaxed" dangerouslySetInnerHTML={{ __html: gateway.description }}></p>
                      )}
                    </label>
                  ))}
                </div>
              )}

              {error && <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-widest">{error}</div>}

              <button type="submit" disabled={placingOrder || gateways.length === 0} className="w-full bg-[#F2002D] text-white py-4 rounded-full text-[13px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-[#F2002D]/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
                {placingOrder ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </SakoonLayout>
  );
}