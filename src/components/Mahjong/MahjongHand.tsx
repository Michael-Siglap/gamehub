import React from "react";
import { motion } from "framer-motion";
import { MahjongTile, getTilePath, TileColor } from "@/utils/mahjongLogic";
import Image from "next/image";

interface MahjongHandProps {
  hand: MahjongTile[];
  onTileDiscard: (tile: MahjongTile) => void;
  tileColor: TileColor;
}

const MahjongHand: React.FC<MahjongHandProps> = ({
  hand,
  onTileDiscard,
  tileColor,
}) => {
  // Sort tiles by suit and value for better visualization
  const sortedHand = [...hand].sort((a, b) => {
    if (a.suit === b.suit) {
      return a.value.localeCompare(b.value);
    }
    return a.suit.localeCompare(b.suit);
  });

  return (
    <div className="flex justify-center mt-4 perspective-1000">
      {sortedHand.map((tile, index) => (
        <motion.div
          key={tile.id}
          initial={{ opacity: 0, y: 50, rotateX: 180 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{
            y: -20,
            scale: 1.1,
            transition: { duration: 0.2 },
          }}
          onClick={() => onTileDiscard(tile)}
          className="relative w-12 h-16 -ml-4 first:ml-0 cursor-pointer"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute w-full h-full bg-white rounded-sm shadow-lg">
            <Image
              src={getTilePath(tile, tileColor)}
              alt={`${tile.suit} ${tile.value}`}
              width={48}
              height={64}
              className="object-contain"
              priority={index < 5} // Prioritize loading first few tiles
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MahjongHand;
