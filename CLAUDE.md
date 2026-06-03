@AGENTS.md

# vocab-web — Next.js 16 on Cloudflare Workers

Stack: **Next.js 16** · **React 19** · **Tailwind CSS v4** · **Cloudflare Workers** · **@opennextjs/cloudflare**

## Commands

- `npm run dev` — local dev (Next.js dev server, port 3000)
- `npm run preview` — local Cloudflare Workers simulation (port 8787)
- `npm run deploy` — deploy to Cloudflare (requires `wrangler login`)
- `npm run type-check` — TypeScript check
- `npm run lint` — ESLint

## Deployment

`NEXT_PUBLIC_API_URL` is baked at build time. Update `wrangler.jsonc` → `vars.NEXT_PUBLIC_API_URL` before deploying to point at the production backend.

## Structure

- `src/app/(auth)/` — login, register, oauth-callback routes
- `src/app/(app)/` — protected routes (dashboard, vocabulary, review, settings)
- `src/contexts/AuthContext.tsx` — JWT auth state
- `src/lib/api.ts` — typed API client
- `src/lib/auth.ts` — localStorage token helpers
- `src/lib/site.ts` — site metadata constants
