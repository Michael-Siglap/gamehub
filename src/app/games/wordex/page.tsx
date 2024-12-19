import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function WordexIntro() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-md border-none text-white">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">
            Welcome to Wordex
          </CardTitle>
          <CardDescription className="text-xl text-center text-white/80">
            Test your word-guessing skills!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-center">
            Wordex is a fun and challenging word game where you have to guess a
            hidden six-letter word in six attempts.
          </p>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">How to Play:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>You have 6 attempts to guess the hidden 6-letter word.</li>
              <li>After each guess, you&apos;ll get color-coded feedback:</li>
              <ul className="list-none pl-6 space-y-1">
                <li>🟩 Green: Letter is in the correct spot</li>
                <li>🟨 Yellow: Letter is in the word but in the wrong spot</li>
                <li>⬜ Gray: Letter is not in the word</li>
              </ul>
              <li>
                Use the feedback to refine your guesses and solve the puzzle!
              </li>
            </ul>
          </div>
          <div className="flex justify-center">
            <Link href="/games/wordex/play">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-purple-100"
              >
                Let&apos;s Play!
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
