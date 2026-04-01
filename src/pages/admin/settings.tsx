import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';

interface Setting {
  id: string;
  label: string;
  description: string;
  type: string;
  value: any;
  options?: any;
  tip?: string;
}

export default function AdminSettings() {
  const [activeGroup, setActiveGroup] = useState('general');
  const [activeSubTab, setActiveSubTab] = useState('shipping-zones');
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [shippingZones, setShippingZones] = useState<any[]>([]);
  const [paymentGateways, setPaymentGateways] = useState<any[]>([]);
  const [activePaymentSubTab, setActivePaymentSubTab] = useState('gateways'); // 'gateways', 'checkout', 'gateway-settings'
  const [activeGateway, setActiveGateway] = useState<any>(null);
  const [gatewaySettings, setGatewaySettings] = useState<any[]>([]);

  // Add Zone Modal State
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [addingZone, setAddingZone] = useState(false);


  const groups = [
    { id: 'general', label: 'General', icon: <Icons.Settings className="w-4 h-4" /> },
    { id: 'products', label: 'Products', icon: <Icons.Package className="w-4 h-4" /> },
    { id: 'tax', label: 'Tax', icon: <Icons.Tag className="w-4 h-4" /> },
    { id: 'shipping', label: 'Shipping', icon: <Icons.ShoppingCart className="w-4 h-4" /> },
    { id: 'account', label: 'Accounts & Privacy', icon: <Icons.Users className="w-4 h-4" /> },
    { id: 'checkout', label: 'Payments', icon: <Icons.CreditCard className="w-4 h-4" /> },
    { id: 'email', label: 'Emails', icon: <Icons.MessageSquare className="w-4 h-4" /> },

  ];

  useEffect(() => {
    if (activeGroup === 'shipping') {
      if (activeSubTab === 'shipping-zones') fetchShippingZones();
      else fetchGroupSettings(activeGroup);
    } else if (activeGroup === 'checkout') {
      if (activePaymentSubTab === 'gateways') fetchPaymentGateways();
      else if (activePaymentSubTab === 'gateway-settings' && activeGateway) fetchGatewaySettings(activeGateway.id);
      else fetchCheckoutSettingsUI();
    } else {
      fetchGroupSettings(activeGroup);
    }
  }, [activeGroup, activeSubTab, activePaymentSubTab, activeGateway]);

  const fetchPaymentGateways = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/wc/payment_gateways');
      if (res.ok) setPaymentGateways(await res.json());
      else throw new Error('Failed to load gateways');
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error loading payment methods.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckoutSettingsUI = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Fetch from both general and account groups
      const [genRes, accRes] = await Promise.all([
        fetch('/api/wc/settings/general'),
        fetch('/api/wc/settings/account')
      ]);

      if (!genRes.ok || !accRes.ok) throw new Error('Failed to fetch checkout settings');

      const gen = await genRes.json();
      const acc = await accRes.json();

      const allowedIds = [
        'woocommerce_enable_coupons',
        'woocommerce_calc_discounts_sequentially',
        'woocommerce_enable_guest_checkout',
        'woocommerce_enable_checkout_login_reminder',
        'woocommerce_enable_signup_and_login_from_checkout',
        'woocommerce_enable_myaccount_registration',
        'woocommerce_registration_generate_username',
        'woocommerce_registration_generate_password'
      ];

      setSettings([...gen, ...acc].filter(s => allowedIds.includes(s.id)));
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error loading checkout/account settings.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchGatewaySettings = async (id: string) => {

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/wc/payment_gateways/${id}`);
      if (res.ok) {
        const data = await res.json();
        setGatewaySettings(Object.values(data.settings || {}));
      } else {
        throw new Error('Failed to load gateway settings');
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error loading provider settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGatewayInputChange = (id: string, value: any) => {
    setGatewaySettings(prev => prev.map(s => s.id === id ? { ...s, value } : s));
  };

  const saveGatewaySettings = async () => {
    if (!activeGateway) return;
    setSaving(true);
    setMessage(null);
    try {
      const settingsObj = gatewaySettings.reduce((acc, curr) => {
        acc[curr.id] = curr.value;
        return acc;
      }, {} as any);

      const res = await fetch(`/api/wc/payment_gateways/${activeGateway.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsObj, enabled: activeGateway.enabled })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `${activeGateway.title} updated on live store!` });
      } else {
        throw new Error('Failed to update provider');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const fetchShippingZones = async () => {


    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/wc/shipping/zones');
      if (res.ok) setShippingZones(await res.json());
      else throw new Error('Failed to load shipping zones');
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error loading zones.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddZone = async () => {
    if (!newZoneName.trim()) return;
    setAddingZone(true);
    try {
      const res = await fetch('/api/wc/shipping/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newZoneName })
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Shipping zone created successfully!' });
        setShowAddZoneModal(false);
        setNewZoneName('');
        fetchShippingZones();
      } else {
        throw new Error('Failed to create zone');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setAddingZone(false);
    }
  };

  const fetchGroupSettings = async (groupId: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/wc/settings/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else {
        throw new Error('Failed to load settings');
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error loading settings from live store.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (id: string, value: any) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, value } : s));
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);
    try {
      if (activePaymentSubTab === 'checkout-settings') {
        // Identify which belongs to general and which to account
        const generalIds = ['woocommerce_enable_coupons', 'woocommerce_calc_discounts_sequentially'];
        const accountIds = [
          'woocommerce_enable_guest_checkout',
          'woocommerce_enable_checkout_login_reminder',
          'woocommerce_enable_signup_and_login_from_checkout',
          'woocommerce_enable_myaccount_registration',
          'woocommerce_registration_generate_username',
          'woocommerce_registration_generate_password'
        ];

        const genUpdates = settings.filter(s => generalIds.includes(s.id)).map(s => ({ id: s.id, value: s.value }));
        const accUpdates = settings.filter(s => accountIds.includes(s.id)).map(s => ({ id: s.id, value: s.value }));

        const results = await Promise.all([
          genUpdates.length ? fetch(`/api/wc/settings/general/batch`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ update: genUpdates }) }) : Promise.resolve({ ok: true }),
          accUpdates.length ? fetch(`/api/wc/settings/account/batch`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ update: accUpdates }) }) : Promise.resolve({ ok: true })
        ]);

        if (!results.every(r => r.ok)) throw new Error('Failed to update some checkout settings');
        setMessage({ type: 'success', text: 'Checkout settings updated successfully!' });
      } else {
        const updates = settings.map(s => ({ id: s.id, value: s.value }));
        const res = await fetch(`/api/wc/settings/${activeGroup}/batch`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ update: updates })
        });
        if (res.ok) {
          setMessage({ type: 'success', text: 'Settings updated successfully on live store!' });
        } else {
          const data = await res.json();
          throw new Error(data.message || 'Failed to update settings');
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };


  return (
    <AdminLayout title="WooCommerce Settings">
      <div className="bg-white border border-[#dcdcde] rounded-3xl shadow-sm overflow-hidden min-h-[600px] flex flex-col md:flex-row relative">

        {/* Sidebar Nav */}
        <div className="w-full md:w-64 border-r border-[#dcdcde] bg-gray-50/50 flex flex-col">
          <div className="p-6 border-b border-[#dcdcde]"><h2 className="text-sm font-black uppercase tracking-widest text-[#1d2327]">Store Config</h2></div>
          <nav className="flex-1 p-3 space-y-1">
            {groups.map(group => (
              <button key={group.id} onClick={() => setActiveGroup(group.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold ${activeGroup === group.id ? 'bg-[#2271b1] text-white shadow-lg shadow-[#2271b1]/20' : 'text-gray-500 hover:bg-white hover:text-[#2271b1]'}`}>
                {group.icon} {group.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-8 border-b border-[#dcdcde] flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-[#1d2327]">{groups.find(g => g.id === activeGroup)?.label} Settings</h3>
              {activeGroup === 'shipping' && (
                <div className="flex gap-4 mt-2">
                  {[{ id: 'shipping-zones', label: 'Shipping zones' }, { id: 'shipping-settings', label: 'Shipping settings' }, { id: 'classes', label: 'Classes' }, { id: 'local-pickup', label: 'Local pickup' }].map(sub => (
                    <button key={sub.id} onClick={() => setActiveSubTab(sub.id)} className={`text-[11px] font-black uppercase tracking-widest px-2 py-1 rounded transition-colors ${activeSubTab === sub.id ? 'bg-[#2271b1] text-white' : 'text-[#2271b1] hover:bg-[#2271b1]/5'}`}>{sub.label}</button>
                  ))}
                </div>
              )}
              {activeGroup === 'checkout' && (
                <div className="flex gap-4 mt-2">
                  {[
                    { id: 'gateways', label: 'Payment methods' },
                    { id: 'checkout-settings', label: 'Checkout settings' }
                  ].map(sub => (
                    <button key={sub.id} onClick={() => setActivePaymentSubTab(sub.id)} className={`text-[11px] font-black uppercase tracking-widest px-2 py-1 rounded transition-colors ${activePaymentSubTab === sub.id ? 'bg-[#2271b1] text-white' : 'text-[#2271b1] hover:bg-[#2271b1]/5'}`}>{sub.label}</button>
                  ))}
                </div>
              )}
            </div>
            {(activeGroup !== 'shipping' || activeSubTab !== 'shipping-zones') && (activeGroup !== 'checkout' || activePaymentSubTab !== 'gateways') && (
              <button onClick={saveSettings} disabled={saving || loading} className="bg-[#2271b1] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#2271b1]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                {saving ? 'Syncing...' : 'Save Changes'}
              </button>
            )}
          </div>

          <div className="flex-1 p-8 overflow-y-auto max-h-[700px] space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#2271b1]"><Icons.RefreshCW className="w-12 h-12 animate-spin mb-4" /><span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Polling Core Settings...</span></div>
            ) : activeGroup === 'shipping' && activeSubTab === 'shipping-zones' ? (

              <div className="space-y-6">
                <div className="flex items-center justify-between"><h4 className="text-sm font-black uppercase tracking-widest text-gray-400">Manage Shipping Zones</h4><button onClick={() => setShowAddZoneModal(true)} className="text-xs font-bold text-[#2271b1] hover:underline">Add Shipping Zone</button></div>
                <div className="border border-[#dcdcde] rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs bg-white">
                    <thead><tr className="bg-gray-50 border-b border-[#dcdcde] font-black uppercase tracking-widest text-gray-400"><th className="px-6 py-4">Zone Name</th><th className="px-6 py-4">Region(s)</th><th className="px-6 py-4">Shipping Method(s)</th></tr></thead>
                    <tbody className="divide-y divide-[#dcdcde]">
                      {shippingZones.map(zone => (
                        <tr key={zone.id} className="hover:bg-gray-50 group">
                          <td className="px-6 py-4 font-bold text-[#2271b1]">{zone.name}<div className="flex gap-2 text-[9px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity"><button className="text-[#a00]">Delete</button></div></td>
                          <td className="px-6 py-4 font-medium text-gray-500">{zone.regions?.map((r: any) => r.name).join(', ') || 'Global'}</td>
                          <td className="px-6 py-4"><div className="flex gap-2"><span className="bg-gray-100 px-2 py-1 rounded font-bold uppercase text-[9px] text-gray-600">Flat Rate</span></div></td>
                        </tr>
                      ))}
                      {shippingZones.length === 0 && (<tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">No zones configured.</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeGroup === 'checkout' && activePaymentSubTab === 'gateways' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">Payment Methods</h4>
                </div>
                <div className="border border-[#dcdcde] rounded-2xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-[#dcdcde] font-black uppercase tracking-widest text-gray-400">
                        <th className="px-6 py-4">Method</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dcdcde]">
                      {paymentGateways
                        .filter(gateway => {
                          const allowedIds = ['paypal', 'stripe', 'razorpay', 'ccavenue', 'cod', 'bacs'];
                          const allowedTitles = ['paypal', 'stripe', 'razor pay', 'cc avenue', 'cash on delivery', 'bank transfer'];
                          return allowedIds.includes(gateway.id.toLowerCase()) ||
                            allowedTitles.some(t => gateway.title.toLowerCase().includes(t));
                        })
                        .map(gateway => (
                          <tr key={gateway.id} className="hover:bg-gray-50 transition-colors">

                            <td className="px-6 py-5">
                              <div className="font-black text-[#1d2327] mb-1">{gateway.title}</div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{gateway.id}</div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${gateway.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {gateway.enabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-gray-500 font-medium leading-relaxed max-w-xs" dangerouslySetInnerHTML={{ __html: gateway.description }}></td>
                            <td className="px-6 py-5 text-right">
                              <button
                                onClick={() => {
                                  setActiveGateway(gateway);
                                  setActivePaymentSubTab('gateway-settings');
                                }}
                                className="bg-white border border-[#dcdcde] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 hover:border-[#2271b1] hover:text-[#2271b1] transition-all"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeGroup === 'checkout' && activePaymentSubTab === 'gateway-settings' && activeGateway ? (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActivePaymentSubTab('gateways')}
                    className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-[#2271b1]"
                  >
                    <Icons.ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h4 className="text-xl font-black text-[#1d2327]">{activeGateway.title}</h4>
                    <p className="text-xs text-gray-400 font-medium">{activeGateway.method_title || 'Payment Provider Configuration'}</p>
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={saveGatewaySettings}
                      disabled={saving}
                      className="bg-[#2271b1] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#2271b1]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {saving ? 'Syncing...' : 'Save Settings'}
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-[#dcdcde] rounded-3xl p-10 space-y-10 divide-y divide-[#f0f0f1]">
                  <div className="flex items-center justify-between pb-4">
                    <div className="space-y-1">
                      <h5 className="text-sm font-black text-[#1d2327] uppercase tracking-tight">Enable/Disable</h5>
                      <p className="text-xs text-gray-400">Toggle this payment method in the checkout.</p>
                    </div>
                    <button
                      onClick={() => setActiveGateway({ ...activeGateway, enabled: !activeGateway.enabled })}
                      className={`w-14 h-8 rounded-full relative transition-all duration-300 ${activeGateway.enabled ? 'bg-green-500 shadow-lg shadow-green-500/20' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${activeGateway.enabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  {gatewaySettings.map((setting) => (
                    <div key={setting.id} className="pt-10 group">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                          <label className="block text-sm font-black text-[#1d2327] mb-2 uppercase tracking-tight">{setting.label}</label>
                          <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic" dangerouslySetInnerHTML={{ __html: setting.description || 'Global provider setting.' }}></p>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                          {setting.type === 'select' || setting.type === 'singleselect' || setting.type === 'multiselect' ? (
                            <select
                              value={setting.value || ''}
                              onChange={(e) => handleGatewayInputChange(setting.id, e.target.value)}
                              className="w-full bg-[#f6f7f7] border border-[#dcdcde] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#2271b1]/20 focus:border-[#2271b1] transition-all text-sm font-medium"
                            >
                              {Object.entries(setting.options || {}).map(([key, val]: any) => (
                                <option key={key} value={key}>{val}</option>
                              ))}
                            </select>
                          ) : setting.type === 'checkbox' ? (
                            <div className="flex items-center gap-3 py-2">
                              <input
                                type="checkbox"
                                checked={setting.value === 'yes'}
                                onChange={(e) => handleGatewayInputChange(setting.id, e.target.checked ? 'yes' : 'no')}
                                className="w-5 h-5 rounded-md border-[#dcdcde] text-[#2271b1] focus:ring-[#2271b1]"
                              />
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active</span>
                            </div>
                          ) : (
                            <input
                              type={setting.type === 'password' || setting.id.includes('secret') || setting.id.includes('key') ? 'password' : 'text'}
                              value={setting.value || ''}
                              onChange={(e) => handleGatewayInputChange(setting.id, e.target.value)}
                              className="w-full bg-[#f6f7f7] border border-[#dcdcde] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#2271b1]/20 focus:border-[#2271b1] transition-all text-sm font-medium font-mono"
                            />
                          )}
                          {setting.tip && <p className="text-[9px] text-[#2271b1] font-bold uppercase tracking-[0.05em] flex items-center gap-1"><Icons.ArrowUpRight className="w-3 h-3" /> Security Note: {setting.tip}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (


              <div className="space-y-10 divide-y divide-[#f0f0f1]">
                {settings.map((setting) => (
                  <div key={setting.id} className="pt-10 first:pt-0 group"><div className="grid grid-cols-1 md:grid-cols-3 gap-8"><div className="md:col-span-1"><label className="block text-sm font-black text-[#1d2327] mb-2 uppercase tracking-tight">{setting.label}</label><p className="text-xs text-gray-400 font-medium leading-relaxed italic">{setting.description || 'No description provided.'}</p></div><div className="md:col-span-2 space-y-4">{setting.type === 'select' || setting.type === 'singleselect' || setting.type === 'multiselect' ? (<select value={Array.isArray(setting.value) ? setting.value[0] : (setting.value || '')} onChange={(e) => handleInputChange(setting.id, e.target.value)} className="w-full bg-[#f6f7f7] border border-[#dcdcde] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#2271b1]/20 focus:border-[#2271b1] transition-all text-sm font-medium">{Object.entries(setting.options || {}).map(([key, val]: any) => (<option key={key} value={key}>{val}</option>))}</select>) : setting.type === 'checkbox' ? (<div className="flex items-center gap-3 py-2"><input type="checkbox" checked={setting.value === 'yes'} onChange={(e) => handleInputChange(setting.id, e.target.checked ? 'yes' : 'no')} className="w-5 h-5 rounded-md border-[#dcdcde] text-[#2271b1] focus:ring-[#2271b1]" /><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Enable this option</span></div>) : (<input type={setting.type === 'password' ? 'password' : 'text'} value={setting.value || ''} onChange={(e) => handleInputChange(setting.id, e.target.value)} className="w-full bg-[#f6f7f7] border border-[#dcdcde] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#2271b1]/20 focus:border-[#2271b1] transition-all text-sm font-medium" />)}{setting.tip && <p className="text-[10px] text-[#2271b1] font-bold uppercase tracking-[0.05em] flex items-center gap-1"><Icons.ArrowUpRight className="w-3 h-3" /> Tip: {setting.tip}</p>}</div></div></div>
                ))}
              </div>
            )}
          </div>

          {message && (
            <div className={`p-4 mx-8 mb-8 rounded-xl font-bold text-xs uppercase tracking-widest border animate-in slide-in-from-bottom-2 duration-300 flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <div className="flex items-center gap-3">{message.type === 'success' ? <Icons.Check className="w-5 h-5" /> : <Icons.AlertTriangle className="w-5 h-5" />}{message.text}</div>
              <button onClick={() => setMessage(null)} className="opacity-40 hover:opacity-100">×</button>
            </div>
          )}
        </div>

        {/* Add Zone Modal */}
        {showAddZoneModal && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white border border-[#dcdcde] rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-300">
              <h3 className="text-xl font-black text-[#1d2327] mb-2">New Shipping Zone</h3>
              <p className="text-xs text-gray-400 font-medium mb-6">Create a new region to apply specific shipping methods and rates.</p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Zone Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Domestic, International"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    className="w-full bg-[#f6f7f7] border border-[#dcdcde] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#2271b1]/20 focus:border-[#2271b1] transition-all text-sm font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddZoneModal(false)}
                  className="flex-1 px-6 py-3 rounded-2xl border border-[#dcdcde] text-gray-500 font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddZone}
                  disabled={addingZone || !newZoneName.trim()}
                  className="flex-1 px-6 py-3 rounded-2xl bg-[#2271b1] text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#2271b1]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {addingZone ? 'Creating...' : 'Create Zone'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
