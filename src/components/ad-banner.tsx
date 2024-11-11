"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export const AdBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentAd, setCurrentAd] = useState(1); // 1 = first ad, 2 = second ad

  const handleAdTransition = () => {
    setIsVisible(false); // Hide the current ad
    setTimeout(() => {
      setCurrentAd(2); // Show the second ad after a delay
      setIsVisible(true); // Make the ad visible again
    }, 5000); // 5-second delay
  };

  const handleClose = () => {
    if (currentAd === 1) {
      handleAdTransition(); // Transition to the next ad with delay
    } else {
      setIsVisible(false); // Hide the component after the second ad is closed
    }
  };

  const handleClick = () => {
    if (currentAd === 1) {
      handleAdTransition(); // Transition to the next ad with delay
    } else {
      setIsVisible(false); // Hide the component after the second ad is clicked
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-3 sm:px-6 sm:flex sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                {currentAd === 1 ? (
                  <>
                    <h2 className="text-white text-lg font-semibold truncate">
                      Visit Our Sponsor Hikari Nova
                    </h2>
                    <p className="mt-1 text-sm text-blue-100 truncate">
                      They make online trading easier for all!
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-white text-lg font-semibold truncate">
                      Explore Best Cities of the World
                    </h2>
                    <p className="mt-1 text-sm text-blue-100 truncate">
                      Your AI built best city finder!
                    </p>
                  </>
                )}
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6">
                <Button
                  asChild
                  variant="secondary"
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Link
                    href={
                      currentAd === 1
                        ? "https://hikarinova.com"
                        : "https://bestcityindex.com"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClick}
                    className="flex items-center"
                  >
                    {currentAd === 1 ? "Learn More" : "Visit Best City Index"}
                    <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="absolute top-1 right-1 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Close banner"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
