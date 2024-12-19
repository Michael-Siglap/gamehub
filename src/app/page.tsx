"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GameGrid from "@/components/GameGrid";
import GameModal from "@/components/GameModal";
import HeroSection from "@/components/HeroSection";
import { Game, games } from "@/data/games";
import { Search, Filter } from "lucide-react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredGames, setFilteredGames] = useState(games);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    const filtered = games.filter(
      (game) =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === "All" || game.category === selectedCategory)
    );
    setFilteredGames(filtered);
  }, [searchTerm, selectedCategory]);

  const categories = ["All", ...new Set(games.map((game) => game.category))];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500"
    >
      <HeroSection />
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0 md:space-x-4"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-full md:w-1/3"
          >
            <Input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto"
          >
            <Filter className="text-white" />
            {categories.map((category, index) => (
              <motion.div
                key={category}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <Button
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <AnimatePresence>
          <GameGrid games={filteredGames} onGameClick={setSelectedGame} />
        </AnimatePresence>
      </motion.div>
      <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />
    </motion.div>
  );
}
