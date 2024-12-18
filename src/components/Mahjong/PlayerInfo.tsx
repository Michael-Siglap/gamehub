import React from "react";
import { motion } from "framer-motion";
import { Player } from "@/utils/mahjongLogic";

interface PlayerInfoProps {
  player: Player;
  isCurrentPlayer: boolean;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ player, isCurrentPlayer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-lg shadow-md ${
        isCurrentPlayer ? "bg-blue-100" : "bg-gray-100"
      }`}
    >
      <h3 className="text-lg font-semibold mb-2">{player.name}</h3>
      <p>Tiles in hand: {player.hand.length}</p>
      {/* Add more player info here as needed */}
    </motion.div>
  );
};

export default PlayerInfo;
