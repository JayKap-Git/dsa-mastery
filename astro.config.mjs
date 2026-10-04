// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { loadJava } from './src/lib/java-source.mjs';

const javaDir = fileURLToPath(new URL('./java/src', import.meta.url));

/**
 * `import snippet from '@java/ch09/SegmentTree.java?region=sum'` resolves at build time to
 * highlighted lines + a `@step` label → line-number map (see src/lib/java-source.mjs).
 * @returns {import('vite').Plugin}
 */
function javaSource() {
  return {
    name: 'dsa-java-source',
    enforce: 'pre',
    async load(id) {
      const [path, query = ''] = id.split('?');
      if (!path.endsWith('.java')) return;
      this.addWatchFile(path);
      const region = new URLSearchParams(query).get('region') ?? undefined;
      return `export default ${JSON.stringify(await loadJava(path, region))};`;
    },
  };
}

export default defineConfig({
  site: 'https://dsa.jayantkapoor.com',
  integrations: [react(), mdx()],
  markdown: {
    // MDX chapters use remark-math + rehype-katex, so keep the unified (remark/rehype) pipeline.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
  vite: {
    plugins: [javaSource()],
    resolve: { alias: { '@java': javaDir } },
  },
});
