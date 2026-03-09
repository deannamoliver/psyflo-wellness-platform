"use client";

import { type SELDomainData, SELDomains } from "./sel-domains";

export default function SELOverviewCharts({
  domainData,
}: {
  domainData: SELDomainData[];
}) {
  return (
    <div>
      <SELDomains data={domainData} onSelect={() => {}} />
    </div>
  );
}
