import React, { useEffect, useRef } from 'react';
import '../styles/global.css';

export default function CluePanel({ levelData, activeWord, inputValue, setInputValue, onSubmit, onHint, hintCount, score, setActiveWordId }) {
    if (!levelData) return null;

    // Auto-focus input when a word is selected
    const inputRef = useRef(null);
    useEffect(() => {
        if (activeWord && inputRef.current) {
            inputRef.current.focus();
        }
    }, [activeWord]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            height: '100%'
        }}>
            {/* Active Clue / Input Area */}
            <div style={{
                background: 'var(--bg-card)',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                flexShrink: 0
            }}>
                {activeWord ? (
                    <>
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{
                                    background: 'rgba(20, 184, 166, 0.2)',
                                    color: 'var(--neon-teal)',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}>
                                    {activeWord.number}. {activeWord.direction}
                                </span>
                                <span style={{ marginLeft: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {activeWord.length} LETTERS
                                </span>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                            {activeWord.clue}
                        </h3>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                                placeholder="ANSWER"
                                maxLength={activeWord.length}
                                onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '2px solid #334155',
                                    backgroundColor: '#0F172A',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    textAlign: 'center',
                                    letterSpacing: '2px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={onHint}
                                disabled={hintCount <= 0}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: hintCount > 0 ? 'rgba(249, 115, 22, 0.2)' : '#334155',
                                    color: hintCount > 0 ? 'var(--neon-orange)' : '#94A3B8',
                                    border: '1px solid transparent',
                                    borderColor: hintCount > 0 ? 'var(--neon-orange)' : 'transparent',
                                    fontWeight: 600,
                                    cursor: hintCount > 0 ? 'pointer' : 'not-allowed',
                                    transition: 'background 0.2s'
                                }}
                            >
                                HINT ({hintCount})
                            </button>

                            <button
                                onClick={onSubmit}
                                style={{
                                    flex: 2,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: 'var(--grad-teal)',
                                    color: 'white',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 6px -1px rgba(20, 184, 166, 0.3)'
                                }}
                            >
                                SUBMIT
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>
                        Select a clue or cell to begin
                    </div>
                )}
            </div>

            {/* Clues List */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                overflowY: 'auto',
                flex: 1,
                minHeight: '200px' // Ensure it has height on mobile
            }}>
                {['across', 'down'].map((dir) => (
                    <div key={dir}>
                        <h4 style={{
                            color: 'var(--neon-teal)',
                            textTransform: 'uppercase',
                            marginBottom: '10px',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            paddingBottom: '5px'
                        }}>
                            {dir}
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {levelData[dir].map(word => {
                                const isActive = activeWord && activeWord.id === word.id;
                                // We need to know if it is solved to strikethrough? 
                                // Passed in prop? CluePanel doesn't seem to have solvedWords in plan.
                                // Let's add strikethrough if we can detect it or just highlight.
                                return (
                                    <li
                                        key={word.id}
                                        onClick={() => setActiveWordId(word.id)}
                                        style={{
                                            padding: '8px',
                                            marginBottom: '5px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            background: isActive ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                                            borderLeft: isActive ? '3px solid var(--neon-teal)' : '3px solid transparent',
                                            fontSize: '0.9rem',
                                            color: isActive ? 'white' : 'var(--text-secondary)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ fontWeight: 'bold', marginRight: '5px' }}>{word.number}.</span>
                                        {word.clue}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
