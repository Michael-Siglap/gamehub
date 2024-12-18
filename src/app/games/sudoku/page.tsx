"use client";

import { useState, useEffect, useCallback } from "react";
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
import { RefreshCw, Clock, Trophy, HelpCircle, Settings } from "lucide-react";
import { incrementGamesPlayed, updateTimePlayed } from "@/utils/userStats";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  );
  const [, setMistakes] = useState(0);
  const [showMistakes, setShowMistakes] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );

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
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [board, gameStartTime]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (gameStartTime && !isComplete) {
        setElapsedTime(Math.floor((Date.now() - gameStartTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStartTime, isComplete]);

  const handleChange = useCallback(
    (row: number, col: number, value: string) => {
      const newValue = value === "" ? 0 : parseInt(value);
      if (isNaN(newValue) || newValue < 0 || newValue > 9) return;

      const newBoard = board.map((r, i) =>
        i === row ? r.map((c, j) => (j === col ? newValue : c)) : r
      );
      setBoard(newBoard);

      if (showMistakes && !isValidMove(newBoard, row, col, newValue)) {
        setMistakes((prev) => prev + 1);
      }
    },
    [board, showMistakes]
  );

  const resetGame = useCallback(() => {
    setBoard(initialBoard);
    setIsComplete(false);
    setGameStartTime(Date.now());
    setElapsedTime(0);
    setMistakes(0);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getHint = useCallback(() => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    const solution = solveSudoku([...board]);
    if (solution) {
      handleChange(row, col, solution[row][col].toString());
    }
  }, [selectedCell, board, handleChange]);

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
          Sudoku Challenge
        </CardTitle>
        <CardDescription className="text-lg mt-2">
          Fill in the numbers from 1-9 without repeating in any row, column, or
          3x3 box.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex justify-between items-center">
          <Badge
            variant="outline"
            className={`text-lg py-1 px-3 ${
              isComplete
                ? "bg-green-500 text-white"
                : "bg-blue-100 dark:bg-blue-900"
            }`}
          >
            {isComplete ? "Complete!" : "In Progress"}
          </Badge>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <span className="text-lg font-semibold">
              {formatTime(elapsedTime)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetGame}
                    className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset Game</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getHint}
                    disabled={!showHints || isComplete}
                    className="bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Get Hint</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Game Settings</DialogTitle>
                  <DialogDescription>
                    Customize your Sudoku experience
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-mistakes"
                    checked={showMistakes}
                    onCheckedChange={setShowMistakes}
                  />
                  <Label htmlFor="show-mistakes">Show Mistakes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-hints"
                    checked={showHints}
                    onCheckedChange={setShowHints}
                  />
                  <Label htmlFor="show-hints">Allow Hints</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(
                        e.target.value as "easy" | "medium" | "hard"
                      )
                    }
                    className="border rounded p-1"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="grid grid-cols-9 gap-1 mb-4 max-w-md mx-auto bg-white dark:bg-gray-800 p-2 rounded-lg shadow-inner">
          {board.map((row, i) =>
            row.map((cell, j) => (
              <motion.div
                key={`${i}-${j}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Input
                  type="number"
                  min="1"
                  max="9"
                  value={cell || ""}
                  onChange={(e) => handleChange(i, j, e.target.value)}
                  className={`w-10 h-10 text-center p-0 font-bold ${
                    selectedCell &&
                    selectedCell[0] === i &&
                    selectedCell[1] === j
                      ? "ring-2 ring-blue-500"
                      : ""
                  } ${
                    showMistakes &&
                    cell !== 0 &&
                    !isValidMove(board, i, j, cell)
                      ? "bg-red-200 dark:bg-red-900"
                      : ""
                  }`}
                  style={{
                    borderWidth: j % 3 === 2 ? "0 2px 0 0" : "0",
                    borderBottomWidth: i % 3 === 2 ? "2px" : "0",
                    backgroundColor:
                      initialBoard[i][j] !== 0 ? "var(--muted)" : "transparent",
                    color:
                      initialBoard[i][j] !== 0
                        ? "var(--muted-foreground)"
                        : "var(--foreground)",
                  }}
                  readOnly={initialBoard[i][j] !== 0}
                  onFocus={() => setSelectedCell([i, j])}
                  onBlur={() => setSelectedCell(null)}
                />
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground italic">
          Tip: Start with the numbers that have the fewest possibilities.
        </p>
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Badge
                variant="outline"
                className="bg-green-500 text-white px-3 py-1"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Solved in {formatTime(elapsedTime)}!
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </CardFooter>
    </Card>
  );
}

function isBoardComplete(board: number[][]) {
  return board.every((row) => row.every((cell) => cell !== 0));
}

function isValidMove(
  board: number[][],
  row: number,
  col: number,
  value: number
): boolean {
  // Check row
  if (board[row].includes(value)) return false;

  // Check column
  if (board.some((r) => r[col] === value)) return false;

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === value) return false;
    }
  }

  return true;
}

function solveSudoku(board: number[][]): number[][] | null {
  const emptyCell = findEmptyCell(board);
  if (!emptyCell) return board; // Puzzle is solved

  const [row, col] = emptyCell;

  for (let num = 1; num <= 9; num++) {
    if (isValidMove(board, row, col, num)) {
      board[row][col] = num;
      if (solveSudoku(board)) return board;
      board[row][col] = 0; // Backtrack
    }
  }

  return null; // No solution exists
}

function findEmptyCell(board: number[][]): [number, number] | null {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) return [i, j];
    }
  }
  return null;
}
