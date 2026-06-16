import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

function serviceWorkerCacheVersionPlugin() {
    return {
        name: 'nivva-service-worker-cache-version',
        apply: 'build',
        closeBundle() {
            const buildTimestamp = process.env.BUILD_TIMESTAMP || new Date().toISOString();
            const cacheVersion = `nivva-${buildTimestamp.replace(/[^0-9]/g, '')}`;
            const sourcePath = resolve('public/sw.js');
            const outputPath = resolve('dist/sw.js');
            const source = readFileSync(sourcePath, 'utf8');

            writeFileSync(
                outputPath,
                source.replace('__NIVVA_CACHE_VERSION__', cacheVersion)
            );
        }
    };
}

export default defineConfig({
    plugins: [serviceWorkerCacheVersionPlugin()],
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
