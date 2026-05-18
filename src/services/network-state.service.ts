import { Injectable, signal, computed } from '@angular/core';

const LOCAL_INFERENCE_KEY = 'pg_preferLocalInference';

@Injectable({ providedIn: 'root' })
export class NetworkStateService {
    private browserOnline = signal(typeof navigator !== 'undefined' ? navigator.onLine : true);
    readonly forceOffline = signal(false);

    /** When true, routes all AI calls to local PubGemma even when online. Persisted to localStorage. */
    readonly preferLocalInference = signal(
        typeof localStorage !== 'undefined'
            ? localStorage.getItem(LOCAL_INFERENCE_KEY) === 'true'
            : false
    );

    readonly isOnline = computed(() => this.browserOnline() && !this.forceOffline());

    /** Whether local inference should currently be used (offline OR user prefers it). */
    readonly useLocalInference = computed(() => !this.isOnline() || this.preferLocalInference());

    /**
     * Reactive label for the active AI provider shown in UI status tooltips.
     * Returns one of: 'Gemini Cloud', 'Local (PubGemma)', or 'Offline (PubGemma)'.
     */
    readonly activeProvider = computed(() => {
        if (!this.isOnline()) return 'Offline (PubGemma)';
        if (this.preferLocalInference()) return 'Local (PubGemma)';
        return 'Gemini Cloud';
    });

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.browserOnline.set(true));
            window.addEventListener('offline', () => this.browserOnline.set(false));
        }
    }

    toggleForceOffline() {
        this.forceOffline.update(v => !v);
    }

    /**
     * Toggles the user's preference for local inference and persists the choice to localStorage.
     */
    togglePreferLocalInference() {
        const next = !this.preferLocalInference();
        this.preferLocalInference.set(next);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(LOCAL_INFERENCE_KEY, String(next));
        }
    }
}
