"use client";

import { ChevronRight, Lock, Mail, Shield, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";

type TabType = "account" | "security" | "support";

type ProviderSettingsClientProps = {
  userInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export default function ProviderSettingsClient({
  userInfo,
}: ProviderSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("account");

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("account")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "account"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <User className="size-4" />
          Account
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "security"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <Shield className="size-4" />
          Security
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("support")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "support"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <Mail className="size-4" />
          Support
        </button>
      </div>

      {/* Account Tab */}
      {activeTab === "account" && (
        <div className="space-y-6">
          {/* Profile Information */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900 text-lg">Profile Information</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Full Name</p>
                  <p className="text-gray-900">{userInfo.firstName} {userInfo.lastName}</p>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Address</p>
                  <p className="text-gray-900">{userInfo.email}</p>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900 text-lg">Password & Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-gray-100">
                    <Lock className="size-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Change Password</p>
                    <p className="text-xs text-gray-500">Update your account password</p>
                  </div>
                </div>
                <ChevronRight className="size-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900 text-lg">Active Sessions</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Current Session</p>
                <p className="text-xs text-gray-500">This device • Active now</p>
              </div>
              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Support Tab */}
      {activeTab === "support" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900 text-lg">Get Help</h3>
            <div className="space-y-4">
              <Link
                href="mailto:support@psyflo.com"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                    <Mail className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Support</p>
                    <p className="text-xs text-gray-500">support@psyflo.com</p>
                  </div>
                </div>
                <ChevronRight className="size-5 text-gray-400" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900 text-lg">Legal</h3>
            <div className="space-y-3">
              <Link
                href="#"
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50"
              >
                <span className="text-sm text-gray-700">Terms of Service</span>
                <ChevronRight className="size-4 text-gray-400" />
              </Link>
              <Link
                href="#"
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50"
              >
                <span className="text-sm text-gray-700">Privacy Policy</span>
                <ChevronRight className="size-4 text-gray-400" />
              </Link>
              <Link
                href="#"
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50"
              >
                <span className="text-sm text-gray-700">HIPAA Compliance</span>
                <ChevronRight className="size-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
