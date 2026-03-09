"use client";

import { useState } from "react";
import { LockIcon } from "@/lib/change-password/lock-icon";
import { ChangePasswordModal } from "@/lib/change-password/modal";
import { Input } from "@/lib/core-ui/input";

type AccountSectionProps = {
  firstName: string;
  lastName: string;
  email: string;
  age: string | null;
  dateOfBirth: string | null;
};

export default function AccountSection({
  firstName,
  lastName,
  email,
  age,
  dateOfBirth,
}: AccountSectionProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Format date of birth for display
  const formattedDob = dateOfBirth
    ? new Date(dateOfBirth).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    : "";

  return (
    <div className="w-full space-y-8">
      {/* Profile Section */}
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* First Name */}
          <div className="space-y-2">
            <label className="text-base text-gray-700">First Name</label>
            <Input
              type="text"
              value={firstName || ""}
              disabled
              readOnly
              className="h-12 cursor-not-allowed border-2 border-gray-200 bg-white text-base shadow-none md:text-base"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="text-base text-gray-700">Last Name</label>
            <Input
              type="text"
              value={lastName || ""}
              disabled
              readOnly
              className="h-12 cursor-not-allowed border-2 border-gray-200 bg-white text-base shadow-none md:text-base"
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <label className="text-base text-gray-700">Age</label>
            <Input
              type="text"
              value={age || ""}
              disabled
              readOnly
              className="h-12 cursor-not-allowed border-2 border-gray-200 bg-white text-base shadow-none md:text-base"
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="text-base text-gray-700">Date of Birth</label>
            <Input
              type="text"
              value={formattedDob}
              disabled
              readOnly
              className="h-12 cursor-not-allowed border-2 border-gray-200 bg-white text-base shadow-none md:text-base"
            />
          </div>
        </div>

        {/* Email - full width */}
        <div className="space-y-2">
          <label className="text-base text-gray-700">Email</label>
          <Input
            type="email"
            value={email || ""}
            disabled
            readOnly
            className="h-12 cursor-not-allowed border-2 border-gray-200 bg-white text-base shadow-none md:max-w-[calc(50%-0.5rem)] md:text-base"
          />
        </div>

        <p className="text-black text-sm">Contact support to change.</p>
      </div>

      {/* Password Section */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900 text-lg">Password</h2>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <LockIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-center font-medium text-gray-900">Password</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="font-medium text-blue-600 text-sm hover:underline"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Background Section */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900 text-lg">Background</h2>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-6">
            {/* Light Mode Option - Selected */}
            <div className="relative">
              <button
                type="button"
                className="overflow-hidden rounded-xl border-2 border-[#53B1FD] bg-white p-1 transition-all"
              >
                <div className="relative h-24 w-32 overflow-hidden rounded-lg bg-gray-50">
                  {/* Mini browser mockup */}
                  <div className="flex h-3 items-center gap-1 border-gray-200 border-b bg-white px-2">
                    <div className="h-1 w-1 rounded-full bg-gray-300" />
                    <div className="h-1 w-1 rounded-full bg-gray-300" />
                    <div className="h-1 w-1 rounded-full bg-gray-300" />
                  </div>
                  <div className="flex h-full">
                    <div className="w-8 border-gray-200 border-r bg-white" />
                    <div className="flex-1 space-y-1 p-2">
                      <div className="h-2 w-12 rounded bg-gray-200" />
                      <div className="h-2 w-16 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              </button>
              <p className="mt-2 text-center text-gray-600 text-sm">Light</p>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
      />
    </div>
  );
}
