import Link from "next/link";
import { Button } from "@/lib/core-ui/button";

export default function RootPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <h1 className="font-bold text-primary" style={{ fontSize: "128pt" }}>
          feelwell
        </h1>
        <Button className="mt-12 rounded-full px-8" asChild>
          <Link href="/dashboard">Let's go</Link>
        </Button>
      </div>
    </div>
  );
}
