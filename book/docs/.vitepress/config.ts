import { defineConfig } from 'vitepress';
import { vitepressSidebar } from '../../scripts/book-manifest.mjs';

export default defineConfig({
  title: 'Agentic Systems Patterns',
  description: 'A practical reference for modern agent architecture',
  base: '/Agentic-Systems-Patterns/',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: 'Book', link: '/' },
      { text: 'GitHub', link: 'https://github.com/GTuritto/Agentic-Systems-Patterns' }
    ],
    sidebar: vitepressSidebar,
    footer: {
      message: 'Licensed under CC BY-SA 4.0.',
      copyright: 'Copyright (c) 2025-2026 Giuseppe Turitto'
    },
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/GTuritto/Agentic-Systems-Patterns' }
    ]
  }
});
