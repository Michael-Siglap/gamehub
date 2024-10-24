"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getUserStats, checkWeeklyReset, UserStats } from "@/utils/userStats";

export default function Dashboard() {
  const [stats, setStats] = useState<UserStats>(getUserStats());

  useEffect(() => {
    checkWeeklyReset();
    const updateInterval = setInterval(() => {
      setStats(getUserStats());
    }, 1000); // Update every second

    return () => clearInterval(updateInterval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const weeklyProgress = (stats.weeklyGamesPlayed / 10) * 100;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Games Played</CardTitle>
            <CardDescription>Your gaming activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalGamesPlayed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Favorite Game</CardTitle>
            <CardDescription>Most played game</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl">
              {stats.favoriteGame || "No games played yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Time Played</CardTitle>
            <CardDescription>Total time spent gaming</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatTime(stats.timePlayed)}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Weekly Goal</CardTitle>
          <CardDescription>Play at least 10 games this week</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={weeklyProgress} className="w-full" />
          <p className="mt-2 text-sm text-muted-foreground">
            {stats.weeklyGamesPlayed} out of 10 games played
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
