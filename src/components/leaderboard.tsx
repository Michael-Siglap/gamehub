import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  date: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  gameType: string;
}

export function Leaderboard({
  entries,
  currentUserRank,
  gameType,
}: LeaderboardProps) {
  return (
    <Card className=" w-full max-w-md bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 backdrop-blur-md border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {gameType} Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="text-xs sm:text-sm text-gray-200">
              <TableHead className="w-[100px] text-xs sm:text-sm text-gray-200">
                Rank
              </TableHead>
              <TableHead className="text-xs sm:text-sm text-gray-200">
                Name
              </TableHead>
              <TableHead className="text-xs sm:text-sm text-gray-200">
                Score
              </TableHead>
              <TableHead className="text-right text-xs sm:text-sm text-gray-200">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow
                key={entry.rank}
                className={entry.rank === currentUserRank ? "bg-muted" : ""}
              >
                <TableCell className="font-medium">
                  {entry.rank === currentUserRank ? (
                    <Badge variant="secondary">{entry.rank}</Badge>
                  ) : (
                    entry.rank
                  )}
                </TableCell>
                <TableCell>{entry.name}</TableCell>
                <TableCell>{entry.score}</TableCell>
                <TableCell className="text-right">{entry.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
