import { Component, ChangeDetectionStrategy, signal, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

export interface IAvianSinger {
  id: 'gulliver' | 'swoop' | 'sentinel' | 'scribes';
  name: string;
  role: string;
  icon: string;
  voiceName: string;
  vocalRange: string;
  pitch: number;
  rate: number;
  badgeColor: string;
}

export interface IShantyVerse {
  id: number;
  title: string;
  verseText: string;
  words: string[];
  bpm: number;
  clinicalTarget: string;
}

@Component({
  selector: 'app-shanty-karaoke-deck',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full mb-8 p-5 sm:p-7 bg-[#F9F3D9] dark:bg-zinc-950 text-[#1C1C1C] dark:text-zinc-100 rounded-2xl border-2 border-[#F6B12B] dark:border-[#F6B12B]/80 shadow-[4px_6px_0px_0px_rgba(28,28,28,0.85)] font-sans overflow-hidden pocket-gull-card">
      
      <!-- Background Texture & Papercraft Overlay -->
      <div class="absolute inset-0 opacity-15 pointer-events-none mix-blend-multiply bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:12px_12px]"></div>

      <!-- Top Header Banner -->
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b-2 border-dashed border-[#1C1C1C]/20 dark:border-zinc-800 font-mono">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-[#F6B12B] text-zinc-950 border-2 border-[#1C1C1C] flex items-center justify-center text-2xl shadow-[2px_2px_0px_0px_rgba(28,28,28,0.9)] animate-bounce shrink-0">
            🎙️
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono font-extrabold uppercase tracking-widest text-[#EF6658] dark:text-orange-400">Avian Multimodal Karaoke</span>
              <span class="text-xs px-2.5 py-0.5 rounded-md bg-[#2AA4A0] text-white font-bold tracking-wider uppercase border border-[#1C1C1C]">
                Duet Co-Regulation
              </span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 border border-[#1C1C1C] uppercase">
                Synchronized Singing
              </span>
            </div>
            <h3 class="text-lg sm:text-xl font-black uppercase tracking-tight text-[#1C1C1C] dark:text-zinc-100 mt-1">
              Avian Sea Shanty Karaoke & Duet Co-Singer Deck
            </h3>
            <p class="text-xs sm:text-sm text-[#1C1C1C]/70 dark:text-zinc-400 mt-0.5 font-sans leading-relaxed">
              Sing alongside an Avian persona. Follow the real-time word bouncing bar to align your breath, vagal tone, and voice.
            </p>
          </div>
        </div>

        <!-- Duet Master Play Button -->
        <button (click)="toggleKaraoke()"
          [class]="isPlaying()
            ? 'px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer border-2 border-[#1C1C1C] shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] flex items-center gap-2 font-mono'
            : 'px-5 py-3 rounded-xl bg-[#F6B12B] text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider transition hover:scale-105 active:scale-95 cursor-pointer border-2 border-[#1C1C1C] shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] flex items-center gap-2 font-mono'">
          <span>{{ isPlaying() ? '⏹ Pause Duet' : '▶ Start Duet Singalong' }}</span>
        </button>
           <!-- 1. Persona Duet/Choir Singer Selector -->
      <div class="relative z-10 mb-6 font-mono">
        <div class="flex items-center justify-between mb-2.5">
          <span class="text-xs font-black uppercase tracking-wider text-[#1C1C1C] dark:text-zinc-200">
            👥 Configure Co-Singer Avian Ensemble (Duo, Trio, Quartet):
          </span>
          <span class="text-xs text-[#1C1C1C]/60 dark:text-zinc-400">
            Active: <strong class="text-[#EF6658] dark:text-orange-400 uppercase font-black">{{ ensembleLabel() }}</strong>
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          @for (singer of availableSingers; track singer.id) {
            <button type="button" (click)="toggleSinger(singer.id)"
              [class]="selectedSingerIds().has(singer.id)
                ? 'p-3 rounded-xl bg-[#F6B12B] text-zinc-950 border-2 border-[#1C1C1C] shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] scale-[1.02]'
                : 'p-3 rounded-xl bg-white dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-200 border-2 border-[#1C1C1C] hover:bg-[#F6B12B]/20 shadow-[2px_2px_0px_0px_rgba(28,28,28,0.8)] sub-panel'"
              class="flex items-center gap-2.5 transition-all cursor-pointer text-left">
              <div class="w-9 h-9 rounded-lg bg-white dark:bg-zinc-950 border border-[#1C1C1C] flex items-center justify-center text-lg shrink-0">
                {{ singer.icon }}
              </div>
              <div class="overflow-hidden">
                <span class="block text-xs font-black uppercase truncate">{{ singer.name }}</span>
                <span class="block text-[10px] opacity-75 font-semibold truncate">{{ singer.vocalRange }}</span>
              </div>
            </button>
          }
        </div>
      <!-- Instrument Accompaniment Selector -->
      <div class="relative z-10 mb-6 font-mono">
        <div class="flex items-center justify-between mb-2.5">
          <span class="text-xs font-black uppercase tracking-wider text-[#1C1C1C] dark:text-zinc-200">
            🎻 Instrument Accompaniment / Orchestra Backing:
          </span>
          <span class="text-xs text-[#1C1C1C]/60 dark:text-zinc-400">
            Current: <strong class="text-[#2AA4A0] uppercase font-black">{{ activeInstrument() }}</strong>
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button type="button" (click)="setInstrument('none')"
            [class]="activeInstrument() === 'none'
              ? 'p-2.5 rounded-xl bg-[#2AA4A0] text-white border-2 border-[#1C1C1C] shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] scale-[1.02] font-bold text-xs uppercase'
              : 'p-2.5 rounded-xl bg-white dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-200 border-2 border-[#1C1C1C] hover:bg-[#2AA4A0]/20 shadow-[1px_1.5px_0px_0px_rgba(28,28,28,0.8)] text-xs font-bold uppercase cursor-pointer'">
            🤐 A Cappella (None)
          </button>
          <button type="button" (click)="setInstrument('drone')"
            [class]="activeInstrument() === 'drone'
              ? 'p-2.5 rounded-xl bg-[#2AA4A0] text-white border-2 border-[#1C1C1C] shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] scale-[1.02] font-bold text-xs uppercase'
              : 'p-2.5 rounded-xl bg-white dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-200 border-2 border-[#1C1C1C] hover:bg-[#2AA4A0]/20 shadow-[1px_1.5px_0px_0px_rgba(28,28,28,0.8)] text-xs font-bold uppercase cursor-pointer'">
            🧘 Vagal Healing Drone
          </button>
          <button type="button" (click)="setInstrument('accordion')"
            [class]="activeInstrument() === 'accordion'
              ? 'p-2.5 rounded-xl bg-[#2AA4A0] text-white border-2 border-[#1C1C1C] shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] scale-[1.02] font-bold text-xs uppercase'
              : 'p-2.5 rounded-xl bg-white dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-200 border-2 border-[#1C1C1C] hover:bg-[#2AA4A0]/20 shadow-[1px_1.5px_0px_0px_rgba(28,28,28,0.8)] text-xs font-bold uppercase cursor-pointer'">
            🪗 Sea Accordion
          </button>
          <button type="button" (click)="setInstrument('guitar')"
            [class]="activeInstrument() === 'guitar'
              ? 'p-2.5 rounded-xl bg-[#2AA4A0] text-white border-2 border-[#1C1C1C] shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] scale-[1.02] font-bold text-xs uppercase'
              : 'p-2.5 rounded-xl bg-white dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-200 border-2 border-[#1C1C1C] hover:bg-[#2AA4A0]/20 shadow-[1px_1.5px_0px_0px_rgba(28,28,28,0.8)] text-xs font-bold uppercase cursor-pointer'">
            🎸 Plucked Guitar
          </button>
        </div>
      </div>

      <!-- 2. Interactive Karaoke Display Box with Bouncing Ball Line -->
      <div class="relative z-10 p-6 rounded-2xl border-2 border-[#1C1C1C] bg-white dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] mb-6 sub-panel font-mono">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#1C1C1C] pb-3 mb-5">
          <div class="flex items-center gap-2">
            <span class="text-lg">🎶</span>
            <span class="text-xs font-black uppercase text-[#1C1C1C] dark:text-zinc-100">{{ currentVerse().title }}</span>
            <span class="text-[10px] px-2 py-0.5 rounded-md bg-[#2AA4A0] text-white font-bold uppercase">Verse {{ currentVerseIndex() + 1 }} of {{ shantyVerses.length }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-[#1C1C1C]/60 dark:text-zinc-400">Target: <strong class="text-[#1C1C1C] dark:text-zinc-200">{{ currentVerse().clinicalTarget }}</strong></span>
          </div>
        </div>

        <!-- Main Karaoke Text Line with Bouncing Note Indicator -->
        <div class="py-6 px-4 rounded-xl bg-[#FAF7EE] dark:bg-zinc-950 border-2 border-[#1C1C1C] my-2 text-center relative overflow-hidden">
          
          <!-- Animated Timing Bar Top (Dieter Rams Squared) -->
          <div class="w-full bg-zinc-200 dark:bg-zinc-800 rounded-md h-2 mb-6 overflow-hidden border border-[#1C1C1C]">
            <div class="bg-[#EF6658] h-full transition-all duration-300 rounded-sm" [style.width.%]="karaokeProgress()"></div>
          </div>

          <!-- Bouncing Avian Note Indicator above Active Word -->
          <div class="flex justify-center flex-wrap gap-2 text-base sm:text-xl md:text-2xl font-black font-serif leading-relaxed">
            @for (word of currentVerse().words; track $index) {
              <div class="relative inline-flex flex-col items-center">
                
                <!-- Bouncing Note Icon over current word -->
                @if (activeWordIndex() === $index && isPlaying()) {
                  <span class="absolute -top-7 text-sm animate-bounce text-[#EF6658] flex gap-1 justify-center z-20">
                    @for (singer of activeSingers(); track singer.id) {
                      <span class="px-1 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-[#1C1C1C] shadow-xs text-xs">{{ singer.icon }}</span>
                    }
                  </span>
                }

                <!-- Karaoke Word Pill -->
                <span 
                  [class.bg-[#F6B12B]]="activeWordIndex() === $index"
                  [class.text-zinc-950]="activeWordIndex() === $index"
                  [class.border-2]="activeWordIndex() === $index"
                  [class.border-[#1C1C1C]]="activeWordIndex() === $index"
                  [class.shadow-[2px_2px_0px_0px_rgba(28,28,28,0.9)]]="activeWordIndex() === $index"
                  [class.scale-110]="activeWordIndex() === $index"
                  [class.opacity-40]="$index < activeWordIndex()"
                  [class.opacity-90]="$index > activeWordIndex()"
                  class="px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer">
                  {{ word }}
                </span>
              </div>
            }
            </div>

          <!-- Real-time Voice Matching Visualizer -->
          <div class="mt-5 p-4 rounded-xl border-2 border-[#1C1C1C] bg-[#FAF7EE] dark:bg-zinc-950 font-mono text-xs flex flex-col gap-3">
            <div class="flex items-center justify-between border-b border-[#1C1C1C]/15 pb-2">
              <span class="font-black text-[11px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">🎙️ Real-time Duet Voice Biofeedback</span>
              @if (!isPlaying()) {
                <span class="text-[10px] text-zinc-400">Standby (Playback Inactive)</span>
              } @else {
                <span class="text-emerald-500 font-bold animate-pulse flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Mic Analyzing...
                </span>
              }
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Pitch Comparison -->
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between items-baseline">
                  <span class="font-bold text-zinc-700 dark:text-zinc-300">Pitch Alignment:</span>
                  <span class="font-mono text-zinc-500 text-[10px]">{{ userPitch() > 0 ? userPitch() + ' Hz' : '--' }}</span>
                </div>
                <div class="p-2.5 rounded-lg border-2 border-[#1C1C1C] bg-white dark:bg-zinc-900 flex items-center justify-between">
                  @if (!isPlaying() || pitchDirection() === 'silent') {
                    <span class="text-zinc-400">Please start singing...</span>
                  } @else if (pitchDirection() === 'higher') {
                    <span class="text-rose-500 font-black flex items-center gap-1">⬆️ Sing Higher (Flat)</span>
                  } @else if (pitchDirection() === 'lower') {
                    <span class="text-orange-500 font-black flex items-center gap-1">⬇️ Sing Lower (Sharp)</span>
                  } @else {
                    <span class="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">🎯 Harmonized Perfect Match!</span>
                  }
                </div>
              </div>

              <!-- Volume Comparison -->
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between items-baseline">
                  <span class="font-bold text-zinc-700 dark:text-zinc-300">Vocal Power:</span>
                  <span class="font-mono text-zinc-500 text-[10px]">{{ userVolume() > 0 ? userVolume() + ' dB' : '--' }}</span>
                </div>
                <div class="p-2.5 rounded-lg border-2 border-[#1C1C1C] bg-white dark:bg-zinc-900 flex items-center justify-between">
                  @if (!isPlaying() || volumeDirection() === 'silent') {
                    <span class="text-zinc-400">Awaiting vocal signal...</span>
                  } @else if (volumeDirection() === 'louder') {
                    <span class="text-blue-500 font-black flex items-center gap-1">🔊 Project More (Sing Louder)</span>
                  } @else if (volumeDirection() === 'softer') {
                    <span class="text-amber-600 dark:text-amber-400 font-black flex items-center gap-1">🔉 Calm Down (Sing Softer)</span>
                  } @else {
                    <span class="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">🎯 Perfect Dynamic Balance!</span>
                  }
                </div>
              </div>

              <!-- Tempo / Rhythm Comparison -->
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between items-baseline">
                  <span class="font-bold text-zinc-700 dark:text-zinc-300">Tempo / Rhythm:</span>
                  <span class="font-mono text-zinc-500 text-[10px]">BPM Match</span>
                </div>
                <div class="p-2.5 rounded-lg border-2 border-[#1C1C1C] bg-white dark:bg-zinc-900 flex items-center justify-between">
                  @if (!isPlaying() || tempoDirection() === 'silent') {
                    <span class="text-zinc-400">Rhythm sync active...</span>
                  } @else if (tempoDirection() === 'faster') {
                    <span class="text-rose-500 font-black flex items-center gap-1">🐇 Catch Up (Sing Faster)</span>
                  } @else if (tempoDirection() === 'slower') {
                    <span class="text-orange-500 font-black flex items-center gap-1">🐢 Rushing (Sing Slower)</span>
                  } @else {
                    <span class="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">🎯 Perfect Rhythm Sync!</span>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Sing Along Prompt Banner -->
          <div class="mt-6 pt-3 border-t border-dashed border-[#1C1C1C]/20 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs font-mono">
            <span class="animate-pulse">🎙️</span>
            <span class="font-bold text-[#1C1C1C]/70 dark:text-zinc-400">
              {{ isPlaying() ? 'SING NOW: ' + activeSingers()[0]?.name + (activeSingers().length > 1 ? ' ensemble' : '') + ' is singing alongside you!' : 'Press "Start Duet Singalong" to launch karaoke playback.' }}
            </span>
          </div>

        </div>

        <!-- Shanty Verse Selector Pills -->
        <div class="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <div class="flex flex-wrap items-center gap-2">
            @for (v of shantyVerses; track v.id) {
              <button type="button" (click)="selectVerse(v.id - 1)"
                [class.bg-[#F6B12B]]="currentVerseIndex() === v.id - 1"
                [class.text-zinc-950]="currentVerseIndex() === v.id - 1"
                [class.bg-zinc-100]="currentVerseIndex() !== v.id - 1"
                [class.dark:bg-zinc-800]="currentVerseIndex() !== v.id - 1"
                [class.text-zinc-800]="currentVerseIndex() !== v.id - 1"
                [class.dark:text-zinc-200]="currentVerseIndex() !== v.id - 1"
                class="px-3 py-1.5 rounded-lg border border-[#1C1C1C] text-xs font-black uppercase transition-all cursor-pointer">
                Verse {{ v.id }}
              </button>
            }
          </div>

          <button (click)="nextVerse()"
            class="px-3.5 py-1.5 rounded-lg border-2 border-[#1C1C1C] bg-white dark:bg-zinc-800 text-[#1C1C1C] dark:text-zinc-100 text-xs font-black uppercase transition hover:scale-105 cursor-pointer shadow-[2px_2px_0px_0px_rgba(28,28,28,0.8)]">
            Next Verse ➔
          </button>
        </div>

      </div>

    </div>
  `
})
export class ShantyKaraokeDeckComponent implements OnDestroy {
  protected readonly patientState = inject(PatientStateService);

  readonly availableSingers: IAvianSinger[] = [
    {
      id: 'gulliver',
      name: 'Gulliver 🔭',
      role: 'Baritone Anchor',
      icon: '🔭',
      voiceName: 'Gulliver (Baritone)',
      vocalRange: 'Deep Baritone',
      pitch: 0.7,
      rate: 0.85,
      badgeColor: 'bg-[#8B5CF6]'
    },
    {
      id: 'swoop',
      name: 'Swoop ⚡',
      role: 'Tenor Aviator',
      icon: '⚡',
      voiceName: 'Swoop (Tenor)',
      vocalRange: 'Brisk Tenor',
      pitch: 1.25,
      rate: 1.1,
      badgeColor: 'bg-[#F6B12B]'
    },
    {
      id: 'sentinel',
      name: 'Sentinel 🔦',
      role: 'Alto Guardian',
      icon: '🔦',
      voiceName: 'Sentinel (Alto)',
      vocalRange: 'Resonant Alto',
      pitch: 0.95,
      rate: 0.9,
      badgeColor: 'bg-[#3B82F6]'
    },
    {
      id: 'scribes',
      name: 'Scribes 📖',
      role: 'Soprano Archivist',
      icon: '📖',
      voiceName: 'Scribes (Soprano)',
      vocalRange: 'Melodic Soprano',
      pitch: 1.45,
      rate: 1.0,
      badgeColor: 'bg-[#10B981]'
    }
  ];

  readonly shantyVerses: IShantyVerse[] = [
    {
      id: 1,
      title: 'Vagal Breeze Sea Shanty',
      verseText: 'Heave ho, the vagal breeze! Calms the heart and heals disease!',
      words: ['Heave', 'ho,', 'the', 'vagal', 'breeze!', 'Calms', 'the', 'heart', 'and', 'heals', 'disease!'],
      bpm: 60,
      clinicalTarget: 'Parasympathetic Vagal Activation (60 bpm)'
    },
    {
      id: 2,
      title: 'Precision Dosing Sea Shanty',
      verseText: 'Spotted, locked, and clear the deck! Two healthy doses round your neck!',
      words: ['Spotted,', 'locked,', 'and', 'clear', 'the', 'deck!', 'Two', 'healthy', 'doses', 'round', 'your', 'neck!'],
      bpm: 65,
      clinicalTarget: 'Medication & Lifestyle Adherence'
    },
    {
      id: 3,
      title: 'Circadian Light Sea Shanty',
      verseText: 'Golden tea and circadian light! Restful sleep through all the night!',
      words: ['Golden', 'tea', 'and', 'circadian', 'light!', 'Restful', 'sleep', 'through', 'all', 'the', 'night!'],
      bpm: 58,
      clinicalTarget: 'Melatonin & Sleep Architecture'
    },
    {
      id: 4,
      title: 'QALY Expansion Sea Shanty',
      verseText: 'Keep your course and steady hand! QALY gains across the land!',
      words: ['Keep', 'your', 'course', 'and', 'steady', 'hand!', 'QALY', 'gains', 'across', 'the', 'land!'],
      bpm: 62,
      clinicalTarget: 'Epigenetic Longevity Expansion'
    }
  ];

  selectedSingerIds = signal<Set<string>>(new Set(['gulliver']));
  activeSingers = computed(() => this.availableSingers.filter(s => this.selectedSingerIds().has(s.id)));
  ensembleLabel = computed(() => {
    const size = this.selectedSingerIds().size;
    const names = Array.from(this.selectedSingerIds()).map(id => {
      const singer = this.availableSingers.find(s => s.id === id);
      return singer ? singer.name.split(' ')[0] : '';
    }).filter(Boolean).join(' + ');
    if (size === 1) return `Solo Duet (${names})`;
    if (size === 2) return `Duo Ensemble (${names})`;
    if (size === 3) return `Trio Harmony (${names})`;
    return `Quartet Choir (${names})`;
  });
  currentVerseIndex = signal<number>(0);
  activeWordIndex = signal<number>(0);
  isPlaying = signal<boolean>(false);

  // Real-time Voice Matching Signals
  userVolume = signal<number>(0);
  userPitch = signal<number>(0);
  pitchDirection = signal<'higher' | 'lower' | 'match' | 'silent'>('silent');
  volumeDirection = signal<'louder' | 'softer' | 'match' | 'silent'>('silent');
  tempoDirection = signal<'faster' | 'slower' | 'match' | 'silent'>('silent');
  activeInstrument = signal<'none' | 'drone' | 'accordion' | 'guitar'>('drone');

  currentVerse = computed(() => this.shantyVerses[this.currentVerseIndex()]);

  karaokeProgress = computed(() => {
    const total = this.currentVerse().words.length;
    if (total === 0) return 0;
    return ((this.activeWordIndex() + 1) / total) * 100;
  });

  private timerInterval: any = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private lastWordHighlightTime: number = 0;
  private instrumentNodes: AudioNode[] = [];

  toggleSinger(id: string) {
    this.selectedSingerIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    if (this.isPlaying()) {
      this.stopKaraoke();
      this.startKaraoke();
    }
  }

  selectVerse(index: number) {
    this.currentVerseIndex.set(index);
    this.activeWordIndex.set(0);
    if (this.isPlaying()) {
      this.stopKaraoke();
      this.startKaraoke();
    }
  }

  nextVerse() {
    const nextIdx = (this.currentVerseIndex() + 1) % this.shantyVerses.length;
    this.selectVerse(nextIdx);
  }

  toggleKaraoke() {
    if (this.isPlaying()) {
      this.stopKaraoke();
    } else {
      this.startKaraoke();
    }
  }

  startKaraoke() {
    this.isPlaying.set(true);
    this.activeWordIndex.set(0);
    this.lastWordHighlightTime = Date.now();

    const words = this.currentVerse().words;
    const singers = this.activeSingers();

    // Ensure AudioContext is ready for synthesized instruments
    if (typeof window !== 'undefined' && !this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // 1. Speak using Web Speech API if supported
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const voices = window.speechSynthesis.getVoices();
      
      singers.forEach((singer, index) => {
        const utterance = new SpeechSynthesisUtterance(this.currentVerse().verseText);
        utterance.pitch = singer.pitch;
        utterance.rate = singer.rate;
        if (voices.length > index) {
          utterance.voice = voices[index];
        }
        if (index === 0) {
          utterance.onend = () => {
            if (this.isPlaying()) {
              setTimeout(() => this.nextVerse(), 1200);
            }
          };
        }
        setTimeout(() => {
          if (this.isPlaying()) {
            window.speechSynthesis.speak(utterance);
          }
        }, index * 80);
      });
    }

    // 2. Synchronize word highlighting timer & trigger backing chord
    const intervalMs = Math.round(60000 / (this.currentVerse().bpm * 1.5));
    let step = 0;

    this.timerInterval = setInterval(() => {
      step++;
      this.lastWordHighlightTime = Date.now();
      if (step < words.length) {
        this.activeWordIndex.set(step);
        this.triggerInstrumentChord(step);
      } else {
        clearInterval(this.timerInterval);
      }
    }, intervalMs);

    // 3. Start Web Audio Mic Pitch and Volume analysis
    this.startVoiceAnalysis();

    // 4. Start sustained background instruments
    this.startInstrumentNotes();
  }

  stopKaraoke() {
    this.isPlaying.set(false);
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.stopInstrumentNotes();
    this.stopVoiceAnalysis();
  }

  async startVoiceAnalysis() {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const source = this.audioCtx.createMediaStreamSource(this.micStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);
      this.loopVoiceAnalysis();
    } catch (e) {
      console.warn('[Microphone Access Denied / Error]', e);
    }
  }

  stopVoiceAnalysis() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.audioCtx && this.instrumentNodes.length === 0) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.pitchDirection.set('silent');
    this.volumeDirection.set('silent');
    this.tempoDirection.set('silent');
    this.userVolume.set(0);
    this.userPitch.set(0);
  }

  private loopVoiceAnalysis() {
    if (!this.analyser) return;
    const bufferLength = this.analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    
    const analyze = () => {
      if (!this.isPlaying() || !this.analyser) return;
      
      this.analyser.getFloatTimeDomainData(dataArray);
      
      // Calculate volume (RMS)
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / bufferLength);
      const volumeDb = Math.max(0, Math.round(rms * 100 * 2)); // simple scale
      this.userVolume.set(volumeDb);

      // Auto-correlate to find dominant frequency (pitch detection)
      const pitch = this.autoCorrelate(dataArray, this.audioCtx!.sampleRate);
      if (pitch > -1) {
        this.userPitch.set(Math.round(pitch));
        
        // Avian Target Frequencies (averaged across active singers ensemble)
        const active = this.activeSingers();
        let targetMinSum = 0;
        let targetMaxSum = 0;
        active.forEach(singer => {
          let sMin = 110;
          let sMax = 150;
          if (singer.id === 'gulliver') { sMin = 90; sMax = 140; }
          else if (singer.id === 'swoop') { sMin = 200; sMax = 270; }
          else if (singer.id === 'sentinel') { sMin = 140; sMax = 200; }
          else if (singer.id === 'scribes') { sMin = 270; sMax = 380; }
          targetMinSum += sMin;
          targetMaxSum += sMax;
        });
        const targetMin = Math.round(targetMinSum / active.length);
        const targetMax = Math.round(targetMaxSum / active.length);

        if (pitch < targetMin) {
          this.pitchDirection.set('higher');
        } else if (pitch > targetMax) {
          this.pitchDirection.set('lower');
        } else {
          this.pitchDirection.set('match');
        }
      } else {
        this.pitchDirection.set('silent');
      }

      // Compare volume (volumeDb target around 15 - 45)
      if (volumeDb < 5) {
        this.volumeDirection.set('silent');
      } else if (volumeDb < 15) {
        this.volumeDirection.set('louder');
      } else if (volumeDb > 55) {
        this.volumeDirection.set('softer');
      } else {
        this.volumeDirection.set('match');
      }

      // Analyze tempo/rhythm matching
      if (volumeDb > 15) {
        const delta = Date.now() - this.lastWordHighlightTime;
        const intervalMs = Math.round(60000 / (this.currentVerse().bpm * 1.5));
        
        if (delta > intervalMs * 0.65) {
          this.tempoDirection.set('slower'); // singing too early / rushing into next word
        } else if (delta > 220) {
          this.tempoDirection.set('faster'); // lagging behind the bouncing ball
        } else {
          this.tempoDirection.set('match');
        }
      } else {
        this.tempoDirection.set('silent');
      }

      this.animationFrameId = requestAnimationFrame(analyze);
    };

    this.animationFrameId = requestAnimationFrame(analyze);
  }

  // Simple autocorrelation algorithm for pitch detection
  private autoCorrelate(buffer: Float32Array, sampleRate: number): number {
    let SIZE = buffer.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1; // signal is too weak

    let r1 = 0, r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
    }
    for (let i = SIZE - 1; i >= SIZE / 2; i--) {
      if (Math.abs(buffer[i]) < thres) { r2 = i; break; }
    }

    const buf = buffer.subarray(r1, r2);
    SIZE = buf.length;

    const c = new Float32Array(SIZE);
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] = c[i] + buf[j] * buf[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    let T0 = maxpos;
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  }

  setInstrument(inst: 'none' | 'drone' | 'accordion' | 'guitar') {
    this.activeInstrument.set(inst);
    if (this.isPlaying()) {
      this.stopInstrumentNotes();
      this.startInstrumentNotes();
    }
  }

  startInstrumentNotes() {
    if (!this.audioCtx || this.activeInstrument() === 'none') return;
    const t = this.audioCtx.currentTime;

    if (this.activeInstrument() === 'drone') {
      // Perfect fifth binaural co-regulation drone (110 Hz & 165 Hz)
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110, t);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(165, t);

      gainNode.gain.setValueAtTime(0.04, t);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc1.start(t);
      osc2.start(t);

      this.instrumentNodes.push(osc1, osc2, gainNode);
    } else if (this.activeInstrument() === 'accordion') {
      // Warm accordion bellows chord simulation running through a warm lowpass filter
      const frequencies = [110, 138.6, 165]; // A major triad
      const oscs = frequencies.map(freq => {
        const osc = this.audioCtx!.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        return osc;
      });

      const filterNode = this.audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(320, t);

      const gainNode = this.audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.02, t);

      oscs.forEach(osc => osc.connect(filterNode));
      filterNode.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      oscs.forEach(osc => osc.start(t));

      this.instrumentNodes.push(...oscs, filterNode, gainNode);
    }
  }

  stopInstrumentNotes() {
    this.instrumentNodes.forEach(node => {
      try {
        if (node instanceof OscillatorNode) {
          node.stop();
        }
        node.disconnect();
      } catch (e) {}
    });
    this.instrumentNodes = [];
  }

  triggerInstrumentChord(beatIndex: number) {
    if (!this.audioCtx || this.activeInstrument() === 'none') return;
    const t = this.audioCtx.currentTime;

    if (this.activeInstrument() === 'guitar') {
      // Guitar pluck sequence (Am, C, G, D chords) matching the shanty rhythm
      const chords = [
        [110, 165, 220, 261.6],
        [130.8, 164.8, 196, 261.6],
        [98, 146.8, 196, 293.7],
        [146.8, 220, 293.7, 369.9]
      ];
      const chord = chords[beatIndex % chords.length];
      chord.forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq * 1.5, t + idx * 0.04);
        gain.gain.setValueAtTime(0.04, t + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.4);
      });
    } else if (this.activeInstrument() === 'accordion') {
      // Modulate lowpass filter frequency and bellows volume dynamically per beat
      const gainNode = this.instrumentNodes.find(n => n instanceof GainNode) as GainNode;
      const filterNode = this.instrumentNodes.find(n => n instanceof BiquadFilterNode) as BiquadFilterNode;
      if (gainNode) {
        gainNode.gain.setValueAtTime(0.02, t);
        gainNode.gain.linearRampToValueAtTime(0.05, t + 0.15);
        gainNode.gain.linearRampToValueAtTime(0.02, t + 0.35);
      }
      if (filterNode) {
        filterNode.frequency.setValueAtTime(250, t);
        filterNode.frequency.linearRampToValueAtTime(450, t + 0.15);
        filterNode.frequency.linearRampToValueAtTime(250, t + 0.35);
      }
    }
  }

  ngOnDestroy() {
    this.stopKaraoke();
  }
}
