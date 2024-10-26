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
  isBlack: boolean;
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
  easy: { size: 10, wordCount: 10 },
  medium: { size: 13, wordCount: 14 },
  hard: { size: 20, wordCount: 25 },
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

// Generate Crossword with enhanced intersecting words
const generateCrossword = async (
  difficulty: "easy" | "medium" | "hard"
): Promise<{ grid: Cell[][]; clues: Clue[] }> => {
  const { size, wordCount } = difficulties[difficulty];
  let wordList = await fetchWords(wordCount);

  // Shuffle word list to ensure randomness
  wordList = shuffleArray(wordList);

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
          isBlack: true, // All cells start as black squares
        }))
    );

  const clues: Clue[] = [];
  let wordNumber = 1;

  // Start by placing the first word in the middle
  const firstWordObj = wordList.shift();
  if (!firstWordObj) throw new Error("No words to place");
  const startX =
    Math.floor(size / 2) - Math.floor(firstWordObj.word.length / 2);
  const startY = Math.floor(size / 2);

  placeWord(
    grid,
    firstWordObj.word,
    firstWordObj.clue,
    startX,
    startY,
    "across",
    clues,
    wordNumber++
  );

  // Now, try to place the remaining words with maximum intersections
  for (const wordObj of wordList) {
    let placed = false;
    // Shuffle clues to vary intersections
    const shuffledClues = shuffleArray(clues);
    for (const existingClue of shuffledClues) {
      const intersections = findIntersections(
        wordObj.word,
        existingClue.answer
      );
      // Shuffle intersections to add randomness
      const shuffledIntersections = shuffleArray(intersections);
      for (const intersection of shuffledIntersections) {
        const coord = getCoordinates(
          existingClue,
          intersection.indexExisting,
          intersection.indexNew
        );
        if (
          canPlaceWordAt(
            grid,
            wordObj.word,
            coord.x,
            coord.y,
            oppositeDirection(existingClue.direction)
          )
        ) {
          placeWord(
            grid,
            wordObj.word,
            wordObj.clue,
            coord.x,
            coord.y,
            oppositeDirection(existingClue.direction),
            clues,
            wordNumber++
          );
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
    // If not placed, try to place it anywhere
    if (!placed) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const directions: Array<"across" | "down"> = ["across", "down"];
          for (const dir of directions) {
            if (canPlaceWordAt(grid, wordObj.word, x, y, dir)) {
              placeWord(
                grid,
                wordObj.word,
                wordObj.clue,
                x,
                y,
                dir,
                clues,
                wordNumber++
              );
              placed = true;
              break;
            }
          }
          if (placed) break;
        }
        if (placed) break;
      }
    }
    // If still not placed, skip the word
  }

  // Convert unused black cells to empty cells
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x].letter) {
        grid[y][x].isBlack = false;
      }
    }
  }

  return { grid, clues };
};

// Helper function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Helper function to find common letters between two words
const findIntersections = (word1: string, word2: string) => {
  const intersections: { indexExisting: number; indexNew: number }[] = [];
  for (let i = 0; i < word1.length; i++) {
    const char1 = word1[i].toUpperCase();
    for (let j = 0; j < word2.length; j++) {
      const char2 = word2[j].toUpperCase();
      if (char1 === char2) {
        intersections.push({ indexExisting: j, indexNew: i });
      }
    }
  }
  return intersections;
};

// Helper function to get coordinates for placing a word
const getCoordinates = (
  existingClue: Clue,
  existingIndex: number,
  newIndex: number
) => {
  let x = existingClue.startX;
  let y = existingClue.startY;
  if (existingClue.direction === "across") {
    x += existingIndex;
  } else {
    y += existingIndex;
  }

  if (existingClue.direction === "across") {
    y -= newIndex;
  } else {
    x -= newIndex;
  }

  return { x, y };
};

// Helper function to check if a word can be placed at a position
const canPlaceWordAt = (
  grid: Cell[][],
  word: string,
  x: number,
  y: number,
  direction: "across" | "down"
): boolean => {
  for (let i = 0; i < word.length; i++) {
    const xi = direction === "across" ? x + i : x;
    const yi = direction === "down" ? y + i : y;

    if (xi < 0 || xi >= grid[0].length || yi < 0 || yi >= grid.length) {
      return false;
    }

    const cell = grid[yi][xi];
    const currentLetter = word[i].toUpperCase();

    if (cell.letter) {
      if (cell.letter !== currentLetter) return false;
    } else {
      // Check for adjacent letters to prevent unintended words
      if (
        (direction === "across" &&
          ((yi > 0 && grid[yi - 1][xi].letter) ||
            (yi < grid.length - 1 && grid[yi + 1][xi].letter))) ||
        (direction === "down" &&
          ((xi > 0 && grid[yi][xi - 1].letter) ||
            (xi < grid[0].length - 1 && grid[yi][xi + 1].letter)))
      ) {
        return false;
      }
    }
  }
  // Check surrounding cells for words (optional)
  // You can add more rules here if needed
  return true;
};

// Helper function to place a word on the grid
const placeWord = (
  grid: Cell[][],
  word: string,
  clue: string,
  x: number,
  y: number,
  direction: "across" | "down",
  clues: Clue[],
  wordNumber: number
) => {
  const newClue: Clue = {
    number: wordNumber,
    clue,
    direction,
    answer: word.toUpperCase(),
    startX: x,
    startY: y,
  };
  clues.push(newClue);

  for (let i = 0; i < word.length; i++) {
    const xi = direction === "across" ? x + i : x;
    const yi = direction === "down" ? y + i : y;
    grid[yi][xi].letter = word[i].toUpperCase();
    if (i === 0) {
      grid[yi][xi].number = wordNumber;
      grid[yi][xi].isStart[direction] = true;
    }
  }
};

// Helper function to get the opposite direction
const oppositeDirection = (direction: "across" | "down"): "across" | "down" =>
  direction === "across" ? "down" : "across";

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
    toast({
      title: "Generating New Puzzle",
      description: "Please wait while we generate a new crossword puzzle.",
    });
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
      toast({
        title: "New Puzzle",
        description: "A new crossword puzzle has been generated!",
      });
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
    <Card className="w-full max-w-6xl mx-auto p-2 sm:p-4">
      <CardHeader className="mb-2">
        <CardTitle className="text-2xl sm:text-3xl">
          {isDaily ? "Daily Crossword" : "Crossword Puzzle"}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Fill in the crossword puzzle!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex justify-between items-center flex-wrap gap-2">
          <Badge
            variant="outline"
            className="text-sm sm:text-base py-1 px-2 sm:px-3"
          >
            Time: {formatTime(timer)}
          </Badge>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Select
              value={difficulty}
              onValueChange={(value: "easy" | "medium" | "hard") =>
                setDifficulty(value)
              }
              disabled={isDaily}
            >
              <SelectTrigger className="w-32 sm:w-40">
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
              className="flex items-center space-x-1 sm:space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">New Puzzle</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetGame(true)}
              className="hidden sm:flex items-center space-x-1 sm:space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Daily Puzzle</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
          <div
            className="flex-grow"
            ref={gridRef}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <div
              className="grid gap-0.5 sm:gap-1"
              style={{
                gridTemplateColumns: `repeat(${
                  puzzle.grid[0]?.length || 0
                }, 1fr)`,
              }}
            >
              {puzzle.grid.map((row, y) =>
                row.map((cell, x) => (
                  <div key={`${x}-${y}`} className="relative">
                    {cell.number && (
                      <span className="absolute top-0 left-0 text-[0.6rem] sm:text-xs">
                        {cell.number}
                      </span>
                    )}
                    <Input
                      type="text"
                      maxLength={1}
                      value={userInput[y]?.[x] || ""}
                      onChange={(e) => handleInputChange(x, y, e.target.value)}
                      onFocus={() => handleCellFocus(x, y)}
                      className={`w-full aspect-square text-center p-0 text-xs sm:text-lg font-semibold ${
                        cell.isBlack
                          ? "bg-black cursor-not-allowed"
                          : cell.letter
                          ? "bg-secondary"
                          : "bg-gray-100 dark:bg-gray-700"
                      } ${
                        focusedCell?.x === x && focusedCell?.y === y
                          ? "ring-1 sm:ring-2 ring-primary"
                          : ""
                      }`}
                      disabled={cell.isBlack || completed}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="w-full md:w-1/3 overflow-y-auto max-h-80 sm:max-h-96">
            <div className="space-y-1 sm:space-y-2">
              <h3 className="font-semibold text-sm sm:text-base">Across</h3>
              {puzzle.clues
                .filter((clue) => clue.direction === "across")
                .map((clue) => (
                  <p
                    key={`across-${clue.number}`}
                    className="text-xs sm:text-sm"
                  >
                    <span className="font-semibold">{clue.number}.</span>{" "}
                    {clue.clue}
                  </p>
                ))}
              <h3 className="font-semibold text-sm sm:text-base mt-2 sm:mt-4">
                Down
              </h3>
              {puzzle.clues
                .filter((clue) => clue.direction === "down")
                .map((clue) => (
                  <p key={`down-${clue.number}`} className="text-xs sm:text-sm">
                    <span className="font-semibold">{clue.number}.</span>{" "}
                    {clue.clue}
                  </p>
                ))}
            </div>
          </div>
        </div>
        <div className="mt-2 sm:mt-4 flex justify-center space-x-2">
          <Button
            onClick={getHint}
            disabled={completed}
            className="flex items-center space-x-1 sm:space-x-2"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Hint</span>
          </Button>
          <Button
            onClick={sharePuzzle}
            disabled={!completed}
            className="flex items-center space-x-1 sm:space-x-2"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Tip: Use arrow keys to navigate, and click a cell twice to switch
          between across and down.
        </p>
      </CardFooter>
      {completed && <Confetti />}
    </Card>
  );
}
