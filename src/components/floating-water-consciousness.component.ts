import { Component, ChangeDetectionStrategy, signal, computed, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

export interface IFloatingWord {
  id: string;
  text: string;
  category: 'neurotransmitter' | 'frequency' | 'affirmation' | 'botanical';
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  vx: number;
  vy: number;
  scale: number;
  phase: number;
  emoji: string;
  details: string;
}

export interface IFloatingIsland {
  id: string;
  name: string;
  stateId: 'focus' | 'calm' | 'sleep' | 'creativity' | 'grounding';
  emoji: string;
  x: number;
  y: number;
  color: string;
  freq: string;
  targetOrganId: string;
}

@Component({
  selector: 'app-floating-water-consciousness',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-[480px] rounded-3xl overflow-hidden bg-zinc-950 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] font-mono select-none">
      
      <!-- Interactive Water Fluid Canvas -->
      <canvas #waterCanvas (click)="onCanvasClick($event)" (mousemove)="onCanvasMouseMove($event)"
        class="absolute inset-0 w-full h-full cursor-crosshair z-0"></canvas>

      <!-- Glassmorphic Water Overlay & Ambient Light -->
      <div class="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-transparent to-zinc-950/80 pointer-events-none z-10"></div>
      <div class="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none z-10"></div>
      <div class="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none z-10"></div>

      <!-- Section Header Overlay -->
      <div class="absolute top-5 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"></span>
            <h3 class="text-sm font-bold uppercase tracking-tight text-emerald-200">
              🌊 Aquatic Consciousness & Floating City Archipelagos
            </h3>
          </div>
          <p class="text-[11px] text-zinc-400 font-sans mt-0.5">
            Click anywhere on the fluid surface to cast water ripples. Interactive words & bio-islands float in real-time buoyancy.
          </p>
        </div>

        <div class="hidden sm:flex items-center gap-2 font-mono text-[10px]">
          <span class="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
            Fluid Hydrodynamics: Active
          </span>
        </div>
      </div>

      <!-- Floating City Islands / Archipelagos -->
      <div class="absolute inset-0 z-20 pointer-events-none">
        @for (island of islands; track island.id) {
          <div (click)="selectIsland(island)"
            class="absolute pointer-events-auto transition-transform duration-500 hover:scale-110 cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
            [style.left.%]="island.x" [style.top.%]="island.y">
            
            <!-- Island Ring & Pulsing Ripple -->
            <div class="relative flex flex-col items-center">
              <div class="w-16 h-16 rounded-full bg-zinc-900/90 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center backdrop-blur-md transition group-hover:border-emerald-400 group-hover:shadow-[0_0_30px_rgba(52,211,153,0.5)]">
                <span class="text-2xl group-hover:scale-125 transition-transform duration-300">{{ island.emoji }}</span>
              </div>
              
              <!-- Floating Island Title Label -->
              <div class="mt-1.5 px-2.5 py-1 rounded-full bg-zinc-950/90 border border-zinc-800 text-center shadow-lg backdrop-blur-sm">
                <span class="text-[10px] font-bold text-zinc-200 block uppercase tracking-wider font-mono">{{ island.name }}</span>
                <span class="text-[8.5px] text-emerald-400 block font-mono">{{ island.freq }}</span>
              </div>
            </div>

          </div>
        }
      </div>

      <!-- Buoyant Floating Interactive Words (Lotus Leaves / Water Lanterns) -->
      <div class="absolute inset-0 z-30 pointer-events-none">
        @for (word of floatingWords(); track word.id) {
          <div (click)="onWordClick(word)"
            class="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer group"
            [style.left.%]="word.x" [style.top.%]="word.y"
            [style.transform]="'translate(-50%, -50%) translateY(' + (Math.sin(word.phase) * 6) + 'px)'">
            
            <!-- Water Lantern / Floating Leaf Pill -->
            <div class="px-3.5 py-1.5 rounded-2xl bg-zinc-900/80 border border-zinc-700/80 text-zinc-200 text-xs font-sans flex items-center gap-2 shadow-xl backdrop-blur-md group-hover:border-emerald-400 group-hover:bg-emerald-950/60 group-hover:text-emerald-200 group-hover:scale-110 transition-all duration-200">
              <span class="text-sm group-hover:rotate-12 transition-transform">{{ word.emoji }}</span>
              <span class="font-semibold text-[11px] font-mono tracking-tight">{{ word.text }}</span>
            </div>

          </div>
        }
      </div>

      <!-- Active Floating Word Details Modal Overlay -->
      @if (selectedWord(); as word) {
        <div class="absolute bottom-4 left-6 right-6 p-4 rounded-2xl bg-zinc-900/95 border border-emerald-500/40 shadow-2xl backdrop-blur-lg z-40 flex items-center justify-between gap-4 font-sans animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
              {{ word.emoji }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-xs font-bold font-mono uppercase text-emerald-300 tracking-wider">{{ word.text }}</h4>
                <span class="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono uppercase">{{ word.category }}</span>
              </div>
              <p class="text-xs text-zinc-300 mt-0.5 leading-relaxed font-mono">
                {{ word.details }}
              </p>
            </div>
          </div>

          <button (click)="selectedWord.set(null)"
            class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold transition cursor-pointer shrink-0">
            ✕ Close
          </button>
        </div>
      }

    </div>
  `
})
export class FloatingWaterConsciousnessComponent implements AfterViewInit, OnDestroy {
  @ViewChild('waterCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  patientState = inject(PatientStateService);
  Math = Math;

  // Floating Archipelagos (Cities on Water) with 3D Anatomical Organ Focus Mapping
  islands: IFloatingIsland[] = [
    { id: 'isl-1', name: 'Gamma Sanctuary', stateId: 'focus', emoji: '⚡', x: 20, y: 35, color: 'indigo', freq: '40 Hz Gamma', targetOrganId: 'brain' },
    { id: 'isl-2', name: 'Alpha Lagoon', stateId: 'calm', emoji: '🧘', x: 50, y: 25, color: 'emerald', freq: '10 Hz Alpha', targetOrganId: 'heart' },
    { id: 'isl-3', name: 'Delta Atoll', stateId: 'sleep', emoji: '🌙', x: 80, y: 35, color: 'purple', freq: '2 Hz Delta', targetOrganId: 'head' },
    { id: 'isl-4', name: 'Theta Archipelago', stateId: 'creativity', emoji: '🎨', x: 35, y: 70, color: 'amber', freq: '6 Hz Theta', targetOrganId: 'brain' },
    { id: 'isl-5', name: 'Grounding Isle', stateId: 'grounding', emoji: '🛡️', x: 65, y: 70, color: 'rose', freq: '8 Hz Low Alpha', targetOrganId: 'stomach' }
  ];


  // Floating Words / Lotus Lanterns drifting on fluid water
  floatingWords = signal<IFloatingWord[]>([
    { id: 'w-1', text: '528 Hz Solfeggio', category: 'frequency', x: 28, y: 48, vx: 0.03, vy: 0.02, scale: 1, phase: 0, emoji: '🎵', details: 'Transformation frequency promoting vagal tone and cellular DNA harmony.' },
    { id: 'w-2', text: 'GABA-A Receptor', category: 'neurotransmitter', x: 58, y: 42, vx: -0.02, vy: 0.03, scale: 1, phase: 1.5, emoji: '🧬', details: 'Primary inhibitory neurotransmitter driving parasympathetic emotional calmness.' },
    { id: 'w-3', text: 'Anandamide Bliss', category: 'neurotransmitter', x: 42, y: 82, vx: 0.02, vy: -0.02, scale: 1, phase: 3, emoji: '✨', details: 'Endocannabinoid molecule associated with creative hypnagogic reverie.' },
    { id: 'w-4', text: 'Shen Anchored', category: 'affirmation', x: 72, y: 55, vx: -0.03, vy: -0.02, scale: 1, phase: 4.5, emoji: '☯️', details: 'TCM energetic state where spirit rests in the Heart Blood without agitation.' },
    { id: 'w-5', text: 'Glymphatic Rest', category: 'affirmation', x: 88, y: 48, vx: 0.01, vy: 0.03, scale: 1, phase: 2, emoji: '🌊', details: 'Parenchymal metabolic waste clearance triggered during deep slow-wave sleep.' },
    { id: 'w-6', text: 'Ashwagandha KSM-66', category: 'botanical', x: 15, y: 55, vx: 0.02, vy: -0.01, scale: 1, phase: 1, emoji: '🌱', details: 'Adaptogenic withanolides that blunt HPA-axis cortisol hyper-secretion.' },
    { id: 'w-7', text: 'Acetylcholine Flow', category: 'neurotransmitter', x: 25, y: 22, vx: -0.01, vy: 0.02, scale: 1, phase: 2.5, emoji: '⚡', details: 'Cholinergic synaptic neurotransmitter supporting prefrontal executive clarity.' }
  ]);

  selectedWord = signal<IFloatingWord | null>(null);

  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private ripples: Array<{ x: number; y: number; radius: number; maxRadius: number; opacity: number }> = [];

  ngAfterViewInit() {
    if (typeof window === 'undefined') return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', this.onResize);
    this.animate();
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize);
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    }
  }

  private onResize = () => {
    this.resizeCanvas();
  };

  private resizeCanvas() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 480;
  }

  onCanvasClick(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Add dynamic water ripple
    this.ripples.push({ x, y, radius: 5, maxRadius: 140, opacity: 0.8 });

    // Hydrodynamic repulsion on floating words
    const words = this.floatingWords();
    const updated = words.map(w => {
      const wx = (w.x / 100) * rect.width;
      const wy = (w.y / 100) * rect.height;
      const dx = wx - x;
      const dy = wy - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 && dist > 0) {
        const force = (150 - dist) / 150;
        return {
          ...w,
          vx: w.vx + (dx / dist) * force * 0.15,
          vy: w.vy + (dy / dist) * force * 0.15
        };
      }
      return w;
    });
    this.floatingWords.set(updated);
  }

  onCanvasMouseMove(event: MouseEvent) {
    if (Math.random() < 0.15) {
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.ripples.push({ x, y, radius: 2, maxRadius: 50, opacity: 0.3 });
    }
  }

  onWordClick(word: IFloatingWord) {
    this.selectedWord.set(word);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${word.text}. ${word.details}`);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }

  selectIsland(island: IFloatingIsland) {
    this.patientState.selectedPartId.set(island.targetOrganId);
    this.patientState.anatomyViewMode.set('organs');

    const noteText = `🌊 Selected Floating City Archipelago: ${island.emoji} ${island.name} (${island.freq}) → Focused 3D Organ: ${island.targetOrganId}`;
    this.patientState.addClinicalNote({
      id: `island-select-${island.id}-${Date.now()}`,
      text: noteText,
      sourceLens: 'Functional Protocols',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert(`🌊 Navigating to Floating City Archipelago: ${island.name}\nTarget Frequency: ${island.freq}\n3D Anatomical Focus: ${island.targetOrganId.toUpperCase()}`);
  }


  private animate = () => {
    if (!this.ctx || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const w = canvas.width;
    const h = canvas.height;

    this.ctx.clearRect(0, 0, w, h);

    // Draw Ambient Fluid Water Gradient Background
    const grad = this.ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#09090b');
    grad.addColorStop(0.5, '#041712');
    grad.addColorStop(1, '#09090b');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    // Render Animated Water Surface Caustics / Waves
    const time = Date.now() * 0.0012;
    this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.07)';
    this.ctx.lineWidth = 1.5;

    for (let i = 0; i < 6; i++) {
      this.ctx.beginPath();
      const yOffset = (h / 7) * (i + 1);
      for (let x = 0; x < w; x += 15) {
        const waveY = yOffset + Math.sin(x * 0.015 + time + i) * 12 + Math.cos(x * 0.008 - time) * 6;
        if (x === 0) this.ctx.moveTo(x, waveY);
        else this.ctx.lineTo(x, waveY);
      }
      this.ctx.stroke();
    }

    // Render Dynamic Water Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 1.8;
      r.opacity -= 0.012;

      if (r.opacity <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(52, 211, 153, ${r.opacity})`;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    }

    // Update Floating Words position & phase (Buoyancy physics)
    const words = this.floatingWords();
    const updated = words.map(word => {
      let newX = word.x + word.vx;
      let newY = word.y + word.vy;
      let vx = word.vx * 0.98; // Friction dampening
      let vy = word.vy * 0.98;

      // Bounce off boundaries (10% to 90%)
      if (newX < 10 || newX > 90) vx = -vx;
      if (newY < 18 || newY > 85) vy = -vy;

      return {
        ...word,
        x: Math.max(10, Math.min(90, newX)),
        y: Math.max(18, Math.min(85, newY)),
        vx,
        vy,
        phase: word.phase + 0.03
      };
    });
    this.floatingWords.set(updated);

    this.animFrameId = requestAnimationFrame(this.animate);
  };
}
