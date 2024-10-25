"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowRight,
  Grid3X3,
  Puzzle,
  Square,
  CrosshairIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const games = [
  {
    name: "Tic Tac Toe",
    path: "/games/tictactoe",
    icon: Grid3X3,
    sizes: [3, 6, 12],
  },
  { name: "Sudoku", path: "/games/sudoku", icon: Puzzle },
  { name: "Memory Game", path: "/games/memory", icon: Puzzle },
  { name: "Tetris", path: "/games/tetris", icon: Square },
  {
    name: "Crossword",
    path: "/games/crossword",
    icon: CrosshairIcon,
    description: "Daily puzzles and custom difficulties",
  },
];

export default function Home() {
  const [open, setOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<(typeof games)[0] | null>(
    null
  );

  const handleGameClick = (game: (typeof games)[0]) => {
    if (game.sizes) {
      setSelectedGame(game);
      setOpen(true);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center">Welcome to GameHub</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <motion.div
              key={game.path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="overflow-hidden h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <Icon className="h-6 w-6" />
                    <span>{game.name}</span>
                  </CardTitle>
                  <CardDescription>
                    {game.description || "Challenge yourself with this game!"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">
                    Test your skills and have fun with our{" "}
                    {game.name.toLowerCase()} game.
                  </p>
                </CardContent>
                <CardFooter>
                  {game.sizes ? (
                    <Button
                      className="w-full group"
                      onClick={() => handleGameClick(game)}
                    >
                      Play Now
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  ) : (
                    <Link href={game.path} className="w-full">
                      <Button className="w-full group">
                        Play Now
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select {selectedGame?.name} Size</DialogTitle>
            <DialogDescription>
              Choose the size of the {selectedGame?.name} board you want to
              play.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            {selectedGame?.sizes?.map((size) => (
              <Link key={size} href={`${selectedGame.path}/${size}`}>
                <Button className="w-full">
                  {size}x{size}
                </Button>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
