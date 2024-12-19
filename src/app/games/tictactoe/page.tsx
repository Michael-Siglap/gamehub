"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function TicTacToeEntry() {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  const handleSizeSelect = (size: number) => {
    setSelectedSize(size);
  };

  const handleStartGame = () => {
    if (selectedSize) {
      router.push(`/games/tictactoe/${selectedSize}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 min-h-screen flex flex-col items-center justify-center bg-gray-100"
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Tic Tac Toe</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl mb-4 text-center">Select Board Size</h2>
          <div className="flex justify-center space-x-4 mb-6">
            {[3, 6, 12].map((size) => (
              <Button
                key={size}
                onClick={() => handleSizeSelect(size)}
                variant={selectedSize === size ? "default" : "outline"}
              >
                {size}x{size}
              </Button>
            ))}
          </div>
          <Button
            onClick={handleStartGame}
            disabled={!selectedSize}
            className="w-full"
          >
            Start Game
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
