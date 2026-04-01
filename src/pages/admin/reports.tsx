import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Icons } from '../../components/Icons';

export default function AdminReports() {
    const [loading, setLoading] = useState(true);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [topSellers, setTopSellers] = useState<any[]>([]);
    const [stats, setStats] = useState({
        total_sales: '0',
        net_sales: '0',
        orders_count: 0,
        total_customers: 0
    });
    const [activeReport, setActiveReport] = useState<'sales' | 'products' | 'customers'>('sales');

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const [salesRes, sellersRes, customerRes] = await Promise.all([
                    fetch("/api/wc/reports/sales?period=year"),
                    fetch("/api/wc/reports/top_sellers?period=month"),
                    fetch("/api/wc/customers?per_page=1")
                ]);


                if (salesRes.ok) {
                    const data = await salesRes.json();
                    setSalesData(data);
                    // Summarize all year sales for quick stats
                    const totals = data.reduce((acc: any, curr: any) => ({
                        total_sales: (parseFloat(acc.total_sales) + parseFloat(curr.total_sales)).toFixed(2),
                        net_sales: (parseFloat(acc.net_sales) + parseFloat(curr.net_sales)).toFixed(2),
                        orders_count: acc.orders_count + curr.orders_count
                    }), { total_sales: '0', net_sales: '0', orders_count: 0 });
                    setStats(prev => ({ ...prev, ...totals }));
                }

                if (sellersRes.ok) setTopSellers(await sellersRes.json());
                
                const totalCustomers = customerRes.headers.get('x-wp-total') || '0';
                setStats(prev => ({ ...prev, total_customers: parseInt(totalCustomers) || 0 }));
            } catch (err) {
                console.error("Failed to fetch reports:", err);
            } finally {
                setLoading(false);
            }

        };

        fetchReports();
    }, []);

    const tabs = [
        { id: 'sales', label: 'Sales by Date', icon: <Icons.BarChart className="w-4 h-4" /> },
        { id: 'products', label: 'Sales by Product', icon: <Icons.Package className="w-4 h-4" /> },
        { id: 'customers', label: 'Customer Statistics', icon: <Icons.Users className="w-4 h-4" /> }
    ];

    return (
        <AdminLayout title="WooCommerce Reports">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-normal text-[#1d2327]">Reports Overview</h2>
            </div>

            <div className="bg-white border border-[#dcdcde] rounded-2xl shadow-sm overflow-hidden mb-8">
                {/* Tabs */}
                <div className="flex border-b border-[#dcdcde] bg-gray-50/50">
                    {tabs.map((tab: any) => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveReport(tab.id)}
                            className={`px-8 py-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-r border-[#dcdcde] transition-all ${activeReport === tab.id ? 'bg-white text-[#2271b1] border-b-2 border-b-[#2271b1]' : 'text-gray-400 font-bold hover:bg-white'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 text-[#2271b1]">
                            <Icons.RefreshCW className="w-12 h-12 animate-spin mb-4" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Calculating Aggregated Data...</span>
                        </div>
                    ) : (
                        <>
                        {activeReport === 'sales' && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                {/* Summary Grid */}
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#2271b1] mb-2">Yearly Gross Sales</p>
                                        <h3 className="text-3xl font-black text-[#1d2327]">${stats.total_sales}</h3>
                                    </div>
                                    <div className="p-6 bg-purple-50/50 border border-purple-100 rounded-2xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-2">Yearly Net Sales</p>
                                        <h3 className="text-3xl font-black text-[#1d2327]">${stats.net_sales}</h3>
                                    </div>
                                    <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-2xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Total Orders</p>
                                        <h3 className="text-3xl font-black text-[#1d2327]">{stats.orders_count}</h3>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="bg-white border border-[#dcdcde] rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-[#dcdcde] text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                <th className="px-6 py-4">Day / Period</th>
                                                <th className="px-6 py-4">Gross Sales</th>
                                                <th className="px-6 py-4">Net Sales</th>
                                                <th className="px-6 py-4">Orders</th>
                                                <th className="px-6 py-4">Items Sold</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#dcdcde]">
                                            {salesData.map((day, i) => (
                                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-[#1d2327]">{day.title}</td>
                                                    <td className="px-6 py-4 font-black">${day.total_sales}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-500">${day.net_sales}</td>
                                                    <td className="px-6 py-4">{day.orders_count}</td>
                                                    <td className="px-6 py-4">{day.items_sold}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeReport === 'products' && (
                            <div className="animate-in fade-in duration-500 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Best Performing Products</h3>
                                    <div className="space-y-4">
                                        {topSellers.map((item, i) => (
                                            <div key={i} className="flex items-center gap-6 p-5 bg-white border border-[#dcdcde] rounded-2xl hover:border-[#2271b1] transition-all group">
                                                <div className="w-12 h-12 bg-[#2271b1]/5 text-[#2271b1] flex items-center justify-center font-black text-xl rounded-xl border border-[#2271b1]/20">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-[#1d2327] mb-1">{item.title}</h4>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#2271b1]">{item.quantity} Units Sold</p>
                                                </div>
                                                <Icons.ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-40 transition-opacity" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-[#2271b1]/5 border border-[#2271b1]/20 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                                    <Icons.BarChart className="w-20 h-20 text-[#2271b1] opacity-20 mb-6" />
                                    <h3 className="text-xl font-black text-[#2271b1] mb-2 uppercase tracking-tighter">Inventory Insights</h3>
                                    <p className="text-xs font-bold text-[#1d2327]/60 leading-relaxed">
                                        Based on your current sales, these {topSellers.length} products account for the majority of your store revenue this month.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeReport === 'customers' && (
                            <div className="py-24 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                                 <Icons.Users className="w-24 h-24 text-[#2271b1] opacity-10 mb-8" />
                                 <h3 className="text-2xl font-black text-[#1d2327] mb-4">Customer Base Growth</h3>
                                 <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8">
                                     You have {stats.total_customers || '...loading'} total registered customers in your database. 
                                     The average lifecycle of a customer on your store is currently being calculated across the live server.
                                 </p>
                                 <div className="px-10 py-4 bg-[#2271b1] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#2271b1]/20">
                                     Analyze Retention
                                 </div>
                            </div>
                        )}
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
