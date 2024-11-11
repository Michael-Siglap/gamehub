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
import {
  getUserStats,
  checkWeeklyReset,
  UserStats,
  INITIAL_STATS,
} from "@/utils/userStats";
import { motion } from "framer-motion";
import { Gamepad2, Clock, Trophy, Target } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      checkWeeklyReset();
      setStats(getUserStats());

      const updateInterval = setInterval(() => {
        setStats(getUserStats());
      }, 1000); // Update every second

      return () => clearInterval(updateInterval);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const weeklyProgress = (stats.weeklyGamesPlayed / 10) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8">
      <motion.h1
        className="text-4xl font-bold text-white mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Dashboard
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Games Played"
          description="Your gaming activity"
          value={stats.totalGamesPlayed.toString()}
          icon={<Gamepad2 className="h-6 w-6 text-purple-600" />}
        />
        <StatCard
          title="Favorite Game"
          description="Most played game"
          value={stats.favoriteGame || "No games played yet"}
          icon={<Trophy className="h-6 w-6 text-yellow-500" />}
        />
        <StatCard
          title="Time Played"
          description="Total time spent gaming"
          value={formatTime(stats.timePlayed)}
          icon={<Clock className="h-6 w-6 text-blue-500" />}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="mt-8 bg-white/10 backdrop-blur-md border-none">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-6 w-6 text-green-400" />
              Weekly Goal
            </CardTitle>
            <CardDescription className="text-gray-200">
              Play at least 10 games this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress
              value={weeklyProgress}
              className="w-full h-2 bg-gray-300"
            />
            <p className="mt-2 text-sm text-gray-200">
              {stats.weeklyGamesPlayed} out of 10 games played
            </p>
          </CardContent>
        </Card>
      </motion.div>
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bubble"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 10 + 5}s`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  description,
  value,
  icon,
}: {
  title: string;
  description: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/10 backdrop-blur-md border-none transition-all duration-300 hover:shadow-lg hover:scale-105">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription className="text-gray-200">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-white">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
