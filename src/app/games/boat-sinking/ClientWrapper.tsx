"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";

const DynamicBoatSinkingGame = dynamic(() => import("./BoatSinkingGame"), {
  ssr: false,
});

function LoadingPlaceholder() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center">
      <Card className="w-full max-w-[700px]">
        <CardContent className="p-8">
          <div className="text-center text-2xl font-bold">
            Loading Boat Sinking Game...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClientWrapper() {
  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <DynamicBoatSinkingGame />
    </Suspense>
  );
}
