import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic', // Dùng classic JSX cho React 16
    })
  ],
  root: '.',
  publicDir: 'public',
  server: {
    port: 1999,
    open: true,
    host: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-demo',
  },
  define: {
    'process.env': {},
  },
  esbuild: {
    jsx: 'transform', // Dùng classic JSX transform
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
});

