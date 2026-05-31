import { defineConfig } from 'vite';

export default defineConfig({
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: [
                    'import',
                    'global-builtin',
                    'color-functions',
                    'if-function'
                ]
            }
        }
    },
    build: {
        outDir: 'dist'
    }
});
