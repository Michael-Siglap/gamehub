"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { incrementGamesPlayed, updateTimePlayed } from "@/utils/userStats";
import { Confetti } from "@/components/confetti";
import { motion } from "framer-motion";

export default function TicTacToe() {
  const { size } = useParams();
  const boardSize = parseInt(size as string) || 3;
  const [board, setBoard] = useState<Array<string | null>>(
    Array(boardSize * boardSize).fill(null)
  );
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  useEffect(() => {
    if (winner) {
      setShowConfetti(true);
      const confettiTimeout = setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
      return () => clearTimeout(confettiTimeout);
    }
  }, [winner]);

  useEffect(() => {
    const savedState = localStorage.getItem(`tictactoe-${boardSize}`);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setBoard(parsedState.board);
      setXIsNext(parsedState.xIsNext);
    }
    setGameStartTime(Date.now());
  }, [boardSize]);

  useEffect(() => {
    localStorage.setItem(
      `tictactoe-${boardSize}`,
      JSON.stringify({ board, xIsNext })
    );
  }, [board, xIsNext, boardSize]);

  useEffect(() => {
    if (winner || board.every(Boolean)) {
      const gameEndTime = Date.now();
      const gameDuration = Math.floor(
        (gameEndTime - (gameStartTime || gameEndTime)) / 1000
      );
      updateTimePlayed(gameDuration);
      incrementGamesPlayed(`Tic Tac Toe ${boardSize}x${boardSize}`);
    }
  }, [winner, board, boardSize, gameStartTime]);

  const handleClick = (index: number) => {
    if (winner || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);

    const newWinner = calculateWinner(newBoard, boardSize);
    if (newWinner) {
      setWinner(newWinner);
    }
  };

  const renderSquare = (index: number) => (
    <Button
      key={index}
      variant={board[index] ? "default" : "outline"}
      className="w-full h-full aspect-square text-2xl font-bold"
      onClick={() => handleClick(index)}
    >
      {board[index]}
    </Button>
  );

  const resetGame = () => {
    setBoard(Array(boardSize * boardSize).fill(null));
    setXIsNext(true);
    setWinner(null);
    setGameStartTime(Date.now());
  };

  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (board.every(Boolean)) {
    status = "It's a draw!";
  } else {
    status = `Next player: ${xIsNext ? "X" : "O"}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">
            Tic Tac Toe {boardSize}x{boardSize}
          </CardTitle>
          <CardDescription>Get {boardSize} in a row to win!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <Badge variant="outline" className="text-lg py-1 px-3">
              {status}
            </Badge>
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Game
            </Button>
          </div>
          <div
            className="grid gap-2 mb-4"
            style={{
              gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            }}
          >
            {board.map((_, index) => renderSquare(index))}
          </div>
          {(winner || board.every(Boolean)) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Game Over</AlertTitle>
              <AlertDescription>
                {winner ? `Player ${winner} wins!` : "It's a draw!"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Tip: Try to block your opponent while forming your own line!
          </p>
        </CardFooter>
      </Card>
      {showConfetti && <Confetti />}
    </motion.div>
  );
}

function calculateWinner(
  squares: Array<string | null>,
  size: number
): string | null {
  const lines: number[][] = [];

  // Rows
  for (let i = 0; i < size; i++) {
    lines.push(Array.from({ length: size }, (_, j) => i * size + j));
  }

  // Columns
  for (let i = 0; i < size; i++) {
    lines.push(Array.from({ length: size }, (_, j) => j * size + i));
  }

  // Diagonals
  lines.push(Array.from({ length: size }, (_, i) => i * size + i));
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));

  for (const line of lines) {
    const [first, ...rest] = line;
    if (
      squares[first] &&
      rest.every((index) => squares[index] === squares[first])
    ) {
      return squares[first];
    }
  }

  return null;
}
