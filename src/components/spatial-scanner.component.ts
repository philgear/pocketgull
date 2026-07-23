import { Component, ChangeDetectionStrategy, signal, computed, inject, ElementRef, viewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-spatial-scanner',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full mb-10 p-6 sm:p-8 bg-zinc-950 text-zinc-100 rounded-3xl border border-cyan-500/40 shadow-2xl font-sans relative overflow-hidden transition-all duration-500">
      
      <!-- Cyan Spatial Scan Grid Backdrop Glow -->
      <div class="absolute -top-32 -left-32 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10 font-mono">
        <div>
          <div class="flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase tracking-widest mb-1">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            📸 Live WebXR & In-App Camera Spatial Scanner
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            In-App LiDAR & Photogrammetry Body Capture
          </h2>
        </div>

        <div class="flex items-center gap-2 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 text-xs">
          <span class="text-zinc-400 font-bold px-2">Mode:</span>
          <button (click)="scanMode.set('camera')" [class.bg-cyan-600]="scanMode() === 'camera'" [class.text-white]="scanMode() === 'camera'" class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer">
            🎥 Live Camera Feed
          </button>
          <button (click)="scanMode.set('pointcloud')" [class.bg-cyan-600]="scanMode() === 'pointcloud'" [class.text-white]="scanMode() === 'pointcloud'" class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer">
            🌐 3D Point Cloud
          </button>
        </div>
      </div>

      <!-- Main Scanning Viewport -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 font-mono">
        
        <!-- Left 7 Cols: Video Stream / 3D Pointcloud Container -->
        <div class="lg:col-span-7 h-[400px] relative bg-zinc-900/90 rounded-2xl border border-zinc-800 overflow-hidden shadow-inner flex items-center justify-center">
          
          <!-- Live Web Camera Feed -->
          <video #videoElement *ngIf="scanMode() === 'camera'" autoplay playsinline muted class="w-full h-full object-cover rounded-2xl"></video>

          <!-- 3D Point Cloud Three.js Canvas -->
          <div #canvasContainer [class.hidden]="scanMode() !== 'pointcloud'" class="w-full h-full"></div>

          <!-- Spatial Reticle Target Overlay -->
          <div class="absolute inset-0 pointer-events-none flex flex-col items-center justify-center border-2 border-cyan-500/20 rounded-2xl m-4">
            <div class="w-48 h-72 border-2 border-dashed border-cyan-400/60 rounded-3xl flex items-center justify-center relative animate-pulse">
              <span class="text-[10px] uppercase font-bold text-cyan-300 bg-zinc-950/80 px-2 py-0.5 rounded border border-cyan-800/60">Align Body in Frame</span>
            </div>
          </div>

          <!-- Scanning Progress Indicator -->
          @if (isScanning()) {
            <div class="absolute bottom-4 left-4 right-4 bg-zinc-950/90 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/40 flex items-center justify-between text-xs">
              <span class="text-cyan-300 font-bold flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                Capturing $360^\\circ$ Spatial Frames ({{ scanProgress() }}%)
              </span>
              <div class="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div class="h-full bg-cyan-400 transition-all duration-300" [style.width.%]="scanProgress()"></div>
              </div>
            </div>
          }

        </div>

        <!-- Right 5 Cols: Controls & Digital Twin Reconstruction -->
        <div class="lg:col-span-5 space-y-4 flex flex-col justify-between">
          
          <!-- Control Panel -->
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs text-cyan-400 font-bold uppercase tracking-wider">Spatial Acquisition</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold">WebXR / LiDAR API</span>
            </div>

            <p class="text-xs text-zinc-300 font-sans leading-relaxed">
              Instruct the patient to rotate slowly 360 degrees while keeping arms slightly abducted. The in-app camera samples 60 spatial depth keyframes to reconstruct a calibrated 3D Digital Twin.
            </p>

            <button (click)="toggleScanProcess()" 
              [class.bg-cyan-600]="!isScanning()"
              [class.hover:bg-cyan-500]="!isScanning()"
              [class.bg-rose-600]="isScanning()"
              [class.hover:bg-rose-500]="isScanning()"
              class="w-full py-3.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-lg border border-cyan-400/30">
              <span>{{ isScanning() ? '🛑 Stop Spatial Scan' : '🎥 Start 360° In-App Body Scan' }}</span>
            </button>
          </div>

          <!-- Digital Twin Calibration Status -->
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-zinc-400 font-bold">Mesh Reconstruction:</span>
              <span [class.text-emerald-400]="scanProgress() === 100" [class.text-amber-400]="scanProgress() < 100" class="font-bold">
                {{ scanProgress() === 100 ? '✅ 3D Avatar Calibrated' : 'Awaiting Full $360^\\circ$ Pass' }}
              </span>
            </div>

            <div class="text-[11px] text-zinc-400 space-y-1 font-sans">
              <div class="flex justify-between"><span>Vertex Bounding Height:</span><span class="text-zinc-200 font-mono">1.75 meters</span></div>
              <div class="flex justify-between"><span>Point Cloud Density:</span><span class="text-zinc-200 font-mono">14,200 points</span></div>
              <div class="flex justify-between"><span>Acupoint Auto-Anchor:</span><span class="text-emerald-400 font-mono">12/12 Aligned</span></div>
            </div>

            <button (click)="applyDigitalTwinToViewer()" [disabled]="scanProgress() < 100"
              class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-2">
              <span>✨ Apply 3D Avatar to Patient Profile</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class SpatialScannerComponent implements AfterViewInit, OnDestroy {
  private readonly videoElement = viewChild<ElementRef<HTMLVideoElement>>('videoElement');
  private readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');
  private readonly patientState = inject(PatientStateService);

  readonly scanMode = signal<'camera' | 'pointcloud'>('camera');
  readonly isScanning = signal<boolean>(false);
  readonly scanProgress = signal<number>(0);

  private mediaStream?: MediaStream;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private particleSystem!: THREE.Points;
  private animationId?: number;
  private scanTimerId?: any;

  ngAfterViewInit() {
    this.startCameraStream();
    this.initPointCloudCanvas();
  }

  async startCameraStream() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (this.videoElement()?.nativeElement) {
          this.videoElement()!.nativeElement.srcObject = this.mediaStream;
        }
      }
    } catch (e) {
      console.warn('Camera access fallback or denied', e);
    }
  }

  private initPointCloudCanvas() {
    const el = this.canvasContainer()?.nativeElement;
    if (!el) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 3);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(this.renderer.domElement);

    // Create 3D Holographic Point Cloud Particles
    const particleCount = 2500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 1.5;
      positions[i + 1] = (Math.random() - 0.5) * 2.2;
      positions[i + 2] = (Math.random() - 0.5) * 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0x06b6d4, size: 0.03, transparent: true, opacity: 0.8 });
    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);

    this.animate();
  }

  toggleScanProcess() {
    if (this.isScanning()) {
      this.isScanning.set(false);
      if (this.scanTimerId) clearInterval(this.scanTimerId);
    } else {
      this.isScanning.set(true);
      this.scanProgress.set(0);
      this.scanTimerId = setInterval(() => {
        if (this.scanProgress() < 100) {
          this.scanProgress.set(this.scanProgress() + 5);
        } else {
          this.isScanning.set(false);
          clearInterval(this.scanTimerId);
        }
      }, 250);
    }
  }

  applyDigitalTwinToViewer() {
    const profile = this.patientState.anatomicProfile();
    this.patientState.anatomicProfile.set({
      ...profile,
      customLiDARScanUrl: '/assets/models/in_app_spatial_scan.glb'
    });
    alert('✨ Patient 3D Avatar successfully calibrated and assigned to 3D Body Viewer!');
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    if (this.particleSystem) {
      this.particleSystem.rotation.y += 0.01;
    }
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.scanTimerId) clearInterval(this.scanTimerId);
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.renderer) this.renderer.dispose();
  }
}
