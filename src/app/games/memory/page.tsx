"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { RefreshCw, Timer, Zap } from "lucide-react";
import { incrementGamesPlayed, updateTimePlayed } from "@/utils/userStats";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
const initialCards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);

export default function MemoryGame() {
  const [cards, setCards] = useState(initialCards);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("memory-game");
    if (savedState) {
      const { cards, solved, moves, time } = JSON.parse(savedState);
      setCards(cards);
      setSolved(solved);
      setMoves(moves);
      setTime(time);
    }
    setGameStartTime(Date.now());
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "memory-game",
      JSON.stringify({ cards, solved, moves, time })
    );
  }, [cards, solved, moves, time]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (flipped.length === 2) {
      setDisabled(true);
      if (cards[flipped[0]] === cards[flipped[1]]) {
        setSolved([...solved, ...flipped]);
        setFlipped([]);
        setDisabled(false);
        setMoves((prevMoves) => prevMoves + 1);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
          setMoves((prevMoves) => prevMoves + 1);
        }, 1000);
      }
    }
  }, [flipped, cards, solved]);

  useEffect(() => {
    if (solved.length === cards.length && gameStartTime) {
      const gameEndTime = Date.now();
      const gameDuration = Math.floor((gameEndTime - gameStartTime) / 1000);
      updateTimePlayed("Memory Game", gameDuration);
      incrementGamesPlayed("Memory Game");
      setIsPlaying(false);
      setShowCongrats(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [solved, cards.length, gameStartTime]);

  const handleClick = (index: number) => {
    if (!isPlaying) {
      setIsPlaying(true);
      setGameStartTime(Date.now());
    }
    if (!disabled && !flipped.includes(index) && !solved.includes(index)) {
      setFlipped([...flipped, index]);
    }
  };

  const resetGame = () => {
    setCards(initialCards.sort(() => Math.random() - 0.5));
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setTime(0);
    setIsPlaying(false);
    setGameStartTime(Date.now());
    setShowCongrats(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 sm:p-8 flex items-center justify-center">
      <Card className="w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl mx-auto bg-white/10 backdrop-blur-md border-none shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-white mb-2">
            Memory Game
          </CardTitle>
          <CardDescription className="text-xl text-gray-200">
            Match all the pairs to win!
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="mb-6 flex justify-center items-center gap-4">
            <div className="flex items-center justify-center bg-white/20 rounded-full p-2 w-32 h-32">
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto text-yellow-300 mb-1" />
                <span className="text-3xl font-bold text-white">{moves}</span>
                <span className="block text-xs text-gray-200">Moves</span>
              </div>
            </div>
            <div className="flex items-center justify-center bg-white/20 rounded-full p-2 w-32 h-32">
              <div className="text-center">
                <Timer className="w-8 h-8 mx-auto text-cyan-300 mb-1" />
                <span className="text-3xl font-bold text-white">
                  {formatTime(time)}
                </span>
                <span className="block text-xs text-gray-200">Time</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetGame}
            className="absolute top-4 right-4 bg-white/10 text-white hover:bg-white/20 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 p-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="sr-only">Reset Game</span>
          </Button>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
            {cards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ rotateY: 0 }}
                animate={{
                  rotateY:
                    flipped.includes(index) || solved.includes(index) ? 180 : 0,
                }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                className="perspective"
              >
                <Button
                  variant={
                    flipped.includes(index) || solved.includes(index)
                      ? "default"
                      : "outline"
                  }
                  className={`h-20 sm:h-24 text-3xl sm:text-4xl w-full bg-gradient-to-br ${
                    flipped.includes(index) || solved.includes(index)
                      ? "from-blue-400 to-purple-500"
                      : "from-gray-700 to-gray-900"
                  } hover:from-blue-500 hover:to-purple-600 text-white rounded-xl shadow-md transition-all duration-200 ease-in-out transform hover:scale-105`}
                  onClick={() => handleClick(index)}
                  disabled={disabled || solved.includes(index)}
                >
                  <span className="card-content">
                    {flipped.includes(index) || solved.includes(index)
                      ? card
                      : "?"}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm sm:text-base text-gray-200 text-center w-full">
            Tip: Focus and try to remember the position of each card you&apos;ve
            seen.
          </p>
        </CardFooter>
      </Card>
      <AnimatePresence>
        {showCongrats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <Card className="w-full max-w-md mx-auto bg-white text-center p-8">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-600 mb-4">
                  Congratulations!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-24 h-24 mx-auto mb-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="w-16 h-16 text-white" />
                </div>
                <p className="text-xl mb-4">
                  You&apos;ve completed the game in:
                </p>
                <p className="text-2xl font-bold mb-2">{formatTime(time)}</p>
                <p className="text-lg">with {moves} moves</p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={resetGame}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  Play Again
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
