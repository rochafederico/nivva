// src/shared/database/localStorageFallback.js
// Fallback de persistencia cuando IndexedDB no está disponible.
// Jerarquía: localStorage → memoria de sesión (si LS también falla, ej. Safari privado).

const LS_PREFIX = 'nivva_';
const _mem = {}; // in-memory backing de último recurso

function _ls() {
    try {
        const ls = globalThis.localStorage;
        if (!ls) return null;
        ls.setItem('__nivva_chk', '1');
        ls.removeItem('__nivva_chk');
        return ls;
    } catch {
        return null;
    }
}

const LS = _ls(); // null si localStorage no está disponible

function _load(name) {
    if (LS) {
        try {
            return JSON.parse(LS.getItem(LS_PREFIX + name) || '[]');
        } catch {
            return [];
        }
    }
    return _mem[name] ? [..._mem[name]] : [];
}

function _save(name, data) {
    if (LS) {
        try {
            LS.setItem(LS_PREFIX + name, JSON.stringify(data));
            return;
        } catch {
            // quota excedida — caer a memoria
        }
    }
    _mem[name] = data;
}

function _nextId(name) {
    const key = LS_PREFIX + name + '_seq';
    if (LS) {
        try {
            const n = parseInt(LS.getItem(key) || '0', 10) + 1;
            LS.setItem(key, String(n));
            return n;
        } catch { /* fall through */ }
    }
    const mk = name + '_seq';
    _mem[mk] = (_mem[mk] || 0) + 1;
    return _mem[mk];
}

// Imita la interfaz de un IDBRequest: onsuccess/onerror se asignan sincrónicamente
// y el callback se dispara en el siguiente macrotask (igual que IDB real).
class FakeRequest {
    constructor(fn, transaction) {
        this.result = undefined;
        this.onsuccess = null;
        this.onerror = null;
        transaction?._requestStarted();
        setTimeout(() => {
            let fnFailed = false;
            try {
                this.result = fn();
            } catch (e) {
                fnFailed = true;
                const event = { target: { errorCode: e.message, error: e } };
                if (typeof this.onerror === 'function') {
                    this.onerror(event);
                }
                transaction?._requestFailed(event);
            }

            if (fnFailed) return;

            try {
                if (typeof this.onsuccess === 'function') {
                    this.onsuccess({ target: this });
                }
            } catch (e) {
                setTimeout(() => {
                    throw e;
                }, 0);
            } finally {
                transaction?._requestFinished();
            }
        }, 0);
    }
}

class FakeObjectStore {
    constructor(name, transaction = null) {
        this._name = name;
        this.transaction = transaction;
    }

    _request(fn) {
        return new FakeRequest(fn, this.transaction);
    }

    withTransaction(transaction) {
        return new FakeObjectStore(this._name, transaction);
    }

    add(entity) {
        return this._request(() => {
            const data = _load(this._name);
            const copy = { ...entity };
            if (copy.id == null) copy.id = _nextId(this._name);
            data.push(copy);
            _save(this._name, data);
            return copy.id;
        });
    }

    put(entity) {
        return this._request(() => {
            const data = _load(this._name);
            const copy = { ...entity };
            if (copy.id == null) copy.id = _nextId(this._name);
            const idx = data.findIndex(r => r.id === copy.id);
            if (idx >= 0) data[idx] = copy;
            else data.push(copy);
            _save(this._name, data);
            return copy.id;
        });
    }

    get(id) {
        return this._request(() => _load(this._name).find(r => r.id === id));
    }

    delete(id) {
        return this._request(() => {
            _save(this._name, _load(this._name).filter(r => r.id !== id));
        });
    }

    getAll() {
        return this._request(() => _load(this._name));
    }

    getAllKeys() {
        return this._request(() => _load(this._name).map(r => r.id));
    }

    clear() {
        return this._request(() => { _save(this._name, []); });
    }

    // Convención: 'by_campo' → filtra por record.campo
    index(indexName) {
        const field = indexName.replace(/^by_/, '');
        const name = this._name;
        const transaction = this.transaction;
        return {
            getAll(key) {
                return new FakeRequest(() => {
                    const data = _load(name);
                    return key !== undefined ? data.filter(r => r[field] === key) : data;
                }, transaction);
            },
            getAllKeys(key) {
                return new FakeRequest(() => {
                    const data = _load(name);
                    const filtered = key !== undefined ? data.filter(r => r[field] === key) : data;
                    return filtered.map(r => r.id);
                }, transaction);
            }
        };
    }
}

class FakeTransaction {
    constructor(storeMap) {
        this._storeMap = storeMap;
        this.onerror = null;
        this.onabort = null;
        this.oncomplete = null;
        this._pending = 0;
        this._settled = false;
    }

    objectStore(name) {
        return this._storeMap[name];
    }

    abort() {
        if (this._settled) return;
        this._settled = true;
        const event = { target: { errorCode: 'abort' } };
        if (typeof this.onabort === 'function') this.onabort(event);
    }

    _requestStarted() {
        if (this._settled) return;
        this._pending += 1;
    }

    _requestFinished() {
        if (this._settled) return;
        this._pending -= 1;
        this._queueComplete();
    }

    _requestFailed(event) {
        if (this._settled) return;
        this._settled = true;
        if (typeof this.onerror === 'function') this.onerror(event);
        if (typeof this.onabort === 'function') this.onabort(event);
    }

    _queueComplete() {
        if (this._pending !== 0) return;
        setTimeout(() => {
            if (this._settled || this._pending !== 0) return;
            this._settled = true;
            if (typeof this.oncomplete === 'function') this.oncomplete({ target: this });
        }, 0);
    }
}

export class FakeIDB {
    constructor() {
        this._stores = {};
        ['deudas', 'montos', 'ingresos', 'inversiones'].forEach(n => {
            this._stores[n] = new FakeObjectStore(n);
        });
    }
    transaction(storeNames) {
        const names = Array.isArray(storeNames) ? storeNames : [storeNames];
        const tx = new FakeTransaction({});
        const map = {};
        names.forEach(n => { map[n] = this._stores[n].withTransaction(tx); });
        tx._storeMap = map;
        return tx;
    }
}
