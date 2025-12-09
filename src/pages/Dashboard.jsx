import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import { setAccessToken } from '../utils/tokenService';
import { api } from '../api/axios';

const subjects = [
    {
        id: 'science_starter',
        title: 'Science Starter',
        desc: 'Intro science terms & lab language.',
        level: 1,
        gradient: 'var(--grad-orange)',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2v7.31" /><path d="M14 9.3V1.99" /><path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" /><path d="M5.52 16h12.96" />
            </svg>
        )
    },
    {
        id: 'math_builder',
        title: 'Math Builder',
        desc: 'Equations, operations & patterns.',
        level: 2,
        gradient: 'var(--grad-teal)',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
            </svg>
        )
    },
    {
        id: 'english_master',
        title: 'English Master',
        desc: 'Grammar, reading skills & vocab.',
        level: 3,
        gradient: 'var(--grad-pink)',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
        )
    },
    {
        id: 'history_quest',
        title: 'History Quest',
        desc: 'Empires, leaders & key events.',
        level: 4,
        gradient: 'var(--grad-purple)',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" /><path d="M5 21V7" /><path d="M19 21V7" /><path d="M4 7h16" /><path d="M15 21v-8" /><path d="M9 21v-8" /><path d="M9 13h6" />
            </svg>
        )
    }
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ username: 'Guest' });

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const handleLogout = async() => {
        await api.post("/logout");
        localStorage.removeItem('user');
        setAccessToken(null)
        navigate('/');
    };

    return (
        <div style={{
            minHeight: '100vh',
            padding: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            {/* Header */}
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'white' }}>Choose Level</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Tap a subject to start a fresh crossword.
                </p>
            </header>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                marginBottom: '4rem'
            }}>
                {subjects.map((sub) => (
                    <div
                        key={sub.id}
                        onClick={() => navigate(`/game/${sub.id}`)}
                        style={{
                            background: 'var(--bg-card)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            border: '1px solid rgba(255,255,255,0.05)',
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        {/* Top Badge Gradient Line */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: sub.gradient
                        }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{
                                background: sub.gradient,
                                padding: '10px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)'
                            }}>
                                {sub.icon}
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}>
                                {sub.level}
                            </div>
                        </div>

                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>{sub.title}</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{sub.desc}</p>
                    </div>
                ))}
            </div>

            {/* Footer Info */}
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '0.9rem' }}>
                <p>Puzzles are procedurally generated each time you start a level.</p>
            </div>

            {/* User Footer */}
            <footer style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid #334155',
                    background: '#0F172A'
                }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--neon-teal)' }} />
                    <span style={{ color: 'white', fontWeight: 500 }}>{user.username}</span>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'transparent',
                        color: 'var(--text-secondary)'
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                </button>
            </footer>
        </div>
    );
}
