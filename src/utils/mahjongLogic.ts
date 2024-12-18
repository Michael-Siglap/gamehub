export type TileSuit = "Man" | "Pin" | "Sou" | "Honor";
export type TileValue =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "Ton"
  | "Nan"
  | "Shaa"
  | "Pei"
  | "Haku"
  | "Hatsu"
  | "Chun";
export type TileColor = "black" | "white";

export interface MahjongTile {
  id: number;
  suit: TileSuit;
  value: TileValue;
  isDora?: boolean;
}

export interface Player {
  name: string;
  hand: MahjongTile[];
  score: number;
  seat: "east" | "south" | "west" | "north";
  isAI: boolean;
}

const suits: TileSuit[] = ["Man", "Pin", "Sou"];
const values: TileValue[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const honors: TileValue[] = [
  "Ton",
  "Nan",
  "Shaa",
  "Pei",
  "Haku",
  "Hatsu",
  "Chun",
];

function generateTiles(): MahjongTile[] {
  let id = 0;
  const tiles: MahjongTile[] = [];

  // Generate number tiles (Man, Pin, Sou)
  for (const suit of suits) {
    for (const value of values) {
      for (let i = 0; i < 4; i++) {
        // Add dora for 5
        const isDora = value === "5" && i === 0;
        tiles.push({ id: id++, suit, value, isDora });
      }
    }
  }

  // Generate honor tiles
  for (const value of honors) {
    for (let i = 0; i < 4; i++) {
      tiles.push({ id: id++, suit: "Honor", value });
    }
  }

  return tiles;
}

function shuffleTiles(tiles: MahjongTile[]): MahjongTile[] {
  const shuffled = [...tiles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateGame(config: {
  numPlayers: number;
  numAIPlayers: number;
}): {
  players: Player[];
  wall: MahjongTile[];
} {
  const { numPlayers, numAIPlayers } = config;
  const tiles = shuffleTiles(generateTiles());
  const players: Player[] = [];
  const seats: Array<"east" | "south" | "west" | "north"> = [
    "east",
    "south",
    "west",
    "north",
  ];

  for (let i = 0; i < numPlayers; i++) {
    players.push({
      name:
        i < numPlayers - numAIPlayers
          ? `Player ${i + 1}`
          : `AI ${i - (numPlayers - numAIPlayers) + 1}`,
      hand: tiles.splice(0, 13),
      score: 25000,
      seat: seats[i],
      isAI: i >= numPlayers - numAIPlayers,
    });
  }

  return { players, wall: tiles };
}

export function getTilePath(tile: MahjongTile, color: TileColor): string {
  const folder = color;

  if (tile.suit === "Honor") {
    return `/mahjong-tiles/${folder}/${tile.value}.png`;
  }

  if (tile.isDora) {
    return `/mahjong-tiles/${folder}/${tile.suit}5-Dora.png`;
  }

  return `/mahjong-tiles/${folder}/${tile.suit}${tile.value}.png`;
}

export function checkWin(hand: MahjongTile[]): boolean {
  // Implement win condition check here
  // This is a simplified version and doesn't cover all Mahjong rules
  const sortedHand = [...hand].sort((a, b) => {
    if (a.suit === b.suit) {
      return a.value.localeCompare(b.value);
    }
    return a.suit.localeCompare(b.suit);
  });

  let sets = 0;
  let pair = false;

  for (let i = 0; i < sortedHand.length; i++) {
    if (
      i + 2 < sortedHand.length &&
      sortedHand[i].suit === sortedHand[i + 1].suit &&
      sortedHand[i].suit === sortedHand[i + 2].suit &&
      sortedHand[i].value === sortedHand[i + 1].value &&
      sortedHand[i].value === sortedHand[i + 2].value
    ) {
      sets++;
      i += 2;
    } else if (
      i + 1 < sortedHand.length &&
      sortedHand[i].suit === sortedHand[i + 1].suit &&
      sortedHand[i].value === sortedHand[i + 1].value
    ) {
      if (pair) {
        return false;
      }
      pair = true;
      i++;
    }
  }

  return sets === 4 && pair;
}

export function aiPlayTurn(player: Player): MahjongTile {
  // Simple AI logic: discard the first tile in hand
  return player.hand[0];
}
