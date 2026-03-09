"use client";

import { Settings } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/lib/core-ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/core-ui/table";
import { updateScreenerFrequencyAction } from "../../actions";

type ScreenerFrequencySetting = {
  id: string;
  screenerType: "sel" | "phq_a" | "phq_9" | "gad_child" | "gad_7";
  frequency: "monthly" | "quarterly" | "annually";
};

const SCREENER_NAMES: Record<ScreenerFrequencySetting["screenerType"], string> =
  {
    sel: "SEL (WCSD-SECA)",
    phq_a: "PHQ-A (Ages 11-17)",
    phq_9: "PHQ-9 (Ages 18+)",
    gad_child: "GAD-Child (Ages 11-17)",
    gad_7: "GAD-7 (Ages 18+)",
  };

type ScreenerFrequencySettingsProps = {
  initialSettings: ScreenerFrequencySetting[];
};

export function ScreenerFrequencySettings({
  initialSettings,
}: ScreenerFrequencySettingsProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();

  const handleFrequencyChange = (
    screenerType: ScreenerFrequencySetting["screenerType"],
    frequency: "monthly" | "quarterly" | "annually",
  ) => {
    startTransition(async () => {
      try {
        await updateScreenerFrequencyAction(screenerType, frequency);
        setSettings((prev) =>
          prev.map((s) =>
            s.screenerType === screenerType ? { ...s, frequency } : s,
          ),
        );
        toast.success(
          `${SCREENER_NAMES[screenerType]} frequency updated to ${frequency}`,
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update frequency setting",
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary-foreground">
            <Settings />
          </span>
          <div>
            <CardTitle>Screener Frequency Settings</CardTitle>
            <CardDescription>
              Configure re-administration frequency for each screener type.
              Schools can request frequency changes; Psyflo must approve and
              implement.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Screener Type</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell className="font-medium">
                    {SCREENER_NAMES[setting.screenerType]}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={setting.frequency}
                      onValueChange={(value) =>
                        handleFrequencyChange(
                          setting.screenerType,
                          value as "monthly" | "quarterly" | "annually",
                        )
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {setting.screenerType === "sel" && (
                      <span>
                        Applies when score is below thresholds. High-risk
                        conditions (score ≥20 or Q9&gt;0 for PHQ, avg ≥3.5 for
                        GAD-Child, score ≥15 for GAD-7) trigger 2-week
                        re-administration regardless of this setting.
                      </span>
                    )}
                    {setting.screenerType === "phq_a" && (
                      <span>
                        Applies when score &lt;20 and Q9=0. If score ≥20 or
                        Q9&gt;0, re-administered every 2 weeks until resolved.
                      </span>
                    )}
                    {setting.screenerType === "phq_9" && (
                      <span>
                        Applies when score &lt;20 and Q9=0. If score ≥20 or
                        Q9&gt;0, re-administered every 2 weeks until resolved.
                      </span>
                    )}
                    {setting.screenerType === "gad_child" && (
                      <span>
                        Applies when average score &lt;3.5. If average ≥3.5,
                        re-administered every 2 weeks until resolved.
                      </span>
                    )}
                    {setting.screenerType === "gad_7" && (
                      <span>
                        Applies when score &lt;15. If score ≥15, re-administered
                        every 2 weeks until resolved.
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
