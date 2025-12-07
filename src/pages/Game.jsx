import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateLevel } from '../utils/generator';
import CrosswordGrid from '../components/CrosswordGrid';
import CluePanel from '../components/CluePanel';
import '../styles/global.css';

export default function Game() {
    const { category } = useParams();
    const navigate = useNavigate();

    // Game State
    const [levelData, setLevelData] = useState(null); // { grid, across, down, theme }
    const [solvedWords, setSolvedWords] = useState([]); // Array of word IDs
    const [revealedCells, setRevealedCells] = useState([]); // Array of "x-y"
    const [activeWordId, setActiveWordId] = useState(null);
    const [inputValue, setInputValue] = useState('');

    // Metrics
    const [score, setScore] = useState(0);
    const [hintsLeft, setHintsLeft] = useState(3);
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completed, setCompleted] = useState(false);

    // Timer Ref
    const timerRef = useRef(null);

    // Init
    useEffect(() => {
        try {
            const data = generateLevel(category);

            // Calculate Numbers
            // 1. Collect all unique start positions
            const starts = [];
            [...data.across, ...data.down].forEach(w => {
                if (!starts.some(s => s.x === w.startX && s.y === w.startY)) {
                    starts.push({ x: w.startX, y: w.startY });
                }
            });

            // 2. Sort by Y then X
            starts.sort((a, b) => (a.y - b.y) || (a.x - b.x));

            // 3. Assign numbers
            const numMap = {}; // "x-y" -> number
            starts.forEach((s, i) => {
                numMap[`${s.x}-${s.y}`] = i + 1;
            });

            // 4. Assign numbers back to word objects for CluePanel
            data.across = data.across.map(w => ({ ...w, number: numMap[`${w.startX}-${w.startY}`] })).sort((a, b) => a.number - b.number);
            data.down = data.down.map(w => ({ ...w, number: numMap[`${w.startX}-${w.startY}`] })).sort((a, b) => a.number - b.number);

            setLevelData({ ...data, numberMap: numMap });
            setLoading(false);

            // Start Timer
            timerRef.current = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        } catch (err) {
            console.error(err);
            setError("Failed to generate level. Please try again.");
            setLoading(false);
        }

        return () => clearInterval(timerRef.current);
    }, [category]);

    const getActiveWord = () => {
        if (!levelData || !activeWordId) return null;
        return [...levelData.across, ...levelData.down].find(w => w.id === activeWordId);
    };

    const handleCellClick = (x, y) => {
        if (!levelData) return;

        // Find words at this cell
        const wordsAtCell = [...levelData.across, ...levelData.down].filter(w => {
            if (w.direction === 'across') {
                return y === w.startY && x >= w.startX && x < w.startX + w.length;
            } else {
                return x === w.startX && y >= w.startY && y < w.startY + w.length;
            }
        });

        if (wordsAtCell.length > 0) {
            // If currently selected word occupies this cell, toggle to the other one if exists
            if (activeWordId && wordsAtCell.some(w => w.id === activeWordId)) {
                const other = wordsAtCell.find(w => w.id !== activeWordId);
                if (other) {
                    setActiveWordId(other.id);
                    setInputValue('');
                }
            } else {
                // Otherwise select the first found
                setActiveWordId(wordsAtCell[0].id);
                setInputValue('');
            }
        }
    };

    const calculateDisplayGrid = () => {
        if (!levelData) return [];
        // Start with empty grid (or void)
        // Map solution grid. Only show letters if the word encompassing them is solved.

        // We need to reconstruct the grid based on SOLVED words only to show letters.
        // However, the PRD says "grid fills" when correct.
        // Does it fill intersecting letters of UNSOLVED words? Yes, standard crossword rules.
        // So if Word A intersects Word B, and A is solved, the letter at intersection is visible for B too.

        // So the grid cell should show the letter if ANY word crossing it is solved.

        const displayGrid = levelData.grid.map((row, y) =>
            row.map((solutionChar, x) => {
                if (!solutionChar) return null; // Void

                const cellKey = `${x}-${y}`;
                if (revealedCells.includes(cellKey)) return solutionChar;

                // Check if this cell is covered by any solved word
                const isRevealed = [...levelData.across, ...levelData.down].some(w => {
                    if (!solvedWords.includes(w.id)) return false; // Not solved
                    // Check if w covers x,y
                    if (w.direction === 'across') {
                        return y === w.startY && x >= w.startX && x < w.startX + w.length;
                    } else {
                        return x === w.startX && y >= w.startY && y < w.startY + w.length;
                    }
                });

                return isRevealed ? solutionChar : ''; // Return char if revealed, else empty string (but it is a slot)
            })
        );
        return displayGrid;
    };

    const handleSubmit = () => {
        const wordObj = getActiveWord();
        if (!wordObj) return;

        if (inputValue.toUpperCase() === wordObj.word) {
            // Correct!
            if (!solvedWords.includes(wordObj.id)) {
                const newSolved = [...solvedWords, wordObj.id];
                setSolvedWords(newSolved);
                setScore(s => s + 100);
                setInputValue('');

                // Check Win
                if (newSolved.length === (levelData.across.length + levelData.down.length)) {
                    setCompleted(true);
                    clearInterval(timerRef.current);
                    // Save Score if user is logged in
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        const user = JSON.parse(savedUser);
                        fetch(`${import.meta.env.VITE_API_URL}/api/score`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: user.id || 1, // Fallback if mock user from before
                                category: category,
                                score: score + 100 // Include the final word points
                            })
                        }).catch(err => console.error("Failed to save score", err));
                    }
                }
            }
        } else {
            // Wrong
            // Maybe shake effect?
            alert("Incorrect!"); // Simple feedback for now
            setScore(s => Math.max(0, s - 10));
        }
    };

    const handleHint = () => {
        const wordObj = getActiveWord();
        if (!wordObj || hintsLeft <= 0 || solvedWords.includes(wordObj.id)) return;

        // Find first unrevealed letter in the word
        for (let i = 0; i < wordObj.length; i++) {
            const cx = wordObj.direction === 'across' ? wordObj.startX + i : wordObj.startX;
            const cy = wordObj.direction === 'down' ? wordObj.startY + i : wordObj.startY;
            const cellKey = `${cx}-${cy}`;

            // Check if already revealed by hint or solved word
            const isRevealed = revealedCells.includes(cellKey) || [...levelData.across, ...levelData.down].some(w => {
                if (!solvedWords.includes(w.id)) return false;
                if (w.direction === 'across') return cy === w.startY && cx >= w.startX && cx < w.startX + w.length;
                return cx === w.startX && cy >= w.startY && cy < w.startY + w.length;
            });

            if (!isRevealed) {
                setRevealedCells(prev => [...prev, cellKey]);
                setHintsLeft(h => h - 1);
                setScore(s => Math.max(0, s - 10)); // Reduced penalty
                return;
            }
        }
    };

    const handleReset = () => {
        window.location.reload(); // Simplest way to re-roll RNG
    };

    if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Generating puzzle...</div>;
    if (error) return <div style={{ color: 'red', padding: '2rem' }}>{error} <button onClick={handleReset}>Retry</button></div>;

    const displayGrid = calculateDisplayGrid();
    const activeWordObj = getActiveWord();

    return (
        <div style={{ minHeight: '100vh', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button onClick={() => {
                    if (window.confirm("Are you sure? Progress will be lost.")) navigate('/dashboard');
                }} style={{ color: 'var(--text-secondary)', background: 'transparent' }}>
                    &lt; Back
                </button>
                <h2 style={{ color: 'white' }}>{levelData.theme.description}</h2>
                <button onClick={handleReset} style={{ color: 'var(--neon-teal)', background: 'transparent' }}>
                    Reset
                </button>
            </header>

            {/* HUD */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                background: 'var(--bg-card)',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TIME</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>
                        {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SCORE</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--neon-orange)' }}>{score}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>FOUND</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--neon-green)' }}>
                        {solvedWords.length} / {levelData.across.length + levelData.down.length}
                    </div>
                </div>
            </div>

            {/* Game Layout */}
            <div className="game-layout" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                alignItems: 'start'
            }}>

                {/* CSS Media Query for mobile needed? Inline styles for simplicity in prototype,
            but responsive stacking handled by CSS usually.
            I'll add a style block for responsive.
        */}
                <style>{`
            @media (max-width: 768px) {
                .game-layout { grid-template-columns: 1fr !important; }
            }
        `}</style>

                {/* Left: Grid */}
                <div>
                    <CrosswordGrid
                        gridData={displayGrid}
                        activeWord={activeWordObj}
                        onCellClick={handleCellClick}
                        solvedWords={solvedWords}
                        numberMap={levelData.numberMap}
                    />
                    <div style={{ marginTop: '1rem', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem' }}>
                        Tap cells to input letters
                    </div>
                </div>

                {/* Right: Inputs */}
                <div>
                    <CluePanel
                        levelData={levelData}
                        activeWord={activeWordObj}
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        onSubmit={handleSubmit}
                        onHint={handleHint}
                        hintCount={hintsLeft}
                        score={score}
                        setActiveWordId={setActiveWordId}
                    />
                </div>
            </div>

            {/* Win Modal */}
            {completed && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div style={{
                        background: 'var(--bg-card)',
                        padding: '3rem',
                        borderRadius: '24px',
                        textAlign: 'center',
                        border: '1px solid var(--neon-teal)',
                        boxShadow: '0 0 30px rgba(20, 184, 166, 0.2)',
                        maxWidth: '90%'
                    }}>
                        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}>Level Complete!</h1>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--neon-orange)' }}>
                            Score: {score}
                        </div>
                        <div style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                            Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                        </div>
                        <button onClick={() => navigate('/dashboard')} style={{
                            padding: '16px 32px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            background: 'var(--grad-teal)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
