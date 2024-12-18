"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { incrementGamesPlayed, updateTimePlayed } from "@/utils/userStats";
import MahjongBoard from "@/components/Mahjong/MahjongBoard";
import MahjongHand from "@/components/Mahjong/MahjongHand";
import PlayerInfo from "@/components/Mahjong/PlayerInfo";
import {
  generateGame,
  MahjongTile,
  Player,
  TileColor,
  aiPlayTurn,
} from "@/utils/mahjongLogic";
import { motion, AnimatePresence } from "framer-motion";

export default function MahjongGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [wall, setWall] = useState<MahjongTile[]>([]);
  const [discardPile, setDiscardPile] = useState<MahjongTile[]>([]);
  const [tileColor, setTileColor] = useState<TileColor>("black");
  const [gameMode, setGameMode] = useState<"local" | "ai">("local");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted]);

  useEffect(() => {
    if (gameStarted && players[currentPlayerIndex]?.isAI) {
      handleAITurn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, currentPlayerIndex, players]);

  const startGame = () => {
    const numPlayers = 4;
    const numHumanPlayers = gameMode === "local" ? 4 : 1;
    const { players: newPlayers, wall: newWall } = generateGame({
      numPlayers: numPlayers,
      numAIPlayers: numPlayers - numHumanPlayers,
    });
    setPlayers(newPlayers);
    setWall(newWall);
    setGameStarted(true);
    setTimer(0);
    setCurrentPlayerIndex(0);
    setDiscardPile([]);
    incrementGamesPlayed("Mahjong");
  };

  const endGame = () => {
    setGameStarted(false);
    updateTimePlayed("Mahjong", timer);
    // Here you would typically handle game over logic, calculate scores, etc.
  };

  const handleTileDiscard = (tile: MahjongTile) => {
    setPlayers((prevPlayers) => {
      const newPlayers = [...prevPlayers];
      const currentPlayer = newPlayers[currentPlayerIndex];
      currentPlayer.hand = currentPlayer.hand.filter((t) => t.id !== tile.id);
      return newPlayers;
    });

    setDiscardPile((prevPile) => [...prevPile, tile]);
    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
  };

  const handleTileDraw = () => {
    if (wall.length === 0) {
      endGame();
      return;
    }

    const drawnTile = wall[wall.length - 1];
    setWall((prevWall) => prevWall.slice(0, -1));
    setPlayers((prevPlayers) => {
      const newPlayers = [...prevPlayers];
      const currentPlayer = newPlayers[currentPlayerIndex];
      currentPlayer.hand.push(drawnTile);
      return newPlayers;
    });
  };

  const handleAITurn = () => {
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer.isAI) {
      handleTileDraw();
      const discardedTile = aiPlayTurn(currentPlayer);
      handleTileDiscard(discardedTile);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Mahjong</CardTitle>
        </CardHeader>
        <CardContent>
          {!gameStarted ? (
            <div className="space-y-4">
              <RadioGroup
                defaultValue="local"
                onValueChange={(value) => setGameMode(value as "local" | "ai")}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="local" id="local" />
                  <Label htmlFor="local">Play with friends (4 players)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ai" id="ai" />
                  <Label htmlFor="ai">Play against AI (1 player vs 3 AI)</Label>
                </div>
              </RadioGroup>
              <RadioGroup
                defaultValue={tileColor}
                onValueChange={(value) => setTileColor(value as TileColor)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="black" id="black" />
                  <Label htmlFor="black">Black Tiles</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="white" id="white" />
                  <Label htmlFor="white">White Tiles</Label>
                </div>
              </RadioGroup>
              <Button onClick={startGame}>Start Game</Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4">
                <p>Time: {timer} seconds</p>
                <p>Tiles in wall: {wall.length}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {players.map((player, index) => (
                  <PlayerInfo
                    key={index}
                    player={player}
                    isCurrentPlayer={index === currentPlayerIndex}
                  />
                ))}
              </div>
              <MahjongBoard discardPile={discardPile} tileColor={tileColor} />
              <AnimatePresence>
                {players[currentPlayerIndex] &&
                  !players[currentPlayerIndex].isAI && (
                    <motion.div
                      key={currentPlayerIndex}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MahjongHand
                        hand={players[currentPlayerIndex].hand}
                        onTileDiscard={handleTileDiscard}
                        tileColor={tileColor}
                      />
                    </motion.div>
                  )}
              </AnimatePresence>
              <div className="mt-4 flex justify-between">
                <Button
                  onClick={handleTileDraw}
                  disabled={players[currentPlayerIndex]?.isAI}
                >
                  Draw Tile
                </Button>
                <Button onClick={endGame}>End Game</Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
