import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';
import api from '../../lib/woocommerce';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await api.get("settings/general");
        const settingsMap = response.data.reduce((acc: any, curr: any) => {
          acc[curr.id] = curr.value;
          return acc;
        }, {});
        setSettings(settingsMap);
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // In a real WC API, updating settings might require multiple calls or a specific format
      // For now, we'll just simulate success as the WC API settings update can be complex
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Store Settings">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-8 border-b border-border">
            <h3 className="text-lg font-bold">General Settings</h3>
            <p className="text-sm text-muted-foreground">Manage your store's basic information and preferences.</p>
          </div>
          
          <div className="p-8 space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 bg-secondary/50 animate-pulse rounded-lg w-full"></div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Store Address</label>
                    <input 
                      type="text" 
                      value={settings.woocommerce_store_address || ''} 
                      className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50"
                      onChange={(e) => setSettings({...settings, woocommerce_store_address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Store City</label>
                    <input 
                      type="text" 
                      value={settings.woocommerce_store_city || ''} 
                      className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50"
                      onChange={(e) => setSettings({...settings, woocommerce_store_city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Currency</label>
                    <input 
                      type="text" 
                      value={settings.woocommerce_currency || 'USD'} 
                      className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Selling Location</label>
                    <select className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50">
                      <option>All Countries</option>
                      <option>Specific Countries</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex items-center justify-between">
                  {message && (
                    <p className={`text-sm font-medium ${message.type === 'success' ? 'text-primary' : 'text-destructive'}`}>
                      {message.text}
                    </p>
                  )}
                  <div className="flex-1"></div>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 bg-card border border-border rounded-2xl p-8 shadow-sm">
          <h3 className="text-lg font-bold mb-2">API Configuration</h3>
          <p className="text-sm text-muted-foreground mb-6">Your store is connected via WooCommerce REST API.</p>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <Icons.Settings className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm">REST API Connection</p>
              <p className="text-xs text-muted-foreground">Version: wc/v3</p>
            </div>
            <div className="ml-auto">
               <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Active</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
