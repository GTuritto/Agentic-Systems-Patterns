import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://gturitto.github.io',
  base: '/Agentic-Systems-Patterns/',
  outDir: 'dist',
  publicDir: 'public',
  integrations: [mdx()],
  output: 'static'
});
