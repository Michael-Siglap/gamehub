"use client";

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
import { ArrowRight, Grid3X3, Grid, Puzzle } from "lucide-react";
import { motion } from "framer-motion";

const games = [
  { name: "Tic Tac Toe 3x3", path: "/games/tictactoe/3", icon: Grid3X3 },
  { name: "Tic Tac Toe 6x6", path: "/games/tictactoe/6", icon: Grid },
  { name: "Tic Tac Toe 12x12", path: "/games/tictactoe/12", icon: Grid },
  { name: "Sudoku", path: "/games/sudoku", icon: Puzzle },
  { name: "Memory Game", path: "/games/memory", icon: Puzzle },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center">Welcome to GameTap</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    Challenge yourself with this game!
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">
                    Test your skills and have fun with our{" "}
                    {game.name.toLowerCase()} game.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={game.path} className="w-full">
                    <Button className="w-full group">
                      Play Now
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
