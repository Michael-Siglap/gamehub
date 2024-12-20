import { motion } from "framer-motion";

interface PortalProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function Portal({ x, y, width, height }: PortalProps) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <motion.div
        className="w-full h-full bg-purple-500 rounded-full relative overflow-hidden"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="absolute inset-0 bg-purple-300 opacity-50"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage:
              "radial-gradient(circle at center, transparent 30%, currentColor 70%)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
