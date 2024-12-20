"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

const WORDS = [
  "CASA",
  "PERRO",
  "GATO",
  "LIBRO",
  "MESA",
  "SILLA",
  "COCHE",
  "ÁRBOL",
  "FLOR",
  "AGUA",
  "FUEGO",
  "TIERRA",
  "AIRE",
  "SOL",
  "LUNA",
  "ESTRELLA",
  "NUBE",
  "LLUVIA",
  "NIEVE",
  "VIENTO",
  "PLAYA",
  "MONTAÑA",
  "RÍO",
  "MAR",
  "OCÉANO",
  "BOSQUE",
  "SELVA",
  "DESIERTO",
  "CIUDAD",
  "PUEBLO",
];

export default function PalabraDelDia() {
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * WORDS.length);
    setTargetWord(WORDS[randomIndex]);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= WORD_LENGTH) {
      setCurrentGuess(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentGuess.length !== WORD_LENGTH) {
      toast({
        title: "Error",
        description: "La palabra debe tener 5 letras",
        variant: "destructive",
      });
      return;
    }
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess("");

    if (currentGuess === targetWord) {
      setGameOver(true);
      toast({
        title: "¡Felicidades!",
        description: "Has adivinado la palabra correctamente.",
      });
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setGameOver(true);
      toast({
        title: "Juego terminado",
        description: `La palabra correcta era: ${targetWord}`,
        variant: "destructive",
      });
    }
  };

  const getLetterStyle = (letter: string, index: number) => {
    if (letter === targetWord[index]) {
      return "bg-green-500 text-white";
    } else if (targetWord.includes(letter)) {
      return "bg-yellow-500 text-white";
    } else {
      return "bg-gray-300 text-black";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-bold text-center mb-8">Palabra del Día</h1>
      <div className="max-w-md mx-auto">
        {guesses.map((guess, guessIndex) => (
          <div key={guessIndex} className="flex justify-center mb-2">
            {guess.split("").map((letter, letterIndex) => (
              <motion.div
                key={letterIndex}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: letterIndex * 0.1 }}
                className={`w-12 h-12 flex items-center justify-center text-2xl font-bold rounded-md mr-1 ${getLetterStyle(
                  letter,
                  letterIndex
                )}`}
              >
                {letter}
              </motion.div>
            ))}
          </div>
        ))}
        {!gameOver && (
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex">
              <Input
                type="text"
                value={currentGuess}
                onChange={handleInputChange}
                maxLength={WORD_LENGTH}
                className="mr-2"
                placeholder="Escribe tu palabra"
              />
              <Button type="submit">Adivinar</Button>
            </div>
          </form>
        )}
        {gameOver && (
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 w-full"
          >
            Jugar de nuevo
          </Button>
        )}
      </div>
    </motion.div>
  );
}
