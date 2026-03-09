import Image from "next/image";
import { H3, Small } from "@/lib/core-ui/typography";

export function CurrentLandmark({ island = "Identity" }: { island?: string }) {
  return (
    <div className="1 flex flex-col gap-2">
      <Small className="font-semibold">CURRENT LANDMARK</Small>
      <H3 className="text-3xl">{island} Island</H3>
      <Image
        src="/home/island.png"
        alt="Island"
        className="mt-2 w-lg"
        width={200}
        height={200}
      />
    </div>
  );
}
