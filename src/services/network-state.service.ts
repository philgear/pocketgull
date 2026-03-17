import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NetworkStateService {
    private browserOnline = signal(typeof navigator !== 'undefined' ? navigator.onLine : true);
    readonly forceOffline = signal(false);
    
    readonly isOnline = computed(() => this.browserOnline() && !this.forceOffline());

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.browserOnline.set(true));
            window.addEventListener('offline', () => this.browserOnline.set(false));
        }
    }

    toggleForceOffline() {
        this.forceOffline.update(v => !v);
    }
}
