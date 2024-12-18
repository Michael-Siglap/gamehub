"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { incrementGamesPlayed, updateTimePlayed } from "@/utils/userStats";
import { Confetti } from "@/components/confetti";
import { motion, AnimatePresence } from "framer-motion";
import {
  Waves,
  Target,
  RotateCcw,
  TrendingUp,
  Anchor,
  Ship,
} from "lucide-react";

const BOARD_SIZE = 10;
const INITIAL_SHIP_SIZES = [4, 3, 3, 2, 2];

type Cell = "empty" | "ship" | "hit" | "miss" | "revealed";

export default function BoatSinkingGame() {
  const { theme } = useTheme();
  const [playerBoard, setPlayerBoard] = useState<Cell[][]>(
    Array(BOARD_SIZE).fill(Array(BOARD_SIZE).fill("empty"))
  );
  const [computerBoard, setComputerBoard] = useState<Cell[][]>(
    Array(BOARD_SIZE).fill(Array(BOARD_SIZE).fill("empty"))
  );
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"player" | "computer" | null>(null);
  const [playerShipsRemaining, setPlayerShipsRemaining] = useState(
    INITIAL_SHIP_SIZES.reduce((acc, size) => acc + size, 0)
  );
  const [computerShipsRemaining, setComputerShipsRemaining] = useState(
    INITIAL_SHIP_SIZES.reduce((acc, size) => acc + size, 0)
  );
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [level, setLevel] = useState(1);
  const [, setShipSizes] = useState(INITIAL_SHIP_SIZES);
  const [score, setScore] = useState(0);
  const [powerUps, setPowerUps] = useState({
    radar: 1,
    airstrike: 1,
  });
  const [hitSound, setHitSound] = useState<HTMLAudioElement | null>(null);
  const [missSound, setMissSound] = useState<HTMLAudioElement | null>(null);

  const initializeBoard = useCallback((currentShipSizes: number[]) => {
    const newBoard = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill("empty"));
    currentShipSizes.forEach((size) => {
      let placed = false;
      while (!placed) {
        const horizontal = Math.random() < 0.5;
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        if (canPlaceShip(newBoard, row, col, size, horizontal)) {
          placeShip(newBoard, row, col, size, horizontal);
          placed = true;
        }
      }
    });
    return newBoard;
  }, []);

  const canPlaceShip = (
    board: Cell[][],
    row: number,
    col: number,
    size: number,
    horizontal: boolean
  ) => {
    for (let i = 0; i < size; i++) {
      if (horizontal) {
        if (col + i >= BOARD_SIZE || board[row][col + i] !== "empty")
          return false;
      } else {
        if (row + i >= BOARD_SIZE || board[row + i][col] !== "empty")
          return false;
      }
    }
    return true;
  };

  const placeShip = (
    board: Cell[][],
    row: number,
    col: number,
    size: number,
    horizontal: boolean
  ) => {
    for (let i = 0; i < size; i++) {
      if (horizontal) {
        board[row][col + i] = "ship";
      } else {
        board[row + i][col] = "ship";
      }
    }
  };

  const computerMove = useCallback(() => {
    let row, col;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      row = Math.floor(Math.random() * BOARD_SIZE);
      col = Math.floor(Math.random() * BOARD_SIZE);
      attempts++;

      // Improved AI: Focus on cells adjacent to hits
      if (attempts > maxAttempts / 2) {
        for (let i = 0; i < BOARD_SIZE; i++) {
          for (let j = 0; j < BOARD_SIZE; j++) {
            if (playerBoard[i][j] === "hit") {
              const directions = [
                [0, 1],
                [1, 0],
                [0, -1],
                [-1, 0],
              ];
              for (const [dx, dy] of directions) {
                const newRow = i + dx;
                const newCol = j + dy;
                if (
                  newRow >= 0 &&
                  newRow < BOARD_SIZE &&
                  newCol >= 0 &&
                  newCol < BOARD_SIZE &&
                  playerBoard[newRow][newCol] !== "hit" &&
                  playerBoard[newRow][newCol] !== "miss"
                ) {
                  row = newRow;
                  col = newCol;
                  break;
                }
              }
            }
          }
        }
      }
    } while (
      (playerBoard[row][col] === "hit" || playerBoard[row][col] === "miss") &&
      attempts < maxAttempts
    );

    const newBoard = playerBoard.map((r) => [...r]);
    if (newBoard[row][col] === "ship") {
      newBoard[row][col] = "hit";
      playSound(hitSound);
      setPlayerShipsRemaining((prev) => {
        const newValue = prev - 1;
        if (newValue === 0) {
          setGameOver(true);
          setWinner("computer");
        }
        return newValue;
      });
    } else {
      newBoard[row][col] = "miss";
      playSound(missSound);
    }
    setPlayerBoard(newBoard);
  }, [playerBoard, hitSound, missSound]);

  const handleCellClick = (row: number, col: number) => {
    if (
      gameOver ||
      computerBoard[row][col] === "hit" ||
      computerBoard[row][col] === "miss"
    )
      return;

    const newBoard = computerBoard.map((r) => [...r]);
    if (newBoard[row][col] === "ship") {
      newBoard[row][col] = "hit";
      playSound(hitSound);
      setScore((prevScore) => prevScore + 100);
      setComputerShipsRemaining((prev) => {
        const newValue = prev - 1;
        if (newValue === 0) {
          setGameOver(true);
          setWinner("player");
        }
        return newValue;
      });
    } else {
      newBoard[row][col] = "miss";
      playSound(missSound);
      setScore((prevScore) => Math.max(0, prevScore - 10));
    }
    setComputerBoard(newBoard);

    if (!gameOver) {
      computerMove();
    }
  };

  const useRadar = () => {
    if (powerUps.radar > 0) {
      const newBoard = [...computerBoard];
      let revealed = 0;
      while (revealed < 3) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        if (newBoard[row][col] === "ship") {
          newBoard[row][col] = "revealed";
          revealed++;
        }
      }
      setComputerBoard(newBoard);
      setPowerUps((prev) => ({ ...prev, radar: prev.radar - 1 }));
    }
  };

  const useAirstrike = () => {
    if (powerUps.airstrike > 0) {
      const newBoard = [...computerBoard];
      const row = Math.floor(Math.random() * BOARD_SIZE);
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (newBoard[row][col] === "ship") {
          newBoard[row][col] = "hit";
          setComputerShipsRemaining((prev) => prev - 1);
          setScore((prevScore) => prevScore + 100);
        } else if (newBoard[row][col] === "empty") {
          newBoard[row][col] = "miss";
        }
      }
      setComputerBoard(newBoard);
      setPowerUps((prev) => ({ ...prev, airstrike: prev.airstrike - 1 }));
    }
  };

  const playSound = (sound: HTMLAudioElement | null) => {
    if (sound) {
      sound
        .play()
        .catch((error) => console.error("Error playing sound:", error));
    }
  };

  useEffect(() => {
    setHitSound(new Audio("/sounds/hit.mp3"));
    setMissSound(new Audio("/sounds/miss.mp3"));
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gameOver) {
      const gameEndTime = Date.now();
      const gameDuration = Math.floor(
        (gameEndTime - (gameStartTime || gameEndTime)) / 1000
      );
      updateTimePlayed("Boat Sinking", gameDuration);
      incrementGamesPlayed("Boat Sinking");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      if (winner === "player") {
        setLevel((prevLevel) => prevLevel + 1);
      }
    }
  }, [gameOver, gameStartTime, winner]);

  const resetGame = () => {
    const newShipSizes = [...INITIAL_SHIP_SIZES];
    // Add smaller ships for higher levels
    for (let i = 1; i < level; i++) {
      newShipSizes.push(Math.max(1, Math.floor(Math.random() * 3) + 1));
    }
    setShipSizes(newShipSizes);
    setPlayerBoard(initializeBoard(newShipSizes));
    setComputerBoard(initializeBoard(newShipSizes));
    setGameOver(false);
    setWinner(null);
    setPlayerShipsRemaining(newShipSizes.reduce((acc, size) => acc + size, 0));
    setComputerShipsRemaining(
      newShipSizes.reduce((acc, size) => acc + size, 0)
    );
    setGameStartTime(Date.now());
    setScore(0);
    setPowerUps({ radar: 1, airstrike: 1 });
  };

  const renderBoard = (board: Cell[][], isPlayerBoard: boolean) => (
    <div
      className={`grid grid-cols-10 gap-0.5 sm:gap-1 p-1 sm:p-2 rounded-lg shadow-inner ${
        theme === "dark" ? "bg-gray-800" : "bg-blue-100"
      }`}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <motion.div
            key={`${rowIndex}-${colIndex}`}
            className={`aspect-square w-full max-w-[2rem] rounded-sm cursor-pointer flex items-center justify-center ${
              cell === "empty"
                ? theme === "dark"
                  ? "bg-gray-700"
                  : "bg-blue-200"
                : cell === "ship"
                ? isPlayerBoard
                  ? theme === "dark"
                    ? "bg-gray-500"
                    : "bg-gray-400"
                  : theme === "dark"
                  ? "bg-gray-700"
                  : "bg-blue-200"
                : cell === "hit"
                ? "bg-red-500"
                : cell === "revealed"
                ? "bg-yellow-500"
                : theme === "dark"
                ? "bg-gray-600"
                : "bg-gray-300"
            }`}
            onClick={() =>
              !isPlayerBoard && handleCellClick(rowIndex, colIndex)
            }
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {cell === "hit" && <Target className="w-5 h-5 text-white" />}
            {cell === "miss" && (
              <Waves
                className={`w-5 h-5 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-500"
                }`}
              />
            )}
            {isPlayerBoard && cell === "ship" && (
              <Ship
                className={`w-5 h-5 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              />
            )}
          </motion.div>
        ))
      )}
    </div>
  );

  return (
    <div
      className={`min-h-screen p-2 sm:p-4 md:p-8 ${
        theme === "dark"
          ? "bg-gray-900"
          : "bg-gradient-to-b from-blue-400 to-blue-600"
      } relative overflow-hidden`}
    >
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <Waves
            key={i}
            className={`${
              theme === "dark" ? "text-gray-800" : "text-white"
            } opacity-10 absolute`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 40 + 20}px`,
            }}
          />
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[1000px] mx-auto"
      >
        <Card
          className={`w-full ${
            theme === "dark" ? "bg-gray-800/80" : "bg-white/80"
          } backdrop-blur-md border-none shadow-xl`}
        >
          <CardHeader>
            <CardTitle
              className={`text-3xl flex items-center ${
                theme === "dark" ? "text-white" : "text-blue-800"
              }`}
            >
              <Anchor
                className={`mr-2 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
              Boat Sinking
            </CardTitle>
            <CardDescription
              className={`flex items-center ${
                theme === "dark" ? "text-gray-400" : "text-blue-600"
              }`}
            >
              <TrendingUp className="mr-2" />
              Level: {level} - Sink all enemy ships before they sink yours!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 md:p-6">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-2">
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <Badge
                  variant="outline"
                  className={`text-sm sm:text-base py-1 px-2 ${
                    theme === "dark"
                      ? "bg-blue-900 text-blue-200"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  Your Ships: {playerShipsRemaining}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-sm sm:text-base py-1 px-2 ${
                    theme === "dark"
                      ? "bg-red-900 text-red-200"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  Enemy Ships: {computerShipsRemaining}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-sm sm:text-base py-1 px-2"
                >
                  Score: {score}
                </Badge>
              </div>
              <div className="flex justify-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
                <Button
                  onClick={useRadar}
                  disabled={powerUps.radar === 0}
                  className="bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm"
                >
                  Radar ({powerUps.radar})
                </Button>
                <Button
                  onClick={useAirstrike}
                  disabled={powerUps.airstrike === 0}
                  className="bg-red-500 hover:bg-red-600 text-xs sm:text-sm"
                >
                  Airstrike ({powerUps.airstrike})
                </Button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="w-full sm:w-1/2">
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    theme === "dark" ? "text-blue-300" : "text-blue-800"
                  }`}
                >
                  Your Fleet
                </h3>
                {renderBoard(playerBoard, true)}
              </div>
              <div className="w-full sm:w-1/2">
                <h3
                  className={`text-lg font-semibold mb-2 flex items-center ${
                    theme === "dark" ? "text-red-300" : "text-red-800"
                  }`}
                >
                  <Target className="mr-2" /> Enemy Waters
                </h3>
                {renderBoard(computerBoard, false)}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center p-2 sm:p-4">
            <Button
              onClick={resetGame}
              className={`w-full max-w-xs ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              <RotateCcw className="mr-2" /> New Battle
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      {showConfetti && <Confetti />}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          >
            <Card
              className={`w-64 text-center ${
                theme === "dark" ? "bg-gray-800/90" : "bg-white/90"
              } backdrop-blur-md`}
            >
              <CardHeader>
                <CardTitle>
                  {winner === "player" ? "Victory!" : "Defeat"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {winner === "player"
                    ? `Congratulations! You've conquered Level ${level}!`
                    : "Your fleet has been destroyed!"}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={resetGame}
                  className={`w-full ${
                    theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {winner === "player" ? "Next Level" : "Try Again"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
