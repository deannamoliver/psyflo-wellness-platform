import type { users } from "@feelwell/database";
import { fmtUserName, stringOrNull } from "../string-utils";

export function getUserFullName(user: typeof users.$inferSelect): string {
  // @ts-expect-error - User metadata is not typed
  const firstName = stringOrNull(user.rawUserMetaData?.first_name);
  // @ts-expect-error - User metadata is not typed
  const lastName = stringOrNull(user.rawUserMetaData?.last_name);

  return fmtUserName({ firstName, lastName });
}

export function getUserFullNameFromMetaData(
  metaData: (typeof users.$inferSelect)["rawUserMetaData"],
): string {
  // @ts-expect-error - User metadata is not typed
  const firstName = stringOrNull(metaData?.first_name);
  // @ts-expect-error - User metadata is not typed
  const lastName = stringOrNull(metaData?.last_name);

  return fmtUserName({ firstName, lastName });
}
