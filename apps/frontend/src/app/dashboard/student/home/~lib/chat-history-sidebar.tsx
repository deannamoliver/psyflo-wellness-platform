"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SVGProps } from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { LogoutModal } from "@/lib/logout/logout-modal";
import { getInitials } from "@/lib/string-utils";
import { cn } from "@/lib/tailwind-utils";

function EmergencyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.45898 9.16209L0.929688 5.86717C0.847656 5.791 0.769531 5.70897 0.697266 5.62498H2.39648C2.83789 5.62498 3.23633 5.35936 3.40625 4.95115L3.61133 4.45897L4.57422 6.59764C4.64844 6.76365 4.81055 6.87108 4.99219 6.87303C5.17383 6.87498 5.33984 6.77537 5.42188 6.61326L6.25 4.95506L6.2832 5.02147C6.46875 5.39256 6.84766 5.62694 7.26172 5.62694H9.30273C9.23047 5.71092 9.15234 5.79295 9.07031 5.86912L5.54102 9.16209C5.39453 9.29881 5.20117 9.37498 5 9.37498C4.79883 9.37498 4.60547 9.29881 4.45898 9.16209ZM9.83789 4.68748H7.25977C7.20117 4.68748 7.14648 4.65428 7.11914 4.60155L6.66602 3.69725C6.58594 3.53905 6.42383 3.43748 6.24609 3.43748C6.06836 3.43748 5.90625 3.53709 5.82617 3.69725L5.01758 5.31444L4.02148 3.08983C3.94531 2.9199 3.77344 2.81053 3.58789 2.81444C3.40234 2.81836 3.23438 2.92967 3.16211 3.1035L2.54102 4.59373C2.51758 4.65233 2.45898 4.68944 2.39648 4.68944H0.3125C0.261719 4.68944 0.214844 4.69725 0.169922 4.71092C0.0585938 4.39842 0 4.06639 0 3.7285V3.61522C0 2.24998 0.986328 1.08592 2.33203 0.861311C3.22266 0.712873 4.12891 1.00389 4.76562 1.64061L5 1.87498L5.23438 1.64061C5.87109 1.00389 6.77734 0.712873 7.66797 0.861311C9.01367 1.08592 10 2.24998 10 3.61522V3.7285C10 4.05858 9.94531 4.3828 9.83789 4.68748Z"
        fill="#EF4444"
      />
    </svg>
  );
}

function FeedbackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3.28516 7.51758C2.99219 7.41211 2.66602 7.45703 2.41406 7.64258C2.25391 7.75977 1.97852 7.93164 1.64453 8.08594C1.75391 7.79883 1.83789 7.47461 1.86523 7.12109C1.88477 6.86914 1.80078 6.61914 1.63477 6.42773C1.17969 5.91406 0.9375 5.3125 0.9375 4.6875C0.9375 3.13477 2.56445 1.5625 5 1.5625C7.43555 1.5625 9.0625 3.13477 9.0625 4.6875C9.0625 4.6875 7.43555 7.8125 5 7.8125C4.38281 7.8125 3.80273 7.70508 3.28516 7.51758ZM0.513672 8.27734C0.482422 8.33008 0.449219 8.38281 0.414062 8.43555L0.408203 8.44531C0.376953 8.49023 0.345703 8.53516 0.314453 8.58008C0.246094 8.67188 0.171875 8.76172 0.09375 8.84375C0.00390625 8.93359 -0.0214844 9.06641 0.0273438 9.18359C0.0761719 9.30078 0.189453 9.37695 0.316406 9.37695C0.416016 9.37695 0.515625 9.37109 0.615234 9.36133L0.628906 9.35938C0.714844 9.34961 0.800781 9.33789 0.886719 9.32227C0.902344 9.32031 0.917969 9.31641 0.933594 9.3125C1.28125 9.24414 1.61523 9.12695 1.91211 8.99805C2.35938 8.80273 2.74023 8.57031 2.97266 8.40039C3.59375 8.625 4.28125 8.75 5.00586 8.75C7.76758 8.75 10.0059 6.93164 10.0059 4.6875C10.0059 2.44336 7.76172 0.625 5 0.625C5 0.625 0 2.44336 0 4.6875C0 5.56836 0.345703 6.38281 0.931641 7.04883C0.894531 7.52734 0.708984 7.95312 0.513672 8.27734ZM2.8125 5.3125C3.15745 5.3125 3.4375 5.03245 3.4375 4.6875C3.4375 4.34255 3.15745 4.0625 2.8125 4.0625C2.46755 4.0625 2.1875 4.34255 2.1875 4.6875C2.1875 5.03245 2.46755 5.3125 2.8125 5.3125ZM5.625 4.6875C5.625 4.34255 5.34495 4.0625 5 4.0625C4.65505 4.0625 4.375 4.34255 4.375 4.6875C4.375 5.03245 4.65505 5.3125 5 5.3125C5.34495 5.3125 5.625 5.03245 5.625 4.6875ZM7.1875 5.3125C7.53245 5.3125 7.8125 5.03245 7.8125 4.6875C7.8125 4.34255 7.53245 4.0625 7.1875 4.0625C6.84255 4.0625 6.5625 4.34255 6.5625 4.6875C6.5625 5.03245 6.84255 5.3125 7.1875 5.3125Z"
        fill="#4B5563"
      />
    </svg>
  );
}

type Session = {
  id: string;
  title: string;
  hasUnread?: boolean;
};

type ChatHistorySidebarProps = {
  sessions: Session[];
  activeSessionId?: string | null;
  onNewChat?: () => void;
  onSelectSession?: (sessionId: string) => void;
  userName?: string;
  userEmail?: string;
};

export default function ChatHistorySidebar({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  userName = "User",
  userEmail = "",
}: ChatHistorySidebarProps) {
  const router = useRouter();
  // Default open; use localStorage when available so saved preference applies without flash
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved !== null ? saved === "true" : false;
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ bottom: 0, left: 0 });
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    }
  };

  const initials = getInitials(userName, 2);

  useEffect(() => {
    if (showProfileMenu && profileButtonRef.current) {
      const rect = profileButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        bottom: window.innerHeight - rect.top,
        left: isCollapsed ? rect.right : rect.left,
      });
    }
  }, [showProfileMenu, isCollapsed]);

  useEffect(() => {
    if (showProfileMenu) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          profileButtonRef.current &&
          !profileButtonRef.current.contains(event.target as Node) &&
          !(event.target as Element).closest("[data-profile-menu]")
        ) {
          setShowProfileMenu(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showProfileMenu]);

  // Save collapse state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", String(isCollapsed));
    }
  }, [isCollapsed]);

  return (
    <aside
      className={cn(
        "relative flex h-full flex-shrink-0 flex-col border-gray-200 border-r bg-[#EDF2F9] transition-all duration-300",
        isCollapsed ? "w-16" : "w-48",
      )}
    >
      {/* New Chat Button */}
      <div className={cn("px-3 pt-4 pb-4", isCollapsed && "px-2")}>
        <button
          onClick={handleNewChat}
          className={cn(
            "relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-700 text-sm transition-colors hover:bg-white",
            isCollapsed && "justify-center px-2",
          )}
        >
          <PlusCircle className="h-5 w-5 flex-shrink-0 text-gray-600" />
          {!isCollapsed && "New Chat"}
          {isCollapsed &&
            sessions.some((s) => s.hasUnread && s.id !== activeSessionId) && (
              <span className="-top-0.5 -right-0.5 absolute h-2.5 w-2.5 rounded-full border-2 border-[#EDF2F9] bg-blue-500" />
            )}
        </button>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="-right-3 absolute top-10 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-sm hover:bg-gray-50"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Chat History List */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-3">
          <div className="space-y-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession?.(session.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white",
                  activeSessionId === session.id && "bg-white font-medium",
                )}
              >
                <span className="truncate">{session.title}</span>
                {session.hasUnread && activeSessionId !== session.id && (
                  <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User Profile at Bottom */}
      <div
        className={cn("mt-auto border-t px-3 pt-4 pb-4", isCollapsed && "px-2")}
      >
        {/* Profile Menu Popup - Overlay */}
        {showProfileMenu && (
          <div
            data-profile-menu
            className="fixed z-[101] w-80 rounded-xl bg-white p-4 shadow-lg"
            style={{
              bottom: `${menuPosition.bottom + 8}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            {/* User Info Header */}
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500 font-semibold text-sm text-white">
                  {initials}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{userName}</div>
                  {userEmail && (
                    <div className="text-gray-600 text-sm">{userEmail}</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Emergency Resources Section */}
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <EmergencyIcon className="h-5 w-5" />
                <span className="font-semibold text-[#EF4444]">
                  Emergency Resources
                </span>
              </div>
              <Link
                href="/dashboard/student/settings?tab=resources"
                onClick={() => setShowProfileMenu(false)}
              >
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full text-white"
                >
                  Get Help
                </Button>
              </Link>
            </div>

            {/* Settings and Send Feedback */}
            <div className="mb-4 space-y-1">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  router.push("/dashboard/student/settings?tab=account");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-700 text-sm transition-colors hover:bg-white"
              >
                <Settings className="h-5 w-5 text-gray-600" />
                Settings
              </button>
              <a
                href="https://forms.office.com/pages/responsepage.aspx?id=u4pbkScTuUK6RyHUfp2wu8dChQBBTjFLg9EndPNrRGVURFFGQzFEWklDOFdNMDZGRlNaSFM5VklCMCQlQCN0PWcu&route=shorturl"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowProfileMenu(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-700 text-sm transition-colors hover:bg-white"
              >
                <FeedbackIcon className="h-5 w-5" />
                Send Feedback
              </a>
            </div>

            {/* Logout Button */}
            <div className="border-gray-200 border-t pt-4">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  setIsLogoutModalOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-900 text-sm transition-colors hover:bg-gray-200"
              >
                <span>Log Out</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <button
          ref={profileButtonRef}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-white",
            isCollapsed && "justify-center px-2",
          )}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500 font-semibold text-white text-xs">
            {initials}
          </div>
          {!isCollapsed && (
            <span className="font-medium text-sm">{userName}</span>
          )}
        </button>
      </div>

      <LogoutModal
        open={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
      />
    </aside>
  );
}
