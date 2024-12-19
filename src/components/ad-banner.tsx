"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ExternalLink, X, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Ad {
  title: string;
  description: string;
  link: string;
  linkText: string;
}

const ads: Ad[] = [
  {
    title: "Visit Our Sponsor Hikari Nova",
    description: "They make online trading easier for all!",
    link: "https://hikarinova.com",
    linkText: "Learn More",
  },
  {
    title: "Explore Best Cities of the World",
    description: "Your AI built best city finder!",
    link: "https://bestcityindex.com",
    linkText: "Visit Best City Index",
  },
  {
    title: "Upgrade Your Gaming Experience",
    description: "Get exclusive in-game items and bonuses!",
    link: "https://gametap.com/premium",
    linkText: "Go Premium",
  },
];

export const AdBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentAd = ads[currentAdIndex];

  const rotateAd = () => {
    setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    setProgress(0);
  };

  const handleClose = () => {
    setIsVisible(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  useEffect(() => {
    if (!isVisible || isPaused) return;

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          rotateAd();
          return 0;
        }
        return prev + 1;
      });
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible, isPaused]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="relative w-full bg-gradient-to-r from-blue-500 to-purple-600"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap">
              <div className="w-0 flex-1 flex items-center">
                <span className="flex p-2 rounded-lg bg-blue-800">
                  <ExternalLink
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                </span>
                <p className="ml-3 font-medium text-white truncate">
                  <span className="md:hidden">{currentAd.title}</span>
                  <span className="hidden md:inline">
                    {currentAd.description}
                  </span>
                </p>
              </div>
              <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                <Button
                  asChild
                  variant="secondary"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
                >
                  <Link
                    href={currentAd.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    {currentAd.linkText}
                    <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </Link>
                </Button>
              </div>
              <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                <button
                  type="button"
                  className="-mr-1 flex p-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
                  onClick={togglePause}
                >
                  <span className="sr-only">
                    {isPaused ? "Resume" : "Pause"}
                  </span>
                  {isPaused ? (
                    <Play className="h-6 w-6 text-white" aria-hidden="true" />
                  ) : (
                    <Pause className="h-6 w-6 text-white" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            <div className="mt-2 h-1 w-full bg-blue-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
          </div>
          <button
            onClick={handleClose}
            className="absolute top-1 right-1 p-1 rounded-full text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Close banner"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
