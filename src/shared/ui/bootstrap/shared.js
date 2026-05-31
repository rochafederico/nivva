export function getBootstrapComponent(name, fallback) {
    return typeof window !== 'undefined' ? window.bootstrap?.[name] ?? fallback : fallback;
}

export function canInstantiateNativeBootstrapComponent() {
    return typeof document !== 'undefined' && typeof Element !== 'undefined';
}
