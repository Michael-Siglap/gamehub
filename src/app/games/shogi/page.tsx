"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import confetti from "canvas-confetti";
import { Info, HelpCircle } from "lucide-react";
import { useTheme } from "next-themes";

type Piece = {
  type: string;
  player: "sente" | "gote";
};

type BoardState = (Piece | null)[][];

const initialBoard: BoardState = [
  [
    { type: "lance", player: "gote" },
    { type: "knight", player: "gote" },
    { type: "silver", player: "gote" },
    { type: "gold", player: "gote" },
    { type: "king", player: "gote" },
    { type: "gold", player: "gote" },
    { type: "silver", player: "gote" },
    { type: "knight", player: "gote" },
    { type: "lance", player: "gote" },
  ],
  [
    null,
    { type: "rook", player: "gote" },
    null,
    null,
    null,
    null,
    null,
    { type: "bishop", player: "gote" },
    null,
  ],
  [
    { type: "pawn", player: "gote" },
    { type: "pawn", player: "gote" },
    { type: "pawn", player: "gote" },
    { type: "pawn", player: "gote" },
    { type: "pawn", player: "gote" },
    { type: "pawn", player: "gote" },
    { type: "pawn", player: "gote" },
    { type: "pawn", player: "gote" },
    { type: "pawn", player: "gote" },
  ],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [
    { type: "pawn", player: "sente" },
    { type: "pawn", player: "sente" },
    { type: "pawn", player: "sente" },
    { type: "pawn", player: "sente" },
    { type: "pawn", player: "sente" },
    { type: "pawn", player: "sente" },
    { type: "pawn", player: "sente" },
    { type: "pawn", player: "sente" },
    { type: "pawn", player: "sente" },
  ],
  [
    null,
    { type: "bishop", player: "sente" },
    null,
    null,
    null,
    null,
    null,
    { type: "rook", player: "sente" },
    null,
  ],
  [
    { type: "lance", player: "sente" },
    { type: "knight", player: "sente" },
    { type: "silver", player: "sente" },
    { type: "gold", player: "sente" },
    { type: "king", player: "sente" },
    { type: "gold", player: "sente" },
    { type: "silver", player: "sente" },
    { type: "knight", player: "sente" },
    { type: "lance", player: "sente" },
  ],
];

export default function ShogiGame() {
  const [board, setBoard] = useState<BoardState>(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(
    null
  );
  const [currentPlayer, setCurrentPlayer] = useState<"sente" | "gote">("sente");
  const [winner, setWinner] = useState<"sente" | "gote" | null>(null);
  const [showGuidance, setShowGuidance] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    if (winner) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [winner]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (winner) return;

      if (selectedPiece) {
        const [selectedRow, selectedCol] = selectedPiece;
        const piece = board[selectedRow][selectedCol];

        if (piece && piece.player === currentPlayer) {
          // Move the piece
          const newBoard = [...board];
          newBoard[row][col] = piece;
          newBoard[selectedRow][selectedCol] = null;
          setBoard(newBoard);
          setSelectedPiece(null);
          setCurrentPlayer(currentPlayer === "sente" ? "gote" : "sente");

          // Check for win condition (simplified)
          if (piece.type === "king") {
            setWinner(currentPlayer);
          }
        } else {
          // Invalid move, deselect the piece
          setSelectedPiece(null);
        }
      } else {
        // Select the piece
        if (board[row][col] && board[row][col]?.player === currentPlayer) {
          setSelectedPiece([row, col]);
        }
      }
    },
    [board, selectedPiece, currentPlayer, winner]
  );

  const renderCell = useCallback(
    (piece: Piece | null, row: number, col: number) => {
      const isSelected =
        selectedPiece && selectedPiece[0] === row && selectedPiece[1] === col;
      return (
        <motion.div
          key={`${row}-${col}`}
          className={`w-12 h-12 sm:w-16 sm:h-16 border ${
            theme === "dark" ? "border-gray-600" : "border-gray-400"
          } flex items-center justify-center cursor-pointer
        ${
          isSelected
            ? theme === "dark"
              ? "bg-yellow-700"
              : "bg-yellow-200"
            : theme === "dark"
            ? "bg-wood-pattern-dark"
            : "bg-wood-pattern"
        }
        ${
          piece?.player === "sente"
            ? theme === "dark"
              ? "text-white"
              : "text-black"
            : theme === "dark"
            ? "text-red-400"
            : "text-red-600"
        }`}
          onClick={() => handleCellClick(row, col)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence>
            {piece && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="text-2xl sm:text-3xl font-bold"
              >
                {getPieceSymbol(piece.type)}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );
    },
    [handleCellClick, selectedPiece, theme]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 dark:from-blue-900 dark:to-purple-900 p-4 sm:p-8 transition-colors duration-300">
      <Card className="w-full max-w-2xl mx-auto overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Shogi (将棋)
            </h1>
            <div className="flex items-center space-x-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-gray-600 dark:text-gray-300"
                  >
                    <Info className="h-4 w-4" />
                    <span className="sr-only">Game Information</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  <h2 className="text-lg font-semibold mb-2">About Shogi</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Shogi, also known as Japanese chess, is a two-player
                    strategy board game native to Japan. It&apos;s played on a
                    9x9 board with 40 wedge-shaped pieces. The objective is to
                    capture the opponent&apos;s king.
                  </p>
                  <h3 className="text-md font-semibold mt-4 mb-2">
                    Key Rules:
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                    <li>Pieces move according to their type</li>
                    <li>
                      Captured pieces can be dropped back onto the board as your
                      own
                    </li>
                    <li>
                      Most pieces can be promoted when they reach the
                      opponent&apos;s territory
                    </li>
                  </ul>
                </PopoverContent>
              </Popover>
              <div className="flex items-center space-x-2">
                <Switch
                  id="guidance-mode"
                  checked={showGuidance}
                  onCheckedChange={setShowGuidance}
                />
                <label
                  htmlFor="guidance-mode"
                  className="text-sm text-gray-600 dark:text-gray-300"
                >
                  Guidance
                </label>
              </div>
            </div>
          </div>
          <div className="mb-4 text-center">
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Current Player:{" "}
              {currentPlayer === "sente" ? "Sente (先手)" : "Gote (後手)"}
            </p>
          </div>
          <div className="grid grid-cols-9 gap-1 max-w-md mx-auto mb-6">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
            )}
          </div>
          {showGuidance && (
            <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center text-blue-800 dark:text-blue-200">
                <HelpCircle className="mr-2" /> How to Play
              </h3>
              <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300">
                <li>Click on a piece to select it</li>
                <li>Click on an empty square to move the selected piece</li>
                <li>
                  Capture opponent&apos;s pieces by moving onto their square
                </li>
                <li>The game ends when a king is captured</li>
              </ol>
            </div>
          )}
          <div className="flex justify-center">
            <Button
              onClick={() => {
                setBoard(initialBoard);
                setSelectedPiece(null);
                setCurrentPlayer("sente");
                setWinner(null);
              }}
              className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 transform hover:scale-105"
            >
              New Game
            </Button>
          </div>
        </CardContent>
      </Card>
      {winner && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <Card className="p-8 text-center bg-white dark:bg-gray-800">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              {winner === "sente" ? "Sente (先手)" : "Gote (後手)"} wins!
            </h2>
            <Button
              onClick={() => {
                setBoard(initialBoard);
                setSelectedPiece(null);
                setCurrentPlayer("sente");
                setWinner(null);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Play Again
            </Button>
          </Card>
        </motion.div>
      )}
      <Toaster />
    </div>
  );
}

function getPieceSymbol(pieceType: string): string {
  const symbols: { [key: string]: string } = {
    king: "王",
    rook: "飛",
    bishop: "角",
    gold: "金",
    silver: "銀",
    knight: "桂",
    lance: "香",
    pawn: "歩",
  };
  return symbols[pieceType] || "";
}
