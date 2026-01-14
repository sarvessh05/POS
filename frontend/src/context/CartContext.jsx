import React, { createContext, useState, useContext, useMemo } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (item) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQty = (itemId, qty) => {
        if (qty <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, qty } : i));
    };

    const setCartFromInvoice = (invoice) => {
        // Map invoice items to cart format
        const mapped = (invoice.items || []).map(it => ({
            id: it.item_id ?? undefined,
            name: it.item_name,
            price: it.unit_price,
            qty: it.quantity,
            tax_rate: undefined,
        }));
        setCartItems(mapped);
    };

    const clearCart = () => setCartItems([]);

    const cartTotal = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    }, [cartItems]);

    const cartTax = useMemo(() => {
        // Simplified tax calc (can be per item)
        return cartItems.reduce((acc, item) => acc + (item.price * item.qty * (item.tax_rate || 0)), 0);
    }, [cartItems]);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, setCartFromInvoice, cartTotal, cartTax }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
