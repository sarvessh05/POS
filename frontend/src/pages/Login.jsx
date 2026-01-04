import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            navigate('/');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-slate-100">
            <div className="card w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 flex items-center justify-center mx-auto mb-4">
                        <span className="font-bold text-white text-2xl">R</span>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>RECO POS</h1>
                    <p className="text-muted mt-2">by Ailexity</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-muted mb-1 block">Username</label>
                        <input
                            className="input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-muted mb-1 block">Password</label>
                        <input
                            className="input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <div className="text-danger text-sm text-center" style={{ color: 'var(--danger-color)' }}>{error}</div>}
                    <button type="submit" className="btn mt-4 w-full">Sign In</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
