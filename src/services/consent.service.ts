import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const CONSENT_KEY = 'pg_data_consent_v1';

/**
 * Manages informed consent state for HIPAA-aligned data handling.
 * Persists consent acknowledgment in localStorage.
 *
 * @see ACM Code of Ethics §1.6 — Respect Privacy
 */
@Injectable({ providedIn: 'root' })
export class ConsentService {
    private platformId = inject(PLATFORM_ID);
    private isBrowser = isPlatformBrowser(this.platformId);

    /** Whether the user has acknowledged the data consent modal */
    readonly hasConsented = signal<boolean>(this.loadConsent());

    /** Timestamp of when consent was given */
    readonly consentTimestamp = signal<string | null>(this.loadTimestamp());

    private loadConsent(): boolean {
        if (!this.isBrowser) return true; // SSR bypass
        try {
            return localStorage.getItem(CONSENT_KEY) === 'true';
        } catch {
            return false;
        }
    }

    private loadTimestamp(): string | null {
        if (!this.isBrowser) return null;
        try {
            return localStorage.getItem(`${CONSENT_KEY}_ts`);
        } catch {
            return null;
        }
    }

    /** Record user's informed consent */
    acceptConsent(): void {
        if (!this.isBrowser) return;
        const ts = new Date().toISOString();
        try {
            localStorage.setItem(CONSENT_KEY, 'true');
            localStorage.setItem(`${CONSENT_KEY}_ts`, ts);
        } catch { /* quota exceeded fallback */ }
        this.hasConsented.set(true);
        this.consentTimestamp.set(ts);
    }

    /** Revoke consent and clear data acknowledgment */
    revokeConsent(): void {
        if (!this.isBrowser) return;
        try {
            localStorage.removeItem(CONSENT_KEY);
            localStorage.removeItem(`${CONSENT_KEY}_ts`);
        } catch { /* noop */ }
        this.hasConsented.set(false);
        this.consentTimestamp.set(null);
    }
}
