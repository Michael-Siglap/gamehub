"use client";

import dynamic from "next/dynamic";

const BeatMaster = dynamic(() => import("@/components/BeatMaster"), {
  ssr: false,
});

export default function BeatMasterPage() {
  return <BeatMaster />;
}
