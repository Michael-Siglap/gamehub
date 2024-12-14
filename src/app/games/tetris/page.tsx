"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";
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
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  RotateCcw,
  PauseCircle,
} from "lucide-react";

import block1 from "@/assets/kenney/block1.png";
import block2 from "@/assets/kenney/block2.png";
import block3 from "@/assets/kenney/block3.png";
import block4 from "@/assets/kenney/block4.png";
import block5 from "@/assets/kenney/block5.png";
import block6 from "@/assets/kenney/block6.png";
import block7 from "@/assets/kenney/block7.png";

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

const TETROMINO_IMAGES = [
  block1.src,
  block2.src,
  block3.src,
  block4.src,
  block5.src,
  block6.src,
  block7.src,
];

// New component for particle effects
const Particles = ({ count }: { count: number }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 300,
      y: Math.random() * 600,
      size: Math.random() * 4 + 2,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-yellow-400 rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            x: particle.x,
            y: particle.y,
          }}
          animate={{
            y: [particle.y, particle.y - 100],
            opacity: [1, 0],
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

export default function Tetris() {
  const [board, setBoard] = useState(
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<number[][] | null>(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [currentImage, setCurrentImage] = useState<string>("");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [heldPiece, setHeldPiece] = useState<number | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [nextPiece, setNextPiece] = useState<number>(
    Math.floor(Math.random() * TETROMINOS.length)
  );
  const [highScore, setHighScore] = useState(0);
  const [showParticles, setShowParticles] = useState(false);

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

  const clearLines = useCallback(() => {
    let linesCleared = 0;
    const newBoard = board.filter((row) => {
      if (row.every((cell) => cell !== null)) {
        linesCleared++;
        return false;
      }
      return true;
    });
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }
    setBoard(newBoard);
    setScore((prev) => {
      const newScore = prev + linesCleared * 100 * level;
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("tetrisHighScore", newScore.toString());
      }
      return newScore;
    });
    if (linesCleared > 0) {
      setLevel((prev) =>
        Math.min(10, prev + Math.floor(linesCleared / 10) + 1)
      );
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
    }
  }, [board, level, highScore]);

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
          newBoard[newY][newX] = currentImage;
        }
      }
    }
    setBoard(newBoard);
    clearLines();
  }, [board, currentPiece, currentPosition, currentImage, clearLines]);

  const spawnPiece = useCallback(() => {
    const newPieceIndex = nextPiece;
    const newPiece = TETROMINOS[newPieceIndex];
    const newPosition = {
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece[0].length / 2),
      y: 0,
    };

    if (!canMoveTo(newPosition.x, newPosition.y, newPiece)) {
      setGameOver(true);
      return;
    }

    setCurrentPiece(newPiece);
    setCurrentImage(TETROMINO_IMAGES[newPieceIndex]);
    setCurrentPosition(newPosition);
    setNextPiece(Math.floor(Math.random() * TETROMINOS.length));
    setCanHold(true);
  }, [nextPiece, canMoveTo]);

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

  const holdPiece = useCallback(() => {
    if (!canHold) return;
    if (heldPiece === null) {
      setHeldPiece(TETROMINOS.findIndex((t) => t === currentPiece));
      spawnPiece();
    } else {
      const temp = currentPiece;
      setCurrentPiece(TETROMINOS[heldPiece]);
      setCurrentImage(TETROMINO_IMAGES[heldPiece]);
      setHeldPiece(TETROMINOS.findIndex((t) => t === temp));
    }
    setCanHold(false);
  }, [canHold, heldPiece, currentPiece, spawnPiece]);

  const getGhostPosition = useCallback(() => {
    if (!currentPiece) return null;
    let ghostY = currentPosition.y;
    while (canMoveTo(currentPosition.x, ghostY + 1, currentPiece)) {
      ghostY++;
    }
    return { x: currentPosition.x, y: ghostY };
  }, [currentPiece, currentPosition, canMoveTo]);

  useEffect(() => {
    if (!gameStartTime) {
      setGameStartTime(Date.now());
    }
    if (!currentPiece && !gameOver) {
      spawnPiece();
    }
    if (!gameOver) {
      const interval = setInterval(moveDown, 1000 / level);
      return () => clearInterval(interval);
    }
  }, [currentPiece, gameOver, spawnPiece, moveDown, gameStartTime, level]);

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

  useEffect(() => {
    const storedHighScore = localStorage.getItem("tetrisHighScore");
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
  }, []);

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
        case "ArrowUp":
        case " ":
          rotate();
          break;
        case "h":
        case "H":
          holdPiece();
          break;
        default:
          break;
      }
    },
    [moveLeft, moveRight, moveDown, rotate, holdPiece, gameOver]
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
        .map(() => Array(BOARD_WIDTH).fill(null))
    );
    setCurrentPiece(null);
    setCurrentPosition({ x: 0, y: 0 });
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setGameStartTime(Date.now());
    setHeldPiece(null);
    setCanHold(true);
    setNextPiece(Math.floor(Math.random() * TETROMINOS.length));
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-[360px] mx-auto backdrop-blur-md border-none">
          <CardHeader>
            <CardTitle className="text-3xl">Tetris</CardTitle>
            <CardDescription>
              Clear lines to score points and level up!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
              <Badge variant="outline" className="text-lg py-1 px-3">
                Score: {score}
              </Badge>
              <Badge variant="outline" className="text-lg py-1 px-3">
                Level: {level}
              </Badge>
              <Badge variant="outline" className="text-lg py-1 px-3">
                High Score: {highScore}
              </Badge>
            </div>
            <div className="flex justify-between mb-4">
              <div className="w-20 h-20 bg-background/20 rounded-lg p-2">
                <p className="text-sm mb-1">Hold:</p>
                {heldPiece !== null && (
                  <Image
                    src={TETROMINO_IMAGES[heldPiece]}
                    alt="Held Piece"
                    width={60}
                    height={60}
                  />
                )}
              </div>
              <div className="w-20 h-20 bg-background/20 rounded-lg p-2">
                <p className="text-sm mb-1">Next:</p>
                <Image
                  src={TETROMINO_IMAGES[nextPiece]}
                  alt="Next Piece"
                  width={60}
                  height={60}
                />
              </div>
            </div>
            <div
              className="grid grid-cols-10 gap-0.5 bg-background/50 p-2 rounded-lg mx-auto"
              style={{ width: "280px", height: "560px" }}
            >
              <AnimatePresence>
                {board.map((row, rowIndex) =>
                  row.map((cell, cellIndex) => {
                    const isPieceCell =
                      currentPiece &&
                      currentPosition.y <= rowIndex &&
                      rowIndex < currentPosition.y + currentPiece.length &&
                      currentPosition.x <= cellIndex &&
                      cellIndex < currentPosition.x + currentPiece[0].length &&
                      currentPiece[rowIndex - currentPosition.y][
                        cellIndex - currentPosition.x
                      ] !== 0;

                    const ghostPosition = getGhostPosition();
                    const isGhostCell =
                      ghostPosition &&
                      currentPiece &&
                      ghostPosition.y <= rowIndex &&
                      rowIndex < ghostPosition.y + currentPiece.length &&
                      ghostPosition.x <= cellIndex &&
                      cellIndex < ghostPosition.x + currentPiece[0].length &&
                      currentPiece[rowIndex - ghostPosition.y][
                        cellIndex - ghostPosition.x
                      ] !== 0;

                    return (
                      <motion.div
                        key={`${rowIndex}-${cellIndex}`}
                        className={`w-[26px] h-[26px] border rounded-sm overflow-hidden ${
                          isGhostCell
                            ? "border-white/50"
                            : "border-background/20"
                        }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {(cell !== null || isPieceCell || isGhostCell) && (
                          <Image
                            src={
                              cell ||
                              (isPieceCell
                                ? currentImage
                                : isGhostCell
                                ? currentImage
                                : "")
                            }
                            alt="Tetris Block"
                            width={26}
                            height={26}
                            className={`w-full h-full ${
                              isGhostCell ? "opacity-30" : ""
                            }`}
                          />
                        )}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
              {showParticles && <Particles count={50} />}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button onClick={moveLeft} className="w-full">
                <ArrowLeft className="mr-2" /> Left
              </Button>
              <Button onClick={moveDown} className="w-full">
                <ArrowDown className="mr-2" /> Down
              </Button>
              <Button onClick={moveRight} className="w-full">
                <ArrowRight className="mr-2" /> Right
              </Button>
              <Button onClick={rotate} className="w-full col-span-2">
                <RotateCcw className="mr-2" /> Rotate
              </Button>
              <Button onClick={holdPiece} className="w-full">
                <PauseCircle className="mr-2" /> Hold
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-center w-full">
              Use the buttons or the keyboard (arrow keys and space) to move and
              rotate the pieces. Press &#39;H&#39; to hold a piece. Clear lines
              to score points and level up!
            </p>
          </CardFooter>
        </Card>
      </motion.div>
      {showConfetti && <Confetti />}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50"
        >
          <Card className="w-64 text-center">
            <CardHeader>
              <CardTitle>Game Over</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your score: {score}</p>
              <p>Level reached: {level}</p>
              {score === highScore && (
                <p className="text-green-500 font-bold mt-2">New High Score!</p>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={resetGame} className="w-full">
                Play Again
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
