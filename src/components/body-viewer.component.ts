import { Component, ChangeDetectionStrategy, inject, signal, computed, OnDestroy, effect, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { IBodyPartIssue } from '../services/patient.types';
import { PatientManagementService } from '../services/patient-management.service';
import { Body3DViewerComponent } from './body-3d-viewer.component';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-body-viewer',
  standalone: true,
  imports: [CommonModule, Body3DViewerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `    
    <div class="flex flex-col h-full w-full bg-slate-900/90 dark:bg-zinc-950/95 text-white rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl font-sans">
      
      <!-- Tooltip -->
      @if (tooltipVisible()) {
        <div class="absolute bg-[#1C1C1C] text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm pointer-events-none shadow-lg z-50"
             [style.left.px]="tooltipX()"
             [style.top.px]="tooltipY()"
             [style.transform]="'translate(-50%, 0)'">
          {{ tooltipText() }}
        </div>
      }

      <!-- 1. Top Dedicated Header Bar (OUTSIDE 3D Canvas Window) -->
      <div class="p-3 bg-zinc-900/90 border-b border-zinc-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0 no-print z-20">
        <!-- Search Bar -->
        <div class="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 w-full sm:w-72 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-zinc-500 mr-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            type="text" 
            [value]="searchQuery()" 
            (input)="onSearchInput($event)" 
            placeholder="Search part, organ, acupoint, chakra..." 
            class="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none font-medium" />
          @if (searchQuery()) {
            <button (click)="clearSearch()" class="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          }
        </div>

        <!-- Paradigm Lens Selector Bar -->
        <div class="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button (click)="state.selectPhilosophy('western')" [class.bg-sky-600]="state.activePhilosophy() === 'western'" [class.text-white]="state.activePhilosophy() === 'western'" [class.text-zinc-400]="state.activePhilosophy() !== 'western'" class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer">
            🩺 Western
          </button>
          <button (click)="state.selectPhilosophy('eastern')" [class.bg-emerald-600]="state.activePhilosophy() === 'eastern'" [class.text-white]="state.activePhilosophy() === 'eastern'" [class.text-zinc-400]="state.activePhilosophy() !== 'eastern'" class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer">
            🌿 Eastern TCM
          </button>
          <button (click)="state.selectPhilosophy('ayurvedic')" [class.bg-amber-600]="state.activePhilosophy() === 'ayurvedic'" [class.text-white]="state.activePhilosophy() === 'ayurvedic'" [class.text-zinc-400]="state.activePhilosophy() !== 'ayurvedic'" class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer">
            🧘 Ayurvedic
          </button>
        </div>
      </div>

      <!-- Dynamic Paradigm Quick Selection Target Bar -->
      <div class="py-2 px-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto text-xs z-20">
        @if (state.activePhilosophy() === 'western') {
          <span class="text-xs font-bold uppercase tracking-wider text-sky-400 shrink-0">🩺 Western Organs:</span>
          <button (click)="select('head', 'Head & Brain')" class="px-2.5 py-1 rounded-lg bg-sky-950/80 text-sky-200 border border-sky-800/60 hover:bg-sky-900 transition text-xs font-bold shrink-0 cursor-pointer">🧠 Head & Brain</button>
          <button (click)="select('heart', 'Cardiac / Heart')" class="px-2.5 py-1 rounded-lg bg-sky-950/80 text-sky-200 border border-sky-800/60 hover:bg-sky-900 transition text-xs font-bold shrink-0 cursor-pointer">🫀 Heart</button>
          <button (click)="select('lungs', 'Pulmonary / Lungs')" class="px-2.5 py-1 rounded-lg bg-sky-950/80 text-sky-200 border border-sky-800/60 hover:bg-sky-900 transition text-xs font-bold shrink-0 cursor-pointer">🫁 Lungs</button>
          <button (click)="select('abdomen', 'Abdomen & GI')" class="px-2.5 py-1 rounded-lg bg-sky-950/80 text-sky-200 border border-sky-800/60 hover:bg-sky-900 transition text-xs font-bold shrink-0 cursor-pointer">🟡 Abdomen</button>
          <button (click)="select('lower_back', 'Lumbar Spine')" class="px-2.5 py-1 rounded-lg bg-sky-950/80 text-sky-200 border border-sky-800/60 hover:bg-sky-900 transition text-xs font-bold shrink-0 cursor-pointer">🦴 Spine</button>
        } @else if (state.activePhilosophy() === 'eastern') {
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-400 shrink-0">☯️ TCM Acupoints:</span>
          <button (click)="select('acupoint_gv20', 'GV-20 Baihui')" class="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-200 border border-emerald-800/60 hover:bg-emerald-900 transition text-xs font-bold shrink-0 cursor-pointer">☯️ Baihui (GV-20)</button>
          <button (click)="select('acupoint_cv17', 'CV-17 Danzhong')" class="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-200 border border-emerald-800/60 hover:bg-emerald-900 transition text-xs font-bold shrink-0 cursor-pointer">🫁 Danzhong (CV-17)</button>
          <button (click)="select('acupoint_cv12', 'CV-12 Zhongwan')" class="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-200 border border-emerald-800/60 hover:bg-emerald-900 transition text-xs font-bold shrink-0 cursor-pointer">🟡 Zhongwan (CV-12)</button>
          <button (click)="select('acupoint_st36', 'ST-36 Zusanli')" class="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-200 border border-emerald-800/60 hover:bg-emerald-900 transition text-xs font-bold shrink-0 cursor-pointer">🦵 Zusanli (ST-36)</button>
          <button (click)="select('acupoint_li4', 'LI-4 Hegu')" class="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-200 border border-emerald-800/60 hover:bg-emerald-900 transition text-xs font-bold shrink-0 cursor-pointer">✋ Hegu (LI-4)</button>
        } @else if (state.activePhilosophy() === 'ayurvedic') {
          <span class="text-xs font-bold uppercase tracking-wider text-amber-400 shrink-0">🧘 Sushumna Chakras:</span>
          <button (click)="select('chakra_crown', 'Sahasrara (Crown)')" class="px-2.5 py-1 rounded-lg bg-purple-950/80 text-purple-200 border border-purple-800/60 hover:bg-purple-900 transition text-xs font-bold shrink-0 cursor-pointer">🟣 Crown</button>
          <button (click)="select('chakra_third_eye', 'Ajna (Third Eye)')" class="px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-200 border border-indigo-800/60 hover:bg-indigo-900 transition text-xs font-bold shrink-0 cursor-pointer">🔵 Third Eye</button>
          <button (click)="select('chakra_throat', 'Vishuddha (Throat)')" class="px-2.5 py-1 rounded-lg bg-sky-950/80 text-sky-200 border border-sky-800/60 hover:bg-sky-900 transition text-xs font-bold shrink-0 cursor-pointer">🟦 Throat</button>
          <button (click)="select('chakra_heart', 'Anahata (Heart)')" class="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-200 border border-emerald-800/60 hover:bg-emerald-900 transition text-xs font-bold shrink-0 cursor-pointer">🟢 Heart</button>
          <button (click)="select('chakra_solar', 'Manipura (Solar Plexus)')" class="px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-200 border border-amber-800/60 hover:bg-amber-900 transition text-xs font-bold shrink-0 cursor-pointer">🟡 Solar</button>
          <button (click)="select('chakra_sacral', 'Svadhisthana (Sacral)')" class="px-2.5 py-1 rounded-lg bg-orange-950/80 text-orange-200 border border-orange-800/60 hover:bg-orange-900 transition text-xs font-bold shrink-0 cursor-pointer">🟠 Sacral</button>
          <button (click)="select('chakra_root', 'Muladhara (Root)')" class="px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-200 border border-rose-800/60 hover:bg-rose-900 transition text-xs font-bold shrink-0 cursor-pointer">🔴 Root</button>
        }
      </div>

      <!-- Live Search Dropdown -->
      @if (isSearchOpen() || filteredParts().length > 0 && searchQuery().trim()) {
        <div class="bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 p-2 max-h-[180px] overflow-y-auto divide-y divide-zinc-800 z-30">
          @for (part of filteredParts(); track part.id) {
            <button (click)="onPartSearchResultClick(part)" 
                    class="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-teal-500/20 transition-colors group">
              <div class="flex items-center gap-2">
                <span class="text-base">{{ part.icon }}</span>
                <div>
                  <div class="font-semibold text-zinc-200 group-hover:text-teal-400">{{ part.name }}</div>
                  <div class="text-[10px] text-zinc-500 uppercase tracking-wider">{{ part.system }}</div>
                </div>
              </div>
            </button>
          }
        </div>
      }

      <!-- 2. Center Pure Unencumbered 3D Viewport Window (ZERO Overlapping Elements) -->
      <div class="flex-1 w-full relative min-h-[380px] overflow-hidden bg-white border border-slate-200 rounded-xl shadow-xs">
        @if (state.bodyViewerMode() === '3d') {
          @defer {
            <app-body-3d-viewer 
              class="w-full h-full block"
              [anatomyViewMode]="state.anatomyViewMode()"
              [customModelUrl]="null"
              (partSelected)="onPartSelected($event)">
            </app-body-3d-viewer>
          } @placeholder {
            <div class="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
              <div class="w-8 h-8 rounded-sm border-2 border-zinc-700 border-t-teal-500 animate-spin"></div>
              <p class="text-sm font-medium uppercase tracking-widest text-zinc-400">Loading 3D Engine...</p>
            </div>
          }
        } @else {
          <!-- 2D SVG Schematic -->
          <div class="h-full w-full flex items-center justify-center p-4">
            <svg viewBox="0 0 200 450" class="h-full w-auto relative z-10 drop-shadow-sm">
              <g [attr.transform]="bodyTransform()">
                @if (view() === 'front') {
                  <g id="static-anatomy-front">
                    <path class="skin-base" [attr.d]="fullBodySkinPathFront()" [class.opacity-20]="state.anatomyViewMode() !== 'skin'" />
                    <g class="skeleton-layer" [class.opacity-100]="state.anatomyViewMode() === 'skeleton'" [class.opacity-40]="state.anatomyViewMode() !== 'skeleton'">
                      <path class="skeleton-path" d="M100 18 C 90 18, 85 24, 85 38 V 48 H 115 V 38 C 115 24, 110 18, 100 18 Z M 95 54 C 92 58, 93 62, 98 62 H 102 C 107 62, 108 58, 105 54 Z" />
                      <path class="skeleton-path" d="M100 65 V 170 M 82 75 H 118 M 80 85 C 85 95, 85 115, 80 125 M 120 85 C 115 95, 115 115, 120 125 M 82 100 H 118 M 85 115 H 115" />
                    </g>
                    <g id="regions-2d-front">
                      <path d="M100 18 C 88 18, 82 25, 82 40 V 65 H 118 V 40 C 118 25, 112 18, 100 18 Z" 
                            [class]="getPartClass('head')" 
                            (click)="select('head', 'Head & Neck')"
                            (mousemove)="showTooltip($event, 'Head & Neck')" 
                            (mouseleave)="hideTooltip()"/>
                    </g>
                  </g>
                }
              </g>
            </svg>
          </div>
        }
      </div>

      <!-- 3. Bottom Dedicated Anatomical & Biometric Control Bar (OUTSIDE 3D Canvas Window) -->
      <div class="p-3 bg-zinc-900/90 border-t border-zinc-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0 font-mono text-xs no-print z-20">
        <!-- Viewport & Layer Switcher -->
        <div class="flex items-center gap-2 overflow-x-auto py-1">
          <div class="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button (click)="state.bodyViewerMode.set('3d')" [class.bg-indigo-600]="state.bodyViewerMode() === '3d'" [class.text-white]="state.bodyViewerMode() === '3d'" [class.text-zinc-400]="state.bodyViewerMode() !== '3d'" class="px-3 py-1.5 text-xs font-bold rounded-lg transition min-h-[36px] cursor-pointer">🧊 3D</button>
            <button (click)="state.bodyViewerMode.set('2d')" [class.bg-indigo-600]="state.bodyViewerMode() === '2d'" [class.text-white]="state.bodyViewerMode() === '2d'" [class.text-zinc-400]="state.bodyViewerMode() !== '2d'" class="px-3 py-1.5 text-xs font-bold rounded-lg transition min-h-[36px] cursor-pointer">🗺️ 2D</button>
          </div>

          <!-- Layers Strip -->
          <div class="flex items-center gap-1">
            <button (click)="state.anatomyViewMode.set('skin')" [class.bg-amber-500]="state.anatomyViewMode() === 'skin'" [class.text-zinc-950]="state.anatomyViewMode() === 'skin'" [class.bg-zinc-800]="state.anatomyViewMode() !== 'skin'" [class.text-zinc-300]="state.anatomyViewMode() !== 'skin'" class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-700 transition min-h-[36px] cursor-pointer">📄 Skin</button>
            <button (click)="state.anatomyViewMode.set('muscle')" [class.bg-teal-600]="state.anatomyViewMode() === 'muscle'" [class.text-white]="state.anatomyViewMode() === 'muscle'" [class.bg-zinc-800]="state.anatomyViewMode() !== 'muscle'" [class.text-zinc-300]="state.anatomyViewMode() !== 'muscle'" class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-700 transition min-h-[36px] cursor-pointer">🦾 Muscle</button>
            <button (click)="state.anatomyViewMode.set('skeleton')" [class.bg-rose-600]="state.anatomyViewMode() === 'skeleton'" [class.text-white]="state.anatomyViewMode() === 'skeleton'" [class.bg-zinc-800]="state.anatomyViewMode() !== 'skeleton'" [class.text-zinc-300]="state.anatomyViewMode() !== 'skeleton'" class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-700 transition min-h-[36px] cursor-pointer">🦴 Skeleton</button>
            <button (click)="state.anatomyViewMode.set('organs')" [class.bg-purple-600]="state.anatomyViewMode() === 'organs'" [class.text-white]="state.anatomyViewMode() === 'organs'" [class.bg-zinc-800]="state.anatomyViewMode() !== 'organs'" [class.text-zinc-300]="state.anatomyViewMode() !== 'organs'" class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-700 transition min-h-[36px] cursor-pointer">🫀 Organ</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
    .body-part { fill: transparent; stroke: transparent; cursor: pointer; transition: all 0.3s ease; outline: none; }
    .body-part:hover { fill: rgba(104, 159, 56, 0.1); stroke: rgba(104, 159, 56, 0.3); stroke-width: 1; }
    .body-part.selected { fill: rgba(104, 159, 56, 0.2); stroke: #689F38; stroke-width: 2; }
    .body-part.has-issue { fill: rgba(239, 68, 68, 0.1); stroke: rgba(239, 68, 68, 0.4); stroke-width: 1.5; stroke-dasharray: 4 2; }
    .body-part.has-issue.selected { fill: rgba(239, 68, 68, 0.2); stroke: #EF4444; stroke-width: 2.5; stroke-dasharray: none; }
    .skin-base { fill: #FDFDFD; stroke: #E0E0E0; stroke-width: 1; transition: opacity 0.5s ease; pointer-events: none; }
    .skeleton-layer { pointer-events: none; transition: opacity 0.5s ease; }
    .skeleton-path { fill: none; stroke: #EEEEEE; stroke-width: 1.5; stroke-linecap: round; }
    .skeleton-joint { fill: #EEEEEE; }
    .highlight-anim { animation: highlight-pulse 0.5s ease-out; }
  `]
})
export class BodyViewerComponent implements OnDestroy {
  state = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);
  themeService = inject(ThemeService);

  view = signal<'front' | 'back' | 'side_right' | 'side_left'>('front');

  tempSelectedId = signal<string | null>(null);
  tooltipText = signal<string>('');
  tooltipVisible = signal<boolean>(false);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  manualZoom = signal(1);

  searchQuery = signal<string>('');
  isSearchOpen = signal<boolean>(false);
  activeSystemFilter = signal<string>('all');

  constructor() {
    effect(() => {
      const philosophy = this.state.activePhilosophy();
      if (philosophy === 'eastern') {
        this.state.anatomyViewMode.set('eastern');
      } else if (philosophy === 'ayurvedic') {
        this.state.anatomyViewMode.set('ayurvedic');
      } else {
        this.state.anatomyViewMode.set('skin');
      }
    });

    effect(() => {
      const theme = this.themeService.currentTheme();
      if (theme === 'mandala') {
        this.state.activePhilosophy.set('ayurvedic');
      }
    });
  }

  readonly allParts = [
    { id: 'head', name: 'Head & Brain (Cranial)', system: 'neuro', icon: '🧠' },
    { id: 'neck', name: 'Neck & Cervical Spine', system: 'skeletal', icon: '🦴' },
    { id: 'chest', name: 'Chest & Thorax', system: 'organ', icon: '🫁' },
    { id: 'heart', name: 'Cardiac / Heart', system: 'organ', icon: '🫀' },
    { id: 'lungs', name: 'Pulmonary / Lungs', system: 'organ', icon: '🫁' },
    { id: 'abdomen', name: 'Abdomen & Digestive', system: 'organ', icon: '🟡' },
    { id: 'stomach', name: 'Gastric / Stomach', system: 'organ', icon: '🟡' },
    { id: 'liver', name: 'Hepatic / Liver', system: 'organ', icon: '🟤' },
    { id: 'kidneys', name: 'Renal / Kidneys', system: 'organ', icon: '🔴' },
    { id: 'pelvis', name: 'Pelvis & Hip Girdle', system: 'skeletal', icon: '🦴' },
    { id: 'spine', name: 'Spine & Lumbar Column', system: 'skeletal', icon: '🦴' },
    { id: 'shoulder_left', name: 'Left Shoulder', system: 'skeletal', icon: '💪' },
    { id: 'shoulder_right', name: 'Right Shoulder', system: 'skeletal', icon: '💪' },
    { id: 'arm_left', name: 'Left Arm & Biceps', system: 'skeletal', icon: '💪' },
    { id: 'arm_right', name: 'Right Arm & Biceps', system: 'skeletal', icon: '💪' },
    { id: 'hand_left', name: 'Left Hand & Wrist', system: 'skeletal', icon: '✋' },
    { id: 'hand_right', name: 'Right Hand & Wrist', system: 'skeletal', icon: '✋' },
    { id: 'leg_left', name: 'Left Leg & Knee', system: 'skeletal', icon: '🦵' },
    { id: 'leg_right', name: 'Right Leg & Knee', system: 'skeletal', icon: '🦵' },
    { id: 'foot_left', name: 'Left Foot & Ankle', system: 'skeletal', icon: '🦶' },
    { id: 'foot_right', name: 'Right Foot & Ankle', system: 'skeletal', icon: '🦶' }
  ];

  filteredParts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const system = this.activeSystemFilter();
    return this.allParts.filter(p => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.system.toLowerCase().includes(q);
      const matchesSystem = system === 'all' || p.system === system;
      return matchesQuery && matchesSystem;
    });
  });

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.isSearchOpen.set(true);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.isSearchOpen.set(false);
  }

  onPartSearchResultClick(part: { id: string, name: string }) {
    this.select(part.id, part.name);
    this.searchQuery.set('');
    this.isSearchOpen.set(false);
  }



  selectedPatient = computed(() => {
    const id = this.patientManagement.selectedPatientId();
    if (!id) return null;
    return this.patientManagement.patients().find(p => p.id === id);
  });

  ngOnDestroy() { }

  private parseHeightInInches(heightStr: string): number | null {
    if (!heightStr) return null;
    const match = heightStr.match(/(\d+)'(\d+)/);
    if (match) {
      const feet = parseInt(match[1], 10) || 0;
      const inches = parseInt(match[2], 10) || 0;
      const total = feet * 12 + inches;
      return total > 0 ? total : null;
    }
    return null;
  }

  bodyTransform = computed(() => {
    const patient = this.selectedPatient();
    const vitals = this.state.vitals();
    let scaleX = 1;
    let scaleY = 1;
    if (patient && vitals.height && vitals.weight) {
      const heightInInches = this.parseHeightInInches(vitals.height);
      const weightInLbs = parseInt(vitals.weight, 10);
      if (heightInInches && !isNaN(weightInLbs)) {
        const baseHeightInches = 68;
        const baseBmi = 22;
        const bmi = (weightInLbs / (heightInInches * heightInInches)) * 703;
        scaleY = heightInInches / baseHeightInches;
        scaleX = 1 + ((bmi - baseBmi) / baseBmi) * 0.4;
        scaleY = Math.max(0.85, Math.min(scaleY, 1.15));
        scaleX = Math.max(0.8, Math.min(scaleX, 1.2));
      }
    }
    const finalScaleX = scaleX * this.manualZoom();
    const finalScaleY = scaleY * this.manualZoom();
    const cx = 100;
    const cy = 225;
    return `translate(${cx}, ${cy}) scale(${finalScaleX}, ${finalScaleY}) translate(${- cx}, ${- cy})`;
  });

  fullBodySkinPathFront = computed(() => "M82 40 C 82 25 88 18 100 18 S 118 25 118 40 V 65 L 122 70 L 132 110 L 148 158 L 160 180 L 165 190 L 155 195 L 150 185 L 138 160 L 122 115 L 122 125 L 118 170 L 115 205 L 122 295 L 127 395 L 135 420 L 140 430 H 120 L 115 420 L 110 400 L 105 300 H 115 H 100 H 85 H 95 L 90 400 L 85 420 L 80 430 H 60 L 65 420 L 73 395 L 78 295 L 85 205 L 82 170 L 78 125 L 78 115 L 62 160 L 50 185 L 45 195 L 35 190 L 40 180 L 52 158 L 68 110 L 78 70 L 82 65 Z");
  fullBodySkinPathBack = computed(() => "M82 40 C 82 25 88 18 100 18 S 118 25 118 40 V 65 L 122 70 L 132 110 L 148 158 L 160 180 L 165 190 L 155 195 L 150 185 L 138 160 L 122 115 L 120 120 L 115 170 L 120 205 L 122 295 L 127 395 L 135 420 L 140 430 H 120 L 115 420 L 110 400 L 105 300 H 115 H 100 H 85 H 95 L 90 400 L 85 420 L 80 430 H 60 L 65 420 L 73 395 L 78 295 L 80 205 L 85 170 L 80 120 L 78 115 L 62 160 L 50 185 L 45 195 L 35 190 L 40 180 L 52 158 L 68 110 L 78 70 L 82 65 Z");

  select(id: string, name: string) {
    this.tempSelectedId.set(id);

    // 1. Auto-align active philosophy paradigm & intake fields on touch target tap
    if (id.startsWith('acupoint_')) {
      this.state.selectPhilosophy('eastern');
      const current = this.state.tcmIntake();
      this.state.updateTcmIntake({
        ...current,
        tcmPattern: `Selected Acupoint: ${name} (Jing-Luo Channel)`
      });
    } else if (id.startsWith('chakra_')) {
      this.state.selectPhilosophy('ayurvedic');
      const current = this.state.ayurvedicIntake();
      this.state.updateAyurvedicIntake({
        ...current,
        ayurvedicImbalance: `Selected Chakra Node: ${name} (Sushumna Nadi)`
      });
    }

    // 2. Select part and update issue notes
    this.state.selectPart(id);
    const issuesForPart = this.state.issues()[id];

    if (issuesForPart && issuesForPart.length > 0) {
      this.state.selectNote(issuesForPart[0].noteId);
    } else if (!this.state.viewingPastVisit()) {
      const newNoteId = `note_${Date.now()}`;
      const newNote: IBodyPartIssue = {
        id,
        noteId: newNoteId,
        name,
        painLevel: 3,
        description: `Targeted via ${this.state.activePhilosophy().toUpperCase()} 3D Mannequin`,
        symptoms: [name]
      };
      this.state.updateIssue(id, newNote);
      this.state.selectNote(newNoteId);
    }

    // 3. Smoothly scroll to Intake Form container to load intake protocol immediately
    if (typeof document !== 'undefined') {
      const intakeElement = document.querySelector('#patient-intake-section, #intake-form-container, app-intake-form');
      if (intakeElement) {
        intakeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Temporary highlight flash effect
    setTimeout(() => {
      this.tempSelectedId.set(null);
    }, 500);
  }

  getPartClass(id: string): string {
    const isSelected = this.state.selectedPartId() === id;
    const isAnimating = this.tempSelectedId() === id;
    const hasIssue = this.state.hasPainfulIssue(id);
    let classes = 'body-part';
    if (isAnimating) { classes += ' highlight-anim'; }
    else if (isSelected) { classes += ' selected'; }
    if (hasIssue) { classes += ' has-issue'; }
    return classes;
  }

  showTooltip(event: MouseEvent, name: string) {
    const hostRect = (event.currentTarget as SVGElement).closest('div')!.getBoundingClientRect();
    this.tooltipText.set(name);
    this.tooltipVisible.set(true);
    this.tooltipX.set(event.clientX - hostRect.left);
    this.tooltipY.set(event.clientY - hostRect.top + 20);
  }

  hideTooltip() {
    this.tooltipVisible.set(false);
  }

  zoomIn() { this.manualZoom.update(z => parseFloat((z + 0.1).toFixed(2))); }
  zoomOut() { this.manualZoom.update(z => parseFloat(Math.max(z - 0.1, 0.5).toFixed(2))); }
  resetControls() { this.manualZoom.set(1); }

  onPartSelected(event: { id: string, name: string }) {
    this.select(event.id, event.name);
  }
}
