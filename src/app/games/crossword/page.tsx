"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
import { Share2, HelpCircle, RefreshCw, Pause, Play } from "lucide-react";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

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

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  date: string;
}

const difficulties = {
  easy: { size: 10, wordCount: 10 },
  medium: { size: 13, wordCount: 14 },
  hard: { size: 20, wordCount: 25 },
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

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
  return true;
};

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

const oppositeDirection = (direction: "across" | "down"): "across" | "down" =>
  direction === "across" ? "down" : "across";

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center text-red-500">
          Something went wrong. Please refresh the page.
        </div>
      );
    }
    return this.props.children;
  }
}

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

  const [leaderboardEntries, setLeaderboardEntries] = useState<
    LeaderboardEntry[]
  >([
    { rank: 1, name: "Alice", score: 1000, date: "2024-10-25" },
    { rank: 2, name: "Bob", score: 950, date: "2024-10-24" },
    { rank: 3, name: "Charlie", score: 900, date: "2024-10-23" },
  ]);
  const [currentUserRank, setCurrentUserRank] = useState<number | undefined>(
    undefined
  );
  const [revealedClues, setRevealedClues] = useState<Set<string>>(new Set());
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const maxHints = 3;
  const debouncedUserInput = useDebounce(userInput, 500);

  const [isPaused, setIsPaused] = useState(false);
  const [showTimer, setShowTimer] = useState(true);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchWords = async (wordCount: number): Promise<Word[]> => {
    const response = await fetch(`/api/fetchWords?wordCount=${wordCount}`);
    if (!response.ok) {
      throw new Error("Failed to fetch words");
    }
    const data: Word[] = await response.json();
    return data;
  };

  const generateCrossword = async (
    difficulty: "easy" | "medium" | "hard"
  ): Promise<{ grid: Cell[][]; clues: Clue[] }> => {
    const { size, wordCount } = difficulties[difficulty];
    let wordList = await fetchWords(wordCount);

    wordList = shuffleArray(wordList);

    const grid: Cell[][] = Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => ({
            letter: "",
            number: null,
            isStart: { across: false, down: false },
            isBlack: true,
          }))
      );

    const clues: Clue[] = [];
    let wordNumber = 1;

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

    for (const wordObj of wordList) {
      let placed = false;
      const shuffledClues = shuffleArray(clues);
      for (const existingClue of shuffledClues) {
        const intersections = findIntersections(
          wordObj.word,
          existingClue.answer
        );
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
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (grid[y][x].letter) {
          grid[y][x].isBlack = false;
        }
      }
    }

    return { grid, clues };
  };

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
        setRevealedClues(new Set());
        setHintsUsed(0);
        setProgress(0);
      } catch (error) {
        console.error("Error generating crossword:", error);
        toast({
          title: "Error",
          description: "Failed to generate crossword. Please try again later.",
        });
      }
    };
    initializePuzzle();
  }, [difficulty, toast]);

  useEffect(() => {
    if (!completed && gameStartTime !== null && !isPaused) {
      const interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - gameStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [completed, gameStartTime, isPaused]);

  useEffect(() => {
    localStorage.setItem(
      "crosswordState",
      JSON.stringify({
        puzzle,
        userInput: debouncedUserInput,
        timer,
        gameStartTime,
        difficulty,
        isDaily,
        revealedClues: Array.from(revealedClues),
        hintsUsed,
        showTimer,
        showIncorrect,
      })
    );
  }, [
    puzzle,
    debouncedUserInput,
    timer,
    gameStartTime,
    difficulty,
    isDaily,
    revealedClues,
    hintsUsed,
    showTimer,
    showIncorrect,
  ]);

  useEffect(() => {
    const savedState = localStorage.getItem("crosswordState");
    if (savedState) {
      const {
        puzzle,
        userInput,
        timer,
        gameStartTime,
        difficulty,
        isDaily,
        revealedClues,
        hintsUsed,
        showTimer,
        showIncorrect,
      } = JSON.parse(savedState);
      setPuzzle(puzzle);
      setUserInput(userInput);
      setTimer(timer);

      setGameStartTime(gameStartTime);
      setDifficulty(difficulty);
      setIsDaily(isDaily);
      setRevealedClues(new Set(revealedClues));
      setHintsUsed(hintsUsed);
      setShowTimer(showTimer);
      setShowIncorrect(showIncorrect);
    } else {
      resetGame();
    }
  }, []);

  const handleInputChange = useCallback(
    (x: number, y: number, value: string) => {
      if (!gameStartTime) setGameStartTime(Date.now());
      setUserInput((prev) => {
        const newInput = [...prev];
        newInput[y] = [...newInput[y]];
        newInput[y][x] = value.toUpperCase();
        return newInput;
      });

      if (value && direction === "across" && x < puzzle.grid[0].length - 1) {
        setFocusedCell({ x: x + 1, y });
      } else if (value && direction === "down" && y < puzzle.grid.length - 1) {
        setFocusedCell({ x, y: y + 1 });
      }

      const isComplete = puzzle.grid.every((row, yIdx) =>
        row.every(
          (cell, xIdx) =>
            !cell.letter ||
            (userInput[yIdx][xIdx] && userInput[yIdx][xIdx] === cell.letter)
        )
      );

      if (isComplete) {
        const gameDuration = Math.floor(
          (Date.now() - (gameStartTime || Date.now())) / 1000
        );
        handleGameCompletion(gameDuration);
      }

      updateProgress();
    },
    [direction, gameStartTime, puzzle.grid, userInput]
  );

  const handleGameCompletion = (gameDuration: number) => {
    setCompleted(true);
    updateTimePlayed(gameDuration);
    incrementGamesPlayed("Crossword");

    const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 };
    const score = Math.round(
      1000 * difficultyMultiplier[difficulty] * (600 / gameDuration)
    );

    const newEntry = {
      rank: 0,
      name: "You",
      score,
      date: new Date().toISOString().split("T")[0],
    };
    const updatedEntries = [...leaderboardEntries, newEntry]
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
      .slice(0, 10);

    setLeaderboardEntries(updatedEntries);
    setCurrentUserRank(
      updatedEntries.findIndex((entry) => entry.name === "You") + 1
    );

    toast({
      title: "Congratulations!",
      description: `You completed the ${
        isDaily ? "daily " : ""
      }puzzle in ${formatTime(gameDuration)}! Your score: ${score}`,
    });
  };

  const handleCellFocus = (x: number, y: number) => {
    if (focusedCell?.x === x && focusedCell?.y === y) {
      toggleDirection();
    }
    setFocusedCell({ x, y });
  };

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
      case "Tab":
        e.preventDefault();
        toggleDirection();
        break;
      default:
        break;
    }
  };

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
      setRevealedClues(new Set());
      setHintsUsed(0);
      setProgress(0);
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

  const getHint = () => {
    if (hintsUsed >= maxHints) {
      toast({
        title: "No Hints Left",
        description: "You have used all available hints.",
      });
      return;
    }
    if (!focusedCell) return;
    const { x, y } = focusedCell;
    const correctLetter = puzzle.grid[y][x].letter;
    if (correctLetter) {
      setUserInput((prev) => {
        const newInput = [...prev];
        newInput[y] = [...newInput[y]];
        newInput[y][x] = correctLetter;
        return newInput;
      });
      setHintsUsed((prev) => prev + 1);
      toast({
        title: "Hint",
        description: `Revealed letter at (${x + 1}, ${
          y + 1
        }): "${correctLetter}"`,
      });
    }
  };

  const sharePuzzle = () => {
    const shareText = `I completed the ${
      isDaily ? "daily " : ""
    }crossword puzzle in ${formatTime(
      timer
    )}! Can you beat my time? Play now at [YourGameHubURL]`;
    if (navigator.share) {
      navigator
        .share({
          title: "Crossword Puzzle",
          text: shareText,
          url: window.location.href,
        })
        .then(() => {
          toast({
            title: "Shared!",
            description: "The puzzle result has been shared successfully.",
          });
        })
        .catch((error) => {
          console.error("Error sharing:", error);
          toast({
            title: "Error",
            description: "Failed to share the puzzle.",
          });
        });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        toast({
          title: "Copied!",
          description: "Share text has been copied to your clipboard.",
        });
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleDirection = () => {
    setDirection((prev) => (prev === "across" ? "down" : "across"));
  };

  const toggleRevealClue = (clue: Clue) => {
    const clueId = `${clue.direction}-${clue.number}`;
    setRevealedClues((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clueId)) {
        newSet.delete(clueId);
      } else {
        newSet.add(clueId);
      }
      return newSet;
    });

    if (!revealedClues.has(clueId)) {
      setUserInput((prev) => {
        const newInput = [...prev];
        for (let i = 0; i < clue.answer.length; i++) {
          const xi =
            clue.direction === "across" ? clue.startX + i : clue.startX;
          const yi = clue.direction === "down" ? clue.startY + i : clue.startY;
          newInput[yi] = [...newInput[yi]];
          newInput[yi][xi] = clue.answer[i].toUpperCase();
        }
        return newInput;
      });
    }
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
    if (isPaused) {
      setGameStartTime((prev) => (prev ? Date.now() - timer * 1000 : null));
    }
  };

  const updateProgress = useCallback(() => {
    const totalCells = puzzle.grid
      .flat()
      .filter((cell) => !cell.isBlack).length;
    const filledCells = userInput.flat().filter((cell) => cell !== "").length;
    setProgress((filledCells / totalCells) * 100);
  }, [puzzle.grid, userInput]);

  const acrossClues = useMemo(
    () => puzzle.clues.filter((clue) => clue.direction === "across"),
    [puzzle.clues]
  );
  const downClues = useMemo(
    () => puzzle.clues.filter((clue) => clue.direction === "down"),
    [puzzle.clues]
  );

  const GridComponent = React.memo(() => (
    <div
      className="grid-container"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${puzzle.grid[0]?.length || 0}, 1fr)`,
        gap: "2px",
        maxWidth: "100%",
        overflow: "auto",
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={gridRef}
    >
      {puzzle.grid.map((row, y) =>
        row.map((cell, x) => {
          const isFocused = focusedCell?.x === x && focusedCell?.y === y;
          const userLetter = userInput[y]?.[x] || "";
          const isCorrect = userLetter === cell.letter;
          const isIncorrect = userLetter && userLetter !== cell.letter;
          return (
            <div
              key={`${x}-${y}`}
              className={`relative flex items-center justify-center border border-gray-500 ${
                cell.isBlack ? "bg-black" : "bg-white dark:bg-gray-800"
              }`}
              id={`cell-${x}-${y}`}
            >
              {cell.number && (
                <span className="absolute top-0 left-0 text-[0.5rem] sm:text-xs text-gray-600">
                  {cell.number}
                </span>
              )}
              {!cell.isBlack && (
                <Input
                  type="text"
                  inputMode="text"
                  maxLength={1}
                  value={userLetter}
                  onChange={(e) => handleInputChange(x, y, e.target.value)}
                  onFocus={() => handleCellFocus(x, y)}
                  aria-label={`Cell ${x + 1}, ${y + 1}`}
                  className={`w-full h-full text-center text-base sm:text-lg font-semibold ${
                    isCorrect
                      ? "bg-green-200 dark:bg-green-700"
                      : isIncorrect && showIncorrect
                      ? "bg-red-200 dark:bg-red-700"
                      : "bg-gray-100 dark:bg-gray-700"
                  } ${
                    isFocused ? "ring-2 ring-blue-500" : ""
                  } focus:outline-none`}
                  disabled={cell.isBlack || completed || isPaused}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  ));
  GridComponent.displayName = "GridComponent";

  const CluesAccordionComponent = React.memo(() => {
    const renderClues = (clues: Clue[], direction: "across" | "down") => {
      return clues.map((clue) => {
        const clueId = `${direction}-${clue.number}`;
        const isRevealed = revealedClues.has(clueId);
        return (
          <p
            key={clueId}
            className={`text-xs sm:text-sm cursor-pointer hover:text-blue-500 transition-colors mb-2 ${
              isRevealed ? "text-green-600 font-medium" : ""
            }`}
            onClick={() => toggleRevealClue(clue)}
          >
            <span className="font-semibold">{clue.number}.</span> {clue.clue}
            {isRevealed && (
              <span className="ml-2 text-green-600">({clue.answer})</span>
            )}
          </p>
        );
      });
    };

    return (
      <div className="space-y-4">
        <Disclosure>
          {({ open }) => (
            <div>
              <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
                <span>Across</span>
                <ChevronUpIcon
                  className={`${
                    open ? "transform rotate-180" : ""
                  } w-5 h-5 text-blue-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-700 dark:text-gray-300 max-h-40 overflow-auto">
                {renderClues(acrossClues, "across")}
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>

        <Disclosure>
          {({ open }) => (
            <div>
              <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
                <span>Down</span>
                <ChevronUpIcon
                  className={`${
                    open ? "transform rotate-180" : ""
                  } w-5 h-5 text-blue-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-700 dark:text-gray-300 max-h-40 overflow-auto">
                {renderClues(downClues, "down")}
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      </div>
    );
  });
  CluesAccordionComponent.displayName = "CluesAccordionComponent";

  const ControlsComponent = React.memo(() => (
    <div className="flex items-center space-x-2">
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
        className="flex items-center space-x-2 px-3 py-2 text-sm sm:text-base"
      >
        <RefreshCw className="h-5 w-5" />
        <span>New Puzzle</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => resetGame(true)}
        className="flex items-center space-x-2 px-3 py-2 text-sm sm:text-base"
      >
        <RefreshCw className="h-5 w-5" />
        <span>Daily Puzzle</span>
      </Button>
    </div>
  ));
  ControlsComponent.displayName = "ControlsComponent";

  const LeaderboardComponent = React.memo(() => (
    <div className="leaderboard bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Leaderboard</h2>
      <table className="w-full text-left table-auto">
        <thead>
          <tr>
            <th className="px-2 py-1">Rank</th>
            <th className="px-2 py-1">Name</th>
            <th className="px-2 py-1">Score</th>
            <th className="px-2 py-1">Date</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardEntries.map((entry) => (
            <tr
              key={entry.rank}
              className={`${
                entry.rank === currentUserRank
                  ? "bg-blue-100 dark:bg-blue-900"
                  : ""
              }`}
            >
              <td className="px-2 py-1">{entry.rank}</td>
              <td className="px-2 py-1">{entry.name}</td>
              <td className="px-2 py-1">{entry.score}</td>
              <td className="px-2 py-1">{entry.date}</td>
            </tr>
          ))}
          {currentUserRank && currentUserRank > leaderboardEntries.length && (
            <tr className="bg-blue-100 dark:bg-blue-900">
              <td className="px-2 py-1">{currentUserRank}</td>
              <td className="px-2 py-1">You</td>
              <td className="px-2 py-1">N/A</td>
              <td className="px-2 py-1">Today</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ));
  LeaderboardComponent.displayName = "LeaderboardComponent";

  const SettingsDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Settings</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
          <DialogDescription>
            Customize your crossword experience
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-timer"
            checked={showTimer}
            onCheckedChange={setShowTimer}
          />
          <Label htmlFor="show-timer">Show Timer</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-incorrect"
            checked={showIncorrect}
            onCheckedChange={setShowIncorrect}
          />
          <Label htmlFor="show-incorrect">Show Incorrect Answers</Label>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <ErrorBoundary>
      <div
        className={`flex flex-col lg:flex-row gap-8 p-4 min-h-screen transition-colors duration-300`}
      >
        <Card className="w-full lg:w-2/3 max-w-4xl mx-auto p-4 shadow-lg">
          <CardHeader className="mb-2">
            <CardTitle className="text-2xl sm:text-3xl">
              {isDaily ? "Daily Crossword" : "Crossword Puzzle"}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Fill in the crossword puzzle!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
              {showTimer && (
                <Badge
                  variant="outline"
                  className="text-sm sm:text-base py-1 px-2 sm:px-3"
                >
                  Time: {formatTime(timer)}
                </Badge>
              )}
              <ControlsComponent />
            </div>
            <Progress value={progress} className="w-full mb-4" />
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
              <GridComponent />
            </div>
            <div className="mt-4 sm:mt-6 flex justify-center space-x-2 flex-wrap">
              <Button
                onClick={getHint}
                disabled={completed || hintsUsed >= maxHints || isPaused}
                className="flex items-center space-x-2 px-3 py-2 text-sm sm:text-base"
              >
                <HelpCircle className="h-5 w-5" />
                <span>Hint ({maxHints - hintsUsed} left)</span>
              </Button>
              <Button
                onClick={sharePuzzle}
                disabled={!completed}
                className="flex items-center space-x-2 px-3 py-2 text-sm sm:text-base"
              >
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </Button>
              <Button
                onClick={togglePause}
                className="flex items-center space-x-2 px-3 py-2 text-sm sm:text-base"
              >
                {isPaused ? (
                  <Play className="h-5 w-5" />
                ) : (
                  <Pause className="h-5 w-5" />
                )}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </Button>
              <SettingsDialog />
            </div>
            <h2 className="font-semibold text-lg sm:text-xl mt-6">
              Clues &amp; Answers{" "}
              <span className="text-sm sm:text-base">(Tap to reveal)</span>
            </h2>
            <CluesAccordionComponent />
          </CardContent>
          <CardFooter>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tip: Use arrow keys to navigate, and tap a cell twice to switch
              between across and down.
            </p>
          </CardFooter>
        </Card>
        <div className="w-full lg:w-1/3">
          <LeaderboardComponent />
        </div>
        {completed && <Confetti />}
      </div>
    </ErrorBoundary>
  );
}
