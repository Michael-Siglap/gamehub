// src/app/games/crossword/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { incrementGamesPlayed, updateTimePlayed } from "@/utils/userStats";
import { Confetti } from "@/components/confetti";
import { Share2, HelpCircle, RefreshCw } from "lucide-react";

// Type Definitions
interface Word {
  word: string;
  clue: string;
}

interface Cell {
  letter: string;
  number: number | null;
  isStart: { across: boolean; down: boolean };
}

interface Clue {
  number: number;
  clue: string;
  direction: "across" | "down";
  answer: string;
  startX: number;
  startY: number;
}

const difficulties = {
  easy: { size: 10, wordCount: 8 },
  medium: { size: 13, wordCount: 12 },
  hard: { size: 15, wordCount: 15 },
};

// Fetch words from internal API route
const fetchWords = async (wordCount: number): Promise<Word[]> => {
  const response = await fetch(`/api/fetchWords?wordCount=${wordCount}`);
  if (!response.ok) {
    throw new Error("Failed to fetch words");
  }
  const data: Word[] = await response.json();
  return data;
};

// Generate Crossword
const generateCrossword = async (
  difficulty: "easy" | "medium" | "hard"
): Promise<{ grid: Cell[][]; clues: Clue[] }> => {
  const { size, wordCount } = difficulties[difficulty];
  const wordList = await fetchWords(wordCount);

  // Initialize Grid
  const grid: Cell[][] = Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => ({
          letter: "",
          number: null,
          isStart: { across: false, down: false },
        }))
    );

  const clues: Clue[] = [];
  let wordNumber = 1;

  const shuffledWords = [...wordList].sort(() => Math.random() - 0.5);

  // Function to place a word on the grid
  const placeWord = (
    word: string,
    clue: string,
    startX: number,
    startY: number,
    direction: "across" | "down"
  ) => {
    let x = startX;
    let y = startY;
    const newClue: Clue = {
      number: wordNumber,
      clue,
      direction,
      answer: word,
      startX,
      startY,
    };
    clues.push(newClue);

    for (let i = 0; i < word.length; i++) {
      if (x < size && y < size) {
        grid[y][x].letter = word[i];
        if (i === 0) {
          grid[y][x].number = wordNumber;
          grid[y][x].isStart[direction] = true;
        }
        if (direction === "across") x++;
        else y++;
      }
    }
    wordNumber++;
  };

  // Function to check if a word can be placed at a position
  const canPlaceWord = (
    grid: Cell[][],
    word: string,
    startX: number,
    startY: number,
    direction: "across" | "down",
    size: number
  ): boolean => {
    let x = startX;
    let y = startY;

    for (let i = 0; i < word.length; i++) {
      if (x >= size || y >= size) return false;
      const cell = grid[y][x];

      if (cell.letter && cell.letter !== word[i]) return false;

      // Check for adjacent letters to ensure proper crossword structure
      if (direction === "across") {
        if (x > 0 && grid[y][x - 1].letter && i === 0) return false;
        if (x < size - 1 && grid[y][x + 1].letter && i === word.length - 1)
          return false;
        if (y > 0 && grid[y - 1][x].letter) return false;
        if (y < size - 1 && grid[y + 1][x].letter) return false;
      } else {
        if (y > 0 && grid[y - 1][x].letter && i === 0) return false;
        if (y < size - 1 && grid[y + 1][x].letter && i === word.length - 1)
          return false;
        if (x > 0 && grid[y][x - 1].letter) return false;
        if (x < size - 1 && grid[y][x + 1].letter) return false;
      }

      // Move to next cell based on direction
      if (direction === "across") x++;
      else y++;
    }

    return true;
  };

  // Place words on the grid
  for (const wordObj of shuffledWords) {
    const direction: "across" | "down" =
      clues.filter((clue) => clue.direction === "across").length >
      clues.filter((clue) => clue.direction === "down").length
        ? "down"
        : "across";

    let placed = false;
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const startX = Math.floor(Math.random() * size);
      const startY = Math.floor(Math.random() * size);
      if (canPlaceWord(grid, wordObj.word, startX, startY, direction, size)) {
        placeWord(wordObj.word, wordObj.clue, startX, startY, direction);
        placed = true;
      }
    }
  }

  return { grid, clues };
};

// Crossword Component
export default function Crossword() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [puzzle, setPuzzle] = useState<{ grid: Cell[][]; clues: Clue[] }>({
    grid: [],
    clues: [],
  });
  const [userInput, setUserInput] = useState<string[][]>([]);
  const [focusedCell, setFocusedCell] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [completed, setCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [isDaily, setIsDaily] = useState(false);
  const { toast } = useToast();
  const gridRef = useRef<HTMLDivElement>(null);

  // Initialize Puzzle on Mount or Difficulty Change
  useEffect(() => {
    const initializePuzzle = async () => {
      try {
        const newPuzzle = await generateCrossword(difficulty);
        setPuzzle(newPuzzle);
        setUserInput(
          Array(newPuzzle.grid.length)
            .fill(null)
            .map(() => Array(newPuzzle.grid[0].length).fill(""))
        );
        setCompleted(false);
        setTimer(0);
        setGameStartTime(null);
        setFocusedCell(null);
      } catch (error) {
        console.error("Error generating crossword:", error);
        toast({
          title: "Error",
          description: "Failed to generate crossword. Please try again later.",
        });
      }
    };
    initializePuzzle();
  }, [difficulty]);

  // Timer Effect
  useEffect(() => {
    if (!completed && gameStartTime !== null) {
      const interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - gameStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [completed, gameStartTime]);

  // Save State to Local Storage
  useEffect(() => {
    localStorage.setItem(
      "crosswordState",
      JSON.stringify({
        puzzle,
        userInput,
        timer,
        gameStartTime,
        difficulty,
        isDaily,
      })
    );
  }, [puzzle, userInput, timer, gameStartTime, difficulty, isDaily]);

  // Load State from Local Storage on Mount
  useEffect(() => {
    const savedState = localStorage.getItem("crosswordState");
    if (savedState) {
      const { puzzle, userInput, timer, gameStartTime, difficulty, isDaily } =
        JSON.parse(savedState);
      setPuzzle(puzzle);
      setUserInput(userInput);
      setTimer(timer);
      setGameStartTime(gameStartTime);
      setDifficulty(difficulty);
      setIsDaily(isDaily);
    } else {
      resetGame();
    }
  }, []);

  // Handle Input Change
  const handleInputChange = (x: number, y: number, value: string) => {
    if (!gameStartTime) setGameStartTime(Date.now());
    const newInput = [...userInput];
    newInput[y][x] = value.toUpperCase();
    setUserInput(newInput);

    // Move focus to next cell
    if (value && direction === "across" && x < puzzle.grid[0].length - 1) {
      setFocusedCell({ x: x + 1, y });
    } else if (value && direction === "down" && y < puzzle.grid.length - 1) {
      setFocusedCell({ x, y: y + 1 });
    }

    // Check if puzzle is completed
    if (
      newInput.every((row, yIdx) =>
        row.every(
          (cell, xIdx) =>
            !puzzle.grid[yIdx][xIdx].letter ||
            cell === puzzle.grid[yIdx][xIdx].letter
        )
      )
    ) {
      setCompleted(true);
      const gameDuration = Math.floor(
        (Date.now() - (gameStartTime || Date.now())) / 1000
      );
      updateTimePlayed(gameDuration);
      incrementGamesPlayed("Crossword");
      toast({
        title: "Congratulations!",
        description: `You completed the ${
          isDaily ? "daily " : ""
        }puzzle in ${formatTime(gameDuration)}!`,
      });
    }
  };

  // Handle Cell Focus
  const handleCellFocus = (x: number, y: number) => {
    if (focusedCell?.x === x && focusedCell?.y === y) {
      setDirection((prev) => (prev === "across" ? "down" : "across"));
    }
    setFocusedCell({ x, y });
  };

  // Handle Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!focusedCell) return;
    const { x, y } = focusedCell;
    switch (e.key) {
      case "ArrowRight":
        if (x < puzzle.grid[0].length - 1) setFocusedCell({ x: x + 1, y });
        break;
      case "ArrowLeft":
        if (x > 0) setFocusedCell({ x: x - 1, y });
        break;
      case "ArrowDown":
        if (y < puzzle.grid.length - 1) setFocusedCell({ x, y: y + 1 });
        break;
      case "ArrowUp":
        if (y > 0) setFocusedCell({ x, y: y - 1 });
        break;
      default:
        break;
    }
  };

  // Reset Game
  const resetGame = async (daily = false) => {
    const newDifficulty = daily ? "medium" : difficulty;
    try {
      const newPuzzle = await generateCrossword(newDifficulty);
      setPuzzle(newPuzzle);
      setUserInput(
        Array(newPuzzle.grid.length)
          .fill(null)
          .map(() => Array(newPuzzle.grid[0].length).fill(""))
      );
      setCompleted(false);
      setTimer(0);
      setGameStartTime(null);
      setFocusedCell(null);
      setIsDaily(daily);
      setDifficulty(newDifficulty);
    } catch (error) {
      console.error("Error resetting game:", error);
      toast({
        title: "Error",
        description: "Failed to reset game. Please try again later.",
      });
    }
  };

  // Get Hint for Focused Cell
  const getHint = () => {
    if (!focusedCell) return;
    const { x, y } = focusedCell;
    const correctLetter = puzzle.grid[y][x].letter;
    if (correctLetter) {
      const newInput = [...userInput];
      newInput[y][x] = correctLetter;
      setUserInput(newInput);
      toast({
        title: "Hint",
        description: `The correct letter is "${correctLetter}"`,
      });
    }
  };

  // Share Puzzle
  const sharePuzzle = () => {
    const shareText = `I completed the ${
      isDaily ? "daily " : ""
    }crossword puzzle on GameHub in ${formatTime(
      timer
    )}! Can you beat my time? Play now at [YourGameHubURL]`;
    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "Shared!",
        description: "The puzzle result has been copied to your clipboard.",
      });
    });
  };

  // Format Time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl">
          {isDaily ? "Daily Crossword" : "Crossword Puzzle"}
        </CardTitle>
        <CardDescription>Fill in the crossword puzzle!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
          <Badge variant="outline" className="text-lg py-1 px-3">
            Time: {formatTime(timer)}
          </Badge>
          <div className="flex items-center space-x-2">
            <Select
              value={difficulty}
              onValueChange={(value: "easy" | "medium" | "hard") =>
                setDifficulty(value)
              }
              disabled={isDaily}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetGame(false)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              New Puzzle
            </Button>
            <Button variant="outline" size="sm" onClick={() => resetGame(true)}>
              Daily Puzzle
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="overflow-x-auto"
            ref={gridRef}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${
                  puzzle.grid[0]?.length || 0
                }, minmax(0, 1fr))`,
                width: `${(puzzle.grid[0]?.length || 0) * 2.5}rem`,
              }}
            >
              {puzzle.grid.map((row, y) =>
                row.map((cell, x) => (
                  <div key={`${x}-${y}`} className="relative">
                    {cell.number && (
                      <span className="absolute top-0 left-0 text-xs">
                        {cell.number}
                      </span>
                    )}
                    <Input
                      type="text"
                      maxLength={1}
                      value={userInput[y]?.[x] || ""}
                      onChange={(e) => handleInputChange(x, y, e.target.value)}
                      onFocus={() => handleCellFocus(x, y)}
                      className={`w-10 h-10 text-center p-0 ${
                        cell.letter ? "bg-secondary" : "bg-background"
                      } ${
                        focusedCell?.x === x && focusedCell?.y === y
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      disabled={!cell.letter || completed}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold">Across</h3>
            {puzzle.clues
              .filter((clue) => clue.direction === "across")
              .map((clue) => (
                <p key={`across-${clue.number}`}>
                  {clue.number}. {clue.clue}
                </p>
              ))}
            <h3 className="font-bold mt-4">Down</h3>
            {puzzle.clues
              .filter((clue) => clue.direction === "down")
              .map((clue) => (
                <p key={`down-${clue.number}`}>
                  {clue.number}. {clue.clue}
                </p>
              ))}
          </div>
        </div>
        <div className="mt-4 flex justify-center space-x-2">
          <Button onClick={getHint} disabled={completed}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Hint
          </Button>
          <Button onClick={sharePuzzle} disabled={!completed}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Tip: Use arrow keys to navigate, and click a cell twice to switch
          between across and down.
        </p>
      </CardFooter>
      {completed && <Confetti />}
    </Card>
  );
}
