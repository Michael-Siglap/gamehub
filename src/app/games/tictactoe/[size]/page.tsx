"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import Modal from "@/components/Modal";

export default function TicTacToe() {
  const { size } = useParams();
  const router = useRouter();
  const boardSize = parseInt(size as string) || 3;

  // Determine win condition based on board size
  const getWinCondition = (size: number): number => {
    if (size === 3 || size === 6) return 3;
    if (size === 12) return 5;
    return 3; // Default
  };

  const winCondition = getWinCondition(boardSize);

  const [board, setBoard] = useState<Array<string | null>>(
    Array(boardSize * boardSize).fill(null)
  );
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // State variables for scores and AI difficulty
  const [playerWins, setPlayerWins] = useState<number>(0);
  const [aiWins, setAiWins] = useState<number>(0);
  const [showReplayPrompt, setShowReplayPrompt] = useState<boolean>(false);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [aiDifficulty, setAIDifficulty] = useState<string>("easy"); // 'easy', 'medium', 'hard'
  const [playerConsecutiveWins, setPlayerConsecutiveWins] = useState<number>(0);

  // Initialize scores from localStorage
  useEffect(() => {
    const savedPlayerWins = localStorage.getItem(
      `tictactoe-${boardSize}-playerWins`
    );
    const savedAiWins = localStorage.getItem(`tictactoe-${boardSize}-aiWins`);
    if (savedPlayerWins) setPlayerWins(parseInt(savedPlayerWins));
    if (savedAiWins) setAiWins(parseInt(savedAiWins));
  }, [boardSize]);

  // Update localStorage when scores change
  useEffect(() => {
    localStorage.setItem(
      `tictactoe-${boardSize}-playerWins`,
      playerWins.toString()
    );
  }, [playerWins, boardSize]);

  useEffect(() => {
    localStorage.setItem(`tictactoe-${boardSize}-aiWins`, aiWins.toString());
  }, [aiWins, boardSize]);

  useEffect(() => {
    if (winner) {
      setShowConfetti(true);
      const confettiTimeout = setTimeout(() => setShowConfetti(false), 5000);
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

  // 1. useEffect for updating scores when the game ends
  useEffect(() => {
    if (winner || board.every(Boolean)) {
      const gameEndTime = Date.now();
      const gameDuration = Math.floor(
        (gameEndTime - (gameStartTime || gameEndTime)) / 1000
      );
      updateTimePlayed(gameDuration);
      incrementGamesPlayed(`Tic Tac Toe ${boardSize}x${boardSize}`);

      // Update scores
      if (winner === "X") {
        setPlayerWins((prev) => prev + 1);
        setPlayerConsecutiveWins((prev) => prev + 1);
      } else if (winner === "O") {
        setAiWins((prev) => prev + 1);
        setPlayerConsecutiveWins(0);
      } else {
        setPlayerConsecutiveWins(0);
      }

      // Show replay prompt
      setShowReplayPrompt(true);
    }
  }, [winner]);

  // 2. useEffect for AI difficulty progression
  useEffect(() => {
    if (
      playerConsecutiveWins > 0 &&
      playerConsecutiveWins % 3 === 0 &&
      aiDifficulty !== "hard"
    ) {
      if (aiDifficulty === "easy") {
        setAIDifficulty("medium");
      } else if (aiDifficulty === "medium") {
        setAIDifficulty("hard");
      }
    }
  }, [playerConsecutiveWins]);

  // 3. useEffect for AI move
  useEffect(() => {
    if (!xIsNext && !winner && !isBoardFull(board)) {
      const timer = setTimeout(() => {
        const aiMove = calculateAIMove(
          board,
          boardSize,
          winCondition,
          aiDifficulty
        );
        if (aiMove !== null) {
          handleClick(aiMove);
        }
      }, 500); // Delay AI move for better UX
      return () => clearTimeout(timer);
    }
  }, [xIsNext, winner, board, boardSize, winCondition]);

  const handleClick = (index: number) => {
    if (winner || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);

    const winnerInfo = calculateWinner(newBoard, boardSize, winCondition);
    if (winnerInfo) {
      setWinner(winnerInfo.winner);
      setWinningLine(winnerInfo.line);
    }
  };

  const renderSquare = (index: number) => {
    const isWinningSquare = winningLine?.includes(index);
    let bgColor = "";
    let textColor = "";

    if (isWinningSquare) {
      bgColor = "bg-green-500"; // Always green for winning squares
      textColor = "text-white";
    }

    return (
      <Button
        key={index}
        variant={board[index] ? "default" : "outline"}
        className={`w-full h-full aspect-square text-2xl font-bold ${bgColor} ${textColor}`}
        onClick={() => handleClick(index)}
        disabled={!xIsNext && !board[index]} // Disable buttons when AI is playing
      >
        {board[index]}
      </Button>
    );
  };

  const resetGame = () => {
    setBoard(Array(boardSize * boardSize).fill(null));
    setXIsNext(true);
    setWinner(null);
    setGameStartTime(Date.now());
    setWinningLine(null);
    // Do not reset playerWins and aiWins here
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
      className="p-4 min-h-screen flex flex-col items-center justify-center bg-gray-100"
    >
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl text-center">
            Tic Tac Toe {boardSize}x{boardSize}
          </CardTitle>
          <CardDescription className="text-center">
            Get {winCondition} in a row to win!
          </CardDescription>
          {/* Display Scores */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Badge
              variant="secondary"
              className="text-lg py-1 px-3 badge-player"
            >
              Player Wins: {playerWins}
            </Badge>
            <Badge variant="secondary" className="text-lg py-1 px-3 badge-ai">
              AI Wins: {aiWins}
            </Badge>
          </div>
          {/* AI Difficulty Selector */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <label
              htmlFor="ai-difficulty"
              className="block text-sm font-medium text-gray-700"
            >
              AI Difficulty:
            </label>
            <select
              id="ai-difficulty"
              name="ai-difficulty"
              value={aiDifficulty}
              onChange={(e) => setAIDifficulty(e.target.value)}
              className="mt-1 block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between">
            <Badge variant="outline" className="text-lg py-1 px-3 mb-4 sm:mb-0">
              {status}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={resetGame}
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Game
            </Button>
          </div>
          <div
            className="grid gap-2 mb-6"
            style={{
              gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            }}
          >
            {board.map((_, index) => renderSquare(index))}
          </div>
          {(winner || board.every(Boolean)) && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <div>
                <AlertTitle>Game Over</AlertTitle>
                <AlertDescription>
                  {winner ? `Player ${winner} wins!` : "It's a draw!"}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground text-center">
            Tip: Try to block your opponent while forming your own line!
          </p>
        </CardFooter>
      </Card>
      {showConfetti && <Confetti />}

      {/* Replay Prompt Modal */}
      {showReplayPrompt && (
        <Modal
          title="Game Over"
          message={winner ? `Player ${winner} wins!` : "It's a draw!"}
          onConfirm={() => {
            setShowReplayPrompt(false);
            resetGame(); // Reset the game while keeping scores
          }}
          onCancel={() => {
            setShowReplayPrompt(false);
            router.push("/dashboard"); // Redirect to dashboard
          }}
        />
      )}
    </motion.div>
  );
}

function isBoardFull(board: Array<string | null>): boolean {
  return board.every(Boolean);
}

function calculateAIMove(
  board: Array<string | null>,
  size: number,
  winCondition: number,
  aiDifficulty: string
): number | null {
  return calculateAIMoveHelper(board, size, winCondition, aiDifficulty);
}

function calculateAIMoveHelper(
  board: Array<string | null>,
  size: number,
  winCondition: number,
  aiDifficulty: string
): number | null {
  const ai = "O";
  const human = "X";

  if (aiDifficulty === "easy") {
    return getRandomMove(board);
  }

  if (aiDifficulty === "medium") {
    // First, check if AI can win in the next move
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        const newBoard = [...board];
        newBoard[i] = ai;
        const winnerInfo = calculateWinner(newBoard, size, winCondition);
        if (winnerInfo && winnerInfo.winner === ai) {
          return i;
        }
      }
    }

    // Then, check if the player can win in the next move and block them
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        const newBoard = [...board];
        newBoard[i] = human;
        const winnerInfo = calculateWinner(newBoard, size, winCondition);
        if (winnerInfo && winnerInfo.winner === human) {
          return i;
        }
      }
    }

    // Otherwise, take the center or a corner
    const center = Math.floor(board.length / 2);
    if (board[center] === null) {
      return center;
    }

    const corners = getCorners(size);
    for (const corner of corners) {
      if (board[corner] === null) {
        return corner;
      }
    }

    // Take a random available spot
    return getRandomMove(board);
  }

  if (aiDifficulty === "hard") {
    // Implement Minimax algorithm with optimization for larger boards
    const bestMove = minimax(
      board,
      size,
      winCondition,
      ai,
      human,
      true,
      -Infinity,
      Infinity,
      0,
      getMaxDepth(size)
    );
    return bestMove !== null ? bestMove.index : getRandomMove(board);
  }

  return getRandomMove(board);
}

function getRandomMove(board: Array<string | null>): number {
  const availableIndices = board
    .map((value, index) => (value === null ? index : null))
    .filter((val) => val !== null) as number[];
  if (availableIndices.length === 0) return -1;
  return availableIndices[Math.floor(Math.random() * availableIndices.length)];
}

function getCorners(size: number): number[] {
  if (size === 3) {
    return [0, 2, 6, 8];
  }
  if (size === 6) {
    return [0, 5, 30, 35];
  }
  if (size === 12) {
    return [0, 11, 132, 143];
  }
  // For other sizes, calculate corners dynamically
  const corners = [];
  corners.push(0); // Top-left corner
  corners.push(size - 1); // Top-right corner
  corners.push(size * (size - 1)); // Bottom-left corner
  corners.push(size * size - 1); // Bottom-right corner
  return corners;
}

function calculateWinner(
  squares: Array<string | null>,
  size: number,
  winCondition: number
): { winner: string; line: number[] } | null {
  const directions = [
    { x: 1, y: 0 }, // Horizontal
    { x: 0, y: 1 }, // Vertical
    { x: 1, y: 1 }, // Diagonal right-down
    { x: 1, y: -1 }, // Diagonal right-up
  ];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const currentIndex = row * size + col;
      const currentSymbol = squares[currentIndex];
      if (!currentSymbol) continue;

      for (const dir of directions) {
        const line = [currentIndex];
        let nextRow = row + dir.y;
        let nextCol = col + dir.x;

        while (
          nextRow >= 0 &&
          nextRow < size &&
          nextCol >= 0 &&
          nextCol < size &&
          squares[nextRow * size + nextCol] === currentSymbol
        ) {
          line.push(nextRow * size + nextCol);
          if (line.length === winCondition) {
            return { winner: currentSymbol, line };
          }
          nextRow += dir.y;
          nextCol += dir.x;
        }
      }
    }
  }

  return null;
}

function minimax(
  board: Array<string | null>,
  size: number,
  winCondition: number,
  aiPlayer: string,
  humanPlayer: string,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  depth: number = 0,
  maxDepth: number = 6 // Increased depth for smarter AI
): { score: number; index: number } | null {
  const winnerInfo = calculateWinner(board, size, winCondition);
  if (winnerInfo && winnerInfo.winner === aiPlayer) {
    return { score: 10 - depth, index: -1 };
  } else if (winnerInfo && winnerInfo.winner === humanPlayer) {
    return { score: depth - 10, index: -1 };
  } else if (isBoardFull(board)) {
    return { score: 0, index: -1 };
  }

  if (depth === maxDepth) {
    const heuristicScore = evaluateBoard(
      board,
      size,
      winCondition,
      aiPlayer,
      humanPlayer
    );
    return { score: heuristicScore, index: -1 };
  }

  const availableMoves = board
    .map((value, index) => (value === null ? index : null))
    .filter((val) => val !== null) as number[];

  let bestMove: { score: number; index: number } | null = null;

  if (isMaximizing) {
    let maxEval = -Infinity;
    let bestIndex = -1;
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = aiPlayer;
      const evaluation = minimax(
        newBoard,
        size,
        winCondition,
        aiPlayer,
        humanPlayer,
        false,
        alpha,
        beta,
        depth + 1,
        maxDepth
      );
      if (evaluation) {
        if (evaluation.score > maxEval) {
          maxEval = evaluation.score;
          bestIndex = move;
        }
        alpha = Math.max(alpha, evaluation.score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    bestMove = { score: maxEval, index: bestIndex };
  } else {
    let minEval = Infinity;
    let bestIndex = -1;
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = humanPlayer;
      const evaluation = minimax(
        newBoard,
        size,
        winCondition,
        aiPlayer,
        humanPlayer,
        true,
        alpha,
        beta,
        depth + 1,
        maxDepth
      );
      if (evaluation) {
        if (evaluation.score < minEval) {
          minEval = evaluation.score;
          bestIndex = move;
        }
        beta = Math.min(beta, evaluation.score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    bestMove = { score: minEval, index: bestIndex };
  }

  return bestMove;
}

function evaluateBoard(
  board: Array<string | null>,
  size: number,
  winCondition: number,
  aiPlayer: string,
  humanPlayer: string
): number {
  let score = 0;

  // Evaluate rows, columns, and diagonals
  const lines = getAllLines(board, size, winCondition);

  for (const line of lines) {
    const aiCount = line.filter((cell) => cell === aiPlayer).length;
    const humanCount = line.filter((cell) => cell === humanPlayer).length;

    if (aiCount > 0 && humanCount === 0) {
      score += Math.pow(10, aiCount);
    } else if (humanCount > 0 && aiCount === 0) {
      score -= Math.pow(10, humanCount);
    }
  }

  return score;
}

function getAllLines(
  board: Array<string | null>,
  size: number,
  winCondition: number
): Array<Array<string | null>> {
  const lines: Array<Array<string | null>> = [];

  // Rows
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - winCondition; col++) {
      const line = [];
      for (let k = 0; k < winCondition; k++) {
        line.push(board[row * size + (col + k)]);
      }
      lines.push(line);
    }
  }

  // Columns
  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - winCondition; row++) {
      const line = [];
      for (let k = 0; k < winCondition; k++) {
        line.push(board[(row + k) * size + col]);
      }
      lines.push(line);
    }
  }

  // Diagonals (Top-Left to Bottom-Right)
  for (let row = 0; row <= size - winCondition; row++) {
    for (let col = 0; col <= size - winCondition; col++) {
      const line = [];
      for (let k = 0; k < winCondition; k++) {
        line.push(board[(row + k) * size + (col + k)]);
      }
      lines.push(line);
    }
  }

  // Diagonals (Bottom-Left to Top-Right)
  for (let row = winCondition - 1; row < size; row++) {
    for (let col = 0; col <= size - winCondition; col++) {
      const line = [];
      for (let k = 0; k < winCondition; k++) {
        line.push(board[(row - k) * size + (col + k)]);
      }
      lines.push(line);
    }
  }

  return lines;
}

function getMaxDepth(size: number): number {
  if (size <= 3) return 9; // Full search for 3x3
  if (size <= 6) return 3; // Moderate depth for 6x6
  return 2; // Shallow depth for 12x12 and larger
}
