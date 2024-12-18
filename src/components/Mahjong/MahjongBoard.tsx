import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MahjongTile, getTilePath, TileColor } from "@/utils/mahjongLogic";
import Image from "next/image";

interface MahjongBoardProps {
  discardPile: MahjongTile[];
  tileColor: TileColor;
}

const MahjongBoard: React.FC<MahjongBoardProps> = ({
  discardPile,
  tileColor,
}) => {
  return (
    <div className="relative bg-green-800 p-8 rounded-lg shadow-lg min-h-[300px]">
      <div className="absolute inset-0 bg-[url('/mahjong-tiles/table-texture.png')] opacity-30 mix-blend-overlay" />
      <h3 className="text-white text-lg mb-4">Discard Pile</h3>
      <div className="grid grid-cols-6 gap-2">
        <AnimatePresence>
          {discardPile.map((tile) => (
            <motion.div
              key={tile.id}
              initial={{ opacity: 0, scale: 0.5, rotate: 180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                duration: 0.3,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className="w-12 h-16 bg-white rounded-sm shadow-md flex items-center justify-center transform hover:scale-110 transition-transform"
            >
              <Image
                src={getTilePath(tile, tileColor)}
                alt={`${tile.suit} ${tile.value}`}
                width={48}
                height={64}
                className="object-contain"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MahjongBoard;
