"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Grid3X3, Puzzle, Square, CrosshairIcon, Anchor } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CrosshairIcon as Crosshair2 } from "lucide-react";

const games = [
  {
    name: "Tic Tac Toe",
    path: "/games/tictactoe",
    icon: Grid3X3,
    sizes: [3, 6, 12],
    description: "Classic game of X's and O's",
    content: "Strategize your moves in this timeless battle of wits.",
    image: "/tictactoe.webp?height=200&width=400&text=Tic Tac Toe&bg=FF5733",
  },
  {
    name: "Sudoku",
    path: "/games/sudoku",
    icon: Puzzle,
    description: "Fill the grid with numbers",
    content: "Challenge your logical thinking with number placement puzzles.",
    image: "/sudoku.webp?height=200&width=400&text=Sudoku&bg=33FF57",
  },
  {
    name: "Memory Game",
    path: "/games/memory",
    icon: Puzzle,
    description: "Test your memory skills",
    content: "Sharpen your recall abilities by matching pairs of hidden cards.",
    image: "/memory.webp?height=200&width=400&text=Memory Game&bg=3357FF",
  },
  {
    name: "Tetris",
    path: "/games/tetris",
    icon: Square,
    description: "Stack and clear the blocks",
    content:
      "Experience the thrill of rapid block-stacking in this classic arcade game.",
    image: "/tetris.webp?height=200&width=400&text=Tetris&bg=FF33F1",
  },
  {
    name: "Crossword",
    path: "/games/crossword",
    icon: CrosshairIcon,
    description: "Daily puzzles and custom difficulties",
    content:
      "Expand your vocabulary and test your knowledge with word puzzles.",
    image: "/crossword.webp?height=200&width=400&text=Crossword&bg=F1FF33",
  },
  {
    name: "Boat Sinking",
    path: "/games/boat-sinking",
    icon: Anchor,
    description: "Sink enemy ships in this naval battle game",
    content:
      "Engage in tactical warfare on the high seas as you hunt down enemy vessels.",
    image: "/boatsinking.webp?height=200&width=400&text=Boat Sinking&bg=33FFF1",
  },
  {
    name: "Stellar Assault",
    path: "/games/stellar-assault",
    icon: Crosshair2,
    description: "2D space shooter game",
    content:
      "Engage in an intense space battle with smooth graphics and particle effects.",
    image:
      "/stellar-assault.webp?height=200&width=400&text=Stellar Assault&bg=000033",
  },
];

export default function Home() {
  const [open, setOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<(typeof games)[0] | null>(
    null
  );
  const [bubbleStyles, setBubbleStyles] = useState<
    Array<{ left: string; animationDelay: string; animationDuration: string }>
  >([]);

  useEffect(() => {
    const newBubbleStyles = Array(5)
      .fill(null)
      .map(() => ({
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${Math.random() * 10 + 5}s`,
      }));
    setBubbleStyles(newBubbleStyles);
  }, []);

  const handleGameClick = (game: (typeof games)[0]) => {
    if (game.sizes) {
      setSelectedGame(game);
      setOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8">
      <motion.h1
        className="text-4xl font-bold text-center mb-4 text-white"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to GameHub
      </motion.h1>
      <motion.p
        className="text-xl text-center mb-8 text-white/80"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Experience AI-crafted games and challenge artificial intelligence in
        thrilling matches!
      </motion.p>
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
              <Link
                href={game.sizes ? "#" : game.path}
                onClick={(e) => {
                  if (game.sizes) {
                    e.preventDefault();
                    handleGameClick(game);
                  }
                }}
                className="block h-full"
              >
                <Card className="group flex flex-col h-full bg-white/10 backdrop-blur-md border-none transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer overflow-hidden">
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={game.image}
                      alt={game.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="rounded-t-lg transition-transform duration-300 group-hover:scale-110 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="flex items-center space-x-2 text-white group-hover:text-purple-300 transition-colors duration-300">
                      <Icon className="h-6 w-6" />
                      <span>{game.name}</span>
                    </CardTitle>
                    <CardDescription className="text-gray-200 group-hover:text-white transition-colors duration-300">
                      {game.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow pb-4 relative z-10">
                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300">
                      {game.content}
                    </p>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Card>
              </Link>
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
          {bubbleStyles.map((style, i) => (
            <div key={i} className="bubble" style={style}></div>
          ))}
        </div>
      </div>
    </div>
  );
}
