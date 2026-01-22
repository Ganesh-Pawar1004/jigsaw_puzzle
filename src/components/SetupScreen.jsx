import React, { useState, useEffect } from 'react';
import { DIFFICULTY_SETTINGS, PREDEFINED_IMAGES } from '../utils/GameManager';
import { Share2, Play } from 'lucide-react';

const SetupScreen = ({ onStartGame, initialConfig }) => {
    // Determine if we are joining an existing game (Player Mode) or creating one (Host Mode)
    const isJoining = !!initialConfig?.host;

    const [selectedDifficulty, setSelectedDifficulty] = useState(initialConfig?.level || 'medium');
    const [selectedImage, setSelectedImage] = useState(initialConfig?.img || PREDEFINED_IMAGES[0].url);
    const [gameplayMode, setGameplayMode] = useState(initialConfig?.mode || 'classic');
    const [playerName, setPlayerName] = useState('');
    const [customUrl, setCustomUrl] = useState('');

    // If joining, sync state with props (redundant if passed as initial, but safe)
    useEffect(() => {
        if (isJoining) {
            setSelectedDifficulty(initialConfig.level);
            setSelectedImage(initialConfig.img);
            setGameplayMode(initialConfig.mode);
        }
    }, [initialConfig, isJoining]);

    const handleStart = () => {
        if (!playerName.trim()) {
            alert("Please enter your name to play!");
            return;
        }
        onStartGame(selectedDifficulty, customUrl || selectedImage, gameplayMode, playerName);
    };

    const generateShareLink = () => {
        if (!playerName.trim()) {
            alert("Please enter your name as the Host!");
            return;
        }
        const params = new URLSearchParams();
        params.set('level', selectedDifficulty);
        params.set('img', customUrl || selectedImage);
        params.set('mode', gameplayMode);
        params.set('host', playerName); // Add Host Name

        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        navigator.clipboard.writeText(url);
        alert(`Link copied! Send it to your friends to join ${playerName}'s game.`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Jigsaw Master
            </h1>

            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-2xl w-full space-y-8 relative">

                {/* Header for Join Mode */}
                {isJoining && (
                    <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-4 text-center">
                        <div className="text-sm text-blue-300 uppercase tracking-widest mb-1">Invitation</div>
                        <h2 className="text-2xl font-bold">Join {initialConfig.host}'s Game</h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Map: {DIFFICULTY_SETTINGS[initialConfig.level].label} • Mode: {initialConfig.mode === 'swap' ? 'Tile Swap' : 'Classic'}
                        </p>
                    </div>
                )}

                {/* Name Selection */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-300">
                        {isJoining ? 'Who is playing?' : 'Host Profile'}
                    </h2>
                    <input
                        type="text"
                        placeholder={isJoining ? "Enter your player name" : "Enter your name (Host)"}
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Configuration (Hidden if Joining) */}
                {!isJoining && (
                    <>
                        {/* Image Selection */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-300">Choose an Image</h2>
                            <div className="grid grid-cols-5 gap-2">
                                {PREDEFINED_IMAGES.map((img) => (
                                    <button
                                        key={img.id}
                                        onClick={() => { setSelectedImage(img.url); setCustomUrl(''); }}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img.url && !customUrl ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Or paste a custom image URL..."
                                    value={customUrl}
                                    onChange={(e) => setCustomUrl(e.target.value)}
                                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Difficulty Selection */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-300">Select Difficulty</h2>
                            <div className="grid grid-cols-3 gap-4">
                                {Object.entries(DIFFICULTY_SETTINGS).map(([key, setting]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedDifficulty(key)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center ${selectedDifficulty === key ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}`}
                                    >
                                        <div className="font-bold text-lg">{setting.label}</div>
                                        <div className="text-xs text-gray-400">{setting.grid}x{setting.grid} ({setting.grid * setting.grid} pcs)</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Game Mode Selection */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-300">Game Mode</h2>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setGameplayMode('classic')}
                                    className={`flex-1 p-4 rounded-lg border-2 transition-all text-center ${gameplayMode === 'classic' ? 'border-green-500 bg-green-500/10' : 'border-gray-600 hover:border-gray-500'}`}
                                >
                                    <div className="font-bold text-lg">Drag & Drop</div>
                                    <div className="text-xs text-gray-400">Classic experience</div>
                                </button>
                                <button
                                    onClick={() => setGameplayMode('swap')}
                                    className={`flex-1 p-4 rounded-lg border-2 transition-all text-center ${gameplayMode === 'swap' ? 'border-pink-500 bg-pink-500/10' : 'border-gray-600 hover:border-gray-500'}`}
                                >
                                    <div className="font-bold text-lg">Tile Swap</div>
                                    <div className="text-xs text-gray-400">Click to swap pieces</div>
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-700">

                    {/* Share Button (Only if Host) */}
                    {!isJoining && (
                        <button
                            onClick={generateShareLink}
                            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Share2 size={20} />
                            Share Challenge
                        </button>
                    )}

                    {/* Play Button */}
                    <button
                        onClick={handleStart}
                        className="flex-[2] px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25 transition-all"
                    >
                        <Play size={24} />
                        {isJoining ? 'Enter Selection' : 'Start Game'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetupScreen;
