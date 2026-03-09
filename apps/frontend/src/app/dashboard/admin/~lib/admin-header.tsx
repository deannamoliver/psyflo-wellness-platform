"use client";

import { ArrowRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LogoutModal } from "@/lib/logout/logout-modal";

type AdminHeaderProps = {
  userName: string;
  userInitials: string;
  userEmail?: string;
};

export default function AdminHeader({
  userName,
  userInitials,
  userEmail,
}: AdminHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showProfileMenu) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setShowProfileMenu(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showProfileMenu]);

  return (
    <>
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-6 font-dm">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#0D6B6B] text-xl tracking-tight">
            Psyflo
          </span>
          <span className="text-[#7A9696] text-sm">Admin Portal</span>
        </div>

        {/* Right: User Profile */}
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0D6B6B] font-semibold text-white text-xs">
            {userInitials}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-medium text-gray-900 text-sm">
              {userName}
            </span>
            <span className="text-gray-500 text-xs">Administrator</span>
          </div>
        </button>
      </nav>

      {/* Profile Dropdown - Log Out only */}
      {showProfileMenu && (
        <div className="fixed inset-0 z-50">
          <div
            ref={menuRef}
            className="fixed top-[68px] right-4 z-[101] w-80 rounded-xl bg-white p-4 shadow-lg"
          >
            {/* User Info Header */}
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-sm text-white">
                  {userInitials}
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

            {/* Log Out Button only */}
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
        </div>
      )}

      <LogoutModal
        open={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
      />
    </>
  );
}
