import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
            '/.netlify/functions': {
                target: 'http://localhost:9999', // Servidor local do Netlify Dev
                changeOrigin: true,
                rewrite: (path) => path.replace('/.netlify/functions', ''),
            },
        },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        calculadora_penal: resolve(__dirname, 'calculadora-penal.html'),
        cidadao: resolve(__dirname, 'cidadao.html'),
        codigo_civil: resolve(__dirname, 'codigo-civil.html'),
        codigo_de_transito: resolve(__dirname, 'codigo-de-transito.html'),
        codigo_penal: resolve(__dirname, 'codigo-penal.html'),
        codigo_processo_penal: resolve(__dirname, 'codigo-processo-penal.html'),
        constituicao: resolve(__dirname, 'constituicao.html'),
        juridico_form: resolve(__dirname, 'juridico-form.html'),
        'lei-001-2026': resolve(__dirname, 'lei-001-2026.html'),
        'lei-002-2026': resolve(__dirname, 'lei-002-2026.html'),
        'lei-003-2026': resolve(__dirname, 'lei-003-2026.html'),
        'lei-004-2026': resolve(__dirname, 'lei-004-2026.html'),
        'lei-005-2026': resolve(__dirname, 'lei-005-2026.html'),
        'lei-006-2026': resolve(__dirname, 'lei-006-2026.html'),
        'lei-007-2026': resolve(__dirname, 'lei-007-2026.html'),
        'lei-008-2026': resolve(__dirname, 'lei-008-2026.html'),
        'lei-009-2026': resolve(__dirname, 'lei-009-2026.html'),
        'lei-010-2026': resolve(__dirname, 'lei-010-2026.html'),
        leis_municipais: resolve(__dirname, 'leis-municipais.html'),
        policia_form: resolve(__dirname, 'policia-form.html'),
        seguranca_publica: resolve(__dirname, 'seguranca-publica.html'),
        transparencia: resolve(__dirname, 'transparencia.html'),
      },
    },
  },
});