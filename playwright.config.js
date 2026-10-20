import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 2,
  timeout: 30000,
  outputDir: './e2e/.results',
  use: {baseURL: 'http://127.0.0.1:4174', screenshot: 'only-on-failure', trace: 'retain-on-failure'},
  projects: [
    {name: 'desktop', use: {browserName: 'chromium', viewport: {width: 1280, height: 900}}},
    {name: 'mobile', use: {browserName: 'chromium', viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}},
  ],
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174',
    env: {VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: ''},
    reuseExistingServer: false,
  },
});
