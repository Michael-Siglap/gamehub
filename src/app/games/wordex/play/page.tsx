"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, HelpCircle, Delete } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const WORD_LENGTH = 6;
const MAX_GUESSES = 6;
const REVEAL_TIME_MS = 350;

type TileStatus = "correct" | "present" | "absent" | "empty" | "tbd";
type KeyStatus = "correct" | "present" | "absent" | "unused";

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DELETE"],
];

export default function WordexGame() {
  const [secretWord, setSecretWord] = useState("");
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [keyStatuses, setKeyStatuses] = useState<Record<string, KeyStatus>>({});
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    const words = ["PYTHON", "CODING", "GITHUB", "NODEJS", "VERCEL", "NEXTJS"];
    setSecretWord(words[Math.floor(Math.random() * words.length)]);
  }, []);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameOver || isRevealing) return;

      if (key === "DELETE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (key === "ENTER") {
        if (currentGuess.length === WORD_LENGTH) {
          submitGuess();
        }
      } else if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameOver, isRevealing, currentGuess]
  );

  const submitGuess = useCallback(() => {
    setIsRevealing(true);
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);

    setTimeout(() => {
      const newKeyStatuses = { ...keyStatuses };
      currentGuess.split("").forEach((letter, index) => {
        if (secretWord[index] === letter) {
          newKeyStatuses[letter] = "correct";
        } else if (
          secretWord.includes(letter) &&
          newKeyStatuses[letter] !== "correct"
        ) {
          newKeyStatuses[letter] = "present";
        } else if (!secretWord.includes(letter) && !newKeyStatuses[letter]) {
          newKeyStatuses[letter] = "absent";
        }
      });
      setKeyStatuses(newKeyStatuses);

      if (currentGuess === secretWord || newGuesses.length >= MAX_GUESSES) {
        setGameOver(true);
      }

      setCurrentGuess("");
      setIsRevealing(false);
    }, WORD_LENGTH * REVEAL_TIME_MS);
  }, [currentGuess, guesses, secretWord, keyStatuses]);

  const getTileStatus = useCallback(
    (letter: string, index: number, guessIndex: number): TileStatus => {
      if (guessIndex >= guesses.length) return "empty";
      if (guessIndex === guesses.length && letter) return "tbd";
      if (!letter) return "empty";
      if (secretWord[index] === letter) return "correct";
      if (secretWord.includes(letter)) return "present";
      return "absent";
    },
    [guesses.length, secretWord]
  );

  const getKeyClass = useCallback(
    (key: string) => {
      const status = keyStatuses[key];
      return cn(
        "h-14 min-w-[40px] flex-1 flex items-center justify-center rounded-md font-bold text-lg transition-colors",
        status === "correct" && "bg-emerald-500 dark:bg-emerald-600 text-white",
        status === "present" && "bg-amber-500 dark:bg-amber-600 text-white",
        status === "absent" && "bg-slate-500 dark:bg-slate-600 text-white",
        !status &&
          "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600"
      );
    },
    [keyStatuses]
  );

  const renderTile = useCallback(
    (
      letter: string,
      status: TileStatus,
      index: number,
      isCurrentGuess: boolean
    ) => {
      return (
        <div
          className={cn(
            "w-12 h-12 border-2 flex items-center justify-center text-2xl font-bold rounded-md",
            "transition-all duration-300",
            status === "correct" &&
              "bg-emerald-500 dark:bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500",
            status === "present" &&
              "bg-amber-500 dark:bg-amber-600 text-white border-amber-600 dark:border-amber-500",
            status === "absent" &&
              "bg-slate-500 dark:bg-slate-600 text-white border-slate-600 dark:border-slate-500",
            status === "tbd" &&
              "border-slate-300 dark:border-slate-500 text-slate-900 dark:text-slate-100",
            status === "empty" && "border-slate-200 dark:border-slate-700",
            isRevealing && isCurrentGuess && "animate-flip-reveal"
          )}
          style={{
            animationDelay: isRevealing ? `${index * REVEAL_TIME_MS}ms` : "0ms",
          }}
        >
          <span
            className={isRevealing && isCurrentGuess ? "animate-bounce-in" : ""}
          >
            {letter}
          </span>
        </div>
      );
    },
    [isRevealing]
  );

  const renderGrid = useMemo(() => {
    return Array(MAX_GUESSES)
      .fill(null)
      .map((_, rowIndex) => {
        const isCurrentRow = rowIndex === guesses.length;
        const word = isCurrentRow ? currentGuess : guesses[rowIndex] || "";
        return (
          <div key={`row-${rowIndex}`} className="flex gap-1">
            {Array(WORD_LENGTH)
              .fill(null)
              .map((_, colIndex) => {
                const letter = word[colIndex] || "";
                const status = getTileStatus(letter, colIndex, rowIndex);
                return (
                  <div key={`tile-${rowIndex}-${colIndex}`}>
                    {renderTile(
                      letter,
                      status,
                      colIndex,
                      isCurrentRow && rowIndex === guesses.length - 1
                    )}
                  </div>
                );
              })}
          </div>
        );
      });
  }, [guesses, currentGuess, getTileStatus, renderTile]);

  const renderKeyboard = useMemo(() => {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-2">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex justify-center gap-1">
            {row.map((key) => (
              <button
                key={`key-${key}`}
                onClick={() => handleKeyPress(key)}
                className={getKeyClass(key)}
                style={{
                  width:
                    key === "ENTER" || key === "DELETE" ? "65px" : undefined,
                }}
              >
                {key === "DELETE" ? <Delete className="w-6 h-6" /> : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  }, [getKeyClass, handleKeyPress]);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4">
      {showInstructions && (
        <div className="fixed inset-0 bg-slate-900/80 dark:bg-slate-100/80 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg w-full max-w-2xl p-8 relative my-8 shadow-lg">
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute right-4 top-4 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full z-10 text-slate-500 dark:text-slate-400"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-3xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">
              How To Play
            </h2>
            <p className="text-xl mb-6">Guess the Wordex in 6 tries.</p>

            <ul className="space-y-2 mb-6">
              <li className="text-base">
                • Each guess must be a valid 6-letter word.
              </li>
              <li className="text-base">
                • The color of the tiles will change to show how close your
                guess was to the word.
              </li>
            </ul>

            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                Examples
              </h3>

              <div className="space-y-2">
                <div className="flex space-x-1">
                  {["V", "E", "R", "C", "E", "L"].map((letter, index) => (
                    <div key={`example1-${index}`}>
                      {renderTile(
                        letter,
                        index === 0 ? "correct" : "empty",
                        index,
                        false
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-lg">
                  V is in the word and in the correct spot.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex space-x-1">
                  {["G", "I", "T", "H", "U", "B"].map((letter, index) => (
                    <div key={`example2-${index}`}>
                      {renderTile(
                        letter,
                        index === 1 ? "present" : "empty",
                        index,
                        false
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-lg">
                  I is in the word but in the wrong spot.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex space-x-1">
                  {["C", "O", "D", "I", "N", "G"].map((letter, index) => (
                    <div key={`example3-${index}`}>
                      {renderTile(
                        letter,
                        index === 3 ? "absent" : "empty",
                        index,
                        false
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-lg">I is not in the word in any spot.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between w-full max-w-2xl mb-8">
        <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
          Wordex
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowInstructions(true)}
          className="hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl">
        <div className="grid gap-2 mb-8">{renderGrid}</div>
        {renderKeyboard}
      </div>

      {gameOver && (
        <Card className="fixed inset-0 m-auto w-full max-w-md h-48 flex flex-col items-center justify-center space-y-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-40 text-slate-900 dark:text-slate-100 rounded-lg shadow-lg">
          <p className="text-xl font-bold">
            {guesses[guesses.length - 1] === secretWord
              ? "Congratulations!"
              : `The word was ${secretWord}`}
          </p>
          <div className="flex space-x-4">
            <Button
              onClick={() => window.location.reload()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Play Again
            </Button>
            <Link href="/games/wordex">
              <Button
                variant="outline"
                className="border-emerald-500 text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900"
              >
                Back to Intro
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
