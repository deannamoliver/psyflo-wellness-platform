"use client";

import { useEffect } from "react";
import type { CheckpointDiff } from "@/lib/langgraph/checkpoint-diff";
import type { Checkpoint } from "@/lib/langgraph/checkpoint-storage";

interface ClientLoggerProps {
  data: {
    checkpoints: Checkpoint[];
    turns: Array<[number, number]>;
    diffs: CheckpointDiff[];
  };
}

/**
 * Client-side logger to output turn detection data to browser console
 * This makes it easy to inspect the data without saving HTML files
 */
export function ClientLogger({ data }: ClientLoggerProps) {
  useEffect(() => {
    console.log("\n🔍 CLIENT-SIDE TURN DETECTION DATA");
    console.log("=====================================");
    console.log("Checkpoints:", data.checkpoints);
    console.log("Turns:", data.turns);
    console.log("Diffs:", data.diffs);
    console.log("=====================================\n");
  }, [data]);

  return null; // This component doesn't render anything
}
