import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface UserBillingInfo {
  tier: 'free' | 'premium';
  stripeCustomerId?: string;
  apigeeAppId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  private http = inject(HttpClient);
  
  // Local signal to track active tier
  userTier = signal<'free' | 'premium'>('free');
  isProcessingCheckout = signal<boolean>(false);

  constructor() {
    // Restore tier state from localStorage if available
    if (typeof window !== 'undefined') {
      const savedTier = localStorage.getItem('POCKETGULL_TIER');
      if (savedTier === 'premium') {
        this.userTier.set('premium');
      }
    }
  }

  /**
   * Initializes the Stripe checkout process for a user
   */
  async startUpgradeCheckout(userId: string): Promise<void> {
    this.isProcessingCheckout.set(true);
    try {
      const response = await firstValueFrom(
        this.http.post<{ url: string }>('/api/billing/checkout', { userId })
      );
      
      if (response && response.url) {
        // Redirect to Stripe checkout hosting
        window.location.href = response.url;
      } else {
        throw new Error('No checkout URL returned from server.');
      }
    } catch (error) {
      console.error('[BillingService] Checkout initialization failed:', error);
      throw error;
    } finally {
      this.isProcessingCheckout.set(false);
    }
  }

  /**
   * Sets premium status (called on success url detection)
   */
  setPremiumStatus(isPremium: boolean) {
    const tier = isPremium ? 'premium' : 'free';
    this.userTier.set(tier);
    if (typeof window !== 'undefined') {
      localStorage.setItem('POCKETGULL_TIER', tier);
    }
  }
}
