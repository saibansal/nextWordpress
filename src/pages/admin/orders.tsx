import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';
// import api from '../../lib/woocommerce';

const getStatusColor = (status: string) => {
  const statusMap: { [key: string]: string } = {
    completed: 'status-completed',
    processing: 'status-processing',
    pending: 'status-pending',
    'on-hold': 'status-on-hold',
    cancelled: 'status-cancelled',
    refunded: 'status-refunded',
    failed: 'status-failed',
    draft: 'status-draft',
  };
  return statusMap[status?.toLowerCase() || ''] || 'status-default';
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  // State for Status Change Modal
  const [statusModalOrder, setStatusModalOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setShowModal(false);
  };

  const handleEditStatus = (order: any) => {
    setStatusModalOrder(order);
    setNewStatus(order.status);
  };

  const closeStatusModal = () => {
    setStatusModalOrder(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    if (!statusModalOrder) return;
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/wc/orders/${statusModalOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        let errorMessage = "Failed to update status";
        try {
          const errorData = await response.json();
          if (errorData.message) errorMessage = errorData.message;
        } catch (e) {}
        alert(errorMessage);
        setUpdatingStatus(false);
        return;
      }
      
      setOrders(orders.map((o) => o.id === statusModalOrder.id ? { ...o, status: newStatus } : o));
      
      closeStatusModal();
    } catch (err: any) {
      alert(err.message || "Failed to update order status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("/api/wc/orders?per_page=20");
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data);
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders. Please check your API credentials.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);


  return (
    <AdminLayout title="Order Management">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Icons.Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders..."
              className="bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-80 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
            Filter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
          <p className="mt-4 text-sm opacity-80">Make sure you have set up your .env.local file with valid WooCommerce API credentials.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-primary">#{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{order.billing.first_name} {order.billing.last_name}</span>
                      <span className="text-xs text-muted-foreground">{order.billing.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                    {new Date(order.date_created).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {order.currency_symbol}{order.total}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button id={`order-setting-icon-${order.id}`} onClick={() => handleViewOrder(order)} className="text-muted-foreground hover:text-primary p-2 transition-colors rounded-lg hover:bg-primary/10 inline-block cursor-pointer" title="View Order Details">
                        <Icons.Settings className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEditStatus(order)} className="text-muted-foreground hover:text-primary p-2 transition-colors rounded-lg hover:bg-primary/10 inline-block cursor-pointer" title="Change Status">
                        <Icons.Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              No orders found.
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-background rounded-3xl border border-border shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-border flex items-center justify-between bg-secondary/20">
              <div>
                <h3 className="text-xl font-bold">Order #{selectedOrder.id} Details</h3>
                <div className="mt-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              <button onClick={closeModal} className="hover:rotate-90 transition-transform p-2 bg-background rounded-full shadow-sm">
                <Icons.X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-8 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Billing Details</h4>
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-2">
                    <p className="font-bold text-sm">{selectedOrder.billing?.first_name} {selectedOrder.billing?.last_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.billing?.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.billing?.phone}</p>
                    <div className="pt-2 text-sm text-muted-foreground">
                      <p>{selectedOrder.billing?.address_1}</p>
                      {selectedOrder.billing?.address_2 && <p>{selectedOrder.billing?.address_2}</p>}
                      <p>{selectedOrder.billing?.city}, {selectedOrder.billing?.state} {selectedOrder.billing?.postcode}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Order Summary</h4>
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date Placed:</span>
                      <span className="font-medium">{new Date(selectedOrder.date_created).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium">{selectedOrder.payment_method_title || 'N/A'}</span>
                    </div>
                    <div className="pt-4 border-t border-border flex justify-between items-center">
                      <span className="font-bold">Total Amount:</span>
                      <span className="text-lg font-black text-primary">{selectedOrder.currency_symbol}{selectedOrder.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Line Items</h4>
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/30 border-b border-border">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-muted-foreground">Product Name</th>
                        <th className="px-6 py-3 font-semibold text-muted-foreground text-center">Qty</th>
                        <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedOrder.line_items?.map((item: any) => (
                        <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground">{item.name}</td>
                          <td className="px-6 py-4 text-center text-muted-foreground">{item.quantity}</td>
                          <td className="px-6 py-4 text-right font-bold text-foreground">{selectedOrder.currency_symbol}{item.total}</td>
                        </tr>
                      ))}
                      {(!selectedOrder.line_items || selectedOrder.line_items.length === 0) && (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground italic">No items found in this order.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-background rounded-3xl border border-border shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
              <h3 className="text-lg font-bold">Update Order Status</h3>
              <button onClick={closeStatusModal} className="hover:rotate-90 transition-transform p-2 bg-background rounded-full shadow-sm">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold"
                >
                  <option value="pending">Pending Payment</option>
                  <option value="processing">Processing</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refund</option>
                  <option value="failed">Failed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={closeStatusModal} className="flex-1 bg-secondary text-foreground py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">Cancel</button>
                <button onClick={handleUpdateStatus} disabled={updatingStatus || newStatus === statusModalOrder.status} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                  {updatingStatus ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .status-completed { background-color: rgba(16, 185, 129, 0.1); color: #059669; }
        .status-processing { background-color: rgba(59, 130, 246, 0.1); color: #2563eb; }
        .status-pending { background-color: rgba(245, 158, 11, 0.1); color: #d97706; }
        .status-on-hold { background-color: rgba(249, 115, 22, 0.1); color: #ea580c; }
        .status-cancelled { background-color: rgba(100, 116, 139, 0.1); color: #475569; }
        .status-refunded { background-color: rgba(6, 182, 212, 0.1); color: #0891b2; }
        .status-failed { background-color: rgba(239, 68, 68, 0.1); color: #dc2626; }
        .status-draft { background-color: rgba(107, 114, 128, 0.1); color: #4b5563; }
        .status-default { background-color: rgba(156, 163, 175, 0.1); color: #6b7280; }
        
        @media (prefers-color-scheme: dark) {
          .status-completed { color: #34d399; }
          .status-processing { color: #60a5fa; }
          .status-pending { color: #fbbf24; }
          .status-on-hold { color: #fb923c; }
          .status-cancelled { color: #94a3b8; }
          .status-refunded { color: #22d3ee; }
          .status-failed { color: #f87171; }
          .status-draft { color: #9ca3af; }
          .status-default { color: #9ca3af; }
        }
      `}</style>
    </AdminLayout>
  );
}
