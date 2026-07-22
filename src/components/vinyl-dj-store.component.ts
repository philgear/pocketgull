import { Component, ChangeDetectionStrategy, signal, computed, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { IGleeTrack } from './actuarial-glee-album.component';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-vinyl-dj-store',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent, PocketGullBadgeComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-2xl animate-in">
      
      <!-- Vinyl Lounge Glassmorphic Container -->
      <div class="w-full max-w-6xl max-h-[94vh] bg-stone-950/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col font-['Inter']">
        
        <!-- Retro Header -->
        <div class="p-5 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 border-b border-amber-500/20 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-2xl shadow-inner">
              📻
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-black tracking-wider uppercase text-amber-100">Actuarial Glee Vinyl Lounge & DJ Deck</h2>
                <pocket-gull-badge variant="warning" size="xs">ANALOG 33/45 RPM DECK</pocket-gull-badge>
              </div>
              <p class="text-xs text-amber-200/70">Record Store Crate Digging & Interactive Turntable Music Video Station</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Mode Switcher: Crate Digging vs DJ Booth -->
            <div class="flex rounded-lg bg-stone-950 p-1 border border-stone-800">
              <button (click)="activeTab.set('crate')" 
                [class.bg-amber-600]="activeTab() === 'crate'"
                [class.text-white]="activeTab() === 'crate'"
                class="px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer text-stone-400 hover:text-white">
                📦 Record Crate
              </button>
              <button (click)="activeTab.set('turntable')" 
                [class.bg-amber-600]="activeTab() === 'turntable'"
                [class.text-white]="activeTab() === 'turntable'"
                class="px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer text-stone-400 hover:text-white">
                🎧 DJ Turntable
              </button>
            </div>

            <button (click)="closeModal.emit()" class="text-stone-400 hover:text-white text-2xl font-semibold p-1 cursor-pointer">
              &times;
            </button>
          </div>
        </div>

        <!-- Main Body -->
        <div class="flex-1 p-6 overflow-y-auto bg-stone-950 text-stone-100 flex flex-col space-y-6">
          
          <!-- TAB 1: Record Store Crate Digging View -->
          <div *ngIf="activeTab() === 'crate'" class="flex-1 flex flex-col space-y-6">
            
            <div class="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <h3 class="text-sm font-extrabold uppercase tracking-widest text-amber-400">Vinyl Record Store Bin</h3>
                <p class="text-xs text-stone-400">Click any vinyl album sleeve to cue it onto the turntable deck</p>
              </div>
              <span class="text-xs font-mono text-amber-300">12 Progressive Regeneration Masters</span>
            </div>

            <!-- Crate Grid of Vinyl Albums -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              
              <div *ngFor="let track of orderedTracks(); let i = index" 
                (click)="cueTrackOnTurntable(i)"
                class="group relative rounded-2xl bg-stone-900 border border-stone-800 p-3 hover:border-amber-500 transition-all duration-300 cursor-pointer shadow-lg hover:-translate-y-1">
                
                <!-- Vinyl Sleeve Cover -->
                <div class="aspect-square rounded-xl overflow-hidden relative shadow-md bg-stone-950 flex items-center justify-center border border-stone-800">
                  <img src="/assets/images/actuarial_glee_vinyl_cover.png" alt="Vinyl Cover" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                  
                  <!-- Vinyl Edge Ring peek -->
                  <div class="absolute -right-3 top-1/2 -translate-y-1/2 w-full h-full rounded-full bg-stone-950 border-4 border-stone-800 opacity-60 group-hover:opacity-90 group-hover:translate-x-2 transition duration-300 pointer-events-none"></div>

                  <!-- Track Badge -->
                  <span class="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono font-bold text-amber-300">
                    #{{ track.trackNumber }}
                  </span>
                </div>

                <div class="mt-3 space-y-0.5">
                  <div class="text-xs font-bold text-stone-200 truncate group-hover:text-amber-300">{{ track.icon }} {{ track.title }}</div>
                  <div class="text-[10px] text-stone-400 truncate">{{ track.subtitle }}</div>
                </div>

                <div class="mt-2 flex items-center justify-between text-[9px] font-mono text-amber-400">
                  <span>+{{ track.qalyBonus }}y QALY</span>
                  <span>{{ track.bpm }} BPM</span>
                </div>
              </div>

            </div>

          </div>

          <!-- TAB 2: DJ Turntable & Music Video Station -->
          <div *ngIf="activeTab() === 'turntable'" class="flex-1 flex flex-col space-y-6">
            
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <!-- Left 7 Cols: 3D Turntable Deck -->
              <div class="lg:col-span-7 bg-stone-900 rounded-3xl border border-stone-800 p-6 flex flex-col items-center justify-between shadow-2xl relative">
                
                <!-- Deck Top Controls -->
                <div class="w-full flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
                  <div class="flex items-center gap-3">
                    <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="text-xs font-mono font-bold text-stone-300 uppercase">Technics 1200 Healthspan Deck</span>
                  </div>

                  <!-- Speed Selector -->
                  <div class="flex items-center gap-2">
                    <button (click)="rpm.set(33)" 
                      [class.bg-amber-600]="rpm() === 33" [class.text-white]="rpm() === 33"
                      class="px-2.5 py-1 text-[10px] font-mono font-bold rounded bg-stone-800 text-stone-400 hover:text-white cursor-pointer">
                      33 RPM (Vagal)
                    </button>
                    <button (click)="rpm.set(45)" 
                      [class.bg-amber-600]="rpm() === 45" [class.text-white]="rpm() === 45"
                      class="px-2.5 py-1 text-[10px] font-mono font-bold rounded bg-stone-800 text-stone-400 hover:text-white cursor-pointer">
                      45 RPM (Aerobic)
                    </button>
                  </div>
                </div>

                <!-- 3D Spinning Vinyl Record & Tone-Arm -->
                <div class="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4">
                  
                  <!-- Spinning Vinyl Disk -->
                  <div [class.spin-active]="isPlaying()" 
                    class="w-full h-full rounded-full bg-gradient-to-tr from-stone-950 via-stone-900 to-stone-950 border-8 border-stone-800 shadow-2xl flex items-center justify-center relative transition-transform duration-700">
                    
                    <!-- Vinyl Grooves -->
                    <div class="w-5/6 h-5/6 rounded-full border border-stone-800/80 flex items-center justify-center">
                      <div class="w-4/5 h-4/5 rounded-full border border-stone-800/60 flex items-center justify-center">
                        <div class="w-2/3 h-2/3 rounded-full border border-stone-800/40 flex items-center justify-center">
                          
                          <!-- Center Label Art -->
                          <div class="w-24 h-24 rounded-full bg-amber-500/20 border-2 border-amber-400/40 flex flex-col items-center justify-center text-center p-2">
                            <span class="text-lg">🕊️</span>
                            <span class="text-[9px] font-mono font-bold text-amber-200 truncate">SIDE A</span>
                            <span class="text-[8px] font-mono text-amber-400">ACTUARIAL</span>
                          </div>

                        </div>
                      </div>
                    </div>

                    <!-- Center Spindle -->
                    <div class="absolute w-3 h-3 rounded-full bg-slate-300 border border-slate-500 shadow-inner"></div>
                  </div>

                  <!-- Tone Arm Needle -->
                  <div [class.needle-dropped]="isPlaying()" 
                    class="absolute top-0 right-4 w-6 h-36 origin-top-right transform rotate-[-25deg] transition-transform duration-500 pointer-events-none">
                    <div class="w-2 h-full bg-slate-400 rounded-full shadow-lg"></div>
                    <div class="absolute bottom-0 -left-1 w-4 h-6 bg-amber-400 rounded-sm"></div>
                  </div>

                </div>

                <!-- Turntable Play Controls & VU Meters -->
                <div class="w-full flex items-center justify-between pt-4 border-t border-stone-800 mt-4">
                  <!-- Analog VU Meters -->
                  <div class="flex items-center gap-3">
                    <div class="flex flex-col items-center">
                      <span class="text-[9px] font-mono text-amber-400 uppercase">VU LEFT</span>
                      <div class="w-16 h-4 bg-stone-950 rounded border border-amber-900/60 p-0.5 flex items-center">
                        <div class="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded transition-all duration-150" [style.width.%]="isPlaying() ? 75 : 10"></div>
                      </div>
                    </div>

                    <div class="flex flex-col items-center">
                      <span class="text-[9px] font-mono text-amber-400 uppercase">VU RIGHT</span>
                      <div class="w-16 h-4 bg-stone-950 rounded border border-amber-900/60 p-0.5 flex items-center">
                        <div class="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded transition-all duration-150" [style.width.%]="isPlaying() ? 85 : 10"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Cue & Play Button -->
                  <button (click)="togglePlay()" 
                    class="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-600/30 transition cursor-pointer flex items-center gap-2">
                    <span>{{ isPlaying() ? '⏸ Lift Needle' : '▶ Drop Needle & Play' }}</span>
                  </button>
                </div>

              </div>

              <!-- Right 5 Cols: Music Video Visualizer & Lyrics -->
              <div class="lg:col-span-5 bg-stone-900 rounded-3xl border border-stone-800 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                
                @if (selectedTrack(); as track) {
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-2xl">{{ track.icon }}</span>
                      <div>
                        <h4 class="text-base font-black text-amber-100">Now Spinning: Track {{ track.trackNumber }}</h4>
                        <p class="text-xs text-amber-300 font-serif italic">{{ track.title }}</p>
                      </div>
                    </div>

                    <div class="mt-4 p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                      <div class="text-[10px] uppercase font-mono font-bold text-amber-400">Music Video Spectrum Visualizer</div>
                      
                      <!-- Animated Audio Waves -->
                      <div class="h-20 flex items-end justify-center gap-1.5 p-2 bg-black/60 rounded-xl">
                        <div *ngFor="let bar of [40, 75, 90, 60, 85, 95, 50, 70, 80, 100, 65, 45]" 
                          [style.height.%]="isPlaying() ? bar : 15"
                          class="w-2 bg-gradient-to-t from-amber-600 via-emerald-500 to-purple-400 rounded-t transition-all duration-200">
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Synchronized Lyric Display -->
                  <div class="my-4 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-center space-y-2">
                    <span class="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400">Duet Lyric Cue</span>
                    <p class="text-base font-serif italic font-bold text-amber-100 leading-snug">
                      "{{ track.lyrics[currentLyricIdx()]?.text || track.lyrics[0].text }}"
                    </p>
                  </div>

                  <!-- Grow-Thyself Biological Mechanism Liner Notes -->
                  <div class="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1">
                    <div class="flex items-center gap-1.5 text-[10px] font-mono font-bold text-purple-300 uppercase">
                      <span>🌱 Grow-Thyself Mechanism:</span>
                    </div>
                    <p class="text-[11px] text-purple-100/90 leading-snug">
                      Singing this track co-regulates vagal nerve parasympathetic outflow, reducing salivary cortisol and boosting endothelial nitric oxide synthesis for cell regeneration.
                    </p>
                  </div>

                  <div class="pt-4 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                    <span>QALY Healthspan Gain: <strong class="text-emerald-400">+{{ track.qalyBonus }} years</strong></span>
                    <span>Tempo: <strong class="text-amber-300">{{ track.bpm }} BPM</strong></span>
                  </div>
                }

              </div>

            </div>

          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>Actuarial Glee Vinyl Lounge • Analog Music Video & Turntable Station</span>
          <pocket-gull-button (click)="closeModal.emit()" variant="secondary" size="sm">
            Exit Vinyl Lounge
          </pocket-gull-button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .spin-active {
      animation: spin 3s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .needle-dropped {
      transform: rotate(0deg) !important;
    }
  `]
})
export class VinylDjStoreComponent {
  closeModal = output<void>();

  activeTab = signal<'crate' | 'turntable'>('crate');
  selectedTrackIndex = signal<number>(0);
  isPlaying = signal<boolean>(false);
  rpm = signal<number>(33);
  currentLyricIdx = signal<number>(0);

  readonly tracks: IGleeTrack[] = [
    {
      trackNumber: 1,
      title: 'Here Comes the Morning Light',
      subtitle: 'Circadian Sun Reset & Melatonin Awakening',
      paradigm: 'western',
      duetRoles: { roleA: 'Circadian Lead', roleB: 'Solar Harmony' },
      lyrics: [{ time: 0, role: 'Both', text: 'Step outside into the morning gold, 15 minutes as the story unfolds...' }],
      qalyBonus: 1.2,
      bpm: 108,
      icon: '☀️'
    },
    {
      trackNumber: 2,
      title: 'Inhale Five, Exhale Five',
      subtitle: '6.0 bpm Vagal Resonance & HRV Coherence',
      paradigm: 'western',
      duetRoles: { roleA: 'Vagus Lead', roleB: 'Resonating Echo' },
      lyrics: [{ time: 0, role: 'Both', text: 'Inhale deep for five slow counts, feel the peaceful peace that mounts...' }],
      qalyBonus: 1.5,
      bpm: 60,
      icon: '🫁'
    },
    {
      trackNumber: 3,
      title: 'Kindle the Agni Fire',
      subtitle: 'Ayurvedic Ama Detox & Metabolic Spark',
      paradigm: 'ayurvedic',
      duetRoles: { roleA: 'Agni Igniter', roleB: 'Doshic Balance' },
      lyrics: [{ time: 0, role: 'Both', text: 'Warm ginger tea before the noon, metabolic fire coming soon...' }],
      qalyBonus: 1.1,
      bpm: 95,
      icon: '🍵'
    },
    {
      trackNumber: 4,
      title: 'Be Like Water, Disperse the Qi',
      subtitle: 'TCM Liver Qi Flow & Emotional Fluidity',
      paradigm: 'eastern',
      duetRoles: { roleA: 'Flowing Water', roleB: 'Meridian Breeze' },
      lyrics: [{ time: 0, role: 'Both', text: 'Flow through obstacles without strain, smooth away the tension and the pain...' }],
      qalyBonus: 1.4,
      bpm: 72,
      icon: '🌊'
    },
    {
      trackNumber: 5,
      title: 'Ten Thousand Steps of Joy',
      subtitle: 'Mitochondrial Biogenesis & Aerobic Pulse',
      paradigm: 'western',
      duetRoles: { roleA: 'Stride Master', roleB: 'Rhythm Keeper' },
      lyrics: [{ time: 0, role: 'Both', text: 'Pacing steady through the park, walking bright into the spark...' }],
      qalyBonus: 1.3,
      bpm: 120,
      icon: '🚶'
    },
    {
      trackNumber: 6,
      title: 'Telomere Lullaby',
      subtitle: 'Epigenetic DNA Repair & Protection',
      paradigm: 'longevity',
      duetRoles: { roleA: 'Epigenetic Whisper', roleB: 'Telomerase Echo' },
      lyrics: [{ time: 0, role: 'Both', text: 'Deep restorative nightly sleep, promises our chromosomes keep...' }],
      qalyBonus: 1.6,
      bpm: 65,
      icon: '🧬'
    },
    {
      trackNumber: 7,
      title: 'Resveratrol & Golden Milk',
      subtitle: 'Sirtuin Activation & Cellular Defense',
      paradigm: 'longevity',
      duetRoles: { roleA: 'Sirtuin Lead', roleB: 'Curcumin Support' },
      lyrics: [{ time: 0, role: 'Both', text: 'Warm turmeric and golden spice, cellular protection extra nice...' }],
      qalyBonus: 1.0,
      bpm: 88,
      icon: '🍇'
    },
    {
      trackNumber: 8,
      title: 'Branch by Branch, We Prune the Risk',
      subtitle: 'Multi-Generational Pedigree Lineage Healing',
      paradigm: 'western',
      duetRoles: { roleA: 'Ancestral Gardener', roleB: 'Future Heritage' },
      lyrics: [{ time: 0, role: 'Both', text: 'Looking through the family tree, pruning risk for you and me...' }],
      qalyBonus: 1.8,
      bpm: 90,
      icon: '🌳'
    },
    {
      trackNumber: 9,
      title: 'Shen in Harmony',
      subtitle: 'TCM Mind Tranquilizing & Deep Rest',
      paradigm: 'eastern',
      duetRoles: { roleA: 'Tranquil Mind', roleB: 'Peaceful Spirit' },
      lyrics: [{ time: 0, role: 'Both', text: 'Calm the heart and settle the Shen, resting deeply once again...' }],
      qalyBonus: 1.2,
      bpm: 55,
      icon: '🧠'
    },
    {
      trackNumber: 10,
      title: 'Whole Foods, Pure Heart',
      subtitle: 'Metabolic Flexibility & Endothelial Glow',
      paradigm: 'ayurvedic',
      duetRoles: { roleA: 'Nourishment Lead', roleB: 'Vessel Harmony' },
      lyrics: [{ time: 0, role: 'Both', text: 'Rainbow colors on the plate, whole foods that we celebrate...' }],
      qalyBonus: 1.1,
      bpm: 100,
      icon: '🥑'
    },
    {
      trackNumber: 11,
      title: 'The Human Dignity Duet',
      subtitle: 'Social Gravitation & Parasympathetic Co-Regulation',
      paradigm: 'western',
      duetRoles: { roleA: 'Co-Regulator A', roleB: 'Co-Regulator B' },
      lyrics: [{ time: 0, role: 'Both', text: 'Side by side we sing as one, supporting until the day is done...' }],
      qalyBonus: 1.5,
      bpm: 80,
      icon: '🤝'
    },
    {
      trackNumber: 12,
      title: 'The Rejuvenated Horizon',
      subtitle: '+12.0 QALYs Victory Anthem for Generations',
      paradigm: 'longevity',
      duetRoles: { roleA: 'Victory Lead', roleB: 'Regeneration Chorus' },
      lyrics: [{ time: 0, role: 'Both', text: 'Twelve tracks sung and health restored, blessings of longevity poured...' }],
      qalyBonus: 2.0,
      bpm: 115,
      icon: '⌛'
    }
  ];

  state = inject(PatientStateService);

  orderedTracks = computed(() => {
    const philosophy = this.state.activePhilosophy();
    return [...this.tracks].sort((a, b) => {
      if (a.paradigm === philosophy && b.paradigm !== philosophy) return -1;
      if (b.paradigm === philosophy && a.paradigm !== philosophy) return 1;
      return a.trackNumber - b.trackNumber;
    });
  });

  selectedTrack = computed(() => this.orderedTracks()[this.selectedTrackIndex()] || this.tracks[0]);

  cueTrackOnTurntable(index: number) {
    this.selectedTrackIndex.set(index);
    this.activeTab.set('turntable');
    this.isPlaying.set(true);
  }

  togglePlay() {
    this.isPlaying.update(p => !p);
  }
}
