// src/utils/generateCrossword.ts

interface Word {
  word: string;
  clue: string;
}

interface Cell {
  letter: string;
  number: number | null;
  isStart: { across: boolean; down: boolean };
}

interface Clue {
  number: number;
  clue: string;
  direction: "across" | "down";
  answer: string;
  startX: number;
  startY: number;
}

const difficulties = {
  easy: { size: 10, wordCount: 8 },
  medium: { size: 13, wordCount: 12 },
  hard: { size: 15, wordCount: 15 },
};

// Helper to initialize the grid
const initializeGrid = (size: number): Cell[][] => {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      letter: "",
      number: null,
      isStart: { across: false, down: false },
    }))
  );
};

// Helper to check if a word can be placed at a specific position and direction
const canPlaceWord = (
  grid: Cell[][],
  word: string,
  startX: number,
  startY: number,
  direction: "across" | "down",
  size: number
): boolean => {
  let x = startX;
  let y = startY;

  for (let i = 0; i < word.length; i++) {
    // Check boundaries
    if (x < 0 || y < 0 || x >= size || y >= size) return false;

    const cell = grid[y][x];

    // Check if cell is empty or has the same letter
    if (cell.letter && cell.letter !== word[i]) return false;

    // Check adjacent cells for proper crossword structure
    if (direction === "across") {
      // Ensure no horizontal neighbors before the start
      if (i === 0 && x > 0 && grid[y][x - 1].letter) return false;
      // Ensure no horizontal neighbors after the end
      if (i === word.length - 1 && x < size - 1 && grid[y][x + 1].letter)
        return false;
      // Ensure no vertical neighbors
      if (
        (y > 0 && grid[y - 1][x].letter) ||
        (y < size - 1 && grid[y + 1][x].letter)
      )
        return false;
    } else {
      // direction === "down"
      if (i === 0 && y > 0 && grid[y - 1][x].letter) return false;
      if (i === word.length - 1 && y < size - 1 && grid[y + 1][x].letter)
        return false;
      if (
        (x > 0 && grid[y][x - 1].letter) ||
        (x < size - 1 && grid[y][x + 1].letter)
      )
        return false;
    }

    // Move to next cell based on direction
    if (direction === "across") x++;
    else y++;
  }

  return true;
};

// Helper to place a word on the grid
const placeWordOnGrid = (
  grid: Cell[][],
  word: string,
  startX: number,
  startY: number,
  direction: "across" | "down",
  wordNumber: number,
  clues: Clue[]
) => {
  let x = startX;
  let y = startY;

  const newClue: Clue = {
    number: wordNumber,
    clue: "",
    direction,
    answer: word,
    startX,
    startY,
  };

  clues.push(newClue);

  for (let i = 0; i < word.length; i++) {
    grid[y][x].letter = word[i];
    if (i === 0) {
      grid[y][x].number = wordNumber;
      grid[y][x].isStart[direction] = true;
    }
    if (direction === "across") x++;
    else y++;
  }
};

// Main function to generate crossword
export const generateCrossword = async (
  difficulty: "easy" | "medium" | "hard",
  fetchWords: (wordCount: number) => Promise<Word[]>
): Promise<{ grid: Cell[][]; clues: Clue[] }> => {
  const { size, wordCount } = difficulties[difficulty];
  const wordList = await fetchWords(wordCount);

  // Initialize grid
  const grid = initializeGrid(size);
  const clues: Clue[] = [];
  let wordNumber = 1;

  // Shuffle words for randomness
  const shuffledWords = [...wordList].sort(() => Math.random() - 0.5);

  for (const wordObj of shuffledWords) {
    const word = wordObj.word;

    let placed = false;

    // Attempt to find intersections
    for (let i = 0; i < word.length && !placed; i++) {
      const letter = word[i];

      // Search the grid for the same letter
      for (let y = 0; y < size && !placed; y++) {
        for (let x = 0; x < size && !placed; x++) {
          if (grid[y][x].letter === letter) {
            // Determine the direction to place the new word
            // If the existing word is across, place new word down, and vice versa
            const existingDirections = [];
            if (grid[y][x].isStart.across) existingDirections.push("across");
            if (grid[y][x].isStart.down) existingDirections.push("down");

            for (const existingDir of existingDirections) {
              const newDirection = existingDir === "across" ? "down" : "across";

              // Calculate start position based on the intersection
              let startX = x;
              let startY = y;

              if (newDirection === "across") {
                startX = x - i;
              } else {
                startY = y - i;
              }

              // Check if the word can be placed at the calculated position
              if (
                canPlaceWord(grid, word, startX, startY, newDirection, size)
              ) {
                // Place the word
                placeWordOnGrid(
                  grid,
                  word,
                  startX,
                  startY,
                  newDirection,
                  wordNumber,
                  clues
                );
                wordNumber++;
                placed = true;
                break;
              }
            }
          }
        }
      }
    }

    // If not placed via intersection, place it randomly
    if (!placed) {
      // Alternate direction to spread words
      const direction: "across" | "down" =
        wordNumber % 2 === 0 ? "down" : "across";

      for (let attempt = 0; attempt < 100 && !placed; attempt++) {
        const startX = Math.floor(Math.random() * size);
        const startY = Math.floor(Math.random() * size);

        if (canPlaceWord(grid, word, startX, startY, direction, size)) {
          placeWordOnGrid(
            grid,
            word,
            startX,
            startY,
            direction,
            wordNumber,
            clues
          );
          wordNumber++;
          placed = true;
        }
      }
    }
  }

  return { grid, clues };
};
