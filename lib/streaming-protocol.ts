/**
 * Shared between app/api/ai-generator/stream-html/route.ts (server) and
 * AiWebsiteGeneratorWizard.tsx (client) — a plain constant so the client
 * never has to import anything from a route.ts module (which would pull
 * server-only deps like prisma/next-auth into the client bundle).
 */
export const STREAM_DONE_MARKER = "\n KLIKWEB_STREAM_DONE \n";
