import { Component, ChangeDetectionStrategy, inject, signal, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { CrossBorderHealthWalletService } from '../services/cross-border-health-wallet.service';

@Component({
  selector: 'app-ambient-living-space-dashboard',
  standalone: true,
  imports: [CommonModule, PocketGullBadgeComponent, PocketGullButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[1100] bg-slate-950/95 backdrop-blur-3xl p-6 sm:p-10 flex flex-col justify-between overflow-y-auto font-sans text-slate-100 animate-in fade-in duration-300">
      
      <!-- Top Ambient Navigation Bar -->
      <div class="flex items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <span class="text-3xl p-2.5 rounded-2xl bg-amber-500/20 text-amber-300">🏡</span>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">Main Living Space Display Mode</span>
              <pocket-gull-badge label="Ambient Family Co-Regulation" severity="warning"></pocket-gull-badge>
            </div>
            <h2 class="text-xl font-extrabold text-white tracking-tight mt-0.5">Home Living Room Health & Autonomic Balance Studio</h2>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <pocket-gull-button (click)="openGleeAlbum.emit()" variant="primary" size="sm">
            🎵 Launch Actuarial Glee Duet
          </pocket-gull-button>

          <button (click)="closeModal.emit()"
            class="w-10 h-10 rounded-full border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 font-bold flex items-center justify-center transition cursor-pointer text-lg">
            ✕
          </button>
        </div>
      </div>

      <!-- Main Ambient Content Grid -->
      <div class="my-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Column 1: Circadian Ambient Lighting Guidance -->
        <div class="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">🌅 Circadian Room Cue</span>
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">Optimal Spectrum</span>
            </div>
            <h3 class="text-lg font-extrabold text-white mb-2">Warm Amber Twilight Spectrum (1800K - 2200K)</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Living room ambient lighting is tuned to suppress melatonin destruction. Promotes parasympathetic vagal tone and prepares multi-generational family members for restorative sleep.
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-slate-500 font-mono">Melatonin Preservation</span>
            <span class="text-xs font-mono font-bold text-emerald-400">98.4% Shielded</span>
          </div>
        </div>

        <!-- Column 2: Multi-Generational Family Health Co-Regulation -->
        <div class="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">👨‍👩‍👧‍👦 Family Co-Regulation</span>
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">+12.0 QALYs Target</span>
            </div>
            <h3 class="text-lg font-extrabold text-white mb-2">Actuarial Glee Duet Singalong Session</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Prescribed 12-track singalong album encourages 2-player duet participation (Singer A Lead & Singer B Harmony), synchronizing family breathing rhythms and building resilience across generations.
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-slate-500 font-mono">Autonomic Co-Regulation</span>
            <span class="text-xs font-mono font-bold text-purple-400">Synchronized (6.0 BPM)</span>
          </div>
        </div>

        <!-- Column 3: Cross-Border Emergency Passport Share -->
        <div class="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">🌐 International Travel Share</span>
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">WHO ICD-11 Ready</span>
            </div>
            <h3 class="text-lg font-extrabold text-white mb-2">Cross-Border Emergency Medical Passport</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Instantly export de-identified clinical telemetry and FHIR R4 care plans into an offline-scannable QR wallet for specialist consults and international emergency care abroad.
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-slate-500 font-mono">Passport Status</span>
            <button (click)="generatePassport()" class="text-xs font-mono font-bold text-sky-400 underline hover:text-sky-300 cursor-pointer">
              Generate Passport QR
            </button>
          </div>
        </div>

      </div>

      <!-- Bottom Status Bar -->
      <div class="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
        <div>Active Living Space Ambient Mode · Pocket-Gull Care Plan Engine v1.1.0</div>
        <div class="flex items-center gap-2 text-slate-400">
          <span>GCP Cloud Project: gen-lang-client-0540208645</span>
        </div>
      </div>

    </div>
  `
})
export class AmbientLivingSpaceDashboardComponent {
  walletService = inject(CrossBorderHealthWalletService);

  closeModal = output<void>();
  openGleeAlbum = output<void>();

  generatePassport() {
    const wallet = this.walletService.generateEmergencyWallet('English');
    alert(`🌐 International Health Wallet Generated:\nID: ${wallet.walletId}\nVitals: ${wallet.vitalsSummary}\nICD-11: ${wallet.activeConditionsIcd11.join('; ')}`);
  }
}
