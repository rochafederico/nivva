// test/setup.js
// Shared test infrastructure. DOM globals are set by test/globals.js (loaded via --import).

// Import all shared UI components so they register in customElements
import '../src/shared/components/AppButton.js';
import '../src/shared/components/AppInput.js';
import '../src/shared/components/AppForm.js';
import '../src/shared/components/UiModal.js';

// Track test results
let passed = 0;
let failed = 0;

export function assert(condition, message) {
    if (!condition) {
        console.error('    FAIL:', message);
        failed++;
        return false;
    }
    passed++;
    return true;
}

/**
 * Espera hasta que check() devuelva un valor truthy (o se agote el tiempo) y lo retorna.
 * Evita sleeps fijos que fallan en máquinas lentas (p. ej. fake-indexeddb en Windows).
 */
export async function waitFor(check, { timeout = 2000, interval = 10 } = {}) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const value = check();
        if (value) return value;
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    return check();
}

export function getResults() {
    return { passed, failed };
}

export function printResults() {
    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    if (failed > 0) {
        console.error(`\n${failed} test(s) failed`);
        process.exit(1);
    }
    console.log('\nAll tests passed');
}
