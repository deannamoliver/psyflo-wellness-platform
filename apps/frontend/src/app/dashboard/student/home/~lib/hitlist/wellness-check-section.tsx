import { Separator } from "@/lib/core-ui/separator";
import { completeWellnessCheck } from "@/lib/screener/actions";
import {
  didCompleteWellnessCheckToday,
  getCurrUserOngoingResponses,
} from "@/lib/screener/data";
import WellnessCheckHitListItem from "./wellness-check";

/** Renders wellness item + separator when there's an active screening or one was completed today. */
export default async function WellnessCheckHitListSection() {
  let ongoingResponses = await getCurrUserOngoingResponses();

  // Self-heal: if all responses are answered but sessions aren't completed,
  // complete them now so the date check below works correctly.
  if (
    ongoingResponses.length > 0 &&
    ongoingResponses.every((r) => r.answerCode !== null)
  ) {
    await completeWellnessCheck();
    ongoingResponses = await getCurrUserOngoingResponses();
  }

  if (ongoingResponses.length > 0) {
    return (
      <>
        <WellnessCheckHitListItem />
        <Separator />
      </>
    );
  }

  // No ongoing responses — check if a session was completed today
  const completedToday = await didCompleteWellnessCheckToday();
  if (!completedToday) return null;

  return (
    <>
      <WellnessCheckHitListItem completedToday />
      <Separator />
    </>
  );
}
