import { Component, ChangeDetectionStrategy, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { EnvironmentalTelemetryService } from '../services/environmental-telemetry.service';
import { Body3DViewerComponent } from './body-3d-viewer.component';

@Component({
  selector: 'app-arborist-3d-viewer',
  standalone: true,
  imports: [CommonModule, Body3DViewerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full w-full flex flex-col md:flex-row bg-[#FAF8F0] dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 rounded-lg border border-emerald-500/30 shadow-xl overflow-hidden font-sans relative">
      
      <!-- 3D Botanical Tree Viewport Container -->
      <div class="flex-1 relative min-h-[440px]">
        <app-body-3d-viewer
          class="w-full h-full block"
          [anatomyViewMode]="'arboreal'"
          (partSelected)="onTreeNodeSelected($event)">
        </app-body-3d-viewer>

        <!-- Floating Botanical Telemetry HUD Overlay & Sub-Paradigm Layer Selector -->
        <div class="absolute top-4 left-4 z-30 flex flex-wrap items-center gap-2.5 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl px-4 py-2 rounded-lg border border-emerald-500/40 shadow-xl font-mono text-xs">
          <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
          <span class="font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">🌳 3D Arborist Botanical Telemetry</span>
          <span class="text-gray-300 dark:text-zinc-600">|</span>

          <!-- Sub-Paradigm Layer Buttons (Tap Target Friendly & Sleek rounded-lg) -->
          <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900/90 p-1.5 rounded-lg border border-slate-300 dark:border-zinc-800">
            <button (click)="activeTreeLayer.set('canopy')" 
                    [class]="activeTreeLayer() === 'canopy' ? 'bg-emerald-600 text-white font-black shadow-md' : 'text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800'"
                    class="min-h-[44px] px-3.5 py-2 rounded-md transition-all text-xs cursor-pointer flex items-center justify-center font-bold border border-slate-300 dark:border-zinc-700">
              🍃 Canopy
            </button>
            <button (click)="activeTreeLayer.set('xylem')" 
                    [class]="activeTreeLayer() === 'xylem' ? 'bg-emerald-600 text-white font-black shadow-md' : 'text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800'"
                    class="min-h-[44px] px-3.5 py-2 rounded-md transition-all text-xs cursor-pointer flex items-center justify-center font-bold border border-slate-300 dark:border-zinc-700">
              🪵 Xylem Bark
            </button>
            <button (click)="activeTreeLayer.set('soil')" 
                    [class]="activeTreeLayer() === 'soil' ? 'bg-amber-600 text-white font-black shadow-md' : 'text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800'"
                    class="min-h-[44px] px-3.5 py-2 rounded-md transition-all text-xs cursor-pointer flex items-center justify-center font-bold border border-slate-300 dark:border-zinc-700">
              🪴 Soil Bed
            </button>
            <button (click)="activeTreeLayer.set('taproot')" 
                    [class]="activeTreeLayer() === 'taproot' ? 'bg-teal-600 text-white font-black shadow-md' : 'text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800'"
                    class="min-h-[44px] px-3.5 py-2 rounded-md transition-all text-xs cursor-pointer flex items-center justify-center font-bold border border-slate-300 dark:border-zinc-700">
              🌱 Taproot
            </button>
          </div>
        </div>

        <!-- Active Botanical Layer Sub-Schematic Floating Card -->
        <div class="absolute bottom-4 left-4 z-30 max-w-sm bg-emerald-950/80 backdrop-blur-xl border border-emerald-500/40 p-3.5 rounded-2xl shadow-2xl font-mono text-xs animate-fadeIn">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-black uppercase text-emerald-300 flex items-center gap-1.5">
              <span>{{ activeLayerInfo().icon }}</span>
              <span>{{ activeLayerInfo().title }}</span>
            </span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-600/50 font-bold">
              {{ activeLayerInfo().status }}
            </span>
          </div>
          <p class="text-[11px] text-emerald-100/90 font-sans leading-relaxed">
            {{ activeLayerInfo().description }}
          </p>
        </div>
        <!-- Selected Tree Node Detail Inspector Floating Card -->
        @if (selectedNodeName()) {
          <div class="absolute bottom-4 right-4 z-30 max-w-xs bg-emerald-950/90 backdrop-blur-xl border border-emerald-500/50 p-4 rounded-2xl shadow-2xl font-mono text-xs animate-fadeIn">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-black uppercase text-emerald-300 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Selected Bough</span>
              </span>
              <button (click)="selectedNodeName.set(null)" class="text-zinc-400 hover:text-white cursor-pointer text-xs">✕</button>
            </div>
            <p class="text-xs font-bold text-zinc-100 mb-1 font-mono">{{ selectedNodeName() }}</p>
            <p class="text-[11px] text-emerald-200 font-sans italic leading-relaxed">
              "{{ selectedNodeAnalogy() }}"
            </p>
          </div>
        }
      </div>
    </div>
  `
})
export class Arborist3DViewerComponent {
  protected readonly patientState = inject(PatientStateService);
  protected readonly envTelemetry = inject(EnvironmentalTelemetryService);

  readonly activeTreeLayer = signal<'canopy' | 'xylem' | 'soil' | 'taproot'>('xylem');
  readonly selectedNodeName = signal<string | null>(null);
  readonly selectedNodeAnalogy = signal<string | null>(null);

  readonly sapVelocity = signal<number>(31);
  readonly bloodPressureSap = signal<string>('120/80 hPa');

  readonly activeLayerInfo = computed(() => {
    switch (this.activeTreeLayer()) {
      case 'canopy':
        return {
          icon: '🍃',
          title: 'Bronchial Foliage Canopy',
          status: 'Photosynthetic Peak',
          description: 'Leaf respiration and oxygen exchange operating at 98% SpO2 without chlorosis discoloration.'
        };
      case 'soil':
        return {
          icon: '🪴',
          title: 'Rhizosphere Soil Bed',
          status: 'Humic Microbiome Active',
          description: 'Gut bacterial mycorrhizal network synthesizing vital B-vitamins and micronutrients.'
        };
      case 'taproot':
        return {
          icon: '🌱',
          title: 'Subterranean Taproot',
          status: 'Aquifer Filtration Nominal',
          description: 'Renal nephron deep root system absorbing electrolytes and balancing systemic hydration.'
        };
      default:
        return {
          icon: '🪵',
          title: 'Redwood Trunk Xylem',
          status: 'Fluid Transport Steady',
          description: 'Cardiovascular arterial sap vessel walls withstanding 120/80 hPa barometric pressure.'
        };
    }
  });

  @Output() nodeSelected = new EventEmitter<{ id: string, name: string }>();

  onTreeNodeSelected(event: { id: string, name: string }) {
    this.selectedNodeName.set(event.name);
    
    const analogies: Record<string, string> = {
      'head': 'Crown Redwood Canopy: Photosynthetic leaf clusters absorbing sunlight and managing respiratory evaporation.',
      'chest': 'Trunk Bough Structural Axis: High-density heartwood column carrying nutrient sap channels.',
      'heart': 'Central Sap Core Pump: Rhythmically propelling 31 cm/s fluid transport through inner xylem vessels.',
      'lungs': 'Bilateral Foliage Branches: Bronchial leaf veins absorbing carbon dioxide and expelling fresh oxygen.',
      'spine_lumbar': 'Lumbo-Sacral Trunk Flare: Heavy structural bark base supporting upper canopy wind shear.',
      'r_shin': 'Taproot Anchor Strut: Deep subterranean root extension anchoring right leg structural stability.',
      'l_shin': 'Taproot Anchor Strut: Deep subterranean root extension anchoring left leg structural stability.'
    };

    this.selectedNodeAnalogy.set(analogies[event.id] || 'Botanical bough branch supporting structural canopy weight.');
    this.nodeSelected.emit(event);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rosetta-cross-projection', { 
        detail: { nodeId: event.id, nodeName: event.name, paradigm: 'arborist' } 
      }));
    }
  }
}
