import React, { useEffect, useState } from 'react';
import api from '../api';
import { useCart } from '../context/CartContext';
import { Search, Plus, Minus, Trash2, ShoppingCart, Grid, Package, Save, CheckCircle, Eye, X, User, Phone } from 'lucide-react';

const POSNew = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const { cartItems, addToCart, removeFromCart, updateQty, cartTotal, cartTax, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All");
    const [selectedTable, setSelectedTable] = useState("");
    const [totalTables, setTotalTables] = useState(10);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [showTableOrders, setShowTableOrders] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    
    // Complete order modal state
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [completingOrder, setCompletingOrder] = useState(null);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    useEffect(() => {
        fetchItems();
        fetchSettings();
        fetchPendingOrders();
    }, []);

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

    const fetchPendingOrders = async () => {
        try {
            const res = await api.get('/invoices/pending');
            setPendingOrders(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    // Normalize categories to title case and remove duplicates
    const categories = ["All", ...new Set(items.map(i => 
        i.category ? i.category.charAt(0).toUpperCase() + i.category.slice(1).toLowerCase() : 'Other'
    ))];

    const filteredItems = items.filter(i =>
        (activeCategory === "All" || 
         (i.category && i.category.toLowerCase() === activeCategory.toLowerCase())) &&
        i.name.toLowerCase().includes(search.toLowerCase())
    );

    // Auto-load order when table is selected
    const handleTableChange = (tableNum) => {
        setSelectedTable(tableNum);
        if (tableNum) {
            const existingOrder = pendingOrders.find(o => o.table_number === parseInt(tableNum));
            if (existingOrder) {
                // Load existing order into cart
                clearCart();
                existingOrder.items.forEach(item => {
                    const menuItem = items.find(i => i.id === item.item_id);
                    if (menuItem) {
                        for (let i = 0; i < item.quantity; i++) {
                            addToCart(menuItem);
                        }
                    }
                });
                setCurrentOrderId(existingOrder.id);
            } else {
                clearCart();
                setCurrentOrderId(null);
            }
        } else {
            clearCart();
            setCurrentOrderId(null);
        }
    };

    const handleSaveOrder = async () => {
        if (!selectedTable) {
            alert("Please select a table first!");
            return;
        }
        if (cartItems.length === 0) {
            alert("Please add items to the order!");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                table_number: parseInt(selectedTable),
                status: "pending",
                customer_name: "Table " + selectedTable,
                payment_mode: "Cash",
                items: cartItems.map(i => ({
                    item_id: i.id,
                    item_name: i.name,
                    quantity: i.qty,
                    unit_price: i.price,
                    tax_amount: (i.price * i.qty * (i.tax_rate || 0))
                }))
            };

            if (currentOrderId) {
                // Update existing order
                await api.put(`/invoices/${currentOrderId}`, payload);
                alert(`Order updated for Table ${selectedTable}!`);
            } else {
                // Create new order
                await api.post('/invoices/', payload);
                alert(`Order saved for Table ${selectedTable}!`);
            }
            
            clearCart();
            setSelectedTable("");
            setCurrentOrderId(null);
            fetchPendingOrders();
        } catch (e) {
            console.error("Save order error:", e);
            console.error("Response:", e.response?.data);
            alert("Failed to save order: " + (e.response?.data?.detail || e.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteOrder = async (orderId, tableNum) => {
        // Open modal for customer details
        setCompletingOrder({ orderId, tableNum });
        setCustomerName("");
        setCustomerPhone("");
        setShowCompleteModal(true);
    };

    const confirmCompleteOrder = async () => {
        if (!completingOrder) return;
        
        const { orderId, tableNum } = completingOrder;
        const finalName = customerName.trim() || "Walk-in Customer";
        const finalPhone = customerPhone.trim() || null;

        try {
            await api.put(`/invoices/${orderId}/complete`, null, {
                params: { 
                    payment_mode: "Cash",
                    customer_name: finalName,
                    customer_phone: finalPhone
                }
            });
            setShowCompleteModal(false);
            setCompletingOrder(null);
            fetchPendingOrders();
            alert(`Bill completed for Table ${tableNum}!`);
        } catch (e) {
            console.error(e);
            alert("Failed to complete order");
        }
    };

    const loadTableOrder = (order) => {
        setSelectedTable(order.table_number.toString());
        setCurrentOrderId(order.id);
        clearCart();
        order.items.forEach(item => {
            const menuItem = items.find(i => i.id === item.item_id);
            if (menuItem) {
                for (let i = 0; i < item.quantity; i++) {
                    addToCart(menuItem);
                }
            }
        });
        setShowTableOrders(false);
    };

    return (
        <div style={{ padding: 0, overflow: 'hidden', width: '100%' }}>
                <div className="pos-container">
                    {/* LEFT: Item Selection */}
                    <div className="pos-left-panel">
                        <div className="pos-header">
                            <div>
                                <h1>Table Service</h1>
                                <p className="text-xs text-muted mt-1">Select table, add items, save order</p>
                            </div>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setShowTableOrders(!showTableOrders)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Eye size={18} />
                                Active Tables ({pendingOrders.length})
                            </button>
                        </div>

                        {/* Table Selection */}
                        <div style={{ padding: '1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                Select Table *
                            </label>
                            <select
                                className="input"
                                value={selectedTable}
                                onChange={(e) => handleTableChange(e.target.value)}
                                style={{ width: '100%', fontSize: '1rem', padding: '0.75rem' }}
                            >
                                <option value="">Choose a table...</option>
                                {[...Array(totalTables)].map((_, i) => {
                                    const tableNum = i + 1;
                                    const hasOrder = pendingOrders.some(o => o.table_number === tableNum);
                                    return (
                                        <option key={tableNum} value={tableNum}>
                                            Table {tableNum} {hasOrder ? '(Active)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Search & Categories */}
                        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                            <div className="search-box mb-4">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="category-tabs">
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
                        </div>

                        {/* Item Grid */}
                        <div className="pos-grid-area custom-scrollbar">
                            <div className="pos-grid">
                                {filteredItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="pos-item-card"
                                        onClick={() => selectedTable && addToCart(item)}
                                        style={{ opacity: selectedTable ? 1 : 0.5, cursor: selectedTable ? 'pointer' : 'not-allowed' }}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div style={{ width: '40px', height: '40px', background: '#eff6ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>
                                                {item.name.charAt(0)}
                                            </div>
                                            <span className="price-badge">₹{item.price}</span>
                                        </div>
                                        <h3 style={{ marginBottom: '0.25rem' }}>{item.name}</h3>
                                        <p className="text-xs text-muted">{item.category}</p>
                                        <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
                                            <span className={`text-xs ${item.stock_quantity < 10 ? "text-danger" : "text-success"}`}>
                                                {item.stock_quantity} in stock
                                            </span>
                                            {selectedTable && (
                                                <div style={{ padding: '0.35rem', background: '#f8fafc', color: '#64748b', display: 'flex' }}>
                                                    <Plus size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Cart Panel */}
                    <div className="pos-cart-panel" style={{ width: '35%' }}>
                        <div className="cart-header">
                            <div className="flex items-center gap-2">
                                <ShoppingCart size={20} />
                                <h2>Current Order</h2>
                            </div>
                            {selectedTable && (
                                <div className="text-sm font-bold" style={{ padding: '0.5rem 1rem', background: '#4f46e5', color: 'white', borderRadius: '4px' }}>
                                    Table {selectedTable}
                                </div>
                            )}
                        </div>

                        {/* Cart Items */}
                        <div className="cart-list custom-scrollbar">
                            {!selectedTable ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted">
                                    <Grid size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
                                    <p className="text-sm">Select a table to start</p>
                                </div>
                            ) : cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted">
                                    <Package size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
                                    <p className="text-sm">No items added</p>
                                </div>
                            ) : (
                                cartItems.map(item => (
                                    <div key={item.id} className="cart-item">
                                        <div className="flex justify-between mb-2">
                                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.name}</h4>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>₹{(item.price * item.qty).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-xs text-muted">₹{item.price} / unit</div>
                                            <div className="flex items-center" style={{ border: '1px solid #e2e8f0', background: 'white' }}>
                                                <button className="btn-icon" onClick={() => updateQty(item.id, item.qty - 1)}>
                                                    <Minus size={12} />
                                                </button>
                                                <span style={{ width: '32px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{item.qty}</span>
                                                <button className="btn-icon" onClick={() => updateQty(item.id, item.qty + 1)}>
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <button className="btn-icon danger" onClick={() => removeFromCart(item.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Cart Footer */}
                        <div className="cart-footer">
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
                            <button
                                className="btn btn-primary w-full"
                                onClick={handleSaveOrder}
                                disabled={loading || !selectedTable || cartItems.length === 0}
                            >
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Order'}
                            </button>
                        </div>
                    </div>

                    {/* Active Tables Modal */}
                    {showTableOrders && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                            <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '80vh', overflow: 'auto' }}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2>Active Table Orders</h2>
                                    <button className="btn-secondary" onClick={() => setShowTableOrders(false)}>Close</button>
                                </div>
                                {pendingOrders.length === 0 ? (
                                    <p className="text-center text-muted p-8">No active orders</p>
                                ) : (
                                    <div className="grid gap-4">
                                        {pendingOrders.map(order => (
                                            <div key={order.id} className="card" style={{ background: '#f8fafc', padding: '1rem' }}>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-bold">Table {order.table_number}</h3>
                                                        <p className="text-xs text-muted">{new Date(order.created_at).toLocaleTimeString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg">₹{order.total_amount.toFixed(2)}</p>
                                                        <p className="text-xs text-muted">{order.items.length} items</p>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between text-sm py-1">
                                                            <span>{item.quantity}x {item.item_name}</span>
                                                            <span>₹{item.total_price.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        className="btn btn-secondary flex-1"
                                                        onClick={() => loadTableOrder(order)}
                                                    >
                                                        Edit Order
                                                    </button>
                                                    <button 
                                                        className="btn btn-primary flex-1"
                                                        onClick={() => handleCompleteOrder(order.id, order.table_number)}
                                                    >
                                                        <CheckCircle size={16} />
                                                        Complete Bill
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Complete Order Modal */}
                    {showCompleteModal && completingOrder && (
                        <div className="modal-overlay" style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}>
                            <div className="modal-content" style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                width: '90%',
                                maxWidth: '400px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                                        Complete Order - Table {completingOrder.tableNum}
                                    </h2>
                                    <button 
                                        onClick={() => setShowCompleteModal(false)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                    Enter customer details (optional). Leave blank for Walk-in Customer.
                                </p>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                                        <User size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Customer Name
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Walk-in Customer"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                                        <Phone size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        className="input"
                                        placeholder="Optional"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={() => setShowCompleteModal(false)}
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="btn btn-primary"
                                        onClick={confirmCompleteOrder}
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <CheckCircle size={16} />
                                        Complete Bill
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
    );
};

export default POSNew;
