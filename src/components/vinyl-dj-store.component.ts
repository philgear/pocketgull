import { Component, ChangeDetectionStrategy, signal, computed, output, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { PatientStateService } from '../services/patient-state.service';
import { ActuarialGleeAudioService, IGleeTrackFull } from '../services/actuarial-glee-audio.service';
import { SheetMusicNotationComponent } from './sheet-music-notation.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-vinyl-dj-store',
  standalone: true,
  imports: [
    CommonModule,
    PocketGullButtonComponent,
    PocketGullBadgeComponent,
    SheetMusicNotationComponent
  ],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in">
      
      <!-- Dieter Rams Braun Audio Console Shell -->
      <div class="w-full max-w-6xl max-h-[94vh] bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col font-['Inter'] pocket-gull-card">
        
        <!-- Header -->
        <div class="p-5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xl shadow-inner font-bold">
              📻
            </div>
            <div>
              <div class="flex items-center gap-2.5 font-mono">
                <h2 class="text-lg font-black tracking-wider uppercase text-zinc-900 dark:text-zinc-100">Actuarial Glee Vinyl Lounge & DJ Deck</h2>
                <pocket-gull-badge label="ANALOG 33/45 RPM DECK" severity="warning"></pocket-gull-badge>
              </div>
              <p class="text-xs text-zinc-600 dark:text-zinc-400 font-sans mt-0.5">Technics / Braun Functional Audio Station & Interactive Notation</p>
            </div>
          </div>

          <div class="flex items-center gap-3 font-mono">
            
            <!-- Master Mute Audio Toggle -->
            <button (click)="audioService.toggleMute()" 
              [class]="audioService.isMuted()
                ? 'px-3.5 py-1.5 rounded-lg bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/40 text-xs font-bold transition cursor-pointer hover:bg-orange-500/30'
                : 'px-3.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-bold transition cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-850'"
              [attr.aria-label]="audioService.isMuted() ? 'Unmute Audio' : 'Mute Audio'">
              <span>{{ audioService.isMuted() ? '🔇 Audio Muted' : '🔊 Sound On' }}</span>
            </button>

            <!-- Mode Switcher: Crate Digging vs DJ Booth -->
            <div class="flex rounded-lg bg-zinc-200 dark:bg-zinc-950 p-1 border border-zinc-300 dark:border-zinc-800">
              <button (click)="activeTab.set('crate')" 
                [class.bg-orange-500]="activeTab() === 'crate'"
                [class.text-zinc-950]="activeTab() === 'crate'"
                class="px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                📦 Record Crate
              </button>
              <button (click)="activeTab.set('turntable')" 
                [class.bg-orange-500]="activeTab() === 'turntable'"
                [class.text-zinc-950]="activeTab() === 'turntable'"
                class="px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                🎧 DJ Turntable
              </button>
            </div>

            <button (click)="closeLounge()" class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-2xl font-semibold p-1 cursor-pointer">
              &times;
            </button>
          </div>
        </div>

        <!-- Main Body -->
        <div class="flex-1 p-6 overflow-y-auto bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col space-y-6">
          
          <!-- TAB 1: Record Store Crate Digging View -->
          <div *ngIf="activeTab() === 'crate'" class="flex-1 flex flex-col space-y-6 font-mono">
            
            <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
              <div>
                <h3 class="text-xs font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400">Vinyl Record Store Bin</h3>
                <p class="text-xs text-zinc-600 dark:text-zinc-400 font-sans mt-0.5">Click any vinyl album sleeve to cue it onto the turntable deck</p>
              </div>
              <span class="text-xs text-zinc-600 dark:text-zinc-400">12 Progressive Regeneration Masters</span>
            </div>

            <!-- Crate Grid of Vinyl Albums -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              
              @for (track of orderedTracks(); track track.trackNumber; let i = $index) {
                <div (click)="cueTrackOnTurntable(i)"
                  class="group relative rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 hover:border-orange-500 transition-all duration-300 cursor-pointer shadow-md hover:-translate-y-1 sub-panel">
                  
                  <!-- Vinyl Sleeve Cover -->
                  <div class="aspect-square rounded-xl overflow-hidden relative shadow-md bg-white dark:bg-zinc-950 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                    <img src="/assets/images/actuarial_glee_vinyl_cover.png" alt="Vinyl Cover" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    
                    <!-- Vinyl Edge Ring peek -->
                    <div class="absolute -right-3 top-1/2 -translate-y-1/2 w-full h-full rounded-full bg-zinc-950 border-4 border-zinc-800 opacity-60 group-hover:opacity-90 group-hover:translate-x-2 transition duration-300 pointer-events-none"></div>

                    <!-- Track Badge -->
                    <span class="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono font-bold text-orange-400">
                      #{{ track.trackNumber }}
                    </span>
                  </div>

                  <div class="mt-3 space-y-0.5 font-sans">
                    <div class="text-xs font-bold text-zinc-900 dark:text-zinc-200 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400">{{ track.icon }} {{ track.title }}</div>
                    <div class="text-[10px] text-zinc-600 dark:text-zinc-400 truncate">{{ track.subtitle }}</div>
                  </div>

                  <div class="mt-2 flex items-center justify-between text-[9px] font-mono text-zinc-600 dark:text-zinc-400">
                    <span>+{{ track.qalyBonus }}y QALY</span>
                    <span>{{ track.bpm }} BPM</span>
                  </div>
                </div>
              }

            </div>

          </div>

          <!-- TAB 2: DJ Turntable & Music Video Station -->
          <div *ngIf="activeTab() === 'turntable'" class="flex-1 flex flex-col space-y-6">
            
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <!-- Left 7 Cols: 3D Turntable Deck -->
              <div class="lg:col-span-7 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center justify-between shadow-xl relative sub-panel">
                
                <!-- Deck Top Controls -->
                <div class="w-full flex items-center justify-between border-b border-zinc-800 pb-4 mb-4 font-mono">
                  <div class="flex items-center gap-3">
                    <span [class]="audioService.isPlaying() ? 'w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse' : 'w-2.5 h-2.5 rounded-full bg-zinc-700'"></span>
                    <span class="text-xs font-bold text-zinc-300 uppercase">Technics / Braun Healthspan Deck</span>
                  </div>

                  <!-- Speed Selector -->
                  <div class="flex items-center gap-2">
                    <button (click)="setRpm(33)" 
                      [class.bg-orange-500]="rpm() === 33" [class.text-zinc-950]="rpm() === 33"
                      class="px-2.5 py-1 text-[10px] font-bold rounded bg-zinc-950 text-zinc-400 hover:text-white cursor-pointer border border-zinc-800">
                      33 RPM (Vagal 0.85x)
                    </button>
                    <button (click)="setRpm(45)" 
                      [class.bg-orange-500]="rpm() === 45" [class.text-zinc-950]="rpm() === 45"
                      class="px-2.5 py-1 text-[10px] font-bold rounded bg-zinc-950 text-zinc-400 hover:text-white cursor-pointer border border-zinc-800">
                      45 RPM (Aerobic 1.15x)
                    </button>
                  </div>
                </div>

                <!-- 3D Spinning Vinyl Record & Tone-Arm -->
                <div class="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4">
                  
                  <!-- Spinning Vinyl Disk -->
                  <div [class.spin-active]="audioService.isPlaying()" 
                    [style.animation-duration]="rpm() === 45 ? '2s' : '3.5s'"
                    class="w-full h-full rounded-full bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 border-8 border-zinc-800 shadow-2xl flex items-center justify-center relative transition-transform duration-700">
                    
                    <!-- Vinyl Grooves -->
                    <div class="w-5/6 h-5/6 rounded-full border border-zinc-800/80 flex items-center justify-center">
                      <div class="w-4/5 h-4/5 rounded-full border border-zinc-800/60 flex items-center justify-center">
                        <div class="w-2/3 h-2/3 rounded-full border border-zinc-800/40 flex items-center justify-center">
                          
                          <!-- Center Label Art (Braun Matte Black/Orange) -->
                          <div class="w-24 h-24 rounded-full bg-zinc-950 border-2 border-orange-500/50 flex flex-col items-center justify-center text-center p-2">
                            <span class="text-lg">{{ selectedTrack().icon }}</span>
                            <span class="text-[9px] font-mono font-bold text-orange-400 truncate">SIDE A</span>
                            <span class="text-[8px] font-mono text-zinc-400 truncate">{{ selectedTrack().keySignature }}</span>
                          </div>

                        </div>
                      </div>
                    </div>

                    <!-- Center Spindle -->
                    <div class="absolute w-3 h-3 rounded-full bg-zinc-400 border border-zinc-600 shadow-inner"></div>
                  </div>

                  <!-- Tone Arm Needle -->
                  <div [class.needle-dropped]="audioService.isPlaying()" 
                    class="absolute top-0 right-4 w-6 h-36 origin-top-right transform rotate-[-25deg] transition-transform duration-500 pointer-events-none">
                    <div class="w-2 h-full bg-zinc-400 rounded-full shadow-md"></div>
                    <div class="absolute bottom-0 -left-1 w-4 h-6 bg-orange-500 rounded-sm"></div>
                  </div>

                </div>

                <!-- Turntable Play Controls & VU Meters -->
                <div class="w-full flex items-center justify-between pt-4 border-t border-zinc-800 mt-4 font-mono">
                  <!-- Analog VU Meters -->
                  <div class="flex items-center gap-3">
                    <div class="flex flex-col items-center">
                      <span class="text-[9px] text-zinc-500 uppercase">VU LEFT</span>
                      <div class="w-16 h-3 bg-zinc-950 rounded border border-zinc-800 p-0.5 flex items-center">
                        <div class="h-full bg-orange-500 rounded transition-all duration-150" [style.width.%]="audioService.isPlaying() && !audioService.isMuted() ? 75 : 5"></div>
                      </div>
                    </div>

                    <div class="flex flex-col items-center">
                      <span class="text-[9px] text-zinc-500 uppercase">VU RIGHT</span>
                      <div class="w-16 h-3 bg-zinc-950 rounded border border-zinc-800 p-0.5 flex items-center">
                        <div class="h-full bg-orange-500 rounded transition-all duration-150" [style.width.%]="audioService.isPlaying() && !audioService.isMuted() ? 85 : 5"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Cue & Play Button -->
                  <button (click)="togglePlay()" 
                    class="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg transition cursor-pointer flex items-center gap-2 border border-orange-400/50">
                    <span>{{ audioService.isPlaying() ? '⏸ Lift Needle' : '▶ Drop Needle & Play' }}</span>
                  </button>
                </div>

              </div>

              <!-- Right 5 Cols: Music Video Visualizer & Lyrics -->
              <div class="lg:col-span-5 bg-zinc-900 rounded-2xl border border-zinc-800 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                
                @if (selectedTrack(); as track) {
                  <div>
                    <div class="flex items-center gap-2.5 mb-2">
                      <span class="text-2xl">{{ track.icon }}</span>
                      <div>
                        <h4 class="text-base font-black text-white font-mono">Now Spinning: Track {{ track.trackNumber }}</h4>
                        <p class="text-xs text-zinc-400 font-sans">{{ track.title }}</p>
                      </div>
                    </div>

                    <div class="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 font-mono">
                      <div class="text-[10px] uppercase font-bold text-orange-400">Signal Spectrum Visualizer</div>
                      
                      <!-- Animated Audio Waves -->
                      <div class="h-16 flex items-end justify-center gap-1.5 p-2 bg-zinc-900 rounded-lg">
                        @for (bar of audioService.visualizerBars(); track $index) {
                          <div [style.height.%]="audioService.isPlaying() ? bar : 15"
                            class="w-2 bg-orange-500 rounded-t transition-all duration-200">
                          </div>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Backing Sheet Music Notation SVG Staff Component -->
                  <div class="my-3">
                    <app-sheet-music-notation 
                      [track]="track" 
                      [activeNoteIndex]="audioService.currentNoteIndex()"
                      [isPlaying]="audioService.isPlaying()">
                    </app-sheet-music-notation>
                  </div>

                  <div class="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>QALY Gain: <strong class="text-orange-400">+{{ track.qalyBonus }} years</strong></span>
                    <span>Speed: <strong class="text-zinc-200">{{ rpm() }} RPM ({{ rpm() === 45 ? '1.15x' : '0.85x' }})</strong></span>
                  </div>
                }

              </div>

            </div>

          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>Actuarial Glee Vinyl Lounge • Functional Audio Station</span>
          <pocket-gull-button (click)="closeLounge()" variant="secondary" size="sm">
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
export class VinylDjStoreComponent implements OnDestroy {
  closeModal = output<void>();

  audioService = inject(ActuarialGleeAudioService);
  state = inject(PatientStateService);

  activeTab = signal<'crate' | 'turntable'>('crate');
  selectedTrackIndex = signal<number>(0);
  rpm = signal<number>(33);

  orderedTracks = computed(() => {
    const philosophy = this.state.activePhilosophy();
    return [...this.audioService.gleeTracks].sort((a, b) => {
      if (a.paradigm === philosophy && b.paradigm !== philosophy) return -1;
      if (b.paradigm === philosophy && a.paradigm !== philosophy) return 1;
      return a.trackNumber - b.trackNumber;
    });
  });

  selectedTrack = computed(() => this.orderedTracks()[this.selectedTrackIndex()] || this.audioService.gleeTracks[0]);

  cueTrackOnTurntable(index: number) {
    this.selectedTrackIndex.set(index);
    this.activeTab.set('turntable');
    if (this.audioService.isPlaying()) {
      const speedMult = this.rpm() === 45 ? 1.15 : 0.85;
      this.audioService.playTrack(this.selectedTrack(), speedMult);
    }
  }

  setRpm(speed: number) {
    this.rpm.set(speed);
    if (this.audioService.isPlaying()) {
      const speedMult = speed === 45 ? 1.15 : 0.85;
      this.audioService.playTrack(this.selectedTrack(), speedMult);
    }
  }

  togglePlay() {
    if (this.audioService.isPlaying()) {
      this.audioService.stopTrack();
    } else {
      const speedMult = this.rpm() === 45 ? 1.15 : 0.85;
      this.audioService.playTrack(this.selectedTrack(), speedMult);
    }
  }

  closeLounge() {
    this.audioService.stopTrack();
    this.closeModal.emit();
  }

  ngOnDestroy() {
    this.audioService.stopTrack();
  }
}
