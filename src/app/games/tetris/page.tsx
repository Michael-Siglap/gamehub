"use client";

import { useState, useEffect, useCallback } from "react";
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
import { incrementGamesPlayed, updateTimePlayed } from "@/utils/userStats";
import { Confetti } from "@/components/confetti";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const TETROMINOS = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
];

const TETROMINO_COLOURS = [
  "bg-red-500", // Colour for Tetromino 1
  "bg-blue-500", // Colour for Tetromino 2
  "bg-green-500", // Colour for Tetromino 3
  "bg-yellow-500", // Colour for Tetromino 4
  "bg-purple-500", // Colour for Tetromino 5
  "bg-orange-500", // Colour for Tetromino 6
  "bg-teal-500", // Colour for Tetromino 7
];

export default function Tetris() {
  const [board, setBoard] = useState(
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<number[][] | null>(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [currentColour, setCurrentColour] = useState<string>(""); // Store the colour for the current piece
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const canMoveTo = useCallback(
    (x: number, y: number, piece: number[][]) => {
      for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < piece[row].length; col++) {
          if (piece[row][col]) {
            const newX = x + col;
            const newY = y + row;
            if (
              newX < 0 ||
              newX >= BOARD_WIDTH ||
              newY >= BOARD_HEIGHT ||
              (newY >= 0 && board[newY][newX])
            ) {
              return false;
            }
          }
        }
      }
      return true;
    },
    [board]
  );

  const clearLines = useCallback((board: number[][]) => {
    let linesCleared = 0;
    const newBoard = board.filter((row) => {
      if (row.every((cell) => cell === 1)) {
        linesCleared++;
        return false;
      }
      return true;
    });
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    setBoard(newBoard);
    setScore((prev) => prev + linesCleared * 100);
  }, []);

  const placePiece = useCallback(() => {
    if (!currentPiece) return;
    const newBoard = [...board];
    for (let row = 0; row < currentPiece.length; row++) {
      for (let col = 0; col < currentPiece[row].length; col++) {
        if (currentPiece[row][col]) {
          const newY = currentPosition.y + row;
          const newX = currentPosition.x + col;
          if (newY < 0) {
            setGameOver(true);
            return;
          }
          newBoard[newY][newX] = 1;
        }
      }
    }
    setBoard(newBoard);
    clearLines(newBoard); // Now properly memoized
  }, [board, currentPiece, currentPosition, clearLines]);

  const spawnPiece = useCallback(() => {
    const newPieceIndex = Math.floor(Math.random() * TETROMINOS.length);
    const newPiece = TETROMINOS[newPieceIndex];
    setCurrentPiece(newPiece);
    setCurrentColour(TETROMINO_COLOURS[newPieceIndex]); // Set the colour based on the piece index
    setCurrentPosition({
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece[0].length / 2),
      y: 0,
    });
  }, []);

  const moveDown = useCallback(() => {
    if (!currentPiece) return;
    if (canMoveTo(currentPosition.x, currentPosition.y + 1, currentPiece)) {
      setCurrentPosition((prev) => ({ ...prev, y: prev.y + 1 }));
    } else {
      placePiece();
      spawnPiece();
    }
  }, [currentPiece, currentPosition, canMoveTo, placePiece, spawnPiece]);

  const moveLeft = useCallback(() => {
    if (
      currentPiece &&
      canMoveTo(currentPosition.x - 1, currentPosition.y, currentPiece)
    ) {
      setCurrentPosition((prev) => ({ ...prev, x: prev.x - 1 }));
    }
  }, [currentPiece, currentPosition, canMoveTo]);

  const moveRight = useCallback(() => {
    if (
      currentPiece &&
      canMoveTo(currentPosition.x + 1, currentPosition.y, currentPiece)
    ) {
      setCurrentPosition((prev) => ({ ...prev, x: prev.x + 1 }));
    }
  }, [currentPiece, currentPosition, canMoveTo]);

  const rotate = useCallback(() => {
    if (!currentPiece) return;
    const rotated = currentPiece[0].map((_, index) =>
      currentPiece.map((row) => row[index]).reverse()
    );
    if (canMoveTo(currentPosition.x, currentPosition.y, rotated)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, currentPosition, canMoveTo]);

  useEffect(() => {
    if (!gameStartTime) {
      setGameStartTime(Date.now());
    }
    if (!currentPiece && !gameOver) {
      spawnPiece();
    }
    const interval = setInterval(moveDown, 1000);
    return () => clearInterval(interval);
  }, [currentPiece, gameOver, spawnPiece, moveDown, gameStartTime]);

  useEffect(() => {
    if (gameOver) {
      const gameEndTime = Date.now();
      const gameDuration = Math.floor(
        (gameEndTime - (gameStartTime || gameEndTime)) / 1000
      );
      updateTimePlayed(gameDuration);
      incrementGamesPlayed("Tetris");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [gameOver, gameStartTime]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver) return;
      switch (e.key) {
        case "ArrowLeft":
          moveLeft();
          break;
        case "ArrowRight":
          moveRight();
          break;
        case "ArrowDown":
          moveDown();
          break;
        case " ":
          rotate();
          break;
        default:
          break;
      }
    },
    [moveLeft, moveRight, moveDown, rotate, gameOver]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const resetGame = () => {
    setBoard(
      Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(0))
    );
    setCurrentPiece(null);
    setCurrentPosition({ x: 0, y: 0 });
    setScore(0);
    setGameOver(false);
    setGameStartTime(Date.now());
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl">Tetris</CardTitle>
        <CardDescription>Clear lines to score points!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <Badge variant="outline" className="text-lg py-1 px-3">
            Score: {score}
          </Badge>
          <Button variant="outline" size="sm" onClick={resetGame}>
            {gameOver ? "New Game" : "Reset Game"}
          </Button>
        </div>
        <div
          className="grid grid-cols-10 gap-1 mb-4"
          style={{ width: "300px", margin: "0 auto" }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, cellIndex) => (
              <div
                key={`${rowIndex}-${cellIndex}`}
                className={`w-7 h-7 border ${
                  cell ||
                  (currentPiece &&
                    currentPosition.y <= rowIndex &&
                    rowIndex < currentPosition.y + currentPiece.length &&
                    currentPosition.x <= cellIndex &&
                    cellIndex < currentPosition.x + currentPiece[0].length &&
                    currentPiece[rowIndex - currentPosition.y][
                      cellIndex - currentPosition.x
                    ])
                    ? currentColour // Apply the current piece's colour
                    : "bg-secondary"
                }`}
              />
            ))
          )}
        </div>
        <div className="flex justify-center space-x-2">
          <Button onClick={moveLeft}>Left</Button>
          <Button onClick={moveDown}>Down</Button>
          <Button onClick={rotate}>Rotate</Button>
          <Button onClick={moveRight}>Right</Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Use the buttons or the keyboard (arrow keys and space) to move and
          rotate the pieces. Clear lines to score points!
        </p>
      </CardFooter>
      {showConfetti && <Confetti />}
    </Card>
  );
}
