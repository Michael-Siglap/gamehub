"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Timer } from "lucide-react";
import { incrementGamesPlayed, updateTimePlayed } from "@/utils/userStats";
import { motion } from "framer-motion";
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
      updateTimePlayed(gameDuration);
      incrementGamesPlayed("Memory Game");
      setIsPlaying(false);
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
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8">
      <Card className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-md border-none">
        <CardHeader>
          <CardTitle className="text-3xl text-white">Memory Game</CardTitle>
          <CardDescription className="text-gray-200">
            Match all the pairs to win!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <Badge
              variant="outline"
              className="text-lg py-1 px-3 bg-white/20 text-white"
            >
              Moves: {moves}
            </Badge>
            <Badge
              variant="outline"
              className="text-lg py-1 px-3 bg-white/20 text-white"
            >
              <Timer className="mr-2 h-4 w-4" />
              {formatTime(time)}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={resetGame}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Game
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {cards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ rotateY: 0 }}
                animate={{
                  rotateY:
                    flipped.includes(index) || solved.includes(index) ? 180 : 0,
                }}
                transition={{ duration: 0.6 }}
                className="perspective"
              >
                <Button
                  variant={
                    flipped.includes(index) || solved.includes(index)
                      ? "default"
                      : "outline"
                  }
                  className="h-20 text-4xl w-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  onClick={() => handleClick(index)}
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
          <p className="text-sm text-gray-200">
            Tip: Try to remember the position of each card you&apos;ve seen.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
