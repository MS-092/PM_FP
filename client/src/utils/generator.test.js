
import { describe, it, expect } from 'vitest';
import { generateLevel } from './generator';
import { WORD_BANK } from './wordBank';

describe('CV-001: Content Validation - Generator Stress Test', () => {

    it('should successfully generate a valid level >95% of the time (N=100)', () => {
        const ITERATIONS = 100;
        const TARGET_SUCCESS_RATE = 0.95;
        let successCount = 0;
        let failureCount = 0;

        console.log(`Starting stress test with ${ITERATIONS} iterations...`);

        for (let i = 0; i < ITERATIONS; i++) {
            try {
                // Testing with 'Science' as a baseline category
                const result = generateLevel('science_starter');

                // Content Validation Checks
                if (result &&
                    result.grid &&
                    result.across.length > 0 &&
                    result.down.length > 0 &&
                    result.across.length + result.down.length === 10 // Target is 5 across + 5 down
                ) {
                    successCount++;
                } else {
                    failureCount++;
                }
            } catch (error) {
                failureCount++;
            }
        }

        const successRate = successCount / ITERATIONS;
        console.log(`Stress Test Results: Success: ${successCount}, Failures: ${failureCount}, Rate: ${successRate * 100}%`);

        expect(successRate).toBeGreaterThanOrEqual(TARGET_SUCCESS_RATE);
    });

    it('should produce intersecting words', () => {
        const result = generateLevel('science_starter');
        let intersections = 0;

        // Simple check: do any across words share a cell with any down words?
        result.across.forEach(a => {
            for (let i = 0; i < a.length; i++) {
                const ax = a.startX + i;
                const ay = a.startY;

                // check against all down words
                result.down.forEach(d => {
                    for (let j = 0; j < d.length; j++) {
                        const dx = d.startX;
                        const dy = d.startY + j;

                        if (ax === dx && ay === dy) {
                            intersections++;
                        }
                    }
                });
            }
        });

        expect(intersections).toBeGreaterThan(0);
    });
});

describe('CV-002: Content Accuracy', () => {
    it('should have valid word bank entries', () => {
        const categories = Object.keys(WORD_BANK);
        categories.forEach(cat => {
            const data = WORD_BANK[cat];
            expect(data.description).toBeTruthy();
            expect(data.words.length).toBeGreaterThan(0);

            data.words.forEach(w => {
                // Check for validity
                expect(w.word).toBeTruthy();
                expect(w.clue).toBeTruthy();
                // Check length match
                expect(w.word.length).toBe(w.length);
                // Check ID format
                expect(w.id.length).toBeGreaterThan(3);
            });
        });
    });
});

describe('CV-003: Difficulty Scaling', () => {
    it('should have distinct difficulty levels', () => {
        const science = WORD_BANK['science_starter'];
        const math = WORD_BANK['math_builder'];
        const english = WORD_BANK['english_master'];

        expect(science.difficulty_level).toBe(1);
        expect(math.difficulty_level).toBe(2);
        expect(english.difficulty_level).toBe(3);
    });
});
