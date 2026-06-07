// Shared API configuration for all data hooks.
//
// CORS situation:
//   - api.openf1.org  → blocks localhost, CORS allowed on deployed domains
//   - api.jolpi.ca    → blocks localhost explicitly (host_not_allowed)
//   - f1api.dev       → CORS open, works everywhere
//
// Fix: setupProxy.js proxies /openf1/* and /ergast/* in development.
// Must restart `npm start` after any changes to setupProxy.js.

const DEV = process.env.NODE_ENV === 'development';

export const OPENF1_BASE = DEV ? '/openf1' : 'https://api.openf1.org/v1';
export const ERGAST_BASE  = DEV ? '/ergast' : 'https://api.jolpi.ca/ergast/f1';
export const F1API_BASE   = 'https://f1api.dev/api';

export async function safeGet(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });

    // Proxy errors return 502
    if (r.status === 502 || r.status === 403) {
      console.warn(`[API] ${r.status} from ${url} — proxy may need restart`);
      return null;
    }
    if (!r.ok) {
      console.warn(`[API] ${r.status} ${url}`);
      return null;
    }

    const t = await r.text();
    if (!t || t.trim() === '' || t.trim() === 'null') return null;

    // HTML means proxy isn't running — dev server served index.html instead
    if (t.trim().startsWith('<')) {
      if (DEV) {
        console.error(
          `[API] Proxy not active for ${url}.\n` +
          `→ Stop the dev server and run "npm start" again to activate setupProxy.js`
        );
      }
      return null;
    }

    return JSON.parse(t);
  } catch(e) {
    console.warn(`[API] fetch failed ${url}:`, e.message);
    return null;
  }
}
