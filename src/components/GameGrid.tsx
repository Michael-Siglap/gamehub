import { motion } from "framer-motion";
import { Game } from "@/data/games";
import Image from "next/image";

interface GameGridProps {
  games: Game[];
  onGameClick: (game: Game) => void;
}

export default function GameGrid({ games, onGameClick }: GameGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {games.map((game, index) => (
        <motion.div
          key={game.name}
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer group"
          onClick={() => onGameClick(game)}
        >
          <div className="relative overflow-hidden rounded-lg shadow-lg">
            <Image
              src={game.image}
              alt={game.name}
              width={400}
              height={225}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-white text-lg font-semibold"
              >
                {game.name}
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
