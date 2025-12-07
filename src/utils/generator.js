import { WORD_BANK } from "./wordBank";

const GRID_SIZE = 12;
const TARGET_ACROSS = 5;
const TARGET_DOWN = 5;

// Helper to create an empty grid
function createGrid(size) {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => null)
    );
}

// Helper to shuffle array
function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Check if a word can be placed at x, y with direction
function canPlace(grid, wordObj, startX, startY, direction) {
    const word = wordObj.word;
    const len = word.length;

    // 1. Boundary Check
    if (direction === "across") {
        if (startX + len > GRID_SIZE) return false;
        // Check if word touches left/right boundaries (optional, but good for aesthetics)
    } else {
        if (startY + len > GRID_SIZE) return false;
    }

    let hasIntersection = false;
    let intersections = [];

    for (let i = 0; i < len; i++) {
        const currentX = direction === "across" ? startX + i : startX;
        const currentY = direction === "down" ? startY + i : startY;
        const cell = grid[currentY][currentX];
        const char = word[i];

        // Check A: Conflict (Cell not empty and doesn't match)
        if (cell && cell !== char) {
            return false;
        }

        // Check B: Intersection
        if (cell === char) {
            hasIntersection = true;
            intersections.push({ x: currentX, y: currentY });
        }

        // Check C: Neighbors
        // We need to ensure we don't place words right next to each other in parallel
        // or creat invalid 2-letter words by accident.
        // This is a simplified check. A robust one checks adjacent cells perpendicular to direction.

        // Perpendicular check:
        // If we are placing ACROSS, check UP and DOWN of the current cell.
        // IF the cell is currently empty (not an intersection), then UP and DOWN must be empty.
        // IF it IS an intersection, then UP or DOWN must be part of the crossing word (effectively occupied).

        if (!cell) { // If placing into an empty cell
            if (direction === 'across') {
                if ((currentY > 0 && grid[currentY - 1][currentX]) ||
                    (currentY < GRID_SIZE - 1 && grid[currentY + 1][currentX])) {
                    return false;
                }
            } else { // down
                if ((currentX > 0 && grid[currentY][currentX - 1]) ||
                    (currentX < GRID_SIZE - 1 && grid[currentY][currentX + 1])) {
                    return false;
                }
            }
        }
    }

    // Check start/end isolation (cannot touch another word head-to-tail for simpler logic)
    // Check cell BEFORE start
    if (direction === 'across') {
        if (startX > 0 && grid[startY][startX - 1]) return false;
        if (startX + len < GRID_SIZE && grid[startY][startX + len]) return false;
    } else {
        if (startY > 0 && grid[startY - 1][startX]) return false;
        if (startY + len < GRID_SIZE && grid[startY + len][startX]) return false;
    }

    return { valid: true, hasIntersection };
}

// Backtracking function
function placeWords(grid, remainingWords, placedAcross, placedDown) {
    // Base Case: Targets Met
    if (placedAcross.length === TARGET_ACROSS && placedDown.length === TARGET_DOWN) {
        return { grid, placedAcross, placedDown, success: true };
    }

    // Base Case: No words left
    if (remainingWords.length === 0) {
        return { success: false };
    }

    // Try each word
    for (let i = 0; i < remainingWords.length; i++) {
        const wordObj = remainingWords[i];
        const currentWordRaw = wordObj.word;

        // Decide direction priority
        // If we need more across, try across first.
        let directions = [];
        if (placedAcross.length < TARGET_ACROSS && placedDown.length < TARGET_DOWN) {
            directions = Math.random() > 0.5 ? ["across", "down"] : ["down", "across"];
        } else if (placedAcross.length < TARGET_ACROSS) {
            directions = ["across"];
        } else if (placedDown.length < TARGET_DOWN) {
            directions = ["down"];
        } else {
            // Should be caught by base case, but just in case
            continue;
        }

        for (const dir of directions) {
            // Optimize: Instead of scanning all 12x12 for every word, 
            // we can try to find intersections with existing placed words.
            // IF board is empty, place in center.
            // IF board has words, scan for matching letters.

            const isFirstWord = placedAcross.length === 0 && placedDown.length === 0;

            let candidatePositions = [];

            if (isFirstWord) {
                // Place in middle-ish
                const startX = Math.floor(GRID_SIZE / 2) - Math.floor(wordObj.length / 2);
                const startY = Math.floor(GRID_SIZE / 2);
                candidatePositions.push({ x: startX, y: startY });
            } else {
                // Find all possible intersections
                // Iterate through the grid to find letters that match letters in our word
                for (let y = 0; y < GRID_SIZE; y++) {
                    for (let x = 0; x < GRID_SIZE; x++) {
                        if (grid[y][x]) { // If there is a letter on the grid
                            // Check if this letter exists in our current word
                            for (let charIdx = 0; charIdx < wordObj.length; charIdx++) {
                                if (wordObj.word[charIdx] === grid[y][x]) {
                                    // Calculate where the word would start if we intersect at charIdx
                                    const potentialStartX = dir === 'across' ? x - charIdx : x;
                                    const potentialStartY = dir === 'down' ? y - charIdx : y;

                                    // Add to candidates if in bounds
                                    if (potentialStartX >= 0 && potentialStartY >= 0) {
                                        candidatePositions.push({ x: potentialStartX, y: potentialStartY });
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Shuffle candidates to add randomness
            candidatePositions = shuffle(candidatePositions);

            for (const pos of candidatePositions) {
                const canPlaceResult = canPlace(grid, wordObj, pos.x, pos.y, dir);

                // Rule: Must intersect unless it's the very first word
                if (canPlaceResult && (isFirstWord || canPlaceResult.hasIntersection)) {
                    // Write to new grid copy
                    const newGrid = grid.map(row => [...row]);
                    for (let k = 0; k < wordObj.length; k++) {
                        if (dir === 'across') newGrid[pos.y][pos.x + k] = wordObj.word[k];
                        else newGrid[pos.y + k][pos.x] = wordObj.word[k];
                    }

                    const newRemaining = remainingWords.filter((_, idx) => idx !== i);
                    const newPlacedWord = { ...wordObj, startX: pos.x, startY: pos.y, direction: dir };

                    let result;
                    if (dir === 'across') {
                        result = placeWords(newGrid, newRemaining, [...placedAcross, newPlacedWord], placedDown);
                    } else {
                        result = placeWords(newGrid, newRemaining, placedAcross, [...placedDown, newPlacedWord]);
                    }

                    if (result.success) {
                        return result;
                    }
                }
            }
        }
    }

    return { success: false };
}

export function generateLevel(category) {
    const categoryData = WORD_BANK[category];
    if (!categoryData) throw new Error("Invalid category");

    let words = shuffle([...categoryData.words]);

    // Retry loop
    for (let attempt = 0; attempt < 20; attempt++) {
        // Re-shuffle for each attempt
        words = shuffle(words);
        const grid = createGrid(GRID_SIZE);
        const result = placeWords(grid, words, [], []);

        if (result.success) {
            return {
                grid: result.grid,
                across: result.placedAcross,
                down: result.placedDown,
                theme: categoryData
            };
        }
    }

    throw new Error("Failed to generate valid board after multiple attempts");
}
