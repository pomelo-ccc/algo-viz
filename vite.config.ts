import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['.monkeycode-ai.online'],
  },
});
