import { motion } from "framer-motion";

interface PlayerProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function Player({ x, y, width, height }: PlayerProps) {
  return (
    <motion.div
      className="absolute"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        x,
        y,
      }}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="w-full h-full bg-yellow-400 rounded-full shadow-lg relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-b from-yellow-300 to-transparent opacity-50"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
        />
      </div>
    </motion.div>
  );
}
