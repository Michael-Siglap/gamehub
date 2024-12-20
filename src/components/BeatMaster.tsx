"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const NOTES = ["A", "S", "D", "F"];
const NOTE_DURATION = 1000; // 1 second
const GAME_DURATION = 60000; // 60 seconds

export default function BeatMaster() {
  const [currentNote, setCurrentNote] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameStarted, setGameStarted] = useState(false);

  const generateNote = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * NOTES.length);
    setCurrentNote(NOTES[randomIndex]);
  }, []);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (NOTES.includes(event.key.toUpperCase())) {
        if (event.key.toUpperCase() === currentNote) {
          setScore((prevScore) => prevScore + 1);
        }
        generateNote();
      }
    },
    [currentNote, generateNote]
  );

  useEffect(() => {
    if (gameStarted) {
      window.addEventListener("keydown", handleKeyPress);
      const noteInterval = setInterval(generateNote, NOTE_DURATION);
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1000);
      }, 1000);

      return () => {
        window.removeEventListener("keydown", handleKeyPress);
        clearInterval(noteInterval);
        clearInterval(timer);
      };
    }
  }, [gameStarted, generateNote, handleKeyPress]);

  useEffect(() => {
    if (timeLeft === 0) {
      setGameStarted(false);
    }
  }, [timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameStarted(true);
    generateNote();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 to-pink-500 p-4">
      <h1 className="text-4xl font-bold mb-8 text-white">Beat Master</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="mb-4">
            How to Play
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How to Play Beat Master</DialogTitle>
            <DialogDescription>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  When the game starts, you&apos;ll see letters (A, S, D, F)
                  appear on the screen.
                </li>
                <li>
                  Your goal is to press the corresponding key on your keyboard
                  as quickly as possible.
                </li>
                <li>You earn a point for each correct key press.</li>
                <li>The game lasts for 60 seconds.</li>
                <li>
                  Try to get the highest score possible before time runs out!
                </li>
              </ul>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {!gameStarted ? (
        <Button onClick={startGame} className="text-2xl px-6 py-3">
          Start Game
        </Button>
      ) : (
        <>
          <div className="text-2xl mb-4 text-white">
            Time Left: {timeLeft / 1000}s
          </div>
          <div className="text-2xl mb-4 text-white">Score: {score}</div>
          <motion.div
            key={currentNote}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-8xl font-bold mb-8 text-white"
          >
            {currentNote}
          </motion.div>
          <div className="text-xl text-white text-center">
            Press the corresponding key (A, S, D, F) when it appears!
          </div>
        </>
      )}
    </div>
  );
}
