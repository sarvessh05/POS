import React, { useState, useEffect } from 'react';
import api from '../api';
import { Settings as SettingsIcon, Save } from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState({
        hotel_name: '',
        email: '',
        phone: '',
        address: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        upi_id: '',
        gst_number: '',
        total_tables: 10
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings/');
            setSettings(res.data);
        } catch (e) {
            console.error('Error fetching settings:', e);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: name === 'total_tables' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await api.put('/settings/', settings);
            setMessage('Settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (e) {
            console.error('Error saving settings:', e);
            setMessage('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100%' }}>
                <div className="header">
                    <div className="header-left">
                        <SettingsIcon size={28} style={{ color: '#4f46e5' }} />
                        <div>
                            <h1>Settings</h1>
                            <p className="text-muted">Manage your hotel/restaurant settings</p>
                        </div>
                    </div>
                </div>

                <div className="content-body">
                    <form onSubmit={handleSubmit} className="settings-form">
                        {/* Business Information */}
                        <div className="card">
                            <div className="card-header">
                                <h2>Business Information</h2>
                            </div>
                            <div className="card-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Hotel/Restaurant Name *</label>
                                        <input
                                            type="text"
                                            name="hotel_name"
                                            value={settings.hotel_name}
                                            onChange={handleChange}
                                            placeholder="Enter hotel name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={settings.email}
                                            onChange={handleChange}
                                            placeholder="hotel@example.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={settings.phone}
                                            onChange={handleChange}
                                            placeholder="+91-9876543210"
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Address</label>
                                        <textarea
                                            name="address"
                                            value={settings.address}
                                            onChange={handleChange}
                                            placeholder="Enter complete address"
                                            rows="3"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bank Details */}
                        <div className="card">
                            <div className="card-header">
                                <h2>Bank & Payment Details</h2>
                            </div>
                            <div className="card-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Bank Name</label>
                                        <input
                                            type="text"
                                            name="bank_name"
                                            value={settings.bank_name}
                                            onChange={handleChange}
                                            placeholder="Bank Name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Account Number</label>
                                        <input
                                            type="text"
                                            name="account_number"
                                            value={settings.account_number}
                                            onChange={handleChange}
                                            placeholder="1234567890"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>IFSC Code</label>
                                        <input
                                            type="text"
                                            name="ifsc_code"
                                            value={settings.ifsc_code}
                                            onChange={handleChange}
                                            placeholder="ABCD0123456"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>UPI ID</label>
                                        <input
                                            type="text"
                                            name="upi_id"
                                            value={settings.upi_id}
                                            onChange={handleChange}
                                            placeholder="yourupi@bank"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>GST Number</label>
                                        <input
                                            type="text"
                                            name="gst_number"
                                            value={settings.gst_number}
                                            onChange={handleChange}
                                            placeholder="22AAAAA0000A1Z5"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table Management */}
                        <div className="card">
                            <div className="card-header">
                                <h2>Table Management</h2>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label>Total Tables in Hotel *</label>
                                    <input
                                        type="number"
                                        name="total_tables"
                                        value={settings.total_tables}
                                        onChange={handleChange}
                                        min="1"
                                        max="100"
                                        required
                                        placeholder="10"
                                    />
                                    <small className="text-muted">Number of tables available for billing</small>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>

                        {message && (
                            <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                                {message}
                            </div>
                        )}
                    </form>
                </div>
            </div>
    );
};

export default Settings;
