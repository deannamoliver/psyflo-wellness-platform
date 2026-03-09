"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import useSWR from "swr";

export function DataRevalidator() {
  const router = useRouter();

  const getRefresher = useCallback(() => {
    router.refresh();
  }, [router]);

  useSWR("auto-data-revalidator", getRefresher, {
    revalidateOnMount: false,
  });

  return null;
}
