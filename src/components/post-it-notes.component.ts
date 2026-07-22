import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';

export interface IPostItNote {
  id: string;
  title: string;
  category: 'happiness' | 'vagal_calm' | 'elixir' | 'longevity';
  text: string;
  color: 'yellow' | 'mint' | 'rose' | 'lavender';
  rotation: number; // e.g. -2, 1, 3 degrees
  pinnedArea?: string;
}

@Injectable({ providedIn: 'root' })
export class PostItService {
  notes = signal<IPostItNote[]>([
    {
      id: 'n1',
      title: '☀️ Morning Circadian Sun Reset',
      category: 'happiness',
      text: '15 mins outdoor sunlight within 30 min of waking to boost serotonin & anchor melatonin.',
      color: 'yellow',
      rotation: -2,
      pinnedArea: 'General Circadian'
    },
    {
      id: 'n2',
      title: '🫁 6.0 bpm Resonant Vagal Calm',
      category: 'vagal_calm',
      text: 'Inhale 5s, Exhale 5s for 5 minutes when feeling stress to boost HRV & calm amygdala.',
      color: 'mint',
      rotation: 2,
      pinnedArea: 'Vagus Nerve / Chest'
    },
    {
      id: 'n3',
      title: '🍵 Warm Ginger Jujube Elixir',
      category: 'elixir',
      text: 'Sip warm ginger jujube tea before 2 PM to kindle Agni and disperse Liver Qi stagnation.',
      color: 'rose',
      rotation: -1,
      pinnedArea: 'Spleen / Stomach'
    },
    {
      id: 'n4',
      title: '⌛ Multi-Generational Longevity Anchor',
      category: 'longevity',
      text: 'Every healthy choice today adds quality years to your family story (+7.2 QALYs).',
      color: 'lavender',
      rotation: 3,
      pinnedArea: 'Epigenetic Lineage'
    }
  ]);
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-post-it-notes',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in">
      
      <!-- Modal Container -->
      <div class="w-full max-w-5xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col font-['Inter']">
        
        <!-- Header -->
        <div class="p-6 bg-slate-50 dark:bg-zinc-850 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
              📌
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-zinc-100">3D Interactive Prescription Post-It Notes</h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">Tactile, printable visual sticky notes to pin to refrigerators or desks for maximum health & happiness</p>
            </div>
          </div>
          <button (click)="closeModal.emit()" class="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-2xl font-semibold p-1 cursor-pointer">
            &times;
          </button>
        </div>

        <!-- Main Body: Sticky Notes Board -->
        <div class="flex-1 p-6 overflow-y-auto bg-amber-500/5 dark:bg-zinc-950 flex flex-col space-y-6">
          
          <!-- Actions & Template Adders -->
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-4">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Templates:</span>
              <button (click)="addTemplate('sun')" class="px-2.5 py-1 text-xs font-bold rounded bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition cursor-pointer">
                + ☀️ Sun Reset
              </button>
              <button (click)="addTemplate('vagal')" class="px-2.5 py-1 text-xs font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 transition cursor-pointer">
                + 🫁 Vagal Calm
              </button>
              <button (click)="addTemplate('tea')" class="px-2.5 py-1 text-xs font-bold rounded bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200 transition cursor-pointer">
                + 🍵 Elixir Tea
              </button>
              <button (click)="addTemplate('hawking')" class="px-2.5 py-1 text-xs font-bold rounded bg-purple-100 text-purple-800 border border-purple-300 hover:bg-purple-200 transition cursor-pointer">
                + 🎵 Hawking / Stars
              </button>
              <button (click)="addTemplate('water')" class="px-2.5 py-1 text-xs font-bold rounded bg-cyan-100 text-cyan-800 border border-cyan-300 hover:bg-cyan-200 transition cursor-pointer">
                + 🌊 Lao Tzu Water
              </button>
            </div>

            <div class="flex items-center gap-2">
              <pocket-gull-button (click)="printNotes()" variant="primary" size="sm" icon="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z">
                Print Fridge Replica Sheet
              </pocket-gull-button>
            </div>
          </div>

          <!-- Sticky Notes Grid with 3D Tactile Styling -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-2">
            
            <div *ngFor="let note of notes(); let i = index" 
              [style.transform]="'rotate(' + note.rotation + 'deg)'"
              [class]="getColorClass(note.color)"
              class="relative p-5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border flex flex-col justify-between min-h-[220px] group cursor-grab">
              
              <!-- Tape Pin Top Header -->
              <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/40 dark:bg-black/30 backdrop-blur-sm rounded border border-white/60 shadow-sm transform -rotate-1"></div>

              <div class="space-y-3">
                <div class="flex items-start justify-between">
                  <h4 class="text-xs font-extrabold text-slate-900 leading-snug">{{ note.title }}</h4>
                  <button (click)="deleteNote(note.id)" class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-800 text-xs font-bold transition cursor-pointer">
                    &times;
                  </button>
                </div>
                
                <p class="text-xs text-slate-800 font-serif leading-relaxed">
                  {{ note.text }}
                </p>
              </div>

              <!-- Pin Location Badge -->
              <div class="pt-3 border-t border-slate-900/10 flex items-center justify-between text-[10px] font-bold text-slate-700">
                <span>📍 {{ note.pinnedArea || 'Body & Mind' }}</span>
                <span class="uppercase font-mono">Prescription Note</span>
              </div>

            </div>

          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 bg-slate-50 dark:bg-zinc-850 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-zinc-400">Print or pin these 3D Post-Its to fridge/desk for continuous health & happiness anchors</span>
          <pocket-gull-button (click)="closeModal.emit()" variant="secondary" size="sm">
            Close Notes
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
export class PostItNotesComponent {
  closeModal = output<void>();

  notes = signal<IPostItNote[]>([
    {
      id: 'n1',
      title: '☀️ Morning Circadian Sun Reset',
      category: 'happiness',
      text: '15 mins outdoor sunlight within 30 min of waking to boost serotonin & anchor melatonin.',
      color: 'yellow',
      rotation: -2,
      pinnedArea: 'General Circadian'
    },
    {
      id: 'n2',
      title: '🫁 6.0 bpm Resonant Vagal Calm',
      category: 'vagal_calm',
      text: 'Inhale 5s, Exhale 5s for 5 minutes when feeling stress to boost HRV & calm amygdala.',
      color: 'mint',
      rotation: 2,
      pinnedArea: 'Vagus Nerve / Chest'
    },
    {
      id: 'n3',
      title: '🍵 Warm Ginger Jujube Elixir',
      category: 'elixir',
      text: 'Sip warm ginger jujube tea before 2 PM to kindle Agni and disperse Liver Qi stagnation.',
      color: 'rose',
      rotation: -1,
      pinnedArea: 'Spleen / Stomach'
    },
    {
      id: 'n4',
      title: '⌛ Multi-Generational Longevity Anchor',
      category: 'longevity',
      text: 'Every healthy choice today adds quality years to your family story (+7.2 QALYs).',
      color: 'lavender',
      rotation: 3,
      pinnedArea: 'Epigenetic Lineage'
    }
  ]);

  getColorClass(color: string): string {
    switch (color) {
      case 'yellow': return 'bg-amber-100 text-amber-950 border-amber-300 shadow-amber-900/10';
      case 'mint': return 'bg-emerald-100 text-emerald-950 border-emerald-300 shadow-emerald-900/10';
      case 'rose': return 'bg-rose-100 text-rose-950 border-rose-300 shadow-rose-900/10';
      case 'lavender': return 'bg-purple-100 text-purple-950 border-purple-300 shadow-purple-900/10';
      default: return 'bg-amber-100 text-amber-950 border-amber-300';
    }
  }

  addTemplate(type: 'sun' | 'vagal' | 'tea' | 'hawking' | 'water') {
    const id = 'n_' + Date.now();
    if (type === 'sun') {
      this.notes.update(list => [...list, {
        id,
        title: '🌅 Morning Light Walk',
        category: 'happiness',
        text: 'Walk 10 mins outdoors in early morning light without sunglasses for peak alertness.',
        color: 'yellow',
        rotation: Math.floor(Math.random() * 6) - 3,
        pinnedArea: 'Circadian Eye Path'
      }]);
    } else if (type === 'vagal') {
      this.notes.update(list => [...list, {
        id,
        title: '🫁 Resonant Breathing Break',
        category: 'vagal_calm',
        text: 'Take 6 deep resonant breaths before meals to activate parasympathetic digestion.',
        color: 'mint',
        rotation: Math.floor(Math.random() * 6) - 3,
        pinnedArea: 'Vagus Nervous System'
      }]);
    } else if (type === 'tea') {
      this.notes.update(list => [...list, {
        id,
        title: '🍵 Warm Herbal Mineralization',
        category: 'elixir',
        text: 'Nettle & dandelion leaf infusion with lemon to support Liver Yang & mineral balance.',
        color: 'rose',
        rotation: Math.floor(Math.random() * 6) - 3,
        pinnedArea: 'Liver / Kidney Essence'
      }]);
    } else if (type === 'hawking') {
      this.notes.update(list => [...list, {
        id,
        title: '🎵 Look Up at the Stars',
        category: 'happiness',
        text: '"Look up at the stars and not down at your feet. Try to make sense of what you see." — Hawking / Coldplay',
        color: 'lavender',
        rotation: Math.floor(Math.random() * 6) - 3,
        pinnedArea: 'Prefrontal Cortex / Vision'
      }]);
    } else if (type === 'water') {
      this.notes.update(list => [...list, {
        id,
        title: '🌊 Be Like Water',
        category: 'vagal_calm',
        text: '"Be like water making its way through cracks. Adjust to the object and find a way through." — Lao Tzu / Bruce Lee',
        color: 'mint',
        rotation: Math.floor(Math.random() * 6) - 3,
        pinnedArea: 'Autonomic System / Liver Qi'
      }]);
    }
  }

  deleteNote(id: string) {
    this.notes.update(list => list.filter(n => n.id !== id));
  }

  printNotes() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
import { Injectable } from '@angular/core';
