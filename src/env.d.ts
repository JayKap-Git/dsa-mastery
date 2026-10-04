/// <reference types="astro/client" />

// `@java/<chapter>/<File>.java?region=<name>` — produced by the dsa-java-source Vite plugin.
declare module '@java/*' {
  const snippet: import('./lib/java-source.mjs').JavaSnippet;
  export default snippet;
}
