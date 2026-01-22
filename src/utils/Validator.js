export const calculateHash = (timeSeconds, moves) => {
    // Must match GameManager.js logic exactly
    // (Time * 17) + (Moves * 13)
    const raw = (parseInt(timeSeconds) * 17) + (parseInt(moves) * 13);
    return `#${raw.toString(16).toUpperCase()}`;
};
