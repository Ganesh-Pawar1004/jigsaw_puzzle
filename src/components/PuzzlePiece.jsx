import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export const PuzzlePiece = ({ id, row, col, gridSide, imageUrl, isPlaced }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { row, col },
        disabled: isPlaced,
    });

    // Calculate background position
    const percentage = 100 / (gridSide - 1);
    const bgX = col * percentage;
    const bgY = row * percentage;

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        backgroundImage: `url(${imageUrl})`,
        backgroundPosition: `${bgX}% ${bgY}%`,
        backgroundSize: `${gridSide * 100}% ${gridSide * 100}%`,
        width: '100%',
        height: '100%',
        cursor: isPlaced ? 'default' : 'grab',
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
        boxShadow: isDragging ? '0 10px 20px rgba(0,0,0,0.3)' : 'inset 0 0 1px rgba(0,0,0,0.5)',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`rounded-sm ${isPlaced ? '' : 'hover:scale-105 transition-transform'}`}
        />
    );
};
