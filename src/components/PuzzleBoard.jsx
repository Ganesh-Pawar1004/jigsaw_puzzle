import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const PuzzleSlot = ({ row, col, children, isCorrect }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `slot-${row}-${col}`,
        data: { row, col },
    });

    const style = {
        backgroundColor: isOver ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative w-full h-full border border-white/20 flex items-center justify-center ${isCorrect ? 'z-0' : 'z-10'}`}
        >
            {children}
        </div>
    );
};

export const PuzzleBoard = ({ gridSide, pieces, imageUrl, isSwapMode, onPieceClick, selectedPieceId }) => {
    const grid = [];
    for (let r = 0; r < gridSide; r++) {
        for (let c = 0; c < gridSide; c++) {
            const placedPiece = pieces.find(p => p.currentPos && p.currentPos.row === r && p.currentPos.col === c);

            const isSelected = placedPiece && selectedPieceId === placedPiece.id;

            grid.push(
                <PuzzleSlot key={`slot-${r}-${c}`} row={r} col={c} isCorrect={!isSwapMode && placedPiece?.id === `piece-${r}-${c}`}>
                    {placedPiece && (
                        <div
                            className={`w-full h-full relative group ${isSwapMode ? 'cursor-pointer' : ''}`}
                            onClick={() => isSwapMode && onPieceClick(placedPiece)}
                        >
                            {/* Visual Highlight for selection */}
                            {isSelected && (
                                <div className="absolute inset-0 z-20 border-4 border-yellow-400 animate-pulse pointer-events-none rounded-sm"></div>
                            )}

                            <div
                                style={{
                                    backgroundImage: `url(${imageUrl})`,
                                    backgroundPosition: `${(placedPiece.correctCol * 100) / (gridSide - 1)}% ${(placedPiece.correctRow * 100) / (gridSide - 1)}%`,
                                    backgroundSize: `${gridSide * 100}% ${gridSide * 100}%`,
                                    width: '100%',
                                    height: '100%',
                                }}
                                className={`w-full h-full transition-transform ${isSwapMode && !isSelected ? 'hover:scale-105 z-10 hover:z-20' : ''}`}
                            />
                        </div>
                    )}
                </PuzzleSlot>
            );
        }
    }

    return (
        <div
            className="grid gap-0.5 bg-gray-800 p-2 rounded-lg shadow-2xl"
            style={{
                gridTemplateColumns: `repeat(${gridSide}, 1fr)`,
                gridTemplateRows: `repeat(${gridSide}, 1fr)`,
                aspectRatio: '1/1',
                width: '100%',
                maxWidth: '600px',
                backgroundSize: 'cover'
            }}
        >
            {grid}
        </div>
    );
};
