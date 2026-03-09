"use client";

import { Building2, Calendar, Edit, Hash, MapPin } from "lucide-react";
import Link from "next/link";
import type { LocationDetail } from "./location-detail-data";

export function LocationDetailHeader({
  location,
}: {
  location: LocationDetail;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard/admin/organizations"
          className="text-gray-500 transition-colors hover:text-blue-600"
        >
          Organizations
        </Link>
        <span className="text-gray-400">&gt;</span>
        <Link
          href={`/dashboard/admin/organizations/${location.orgId}`}
          className="text-gray-500 transition-colors hover:text-blue-600"
        >
          {location.orgName}
        </Link>
        <span className="text-gray-400">&gt;</span>
        <span className="font-medium text-gray-900">{location.name}</span>
      </nav>

      {/* Blue Banner */}
      <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-2xl text-white">{location.name}</h1>
            <div className="mt-1.5 flex items-center gap-4 text-blue-100">
              <span className="flex items-center gap-1.5 text-sm">
                <Hash className="h-3.5 w-3.5" />
                {location.code}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <Building2 className="h-3.5 w-3.5" />
                {location.orgName}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                Created: {location.createdAt}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/dashboard/admin/organizations/add-location?locationId=${location.id}&orgId=${location.orgId}`}
          className="flex items-center gap-2 rounded-lg border-2 border-white bg-white px-5 py-2 font-semibold text-blue-600 text-sm transition-colors hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
          Edit Location
        </Link>
      </div>
    </div>
  );
}
