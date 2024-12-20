import {
  Grid3X3,
  Puzzle,
  Square,
  CrosshairIcon,
  Anchor,
  CastleIcon,
  ItalicIcon,
  LayoutGrid,
  Music,
  Zap,
} from "lucide-react";

export interface Game {
  name: string;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  sizes?: number[];
  description: string;
  content: string;
  image: string;
  category: string;
}

export const games: Game[] = [
  {
    name: "Tic Tac Toe",
    path: "/games/tictactoe",
    icon: Grid3X3,
    sizes: [3, 6, 12],
    description: "Classic game of X's and O's",
    content: "Strategize your moves in this timeless battle of wits.",
    image: "/tictactoe.webp",
    category: "Strategy",
  },
  {
    name: "Sudoku",
    path: "/games/sudoku",
    icon: Puzzle,
    description: "Fill the grid with numbers",
    content: "Challenge your logical thinking with number placement puzzles.",
    image: "/sudoku.webp",
    category: "Puzzle",
  },
  {
    name: "Memory Game",
    path: "/games/memory",
    icon: Puzzle,
    description: "Test your memory skills",
    content: "Sharpen your recall abilities by matching pairs of hidden cards.",
    image: "/memory.webp",
    category: "Memory",
  },
  {
    name: "Tetris",
    path: "/games/tetris",
    icon: Square,
    description: "Stack and clear the blocks",
    content:
      "Experience the thrill of rapid block-stacking in this classic arcade game.",
    image: "/tetris.webp",
    category: "Arcade",
  },
  {
    name: "Crossword",
    path: "/games/crossword",
    icon: CrosshairIcon,
    description: "Daily puzzles and custom difficulties",
    content:
      "Expand your vocabulary and test your knowledge with word puzzles.",
    image: "/crossword.webp",
    category: "Word",
  },
  {
    name: "Boat Sinking",
    path: "/games/boat-sinking",
    icon: Anchor,
    description: "Sink enemy ships in this naval battle game",
    content:
      "Engage in tactical warfare on the high seas as you hunt down enemy vessels.",
    image: "/boatsinking.webp",
    category: "Strategy",
  },
  {
    name: "Stellar Assault",
    path: "/games/stellar-assault",
    icon: CrosshairIcon,
    description: "2D space shooter game",
    content:
      "Engage in an intense space battle with smooth graphics and particle effects.",
    image: "/stellar-assault.webp",
    category: "Action",
  },
  {
    name: "Mahjong",
    path: "/games/mahjong",
    icon: LayoutGrid,
    description: "Classic Chinese tile-based game",
    content:
      "Test your strategy and pattern recognition skills in this ancient game of skill, strategy, and calculation.",
    image: "/mahjong.webp",
    category: "Strategy",
  },
  {
    name: "Shogi",
    path: "/games/shogi",
    icon: CastleIcon,
    description: "Japanese chess",
    content:
      "Challenge your strategic thinking with this complex board game, also known as Japanese chess.",
    image: "/shogi.webp",
    category: "Strategy",
  },
  {
    name: "Wordex",
    path: "/games/wordex",
    icon: ItalicIcon,
    description: "Guess the hidden 6-letter word",
    content:
      "Test your vocabulary and deduction skills in this popular word-guessing game. Can you solve the puzzle in 6 tries?",
    image: "/wordex.webp",
    category: "Word",
  },
  {
    name: "Beat Master",
    path: "/games/beat-master",
    icon: Music,
    description: "Test your rhythm and timing",
    content:
      "Tap to the beat and match the on-screen patterns in this addictive rhythm game.",
    image: "/beat-master.webp",
    category: "Music",
  },
  {
    name: "Quantum Shift",
    path: "/games/quantum-shift",
    icon: Zap,
    description: "Navigate through space-time anomalies",
    content:
      "Solve mind-bending puzzles while platforming through shifting realities in this innovative puzzle-platformer.",
    image: "/quantum-shift.webp",
    category: "Puzzle Platformer",
  },
];
