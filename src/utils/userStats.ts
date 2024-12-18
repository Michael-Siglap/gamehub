export interface UserStats {
  totalGamesPlayed: number;
  favoriteGame: string;
  timePlayed: number; // in seconds
  weeklyGamesPlayed: number;
  gamesPlayed: { [key: string]: number };
  timePlayedPerGame: { [key: string]: number };
}

export const INITIAL_STATS: UserStats = {
  totalGamesPlayed: 0,
  favoriteGame: "",
  timePlayed: 0,
  weeklyGamesPlayed: 0,
  gamesPlayed: {},
  timePlayedPerGame: {},
};

// Check if window is defined before accessing localStorage
export function getUserStats(): UserStats {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    const stats = localStorage.getItem("userStats");
    return stats ? JSON.parse(stats) : INITIAL_STATS;
  }
  return INITIAL_STATS;
}

export function updateUserStats(update: Partial<UserStats>) {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    const currentStats = getUserStats();
    const newStats = { ...currentStats, ...update };
    localStorage.setItem("userStats", JSON.stringify(newStats));
  }
}

export function incrementGamesPlayed(gameName: string) {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    const stats = getUserStats();
    stats.totalGamesPlayed += 1;
    stats.weeklyGamesPlayed += 1;
    stats.gamesPlayed[gameName] = (stats.gamesPlayed[gameName] || 0) + 1;

    // Update favorite game
    if (
      !stats.favoriteGame ||
      stats.gamesPlayed[gameName] > stats.gamesPlayed[stats.favoriteGame]
    ) {
      stats.favoriteGame = gameName;
    }

    updateUserStats(stats);
  }
}

export function updateTimePlayed(gameName: string, seconds: number) {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    const stats = getUserStats();
    stats.timePlayed += seconds;
    stats.timePlayedPerGame[gameName] =
      (stats.timePlayedPerGame[gameName] || 0) + seconds;
    updateUserStats(stats);
  }
}

// Reset weekly stats every Monday
export function checkWeeklyReset() {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    const lastReset = localStorage.getItem("lastWeeklyReset");
    const now = new Date();
    if (
      !lastReset ||
      (now.getDay() === 1 && new Date(lastReset).getDate() !== now.getDate())
    ) {
      const stats = getUserStats();
      stats.weeklyGamesPlayed = 0;
      updateUserStats(stats);
      localStorage.setItem("lastWeeklyReset", now.toISOString());
    }
  }
}

export function getGameStats(gameName: string): {
  gamesPlayed: number;
  timePlayed: number;
} {
  const stats = getUserStats();
  return {
    gamesPlayed: stats.gamesPlayed[gameName] || 0,
    timePlayed: stats.timePlayedPerGame[gameName] || 0,
  };
}
