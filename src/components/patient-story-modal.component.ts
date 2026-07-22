import { Component, ChangeDetectionStrategy, signal, inject, output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { ClinicalStorytellingService, IPatientStory, IStoryAct } from '../services/clinical-storytelling.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-patient-story-modal',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in">
      
      <!-- Modal Container -->
      <div class="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col font-['Inter']">
        
        <!-- Header -->
        <div class="p-6 bg-slate-50 dark:bg-zinc-850 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-bold">
              📖
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-zinc-100">TED-Style Patient Hero Journey</h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">Transforming medical data into an empowering 3-Act story of healthspan renewal</p>
            </div>
          </div>
          <button (click)="closeModal.emit()" class="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-2xl font-semibold p-1 cursor-pointer">
            &times;
          </button>
        </div>

        <!-- Main Body: Story Content -->
        <div *ngIf="story() as currentStory" class="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-100/40 dark:bg-zinc-950">
          
          <!-- Story Header Card -->
          <div class="p-6 rounded-xl bg-gradient-to-br from-purple-900 to-slate-900 text-white shadow-md space-y-2">
            <span class="text-[10px] font-bold uppercase tracking-widest text-purple-300">Narrative Healthspan Synthesis</span>
            <h3 class="text-xl font-extrabold leading-snug">{{ currentStory.title }}</h3>
            <div class="flex items-center gap-4 text-xs text-purple-200 pt-2">
              <span>⏳ Bio-Age Delta: <strong>{{ currentStory.bioAgeDelta }} yrs</strong></span>
              <span>•</span>
              <span>📈 Projected QALY Gain: <strong>+{{ currentStory.projectedQaly }} Years</strong></span>
            </div>
          </div>

          <!-- Act Tabs -->
          <div class="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
            <button *ngFor="let act of currentStory.acts" 
              (click)="activeActIndex.set(act.actNumber - 1)"
              [class.bg-purple-600]="activeActIndex() === act.actNumber - 1"
              [class.text-white]="activeActIndex() === act.actNumber - 1"
              [class.bg-slate-200]="activeActIndex() !== act.actNumber - 1"
              [class.dark:bg-zinc-800]="activeActIndex() !== act.actNumber - 1"
              [class.text-slate-700]="activeActIndex() !== act.actNumber - 1"
              [class.dark:text-zinc-300]="activeActIndex() !== act.actNumber - 1"
              class="px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer">
              Act {{ act.actNumber }}
            </button>
          </div>

          <!-- Active Act Content Card -->
          <div *ngIf="currentStory.acts[activeActIndex()] as activeAct" class="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div>
              <span class="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">Chapter {{ activeAct.actNumber }}</span>
              <h4 class="text-base font-bold text-slate-900 dark:text-zinc-100">{{ activeAct.title }}</h4>
              <p class="text-xs text-slate-500 dark:text-zinc-400">{{ activeAct.subtitle }}</p>
            </div>

            <p class="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-serif">
              {{ activeAct.narrative }}
            </p>

            <div class="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs">
              <span class="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 block mb-0.5">💡 Key TED Insight</span>
              <p class="font-semibold text-purple-900 dark:text-purple-200">
                "{{ activeAct.keyInsight }}"
              </p>
            </div>
          </div>

        </div>

        <!-- Footer with Audio Controls -->
        <div class="p-4 bg-slate-50 dark:bg-zinc-850 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <pocket-gull-button 
              (click)="toggleAudio()" 
              [variant]="isSpeaking() ? 'danger' : 'primary'" 
              size="sm" 
              [icon]="isSpeaking() ? 'M6 6h12v12H6z' : 'M8 5v14l11-7z'">
              {{ isSpeaking() ? 'Pause Audio Story' : 'Play Audio Story (TED Voice)' }}
            </pocket-gull-button>
            <span *ngIf="isSpeaking()" class="text-xs text-purple-600 dark:text-purple-400 font-bold animate-pulse">
              🎙️ Narrating...
            </span>
          </div>

          <pocket-gull-button (click)="closeModal.emit()" variant="secondary" size="sm">
            Close Reader
          </pocket-gull-button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class PatientStoryModalComponent implements OnDestroy {
  closeModal = output<void>();
  private storytelling = inject(ClinicalStorytellingService);

  story = signal<IPatientStory>(this.storytelling.generatePatientStory());
  activeActIndex = signal<number>(0);
  isSpeaking = signal<boolean>(false);

  private synth: SpeechSynthesis | null = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  toggleAudio() {
    if (!this.synth) return;

    if (this.isSpeaking()) {
      this.synth.cancel();
      this.isSpeaking.set(false);
      return;
    }

    const activeAct = this.story().acts[this.activeActIndex()];
    const textToSpeak = `${activeAct.title}. ${activeAct.narrative}. Key Insight: ${activeAct.keyInsight}`;

    this.currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
    this.currentUtterance.rate = 0.95; // Warm, measured TED pace
    this.currentUtterance.pitch = 1.0;

    this.currentUtterance.onend = () => this.isSpeaking.set(false);
    this.currentUtterance.onerror = () => this.isSpeaking.set(false);

    this.synth.speak(this.currentUtterance);
    this.isSpeaking.set(true);
  }

  ngOnDestroy() {
    if (this.synth && this.isSpeaking()) {
      this.synth.cancel();
    }
  }
}
