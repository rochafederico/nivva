import { readFileSync } from 'node:fs';
import { assert } from './setup.js';

function readRepoFile(relativePath) {
    return readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
}

export const tests = [
    async function pwa_manifestContainsInstallableFields() {
        console.log('  PWA: manifest incluye nombre, colores e íconos 192/512');
        const manifest = JSON.parse(readRepoFile('public/manifest.json'));
        assert(manifest.name, 'manifest debe incluir name');
        assert(manifest.short_name, 'manifest debe incluir short_name');
        assert(manifest.display === 'standalone', 'manifest debe usar display standalone');
        assert(manifest.theme_color === '#3d7982', 'manifest debe incluir theme_color de marca');
        assert(manifest.background_color === '#3d7982', 'manifest debe incluir background_color de marca');
        const sizes = new Set((manifest.icons || []).map(icon => icon.sizes));
        assert(sizes.has('192x192'), 'manifest debe incluir ícono 192x192');
        assert(sizes.has('512x512'), 'manifest debe incluir ícono 512x512');
    },

    async function pwa_indexLinksManifestAndMainEntrypoint() {
        console.log('  PWA: index referencia manifest y un solo entrypoint');
        const indexHtml = readRepoFile('index.html');
        const manifestLinkPattern = /<link\b(?=[^>]*\brel=["']manifest["'])(?=[^>]*\bhref=["']\.\/manifest\.json["'])[^>]*>/i;
        const mainEntrypointPattern = /<script\b(?=[^>]*\btype=["']module["'])(?=[^>]*\bsrc=["']\/src\/main\.js["'])[^>]*><\/script>/i;
        assert(manifestLinkPattern.test(indexHtml), 'index debe vincular manifest.json');
        assert(mainEntrypointPattern.test(indexHtml), 'index debe cargar solo src/main.js como entrypoint');
    },

    async function pwa_serviceWorkerRegisteredFromMainOnlyInProduction() {
        console.log('  PWA: registro SW desde main.js solo en producción (https)');
        const indexHtml = readRepoFile('index.html');
        const mainJs = readRepoFile('src/main.js');
        assert(!indexHtml.includes('navigator.serviceWorker.register'), 'index.html no debe registrar SW inline');
        assert(mainJs.includes("import './styles/main.scss';"), 'main.js debe importar los estilos principales');
        assert(mainJs.includes("import './styles/mobile-pwa.css';"), 'main.js debe importar los estilos mobile/pwa');
        assert(mainJs.includes("navigator.serviceWorker.register('./sw.js')"), 'main.js debe registrar sw.js');
        assert(mainJs.includes("protocol === 'https:'"), 'main.js debe restringir registro SW a HTTPS');
        assert(mainJs.includes("hostname === 'localhost'"), 'main.js debe excluir localhost del registro SW');
        assert(mainJs.includes("hostname === '[::1]'"), 'main.js debe excluir localhost IPv6 del registro SW');
        assert(mainJs.includes("/^127\\./.test(hostname)"), 'main.js debe excluir rango loopback 127.* del registro SW');
    },

    async function pwa_mobileStylesEnforceTouchTargetsAndSmallScreens() {
        console.log('  PWA: estilos aseguran touch targets y responsive <480px');
        const mobileCss = readRepoFile('src/styles/mobile-pwa.css');
        assert(mobileCss.includes('--touch-target-size: 44px'), 'estilos mobile deben usar touch target mínimo de 44px');
        assert(mobileCss.includes('@media (max-width: 479.98px)'), 'estilos mobile deben incluir media query <480px');
        assert(mobileCss.includes('#app-wrapper'), 'estilos mobile deben ajustar el contenedor principal');
    },

    async function pwa_serviceWorkerPrecachesPublicShellAssets() {
        console.log('  PWA: service worker precachea assets públicos estables');
        const sw = readRepoFile('public/sw.js');
        assert(sw.includes("./manifest.json"), 'service worker debe cachear manifest.json');
        assert(sw.includes("./icons/icon-192.png"), 'service worker debe cachear icon-192');
        assert(sw.includes("./icons/icon-512.png"), 'service worker debe cachear icon-512');
    }
];
