import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

import { PatientUnderTreeComponent } from './patient-under-tree.component';

export type AppleLifecycleStage = 'blossom' | 'green_apple' | 'ripe_red' | 'fallen_apple' | 'sprouted_sapling';

export interface IAppleNode {
  id: string;
  name: string;
  category: 'Metabolic & Nutrition' | 'Neuro & Mind' | 'Cardiovascular' | 'Genomics';
  stage: AppleLifecycleStage;
  emoji: string;
  color: string;
  ripeness: number; // 0 to 100
  cx: number;
  cy: number;
  targetY: number; // For drop animation
  r: number;
  isLowHanging: boolean; // Low hanging fruit indicator
  conditionTarget: string;
  actionableIntervention: string;
  isFallen: boolean;
  hasSproutedSapling: boolean;
}

export interface IGenealogicalRoot {
  id: string;
  lineage: 'Maternal Lineage' | 'Paternal Lineage' | 'Ancestral Resilience' | 'Epigenetic Imprint';
  geneOrTrait: string;
  cx: number;
  cy: number;
  impactScore: string;
  clinicalSignificance: string;
}

@Component({
  selector: 'app-patient-fruit-tree',
  standalone: true,
  imports: [CommonModule, PatientUnderTreeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-8 p-6 sm:p-8 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl font-sans relative overflow-hidden">
      
      <!-- Background Ambient Glow -->
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header & Patient Tree Telemetry Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 font-mono relative z-10">
        <div>
          <div class="flex items-center gap-3">
            <span class="text-2xl animate-bounce">🍎</span>
            <div>
              <h2 class="text-lg font-bold uppercase tracking-tight text-zinc-100 flex items-center gap-2">
                <span>Living Apple Lifecycle & Genealogical Tree</span>
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 uppercase">
                  Patient Specific Genealogy
                </span>
              </h2>
              <p class="text-xs text-zinc-400 font-sans mt-0.5">
                Visualizing low-hanging clinical goals, full apple lifecycles, and inherited genealogical root traits for <strong>{{ activePatientName() }}</strong>.
              </p>
            </div>
          </div>
        </div>

        <!-- View Mode Toggle & Tree Stats Badges -->
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <div class="flex items-center bg-zinc-900 rounded-xl p-1 border border-zinc-800">
            <button (click)="viewMode.set('diagram')"
              [class.bg-zinc-800]="viewMode() === 'diagram'"
              [class.text-white]="viewMode() === 'diagram'"
              [class.text-zinc-400]="viewMode() !== 'diagram'"
              class="px-2.5 py-1 rounded-lg font-bold uppercase transition text-[10px] cursor-pointer">
              🌳 Tree Diagram
            </button>
            <button (click)="viewMode.set('landscape')"
              [class.bg-emerald-600]="viewMode() === 'landscape'"
              [class.text-white]="viewMode() === 'landscape'"
              [class.text-zinc-400]="viewMode() !== 'landscape'"
              class="px-2.5 py-1 rounded-lg font-bold uppercase transition text-[10px] cursor-pointer">
              🧘 Seated Under Tree (1st Person)
            </button>
          </div>

          <div class="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2">
            <span class="text-red-400 font-bold font-mono">{{ overallRipeness() }}%</span>
            <span class="text-zinc-400 text-[10px] uppercase font-mono">Orchard Index</span>
          </div>

          <button (click)="shakeTree()"
            [class.animate-bounce]="isShaking()"
            class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold uppercase tracking-wider text-[10px] shadow-lg hover:brightness-110 transition cursor-pointer flex items-center gap-1.5 font-mono">
            <span>🌳</span>
            <span>{{ isShaking() ? 'Shaking Orchard...' : 'Shake Tree (Harvest)' }}</span>
          </button>
        </div>
      </div>

      <!-- Conditionally Render View Mode -->
      @if (viewMode() === 'landscape') {
        <app-patient-under-tree></app-patient-under-tree>
      } @else {


      <!-- Interactive SVG Living Apple Tree Canvas -->
      <div class="relative w-full aspect-[16/9] max-h-[480px] bg-zinc-900/70 rounded-2xl border border-zinc-800/80 overflow-hidden flex items-center justify-center p-4">
        
        <svg viewBox="0 0 800 460" class="w-full h-full select-none">
          <defs>
            <!-- Tree Canopy Gradient -->
            <radialGradient id="canopyGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#10B981" stop-opacity="0.35" />
              <stop offset="60%" stop-color="#047857" stop-opacity="0.2" />
              <stop offset="100%" stop-color="#064E3B" stop-opacity="0.0" />
            </radialGradient>
            <!-- Trunk Gradient -->
            <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#78350F" />
              <stop offset="100%" stop-color="#451A03" />
            </linearGradient>
            <!-- Soil Gradient -->
            <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#1C1917" />
              <stop offset="100%" stop-color="#0C0A09" />
            </linearGradient>
          </defs>

          <!-- Soil Base Floor (Orchard Earth) -->
          <rect x="0" y="380" width="800" height="80" fill="url(#soilGrad)" />
          <line x1="0" y1="380" x2="800" y2="380" stroke="#78350F" stroke-width="2" opacity="0.4" />

          <!-- Genealogical Deep Root Network (Ancestral Traits & DNA Lineage) -->
          <g stroke="#B45309" stroke-linecap="round" fill="none" opacity="0.7">
            <!-- Central Taproot -->
            <path d="M 400 380 Q 400 420 400 450" stroke-width="6" />
            <!-- Maternal Root Branch -->
            <path d="M 400 395 C 340 410, 270 420, 210 435" stroke-width="4" />
            <!-- Paternal Root Branch -->
            <path d="M 400 395 C 460 410, 530 420, 590 435" stroke-width="4" />
            <!-- Epigenetic Sub-roots -->
            <path d="M 340 415 C 310 435, 290 445, 270 455" stroke-width="2.5" />
            <path d="M 460 415 C 490 435, 510 445, 530 455" stroke-width="2.5" />
          </g>

          <!-- Genealogical Root Markers (Clickable Ancestral DNA Trait Nodes) -->
          @for (root of genealogicalRoots(); track root.id) {
            <g (click)="selectRoot(root)" class="cursor-pointer group">
              <circle [attr.cx]="root.cx" [attr.cy]="root.cy" r="7" fill="#D97706" stroke="#FEF3C7" stroke-width="1.5" class="transition-transform group-hover:scale-125" />
              <text [attr.x]="root.cx" [attr.y]="root.cy + 16" text-anchor="middle" fill="#D4D4D8" font-size="8.5" font-family="monospace" font-weight="bold">
                🧬 {{ root.geneOrTrait }}
              </text>
            </g>
          }

          <!-- Main Tree Canopy Ambient Layer -->
          <circle cx="400" cy="190" r="170" fill="url(#canopyGrad)" class="animate-pulse" style="animation-duration: 6s;" />

          <!-- Main Trunk -->
          <path d="M 375 380 C 380 310, 370 250, 400 200 C 430 250, 420 310, 425 380 Z" fill="url(#trunkGrad)" />

          <!-- Primary Boughs (Major Clinical Lenses) -->
          <!-- Bough 1: Left Metabolic (Low-Hanging Branch) -->
          <path d="M 390 240 C 320 220, 260 210, 210 210" stroke="#78350F" stroke-width="12" stroke-linecap="round" fill="none" />
          <path d="M 260 215 C 220 170, 180 150, 150 140" stroke="#78350F" stroke-width="7" stroke-linecap="round" fill="none" />

          <!-- Bough 2: Right Neuro (Low-Hanging Branch) -->
          <path d="M 410 240 C 480 220, 540 210, 590 210" stroke="#78350F" stroke-width="12" stroke-linecap="round" fill="none" />
          <path d="M 540 215 C 580 170, 620 150, 650 140" stroke="#78350F" stroke-width="7" stroke-linecap="round" fill="none" />

          <!-- Bough 3: Top Cardiovascular & Genomics -->
          <path d="M 400 200 C 390 140, 360 100, 340 70" stroke="#78350F" stroke-width="9" stroke-linecap="round" fill="none" />
          <path d="M 400 200 C 410 140, 440 100, 460 70" stroke="#78350F" stroke-width="9" stroke-linecap="round" fill="none" />

          <!-- Foliage Leaf Clusters -->
          <g fill="#10B981" opacity="0.25">
            <circle cx="200" cy="160" r="45" />
            <circle cx="150" cy="130" r="35" />
            <circle cx="600" cy="160" r="45" />
            <circle cx="650" cy="130" r="35" />
            <circle cx="340" cy="70" r="40" />
            <circle cx="460" cy="70" r="40" />
            <circle cx="400" cy="100" r="50" />
          </g>

          <!-- Sprouted Generational Saplings (Mini Trees from Fallen Apples) -->
          @for (sap of saplings(); track sap.id) {
            <g class="animate-in fade-in zoom-in duration-500">
              <!-- Mini Trunk -->
              <path [attr.d]="'M ' + sap.cx + ' 380 Q ' + sap.cx + ' 360 ' + sap.cx + ' 350'" stroke="#78350F" stroke-width="3" fill="none" />
              <!-- Mini Canopy -->
              <circle [attr.cx]="sap.cx" [attr.cy]="342" r="14" fill="#10B981" opacity="0.8" />
              <circle [attr.cx]="sap.cx - 5" [attr.cy]="340" r="10" fill="#34D399" opacity="0.9" />
              <text [attr.x]="sap.cx" [attr.y]="375" text-anchor="middle" fill="#A1A1AA" font-size="8" font-family="monospace">
                🌿 Sapling Goal Achieved
              </text>
            </g>
          }

          <!-- Interactive Apple Lifecycle Nodes -->
          @for (apple of apples(); track apple.id) {
            <g (click)="selectApple(apple)" 
               class="cursor-pointer transition-all duration-700 hover:scale-125"
               [style.transform]="'translate(0px, ' + (apple.isFallen ? (380 - apple.cy) : 0) + 'px)'"
               style="transform-origin: center;">
              
              <!-- Low-Hanging Fruit Pulse Badge -->
              @if (apple.isLowHanging && !apple.isFallen) {
                <circle [attr.cx]="apple.cx" [attr.cy]="apple.cy" [attr.r]="apple.r + 6" 
                        fill="none" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="3,3" class="animate-spin" style="animation-duration: 10s;" />
              }

              <!-- Apple Outer Ripeness Ring -->
              <circle [attr.cx]="apple.cx" [attr.cy]="apple.cy" [attr.r]="apple.r + 3" 
                      fill="none" stroke="#27272A" stroke-width="2" />
              <circle [attr.cx]="apple.cx" [attr.cy]="apple.cy" [attr.r]="apple.r + 3" 
                      fill="none" [attr.stroke]="apple.color" stroke-width="2.5"
                      [attr.stroke-dasharray]="100"
                      [attr.stroke-dashoffset]="100 - apple.ripeness"
                      stroke-linecap="round" transform="rotate(-90)"
                      [attr.transform-origin]="apple.cx + ' ' + apple.cy" />

              <!-- Main Apple Circle -->
              <circle [attr.cx]="apple.cx" [attr.cy]="apple.cy" [attr.r]="apple.r" 
                      [attr.fill]="apple.color" />

              <!-- Apple Stem -->
              <path [attr.d]="'M ' + apple.cx + ' ' + (apple.cy - apple.r) + ' Q ' + (apple.cx + 3) + ' ' + (apple.cy - apple.r - 4) + ' ' + (apple.cx + 2) + ' ' + (apple.cy - apple.r - 6)"
                    stroke="#78350F" stroke-width="2" fill="none" />

              <!-- Apple Emoji Label -->
              <text [attr.x]="apple.cx" [attr.y]="apple.cy + 5" text-anchor="middle" font-size="13">
                {{ apple.emoji }}
              </text>

              <!-- Low-Hanging Tag -->
              @if (apple.isLowHanging && !apple.isFallen) {
                <rect [attr.x]="apple.cx - 18" [attr.y]="apple.cy + apple.r + 2" width="36" height="12" rx="4" fill="#F59E0B" />
                <text [attr.x]="apple.cx" [attr.y]="apple.cy + apple.r + 10" text-anchor="middle" fill="#000000" font-size="7" font-weight="bold" font-family="monospace">
                  QUICK WIN
                </text>
              }
            </g>
          }

        </svg>

        <!-- Selected Apple / Root Drawer Overlay -->
        @if (selectedApple(); as a) {
          <div class="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans animate-in slide-in-from-bottom duration-200">
            <div>
              <div class="flex items-center gap-2 font-mono text-xs">
                <span class="text-lg">{{ a.emoji }}</span>
                <span class="font-bold text-zinc-100">{{ a.name }}</span>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                  [style.backgroundColor]="a.color + '30'" [style.color]="a.color">
                  {{ a.category }} &bull; {{ getStageName(a) }} ({{ a.ripeness }}%)
                </span>
                @if (a.isLowHanging) {
                  <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30 uppercase">
                    ⚡ Low-Hanging Fruit
                  </span>
                }
              </div>
              <p class="text-xs text-zinc-300 mt-1">
                <strong>Target Condition:</strong> {{ a.conditionTarget }} &bull; <em>Intervention:</em> {{ a.actionableIntervention }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              @if (!a.isFallen) {
                <button (click)="advanceAppleLifecycle(a)"
                  class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] font-bold uppercase transition cursor-pointer active:scale-95 flex items-center gap-1">
                  <span>🍎</span>
                  <span>Advance Lifecycle & Drop Apple</span>
                </button>
              } @else {
                <span class="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <span>🌿</span> Sprouted Generational Sapling
                </span>
              }
              <button (click)="selectedApple.set(null)" class="text-xs text-zinc-400 hover:text-zinc-200 font-mono">✕ Close</button>
            </div>
          </div>
        }

        <!-- Selected Root Drawer Overlay -->
        @if (selectedRoot(); as r) {
          <div class="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-zinc-950/95 border border-amber-900/60 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans animate-in slide-in-from-bottom duration-200">
            <div>
              <div class="flex items-center gap-2 font-mono text-xs">
                <span class="text-lg">🧬</span>
                <span class="font-bold text-amber-400">{{ r.lineage }} &bull; {{ r.geneOrTrait }}</span>
                <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30 uppercase">
                  Impact: {{ r.impactScore }}
                </span>
              </div>
              <p class="text-xs text-zinc-300 mt-1">
                <strong>Clinical Lineage Significance:</strong> {{ r.clinicalSignificance }}
              </p>
            </div>

            <button (click)="selectedRoot.set(null)" class="text-xs text-zinc-400 hover:text-zinc-200 font-mono">✕ Close</button>
          </div>
        }

      </div>

      <!-- Tree Legend & Dynamic Lifecycle Guide -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-zinc-400 border-t border-zinc-900 pt-3">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full fill-white stroke-zinc-400">🌸</span> 1. Blossom Bud</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 2. Low-Hanging Green</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> 3. Crisp Red Apple</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-600"></span> 4. Fallen Apple</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> 5. Sprouted Sapling</span>
        </div>

        <div>
          <span>🧬 Ancestral Root Tapestry Active &bull; {{ apples().length }} Apple Lifecycle Nodes</span>
        </div>
      </div>
      }

    </div>
  `
})
export class PatientFruitTreeComponent {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  viewMode = signal<'diagram' | 'landscape'>('diagram');
  selectedApple = signal<IAppleNode | null>(null);
  selectedRoot = signal<IGenealogicalRoot | null>(null);


  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Charles Darwin';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Charles Darwin';
  });

  genealogicalRoots = computed<IGenealogicalRoot[]>(() => {
    const pId = this.patientManagement.selectedPatientId();
    const isDarwin = !pId || pId.includes('darwin') || pId.includes('1');

    return [
      {
        id: 'r1',
        lineage: 'Maternal Lineage',
        geneOrTrait: isDarwin ? 'MTHFR C677T Heterozygous' : 'ApoE4 Isoform Variant',
        cx: 210,
        cy: 435,
        impactScore: 'Moderate Epigenetic Shift',
        clinicalSignificance: 'Influences folate methylation and homocysteine vascular clearance. Requires bioactive L-methylfolate.'
      },
      {
        id: 'r2',
        lineage: 'Paternal Lineage',
        geneOrTrait: isDarwin ? 'Familial Longevity Lineage' : 'CYP2D6 Intermediate Metabolizer',
        cx: 590,
        cy: 435,
        impactScore: 'High Resilience',
        clinicalSignificance: 'Paternal lineage exhibits enhanced mitochondrial COX enzyme activity and robust autonomic cardiac recovery.'
      },
      {
        id: 'r3',
        lineage: 'Ancestral Resilience',
        geneOrTrait: 'SOD2 / GPX1 Antioxidant Pathway',
        cx: 270,
        cy: 450,
        impactScore: 'Optimal Defense',
        clinicalSignificance: 'Superoxide dismutase 2 clearance protects vascular endothelium from reactive oxygen species.'
      },
      {
        id: 'r4',
        lineage: 'Epigenetic Imprint',
        geneOrTrait: 'BMAL1 / CLOCK Circadian Robustness',
        cx: 530,
        cy: 450,
        impactScore: 'Circadian Entrained',
        clinicalSignificance: 'Strong peripheral clock gene expression in hepatic tissue facilitates high postprandial glucose clearance.'
      }
    ];
  });

  apples = computed<IAppleNode[]>(() => {
    const pId = this.patientManagement.selectedPatientId();
    const notesCount = this.patientState.clinicalNotes().length;
    const isDarwin = !pId || pId.includes('darwin') || pId.includes('1');

    return [
      {
        id: 'a1',
        name: 'Vagal Resonant Breathing (0.1 Hz)',
        category: 'Neuro & Mind',
        stage: 'green_apple',
        emoji: '🍏',
        color: '#10B981',
        ripeness: Math.min(100, 45 + (notesCount * 10)),
        cx: isDarwin ? 210 : 230,
        cy: isDarwin ? 210 : 220,
        targetY: 380,
        r: 17, // Low hanging Quick-Win sized
        isLowHanging: true,
        conditionTarget: 'Autonomic Anxiety & Elevated HR',
        actionableIntervention: '5 min 0.1 Hz slow breathing to align baroreflex sensitivity.',
        isFallen: 45 + (notesCount * 10) >= 100,
        hasSproutedSapling: 45 + (notesCount * 10) >= 100
      },
      {
        id: 'a2',
        name: 'Osmotic Hydration & Electrolytes',
        category: 'Metabolic & Nutrition',
        stage: 'green_apple',
        emoji: '🍏',
        color: '#10B981',
        ripeness: Math.min(100, 55 + (notesCount * 8)),
        cx: isDarwin ? 590 : 570,
        cy: isDarwin ? 210 : 220,
        targetY: 380,
        r: 17, // Low hanging Quick-Win sized
        isLowHanging: true,
        conditionTarget: 'Mild Dehydration & Micro-Cramping',
        actionableIntervention: '500ml Mineralized osmotic water with 300mg Potassium Citrate.',
        isFallen: 55 + (notesCount * 8) >= 100,
        hasSproutedSapling: 55 + (notesCount * 8) >= 100
      },
      {
        id: 'a3',
        name: 'Blood Pressure Reduction (<120/80)',
        category: 'Cardiovascular',
        stage: 'ripe_red',
        emoji: '🍎',
        color: '#EF4444',
        ripeness: Math.min(100, 70 + (notesCount * 5)),
        cx: isDarwin ? 150 : 170,
        cy: isDarwin ? 140 : 150,
        targetY: 380,
        r: 16,
        isLowHanging: false,
        conditionTarget: 'Hypertension Stage 1',
        actionableIntervention: 'DASH diet + Nitric Oxide Beetroot shot 70ml daily.',
        isFallen: 70 + (notesCount * 5) >= 100,
        hasSproutedSapling: 70 + (notesCount * 5) >= 100
      },
      {
        id: 'a4',
        name: 'Glycemic HbA1c Target (<5.7%)',
        category: 'Metabolic & Nutrition',
        stage: 'ripe_red',
        emoji: '🍎',
        color: '#EF4444',
        ripeness: Math.min(100, 85 + (notesCount * 3)),
        cx: isDarwin ? 650 : 630,
        cy: isDarwin ? 140 : 150,
        targetY: 380,
        r: 16,
        isLowHanging: false,
        conditionTarget: 'Type 2 Diabetes Mellitus',
        actionableIntervention: 'Time-Restricted Feeding (10-hr window) + Berberine 500mg.',
        isFallen: 85 + (notesCount * 3) >= 100,
        hasSproutedSapling: 85 + (notesCount * 3) >= 100
      },
      {
        id: 'a5',
        name: '40 Hz Gamma Focus Entrainment',
        category: 'Neuro & Mind',
        stage: 'blossom',
        emoji: '🌸',
        color: '#F472B6',
        ripeness: Math.min(100, 30 + (notesCount * 5)),
        cx: 340,
        cy: 70,
        targetY: 380,
        r: 14,
        isLowHanging: false,
        conditionTarget: 'Cognitive Brain Fog & Inattention',
        actionableIntervention: '40 Hz Gamma AVS entrainment + Bacopa Monnieri 300mg.',
        isFallen: false,
        hasSproutedSapling: false
      },
      {
        id: 'a6',
        name: 'CYP2D6 Clearance Verification',
        category: 'Genomics',
        stage: 'blossom',
        emoji: '🌸',
        color: '#F472B6',
        ripeness: Math.min(100, 95 + (notesCount * 2)),
        cx: 460,
        cy: 70,
        targetY: 380,
        r: 14,
        isLowHanging: false,
        conditionTarget: 'Pharmacogenomic Metabolism',
        actionableIntervention: 'Verified GCN interaction matrix with zero high-risk overlaps.',
        isFallen: 95 + (notesCount * 2) >= 100,
        hasSproutedSapling: 95 + (notesCount * 2) >= 100
      }
    ];
  });

  saplings = computed(() => {
    return this.apples().filter(a => a.isFallen).map((a, idx) => ({
      id: `sap-${a.id}`,
      cx: 140 + (idx * 130),
      appleName: a.name
    }));
  });

  saplingCount = computed(() => this.saplings().length);

  overallRipeness = computed(() => {
    const fs = this.apples();
    if (fs.length === 0) return 0;
    const total = fs.reduce((acc, f) => acc + f.ripeness, 0);
    return Math.round(total / fs.length);
  });

  getStageName(apple: IAppleNode): string {
    if (apple.isFallen) return 'Fallen & Sprouted Sapling';
    if (apple.ripeness < 35) return 'Blossom Bud (🌸)';
    if (apple.ripeness < 65) return 'Low-Hanging Green Apple (🍏)';
    return 'Ripe Crisp Red Apple (🍎)';
  }

  selectApple(apple: IAppleNode) {
    this.selectedRoot.set(null);
    this.selectedApple.set(apple);
  }

  selectRoot(root: IGenealogicalRoot) {
    this.selectedApple.set(null);
    this.selectedRoot.set(root);
  }

  isShaking = signal(false);

  shakeTree() {
    this.isShaking.set(true);

    // Harvest low hanging fruit & advance ripeness
    const currentApples = this.apples();
    const lowHanging = currentApples.find(a => a.isLowHanging || a.ripeness > 60);

    if (lowHanging) {
      this.advanceAppleLifecycle(lowHanging);
    }

    this.patientState.addClinicalNote({
      id: `eureka-drop-${Date.now()}`,
      text: `🍏 Newton's Eureka Discovery: Shook the orchard canopy for ${this.activePatientName()} — Low-hanging clinical goals harvested into active care plan!`,
      sourceLens: 'Summary Overview',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });

    setTimeout(() => {
      this.isShaking.set(false);
    }, 1200);
  }

  advanceAppleLifecycle(apple: IAppleNode) {
    const noteText = `🧺 Apple Lifecycle Advanced to Fallen & Sapling Sprouted: ${apple.name} (${apple.category})`;
    this.patientState.addClinicalNote({
      id: `apple-life-${apple.id}-${Date.now()}`,
      text: noteText,
      sourceLens: 'Summary Overview',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    this.selectedApple.set({ ...apple, ripeness: 100, isFallen: true, stage: 'fallen_apple', emoji: '🍎' });
  }
}
