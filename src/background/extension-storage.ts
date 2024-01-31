export class ExtensionStorage {
    private key: string
    private _store: Map<string, string>
    loaded: boolean
    constructor() {
        this.key = '__extension_storage__';
        this._store = new Map();
        this.loaded = false;
    }
    is_supported() {
        var supported = chrome?.storage?.local !== undefined;
        if (!supported) {
            console.error('localStorage unsupported; falling back to cookie store');
        }
        return supported;
    }
    async load() {
        if (this.loaded) {
            return this._store;
        }
        const s = await chrome.storage.local.get(this.key)
        const value = s[this.key] ?? {}
        this._store = new Map(Object.entries(value))
        this.loaded = true
        return this._store
    }
    error(msg: string) {
        console.error('chromeStorage error: ' + msg);
    }
    get(k: string) {
        return this._store.get(k) ?? null
    }

    parse(name: string) {
        try {
            return JSON.parse(this.get(name) ?? '{}');
        } catch (err) {
            // noop
        }
        return null;
    }
        
    set(k: string, v: string) {
        this._store.set(k, v)
        this.save().catch(console.error)
    }

    remove(name: string) {
        this._store.delete(name)
        this.save().catch(console.error)
    }

    async save() {
        const value: Record<string, string> = {}
        this._store.forEach((v, k) => {
            value[k] = v
        })
        await chrome.storage.local.set({ [this.key]: value })
    }
}