"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useGameLoop } from "./useGameLoop";
import { Player } from "./Player";
import { Platform } from "./Platform";
import { Portal } from "./Portal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { HowToPlayModal } from "./HowToPlayModal";

const MOVE_SPEED = 0.5; // units per millisecond
const JUMP_SPEED = 1.0; // units per millisecond
const GRAVITY = 0.003; // units per millisecond squared
const MAX_FALL_SPEED = 0.8; // units per millisecond

const PLATFORMS = [
  { xRatio: 0, yRatio: 0.95, widthRatio: 1, heightRatio: 0.05 }, // Ground
  { xRatio: 0.25, yRatio: 0.75, widthRatio: 0.25, heightRatio: 0.03 }, // Middle platform
  { xRatio: 0.625, yRatio: 0.5, widthRatio: 0.25, heightRatio: 0.03 }, // Top platform
];

export default function QuantumShiftGame() {
  const [gameSize, setGameSize] = useState({ width: 800, height: 600 });
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 550 });
  const [playerVelocity, setPlayerVelocity] = useState({ x: 0, y: 0 });
  const [isJumping, setIsJumping] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);
  const keysPressed = useRef<Set<string>>(new Set());

  const platforms = useMemo(
    () =>
      PLATFORMS.map((p) => ({
        x: p.xRatio * gameSize.width,
        y: p.yRatio * gameSize.height,
        width: p.widthRatio * gameSize.width,
        height: p.heightRatio * gameSize.height,
      })),
    [gameSize.width, gameSize.height]
  );

  const portalPosition = useMemo(
    () => ({
      x: gameSize.width - 60,
      y: gameSize.height - 120,
      destination: { x: 50, y: gameSize.height * 0.4 },
    }),
    [gameSize.width, gameSize.height]
  );

  const handleResize = useCallback(() => {
    if (gameRef.current) {
      const { width, height } = gameRef.current.getBoundingClientRect();
      setGameSize({ width, height });
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const handleKeyDown = useCallback((e: KeyboardEvent | { key: string }) => {
    keysPressed.current.add(e.key);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent | { key: string }) => {
    keysPressed.current.delete(e.key);
  }, []);

  const handleButtonPress = useCallback(
    (key: string) => {
      handleKeyDown({ key });
    },
    [handleKeyDown]
  );

  const handleButtonRelease = useCallback(
    (key: string) => {
      handleKeyUp({ key });
    },
    [handleKeyUp]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const updateGameState = useCallback(
    (deltaTime: number) => {
      const scaleFactor = {
        x: gameSize.width / 800,
        y: gameSize.height / 600,
      };

      // Update velocity based on keys pressed
      let newVelocityX = 0;
      if (
        keysPressed.current.has("ArrowLeft") ||
        keysPressed.current.has("a") ||
        keysPressed.current.has("A")
      ) {
        newVelocityX = -MOVE_SPEED * scaleFactor.x * deltaTime;
      }
      if (
        keysPressed.current.has("ArrowRight") ||
        keysPressed.current.has("d") ||
        keysPressed.current.has("D")
      ) {
        newVelocityX = MOVE_SPEED * scaleFactor.x * deltaTime;
      }
      if (
        (keysPressed.current.has("ArrowUp") ||
          keysPressed.current.has("w") ||
          keysPressed.current.has("W")) &&
        !isJumping
      ) {
        setPlayerVelocity((v) => ({
          ...v,
          y: -JUMP_SPEED * scaleFactor.y * deltaTime,
        }));
        setIsJumping(true);
      }

      setPlayerVelocity((v) => ({
        x: newVelocityX,
        y: Math.min(v.y + GRAVITY * deltaTime, MAX_FALL_SPEED),
      }));

      setPlayerPosition((pos) => {
        let newX = pos.x + playerVelocity.x;
        let newY = pos.y + playerVelocity.y;

        // Check platform collisions
        let onPlatform = false;
        for (const platform of platforms) {
          if (
            newX < platform.x + platform.width &&
            newX + 40 * scaleFactor.x > platform.x &&
            newY + 60 * scaleFactor.y >= platform.y &&
            newY + 60 * scaleFactor.y <= platform.y + platform.height + 5
          ) {
            newY = platform.y - 60 * scaleFactor.y;
            setPlayerVelocity((v) => ({ ...v, y: 0 }));
            setIsJumping(false);
            onPlatform = true;
            break;
          }
        }

        if (!onPlatform) {
          setIsJumping(true);
        }

        // Check portal collision
        if (
          newX < portalPosition.x + 40 * scaleFactor.x &&
          newX + 40 * scaleFactor.x > portalPosition.x &&
          newY < portalPosition.y + 60 * scaleFactor.y &&
          newY + 60 * scaleFactor.y > portalPosition.y
        ) {
          newX = portalPosition.destination.x;
          newY = portalPosition.destination.y;
        }

        // Boundary checks
        newX = Math.max(0, Math.min(newX, gameSize.width - 40 * scaleFactor.x));
        newY = Math.max(
          0,
          Math.min(newY, gameSize.height - 60 * scaleFactor.y)
        );

        return { x: newX, y: newY };
      });
    },
    [gameSize, isJumping, playerVelocity, platforms, portalPosition]
  );

  useGameLoop(updateGameState);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4">
      <div className="mb-4 w-full flex justify-between items-center">
        <HowToPlayModal />
        <h2 className="text-2xl font-bold">Quantum Shift</h2>
      </div>
      <div
        ref={gameRef}
        className="relative w-full aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden shadow-2xl"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 opacity-50"
          animate={{
            background: [
              "linear-gradient(to bottom right, #312e81, #1e3a8a, #312e81)",
              "linear-gradient(to bottom right, #1e3a8a, #312e81, #1e3a8a)",
            ],
          }}
          transition={{ repeat: Infinity, duration: 10 }}
        />
        <Player
          x={playerPosition.x}
          y={playerPosition.y}
          width={40}
          height={60}
        />
        {platforms.map((platform, index) => (
          <Platform key={index} {...platform} />
        ))}
        <Portal
          x={portalPosition.x}
          y={portalPosition.y}
          width={40}
          height={60}
        />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onMouseDown={() => handleButtonPress("ArrowLeft")}
            onMouseUp={() => handleButtonRelease("ArrowLeft")}
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonPress("ArrowLeft");
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonRelease("ArrowLeft");
            }}
            className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onMouseDown={() => handleButtonPress("ArrowRight")}
            onMouseUp={() => handleButtonRelease("ArrowRight")}
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonPress("ArrowRight");
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonRelease("ArrowRight");
            }}
            className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onMouseDown={() => handleButtonPress("ArrowUp")}
            onMouseUp={() => handleButtonRelease("ArrowUp")}
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonPress("ArrowUp");
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonRelease("ArrowUp");
            }}
            className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
