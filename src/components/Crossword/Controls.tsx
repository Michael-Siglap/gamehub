// src/components/Crossword/Controls.tsx

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ControlsProps {
  difficulty: "easy" | "medium" | "hard";
  setDifficulty: (value: "easy" | "medium" | "hard") => void;
  isDaily: boolean;
  resetGame: (daily?: boolean) => void;
}

const Controls: React.FC<ControlsProps> = ({
  difficulty,
  setDifficulty,
  isDaily,
  resetGame,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Select
        value={difficulty}
        onValueChange={(value: "easy" | "medium" | "hard") =>
          setDifficulty(value)
        }
        disabled={isDaily}
      >
        <SelectTrigger className="w-32 sm:w-40">
          <SelectValue placeholder="Select difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="easy">Easy</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="hard">Hard</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={() => resetGame(false)}
        className="flex items-center space-x-2 px-3 py-2 text-sm sm:text-base"
      >
        <RefreshCw className="h-5 w-5" />
        <span>New Puzzle</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => resetGame(true)}
        className="flex items-center space-x-2 px-3 py-2 text-sm sm:text-base"
      >
        <RefreshCw className="h-5 w-5" />
        <span>Daily Puzzle</span>
      </Button>
    </div>
  );
};

export default Controls;
