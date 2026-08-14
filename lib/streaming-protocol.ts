/**
 * Shared between app/api/ai-generator/stream-html/route.ts (server) and
 * AiWebsiteGeneratorWizard.tsx (client) — a plain constant so the client
 * never has to import anything from a route.ts module (which would pull
 * server-only deps like prisma/next-auth into the client bundle).
 */
export const STREAM_DONE_MARKER = "\n MAINYUK_STREAM_DONE \n";

/**
 * Emitted when the server discards a failed/corrupt attempt and starts a
 * fresh one — tells the client to clear whatever partial code it has
 * displayed so far instead of appending the retry's output after it.
 */
export const STREAM_RESET_MARKER = "\n MAINYUK_STREAM_RESET \n";
