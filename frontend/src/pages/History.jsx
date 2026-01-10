import React, { useEffect, useState } from 'react';
import api from '../api';
import { Eye, Smartphone, Search, FileText, Calendar, User, DollarSign, X, Filter } from 'lucide-react';

const History = () => {
    const [invoices, setInvoices] = useState([]);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await api.get('/invoices/');
                setInvoices(res.data);
            } catch (e) {
                console.error("Failed to fetch invoices", e);
            }
        };
        fetchInvoices();
    }, []);

    const shareWhatsApp = (invoice, e) => {
        e.stopPropagation();
        const message = `*Invoice #${invoice.invoice_number}*\nDate: ${new Date(invoice.created_at).toLocaleDateString()}\nAmount: ₹${invoice.total_amount.toFixed(2)}\n\nThank you for your business!`;
        const url = `https://wa.me/${invoice.customer_phone || ''}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const isDateInRange = (dateStr) => {
        if (!startDate && !endDate) return true;
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (d < start) return false;
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (d > end) return false;
        }
        return true;
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch =
            inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
            (inv.customer_name && inv.customer_name.toLowerCase().includes(search.toLowerCase()));
        const matchesDate = isDateInRange(inv.created_at);
        return matchesSearch && matchesDate;
    });

    // Modal Component
    const InvoiceModal = ({ invoice, onClose }) => {
        if (!invoice) return null;
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <div className="flex flex-col">
                            <h3 className="font-bold text-sm uppercase tracking-wide text-gray-800">Invoice Details</h3>
                            <span className="text-xs text-muted font-mono mt-1">{invoice.invoice_number}</span>
                        </div>
                        <button onClick={onClose} className="action-btn border-none hover:bg-transparent">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="modal-body custom-scrollbar">
                        <div className="flex justify-between items-center mb-6 text-sm border-b border-gray-100 pb-4">
                            <div>
                                <p className="text-muted text-xs uppercase font-bold mb-1">Customer</p>
                                <p className="font-semibold text-gray-800">{invoice.customer_name || "Walk-in Customer"}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-muted text-xs uppercase font-bold mb-1">Date</p>
                                <p className="font-semibold text-gray-800">{new Date(invoice.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="border rounded border-gray-200 overflow-hidden">
                            <table className="w-full text-sm" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left p-3 text-xs font-bold text-muted border-b border-gray-200">Item</th>
                                        <th className="text-center p-3 text-xs font-bold text-muted border-b border-gray-200">Qty</th>
                                        <th className="text-right p-3 text-xs font-bold text-muted border-b border-gray-200">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items && invoice.items.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 last:border-none">
                                            <td className="p-3 text-gray-700 font-medium">{item.item_name}</td>
                                            <td className="p-3 text-center text-muted">{item.quantity}</td>
                                            <td className="p-3 text-right text-gray-800 font-bold">₹{(item.unit_price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {(!invoice.items || invoice.items.length === 0) && (
                                        <tr>
                                            <td colSpan="3" className="p-4 text-center text-muted italic">Items details not available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-muted font-medium text-sm">Total Amount</span>
                            <span className="text-xl font-bold text-indigo-600">₹{invoice.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="btn"
                                style={{ background: '#10b981' }} // Success color directly
                                onClick={(e) => shareWhatsApp(invoice, e)}
                            >
                                <Smartphone size={16} /> Share on WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="header-section">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 shadow-sm">
                        <FileText color="white" size={18} />
                    </div>
                    <div className="page-title">
                        <h1>History</h1>
                        <p className="text-xs text-muted mt-1">Manage past transactions</p>
                    </div>
                </div>

                <div className="filter-bar">
                    {/* Date Filters */}
                    <div className="date-input-group">
                        <Calendar size={14} className="text-muted" />
                        <input
                            type="date"
                            className="date-input"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                        <span className="text-muted">-</span>
                        <input
                            type="date"
                            className="date-input"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={16} />
                        <input
                            className="search-input-field"
                            placeholder="Search invoice or customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="content-area custom-scrollbar">
                <div className="data-card">
                    <div className="data-table-wrapper custom-scrollbar">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>
                                        <div className="flex items-center gap-2"><FileText size={14} /> Invoice #</div>
                                    </th>
                                    <th>
                                        <div className="flex items-center gap-2"><Calendar size={14} /> Date</div>
                                    </th>
                                    <th>
                                        <div className="flex items-center gap-2"><User size={14} /> Customer</div>
                                    </th>
                                    <th className="text-right">
                                        <div className="flex items-center gap-2 justify-end"><DollarSign size={14} /> Amount</div>
                                    </th>
                                    <th className="text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map(inv => (
                                    <tr key={inv.id} onClick={() => setSelectedInvoice(inv)} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <span className="id-badge">
                                                {inv.invoice_number}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-gray-700">{new Date(inv.created_at).toLocaleDateString()}</span>
                                                <span className="text-xs text-muted">
                                                    {new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="font-bold text-gray-700">{inv.customer_name || "Walk-in Customer"}</span>
                                        </td>
                                        <td className="text-right">
                                            <span className="font-bold text-gray-900">
                                                ₹{inv.total_amount.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center">
                                                <button
                                                    className="action-btn"
                                                    title="View Details"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedInvoice(inv); }}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className="action-btn"
                                                    title="Share on WhatsApp"
                                                    onClick={(e) => shareWhatsApp(inv, e)}
                                                >
                                                    <Smartphone size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredInvoices.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center p-6 text-muted">
                                            <div className="flex flex-col items-center justify-center p-4">
                                                <Filter size={32} className="mb-2 opacity-30" />
                                                <p>No sales found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {selectedInvoice && <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
        </div>
    );
};

export default History;
