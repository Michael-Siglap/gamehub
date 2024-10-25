// src/app/api/fetchDefinition/route.ts

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word") || "";

  const response = await fetch(
    `https://api.datamuse.com/words?sp=${word.toLowerCase()}&md=d&max=1`
  );

  const data = await response.json();

  return NextResponse.json(data);
}
