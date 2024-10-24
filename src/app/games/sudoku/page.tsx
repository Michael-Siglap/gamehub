"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Check } from "lucide-react";
import { incrementGamesPlayed, updateTimePlayed } from "@/utils/userStats";

const initialBoard = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

export default function Sudoku() {
  const [board, setBoard] = useState(initialBoard);
  const [isComplete, setIsComplete] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

  useEffect(() => {
    const savedState = localStorage.getItem("sudoku");
    if (savedState) {
      setBoard(JSON.parse(savedState));
    }
    setGameStartTime(Date.now());
  }, []);

  useEffect(() => {
    localStorage.setItem("sudoku", JSON.stringify(board));
    const newIsComplete = isBoardComplete(board);
    setIsComplete(newIsComplete);

    if (newIsComplete) {
      const gameEndTime = Date.now();
      const gameDuration = Math.floor(
        (gameEndTime - (gameStartTime || gameEndTime)) / 1000
      );
      updateTimePlayed(gameDuration);
      incrementGamesPlayed("Sudoku");
    }
  }, [board, gameStartTime]);

  const handleChange = (row: number, col: number, value: string) => {
    const newValue = value === "" ? 0 : parseInt(value);
    if (isNaN(newValue) || newValue < 0 || newValue > 9) return;

    const newBoard = board.map((r, i) =>
      i === row ? r.map((c, j) => (j === col ? newValue : c)) : r
    );
    setBoard(newBoard);
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setIsComplete(false);
    setGameStartTime(Date.now());
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl">Sudoku</CardTitle>
        <CardDescription>
          Fill in the numbers from 1-9 without repeating in any row, column, or
          3x3 box.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <Badge
            variant="outline"
            className={`text-lg py-1 px-3 ${
              isComplete ? "bg-green-500 text-white" : ""
            }`}
          >
            {isComplete ? "Complete!" : "In Progress"}
          </Badge>
          <Button variant="outline" size="sm" onClick={resetGame}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Game
          </Button>
        </div>
        <div className="grid grid-cols-9 gap-1 mb-4 max-w-md mx-auto">
          {board.map((row, i) =>
            row.map((cell, j) => (
              <Input
                key={`${i}-${j}`}
                type="number"
                min="1"
                max="9"
                value={cell || ""}
                onChange={(e) => handleChange(i, j, e.target.value)}
                className="w-10 h-10 text-center p-0"
                style={{
                  borderWidth: j % 3 === 2 ? "0 2px 0 0" : "0",
                  borderBottomWidth: i % 3 === 2 ? "2px" : "0",
                  backgroundColor:
                    initialBoard[i][j] !== 0 ? "var(--muted)" : "transparent",
                }}
                readOnly={initialBoard[i][j] !== 0}
              />
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Tip: Start with the numbers that have the fewest possibilities.
        </p>
        {isComplete && (
          <Badge variant="outline" className="bg-green-500 text-white">
            <Check className="mr-2 h-4 w-4" />
            Solved!
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}

function isBoardComplete(board: number[][]) {
  return board.every((row) => row.every((cell) => cell !== 0));
}
