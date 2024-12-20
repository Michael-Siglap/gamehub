"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const words = [
  // Existing Words
  "bonjour",
  "merci",
  "paris",
  "croissant",
  "baguette",
  "fromage",
  "vin",
  "amour",
  "chat",
  "chien",
  "maison",
  "école",
  "livre",
  "musique",
  "cinéma",
  "café",
  "restaurant",
  "jardin",
  "voiture",
  "vélo",

  // Expanded Categories
  // Food and Drink
  "chocolat",
  "pomme",
  "fraise",
  "banane",
  "bière",
  "thé",
  "eau",
  "poisson",
  "pain",
  "fromage",
  "crêpe",
  "poulet",
  "steak",
  "glace",
  "jus",
  "pizza",
  "soupe",
  "sucre",

  // Animals
  "cheval",
  "oiseau",
  "vache",
  "cochon",
  "lapin",
  "renard",
  "souris",
  "serpent",
  "papillon",
  "canard",
  "dauphin",
  "éléphant",
  "hibou",
  "loup",
  "ours",
  "tigre",

  // Objects
  "ordinateur",
  "lampe",
  "chaise",
  "table",
  "fenêtre",
  "porte",
  "télévision",
  "clavier",
  "voiture",
  "lit",
  "valise",
  "bouteille",
  "parapluie",
  "montre",
  "lunettes",
  "sac",

  // Places
  "plage",
  "montagne",
  "rivière",
  "village",
  "château",
  "forêt",
  "musée",
  "gare",
  "aéroport",
  "hôpital",
  "bibliothèque",
  "zoo",
  "parc",
  "marché",
  "île",
  "port",

  // Professions
  "médecin",
  "enseignant",
  "pompier",
  "policier",
  "avocat",
  "écrivain",
  "architecte",
  "boulanger",
  "menuisier",
  "scientifique",
  "musicien",
  "acteur",
  "peintre",
  "dentiste",

  // Abstract Concepts
  "liberté",
  "justice",
  "éducation",
  "art",
  "amitié",
  "honneur",
  "respect",
  "bonheur",
  "espoir",
  "paix",
  "amour",
  "courage",
  "créativité",
  "sagesse",

  // Sports and Hobbies
  "football",
  "tennis",
  "natation",
  "lecture",
  "peinture",
  "danse",
  "chant",
  "cuisine",
  "rugby",
  "basketball",
  "volleyball",
  "cyclisme",
  "randonnée",
  "pêche",
  "yoga",

  // French Landmarks
  "eiffel",
  "louvre",
  "versailles",
  "bordeaux",
  "lyon",
  "nice",
  "provence",
  "normandie",
  "marseille",
  "strasbourg",
  "grenoble",
  "dijon",
  "nancy",
  "lille",
  "toulouse",

  // Seasons and Weather
  "été",
  "hiver",
  "printemps",
  "automne",
  "soleil",
  "pluie",
  "neige",
  "vent",
  "orage",
  "nuage",
  "froid",
  "chaleur",
  "brume",
  "arc",
  "tempête",

  // Other Common Words
  "famille",
  "amis",
  "travail",
  "santé",
  "loisir",
  "voyage",
  "langue",
  "culture",
  "histoire",
  "science",
  "rêve",
  "temps",
  "musique",
  "cinéma",
  "mode",
  "journal",

  // Famous French Figures
  "napoléon",
  "voltaire",
  "rousseau",
  "molière",
  "hugo",
  "descartes",
  "zola",
  "curie",
  "camus",
  "sartre",
  "baudelaire",
  "verne",
  "renoir",
  "chopin",

  // Nature
  "fleur",
  "arbre",
  "forêt",
  "rivière",
  "montagne",
  "lac",
  "océan",
  "rocher",
  "prairie",
  "jungle",
  "désert",
  "plante",
  "soleil",
  "lune",
  "étoile",

  // Colours
  "rouge",
  "bleu",
  "vert",
  "jaune",
  "noir",
  "blanc",
  "orange",
  "rose",
  "violet",
  "gris",
  "marron",
  "turquoise",
  "indigo",
  "doré",
  "argenté",
];

const hangmanDesigns = [
  // Design 1: Abstract figure
  (incorrectGuesses: number) => (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      className="stroke-current text-white"
    >
      <motion.circle
        cx="100"
        cy="40"
        r="30"
        fill="none"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 0 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
      <motion.line
        x1="100"
        y1="70"
        x2="100"
        y2="150"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 1 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      />
      <motion.line
        x1="100"
        y1="100"
        x2="60"
        y2="80"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 2 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <motion.line
        x1="100"
        y1="100"
        x2="140"
        y2="80"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 3 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
      <motion.line
        x1="100"
        y1="150"
        x2="60"
        y2="180"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 4 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      />
      <motion.line
        x1="100"
        y1="150"
        x2="140"
        y2="180"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 5 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
    </svg>
  ),
  // Design 2: Geometric shapes
  (incorrectGuesses: number) => (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      className="stroke-current text-white"
    >
      <motion.rect
        x="70"
        y="20"
        width="60"
        height="60"
        fill="none"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 0 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
      <motion.line
        x1="100"
        y1="80"
        x2="100"
        y2="160"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 1 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      />
      <motion.line
        x1="100"
        y1="120"
        x2="60"
        y2="100"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 2 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <motion.line
        x1="100"
        y1="120"
        x2="140"
        y2="100"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 3 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
      <motion.line
        x1="100"
        y1="160"
        x2="70"
        y2="190"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 4 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      />
      <motion.line
        x1="100"
        y1="160"
        x2="130"
        y2="190"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 5 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
    </svg>
  ),
  // Design 3: Minimalist lines
  (incorrectGuesses: number) => (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      className="stroke-current text-white"
    >
      <motion.line
        x1="20"
        y1="180"
        x2="180"
        y2="180"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 0 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
      <motion.line
        x1="60"
        y1="180"
        x2="60"
        y2="20"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 1 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      />
      <motion.line
        x1="60"
        y1="20"
        x2="140"
        y2="20"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 2 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <motion.line
        x1="140"
        y1="20"
        x2="140"
        y2="60"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 3 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
      <motion.circle
        cx="140"
        cy="80"
        r="20"
        fill="none"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 4 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      />
      <motion.line
        x1="140"
        y1="100"
        x2="140"
        y2="160"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 5 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
    </svg>
  ),
  // Design 4: Curved lines
  (incorrectGuesses: number) => (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      className="stroke-current text-white"
    >
      <motion.path
        d="M40,180 Q100,120 160,180"
        fill="none"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 0 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d="M100,120 Q100,60 140,40"
        fill="none"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 1 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      />
      <motion.circle
        cx="140"
        cy="40"
        r="20"
        fill="none"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 2 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <motion.path
        d="M140,60 Q140,100 120,120"
        fill="none"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 3 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
      <motion.path
        d="M140,60 Q140,100 160,120"
        fill="none"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 4 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      />
      <motion.path
        d="M140,100 Q140,140 120,160"
        fill="none"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 5 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
    </svg>
  ),
  // Design 5: Dots and lines
  (incorrectGuesses: number) => (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      className="stroke-current text-white"
    >
      <motion.circle
        cx="100"
        cy="40"
        r="8"
        initial={{ scale: 0 }}
        animate={{ scale: incorrectGuesses > 0 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
      <motion.line
        x1="100"
        y1="48"
        x2="100"
        y2="120"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: incorrectGuesses > 1 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      />
      <motion.circle
        cx="70"
        cy="90"
        r="8"
        initial={{ scale: 0 }}
        animate={{ scale: incorrectGuesses > 2 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <motion.circle
        cx="130"
        cy="90"
        r="8"
        initial={{ scale: 0 }}
        animate={{ scale: incorrectGuesses > 3 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
      <motion.circle
        cx="80"
        cy="150"
        r="8"
        initial={{ scale: 0 }}
        animate={{ scale: incorrectGuesses > 4 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      />
      <motion.circle
        cx="120"
        cy="150"
        r="8"
        initial={{ scale: 0 }}
        animate={{ scale: incorrectGuesses > 5 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
    </svg>
  ),
];

export default function LePendu() {
  const [word, setWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [remainingGuesses, setRemainingGuesses] = useState(10);
  const [input, setInput] = useState("");
  const [hangmanDesignIndex, setHangmanDesignIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [overallPoints, setOverallPoints] = useState(0);
  const [gameOver, setGameOver] = useState(false); // Added game over state
  const { toast } = useToast();

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setWord(words[Math.floor(Math.random() * words.length)]);
    setGuessedLetters([]);
    setRemainingGuesses(10);
    setPoints(0);
    setHangmanDesignIndex(Math.floor(Math.random() * hangmanDesigns.length));
    setGameOver(false);
  };

  const guessLetter = (letter: string) => {
    if (guessedLetters.includes(letter)) {
      toast({
        title: "Lettre déjà devinée",
        description: "Vous avez déjà essayé cette lettre.",
      });
      return;
    }

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (word.includes(letter)) {
      // Correct guess: add points based on letter frequency
      const letterFrequency = word.split(letter).length - 1;
      const pointsEarned = letterFrequency * 10;
      setPoints((prevPoints) => prevPoints + pointsEarned);
      setOverallPoints((prevOverallPoints) => prevOverallPoints + pointsEarned);
    } else {
      // Incorrect guess: subtract points
      const pointsLost = 5;
      setPoints((prevPoints) => Math.max(0, prevPoints - pointsLost));
      setOverallPoints((prevOverallPoints) =>
        Math.max(0, prevOverallPoints - pointsLost)
      );
      setRemainingGuesses(remainingGuesses - 1);
    }

    if (word.split("").every((char) => newGuessedLetters.includes(char))) {
      const bonusPoints = 50;
      setPoints((prevPoints) => prevPoints + bonusPoints);
      setOverallPoints((prevOverallPoints) => prevOverallPoints + bonusPoints);
      toast({
        title: "Félicitations!",
        description: `Vous avez deviné le mot! Points gagnés: ${
          points + bonusPoints
        }`,
      });
      setGameOver(true);
    }

    if (remainingGuesses === 1 && !word.includes(letter)) {
      toast({
        title: "Jeu terminé",
        description: `Le mot était: ${word}. Points finaux: ${points}`,
      });
      setGameOver(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.length === 1) {
      guessLetter(input.toLowerCase());
      setInput("");
    }
  };

  const incorrectGuesses = 10 - remainingGuesses;

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Le Pendu Moderne
      </motion.h1>
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl">
        <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
          <motion.div
            className="bg-white bg-opacity-10 p-8 rounded-2xl shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {hangmanDesigns[hangmanDesignIndex](incorrectGuesses)}
          </motion.div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <motion.div
            className="text-4xl mb-8 font-mono tracking-wider"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {word.split("").map((letter, index) => (
              <motion.span
                key={index}
                className="mx-1 inline-block"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {guessedLetters.includes(letter) ? letter : "_"}
              </motion.span>
            ))}
          </motion.div>
          <motion.p
            className="mb-6 text-xl font-semibold"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Essais restants: {remainingGuesses}
          </motion.p>
          <motion.div className="mb-6 text-xl font-semibold flex justify-between w-full">
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              Points (mot actuel): {points}
            </motion.p>
            <motion.p
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Points totaux: {overallPoints}
            </motion.p>
          </motion.div>
          <motion.form
            onSubmit={handleSubmit}
            className="flex gap-2 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1}
              className="w-16 text-center text-black text-xl bg-white bg-opacity-80 border-2 border-pink-400 focus:border-cyan-300 transition-colors duration-300"
              aria-label="Entrez une lettre"
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-pink-500 to-cyan-500 text-white hover:from-pink-600 hover:to-cyan-600 transition-all duration-300"
            >
              Deviner
            </Button>
          </motion.form>
          <motion.div
            className="grid grid-cols-7 gap-2"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            {"abcdefghijklmnopqrstuvwxyz".split("").map((letter) => (
              <motion.div
                key={letter}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  onClick={() => guessLetter(letter)}
                  disabled={
                    guessedLetters.includes(letter) || remainingGuesses === 0
                  }
                  variant={
                    guessedLetters.includes(letter) ? "secondary" : "default"
                  }
                  className={`w-10 h-10 rounded-full ${
                    guessedLetters.includes(letter)
                      ? "bg-gray-500 text-white"
                      : "bg-white bg-opacity-80 text-black hover:bg-yellow-300 hover:text-gray-800 transition-colors duration-300"
                  }`}
                  aria-label={`Deviner la lettre ${letter}`}
                >
                  {letter}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
        {gameOver && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-lg text-center text-black"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
                {remainingGuesses === 0 ? "Jeu terminé" : "Félicitations!"}
              </h2>
              <p className="text-xl mb-6">
                {remainingGuesses === 0
                  ? `Le mot était: ${word}`
                  : "Vous avez deviné le mot!"}
                <br />
                Points pour ce mot: {points}
                <br />
                Points totaux: {overallPoints}
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => {
                    startNewGame();
                    setGameOver(false);
                  }}
                  className="bg-gradient-to-r from-pink-500 to-cyan-500 text-white hover:from-pink-600 hover:to-cyan-600 transition-all duration-300"
                >
                  Nouveau mot
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
                >
                  Recommencer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
