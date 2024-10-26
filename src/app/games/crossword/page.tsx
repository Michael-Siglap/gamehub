"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Leaderboard } from "@/components/leaderboard";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "lucide-react";

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

function CluesAccordion({
  clues,
  toggleRevealClue,
  revealedClues,
}: {
  clues: Clue[];
  toggleRevealClue: (clue: Clue) => void;
  revealedClues: Set<string>;
}) {
  return (
    <div className="space-y-4">
      {/* Across Clues Accordion */}
      <Disclosure>
        {({ open }) => (
          <div>
            <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
              <span>Across</span>
              <ChevronUpIcon
                className={`${
                  open ? "transform rotate-180" : ""
                } w-5 h-5 text-purple-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-700 max-h-40 overflow-auto">
              {clues
                .filter((clue: Clue) => clue.direction === "across")
                .map((clue: Clue) => {
                  const clueId = `across-${clue.number}`;
                  const isRevealed = revealedClues.has(clueId);
                  return (
                    <p
                      key={clueId}
                      className={`text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors mb-2 ${
                        isRevealed ? "text-green-600 font-medium" : ""
                      }`}
                      onClick={() => toggleRevealClue(clue)}
                    >
                      <span className="font-semibold">{clue.number}.</span>{" "}
                      {clue.clue}
                      {isRevealed && (
                        <span className="ml-2 text-green-600">
                          {`(${clue.answer})`}
                        </span>
                      )}
                    </p>
                  );
                })}
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>

      {/* Down Clues Accordion */}
      <Disclosure>
        {({ open }) => (
          <div>
            <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
              <span>Down</span>
              <ChevronUpIcon
                className={`${
                  open ? "transform rotate-180" : ""
                } w-5 h-5 text-purple-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-700 max-h-40 overflow-auto">
              {clues
                .filter((clue: Clue) => clue.direction === "down")
                .map((clue: Clue) => {
                  const clueId = `down-${clue.number}`;
                  const isRevealed = revealedClues.has(clueId);
                  return (
                    <p
                      key={clueId}
                      className={`text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors mb-2 ${
                        isRevealed ? "text-green-600 font-medium" : ""
                      }`}
                      onClick={() => toggleRevealClue(clue)}
                    >
                      <span className="font-semibold">{clue.number}.</span>{" "}
                      {clue.clue}
                      {isRevealed && (
                        <span className="ml-2 text-green-600">
                          {`(${clue.answer})`}
                        </span>
                      )}
                    </p>
                  );
                })}
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </div>
  );
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

  // New State for Revealed Clues
  const [revealedClues, setRevealedClues] = useState<Set<string>>(new Set());

  // State for Clues Modal (if you choose to implement it)
  // const [isCluesOpen, setIsCluesOpen] = useState(false);

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
        setRevealedClues(new Set()); // Reset revealed clues
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
    if (!completed && gameStartTime !== null) {
      const interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - gameStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [completed, gameStartTime]);

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
        revealedClues: Array.from(revealedClues),
      })
    );
  }, [
    puzzle,
    userInput,
    timer,
    gameStartTime,
    difficulty,
    isDaily,
    revealedClues,
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
      } = JSON.parse(savedState);
      setPuzzle(puzzle);
      setUserInput(userInput);
      setTimer(timer);
      setGameStartTime(gameStartTime);
      setDifficulty(difficulty);
      setIsDaily(isDaily);
      setRevealedClues(new Set(revealedClues));
    } else {
      resetGame();
    }
  }, []);

  const handleInputChange = (x: number, y: number, value: string) => {
    if (!gameStartTime) setGameStartTime(Date.now());
    const newInput = [...userInput];
    newInput[y][x] = value.toUpperCase();
    setUserInput(newInput);

    if (value && direction === "across" && x < puzzle.grid[0].length - 1) {
      setFocusedCell({ x: x + 1, y });
    } else if (value && direction === "down" && y < puzzle.grid.length - 1) {
      setFocusedCell({ x, y: y + 1 });
    }

    if (
      newInput.every((row, yIdx) =>
        row.every(
          (cell, xIdx) =>
            !puzzle.grid[yIdx][xIdx].letter ||
            cell === puzzle.grid[yIdx][xIdx].letter
        )
      )
    ) {
      const gameDuration = Math.floor(
        (Date.now() - (gameStartTime || Date.now())) / 1000
      );
      handleGameCompletion(gameDuration);
    }
  };

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
      setDirection((prev) => (prev === "across" ? "down" : "across"));
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
      setRevealedClues(new Set()); // Reset revealed clues
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handler to toggle reveal clues
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

    // Optional: Automatically fill the answer into the grid
    if (!revealedClues.has(clueId)) {
      const newInput = [...userInput];
      for (let i = 0; i < clue.answer.length; i++) {
        const xi = clue.direction === "across" ? clue.startX + i : clue.startX;
        const yi = clue.direction === "down" ? clue.startY + i : clue.startY;
        newInput[yi][xi] = clue.answer[i].toUpperCase();
      }
      setUserInput(newInput);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4">
      <Card className="w-full lg:w-2/3 max-w-4xl mx-auto p-4">
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
            <Badge
              variant="outline"
              className="text-sm sm:text-base py-1 px-2 sm:px-3"
            >
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
          </div>
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            <div
              className="flex-grow overflow-auto"
              ref={gridRef}
              onKeyDown={handleKeyDown}
              tabIndex={0}
            >
              <div
                className="grid gap-0.5 sm:gap-1"
                style={{
                  gridTemplateColumns: `repeat(${
                    puzzle.grid[0]?.length || 0
                  }, minmax(30px, 1fr))`, // Minimum cell size
                }}
              >
                {puzzle.grid.map((row, y) =>
                  row.map((cell, x) => (
                    <div key={`${x}-${y}`} className="relative">
                      {cell.number && (
                        <span className="absolute top-0 left-0 text-[0.5rem] sm:text-xs">
                          {cell.number}
                        </span>
                      )}
                      <Input
                        type="text"
                        inputMode="text"
                        maxLength={1}
                        value={userInput[y]?.[x] || ""}
                        onChange={(e) =>
                          handleInputChange(x, y, e.target.value)
                        }
                        onFocus={() => handleCellFocus(x, y)}
                        className={`w-full aspect-square text-center p-2 text-base sm:text-lg font-semibold ${
                          cell.isBlack
                            ? "bg-black cursor-not-allowed"
                            : cell.letter
                            ? "bg-secondary"
                            : "bg-gray-100 dark:bg-gray-700"
                        } ${
                          focusedCell?.x === x && focusedCell?.y === y
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                        disabled={cell.isBlack || completed}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 flex justify-center space-x-2">
            <Button
              onClick={getHint}
              disabled={completed}
              className="flex items-center space-x-2 px-3 py-2 text-sm sm:text-base"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Hint</span>
            </Button>
            <Button
              onClick={sharePuzzle}
              disabled={!completed}
              className="flex items-center space-x-2 px-3 py-2 text-sm sm:text-base"
            >
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </Button>
            {/* Button to Open Clues Modal (Optional) */}
            {/* <Button
              onClick={() => setIsCluesOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm sm:text-base"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Clues</span>
            </Button> */}
          </div>
          <h2 className="font-semibold text-lg sm:text-xl mt-6">
            Clues &amp; Answers{" "}
            <span className="text-sm sm:text-base">(Tap to reveal)</span>
          </h2>
          <CluesAccordion
            clues={puzzle.clues}
            toggleRevealClue={toggleRevealClue}
            revealedClues={revealedClues}
          />
        </CardContent>
        <CardFooter>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Tip: Use arrow keys to navigate, and tap a cell twice to switch
            between across and down.
          </p>
        </CardFooter>
      </Card>
      <div className="w-full lg:w-1/3">
        <Leaderboard
          entries={leaderboardEntries}
          currentUserRank={currentUserRank}
          gameType="Crossword"
        />
      </div>
      {completed && <Confetti />}
      {/* Clues Modal (Optional) */}
      {/* <CluesModal
        isOpen={isCluesOpen}
        onClose={() => setIsCluesOpen(false)}
        clues={puzzle.clues}
        toggleRevealClue={toggleRevealClue}
        revealedClues={revealedClues}
      /> */}
    </div>
  );
}
