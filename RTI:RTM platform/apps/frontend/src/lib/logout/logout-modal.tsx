"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";

type LogoutModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LogoutModal({ open, onOpenChange }: LogoutModalProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      // Try the API endpoint first
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        // Fallback to route-based logout
        router.push("/sign-out");
        return;
      }
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback to route-based logout
      router.push("/sign-out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="relative p-6 pb-4">
          <DialogTitle className="pr-8 text-center font-semibold text-2xl text-red-600">
            Ready to Log Out?
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="px-6 pb-6">
          <DialogDescription className="text-center text-gray-600">
            You're about to leave your session. Make sure you're all set before
            signing out.
          </DialogDescription>
        </div>

        <div className="flex justify-center gap-3 bg-gray-50 px-6 py-4">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoggingOut}
            className="border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:text-gray-900"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isLoggingOut ? "Logging Out..." : "Log Out"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
