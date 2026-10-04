/** The sign-in + sync API (api/, a Cloudflare Worker). `npm run dev` talks to `wrangler dev`. */
export const API_URL = import.meta.env.DEV ? 'http://localhost:8787' : 'https://api.jayantkapoor.com';
