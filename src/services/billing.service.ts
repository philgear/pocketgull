import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private http = inject(HttpClient);
  
  // Track user tier: 'free' | 'premium' | 'patron'
  userTier = signal<'free' | 'premium' | 'patron'>('free');
  
  // Custom slider price (sliding scale)
  selectedPrice = signal<number>(49);
  
  isProcessingCheckout = signal<boolean>(false);

  constructor() {
    // Load persisted billing parameters
    if (typeof window !== 'undefined') {
      const savedTier = localStorage.getItem('pocketgull_tier');
      if (savedTier === 'premium' || savedTier === 'patron') {
        this.userTier.set(savedTier as 'premium' | 'patron');
      }
      
      const savedPrice = localStorage.getItem('pocketgull_billing_price');
      if (savedPrice) {
        this.selectedPrice.set(parseInt(savedPrice, 10));
      }
    }
  }

  setTier(tier: 'free' | 'premium' | 'patron') {
    this.userTier.set(tier);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pocketgull_tier', tier);
    }
  }

  setPrice(price: number) {
    this.selectedPrice.set(price);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pocketgull_billing_price', price.toString());
    }
  }

  async initiateCheckout(amount: number) {
    this.isProcessingCheckout.set(true);
    try {
      const response = await firstValueFrom(
        this.http.post<{ url: string }>('/api/billing/checkout', { 
          userId: 'practitioner-main',
          amount: amount
        })
      );
      
      if (response && response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('No checkout URL returned from server.');
      }
    } catch (err) {
      console.error('[Billing] Stripe checkout failure:', err);
      // Fallback: activate local tier based on the selected amount for dev resilience
      const targetTier = amount >= 80 ? 'patron' : (amount >= 30 ? 'premium' : 'free');
      this.setTier(targetTier);
      this.setPrice(amount);
      this.isProcessingCheckout.set(false);
      alert(`Development Fallback: Activated ${targetTier.toUpperCase()} licensing at $${amount}/mo`);
    }
  }
}
