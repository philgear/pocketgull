import { Component, ChangeDetectionStrategy, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { Body3DViewerComponent } from './body-3d-viewer.component';

@Component({
  selector: 'app-mechanical-3d-viewer',
  standalone: true,
  imports: [CommonModule, Body3DViewerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full w-full flex flex-col md:flex-row bg-[#FAF8F0] dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 rounded-lg border border-cyan-500/30 shadow-xl overflow-hidden font-sans relative">
      
      <!-- 3D Automotive Chassis Viewport Container -->
      <div class="flex-1 relative min-h-[440px]">
        <app-body-3d-viewer
          class="w-full h-full block"
          [anatomyViewMode]="'automotive'"
          (partSelected)="onChassisNodeSelected($event)">
        </app-body-3d-viewer>

        <!-- Floating Vehicle Telemetry HUD Overlay & Sub-Paradigm Layer Selector -->
        <div class="absolute top-4 left-4 z-30 flex flex-wrap items-center gap-2.5 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl px-4 py-2 rounded-lg border border-cyan-500/40 shadow-xl font-mono text-xs">
          <span class="w-3 h-3 rounded-full bg-cyan-500 animate-ping"></span>
          <span class="font-black text-cyan-800 dark:text-cyan-300 uppercase tracking-wider">🏎️ 3D Mechanical Chassis Telemetry</span>
          <span class="text-gray-300 dark:text-zinc-600">|</span>

          <!-- Sub-Paradigm Layer Buttons (Tap Target Friendly & Sleek rounded-lg) -->
          <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900/90 p-1.5 rounded-lg border border-slate-300 dark:border-zinc-800">
            <button (click)="activeChassisLayer.set('powertrain')" 
                    [class]="activeChassisLayer() === 'powertrain' ? 'bg-cyan-600 text-white font-black shadow-md' : 'text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800'"
                    class="min-h-[44px] px-3.5 py-2 rounded-md transition-all text-xs cursor-pointer flex items-center justify-center font-bold border border-slate-300 dark:border-zinc-700">
              🏎️ Powertrain
            </button>
            <button (click)="activeChassisLayer.set('wiring')" 
                    [class]="activeChassisLayer() === 'wiring' ? 'bg-indigo-600 text-white font-black shadow-md' : 'text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800'"
                    class="min-h-[44px] px-3.5 py-2 rounded-md transition-all text-xs cursor-pointer flex items-center justify-center font-bold border border-slate-300 dark:border-zinc-700">
              ⚡ Wiring ECU
            </button>
            <button (click)="activeChassisLayer.set('chassis')" 
                    [class]="activeChassisLayer() === 'chassis' ? 'bg-slate-600 text-white font-black shadow-md' : 'text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800'"
                    class="min-h-[44px] px-3.5 py-2 rounded-md transition-all text-xs cursor-pointer flex items-center justify-center font-bold border border-slate-300 dark:border-zinc-700">
              🛞 Chassis
            </button>
            <button (click)="activeChassisLayer.set('hitch')" 
                    [class]="activeChassisLayer() === 'hitch' ? 'bg-amber-600 text-white font-black shadow-md' : 'text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800'"
                    class="min-h-[44px] px-3.5 py-2 rounded-md transition-all text-xs cursor-pointer flex items-center justify-center font-bold border border-slate-300 dark:border-zinc-700">
              🪝 Hitch Pin
            </button>
          </div>
        </div>

        <!-- Active Chassis Layer Sub-Schematic Floating Card -->
        <div class="absolute bottom-4 left-4 z-30 max-w-sm bg-cyan-950/80 backdrop-blur-xl border border-cyan-500/40 p-3.5 rounded-2xl shadow-2xl font-mono text-xs animate-fadeIn">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-black uppercase text-cyan-300 flex items-center gap-1.5">
              <span>{{ activeLayerInfo().icon }}</span>
              <span>{{ activeLayerInfo().title }}</span>
            </span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-cyan-900/80 text-cyan-200 border border-cyan-600/50 font-bold">
              {{ activeLayerInfo().status }}
            </span>
          </div>
          <p class="text-[11px] text-cyan-100/90 font-sans leading-relaxed">
            {{ activeLayerInfo().description }}
          </p>
        </div>

        <!-- Selected Component Inspector Floating Card -->
        @if (selectedNodeName()) {
          <div class="absolute bottom-4 right-4 z-30 max-w-xs bg-cyan-950/90 backdrop-blur-xl border border-cyan-500/50 p-4 rounded-2xl shadow-2xl font-mono text-xs animate-fadeIn">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-black uppercase text-cyan-300 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Selected Chassis Part</span>
              </span>
              <button (click)="selectedNodeName.set(null)" class="text-zinc-400 hover:text-white cursor-pointer text-xs">✕</button>
            </div>
            <p class="text-xs font-bold text-zinc-100 mb-1 font-mono">{{ selectedNodeName() }}</p>
            <p class="text-[11px] text-cyan-200 font-sans italic leading-relaxed">
              "{{ selectedNodeAnalogy() }}"
            </p>
          </div>
        }
      </div>
    </div>
  `
})
export class Mechanical3DViewerComponent {
  protected readonly patientState = inject(PatientStateService);

  readonly activeChassisLayer = signal<'powertrain' | 'wiring' | 'chassis' | 'hitch'>('powertrain');
  readonly selectedNodeName = signal<string | null>(null);
  readonly selectedNodeAnalogy = signal<string | null>(null);

  readonly engineRpm = signal<number>(72);
  readonly hydraulicPsi = signal<number>(46);

  readonly activeDtcCode = signal<string>('P0000 (System OK)');
  readonly activeDtcDescription = signal<string>('DTC P0000: No active powertrain fault codes stored. Engine idling within normal limits.');

  readonly activeLayerInfo = computed(() => {
    switch (this.activeChassisLayer()) {
      case 'wiring':
        return {
          icon: '⚡',
          title: 'Wiring ECU Harness',
          status: 'Sensors Online 100%',
          description: 'Electronic Control Module monitoring vagal nerve impulse timing and oxygen sensors.'
        };
      case 'chassis':
        return {
          icon: '🛞',
          title: 'Frame Rails & Strut Towers',
          status: 'Alignment Nominal',
          description: 'High-strength steel chassis frame rails handling road vibration and structural body mass.'
        };
      case 'hitch':
        return {
          icon: '🪝',
          title: 'L5-S1 Trailer Hitch Ball',
          status: 'Payload Tension Balanced',
          description: 'Heavy-duty trailer hitch pin connection managing spinal torque and pelvic payload.'
        };
      default:
        return {
          icon: '🏎️',
          title: 'V8 Engine Combustion Block',
          status: 'Idle 72 RPM Smooth',
          description: 'Primary combustion engine generating hydraulic flow and horsepower without cylinder drag.'
        };
    }
  });

  @Output() nodeSelected = new EventEmitter<{ id: string, name: string }>();

  onChassisNodeSelected(event: { id: string, name: string }) {
    this.selectedNodeName.set(event.name);
    
    const analogies: Record<string, string> = {
      'head': 'Electronic Control Module (ECM): Main vehicle wiring harness and sensor computer.',
      'chest': 'Dual Channel Frame Rails: High-strength steel chassis frame backbone.',
      'heart': 'Central V8 Engine Block: Primary combustion chamber generating horsepower and hydraulic flow.',
      'lungs': 'Exhaust Headers & Intake Manifold: Air filtration, intake compression, and exhaust flow.',
      'spine_lumbar': 'Lumbo-Sacral Trailer Hitch: Heavy-duty L5-S1 receiver ball under towed payload tension.',
      'r_shin': 'Front-Right Strut Assembly: Shock absorber coil spring handling road impact.',
      'l_shin': 'Front-Left Strut Assembly: Shock absorber coil spring handling road impact.'
    };

    this.selectedNodeAnalogy.set(analogies[event.id] || 'Chassis strut crossmember supporting structural load.');
    this.nodeSelected.emit(event);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rosetta-cross-projection', { 
        detail: { nodeId: event.id, nodeName: event.name, paradigm: 'mechanic' } 
      }));
    }
  }
}
