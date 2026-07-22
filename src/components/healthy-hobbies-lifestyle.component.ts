import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PlainLanguageGlossaryService } from '../services/plain-language-glossary.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { RevealDirective } from '../directives/reveal.directive';

export interface IHealthyHobbyOption {
  id: string;
  title: string;
  icon: string;
  category: string;
  intensity: 'Gentle' | 'Moderate' | 'Vigorous';
  plainLanguageSummary: string;
  westernMedicalBenefit: string;
  traditionalHolisticBenefit: string;
  recommendedCadence: string;
  primaryHealthyDecision: string;
}

@Component({
  selector: 'app-healthy-hobbies-lifestyle',
  standalone: true,
  imports: [CommonModule, PocketGullBadgeComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 backdrop-blur-2xl shadow-2xl font-mono text-zinc-100 mb-8">
      
      <!-- Component Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-zinc-800">
        <div class="flex items-center gap-3">
          <span class="text-3xl p-2.5 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/30">🚲</span>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold uppercase tracking-widest text-orange-400">Therapeutic Lifestyle Decisions</span>
              <pocket-gull-badge label="Active Hobby & Wellness Prescriptions" severity="success"></pocket-gull-badge>
            </div>
            <h3 class="text-lg font-extrabold text-white tracking-tight mt-0.5">Active Hobbies & Healthy Lifestyle Suggestions</h3>
          </div>
        </div>

        <!-- Cognitive Ergonomics Dual-Depth Toggle Switch -->
        <div class="flex items-center gap-2">
          <div class="p-1 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-1 font-mono text-[11px]">
            <button (click)="isPlainLanguage.set(true)"
                    [class]="isPlainLanguage() ? 'bg-orange-500 text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'"
                    class="px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5">
              <span>🌱</span> Plain Language
            </button>
            <button (click)="isPlainLanguage.set(false)"
                    [class]="!isPlainLanguage() ? 'bg-orange-500 text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'"
                    class="px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5">
              <span>🔬</span> Deep Clinical Rationale
            </button>
          </div>
        </div>
      </div>

      <p class="text-xs text-zinc-400 font-sans mb-6 leading-relaxed">
        Prescribing therapeutic active hobbies (outdoor cycling, forest trail walking, low-impact swimming, and grounded gardening) to build Zone 2 aerobic capacity, protect joints without axial compression, and optimize autonomic stress resilience.
      </p>

      <!-- Healthy Hobby Selection Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        @for (hobby of hobbyOptions; track hobby.id) {
          <div appReveal [revealDelay]="100"
               class="p-5 rounded-2xl bg-zinc-900/80 border transition-all cursor-pointer flex flex-col justify-between"
               [class.border-orange-500]="selectedHobbyId() === hobby.id"
               [class.bg-zinc-900]="selectedHobbyId() === hobby.id"
               [class.border-zinc-800]="selectedHobbyId() !== hobby.id"
               (click)="selectedHobbyId.set(hobby.id)">
            
            <div>
              <!-- Hobby Header -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">{{ hobby.icon }}</span>
                  <div>
                    <h4 class="text-sm font-bold text-white uppercase tracking-wider">{{ hobby.title }}</h4>
                    <span class="text-[10px] text-zinc-400 font-mono">{{ hobby.category }}</span>
                  </div>
                </div>

                <span class="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono border"
                      [class.bg-emerald-500/10]="hobby.intensity === 'Gentle'"
                      [class.text-emerald-400]="hobby.intensity === 'Gentle'"
                      [class.border-emerald-500/30]="hobby.intensity === 'Gentle'"
                      [class.bg-orange-500/10]="hobby.intensity === 'Moderate'"
                      [class.text-orange-400]="hobby.intensity === 'Moderate'"
                      [class.border-orange-500/30]="hobby.intensity === 'Moderate'"
                      [class.bg-purple-500/10]="hobby.intensity === 'Vigorous'"
                      [class.text-purple-400]="hobby.intensity === 'Vigorous'"
                      [class.border-purple-500/30]="hobby.intensity === 'Vigorous'">
                  {{ hobby.intensity }} Intensity
                </span>
              </div>

              <!-- Primary Healthy Decision -->
              <div class="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 mb-3 text-xs">
                <strong class="text-orange-400 text-[10.5px] uppercase font-mono block mb-1">🎯 Core Healthy Decision:</strong>
                <p class="text-zinc-300 font-sans text-[11.5px] leading-relaxed">{{ hobby.primaryHealthyDecision }}</p>
              </div>

              <!-- Cognitive Ergonomics Dual-Depth View: Plain Language vs Deep Rationale -->
              @if (isPlainLanguage()) {
                <div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-sans text-emerald-200 leading-relaxed mb-3">
                  <div class="flex items-center justify-between mb-1.5 font-mono text-[10px] uppercase font-bold text-emerald-400">
                    <span class="flex items-center gap-1">
                      <span>🌱</span> Plain-Language Health Summary
                    </span>
                    <div class="flex items-center gap-2">
                      <button (click)="readAloud(hobby.plainLanguageSummary, $event)" class="text-emerald-400 hover:text-emerald-200 transition cursor-pointer flex items-center gap-1">
                        <span>🔊</span> Read Aloud
                      </button>
                      <button (click)="copyPatientExplanation(hobby, $event)" class="text-zinc-400 hover:text-emerald-300 transition cursor-pointer flex items-center gap-1">
                        <span>📋</span> Copy
                      </button>
                    </div>
                  </div>
                  <p class="text-[11.5px] leading-relaxed text-zinc-200">{{ hobby.plainLanguageSummary }}</p>
                </div>
              } @else {
                <div class="space-y-2 text-[11px] font-sans">
                  <div class="p-2.5 rounded-lg bg-sky-950/30 border border-sky-500/30">
                    <strong class="text-sky-400 font-mono text-[10px] uppercase block mb-0.5">🔬 Medical & Biomechanical Benefit:</strong>
                    <span class="text-zinc-300 leading-relaxed">{{ hobby.westernMedicalBenefit }}</span>
                  </div>

                  <div class="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                    <strong class="text-emerald-400 font-mono text-[10px] uppercase block mb-0.5">☯️ Holistic & Energetic Harmony:</strong>
                    <span class="text-zinc-300 leading-relaxed">{{ hobby.traditionalHolisticBenefit }}</span>
                  </div>
                </div>
              }
            </div>

            <!-- Footer & Log Action -->
            <div class="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
              <span class="text-[10px] font-mono text-zinc-400">Target Cadence: <strong class="text-zinc-200">{{ hobby.recommendedCadence }}</strong></span>
              
              <button (click)="prescribeHobby(hobby, $event)"
                      class="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer border border-orange-400/50">
                📌 Prescribe Hobby
              </button>
            </div>

          </div>
        }
      </div>

      <!-- Action Toast Banner -->
      @if (toastMessage(); as toast) {
        <div class="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span>✅</span>
          <span>{{ toast }}</span>
        </div>
      }

    </div>
  `
})
export class HealthyHobbiesLifestyleComponent {
  state = inject(PatientStateService);
  plainLanguageService = inject(PlainLanguageGlossaryService);

  isPlainLanguage = signal<boolean>(true);
  selectedHobbyId = signal<string>('outdoor_cycling');
  toastMessage = signal<string | null>(null);

  readonly hobbyOptions: IHealthyHobbyOption[] = [
    {
      id: 'outdoor_cycling',
      title: 'Outdoor Cycling & Biking',
      icon: '🚲',
      category: 'Aerobic & Joint Preservation',
      intensity: 'Moderate',
      primaryHealthyDecision: 'Choose steady outdoor cycling over high-impact pavement running to build Zone 2 mitochondrial density without knee joint compression.',
      plainLanguageSummary: 'Cycling is a smooth, low-impact exercise that gets your heart pumping safely without putting heavy pressure on your knees or hips. It builds steady energy and burns fat while giving you fresh air.',
      westernMedicalBenefit: 'Closed-chain 80-90 RPM pedal revolutions lubricate knee cartilage with synovial fluid while maintaining mitochondrial fat oxidation.',
      traditionalHolisticBenefit: 'Outdoor movement through natural landscapes smooths Liver Qi stagnation and calms the Heart-Shen spirit through natural sunlight.',
      recommendedCadence: '30-45 mins @ 80-90 RPM (3x / week)'
    },
    {
      id: 'forest_walking',
      title: 'Forest Bathing & Trail Hiking',
      icon: '🌲',
      category: 'Phytoncide & Stress Resilience',
      intensity: 'Gentle',
      primaryHealthyDecision: 'Incorporate 20-minute daily nature walks to inhale plant phytoncides, reducing systemic inflammation and baseline cortisol.',
      plainLanguageSummary: 'Walking in nature lowers stress hormones, helps you sleep deeper, and boosts your immune system by breathing in natural clean forest air.',
      westernMedicalBenefit: 'Inhaling arboreal terpene phytoncides boosts Natural Killer (NK) immune cell activity by 40% and lowers mean blood pressure.',
      traditionalHolisticBenefit: 'Grounds Spleen Qi, absorbs Earth element stability, and clears excess mental heat from overworked analytical thoughts.',
      recommendedCadence: '20-30 mins daily outdoor nature walks'
    },
    {
      id: 'low_impact_swimming',
      title: 'Low-Impact Aquatic Swimming',
      icon: '🏊',
      category: 'Cardiovascular & 0-G Unloading',
      intensity: 'Moderate',
      primaryHealthyDecision: 'Engage in buoyant water swimming to expand lung vital capacity while relieving 90% of spinal axial weight-bearing loads.',
      plainLanguageSummary: 'Swimming supports your whole body with zero pressure on your spine or joints. It stretches tight muscles, helps you breathe deeply, and cools internal heat.',
      westernMedicalBenefit: 'Hydrostatic pressure improves venous blood return, promotes diaphragmatic breathing, and enhances arterial vascular compliance.',
      traditionalHolisticBenefit: 'Cools excess Pitta inflammatory heat in the blood and dissolves accumulated Kapha metabolic stagnation.',
      recommendedCadence: '30 mins (2-3x / week)'
    },
    {
      id: 'grounded_gardening',
      title: 'Grounded Gardening & Outdoor Movement',
      icon: '🌱',
      category: 'Microbiome & Functional Balance',
      intensity: 'Gentle',
      primaryHealthyDecision: 'Practice outdoor soil gardening to cultivate gut microbiome diversity and maintain proprioceptive balance.',
      plainLanguageSummary: 'Gardening grounds your mind, keeps your joints flexible through easy movement, and exposes you to natural soil bacteria that boost your mood and gut health.',
      westernMedicalBenefit: 'Direct contact with Mycobacterium vaccae soil bacteria stimulates serotonin production and enhances gut flora diversity.',
      traditionalHolisticBenefit: 'Harmonizes Yin-Yang energy, nourishes Kidney Jing vital force, and reinforces physical stability.',
      recommendedCadence: '45 mins (3-4x / week)'
    }
  ];

  prescribeHobby(hobby: IHealthyHobbyOption, event: Event) {
    event.stopPropagation();
    const currentGoals = this.state.patientGoals();
    const newPrescription = `[Active Hobby Prescribed]: ${hobby.title} — ${hobby.primaryHealthyDecision}`;
    this.state.updateGoals(currentGoals ? `${currentGoals} | ${newPrescription}` : newPrescription);
    this.toastMessage.set(`Prescribed "${hobby.title}" as a healthy lifestyle decision to the active care plan!`);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }

  copyPatientExplanation(hobby: IHealthyHobbyOption, event: Event) {
    event.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${hobby.title} (Patient Explanation):\n${hobby.plainLanguageSummary}\n\nRecommended Schedule: ${hobby.recommendedCadence}`);
      this.toastMessage.set(`Copied Plain-Language explanation for "${hobby.title}" to clipboard!`);
      setTimeout(() => this.toastMessage.set(null), 3000);
    }
  }

  readAloud(text: string, event: Event) {
    event.stopPropagation();
    if (this.plainLanguageService.isSpeaking()) {
      this.plainLanguageService.stopSpeaking();
    } else {
      this.plainLanguageService.speakPlainLanguageSummary(text);
    }
  }
}
