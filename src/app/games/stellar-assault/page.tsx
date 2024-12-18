"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { GameEngine } from "./GameEngine";

export default function StellarAssault() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState(0.5);

  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current && containerRef.current && gameEngine) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        gameEngine.resizeCanvas(width, height);
      }
    };

    if (gameEngine) {
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }
  }, [gameEngine]);

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      const engine = new GameEngine(canvasRef.current, difficulty);
      setGameEngine(engine);

      engine.onScoreUpdate = (newScore: number) => setScore(newScore);
      engine.onGameOver = () => setIsGameOver(true);

      // Resize canvas after a short delay to ensure assets are loaded
      setTimeout(() => {
        engine.resizeCanvas(width, height);
      }, 100);

      return () => {
        engine.stop();
      };
    }
  }, [difficulty]);

  const handleRestart = () => {
    if (gameEngine) {
      gameEngine.restart();
      setScore(0);
      setIsGameOver(false);
    }
  };

  const handleDifficultyChange = (newDifficulty: number[]) => {
    setDifficulty(newDifficulty[0]);
    if (gameEngine) {
      gameEngine.setDifficulty(newDifficulty[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 text-white p-4">
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-80 p-2 rounded-lg shadow-lg z-10">
        <span className="text-2xl font-bold px-4">Score: {score}</span>
      </div>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      />
      <Card className="w-full max-w-4xl bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-purple-400">
            Stellar Assault
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* <div className="text-xl mb-2 md:mb-0">Score: {score}</div> */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="flex items-center space-x-2 w-full justify-end">
              <span className="text-sm">Difficulty:</span>
              <Slider
                min={0.5}
                max={5}
                step={0.5}
                value={[difficulty]}
                onValueChange={handleDifficultyChange}
                className="w-32"
              />
            </div>
          </div>
          <div
            ref={containerRef}
            className="relative w-full h-[calc(100vh-200px)] min-h-[400px]"
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full border border-gray-600 rounded-lg"
              tabIndex={0}
              aria-label="Stellar Assault game canvas"
            />
            {isGameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
                <h2 className="text-4xl font-bold mb-4">Game Over</h2>
                <p className="text-2xl mb-6">Final Score: {score}</p>
                <Button onClick={handleRestart} className="text-lg px-6 py-3">
                  Restart Game
                </Button>
              </div>
            )}
          </div>
          <div className="mt-4 text-sm text-gray-400">
            <p>Desktop Controls: Arrow keys to move, Spacebar to shoot</p>
            <p>Mobile Controls: Touch and drag to move, tap to shoot</p>
            <p>
              Objective: Destroy enemy ships and meteors, collect power-ups, and
              survive as long as possible
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
