import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStateService {
  /** 
   * Is the application currently locked due to inactivity or lack of authentication?
   * Defaulting to true so they must "login" on boot.
   */
  readonly isLocked = signal(true);

  /**
   * Represents the inactivity timer in seconds.
   */
  private readonly TIMEOUT_SECONDS = 10 * 60; // 10 minutes
  private timeoutId: any;

  constructor() {
    this.resetIdleTimer();
  }

  unlock(pin: string): boolean {
    if (pin === '1234') { // Simulated Auth Check
      this.isLocked.set(false);
      this.resetIdleTimer();
      return true;
    }
    return false;
  }

  lock() {
    this.isLocked.set(true);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  resetIdleTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    // Only reset if we are currently unlocked
    if (!this.isLocked()) {
      this.timeoutId = setTimeout(() => {
        this.lock();
      }, this.TIMEOUT_SECONDS * 1000);
    }
  }
}
