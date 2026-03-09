# Wellness Coach Realtime Messaging – Context for Claude Code

## What This Is

Real-time messaging between **students** and **wellness coaches** (and admins who can take over conversations). When a student sends a message in a coach conversation, the coach sees it without reloading. When a coach (or admin) sends a message, the student should see it without reloading.

**Current reported bug:** Wellness coach messages are **not** showing up on the student dashboard (neither in real time nor after reload in some cases).

---

## Architecture (High Level)

- **PartyKit**: One room per conversation. Room id = **handoffId** (wellness handoff UUID). Only participants in that conversation join that room; no global broadcast.
- **Flow**:
  1. Someone sends a message → write to DB (`wellnessCoachChatEntries`) → **publish** event to PartyKit room `handoffId` (HTTP POST with secret).
  2. All clients **subscribed** to that room (student + coach/admin viewing that conversation) receive the event.
  3. Clients **refetch** from existing APIs and update UI (no message state stored in PartyKit).

---

## Key Files and Roles

### Backend – Publish (after every write)

- **`apps/frontend/src/lib/realtime/publish-handoff-event.ts`**  
  Builds URL `{PARTYKIT_URL}/parties/wellness/{handoffId}`, POSTs JSON event with header `x-partykit-secret`. If `PARTYKIT_URL` or `PARTYKIT_PUBLISH_SECRET` is missing, it returns without publishing (silent). Logs on non-ok response.

- **Write paths that must call `publishHandoffEvent`**:
  - **Student sends:** `apps/frontend/src/app/api/wellness-coach/messages/route.ts` (after insert, publish `message.created`).
  - **Counselor sends:** `apps/frontend/src/app/dashboard/counselor/conversations/[handoffId]/~lib/actions.ts` → `sendCoachMessage` (publish `message.created`).
  - **Admin sends:** `apps/frontend/src/app/dashboard/admin/conversations/[handoffId]/~lib/actions.ts` → `sendAdminMessage` (publish `message.created`).
  - **Auto-assign greeting:** `apps/frontend/src/lib/wellness-coach/auto-assign.ts` (publish `handoff.assigned` and `message.created`).

### PartyKit server

- **`apps/frontend/partykit/wellness-party.js`**  
  - **onConnect:** Validates `token` query param with `this.room.env.PARTYKIT_TOKEN_SECRET`; payload must contain `handoffId` matching `this.room.id`; else closes with 4001.
  - **onRequest (POST):** Checks `x-partykit-secret` === `this.room.env.PARTYKIT_PUBLISH_SECRET`; parses JSON body; **`this.room.broadcast(JSON.stringify(payload))`**; returns 200.  
  - **Important:** Env is **`this.room.env`**, not `this.env` (that was fixed earlier; using `this.env` caused 500 and no broadcast).

### Student – Subscribe and refresh

- **`apps/frontend/src/lib/realtime/use-handoff-realtime.ts`**  
  Hook: takes `handoffId`, `enabled`, `onEvent`. Fetches token from `/api/realtime/wellness/token?handoffId=...`, opens WebSocket to `{NEXT_PUBLIC_PARTYKIT_URL}/parties/wellness/{handoffId}?token=...`. On each message, parses JSON and calls `onEvent`. Reconnects with backoff on close/error.

- **`apps/frontend/src/app/api/realtime/wellness/token/route.ts`**  
  GET, requires `handoffId`. Verifies current user is: student owner of handoff, or assigned coach, or school staff (counselor/wellness_coach at same school), or @psyflo.com admin. Returns `{ token }` signed with `PARTYKIT_TOKEN_SECRET`.

- **Student dashboard state (parent):**  
  **`apps/frontend/src/app/dashboard/student/home/~lib/dashboard-client.tsx`**  
  Holds `activeSessionId`, `activeWellnessCoachMessages`, `activeWellnessHandoffId`, etc. **`fetchSessionData(sessionId, { updateDesktop, updateMobile })`** calls `GET /api/chat/sessions/${sessionId}`, then sets `setActiveWellnessCoachMessages(data.wellnessCoachMessages)`, `setActiveWellnessHandoffId(data.wellnessHandoffId)`, etc.

- **Desktop chat UI:**  
  **`apps/frontend/src/app/dashboard/student/home/~lib/main-chat-area.tsx`**  
  Receives `initialWellnessCoachMessages`, `initialWellnessHandoffId`, `onRealtimeRefresh` from parent. Local state: `wellnessCoachMessages`, `wellnessHandoffId` synced from props via useEffect when `initial*` change.  
  **`useHandoffRealtime({ handoffId: wellnessHandoffId, enabled: Boolean(wellnessHandoffId), onEvent: (e) => { if (shouldRefreshForWellnessEvent(e)) onRealtimeRefresh?.(); } })`**.  
  So when a realtime event arrives, it calls `onRealtimeRefresh()`, which in dashboard-client is `() => fetchSessionData(activeSessionId, { updateDesktop: true, updateMobile: false })`. That updates parent state, parent re-renders, MainChatArea gets new `initialWellnessCoachMessages`, useEffect syncs to `wellnessCoachMessages`.

- **Mobile:** Same idea in `mobile-chat.tsx` and `mobile-home-view.tsx`; `onRealtimeRefresh` triggers `fetchSessionData(..., { updateMobile: true })`.

### Session API – source of truth for student

- **`apps/frontend/src/lib/chat/api.ts`** → **`getChatSession(sessionId)`**  
  Used by `GET /api/chat/sessions/[sessionId]`. Returns `wellnessCoachMessages` and `wellnessHandoffId` **only when `session.assignedCoachId` is set**. Then finds handoff by `chatSessionId` + status in `["accepted", "in_progress"]`, orders by `acceptedAt` desc, takes one; loads `wellnessCoachChatEntries` for that handoff. So if `assignedCoachId` is null (e.g. session not updated after transfer/takeover), the student never gets coach messages or handoffId from this API.

### Counselor / Admin – subscribe and refresh

- **Counselor:** `apps/frontend/src/app/dashboard/counselor/conversations/[handoffId]/~lib/conversation-detail.tsx` uses `useHandoffRealtime` with `conversation.handoffId` and on event calls debounced `router.refresh()`.
- **Admin:** `apps/frontend/src/app/dashboard/admin/conversations/[handoffId]/~lib/admin-conversation-detail.tsx` same pattern.

---

## Past Fixes (from chat)

1. **PartyKit server env:** Use **`this.room.env.PARTYKIT_*`** not `this.env.*` (was causing 500 on POST and no broadcast).
2. **Student send API:** Handoff lookup no longer required `acceptedByCoachId === session.assignedCoachId`; now uses `chatSessionId` + status `accepted`/`in_progress` + `orderBy(acceptedAt) desc` so student message still works after transfer/takeover.
3. **Session sync:** When counselor or admin transfers or takes over, `chatSessions.assignedCoachId` is now updated to match `wellnessCoachHandoffs.acceptedByCoachId` so the student’s session API still returns coach messages and handoffId.
4. **Student send UX:** After POST to `/api/wellness-coach/messages`, we check `res.ok`; on success call `onRealtimeRefresh()`; on failure remove optimistic message and toast.

---

## Event contract

- **`src/lib/realtime/wellness-events.ts`**  
  Events: `message.created`, `handoff.assigned`, `handoff.transferred`, `handoff.closed`, `handoff.reopened`, `handoff.taken_over`.  
  **`shouldRefreshForWellnessEvent(event)`** returns true for all of these; when true, clients refetch (student: session data, coach/admin: page refresh).

---

## Env vars (relevant)

- **Next.js:** `NEXT_PUBLIC_PARTYKIT_URL`, `PARTYKIT_PUBLISH_SECRET`, `PARTYKIT_TOKEN_SECRET` (optional: `PARTYKIT_URL` for server-side publish).
- **PartyKit (deploy):** Same `PARTYKIT_TOKEN_SECRET` and `PARTYKIT_PUBLISH_SECRET` (e.g. `npx partykit env add` or `partykit deploy --with-vars`).

---

## Likely failure points for “coach message not showing on student”

1. **Student never has `wellnessHandoffId`**  
   Then `useHandoffRealtime` is disabled, so no subscription. handoffId comes from `getChatSession` → `wellnessHandoffId`, which is only set when `session.assignedCoachId` is set and there is an accepted/in_progress handoff for that session.

2. **`getChatSession` not returning coach messages**  
   If `session.assignedCoachId` is null (e.g. session not updated when coach was assigned or after takeover), the whole wellness block is skipped and student gets no `wellnessCoachMessages` or `wellnessHandoffId`.

3. **Publish failing**  
   Missing env, wrong URL, or 401/500 from PartyKit (check Next server logs for "Failed to publish handoff event").

4. **Student not subscribed**  
   Token 403, WebSocket connect failure, or `handoffId` null so hook bails.

5. **Refresh not updating UI**  
   `onRealtimeRefresh` undefined (e.g. `activeSessionId` null when callback was created), or `fetchSessionData` not updating the view that’s currently shown (e.g. desktop vs mobile), or MainChatArea not syncing from new `initialWellnessCoachMessages` (useEffect deps or key remount clearing state).

6. **PartyKit room not receiving POST**  
   URL must be `.../parties/wellness/{handoffId}`; PartyKit config has `main` and `parties.wellness` pointing at wellness-party.js.

Use this context plus the codebase to trace the full path from “coach sends message” to “student UI shows it” and fix the break.

---

## Prompt for Claude Code (copy-paste this)

Read the context in `docs/realtime-wellness-context.md` (and the files it references). The bug: when a wellness coach sends a message in a conversation, it does not show up on the student dashboard—neither in real time nor after reload in some cases.

Trace the full path from "coach sends message" to "student UI shows new message":

1. Coach sends → sendCoachMessage (or sendAdminMessage) → DB insert → publishHandoffEvent(handoffId, message.created).
2. PartyKit room receives POST → broadcast to all connections in that room.
3. Student has useHandoffRealtime(handoffId) → receives event → onRealtimeRefresh() → fetchSessionData(activeSessionId) → GET /api/chat/sessions/:id → getChatSession returns wellnessCoachMessages → parent state updates → MainChatArea gets new initialWellnessCoachMessages → useEffect syncs to local wellnessCoachMessages.

Find where this chain breaks (e.g. student never has handoffId, getChatSession not returning coach messages, publish failing, subscription not running, refresh not updating the right state, or PartyKit not broadcasting). Fix it. Prefer fixes that ensure the student always gets coach messages when they are in a coach conversation (including after transfer/takeover and on reload).
