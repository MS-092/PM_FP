import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import { setAccessToken } from '../utils/tokenService';
import { api } from '../api/axios';

const GradCapIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="var(--neon-teal)" fillOpacity="0.2" />
        <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill="white" />
        <path d="M5 13.18V17.18C5 19.39 8.13 21.18 12 21.18C15.87 21.18 19 19.39 19 17.18V13.18L12 17L5 13.18Z" fill="white" />
    </svg>
);

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { username, email, password } = formData;

        try {
            const response = await api.post(`/${isLogin ? 'login' : 'register'}`, { username, email, password }, { headers: { 'Content-Type': 'application/json' }})

            const data = await response.data;

            // Save user info
            localStorage.setItem('user', JSON.stringify({_id: data._id, username: data.username, email: data.email}));
            setAccessToken(data.accessToken)
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)'
        }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <GradCapIcon />
                <h1 style={{ fontSize: '2.5rem', marginTop: '1rem', background: 'var(--grad-teal)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    EduCross
                </h1>
                <h3 style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
                    {isLogin ? "Welcome back! Sign in to continue" : "Create an account to start learning"}
                </h3>
            </div>

            <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {error && <div style={{ color: 'var(--neon-red)', textAlign: 'center' }}>{error}</div>}

                    {!isLogin && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Username</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Enter your username"
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #334155',
                                    backgroundColor: '#0F172A',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            required
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #334155',
                                backgroundColor: '#0F172A',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            required
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #334155',
                                backgroundColor: '#0F172A',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '8px',
                            background: loading ? '#334155' : 'var(--grad-teal)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1rem',
                            marginTop: '1rem',
                            transition: 'transform 0.2s',
                            cursor: loading ? 'wait' : 'pointer'
                        }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <span
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        style={{ color: 'var(--neon-teal)', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </span>
                </div>
            </div>
        </div>
    );
}
