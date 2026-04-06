import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  // Use sub-path when building in GitHub Actions, root otherwise
  base: process.env.GITHUB_ACTIONS ? '/study-planner/' : '/',
  server: {
    port: 5173,
  },
});
