import { Component, ChangeDetectionStrategy, inject, signal, computed, OnDestroy, effect, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { IBodyPartIssue } from '../services/patient.types';
import { PatientManagementService } from '../services/patient-management.service';
import { Body3DViewerComponent } from './body-3d-viewer.component';

@Component({
  selector: 'app-body-viewer',
  standalone: true,
  imports: [CommonModule, Body3DViewerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `    
    <div class="flex flex-col items-center justify-center h-full w-full relative">
      
      <!-- Tooltip -->
      @if (tooltipVisible()) {
        <div class="absolute bg-[#1C1C1C] text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm pointer-events-none shadow-lg z-50"
             [style.left.px]="tooltipX()"
             [style.top.px]="tooltipY()"
             [style.transform]="'translate(-50%, 0)'">
          {{ tooltipText() }}
        </div>
      }

      <!-- Main Viewer Area -->
      <div class="h-full w-full relative flex items-center justify-center overflow-hidden">
        
        <!-- Anatomical Search & Quick-Select Overlay (Top Left) -->
        <div class="absolute top-4 left-4 z-30 no-print flex flex-col gap-2 max-w-[280px] sm:max-w-[340px]">
          <!-- Search Input Bar -->
          <div class="relative flex items-center bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-slate-200 dark:border-zinc-800 rounded-lg shadow-md p-1.5 transition-all focus-within:ring-2 focus-within:ring-lime-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400 dark:text-zinc-500 ml-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              [value]="searchQuery()" 
              (input)="onSearchInput($event)" 
              placeholder="Search body part or organ (e.g. Heart, Knee)..." 
              class="w-full bg-transparent text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 px-2 py-1 outline-none font-medium" />
            @if (searchQuery()) {
              <button (click)="clearSearch()" class="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            }
          </div>

          <!-- Live Search Results & Quick System Pills -->
          @if (isSearchOpen() || filteredParts().length > 0 && searchQuery().trim()) {
            <div class="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-[#EEEEEE] dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden max-h-[220px] overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800">
              @for (part of filteredParts(); track part.id) {
                <button (click)="onPartSearchResultClick(part)" 
                        class="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-lime-500/10 dark:hover:bg-lime-500/20 transition-colors group">
                  <div class="flex items-center gap-2">
                    <span class="text-base">{{ part.icon }}</span>
                    <div>
                      <div class="font-semibold text-gray-800 dark:text-zinc-200 group-hover:text-lime-600 dark:group-hover:text-lime-400">{{ part.name }}</div>
                      <div class="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{{ part.system }}</div>
                    </div>
                  </div>
                  @if (state.hasPainfulIssue(part.id)) {
                    <span class="text-[10px] font-extrabold bg-red-500/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/30">
                      Pain Issue
                    </span>
                  }
                </button>
              } @empty {
                <div class="p-3 text-xs text-gray-400 dark:text-zinc-500 text-center font-medium">No matching body part found</div>
              }
            </div>
          }

          <!-- Quick System Category Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button (click)="activeSystemFilter.set('all')" [class.bg-black]="activeSystemFilter() === 'all'" [class.text-white]="activeSystemFilter() === 'all'" [class.bg-white/80]="activeSystemFilter() !== 'all'" class="px-2 py-1 text-[10px] font-bold uppercase rounded-md shadow-xs border border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">All</button>
            <button (click)="activeSystemFilter.set('neuro')" [class.bg-black]="activeSystemFilter() === 'neuro'" [class.text-white]="activeSystemFilter() === 'neuro'" [class.bg-white/80]="activeSystemFilter() !== 'neuro'" class="px-2 py-1 text-[10px] font-bold uppercase rounded-md shadow-xs border border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Head/Neuro</button>
            <button (click)="activeSystemFilter.set('organ')" [class.bg-black]="activeSystemFilter() === 'organ'" [class.text-white]="activeSystemFilter() === 'organ'" [class.bg-white/80]="activeSystemFilter() !== 'organ'" class="px-2 py-1 text-[10px] font-bold uppercase rounded-md shadow-xs border border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Organs</button>
            <button (click)="activeSystemFilter.set('skeletal')" [class.bg-black]="activeSystemFilter() === 'skeletal'" [class.text-white]="activeSystemFilter() === 'skeletal'" [class.bg-white/80]="activeSystemFilter() !== 'skeletal'" class="px-2 py-1 text-[10px] font-bold uppercase rounded-md shadow-xs border border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Limbs/Spine</button>
          </div>
        </div>
        
        <!-- Unified Anatomical Control HUD (Layers, Regions, 3D Orbit & Ghost Overlay) -->
        <div class="absolute bottom-2 left-2 right-2 z-30 no-print flex flex-wrap items-center justify-between gap-1.5 bg-slate-900/90 dark:bg-zinc-950/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 dark:border-zinc-800 shadow-2xl max-w-[calc(100%-16px)] overflow-x-auto hide-scrollbar">
          
          <!-- 2D / 3D Mode & Layers Segment -->
          <div class="flex items-center gap-1 overflow-x-auto hide-scrollbar shrink min-w-0">
            <!-- 2D vs 3D Viewport Selector -->
            <div class="flex items-center bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-700/50 mr-1.5">
              <button (click)="state.bodyViewerMode.set('3d')"
                      [class.bg-indigo-600]="state.bodyViewerMode() === '3d'"
                      [class.text-white]="state.bodyViewerMode() === '3d'"
                      [class.text-zinc-400]="state.bodyViewerMode() !== '3d'"
                      class="px-2.5 py-1.5 text-[10.5px] font-mono font-bold uppercase rounded-md transition-all cursor-pointer flex items-center gap-1 min-h-[36px]">
                <span>🧊</span> 3D
              </button>
              <button (click)="state.bodyViewerMode.set('2d')"
                      [class.bg-indigo-600]="state.bodyViewerMode() === '2d'"
                      [class.text-white]="state.bodyViewerMode() === '2d'"
                      [class.text-zinc-400]="state.bodyViewerMode() !== '2d'"
                      class="px-2.5 py-1.5 text-[10.5px] font-mono font-bold uppercase rounded-md transition-all cursor-pointer flex items-center gap-1 min-h-[36px]">
                <span>🗺️</span> 2D
              </button>
            </div>

            <!-- Anatomical Layers Pill Strip -->
            <span class="text-[9.5px] font-mono font-extrabold text-zinc-400 uppercase tracking-widest px-1 hidden sm:inline">Layer:</span>
            <button (click)="state.anatomyViewMode.set('skin')"
                    [class.bg-zinc-100]="state.anatomyViewMode() === 'skin'"
                    [class.text-zinc-950]="state.anatomyViewMode() === 'skin'"
                    [class.bg-zinc-800\/60]="state.anatomyViewMode() !== 'skin'"
                    [class.text-zinc-300]="state.anatomyViewMode() !== 'skin'"
                    class="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg border border-zinc-700\/50 transition cursor-pointer flex items-center gap-1 min-h-[36px]">
              <span>👤</span> Skin
            </button>
            <button (click)="state.anatomyViewMode.set('muscle')"
                    [class.bg-zinc-100]="state.anatomyViewMode() === 'muscle'"
                    [class.text-zinc-950]="state.anatomyViewMode() === 'muscle'"
                    [class.bg-zinc-800\/60]="state.anatomyViewMode() !== 'muscle'"
                    [class.text-zinc-300]="state.anatomyViewMode() !== 'muscle'"
                    class="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg border border-zinc-700\/50 transition cursor-pointer flex items-center gap-1 min-h-[36px]">
              <span>🦾</span> Muscle
            </button>
            <button (click)="state.anatomyViewMode.set('skeleton')"
                    [class.bg-zinc-100]="state.anatomyViewMode() === 'skeleton'"
                    [class.text-zinc-950]="state.anatomyViewMode() === 'skeleton'"
                    [class.bg-zinc-800\/60]="state.anatomyViewMode() !== 'skeleton'"
                    [class.text-zinc-300]="state.anatomyViewMode() !== 'skeleton'"
                    class="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg border border-zinc-700\/50 transition cursor-pointer flex items-center gap-1 min-h-[36px]">
              <span>🦴</span> Skeleton
            </button>
            <button (click)="state.anatomyViewMode.set('organs')"
                    [class.bg-zinc-100]="state.anatomyViewMode() === 'organs'"
                    [class.text-zinc-950]="state.anatomyViewMode() === 'organs'"
                    [class.bg-zinc-800\/60]="state.anatomyViewMode() !== 'organs'"
                    [class.text-zinc-300]="state.anatomyViewMode() !== 'organs'"
                    class="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg border border-zinc-700\/50 transition cursor-pointer flex items-center gap-1 min-h-[36px]">
              <span>🫀</span> Organ
            </button>
            <button (click)="state.anatomyViewMode.set('molecular')"
                    [class.bg-zinc-100]="state.anatomyViewMode() === 'molecular'"
                    [class.text-zinc-950]="state.anatomyViewMode() === 'molecular'"
                    [class.bg-zinc-800\/60]="state.anatomyViewMode() !== 'molecular'"
                    [class.text-zinc-300]="state.anatomyViewMode() !== 'molecular'"
                    class="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg border border-zinc-700\/50 transition cursor-pointer flex items-center gap-1 min-h-[36px]">
              <span>🔬</span> Molecular
            </button>

            <!-- Ghost Baseline Reference -->
            <button (click)="state.showGhostOverlay.update(v => !v)"
                    [class.bg-teal-600]="state.showGhostOverlay()"
                    [class.text-white]="state.showGhostOverlay()"
                    [class.bg-zinc-800\/60]="!state.showGhostOverlay()"
                    [class.text-zinc-400]="!state.showGhostOverlay()"
                    title="Toggle healthy baseline ghost comparison"
                    class="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg border border-zinc-700\/50 transition cursor-pointer flex items-center gap-1 min-h-[36px]">
              <span>👻</span> Ghost
            </button>
          </div>
        </div>

        @if (state.bodyViewerMode() === '3d') {
          @defer {
            <app-body-3d-viewer 
              class="w-full h-full"
              [anatomyViewMode]="state.anatomyViewMode()"
              [customModelUrl]="null"
              (partSelected)="onPartSelected($event)">
            </app-body-3d-viewer>
          } @placeholder {
            <div class="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4">
              <div class="w-8 h-8 rounded-sm border-2 border-gray-300 border-t-black animate-spin"></div>
              <p class="text-sm font-medium uppercase tracking-widest text-[#1c1c1c] opacity-50">Loading 3D Engine...</p>
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
                      <!-- Head -->
                      <path d="M100 18 C 88 18, 82 25, 82 40 V 65 H 118 V 40 C 118 25, 112 18, 100 18 Z" 
                            [class]="getPartClass('head')" 
                            (click)="select('head', 'Head & Neck')"
                            (mousemove)="showTooltip($event, 'Head & Neck')" 
                            (mouseleave)="hideTooltip()"/>
                    </g>
                  </g>
                }

                @if (view() === 'back') {
                  <g id="static-anatomy-back">
                    <path class="skin-base" [attr.d]="fullBodySkinPathBack()" [class.opacity-20]="state.anatomyViewMode() !== 'skin'" />
                    <g class="skeleton-layer" [class.opacity-100]="state.anatomyViewMode() === 'skeleton'" [class.opacity-40]="state.anatomyViewMode() !== 'skeleton'">
                      <path class="skeleton-path" d="M100 18 C 90 18, 85 24, 85 38 V 48 H 115 V 38 C 115 24, 110 18, 100 18 Z" />
                      <path class="skeleton-path" d="M100 65 V 170 M90 75 L80 85 L90 110 Z M110 75 L120 85 L110 110 Z" />
                    </g>
                    <g id="regions-2d-back">
                      <path d="M100 18 C 88 18, 82 25, 82 40 V 65 H 118 V 40 C 118 25, 112 18, 100 18 Z"
                            [class]="getPartClass('head')" 
                            (click)="select('head', 'Head & Neck (Back)')"
                            (mousemove)="showTooltip($event, 'Head & Neck (Back)')" 
                            (mouseleave)="hideTooltip()" />
                    </g>
                  </g>
                }
              </g>
            </svg>
          </div>

          <!-- 2D Direction Controls (Local to component as they only apply to 2D) -->
          <div class="absolute bottom-4 right-4 flex text-[12px] font-bold tracking-widest uppercase gap-1 z-20">
            <button (click)="view.set('front')" 
                    class="w-8 h-8 border transition-all flex items-center justify-center rounded-sm shadow-sm"
                    [class.bg-black]="view() === 'front'"
                    [class.text-white]="view() === 'front'"
                    [class.bg-white]="view() !== 'front'"
                    [class.text-black]="view() !== 'front'">F</button>
            <button (click)="view.set('back')" 
                    class="w-8 h-8 border transition-all flex items-center justify-center rounded-sm shadow-sm"
                    [class.bg-black]="view() === 'back'"
                    [class.text-white]="view() === 'back'"
                    [class.bg-white]="view() !== 'back'"
                    [class.text-black]="view() !== 'back'">B</button>
          </div>
        }
      </div>



      <!-- Manual Zoom/Reset Controls (Bottom Left) -->
      <div class="absolute bottom-4 left-4 flex flex-col gap-2 z-20 no-print">
         <button (click)="resetControls()" 
                 class="p-3 bg-white border border-[#EEEEEE] hover:bg-[#F8F8F8] rounded-sm shadow-sm transition-all active:scale-95 text-gray-600 hover:text-black" 
                 title="Reset View">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
        @if (state.bodyViewerMode() === '3d') {
          <button (click)="zoomIn()" 
                  class="p-3 bg-white border border-[#EEEEEE] hover:bg-[#F8F8F8] rounded-sm shadow-sm transition-all active:scale-95 text-gray-600 hover:text-black" 
                  title="Zoom In">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          </button>
          <button (click)="zoomOut()" 
                  class="p-3 bg-white border border-[#EEEEEE] hover:bg-[#F8F8F8] rounded-sm shadow-sm transition-all active:scale-95 text-gray-600 hover:text-black" 
                  title="Zoom Out">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>
          </button>
        }
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
    @keyframes highlight-pulse {
      0% { fill: rgba(104, 159, 56, 0); stroke-width: 1; }
      50% { fill: rgba(104, 159, 56, 0.4); stroke-width: 4; }
      100% { fill: rgba(104, 159, 56, 0.2); stroke-width: 2; }
    }
  `]
})
export class BodyViewerComponent implements OnDestroy {
  state = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

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

    // Provide a small animation window for the flash, but update the actual state immediately
    // so the UI can react without a race condition.
    this.state.selectPart(id);
    const issuesForPart = this.state.issues()[id];

    if (issuesForPart && issuesForPart.length > 0) {
      this.state.selectNote(issuesForPart[0].noteId);
    } else if (!this.state.viewingPastVisit()) {
      // Create a new note only if we are taking notes for current visit
      const newNoteId = `note_${Date.now()}`;
      const newNote: IBodyPartIssue = {
        id,
        noteId: newNoteId,
        name,
        painLevel: 0,
        description: '',
        symptoms: []
      };
      this.state.updateIssue(id, newNote);
      this.state.selectNote(newNoteId);
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
