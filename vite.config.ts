import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Rutas relativas: la app funciona igual en la raíz de un dominio que en una subcarpeta.
  base: './',
  plugins: [react()],
  server: {
    port: 5181,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
