export interface UserStats {
  totalGamesPlayed: number;
  favoriteGame: string;
  timePlayed: number; // in seconds
  weeklyGamesPlayed: number;
}

const INITIAL_STATS: UserStats = {
  totalGamesPlayed: 0,
  favoriteGame: "",
  timePlayed: 0,
  weeklyGamesPlayed: 0,
};

export function getUserStats(): UserStats {
  const stats = localStorage.getItem("userStats");
  return stats ? JSON.parse(stats) : INITIAL_STATS;
}

export function updateUserStats(update: Partial<UserStats>) {
  const currentStats = getUserStats();
  const newStats = { ...currentStats, ...update };
  localStorage.setItem("userStats", JSON.stringify(newStats));
}

export function incrementGamesPlayed(gameName: string) {
  const stats = getUserStats();
  stats.totalGamesPlayed += 1;
  stats.weeklyGamesPlayed += 1;

  // Update favorite game
  const gameCount =
    parseInt(localStorage.getItem(`${gameName}Count`) || "0") + 1;
  localStorage.setItem(`${gameName}Count`, gameCount.toString());

  if (
    !stats.favoriteGame ||
    gameCount >
      parseInt(localStorage.getItem(`${stats.favoriteGame}Count`) || "0")
  ) {
    stats.favoriteGame = gameName;
  }

  updateUserStats(stats);
}

export function updateTimePlayed(seconds: number) {
  const stats = getUserStats();
  stats.timePlayed += seconds;
  updateUserStats(stats);
}

// Reset weekly stats every Monday
export function checkWeeklyReset() {
  const lastReset = localStorage.getItem("lastWeeklyReset");
  const now = new Date();
  if (
    !lastReset ||
    (now.getDay() === 1 && new Date(lastReset).getDate() !== now.getDate())
  ) {
    updateUserStats({ weeklyGamesPlayed: 0 });
    localStorage.setItem("lastWeeklyReset", now.toISOString());
  }
}
