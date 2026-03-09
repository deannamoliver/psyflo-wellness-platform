"use client";

import { maxByOrNull, minByOrNull } from "@/lib/array-utils";
import { Large, Muted, P } from "@/lib/core-ui/typography";
import { titleCase } from "@/lib/string-utils";
import { SELDomainsChart } from "./sel-domains-chart";

export type SELDomainData = {
  domain: string;
  label: string;
  score: number;
  maxScore: number;
};

export function SELDomains({
  data,
  onSelect,
}: {
  data: SELDomainData[];
  onSelect: (domain: string) => void;
}) {
  const max = maxByOrNull(data, (domain) => domain.score);
  const min = minByOrNull(data, (domain) => domain.score);

  return (
    <div className="space-y-4">
      <Large>Domains</Large>

      <SELDomainsChart data={data} onSelect={onSelect} />

      <div className="flex items-center justify-around rounded-lg py-3">
        <div className="text-center">
          <Muted>Strongest Domain</Muted>
          <P className="font-bold text-accent">
            {titleCase(max?.domain ?? "", { delimiter: "_" })}
          </P>
        </div>
        <div className="text-center">
          <Muted>Growth Area</Muted>
          <P className="font-bold text-accent">
            {titleCase(min?.domain ?? "", { delimiter: "_" })}
          </P>
        </div>
      </div>
    </div>
  );
}
