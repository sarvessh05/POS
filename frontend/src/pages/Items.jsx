import React, { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Edit, Trash } from 'lucide-react';

const Items = () => {
    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({ name: '', price: '', category: '', stock_quantity: '', tax_rate: 0 });

    const fetchItems = async () => {
        try {
            const res = await api.get('/items/');
            console.log('Items fetched:', res.data);
            setItems(res.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/items/${editingItem.id}`, newItem);
            } else {
                await api.post('/items/', newItem);
            }
            setShowModal(false);
            setEditingItem(null);
            setNewItem({ name: '', price: '', category: '', stock_quantity: '', tax_rate: 0 });
            fetchItems();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setNewItem({
            name: item.name,
            price: item.price,
            category: item.category,
            stock_quantity: item.stock_quantity,
            tax_rate: item.tax_rate || 0
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure?")) {
            await api.delete(`/items/${id}`);
            fetchItems();
        }
    };

    return (
        <div className="page-container">
            <div className="content-area animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1>Item Management</h1>
                        <p className="text-muted">Manage your inventory</p>
                    </div>
                    <button className="btn" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Add Item
                    </button>
                </div>

                <div className="card overflow-hidden p-0">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td>{item.name}</td>
                                    <td>{item.category}</td>
                                    <td className="text-accent">₹{item.price}</td>
                                    <td>
                                        <span className={`badge ${item.stock_quantity < 10 ? 'bg-red-500' : 'bg-green-500'}`}>
                                            {item.stock_quantity}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn-secondary p-2 rounded" onClick={() => handleEdit(item)}><Edit size={14} /></button>
                                            <button className="btn-secondary p-2 rounded text-danger" onClick={() => handleDelete(item.id)}><Trash size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center p-6 text-muted">
                                        <div className="flex flex-col items-center justify-center p-4">
                                            <p>No items found. Click "Add Item" to create your first item.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                        <div className="card w-full max-w-lg relative bg-[#1e293b]">
                            <h2 className="mb-4">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <input className="input" placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required />
                                <div className="flex gap-4">
                                    <input className="input" placeholder="Category" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} required />
                                    <input className="input" placeholder="Price" type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} required />
                                </div>
                                <div className="flex gap-4">
                                    <input className="input" placeholder="Stock Quantity" type="number" value={newItem.stock_quantity} onChange={e => setNewItem({ ...newItem, stock_quantity: e.target.value })} required />
                                    <input className="input" placeholder="Tax Rate (%)" type="number" step="0.01" value={newItem.tax_rate} onChange={e => setNewItem({ ...newItem, tax_rate: e.target.value })} />
                                </div>

                                <div className="flex justify-end gap-2 mt-4">
                                    <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingItem(null); setNewItem({ name: '', price: '', category: '', stock_quantity: '', tax_rate: 0 }); }}>Cancel</button>
                                    <button type="submit" className="btn">{editingItem ? 'Update Item' : 'Save Item'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Items;
