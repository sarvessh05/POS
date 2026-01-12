import React, { useEffect, useState } from 'react';
import api from '../api';
import { useCart } from '../context/CartContext';
import { Search, Plus, Minus, Trash2, ShoppingCart, Grid, Package, Smartphone, FileText } from 'lucide-react';
import { downloadInvoicePDF } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/currency';

const POS = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const { cartItems, addToCart, removeFromCart, updateQty, cartTotal, cartTax, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All");
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [tableNumber, setTableNumber] = useState("");
    const [totalTables, setTotalTables] = useState(10);
    const [lastInvoice, setLastInvoice] = useState(null);

    // Generate sequential invoice number
    const generateInvoiceNumber = () => {
        const lastNumber = parseInt(localStorage.getItem('lastInvoiceNumber') || '0');
        const newNumber = lastNumber + 1;
        localStorage.setItem('lastInvoiceNumber', newNumber.toString());
        return `INV-${String(newNumber).padStart(5, '0')}`; // e.g., INV-00001
    };

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await api.get('/items/');
                setItems(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings/');
                setTotalTables(res.data.total_tables || 10);
            } catch (e) {
                console.error('No settings found, using default');
            }
        };
        
        fetchItems();
        fetchSettings();
    }, []);

    const categories = ["All", ...new Set(items.map(i => i.category))];

    const filteredItems = items.filter(i =>
        (activeCategory === "All" || i.category === activeCategory) &&
        i.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        
        // Prevent double-clicks and rapid submissions
        if (loading) return;
        
        setLoading(true);
        try {
            const payload = {
                customer_name: customerName || "Walk-in Customer",
                customer_phone: customerPhone || "",
                table_number: tableNumber ? parseInt(tableNumber) : null,
                payment_mode: "Cash",
                items: cartItems.map(i => ({
                    item_id: i.id,
                    item_name: i.name,
                    quantity: i.qty,
                    unit_price: i.price,
                    tax_amount: (i.price * i.qty * (i.tax_rate || 0))
                }))
            };

            const res = await api.post('/invoices/', payload);
            setLastInvoice(res.data);
            clearCart();
            setCustomerName("");
            setCustomerPhone("");
            setTableNumber("");

            // Show success message with WhatsApp option
            if (customerPhone) {
                const sendWhatsApp = window.confirm(
                    `Invoice Created: ${res.data.invoice_number}\n\nWould you like to send this invoice via WhatsApp?`
                );
                if (sendWhatsApp) {
                    shareWhatsApp(res.data);
                }
            } else {
                alert(`Invoice Created: ${res.data.invoice_number}`);
            }
        } catch (e) {
            console.error(e);
            
            // Handle specific error cases
            if (e.response?.status === 400 && e.response?.data?.detail?.includes("stock")) {
                alert(`Stock Error: ${e.response.data.detail}`);
            } else if (e.response?.status === 409) {
                alert("Invoice processing conflict. Please try again.");
            } else {
                alert("Checkout Failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const shareWhatsApp = (invoice) => {
        // Get customer name for personalization
        const custName = invoice.customer_name || customerName || 'Valued Customer';
        const firstName = custName.split(' ')[0];

        // Download PDF invoice first
        try {
            downloadInvoicePDF(invoice);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }

        // Create a friendly greeting message
        const message = `Hello ${firstName}! 👋

Thank you for choosing us! 😊

I've prepared your invoice for *Invoice #${invoice.invoice_number}*.

📄 *Invoice Details:*
• Total Amount: *₹${invoice.total_amount.toFixed(2)}*
• Date: ${new Date(invoice.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

📎 *Please find the PDF invoice attached below* (check your downloads folder and attach it here)

We appreciate your business and look forward to serving you again! 🙏

If you have any questions, feel free to ask!

Best regards,
*RECO POS by Ailexity* ✨`;

        const phone = invoice.customer_phone || customerPhone;
        const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

        // Show notification about PDF download
        setTimeout(() => {
            alert('📄 Invoice PDF downloaded!\n\n✅ WhatsApp will open now\n📎 Please attach the downloaded PDF file to the message');
        }, 500);

        window.open(url, '_blank');
    };


    return (
        <div className="pos-container">
            {/* LEFT: Item Selection Area */}
            <div className="pos-left-panel">
                {/* Header */}
                <div className="pos-header">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-indigo-600">
                            {/* Manually styled box since bg-indigo-600 isn't global yet, but we will fix later if needed. 
                                 For now using inline style for specific color or relying on CSS class if I added it.
                                 I added 'w-8 h-8' in index.css? No clearly I didn't add utility classes.
                                 I must use the classes I DEFINED.
                             */}
                            <div style={{ width: '32px', height: '32px', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Grid color="white" size={18} />
                            </div>
                        </div>
                        <div className="pos-header-title">
                            <h1>Billing</h1>
                            <p className="text-xs text-muted mt-2">Select items below</p>
                        </div>
                    </div>

                    <div className="pos-search-wrapper">
                        <Search className="pos-search-icon" size={18} />
                        <input
                            className="pos-search-input-field"
                            placeholder="Search items..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="category-bar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Item Grid */}
                <div className="pos-grid-area custom-scrollbar">
                    <div className="pos-grid">
                        {filteredItems.map(item => (
                            <div
                                key={item.id}
                                className="pos-item-card"
                                onClick={() => addToCart(item)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div style={{ width: '40px', height: '40px', background: '#eff6ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>
                                        {item.name.charAt(0)}
                                    </div>
                                    <span className="price-badge">
                                        ₹{item.price}
                                    </span>
                                </div>

                                <h3 style={{ marginBottom: '0.25rem' }}>{item.name}</h3>
                                <p className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.category}</p>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100" style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <span className={`text-xs ${item.stock_quantity < 10 ? "text-danger" : "text-success"}`} style={{ fontWeight: 500 }}>
                                        {item.stock_quantity} in stock
                                    </span>
                                    <div style={{ padding: '0.35rem', background: '#f8fafc', color: '#64748b', display: 'flex' }}>
                                        <Plus size={14} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Cart Panel */}
            <div className="pos-cart-panel" style={{ width: '35%' }}>
                {/* Cart Header */}
                <div className="cart-header">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={20} className="text-muted" />
                        <h2>Current Order</h2>
                    </div>
                    <div className="text-xs text-muted font-mono">
                        #TRX-{Math.floor(Math.random() * 1000)}
                    </div>
                </div>

                {/* Cart Items */}
                <div className="cart-list custom-scrollbar">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted">
                            <Package size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
                            <p className="text-sm">No items yet</p>
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="flex justify-between mb-2">
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{item.name}</h4>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>₹{(item.price * item.qty).toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="text-xs text-muted">
                                        ₹{item.price} / unit
                                    </div>

                                    <div className="flex items-center" style={{ border: '1px solid #e2e8f0', background: 'white' }}>
                                        <button
                                            className="btn-icon"
                                            onClick={(e) => { e.stopPropagation(); updateQty(item.id, item.qty - 1); }}
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span style={{ width: '32px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{item.qty}</span>
                                        <button
                                            className="btn-icon"
                                            onClick={(e) => { e.stopPropagation(); updateQty(item.id, item.qty + 1); }}
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>

                                    <button
                                        className="btn-icon danger"
                                        onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Cart Footer */}
                <div className="cart-footer">
                    {/* Customer Info Section */}
                    {cartItems.length > 0 && (
                        <div className="mb-4 pb-4 border-b" style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <h3 className="text-sm font-bold mb-3 text-main">Customer Details (Optional)</h3>
                            <div className="flex flex-col gap-2">
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Customer Name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                                />
                                <input
                                    className="input"
                                    type="tel"
                                    placeholder="Phone Number (for WhatsApp)"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                                />
                                <select
                                    className="input"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                                >
                                    <option value="">Select Table (Optional)</option>
                                    {[...Array(totalTables)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            Table {i + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {customerPhone && (
                                <p className="text-xs text-muted mt-2" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <span style={{ color: '#10b981' }}>✓</span> Invoice will be sent via WhatsApp
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mb-4">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax:</span>
                            <span>₹{cartTax.toFixed(2)}</span>
                        </div>
                        <div className="summary-row summary-total">
                            <span>Total:</span>
                            <span>₹{(cartTotal + cartTax).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Success Message with WhatsApp Button */}
                    {lastInvoice && (
                        <div className="mb-4 p-4 border" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <span style={{ color: '#16a34a', fontSize: '1.25rem' }}>✓</span>
                                <h3 className="text-sm font-bold" style={{ color: '#16a34a' }}>Order Completed!</h3>
                            </div>
                            <p className="text-xs mb-3" style={{ color: '#15803d' }}>
                                Invoice #{lastInvoice.invoice_number} created successfully
                            </p>
                            {lastInvoice.customer_phone && (
                                <button
                                    className="btn w-full"
                                    onClick={() => shareWhatsApp(lastInvoice)}
                                    style={{ background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    <Smartphone size={16} />
                                    Send Invoice via WhatsApp
                                </button>
                            )}
                            {!lastInvoice.customer_phone && (
                                <p className="text-xs text-center text-muted">
                                    Add phone number to send via WhatsApp
                                </p>
                            )}
                            <button
                                className="text-xs text-muted mt-2 w-full text-center"
                                onClick={() => setLastInvoice(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Start New Order
                            </button>
                        </div>
                    )}

                    {/* Download Invoice PDF Button - Always visible when cart has items */}
                    {cartItems.length > 0 && (
                        <button
                            className="btn-secondary w-full mb-2"
                            onClick={() => {
                                // Create a temporary invoice object from current cart
                                const tempInvoice = {
                                    invoice_number: generateInvoiceNumber(),
                                    created_at: new Date().toISOString(),
                                    customer_name: customerName || 'Walk-in Customer',
                                    customer_phone: customerPhone || '',
                                    total_amount: cartTotal + cartTax,
                                    payment_mode: 'Cash',
                                    items: cartItems.map(item => ({
                                        item_name: item.name,
                                        quantity: item.qty,
                                        unit_price: item.price
                                    }))
                                };
                                downloadInvoicePDF(tempInvoice);
                            }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <FileText size={16} />
                            Download Invoice PDF
                        </button>
                    )}

                    {/* Send Invoice Button - Always visible when phone number is entered */}
                    {cartItems.length > 0 && customerPhone && (
                        <button
                            className="btn w-full mb-2"
                            onClick={() => {
                                // Create a temporary invoice object from current cart
                                const tempInvoice = {
                                    invoice_number: generateInvoiceNumber(),
                                    created_at: new Date().toISOString(),
                                    customer_name: customerName || 'Valued Customer',
                                    customer_phone: customerPhone,
                                    total_amount: cartTotal + cartTax,
                                    payment_mode: 'Cash',
                                    items: cartItems.map(item => ({
                                        item_name: item.name,
                                        quantity: item.qty,
                                        unit_price: item.price
                                    }))
                                };
                                shareWhatsApp(tempInvoice);
                            }}
                            style={{ background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <Smartphone size={16} />
                            Send Invoice via WhatsApp
                        </button>
                    )}

                    <button
                        className="btn w-full"
                        onClick={handleCheckout}
                        disabled={loading || cartItems.length === 0}
                    >
                        {loading ? 'Processing...' : 'COMPLETE ORDER'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POS;
