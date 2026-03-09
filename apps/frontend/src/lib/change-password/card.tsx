import { ShieldHalf, User2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "../core-ui/card";
import { H4, P } from "../core-ui/typography";
import ChangePasswordForm from "./form";

export function ChangePasswordCard({ redirectTo }: { redirectTo?: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary-foreground">
            <User2 />
          </span>
          <H4>Change Password</H4>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <div className="flex flex-col gap-3 rounded-2xl bg-white/40 p-6">
          <div className="flex items-center gap-2">
            <ShieldHalf className="size-5 text-accent" />
            <P className="font-semibold text-accent">Password Security Tips</P>
          </div>
          <ul className="list-inside list-disc space-y-2 pl-1">
            <li className="text-sm">
              Use a unique password you haven't used elsewhere
            </li>
            <li className="text-sm">
              Consider using a passphrase with multiple words
            </li>
            <li className="text-sm">
              Avoid using personal information like birthdays
            </li>
          </ul>
        </div>
        <ChangePasswordForm redirectTo={redirectTo} />
      </CardContent>
    </Card>
  );
}
