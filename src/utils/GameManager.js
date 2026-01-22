export const DIFFICULTY_SETTINGS = {
    beginner: { label: 'Beginner', grid: 3 }, // 3x3 = 9 pieces
    medium: { label: 'Medium', grid: 5 },     // 5x5 = 25 pieces
    hard: { label: 'Hard', grid: 8 },         // 8x8 = 64 pieces
};

export const PREDEFINED_IMAGES = [
    { id: 'img1', url: 'https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=1000&auto=format&fit=crop', label: 'Mountain' },
    { id: 'img2', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1000&auto=format&fit=crop', label: 'Nature' },
    { id: 'img3', url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1000&auto=format&fit=crop', label: 'House' },
    { id: 'img4', url: 'https://images.unsplash.com/photo-1517404215738-15263e9f9178?q=80&w=1000&auto=format&fit=crop', label: 'City' },
    { id: 'img5', url: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=1000&auto=format&fit=crop', label: 'Ocean' },
];

// Classic Drag & Drop: Pieces start in tray (currentPos: null)
export const generatePuzzle = (gridSide) => {
    const pieces = [];
    for (let row = 0; row < gridSide; row++) {
        for (let col = 0; col < gridSide; col++) {
            pieces.push({
                id: `piece-${row}-${col}`,
                correctRow: row,
                correctCol: col,
                currentPos: null,
            });
        }
    }
    return pieces.sort(() => Math.random() - 0.5);
};

// Swap Mode: Pieces start on the board in random positions
export const generateSwapPuzzle = (gridSide) => {
    const pieces = [];
    const positions = [];

    // Generate all possible grid positions
    for (let r = 0; r < gridSide; r++) {
        for (let c = 0; c < gridSide; c++) {
            positions.push({ row: r, col: c });
        }
    }

    // Shuffle positions
    const shuffledPositions = positions.sort(() => Math.random() - 0.5);

    let i = 0;
    for (let row = 0; row < gridSide; row++) {
        for (let col = 0; col < gridSide; col++) {
            pieces.push({
                id: `piece-${row}-${col}`,
                correctRow: row,
                correctCol: col,
                currentPos: shuffledPositions[i], // Assign a random unique position on the board
                isPlaced: false, // In swap mode, 'isPlaced' might act differently or just check if correct
            });
            i++;
        }
    }

    return pieces;
};

// --- Validation Logic ---
export const generateScoreCard = (playerName, level, timeSeconds, moves) => {
    // Simple checksum: (Time * 17 + Moves * 13) in Hex
    const rawCheck = (timeSeconds * 17) + (moves * 13);
    const checksum = rawCheck.toString(16).toUpperCase();

    // Format timestamp
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
        playerName,
        levelLabel: DIFFICULTY_SETTINGS[level]?.label || 'Custom',
        timeSeconds,
        moves,
        checksum: `#${checksum}`,
        timestamp
    };
};
