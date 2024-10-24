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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl">Memory Game</CardTitle>
        <CardDescription>Match all the pairs to win!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <Badge variant="outline" className="text-lg py-1 px-3">
            Moves: {moves}
          </Badge>
          <Badge variant="outline" className="text-lg py-1 px-3">
            <Timer className="mr-2 h-4 w-4" />
            {formatTime(time)}
          </Badge>
          <Button variant="outline" size="sm" onClick={resetGame}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Game
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {cards.map((card, index) => (
            <Button
              key={index}
              variant={
                flipped.includes(index) || solved.includes(index)
                  ? "default"
                  : "outline"
              }
              className="h-20 text-4xl"
              onClick={() => handleClick(index)}
            >
              {flipped.includes(index) || solved.includes(index) ? card : "?"}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Tip: Try to remember the position of each card you&apos;ve seen.
        </p>
      </CardFooter>
    </Card>
  );
}
