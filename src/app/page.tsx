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
    description: "Classic game of X's and O's",
  },
  {
    name: "Sudoku",
    path: "/games/sudoku",
    icon: Puzzle,
    description: "Fill the grid with numbers",
  },
  {
    name: "Memory Game",
    path: "/games/memory",
    icon: Puzzle,
    description: "Test your memory skills",
  },
  {
    name: "Tetris",
    path: "/games/tetris",
    icon: Square,
    description: "Stack and clear the blocks",
  },
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
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8">
      <motion.h1
        className="text-4xl font-bold text-center mb-8 text-white"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to GameHub
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game, index) => {
          const Icon = game.icon;
          return (
            <motion.div
              key={game.path}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden h-full bg-white/10 backdrop-blur-md border-none transition-all duration-300 hover:shadow-lg hover:scale-105">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Icon className="h-6 w-6" />
                    <span>{game.name}</span>
                  </CardTitle>
                  <CardDescription className="text-gray-200">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-300">
                    Test your skills and have fun with our{" "}
                    {game.name.toLowerCase()} game.
                  </p>
                </CardContent>
                <CardFooter>
                  {game.sizes ? (
                    <Button
                      className="w-full group bg-white text-purple-600 hover:bg-purple-100"
                      onClick={() => handleGameClick(game)}
                    >
                      Play Now
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  ) : (
                    <Link href={game.path} className="w-full">
                      <Button className="w-full group bg-white text-purple-600 hover:bg-purple-100">
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
        <DialogContent className="bg-white/90 backdrop-blur-md">
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
                <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">
                  {size}x{size}
                </Button>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bubble"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 10 + 5}s`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
