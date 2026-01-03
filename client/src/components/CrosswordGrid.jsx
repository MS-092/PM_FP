import React from 'react';
import '../styles/global.css';

const GRID_SIZE = 12;

export default function CrosswordGrid({ gridData, activeWord, onCellClick, solvedWords, numberMap }) {
    // gridData is the 2D array from generator.
    // activeWord is the currently selected word object (with startX, startY, direction, length)

    const isCellActive = (x, y) => {
        if (!activeWord) return false;
        if (activeWord.direction === 'across') {
            return y === activeWord.startY && x >= activeWord.startX && x < activeWord.startX + activeWord.length;
        } else {
            return x === activeWord.startX && y >= activeWord.startY && y < activeWord.startY + activeWord.length;
        }
    };

    const isCellSolved = (x, y) => {
        // Check if this cell belongs to any solved word
        // This is a bit expensive to do every render, but for 12x12 and ~10 words it's fine.
        // Optimization: gridData usually only contains letters if they are "filled".
        // But our generator returns the solution grid. We need a "display grid" state in Game.jsx?
        // Actually, let's assume Game.jsx passes a "displayGrid" where only solved letters are present?
        // OR we pass the solution grid, but we hide letters unless solved?
        // PRD: "Submit... If correct, fills grid".

        // So visual grid should show:
        // 1. Block: Empty (Null in generator grid) -> Black/Dark
        // 2. Slot: Letter (Valid cell) -> White box.
        // 3. Content: Empty if not solved, Letter if solved (or if we support typing).

        // Let's assume Game.jsx handles the "what letter to show" logic and passes a displayGrid.
        return false; // Handled by passed data
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gap: '2px', // Thin gaps
            width: '100%',
            maxWidth: '500px', // Restrict size
            aspectRatio: '1/1',
            background: '#334155', // Border color
            padding: '2px',
            borderRadius: '4px'
        }}>
            {gridData.map((row, y) => (
                row.map((cellValue, x) => {
                    // cellValue is the ANSWER letter if using generator's grid directly.
                    // BUT we need to know if it's a valid slot or just void.
                    // Generator returns `null` for void.

                    const isActive = isCellActive(x, y);
                    // We need to know if this cell is part of ANY word to render it as a white box.
                    // Generator grid has letters for all valid components.
                    const isSlot = cellValue !== null;

                    // Check if this cell starts a word to show number
                    // We need the word list to know numbers. 
                    // Passed via props? Let's assume Game.jsx passes a helper or we calculate.
                    // For now, simple grid rendering.

                    return (
                        <div
                            key={`${x}-${y}`}
                            onClick={() => isSlot && onCellClick(x, y)}
                            style={{
                                backgroundColor: isSlot ? (isActive ? 'rgba(20, 184, 166, 0.2)' : 'var(--bg-card)') : 'transparent',
                                // If it's a slot, it's card color. If void, transparent (shows container bg or body bg).
                                // Actually transparent might show the padding color. Let's make void distinct.
                                // Void = transparent (showing gap color? No).
                                // Let's make Void = #0F172A (body bg).

                                // If Active: Highlight Blue/Teal.
                                border: isActive ? '2px solid var(--neon-teal)' : 'none',

                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: 'white',
                                cursor: isSlot ? 'pointer' : 'default',
                                position: 'relative'
                            }}
                        >
                            {numberMap && numberMap[`${x}-${y}`] && (
                                <span style={{
                                    position: 'absolute',
                                    top: '2px',
                                    left: '2px',
                                    fontSize: '0.6rem',
                                    lineHeight: 1,
                                    color: 'rgba(255,255,255,0.7)'
                                }}>
                                    {numberMap[`${x}-${y}`]}
                                </span>
                            )}

                            {isSlot ? (
                                <>
                                    {/* We rely on parent to pass the "visible letter". 
                      For now, using cellValue directly would show answers. 
                      Let's assume the parent passes a SEPRATE prop for "userProgressGrid" 
                      or we hide it here. 
                      
                      Wait, the component receives `gridData`. I'll assume this is the DISPLAY data.
                  */}
                                    {cellValue}
                                </>
                            ) : null}
                        </div>
                    );
                })
            ))}
        </div>
    );
}
