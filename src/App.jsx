import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { PuzzleBoard } from './components/PuzzleBoard';
import { PuzzlePiece } from './components/PuzzlePiece';
import SetupScreen from './components/SetupScreen';
import { generatePuzzle, generateSwapPuzzle, generateScoreCard, DIFFICULTY_SETTINGS } from './utils/GameManager';
import { RefreshCw, Trophy, Clock, Move } from 'lucide-react';
// import Confetti from 'react-confetti';

function App() {
  const [appState, setAppState] = useState('setup'); // setup | play | win
  const [config, setConfig] = useState({ level: 'medium', img: '', mode: 'classic' });
  const [pieces, setPieces] = useState([]);
  const [activeId, setActiveId] = useState(null); // Restore this for Drag & Drop
  const [selectedPieceId, setSelectedPieceId] = useState(null); // For Swap Mode
  const [playerName, setPlayerName] = useState('');
  const [win, setWin] = useState(false);

  // Stats
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // SEO: Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const level = params.get('level');
    const img = params.get('img');
    const mode = params.get('mode') || 'classic';

    const host = params.get('host');

    if (level && img) {
      // Shared link loaded: Pre-fill config and Host info, but wait for player name.
      setConfig({ level, img, mode, host });
      setAppState('setup');
    }
  }, []);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (timerActive && !win) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, win]);

  const formatTime = (time) => {
    const m = Math.floor(time / 60);
    const s = time % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };



  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const startGame = (level, img, mode, playerName) => {
    setConfig({ level, img, mode });
    setPlayerName(playerName || 'Player 1');
    const gridSide = DIFFICULTY_SETTINGS[level].grid;

    let newPieces;
    if (mode === 'swap') {
      newPieces = generateSwapPuzzle(gridSide);
    } else {
      newPieces = generatePuzzle(gridSide);
    }

    setPieces(newPieces);
    setWin(false);
    setMoves(0);
    setSeconds(0);
    setTimerActive(true);
    setAppState('play');
    setSelectedPieceId(null);
  };

  const resetBoard = () => {
    // Reset tiles but KEEP timer (and moves? user only specified timer, but usually moves reset on board reset. 
    // However, if we track "attempt time", maybe we should reset moves to 0 for the "new" attempt?
    // User said: "timer also reseeting i want like when player click on the buttuon then only tiles will be rest not timer"
    // I will reset the board state (pieces, selection) but NOT the timer.
    // I will reset MOVES to 0 because it's a fresh board arrangement.

    const gridSide = DIFFICULTY_SETTINGS[config.level].grid;
    let newPieces;
    if (config.mode === 'swap') {
      newPieces = generateSwapPuzzle(gridSide);
    } else {
      newPieces = generatePuzzle(gridSide);
    }

    setPieces(newPieces);
    setWin(false);
    setMoves(0); // Reset moves for the new board configuration
    // setSeconds(0); // <-- This is intentionally OMITTED to keep the timer running!
    setSelectedPieceId(null);
  };

  const checkWin = (currentPieces) => {
    // In classic: isPlaced must be true for all.
    // In swap: currentPos must equal correctRow/correctCol for all.

    if (config.mode === 'classic') {
      if (currentPieces.every(p => p.isPlaced)) return true;
    } else {
      // Swap mode check
      const isComplete = currentPieces.every(p =>
        p.currentPos.row === p.correctRow &&
        p.currentPos.col === p.correctCol
      );
      if (isComplete) return true;
    }
    return false;
  };


  // --- Classic Drag & Drop Handlers ---
  const handleDragStart = (event) => {
    if (config.mode !== 'classic') return;
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    if (config.mode !== 'classic') return;
    const { active, over } = event;
    setActiveId(null);

    if (over && active) {
      const pieceData = active.data.current;
      const slotData = over.data.current;

      if (pieceData.row === slotData.row && pieceData.col === slotData.col) {
        setMoves(m => m + 1);
        setPieces((prev) => {
          const updated = prev.map(p => {
            if (p.id === active.id) {
              return { ...p, isPlaced: true, currentPos: { row: slotData.row, col: slotData.col } };
            }
            return p;
          });
          if (checkWin(updated)) {
            setWin(true);
            setTimerActive(false);
          }
          return updated;
        });
      }
    }
  };

  // --- Swap Mode Handlers ---
  const handlePieceClick = (piece) => {
    if (config.mode !== 'swap' || win) return;

    if (selectedPieceId === null) {
      // Select first piece
      setSelectedPieceId(piece.id);
    } else {
      if (selectedPieceId === piece.id) {
        // Deselect
        setSelectedPieceId(null);
        return;
      }

      // Swap!
      setMoves(m => m + 1);
      setPieces(prev => {
        const p1 = prev.find(p => p.id === selectedPieceId);
        const p2 = prev.find(p => p.id === piece.id);

        if (!p1 || !p2) return prev;

        // Create new array with updated piece objects (Swap positions)
        const newPieces = prev.map(p => {
          if (p.id === p1.id) {
            return { ...p, currentPos: { ...p2.currentPos } };
          }
          if (p.id === p2.id) {
            return { ...p, currentPos: { ...p1.currentPos } };
          }
          return p;
        });

        if (checkWin(newPieces)) {
          setWin(true);
          setTimerActive(false);
        }

        return newPieces;
      });
      setSelectedPieceId(null);
    }
  };

  // Derived state
  const activePiece = activeId ? pieces.find(p => p.id === activeId) : null;
  const gridSide = DIFFICULTY_SETTINGS[config.level] ? DIFFICULTY_SETTINGS[config.level].grid : 3;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans overflow-x-hidden">
      {win && <div className="absolute inset-0 pointer-events-none z-50">🎉</div>}

      {appState === 'setup' && (
        <SetupScreen onStartGame={startGame} initialConfig={config} />
      )}

      {appState === 'play' && (
        <div className="flex flex-col h-screen">

          {/* Top Bar: Stats */}
          <div className="bg-gray-800 p-2 shadow-md flex justify-between items-center px-4">
            <button onClick={() => setAppState('setup')} className="text-gray-400 hover:text-white flex items-center gap-2">
              ← Menu
            </button>
            <div className="flex gap-6 font-mono text-xl text-blue-400">
              <div className="flex items-center gap-2"><Clock size={20} /> {formatTime(seconds)}</div>
              <div className="flex items-center gap-2"><Move size={20} /> {moves}</div>
            </div>
            <button onClick={resetBoard} className="p-2 hover:bg-gray-700 rounded-full text-white" title="Reset Tiles (Timer continues)">
              <RefreshCw size={20} />
            </button>
          </div>

          {/* Game Area */}
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className={`flex flex-col ${config.mode === 'classic' ? 'lg:flex-row' : ''} flex-1 p-4 gap-4 overflow-hidden`}>

              {/* Left: The Board (or Center for Swap) */}
              <div className={`flex-1 flex flex-col items-center justify-center transition-all ${config.mode === 'swap' ? 'w-full max-w-2xl mx-auto' : ''}`}>
                <h2 className="text-2xl font-bold text-blue-500 mb-2">
                  {config.mode === 'swap' ? 'Click to Swap' : 'Puzzle Board'}
                </h2>

                <div className="relative w-full">
                  <PuzzleBoard
                    gridSide={gridSide}
                    pieces={pieces}
                    imageUrl={config.img}
                    isSwapMode={config.mode === 'swap'}
                    onPieceClick={handlePieceClick}
                    selectedPieceId={selectedPieceId}
                  />
                </div>
              </div>

              {/* Right: The Tray (Classic Mode Only) */}
              {config.mode === 'classic' && (
                <div className="lg:w-1/3 bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex flex-col h-full overflow-hidden">
                  <h3 className="text-xl font-semibold mb-2">Pieces</h3>
                  <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2 content-start pr-2 custom-scrollbar">
                    {pieces.filter(p => !p.isPlaced).map((piece) => (
                      <div key={piece.id} className="aspect-square relative">
                        <PuzzlePiece
                          {...piece}
                          row={piece.correctRow}
                          col={piece.correctCol}
                          gridSide={gridSide}
                          imageUrl={config.img}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drag Overlay (Classic Only) */}
            {config.mode === 'classic' && (
              <DragOverlay zIndex={100}>
                {activePiece ? (
                  <div className="w-24 h-24" style={{ cursor: 'grabbing' }}>
                    <PuzzlePiece
                      {...activePiece}
                      row={activePiece.correctRow}
                      col={activePiece.correctCol}
                      gridSide={gridSide}
                      imageUrl={config.img}
                      isPlaced={false}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            )}

            {/* Win Modal / Certificate */}
            {win && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                <div className="bg-gray-900 border-4 border-yellow-500/50 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden text-center animate-bounce-in">
                  {/* Decorative background glow */}
                  <div className="absolute inset-0 bg-blue-500/10 pointer-events-none"></div>

                  <div className="relative z-10">
                    <Trophy size={80} className="mx-auto text-yellow-400 mb-4 drop-shadow-glow" />

                    <h2 className="text-3xl font-extrabold uppercase tracking-wider text-yellow-500 mb-1">
                      Certificate of Mastery
                    </h2>
                    <div className="text-gray-400 text-sm mb-6 uppercase tracking-widest">Jigsaw Puzzle Champion</div>

                    <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
                      <div className="text-gray-400 text-sm mb-1">Awarded To</div>
                      <div className="text-2xl font-bold text-white mb-4">{playerName}</div>

                      <div className="grid grid-cols-2 gap-4 border-t border-gray-700 pt-4">
                        <div>
                          <div className="text-blue-400 text-xs font-bold uppercase">Time</div>
                          <div className="text-xl font-mono">{formatTime(seconds)}</div>
                        </div>
                        <div>
                          <div className="text-purple-400 text-xs font-bold uppercase">Moves</div>
                          <div className="text-xl font-mono">{moves}</div>
                        </div>
                      </div>
                    </div>

                    {/* Verification Footer */}
                    <div className="flex justify-between items-end text-[10px] text-gray-500 font-mono mb-6 border-t border-gray-800 pt-2">
                      <div>
                        <div>LEVEL: {DIFFICULTY_SETTINGS[config.level]?.label}</div>
                        <div>MODE: {config.mode.toUpperCase()}</div>
                      </div>
                      <div className="text-right">
                        <div>{new Date().toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          const text = `🧩 JIGSAW CHAMPION 🧩\nName: ${playerName}\nTime: ${formatTime(seconds)}\nMoves: ${moves}\nMode: ${config.mode}`;
                          navigator.clipboard.writeText(text);
                          alert("Result copied! Share it in your group.");
                        }}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-blue-500/50"
                      >
                        Copy Result for Group
                      </button>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setAppState('setup')}
                          className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-gray-300"
                        >
                          Menu
                        </button>
                        <button
                          onClick={() => startGame(config.level, config.img, config.mode, playerName)}
                          className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-gray-300"
                        >
                          Replay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </DndContext>
        </div>
      )}
      {/* Developer Signature */}
      <div className="fixed bottom-3 right-4 text-white/50 text-xs font-light tracking-widest select-none pointer-events-none z-50 opacity-60 hover:opacity-100 transition-opacity">
        Made by Ganesh Pawar
      </div>
    </div>
  );
}

export default App;

