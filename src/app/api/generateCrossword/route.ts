// src/app/api/generateCrossword/route.ts

import { NextResponse } from "next/server";
import { generateCrossword } from "@/utils/generateCrossword";

interface Word {
  word: string;
  clue: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wordCount = parseInt(searchParams.get("wordCount") || "10", 10);
  const difficulty =
    (searchParams.get("difficulty") as "easy" | "medium" | "hard") || "medium";

  try {
    // Fetch words from Datamuse API via fetchWords
    const response = await fetch(
      `https://api.datamuse.com/words?ml=game&max=${wordCount}&md=d`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch words" },
        { status: 500 }
      );
    }

    const data = await response.json();

    const words: Word[] = data.map(
      (item: { word: string; defs?: string[] }) => ({
        word: item.word.toUpperCase(),
        clue:
          item.defs && item.defs.length > 0
            ? item.defs[0].split("\t")[1]
            : `Definition for "${item.word}".`,
      })
    );

    // Define a fetchWords function that returns the fetched words
    const fetchWords = async (count: number): Promise<Word[]> => {
      return words.slice(0, count);
    };

    // Generate crossword with intersections
    const crossword = await generateCrossword(difficulty, fetchWords);

    return NextResponse.json(crossword);
  } catch (error) {
    console.error("Error generating crossword:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
