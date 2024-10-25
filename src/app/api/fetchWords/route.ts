// src/app/api/fetchWords/route.ts

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wordCount = searchParams.get("wordCount") || "10";

  try {
    // Fetch words related to "game" with definitions
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

    // Map the data to include word and its definition as the clue
    const words = data.map((item: { word: string; defs?: string[] }) => ({
      word: item.word.toUpperCase(),
      clue:
        item.defs && item.defs.length > 0
          ? item.defs[0].split("\t")[1]
          : `Definition for "${item.word}".`,
    }));

    return NextResponse.json(words);
  } catch (error) {
    console.error("Error fetching words:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
