import { Component, ChangeDetectionStrategy, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';

export interface IGleeTrack {
  trackNumber: number;
  title: string;
  subtitle: string;
  paradigm: 'western' | 'eastern' | 'ayurvedic' | 'longevity';
  duetRoles: { roleA: string; roleB: string };
  lyrics: { time: number; role: 'A' | 'B' | 'Both'; text: string }[];
  qalyBonus: number;
  bpm: number;
  icon: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-actuarial-glee-album',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in">
      
      <!-- Container -->
      <div class="w-full max-w-5xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden flex flex-col font-['Inter']">
        
        <!-- Header -->
        <div class="p-6 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900 border-b border-purple-500/20 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-2xl font-bold shadow-inner">
              🎵
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-black tracking-tight text-white">Actuarial Glee: Progressive Regeneration</h2>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 font-mono font-bold uppercase">12-Track Duet Album</span>
              </div>
              <p class="text-xs text-purple-200/80">Interactive 2-Player Singalong Game for Epigenetic Healthspan & Joy</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Score & QALY Meter -->
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              <span>🕊️ Glee Points:</span>
              <span class="text-sm font-black text-emerald-400">{{ gleeScore() }}</span>
              <span class="text-[10px] text-emerald-200">(+{{ totalQalyGain().toFixed(1) }} QALYs)</span>
            </div>

            <button (click)="closeModal.emit()" class="text-slate-400 hover:text-white text-2xl font-semibold p-1 cursor-pointer">
              &times;
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 p-6 overflow-y-auto bg-slate-950 text-slate-100 flex flex-col md:flex-row gap-6">
          
          <!-- Left Column: 12 Tracklist Navigation -->
          <div class="w-full md:w-80 flex flex-col space-y-2 border-r border-slate-800 pr-0 md:pr-4">
            <h3 class="text-xs font-mono uppercase tracking-widest text-purple-400 mb-2">12-Track Regeneration Album</h3>
            
            <div class="flex-1 overflow-y-auto space-y-2 max-h-[60vh] pr-1">
              <button *ngFor="let track of tracks; let i = index"
                (click)="selectTrack(i)"
                [class.border-purple-500]="selectedTrackIndex() === i"
                [class.bg-purple-950\/40]="selectedTrackIndex() === i"
                [class.text-purple-200]="selectedTrackIndex() === i"
                class="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-850 transition flex items-center justify-between group cursor-pointer">
                
                <div class="flex items-center gap-3 min-w-0">
                  <span class="text-sm font-mono font-bold text-slate-500 group-hover:text-purple-400">#{{ track.trackNumber }}</span>
                  <div class="min-w-0">
                    <div class="text-xs font-bold text-slate-200 truncate group-hover:text-white">{{ track.icon }} {{ track.title }}</div>
                    <div class="text-[10px] text-slate-400 truncate">{{ track.subtitle }}</div>
                  </div>
                </div>

                <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 shrink-0">
                  +{{ track.qalyBonus }}y
                </span>
              </button>
            </div>
          </div>

          <!-- Right Column: Interactive Singalong Game Player -->
          <div class="flex-1 flex flex-col space-y-6">
            
            @if (activeTrack(); as track) {
              <!-- Player Banner -->
              <div class="p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 via-slate-900 to-indigo-950 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-2xl">{{ track.icon }}</span>
                    <h3 class="text-lg font-black text-white">Track {{ track.trackNumber }}: {{ track.title }}</h3>
                  </div>
                  <p class="text-xs text-purple-300 font-serif italic">{{ track.subtitle }}</p>
                </div>

                <!-- Game Controls -->
                <div class="flex items-center gap-3">
                  <button (click)="togglePlay()" 
                    class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 transition cursor-pointer">
                    <span>{{ isPlaying() ? '⏸ Pause Singalong' : '▶ Play Duet Singalong' }}</span>
                  </button>
                </div>
              </div>

              <!-- Interactive Duet Roles Banner -->
              <div class="grid grid-cols-2 gap-4 text-center">
                <div class="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30">
                  <div class="text-[10px] uppercase font-mono font-bold text-blue-400">Singer A (Lead)</div>
                  <div class="text-xs font-bold text-blue-200 mt-0.5">{{ track.duetRoles.roleA }}</div>
                </div>

                <div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  <div class="text-[10px] uppercase font-mono font-bold text-emerald-400">Singer B (Harmony)</div>
                  <div class="text-xs font-bold text-emerald-200 mt-0.5">{{ track.duetRoles.roleB }}</div>
                </div>
              </div>

              <!-- Interactive Synchronized Lyric Display with Bouncing Gull -->
              <div class="flex-1 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center space-y-6 relative overflow-hidden min-h-[220px]">
                
                <!-- Bouncing Seagull Karaoke Ball 🕊️ -->
                <div class="flex items-center justify-center text-3xl animate-bounce mb-2">
                  🕊️
                </div>

                <!-- Active Lyric Prompt -->
                <div class="text-center space-y-2 max-w-xl">
                  <div class="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full inline-block"
                    [class.bg-blue-500\/20]="currentRole() === 'A'"
                    [class.text-blue-300]="currentRole() === 'A'"
                    [class.bg-emerald-500\/20]="currentRole() === 'B'"
                    [class.text-emerald-300]="currentRole() === 'B'"
                    [class.bg-purple-500\/20]="currentRole() === 'Both'"
                    [class.text-purple-300]="currentRole() === 'Both'">
                    Role: {{ currentRole() === 'A' ? 'Singer A' : (currentRole() === 'B' ? 'Singer B' : 'DUET HARMONY (BOTH)') }}
                  </div>

                  <p class="text-lg md:text-xl font-bold font-serif leading-relaxed text-white">
                    "{{ currentLyricText() }}"
                  </p>
                </div>

                <!-- Singalong Feedback Progress Bar -->
                <div class="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300" [style.width.%]="songProgress()"></div>
                </div>
              </div>
            }

          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Singing together co-regulates autonomic vagal tone (+12.0 QALYs total album recovery)</span>
          <pocket-gull-button (click)="closeModal.emit()" variant="secondary" size="sm">
            Close Singalong Game
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
export class ActuarialGleeAlbumComponent {
  closeModal = output<void>();

  selectedTrackIndex = signal<number>(0);
  isPlaying = signal<boolean>(false);
  currentLyricIndex = signal<number>(0);
  gleeScore = signal<number>(450);

  readonly tracks: IGleeTrack[] = [
    {
      trackNumber: 1,
      title: 'Here Comes the Morning Light',
      subtitle: 'Circadian Sun Reset & Melatonin Awakening',
      paradigm: 'western',
      duetRoles: { roleA: 'Circadian Rhythm Lead', roleB: 'Solar Harmony' },
      lyrics: [
        { time: 0, role: 'A', text: 'Step outside into the morning gold, 15 minutes as the story unfolds...' },
        { time: 5, role: 'B', text: 'Melatonin drops, serotonin soars, nature opens up circadian doors!' },
        { time: 10, role: 'Both', text: 'Here comes the sun, kindling our light, everything is gonna be all right!' }
      ],
      qalyBonus: 1.2,
      bpm: 108,
      icon: '☀️'
    },
    {
      trackNumber: 2,
      title: 'Inhale Five, Exhale Five',
      subtitle: '6.0 bpm Vagal Resonance & HRV Coherence',
      paradigm: 'western',
      duetRoles: { roleA: 'Vagus Breath Lead', roleB: 'Resonating Echo' },
      lyrics: [
        { time: 0, role: 'A', text: 'Inhale deep for five slow counts, feel the peaceful peace that mounts...' },
        { time: 5, role: 'B', text: 'Exhale smooth for five counts more, calm the heart right to the core!' },
        { time: 10, role: 'Both', text: 'Resonant breath, six beats a minute, life is rich with calm within it!' }
      ],
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
      lyrics: [
        { time: 0, role: 'A', text: 'Warm ginger tea before the noon, metabolic fire coming soon...' },
        { time: 5, role: 'B', text: 'Clear out Ama, nourish the cell, every organ is feeling well!' },
        { time: 10, role: 'Both', text: 'Kindle the flame of health today, Ayurvedic strength is on its way!' }
      ],
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
      lyrics: [
        { time: 0, role: 'A', text: 'Flow through obstacles without strain, smooth away the tension and the pain...' },
        { time: 5, role: 'B', text: 'Liver Qi flows free and clear, harmony is present here!' },
        { time: 10, role: 'Both', text: 'Be like water, calm and free, in rhythm with eternity!' }
      ],
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
      lyrics: [
        { time: 0, role: 'A', text: 'Pacing steady through the park, walking bright into the spark...' },
        { time: 5, role: 'B', text: 'Mitochondria multiply, healthspan climbing to the sky!' },
        { time: 10, role: 'Both', text: 'Ten thousand steps with joy in stride, longevity is by our side!' }
      ],
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
      lyrics: [
        { time: 0, role: 'A', text: 'Deep restorative nightly sleep, promises our chromosomes keep...' },
        { time: 5, role: 'B', text: 'Protecting caps on every strand, living longer in the land!' },
        { time: 10, role: 'Both', text: 'Sing the telomere lullaby, years of quality pass us by!' }
      ],
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
      lyrics: [
        { time: 0, role: 'A', text: 'Warm turmeric and golden spice, cellular protection extra nice...' },
        { time: 5, role: 'B', text: 'NAD+ fuels the sirtuin key, feeling vibrant, young, and free!' },
        { time: 10, role: 'Both', text: 'Golden milk in every cup, building our longevity up!' }
      ],
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
      lyrics: [
        { time: 0, role: 'A', text: 'Looking through the family tree, pruning risk for you and me...' },
        { time: 5, role: 'B', text: 'Pre-conception choices bright, giving future generations light!' },
        { time: 10, role: 'Both', text: 'Branch by branch we heal today, a legacy that is here to stay!' }
      ],
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
      lyrics: [
        { time: 0, role: 'A', text: 'Calm the heart and settle the Shen, resting deeply once again...' },
        { time: 5, role: 'B', text: 'Quiet thoughts and peaceful eyes, wisdom beneath starry skies!' },
        { time: 10, role: 'Both', text: 'Shen in harmony tonight, waking up with clear insight!' }
      ],
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
      lyrics: [
        { time: 0, role: 'A', text: 'Rainbow colors on the plate, whole foods that we celebrate...' },
        { time: 5, role: 'B', text: 'Endothelium smooth and clean, health control like a machine!' },
        { time: 10, role: 'Both', text: 'Whole foods, pure heart, every day, vitality the natural way!' }
      ],
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
      lyrics: [
        { time: 0, role: 'A', text: 'Side by side we sing as one, supporting until the day is done...' },
        { time: 5, role: 'B', text: 'Vagal tone in harmony, bound together, you and me!' },
        { time: 10, role: 'Both', text: 'Human dignity we hold, stories of health and joy retold!' }
      ],
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
      lyrics: [
        { time: 0, role: 'A', text: 'Twelve tracks sung and health restored, blessings of longevity poured...' },
        { time: 5, role: 'B', text: 'Twelve QALY years of extra life, free from preventable illness and strife!' },
        { time: 10, role: 'Both', text: 'Onward to the horizon bright, living long in health and light!' }
      ],
      qalyBonus: 2.0,
      bpm: 115,
      icon: '⌛'
    }
  ];

  activeTrack = computed(() => this.tracks[this.selectedTrackIndex()]);
  totalQalyGain = computed(() => this.tracks.reduce((acc, t) => acc + t.qalyBonus, 0));

  currentLyricText = computed(() => {
    const track = this.activeTrack();
    const idx = this.currentLyricIndex();
    return track.lyrics[idx]?.text || track.lyrics[0].text;
  });

  currentRole = computed(() => {
    const track = this.activeTrack();
    const idx = this.currentLyricIndex();
    return track.lyrics[idx]?.role || 'Both';
  });

  songProgress = computed(() => {
    const track = this.activeTrack();
    return ((this.currentLyricIndex() + 1) / track.lyrics.length) * 100;
  });

  selectTrack(index: number) {
    this.selectedTrackIndex.set(index);
    this.currentLyricIndex.set(0);
    this.isPlaying.set(false);
  }

  togglePlay() {
    this.isPlaying.update(p => !p);
    if (this.isPlaying()) {
      this.gleeScore.update(s => s + 50);
      // Advance lyrics on timer interval
      const track = this.activeTrack();
      const interval = setInterval(() => {
        if (!this.isPlaying()) {
          clearInterval(interval);
          return;
        }
        this.currentLyricIndex.update(idx => (idx + 1) % track.lyrics.length);
      }, 4000);
    }
  }
}
