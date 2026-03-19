import { Component, ChangeDetectionStrategy, inject, signal, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionStateService } from '../services/session-state.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-gate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[999] backdrop-blur-xl bg-white/80 dark:bg-black/80 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div class="w-full max-w-[320px] bg-[#f9f9f9] dark:bg-[#111111] shadow-2xl rounded p-8 border border-gray-200 dark:border-zinc-800 relative overflow-hidden">
        
        <!-- Subtle Dieter Rams Grill/Detail lines at top -->
        <div class="absolute top-0 left-0 right-0 h-1 flex gap-0.5 px-4 opacity-50">
           <div class="flex-1 bg-gray-300 dark:bg-zinc-700"></div><div class="flex-1 bg-gray-300 dark:bg-zinc-700"></div><div class="flex-1 bg-gray-300 dark:bg-zinc-700"></div><div class="flex-1 bg-gray-300 dark:bg-zinc-700"></div>
        </div>

        <div class="flex justify-between items-start mb-8 mt-2">
           <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
           <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-800 dark:text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        
        <h2 class="text-sm font-bold mb-1 uppercase tracking-widest text-[#1C1C1C] dark:text-zinc-100">System Locked</h2>
        <p class="text-[10px] text-gray-500 dark:text-zinc-400 leading-relaxed mb-8 uppercase tracking-widest">
          HIPAA Idle Session Timeout
        </p>

        <form (submit)="unlock(); $event.preventDefault();" class="relative mb-6">
          <input 
            #pinInput
            type="password"
            id="auth-pin"
            name="pin"
            autocomplete="current-password"
            [(ngModel)]="pin"
            placeholder="PIN ('1234')" 
            class="w-full px-4 py-3 text-center text-lg tracking-[0.3em] font-mono bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-sm shadow-inner outline-none focus:border-black dark:focus:border-white transition-colors dark:text-zinc-100 placeholder:tracking-normal placeholder:text-xs placeholder:font-sans"
          />
          @if (errorMsg()) {
            <p class="absolute -bottom-6 left-0 right-0 text-red-500 text-[10px] uppercase font-bold tracking-widest text-center">{{ errorMsg() }}</p>
          }
        </form>

        <button 
          (click)="unlock()" 
          [disabled]="!pin().trim() || isChecking()"
          class="w-full py-3 bg-[#1C1C1C] dark:bg-white text-white dark:text-[#09090b] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-gray-200 transition-all rounded-sm disabled:opacity-30 disabled:cursor-not-allowed shadow-md active:translate-y-[1px] active:shadow-sm">
          {{ isChecking() ? 'Verifying...' : 'Unlock Terminal' }}
        </button>
      </div>
    </div>
  `
})
export class AuthGateComponent {
  private session = inject(SessionStateService);
  pin = signal('');
  errorMsg = signal('');
  isChecking = signal(false);
  
  pinInputRef = viewChild<ElementRef<HTMLInputElement>>('pinInput');

  constructor() {
    effect(() => {
      // Auto-focus the input when the component mounts
      const el = this.pinInputRef()?.nativeElement;
      if (el) {
        setTimeout(() => el.focus(), 100);
      }
    });
  }

  unlock() {
    if (!this.pin().trim()) return;
    this.isChecking.set(true);
    this.errorMsg.set('');

    // Simulate network delay for realistic Auth feel
    setTimeout(() => {
      const success = this.session.unlock(this.pin());
      if (!success) {
        this.errorMsg.set('Invalid PIN code.');
        this.pin.set('');
        this.pinInputRef()?.nativeElement?.focus();
      }
      this.isChecking.set(false);
    }, 600);
  }
}
