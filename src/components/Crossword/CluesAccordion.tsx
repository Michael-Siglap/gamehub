// src/components/Crossword/CluesAccordion.tsx

import React from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "lucide-react";

// Define the Clue type
interface Clue {
  number: number;
  clue: string;
  answer: string;
}

interface CluesAccordionProps {
  acrossClues: Clue[];
  downClues: Clue[];
  toggleRevealClue: (clue: Clue) => void;
  revealedClues: Set<string>;
}

const CluesAccordion: React.FC<CluesAccordionProps> = ({
  acrossClues,
  downClues,
  toggleRevealClue,
  revealedClues,
}) => {
  const renderClues = (clues: Clue[], direction: "across" | "down") => {
    return clues.map((clue) => {
      const clueId = `${direction}-${clue.number}`;
      const isRevealed = revealedClues.has(clueId);
      return (
        <p
          key={clueId}
          className={`text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors mb-2 ${
            isRevealed ? "text-green-600 font-medium" : ""
          }`}
          onClick={() => toggleRevealClue(clue)}
        >
          <span className="font-semibold">{clue.number}.</span> {clue.clue}
          {isRevealed && (
            <span className="ml-2 text-green-600">({clue.answer})</span>
          )}
        </p>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Across Clues Accordion */}
      <Disclosure>
        {({ open }) => (
          <div>
            <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
              <span>Across</span>
              <ChevronUpIcon
                className={`${
                  open ? "transform rotate-180" : ""
                } w-5 h-5 text-purple-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-700 max-h-40 overflow-auto">
              {renderClues(acrossClues, "across")}
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>

      {/* Down Clues Accordion */}
      <Disclosure>
        {({ open }) => (
          <div>
            <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
              <span>Down</span>
              <ChevronUpIcon
                className={`${
                  open ? "transform rotate-180" : ""
                } w-5 h-5 text-purple-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-700 max-h-40 overflow-auto">
              {renderClues(downClues, "down")}
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </div>
  );
};

export default CluesAccordion;
