"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function HowToPlayModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">How to Play</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            How to Play Quantum Shift
          </DialogTitle>
          <DialogDescription className="text-lg">
            Navigate through space-time anomalies and solve puzzles!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Controls:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Use Left Arrow or A to move left</li>
              <li>• Use Right Arrow or D to move right</li>
              <li>• Use Up Arrow or W to jump</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Objectives:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Navigate through platforms</li>
              <li>• Use the purple portal to teleport</li>
              <li>• Avoid falling off the platforms</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Tips:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Time your jumps carefully</li>
              <li>• Use the portal to reach higher platforms</li>
              <li>• Master the platform timing</li>
            </ul>
          </div>
        </div>
        <DialogClose asChild>
          <Button className="w-full mt-4">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
