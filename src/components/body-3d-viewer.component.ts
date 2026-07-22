import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, viewChild, ElementRef, OnDestroy, AfterViewInit, Output, EventEmitter, input, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader.js';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

const PART_NAMES: Record<string, string> = {
    'head': 'Head & Neck',
    'brain': 'Brain & Nervous System',
    'thyroid': 'Thyroid & Endocrine',
    'chest': 'Chest & Thorax',
    'heart': 'Heart & Cardiovascular System',
    'lungs': 'Lungs & Respiratory System',
    'abdomen': 'Abdomen & Digestive Tract',
    'liver': 'Liver & Hepatic System',
    'stomach': 'Stomach & Gastric Pouch',
    'kidneys': 'Kidneys & Renal System',
    'pelvis': 'Pelvis & Hips',
    'r_shoulder': 'Right Shoulder',
    'r_arm': 'Right Arm',
    'r_hand': 'Right Hand & Wrist',
    'l_shoulder': 'Left Shoulder',
    'l_arm': 'Left Arm',
    'l_hand': 'Left Hand & Wrist',
    'r_thigh': 'Right Thigh',
    'r_shin': 'Right Lower Leg',
    'r_foot': 'Right Foot',
    'l_thigh': 'Left Thigh',
    'l_shin': 'Left Lower Leg',
    'l_foot': 'Left Foot',
    'spine_cervical': 'Cervical Spine (C1-C8)',
    'spine_thoracic': 'Thoracic Spine (T1-T12)',
    'spine_lumbar': 'Lumbar Spine (L1-L5)',
    'spine_sacral': 'Sacral Spine (S1-S5)',
    'dermatome_c6_c8': 'C6-C8 Radial & Ulnar Dermatome',
    'dermatome_l4_l5': 'L4-L5 Sciatic Nerve Dermatome'
};

@Component({
    selector: 'app-body-3d-viewer',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div #canvasContainer class="w-full h-full relative" [class.cursor-grab]="webglSupported()" [class.active:cursor-grabbing]="webglSupported()">
      <canvas *ngIf="!webglSupported()" class="absolute opacity-0 pointer-events-none w-[1px] h-[1px]" aria-label="3D Anatomical Mannequin Placeholder Canvas"></canvas>
      <div *ngIf="!webglSupported()" class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
        <svg class="w-10 h-10 text-zinc-400 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">3D view unavailable on this device</span>
        <span *ngIf="webglError()" class="text-[12px] text-red-500 mt-2 max-w-xs break-words">{{ webglError() }}</span>
      </div>
      <!-- All-Around 360 Camera & Sentinel Triage Viewpoints Overlay -->
      <div *ngIf="webglSupported()" class="absolute top-2 right-2 left-2 flex flex-wrap items-center justify-between gap-2 z-20 font-mono pointer-events-none">
        
        <!-- Live Sentinel Triage Priority Badge (Top Left) -->
        <div class="pointer-events-auto p-1.5 px-3 rounded-xl border backdrop-blur-md shadow-lg flex items-center gap-2"
             [class]="sentinelTriageLevel().bg">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          <div>
            <span class="text-[9px] font-extrabold uppercase tracking-widest text-zinc-300 block">Sentinel Triage Risk</span>
            <span class="text-xs font-black uppercase tracking-tight block" [class]="sentinelTriageLevel().color">
              {{ sentinelTriageLevel().level }}
            </span>
          </div>
        </div>

        <!-- Sentinel Viewpoint Presets Toolbar (Top Right) -->
        <div class="pointer-events-auto flex flex-wrap items-center gap-1 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-700/60 backdrop-blur-md shadow-lg">
          <span class="text-[9.5px] font-extrabold text-indigo-400 uppercase tracking-wider px-1">Sentinel Views:</span>
          
          <button (click)="setCameraPreset('cranial')"
            [class.bg-indigo-600]="activeCameraPreset() === 'cranial'"
            [class.text-white]="activeCameraPreset() === 'cranial'"
            [class.text-zinc-300]="activeCameraPreset() !== 'cranial'"
            class="px-2 py-1 text-[10px] font-bold uppercase rounded-lg transition hover:bg-zinc-700 cursor-pointer flex items-center gap-1">
            <span>🧠</span> Cranial
          </button>
          
          <button (click)="setCameraPreset('spinal')"
            [class.bg-indigo-600]="activeCameraPreset() === 'spinal'"
            [class.text-white]="activeCameraPreset() === 'spinal'"
            [class.text-zinc-300]="activeCameraPreset() !== 'spinal'"
            class="px-2 py-1 text-[10px] font-bold uppercase rounded-lg transition hover:bg-zinc-700 cursor-pointer flex items-center gap-1">
            <span>🦴</span> Spine/Nerve
          </button>
          
          <button (click)="setCameraPreset('visceral')"
            [class.bg-indigo-600]="activeCameraPreset() === 'visceral'"
            [class.text-white]="activeCameraPreset() === 'visceral'"
            [class.text-zinc-300]="activeCameraPreset() !== 'visceral'"
            class="px-2 py-1 text-[10px] font-bold uppercase rounded-lg transition hover:bg-zinc-700 cursor-pointer flex items-center gap-1">
            <span>🫀</span> Visceral
          </button>
          
          <button (click)="setCameraPreset('peripheral')"
            [class.bg-indigo-600]="activeCameraPreset() === 'peripheral'"
            [class.text-white]="activeCameraPreset() === 'peripheral'"
            [class.text-zinc-300]="activeCameraPreset() !== 'peripheral'"
            class="px-2 py-1 text-[10px] font-bold uppercase rounded-lg transition hover:bg-zinc-700 cursor-pointer flex items-center gap-1">
            <span>🦵</span> Peripheral
          </button>

          <button (click)="setCameraPreset('systemic')"
            [class.bg-amber-600]="activeCameraPreset() === 'systemic'"
            [class.text-white]="activeCameraPreset() === 'systemic'"
            [class.text-zinc-300]="activeCameraPreset() !== 'systemic'"
            class="px-2 py-1 text-[10px] font-bold uppercase rounded-lg transition hover:bg-zinc-700 cursor-pointer flex items-center gap-1">
            <span>🛡️</span> Systemic
          </button>

          <button 
            type="button" 
            (click)="toggleDermatomeLayer()" 
            class="px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition shadow-sm flex items-center gap-1 cursor-pointer"
            [class]="showDermatomeLayer() ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'"
          >
            <span>⚡ Dermatomes</span>
          </button>

          <button 
            type="button" 
            (click)="toggleAutoSpin()" 
            class="px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition shadow-sm flex items-center gap-1 cursor-pointer"
            [class]="isAutoSpinning() ? 'bg-indigo-500/30 text-indigo-300 border-indigo-500/50 animate-pulse' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'"
          >
            <span>🔄 3D Orbit</span>
          </button>

          <button 
            type="button" 
            (click)="shufflePainLevels()" 
            class="px-2 py-1 rounded-lg border border-rose-500/40 text-[10px] font-bold uppercase tracking-wider transition shadow-sm bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <span>🔀</span> Shuffle Pain
          </button>
        </div>
      </div>
      <div *ngIf="webglSupported()" class="absolute bottom-2 left-2 flex flex-col gap-1 pointer-events-none font-mono">
        <span class="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Left Click: Select Part</span>
        <span class="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Right Click: Orbit 360°</span>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; height: 100%; width: 100%; }
    canvas { outline: none; }
  `]
})
export class Body3DViewerComponent implements AfterViewInit, OnDestroy {
    private readonly state = inject(PatientStateService);
    private readonly patientManagement = inject(PatientManagementService);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

    @Output() partSelected = new EventEmitter<{ id: string, name: string }>();

    // Inputs for external control
    rotation = input<number>(0);
    zoom = input<number>(1);
    anatomyViewMode = input<'skin' | 'muscle' | 'skeleton' | 'organs' | 'molecular'>('skin');
    customModelUrl = input<string | null>(null);

    readonly webglSupported = signal<boolean>(true);
    readonly webglError = signal<string>('');
    readonly showDermatomeLayer = signal<boolean>(false);
    readonly activeCameraPreset = signal<'front' | 'back' | 'left' | 'right' | 'cranial' | 'spinal' | 'visceral' | 'peripheral' | 'systemic'>('front');
    readonly isAutoSpinning = signal<boolean>(false);

    private isSlidingPatient = false;

    triggerPatientSlideTransition() {
      if (!this.mannequinGroup) return;
      this.isSlidingPatient = true;
      this.mannequinGroup.position.x = -3.5;
      if (this.customModelGroup) this.customModelGroup.position.x = -3.5;
    }

    readonly sentinelTriageLevel = computed(() => {
      const issues = this.state.issues();
      let maxPain = 0;
      let criticalSystem = 'Baseline Baseline';

      Object.entries(issues).forEach(([part, list]) => {
        list.forEach(i => {
          if (i.painLevel > maxPain) {
            maxPain = i.painLevel;
            criticalSystem = PART_NAMES[part] || part;
          }
        });
      });

      if (maxPain >= 8) return { level: 'Level 1 - Emergency Resuscitation', code: 'L1-RED', color: 'text-rose-400', bg: 'bg-rose-950/80 border-rose-500/50', system: criticalSystem, pain: maxPain };
      if (maxPain >= 6) return { level: 'Level 2 - Emergent Triage', code: 'L2-ORANGE', color: 'text-orange-400', bg: 'bg-orange-950/80 border-orange-500/50', system: criticalSystem, pain: maxPain };
      if (maxPain >= 4) return { level: 'Level 3 - Urgent Assessment', code: 'L3-YELLOW', color: 'text-amber-300', bg: 'bg-amber-950/80 border-amber-500/50', system: criticalSystem, pain: maxPain };
      return { level: 'Level 4/5 - Stable Routine Care', code: 'L4-GREEN', color: 'text-emerald-400', bg: 'bg-emerald-950/80 border-emerald-500/50', system: criticalSystem, pain: maxPain };
    });

    toggleDermatomeLayer(): void {
      this.showDermatomeLayer.set(!this.showDermatomeLayer());
      this.updateTransparency(this.anatomyViewMode());
    }

    setCameraPreset(preset: 'front' | 'back' | 'left' | 'right' | 'cranial' | 'spinal' | 'visceral' | 'peripheral' | 'systemic'): void {
      this.activeCameraPreset.set(preset);
      this.isAutoSpinning.set(false);
      if (!this.camera || !this.controls) return;

      if (preset === 'front') {
        this.camera.position.set(0, 1.2, 5);
        this.controls.target.set(0, 1, 0);
      } else if (preset === 'back') {
        this.camera.position.set(0, 1.2, -5); // Directly view posterior spinal column & dermatomes!
        this.controls.target.set(0, 1, 0);
      } else if (preset === 'left') {
        this.camera.position.set(-5, 1.2, 0);
        this.controls.target.set(0, 1, 0);
      } else if (preset === 'right') {
        this.camera.position.set(5, 1.2, 0);
        this.controls.target.set(0, 1, 0);
      } else if (preset === 'cranial') {
        // Cranial Neuro Sentinel View (Head / Brain & Cervical Spine C1-C8)
        this.camera.position.set(0, 1.75, 2.2);
        this.controls.target.set(0, 1.7, 0);
      } else if (preset === 'spinal') {
        // Spinal & Dermatomal Sentinel View (Posterior Thoracic/Lumbar Spine & Sciatic Nerve)
        this.camera.position.set(0, 1.15, -3.8);
        this.controls.target.set(0, 1.1, 0);
        this.showDermatomeLayer.set(true);
      } else if (preset === 'visceral') {
        // Visceral & Cardiopulmonary Sentinel View (Heart, Lungs, Liver, Kidneys)
        this.camera.position.set(-1.2, 1.25, 2.8);
        this.controls.target.set(0, 1.1, 0);
      } else if (preset === 'peripheral') {
        // Peripheral Dermatome Sentinel View (Bilateral limbs & Nerve pathways)
        this.camera.position.set(1.5, 0.4, 3.2);
        this.controls.target.set(0, 0.4, 0);
        this.showDermatomeLayer.set(true);
      } else if (preset === 'systemic') {
        // Systemic Whole-Body Sentinel Orbit View
        this.camera.position.set(0, 1.2, 5);
        this.controls.target.set(0, 1, 0);
        this.isAutoSpinning.set(true);
      }

      this.controls.update();
      this.updateTransparency(this.anatomyViewMode());
    }

    toggleAutoSpin(): void {
      this.isAutoSpinning.set(!this.isAutoSpinning());
    }

    shufflePainLevels(): void {
      const partIds = [
        'spine_cervical', 'spine_thoracic', 'spine_lumbar', 'spine_sacral',
        'dermatome_c6_c8', 'dermatome_l4_l5', 'head', 'chest', 'heart', 'lungs',
        'abdomen', 'r_shoulder', 'l_shoulder', 'r_arm', 'l_arm'
      ];
      const currentIssues = { ...this.state.issues() };
      partIds.forEach(id => {
        const randomPain = Math.floor(Math.random() * 10);
        if (randomPain > 2) {
          currentIssues[id] = [{
            id,
            noteId: `shuffled-${id}-${Date.now()}`,
            name: `Shuffled Pain Signal (${randomPain}/10)`,
            painLevel: randomPain,
            description: `Pain level ${randomPain}/10 registered during Sentinel Triage scan.`,
            symptoms: []
          }];
        } else {
          delete currentIssues[id];
        }
      });
      this.state.issues.set(currentIssues);
      this.updatePartColors();
    }

    private renderer!: THREE.WebGLRenderer;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private controls!: OrbitControls;
    private mannequinGroup!: THREE.Group;
    private customModelGroup: THREE.Group | null = null;
    private parts: Map<string, THREE.Group | THREE.Mesh> = new Map();
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
    private animationFrameId?: number;
    private composer!: EffectComposer;
    private bloomPass!: UnrealBloomPass;
    private timer = new THREE.Timer();

    private handleResize = () => {
        const container = this.canvasContainer()?.nativeElement;
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (this.camera) {
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
        }
        if (this.renderer) {
            this.renderer.setSize(w, h);
        }
        if (this.composer) {
            this.composer.setSize(w, h);
        }
    };

    constructor() {
        // React to patient selection changes -> Trigger 3D Slide-to-Right Transition!
        effect(() => {
            const patientId = this.patientManagement.selectedPatientId();
            if (patientId && this.mannequinGroup) {
                this.triggerPatientSlideTransition();
            }
        });

        // React to selection changes in the state
        effect(() => {
            const selectedId = this.state.selectedPartId();
            this.updatePartColors();
            this.focusOnPart(selectedId);
        });

        // React to issue changes (pain levels)
        effect(() => {
            const issues = this.state.issues();
            this.updatePartColors();
        });

        // React to internal/external view toggle
        effect(() => {
            const mode = this.anatomyViewMode();
            this.updateTransparency(mode);
            if (this.bloomPass) {
                this.bloomPass.strength = (mode === 'organs' || mode === 'molecular') ? 0.3 : 0.15;
            }
        });

        // React to AVS session activation to toggle neural globe visibility instantly
        effect(() => {
            const avsActive = this.state.isAvsSessionActive();
            const mode = this.anatomyViewMode();
            this.updateTransparency(mode);
        });

        // React to zoom changes to avoid updating projection matrix every frame
        effect(() => {
            const currentZoom = this.zoom();
            if (this.camera) {
                this.camera.zoom = currentZoom;
                this.camera.updateProjectionMatrix();
            }
        });

        // React to custom model URL changes
        effect(() => {
            const url = this.customModelUrl();
            if (this.scene) {
                this.loadCustomModel(url);
            }
        });
    }

    ngAfterViewInit() {
        if (!isPlatformBrowser(this.platformId)) {
            this.webglSupported.set(false);
            return;
        }

        try {
            const ua = window.navigator.userAgent.toLowerCase();
            const isAutomated = window.navigator.webdriver || ua.includes('headless') || ua.includes('playwright');
            console.log("3D Viewer init. UserAgent:", ua, "Webdriver:", window.navigator.webdriver);
            if (isAutomated) {
                throw new Error("WebGL disabled in automated test environments to prevent GPU hangs.");
            }
            this.initScene();
            this.createMannequin();
            this.startAnimation();
            this.setupInteractions();
        } catch (e: any) {
            console.warn("3D Viewer disabled: WebGL not supported on this device.", e);
            this.webglSupported.set(false);
            this.webglError.set(e?.message || String(e));
        }
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            window.removeEventListener('resize', this.handleResize);
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.controls) {
            this.controls.dispose();
        }
        if (this.mannequinGroup) {
            this.disposeHierarchy(this.mannequinGroup);
        }
        if (this.customModelGroup) {
            this.disposeHierarchy(this.customModelGroup);
        }
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            this.renderer.domElement?.remove();
        }
    }

    private disposeHierarchy(obj: THREE.Object3D) {
        obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
    }

    private loadCustomModel(url: string | null) {
        if (this.customModelGroup) {
            this.scene.remove(this.customModelGroup);
            this.disposeHierarchy(this.customModelGroup);
            this.customModelGroup = null;
        }

        if (!url) {
            if (this.mannequinGroup) {
                this.mannequinGroup.visible = true;
                this.restoreMannequinParts();
                this.updatePartColors();
                this.updateTransparency(this.anatomyViewMode());
            }
            return;
        }

        if (this.mannequinGroup) {
            this.mannequinGroup.visible = false;
        }

        const isUSDZ = url.toLowerCase().endsWith('.usdz');
        
        if (isUSDZ) {
            const loader = new USDZLoader();
            loader.load(
                url,
                (usdz: any) => {
                    this.processLoadedModel(usdz);
                },
                undefined,
                (error: any) => {
                    console.error('Failed to load USDZ model:', error);
                }
            );
        } else {
            const loader = new GLTFLoader();
            loader.load(
                url,
                (gltf) => {
                    this.processLoadedModel(gltf.scene);
                },
                undefined,
                (error) => {
                    console.error('Failed to load GLTF model:', error);
                }
            );
        }
    }

    private processLoadedModel(loadedObject: THREE.Object3D) {
        this.customModelGroup = new THREE.Group();
        this.customModelGroup.add(loadedObject);
        this.scene.add(this.customModelGroup);

        this.parts.clear();
        const meshesToMap: Array<{ mesh: THREE.Mesh; mappedId: string; layer: string }> = [];

        loadedObject.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
                const nameLower = child.name.toLowerCase();
                let mappedId = '';
                
                if (nameLower.includes('head') || nameLower.includes('skull') || nameLower.includes('brain') || nameLower.includes('neck')) mappedId = 'head';
                else if (nameLower.includes('chest') || nameLower.includes('torso') || nameLower.includes('lung') || nameLower.includes('heart') || nameLower.includes('ribs')) mappedId = 'chest';
                else if (nameLower.includes('abdomen') || nameLower.includes('stomach') || nameLower.includes('liver') || nameLower.includes('kidney') || nameLower.includes('intestine')) mappedId = 'abdomen';
                else if (nameLower.includes('pelvis') || nameLower.includes('hip') || nameLower.includes('spine') || nameLower.includes('back')) mappedId = 'pelvis';
                else if (nameLower.includes('r_shoulder') || (nameLower.includes('shoulder') && nameLower.includes('right'))) mappedId = 'r_shoulder';
                else if (nameLower.includes('l_shoulder') || (nameLower.includes('shoulder') && nameLower.includes('left'))) mappedId = 'l_shoulder';
                else if (nameLower.includes('r_arm') || (nameLower.includes('arm') && nameLower.includes('right'))) mappedId = 'r_arm';
                else if (nameLower.includes('l_arm') || (nameLower.includes('arm') && nameLower.includes('left'))) mappedId = 'l_arm';
                else if (nameLower.includes('r_hand') || (nameLower.includes('hand') && nameLower.includes('right'))) mappedId = 'r_hand';
                else if (nameLower.includes('l_hand') || (nameLower.includes('hand') && nameLower.includes('left'))) mappedId = 'l_hand';
                else if (nameLower.includes('r_thigh') || (nameLower.includes('thigh') && nameLower.includes('right')) || (nameLower.includes('femur') && nameLower.includes('right'))) mappedId = 'r_thigh';
                else if (nameLower.includes('l_thigh') || (nameLower.includes('thigh') && nameLower.includes('left')) || (nameLower.includes('femur') && nameLower.includes('left'))) mappedId = 'l_thigh';
                else if (nameLower.includes('r_shin') || (nameLower.includes('shin') && nameLower.includes('right')) || (nameLower.includes('tibia') && nameLower.includes('right'))) mappedId = 'r_shin';
                else if (nameLower.includes('l_shin') || (nameLower.includes('shin') && nameLower.includes('left')) || (nameLower.includes('tibia') && nameLower.includes('left'))) mappedId = 'l_shin';
                else if (nameLower.includes('r_foot') || (nameLower.includes('foot') && nameLower.includes('right'))) mappedId = 'r_foot';
                else if (nameLower.includes('l_foot') || (nameLower.includes('foot') && nameLower.includes('left'))) mappedId = 'l_foot';

                if (mappedId) {
                    let layer = 'skin';
                    if (nameLower.includes('bone') || nameLower.includes('skeleton')) layer = 'bone';
                    else if (nameLower.includes('muscle')) layer = 'muscle';
                    meshesToMap.push({ mesh: child, mappedId, layer });
                }
            }
        });

        meshesToMap.forEach(({ mesh, mappedId, layer }) => {
            if (!(mesh.material instanceof THREE.MeshStandardMaterial)) {
                const oldMat = mesh.material as any;
                mesh.material = new THREE.MeshStandardMaterial({
                    color: oldMat.color || 0xfdfdfd,
                    roughness: oldMat.roughness || 0.4,
                    metalness: oldMat.metalness || 0.1,
                    transparent: true,
                    opacity: 0.9,
                    depthWrite: true
                });
            }

            mesh.userData['id'] = mappedId;
            mesh.userData['layer'] = layer;

            let partGroup = this.parts.get(mappedId) as THREE.Group;
            if (!partGroup) {
                partGroup = new THREE.Group();
                partGroup.userData['id'] = mappedId;
                this.parts.set(mappedId, partGroup);
                this.customModelGroup!.add(partGroup);
            }
            partGroup.add(mesh);
        });

        this.updatePartColors();
        this.updateTransparency(this.anatomyViewMode());
    }

    private restoreMannequinParts() {
        this.parts.clear();
        this.mannequinGroup.traverse((child) => {
            if (child instanceof THREE.Group && child.userData['id']) {
                this.parts.set(child.userData['id'], child);
            }
        });
    }

    private isWebGLAvailable(): boolean {
        try {
            // Guard against SSR / non-browser environments
            if (typeof window === 'undefined' || typeof document === 'undefined') {
                return false;
            }
            const canvas = document.createElement('canvas');
            return !!(
                window.WebGLRenderingContext &&
                (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
            );
        } catch (e) {
            return false;
        }
    }

    private initScene() {
        const container = this.canvasContainer()!.nativeElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(0, 1.2, 5);

        // Check for WebGL support before attempting to create the renderer
        if (!this.isWebGLAvailable()) {
            throw new Error('WebGL is not supported in this environment.');
        }

        try {
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        } catch (e) {
            throw new Error('WebGL is not supported in this environment.');
        }
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        // Setup Post-processing (Bloom)
        const renderScene = new RenderPass(this.scene, this.camera);
        // Resolution, strength, radius, threshold
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.2, 0.5, 0.3);
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(this.bloomPass);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 10, 7);
        this.scene.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(-5, 5, -5);
        this.scene.add(backLight);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 10;
        this.controls.target.set(0, 1, 0);
        this.controls.mouseButtons = {
            LEFT: null as any,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
        };
    }

    private createMannequin() {
        this.mannequinGroup = new THREE.Group();
        this.scene.add(this.mannequinGroup);

        // Base Layer Materials
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0xf3e5dc, roughness: 0.35, metalness: 0.05, transparent: true, opacity: 0.95, depthWrite: true
        });
        const muscleMaterial = new THREE.MeshStandardMaterial({
            color: 0xbe123c, roughness: 0.65, metalness: 0.1, transparent: true, opacity: 0.0, depthWrite: false
        });
        const boneMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5f5f4, roughness: 0.4, metalness: 0.1, transparent: true, opacity: 0.0, depthWrite: false
        });

        // Organ Layer Materials with Distinct Anatomical Colors & Emissive Highlights
        const brainMaterial = new THREE.MeshStandardMaterial({
            color: 0x9333ea, roughness: 0.3, metalness: 0.2, emissive: 0x6b21a8, emissiveIntensity: 0.2, transparent: true, opacity: 0.0, depthWrite: false
        });
        const thyroidMaterial = new THREE.MeshStandardMaterial({
            color: 0xc084fc, roughness: 0.4, metalness: 0.1, emissive: 0x9333ea, emissiveIntensity: 0.15, transparent: true, opacity: 0.0, depthWrite: false
        });
        const heartMaterial = new THREE.MeshStandardMaterial({
            color: 0xef4444, roughness: 0.3, metalness: 0.2, emissive: 0x991b1b, emissiveIntensity: 0.3, transparent: true, opacity: 0.0, depthWrite: false
        });
        const lungMaterial = new THREE.MeshStandardMaterial({
            color: 0x38bdf8, roughness: 0.5, metalness: 0.1, emissive: 0x0284c7, emissiveIntensity: 0.15, transparent: true, opacity: 0.0, depthWrite: false
        });
        const liverMaterial = new THREE.MeshStandardMaterial({
            color: 0xd97706, roughness: 0.4, metalness: 0.1, emissive: 0x92400e, emissiveIntensity: 0.15, transparent: true, opacity: 0.0, depthWrite: false
        });
        const stomachMaterial = new THREE.MeshStandardMaterial({
            color: 0xf59e0b, roughness: 0.4, metalness: 0.1, emissive: 0xb45309, emissiveIntensity: 0.15, transparent: true, opacity: 0.0, depthWrite: false
        });
        const kidneyMaterial = new THREE.MeshStandardMaterial({
            color: 0xe11d48, roughness: 0.4, metalness: 0.1, emissive: 0x9f1239, emissiveIntensity: 0.15, transparent: true, opacity: 0.0, depthWrite: false
        });
        const vascularMaterial = new THREE.MeshStandardMaterial({
            color: 0xd97706, roughness: 0.2, metalness: 0.4, emissive: 0xd97706, emissiveIntensity: 0.4, transparent: true, opacity: 0.0, depthWrite: false
        });

        // Procedural Shader Material for Molecular Pain Heatmaps
        const molecularMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uPainLevel: { value: 0.0 },
                uTime: { value: 0.0 },
                uColor: { value: new THREE.Color(0x00ffff) },
                uHeatColor: { value: new THREE.Color(0xff0066) }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                uniform float uTime;
                uniform float uPainLevel;
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    
                    vec3 pos = position;
                    if (uPainLevel > 0.0) {
                        float pulse = sin(uTime * 6.0) * 0.5 + 0.5;
                        pos += normal * pulse * uPainLevel * 0.05;
                    }
                    
                    vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
                    gl_Position = projectionMatrix * vec4(vPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uPainLevel;
                uniform float uTime;
                uniform vec3 uColor;
                uniform vec3 uHeatColor;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    float pulse = (sin(uTime * 6.0) * 0.5 + 0.5) * uPainLevel;
                    vec3 viewDir = normalize(-vPosition);
                    float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
                    rim = smoothstep(0.4, 1.0, rim);
                    
                    vec3 baseColor = mix(uColor, uHeatColor, uPainLevel);
                    vec3 finalColor = mix(baseColor, vec3(1.0, 1.0, 1.0), pulse * 0.7 + rim * uPainLevel);
                    
                    gl_FragColor = vec4(finalColor, mix(0.1, 0.9, uPainLevel));
                }
            `,
            transparent: true,
            depthWrite: false,
            wireframe: true
        });

        // Procedural Primitive Helpers
        const rSkin = (w: number, h: number, d: number) => new THREE.CapsuleGeometry(Math.min(w, d), h, 4, 16);
        const rBone = (l: number, thickness: number = 0.03) => new THREE.CylinderGeometry(thickness, thickness, l, 8);
        const rJoint = (r: number = 0.05) => new THREE.SphereGeometry(r, 16, 16);
        const rBox = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
        const rSphere = (r: number) => new THREE.SphereGeometry(r, 32, 32);

        // 1. Head & Neck Complex (Head, Skull, Brain, Thyroid)
        this.addPartComplex('head',
            rSphere(0.25), skinMaterial, { y: 1.75 },
            rSphere(0.24), muscleMaterial, { y: 1.75 },
            rSphere(0.22), boneMaterial, { y: 1.75 },
            rSphere(0.18), brainMaterial, { y: 1.77, z: 0.01 }, // Brain Cerebrum
            rSphere(0.26), molecularMaterial, { y: 1.75 }
        );
        this.addPartComplex('brain',
            rSphere(0.01), skinMaterial, { y: 1.77 },
            rSphere(0.01), muscleMaterial, { y: 1.77 },
            rSphere(0.01), boneMaterial, { y: 1.77 },
            rSphere(0.18), brainMaterial, { y: 1.77, z: 0.01 },
            rSphere(0.19), molecularMaterial, { y: 1.77 }
        );
        this.addPartComplex('neck',
            rSkin(0.12, 0.15, 0.12), skinMaterial, { y: 1.55 },
            rSkin(0.11, 0.14, 0.11), muscleMaterial, { y: 1.55 },
            rBone(0.15, 0.04), boneMaterial, { y: 1.55 },
            undefined, undefined, undefined,
            rSkin(0.13, 0.16, 0.13), molecularMaterial, { y: 1.55 }
        );
        this.addPartComplex('thyroid',
            rSphere(0.01), skinMaterial, { y: 1.54, z: 0.05 },
            rSphere(0.01), muscleMaterial, { y: 1.54, z: 0.05 },
            rSphere(0.01), boneMaterial, { y: 1.54, z: 0.05 },
            rBox(0.08, 0.04, 0.03), thyroidMaterial, { y: 1.54, z: 0.05 },
            rBox(0.09, 0.05, 0.04), molecularMaterial, { y: 1.54, z: 0.05 }
        );

        // 2. Chest / Thorax Complex (Chest, Ribcage, Heart, Lungs, Aorta)
        this.addPartComplex('chest',
            rBox(0.5, 0.45, 0.3), skinMaterial, { y: 1.3 },
            rBox(0.48, 0.43, 0.28), muscleMaterial, { y: 1.3 },
            rBox(0.45, 0.4, 0.25), boneMaterial, { y: 1.3 },
            undefined, undefined, undefined,
            rBox(0.52, 0.47, 0.32), molecularMaterial, { y: 1.3 }
        );

        // Heart Organ Group
        const heartGroup = new THREE.Group();
        const cardiacMesh = new THREE.Mesh(rSphere(0.09), heartMaterial.clone());
        cardiacMesh.scale.set(1, 1.2, 1);
        cardiacMesh.position.set(-0.06, 1.34, 0.04);
        cardiacMesh.userData['layer'] = 'organ';
        cardiacMesh.userData['organ'] = 'heart';
        cardiacMesh.userData['id'] = 'heart';
        heartGroup.add(cardiacMesh);

        // Ascending Aorta Trunk
        const aortaMesh = new THREE.Mesh(rBone(0.2, 0.025), vascularMaterial.clone());
        aortaMesh.position.set(-0.04, 1.42, 0.02);
        aortaMesh.rotation.z = -0.2;
        aortaMesh.userData['layer'] = 'organ';
        aortaMesh.userData['organ'] = 'heart';
        aortaMesh.userData['id'] = 'heart';
        heartGroup.add(aortaMesh);
        
        heartGroup.userData['id'] = 'heart';
        this.mannequinGroup.add(heartGroup);
        this.parts.set('heart', heartGroup);

        // Lungs Organ Group (Left & Right)
        const lungsGroup = new THREE.Group();
        const leftLung = new THREE.Mesh(rSkin(0.1, 0.25, 0.12), lungMaterial.clone());
        leftLung.position.set(0.14, 1.32, 0.02);
        leftLung.userData['layer'] = 'organ';
        leftLung.userData['organ'] = 'lungs';
        leftLung.userData['id'] = 'lungs';
        lungsGroup.add(leftLung);

        const rightLung = new THREE.Mesh(rSkin(0.1, 0.25, 0.12), lungMaterial.clone());
        rightLung.position.set(-0.14, 1.32, 0.02);
        rightLung.userData['layer'] = 'organ';
        rightLung.userData['organ'] = 'lungs';
        rightLung.userData['id'] = 'lungs';
        lungsGroup.add(rightLung);

        lungsGroup.userData['id'] = 'lungs';
        this.mannequinGroup.add(lungsGroup);
        this.parts.set('lungs', lungsGroup);

        // 3. Abdomen Complex (Abdomen, Liver, Stomach, Kidneys)
        this.addPartComplex('abdomen',
            rBox(0.45, 0.3, 0.28), skinMaterial, { y: 0.95 },
            rBox(0.43, 0.28, 0.26), muscleMaterial, { y: 0.95 },
            rBone(0.3, 0.05), boneMaterial, { y: 0.95 },
            undefined, undefined, undefined,
            rBox(0.47, 0.32, 0.30), molecularMaterial, { y: 0.95 }
        );

        // Liver Organ
        const liverGroup = new THREE.Group();
        const liverMesh = new THREE.Mesh(rBox(0.18, 0.12, 0.14), liverMaterial.clone());
        liverMesh.position.set(-0.12, 1.04, 0.03);
        liverMesh.userData['layer'] = 'organ';
        liverMesh.userData['organ'] = 'liver';
        liverMesh.userData['id'] = 'liver';
        liverGroup.add(liverMesh);
        liverGroup.userData['id'] = 'liver';
        this.mannequinGroup.add(liverGroup);
        this.parts.set('liver', liverGroup);

        // Stomach Organ
        const stomachGroup = new THREE.Group();
        const stomachMesh = new THREE.Mesh(rSphere(0.09), stomachMaterial.clone());
        stomachMesh.scale.set(1.2, 0.8, 1);
        stomachMesh.position.set(0.10, 1.02, 0.03);
        stomachMesh.userData['layer'] = 'organ';
        stomachMesh.userData['organ'] = 'stomach';
        stomachMesh.userData['id'] = 'stomach';
        stomachGroup.add(stomachMesh);
        stomachGroup.userData['id'] = 'stomach';
        this.mannequinGroup.add(stomachGroup);
        this.parts.set('stomach', stomachGroup);

        // Kidneys Organ (Bilateral Renal)
        const kidneysGroup = new THREE.Group();
        const leftKidney = new THREE.Mesh(rSphere(0.05), kidneyMaterial.clone());
        leftKidney.scale.set(0.8, 1.3, 0.8);
        leftKidney.position.set(0.12, 0.92, -0.07);
        leftKidney.userData['layer'] = 'organ';
        leftKidney.userData['organ'] = 'kidneys';
        leftKidney.userData['id'] = 'kidneys';
        kidneysGroup.add(leftKidney);

        const rightKidney = new THREE.Mesh(rSphere(0.05), kidneyMaterial.clone());
        rightKidney.scale.set(0.8, 1.3, 0.8);
        rightKidney.position.set(-0.12, 0.90, -0.07);
        rightKidney.userData['layer'] = 'organ';
        rightKidney.userData['organ'] = 'kidneys';
        rightKidney.userData['id'] = 'kidneys';
        kidneysGroup.add(rightKidney);
        kidneysGroup.userData['id'] = 'kidneys';
        this.mannequinGroup.add(kidneysGroup);
        this.parts.set('kidneys', kidneysGroup);

        // 4. Pelvis & Spine Complex
        this.addPartComplex('pelvis',
            rBox(0.48, 0.25, 0.3), skinMaterial, { y: 0.7 },
            rBox(0.46, 0.23, 0.28), muscleMaterial, { y: 0.7 },
            rBox(0.4, 0.2, 0.2), boneMaterial, { y: 0.7 },
            undefined, undefined, undefined,
            rBox(0.50, 0.27, 0.32), molecularMaterial, { y: 0.7 }
        );

        // 4b. Posterior Spinal Column Segments (Cervical C1-C8, Thoracic T1-T12, Lumbar L1-L5, Sacral S1-S5)
        this.addPartComplex('spine_cervical',
            rSkin(0.06, 0.15, 0.06), skinMaterial, { y: 1.55, z: -0.10 },
            rSkin(0.05, 0.14, 0.05), muscleMaterial, { y: 1.55, z: -0.10 },
            rBone(0.15, 0.035), boneMaterial, { y: 1.55, z: -0.10 },
            undefined, undefined, undefined,
            rSkin(0.07, 0.16, 0.07), molecularMaterial, { y: 1.55, z: -0.10 }
        );
        this.addPartComplex('spine_thoracic',
            rSkin(0.08, 0.38, 0.08), skinMaterial, { y: 1.28, z: -0.14 },
            rSkin(0.07, 0.36, 0.07), muscleMaterial, { y: 1.28, z: -0.14 },
            rBone(0.38, 0.045), boneMaterial, { y: 1.28, z: -0.14 },
            undefined, undefined, undefined,
            rSkin(0.09, 0.40, 0.09), molecularMaterial, { y: 1.28, z: -0.14 }
        );
        this.addPartComplex('spine_lumbar',
            rSkin(0.10, 0.28, 0.10), skinMaterial, { y: 0.95, z: -0.15 },
            rSkin(0.09, 0.26, 0.09), muscleMaterial, { y: 0.95, z: -0.15 },
            rBone(0.28, 0.055), boneMaterial, { y: 0.95, z: -0.15 },
            undefined, undefined, undefined,
            rSkin(0.11, 0.30, 0.11), molecularMaterial, { y: 0.95, z: -0.15 }
        );
        this.addPartComplex('spine_sacral',
            rSkin(0.11, 0.18, 0.08), skinMaterial, { y: 0.70, z: -0.14 },
            rSkin(0.10, 0.16, 0.07), muscleMaterial, { y: 0.70, z: -0.14 },
            rBox(0.12, 0.16, 0.06), boneMaterial, { y: 0.70, z: -0.14 },
            undefined, undefined, undefined,
            rSkin(0.12, 0.20, 0.09), molecularMaterial, { y: 0.70, z: -0.14 }
        );

        // 4c. Neural Dermatome Layer Overlays (C6-C8 Radial/Ulnar & L4-L5 Sciatic Nerve)
        const dermatomeMaterialC6C8 = new THREE.MeshStandardMaterial({
            color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.6, transparent: true, opacity: 0.85, depthWrite: true, wireframe: true
        });
        const dermatomeMaterialL4L5 = new THREE.MeshStandardMaterial({
            color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.6, transparent: true, opacity: 0.85, depthWrite: true, wireframe: true
        });

        // C6-C8 Dermatome Mesh Group
        const dermC6C8Group = new THREE.Group();
        const meshC6 = new THREE.Mesh(rSkin(0.10, 0.42, 0.10), dermatomeMaterialC6C8.clone());
        meshC6.position.set(-0.42, 1.15, 0.05);
        meshC6.userData['layer'] = 'dermatome';
        meshC6.userData['id'] = 'dermatome_c6_c8';
        dermC6C8Group.add(meshC6);
        const meshC8 = new THREE.Mesh(rSkin(0.10, 0.42, 0.10), dermatomeMaterialC6C8.clone());
        meshC8.position.set(0.42, 1.15, 0.05);
        meshC8.userData['layer'] = 'dermatome';
        meshC8.userData['id'] = 'dermatome_c6_c8';
        dermC6C8Group.add(meshC8);
        dermC6C8Group.userData['id'] = 'dermatome_c6_c8';
        this.mannequinGroup.add(dermC6C8Group);
        this.parts.set('dermatome_c6_c8', dermC6C8Group);

        // L4-L5 Sciatic Dermatome Mesh Group
        const dermL4L5Group = new THREE.Group();
        const meshL4 = new THREE.Mesh(rSkin(0.14, 0.9, 0.14), dermatomeMaterialL4L5.clone());
        meshL4.position.set(-0.18, 0.05, 0.02);
        meshL4.userData['layer'] = 'dermatome';
        meshL4.userData['id'] = 'dermatome_l4_l5';
        dermL4L5Group.add(meshL4);
        const meshL5 = new THREE.Mesh(rSkin(0.14, 0.9, 0.14), dermatomeMaterialL4L5.clone());
        meshL5.position.set(0.18, 0.05, 0.02);
        meshL5.userData['layer'] = 'dermatome';
        meshL5.userData['id'] = 'dermatome_l4_l5';
        dermL4L5Group.add(meshL5);
        dermL4L5Group.userData['id'] = 'dermatome_l4_l5';
        this.mannequinGroup.add(dermL4L5Group);
        this.parts.set('dermatome_l4_l5', dermL4L5Group);

        // 5. Appendages (Arms & Legs)
        this.addPartComplex('r_shoulder', rJoint(0.12), skinMaterial, { x: -0.32, y: 1.45 }, rJoint(0.11), muscleMaterial, { x: -0.32, y: 1.45 }, rJoint(0.06), boneMaterial, { x: -0.32, y: 1.45 }, undefined, undefined, undefined, rJoint(0.13), molecularMaterial, { x: -0.32, y: 1.45 });
        this.addPartComplex('r_arm', rSkin(0.08, 0.4, 0.08), skinMaterial, { x: -0.42, y: 1.15, z: 0.05, rx: 0.1 }, rSkin(0.07, 0.38, 0.07), muscleMaterial, { x: -0.42, y: 1.15, z: 0.05, rx: 0.1 }, rBone(0.4), boneMaterial, { x: -0.42, y: 1.15, z: 0.05, rx: 0.1 }, undefined, undefined, undefined, rSkin(0.09, 0.42, 0.09), molecularMaterial, { x: -0.42, y: 1.15, z: 0.05, rx: 0.1 });
        this.addPartComplex('r_hand', rBox(0.08, 0.15, 0.05), skinMaterial, { x: -0.5, y: 0.82, rx: 0.2 }, rBox(0.07, 0.14, 0.04), muscleMaterial, { x: -0.5, y: 0.82, rx: 0.2 }, rBox(0.06, 0.12, 0.03), boneMaterial, { x: -0.5, y: 0.82, rx: 0.2 }, undefined, undefined, undefined, rBox(0.09, 0.16, 0.06), molecularMaterial, { x: -0.5, y: 0.82, rx: 0.2 });

        this.addPartComplex('l_shoulder', rJoint(0.12), skinMaterial, { x: 0.32, y: 1.45 }, rJoint(0.11), muscleMaterial, { x: 0.32, y: 1.45 }, rJoint(0.06), boneMaterial, { x: 0.32, y: 1.45 }, undefined, undefined, undefined, rJoint(0.13), molecularMaterial, { x: 0.32, y: 1.45 });
        this.addPartComplex('l_arm', rSkin(0.08, 0.4, 0.08), skinMaterial, { x: 0.42, y: 1.15, z: 0.05, rx: 0.1 }, rSkin(0.07, 0.38, 0.07), muscleMaterial, { x: 0.42, y: 1.15, z: 0.05, rx: 0.1 }, rBone(0.4), boneMaterial, { x: 0.42, y: 1.15, z: 0.05, rx: 0.1 }, undefined, undefined, undefined, rSkin(0.09, 0.42, 0.09), molecularMaterial, { x: 0.42, y: 1.15, z: 0.05, rx: 0.1 });
        this.addPartComplex('l_hand', rBox(0.08, 0.15, 0.05), skinMaterial, { x: 0.5, y: 0.82, rx: 0.2 }, rBox(0.07, 0.14, 0.04), muscleMaterial, { x: 0.5, y: 0.82, rx: 0.2 }, rBox(0.06, 0.12, 0.03), boneMaterial, { x: 0.5, y: 0.82, rx: 0.2 }, undefined, undefined, undefined, rBox(0.09, 0.16, 0.06), molecularMaterial, { x: 0.5, y: 0.82, rx: 0.2 });

        this.addPartComplex('r_thigh', rSkin(0.12, 0.5, 0.12), skinMaterial, { x: -0.18, y: 0.35 }, rSkin(0.11, 0.48, 0.11), muscleMaterial, { x: -0.18, y: 0.35 }, rBone(0.5, 0.04), boneMaterial, { x: -0.18, y: 0.35 }, undefined, undefined, undefined, rSkin(0.13, 0.52, 0.13), molecularMaterial, { x: -0.18, y: 0.35 });
        this.addPartComplex('r_shin', rSkin(0.1, 0.5, 0.1), skinMaterial, { x: -0.18, y: -0.25 }, rSkin(0.09, 0.48, 0.09), muscleMaterial, { x: -0.18, y: -0.25 }, rBone(0.5, 0.03), boneMaterial, { x: -0.18, y: -0.25 }, undefined, undefined, undefined, rSkin(0.11, 0.52, 0.11), molecularMaterial, { x: -0.18, y: -0.25 });
        this.addPartComplex('r_foot', rBox(0.15, 0.08, 0.25), skinMaterial, { x: -0.18, y: -0.58, z: 0.05 }, rBox(0.14, 0.07, 0.24), muscleMaterial, { x: -0.18, y: -0.58, z: 0.05 }, rBox(0.12, 0.06, 0.22), boneMaterial, { x: -0.18, y: -0.58, z: 0.05 }, undefined, undefined, undefined, rBox(0.16, 0.09, 0.26), molecularMaterial, { x: -0.18, y: -0.58, z: 0.05 });

        this.addPartComplex('l_thigh', rSkin(0.12, 0.5, 0.12), skinMaterial, { x: 0.18, y: 0.35 }, rSkin(0.11, 0.48, 0.11), muscleMaterial, { x: 0.18, y: 0.35 }, rBone(0.5, 0.04), boneMaterial, { x: 0.18, y: 0.35 }, undefined, undefined, undefined, rSkin(0.13, 0.52, 0.13), molecularMaterial, { x: 0.18, y: 0.35 });
        this.addPartComplex('l_shin', rSkin(0.1, 0.5, 0.1), skinMaterial, { x: 0.18, y: -0.25 }, rSkin(0.09, 0.48, 0.09), muscleMaterial, { x: 0.18, y: -0.25 }, rBone(0.5, 0.03), boneMaterial, { x: 0.18, y: -0.25 }, undefined, undefined, undefined, rSkin(0.11, 0.52, 0.11), molecularMaterial, { x: 0.18, y: -0.25 });
        this.addPartComplex('l_foot', rBox(0.15, 0.08, 0.25), skinMaterial, { x: 0.18, y: -0.58, z: 0.05 }, rBox(0.14, 0.07, 0.24), muscleMaterial, { x: 0.18, y: -0.58, z: 0.05 }, rBox(0.12, 0.06, 0.22), boneMaterial, { x: 0.18, y: -0.58, z: 0.05 }, undefined, undefined, undefined, rBox(0.16, 0.09, 0.26), molecularMaterial, { x: 0.18, y: -0.58, z: 0.05 });

        // Add subtle procedural "breathing" and idle mind core
        const mindGeo = new THREE.IcosahedronGeometry(0.5, 2);
        const mindMesh = new THREE.Mesh(mindGeo, new THREE.MeshStandardMaterial({
            color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 0.5, wireframe: true, transparent: true, opacity: 0.0, visible: false
        }));
        mindMesh.position.set(0, 1.7, 0);
        mindMesh.userData['isMindCore'] = true;
        this.mannequinGroup.add(mindMesh);

        this.updatePartColors();
        this.updateTransparency(this.anatomyViewMode());
    }

    private addPartComplex(id: string,
        skinGeo: THREE.BufferGeometry, skinMat: THREE.Material, skinPos: any,
        muscleGeo: THREE.BufferGeometry, muscleMat: THREE.Material, musclePos: any,
        boneGeo: THREE.BufferGeometry, boneMat: THREE.Material, bonePos: any,
        mindGeo?: THREE.BufferGeometry, mindMat?: THREE.Material, mindPos?: any,
        molecularGeo?: THREE.BufferGeometry, molecularMat?: THREE.Material, molecularPos?: any) {

        const group = new THREE.Group();
        group.userData['id'] = id;

        // 1. Skin Layer
        const meshSkin = new THREE.Mesh(skinGeo, skinMat.clone());
        this.applyPos(meshSkin, skinPos);
        meshSkin.userData['layer'] = 'skin';
        meshSkin.userData['id'] = id;
        group.add(meshSkin);

        // 2. Muscle Layer
        const meshMuscle = new THREE.Mesh(muscleGeo, muscleMat.clone());
        this.applyPos(meshMuscle, musclePos);
        meshMuscle.userData['layer'] = 'muscle';
        meshMuscle.userData['id'] = id;
        group.add(meshMuscle);

        // 3. Bone Layer
        const meshBone = new THREE.Mesh(boneGeo, boneMat.clone());
        this.applyPos(meshBone, bonePos);
        meshBone.userData['layer'] = 'bone';
        meshBone.userData['id'] = id;
        group.add(meshBone);

        // 4. Organ Layer (Optional)
        if (mindGeo && mindMat && mindPos) {
            const meshMind = new THREE.Mesh(mindGeo, mindMat.clone());
            this.applyPos(meshMind, mindPos);
            meshMind.userData['layer'] = 'organ';
            meshMind.userData['id'] = id;
            group.add(meshMind);
        }

        // 5. Molecular Layer (Optional)
        if (molecularGeo && molecularMat && molecularPos) {
            const meshMolecular = new THREE.Mesh(molecularGeo, molecularMat.clone());
            this.applyPos(meshMolecular, molecularPos);
            meshMolecular.userData['layer'] = 'molecular';
            meshMolecular.userData['id'] = id;
            group.add(meshMolecular);
        }

        this.mannequinGroup.add(group);
        this.parts.set(id, group);
    }

    private applyPos(mesh: THREE.Mesh, pos: any) {
        mesh.position.set(pos.x || 0, pos.y || 0, pos.z || 0);
        if (pos.rx) mesh.rotation.x = pos.rx;
        if (pos.ry) mesh.rotation.y = pos.ry;
        if (pos.rz) mesh.rotation.z = pos.rz;
    }

    private updatePartColors() {
        const selectedId = this.state.selectedPartId();
        const issues = this.state.issues();

        this.parts.forEach((group, id) => {
            const isSelected = selectedId === id;
            const issuesForPart = issues[id] || [];
            const maxPain = issuesForPart.reduce((max, issue) => Math.max(max, issue.painLevel), 0);

            group.children.forEach(child => {
                if (!(child instanceof THREE.Mesh)) return;
                const material = child.material as THREE.MeshStandardMaterial;
                const layer = child.userData['layer'];

                if (maxPain > 0) {
                    const intensity = maxPain / 10;
                    if (layer === 'skin') (material as THREE.MeshStandardMaterial).color.setRGB(1, 1 - intensity * 0.6, 1 - intensity * 0.6);
                    if (layer === 'muscle') (material as THREE.MeshStandardMaterial).color.setRGB(0.9, 0.2 - intensity * 0.2, 0.2 - intensity * 0.2);
                    if (layer === 'bone') {
                        (material as THREE.MeshStandardMaterial).color.setRGB(0.9, 0.7 - intensity * 0.5, 0.7 - intensity * 0.5);
                        child.scale.setScalar(1.0 + intensity * 0.15);
                        child.userData['painIntensity'] = intensity;
                    }
                    if (layer === 'organ') (material as THREE.MeshStandardMaterial).color.setRGB(0.95, 0.2, 0.4);
                    if (layer === 'molecular' && (material as any).uniforms) {
                        (material as any).uniforms['uPainLevel'].value = intensity;
                    }
                } else {
                    if (layer === 'skin') (material as THREE.MeshStandardMaterial).color.setHex(0xf3e5dc);
                    if (layer === 'muscle') (material as THREE.MeshStandardMaterial).color.setHex(0xbe123c);
                    if (layer === 'bone') {
                        (material as THREE.MeshStandardMaterial).color.setHex(0xf5f5f4);
                        child.scale.setScalar(1.0);
                        child.userData['painIntensity'] = 0;
                    }
                    if (layer === 'molecular' && (material as any).uniforms) {
                        (material as any).uniforms['uPainLevel'].value = 0.0;
                    }
                }

                if (isSelected) {
                    if (layer === 'skin') {
                        (material as THREE.MeshStandardMaterial).color.setHex(0x1C1C1C);
                        (material as THREE.MeshStandardMaterial).emissive.setHex(0x76B362);
                        (material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
                    } else if (layer !== 'molecular') {
                        (material as THREE.MeshStandardMaterial).emissive.setHex(0x76B362);
                        (material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3;
                    }
                } else {
                    if (layer === 'organ') {
                        (material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
                    } else if (layer === 'bone' && maxPain > 0) {
                        (material as THREE.MeshStandardMaterial).emissive.setHex(0xff3333);
                    } else if (layer !== 'molecular') {
                        (material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
                        (material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
                    }
                }
            });
        });
    }

    private focusOnPart(id: string | null) {
        if (!id || !this.controls || !this.camera) return;
        const group = this.parts.get(id);
        if (!group) return;

        const box = new THREE.Box3().setFromObject(group);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Smoothly adjust OrbitControls target to anatomical center
        this.controls.target.copy(center);
        this.controls.update();
    }

    private updateTransparency(mode: 'skin' | 'muscle' | 'skeleton' | 'organs' | 'molecular') {
        this.parts.forEach((group) => {
            const isSelected = this.state.selectedPartId() === group.userData['id'];
            group.children.forEach(child => {
                if (!(child instanceof THREE.Mesh)) return;
                const material = child.material as THREE.MeshStandardMaterial;
                const layer = child.userData['layer'];

                if (mode === 'skin') {
                    if (layer === 'skin') { material.opacity = isSelected ? 0.98 : 0.92; material.depthWrite = true; }
                    else { material.opacity = 0; material.depthWrite = false; }
                }
                else if (mode === 'muscle') {
                    if (layer === 'skin') { material.opacity = 0.12; material.depthWrite = false; }
                    else if (layer === 'muscle') { material.opacity = 0.92; material.depthWrite = true; }
                    else { material.opacity = 0; material.depthWrite = false; }
                }
                else if (mode === 'skeleton') {
                    if (layer === 'skin') { material.opacity = 0.08; material.depthWrite = false; }
                    else if (layer === 'muscle') { material.opacity = 0.0; material.depthWrite = false; }
                    else if (layer === 'bone') { material.opacity = 1.0; material.depthWrite = true; }
                    else { material.opacity = 0; material.depthWrite = false; }
                }
                else if (mode === 'organs') {
                    if (layer === 'skin') { material.opacity = 0.08; material.depthWrite = false; }
                    else if (layer === 'organ') { material.opacity = 0.95; material.depthWrite = true; }
                    else if (layer === 'bone') { material.opacity = 0.05; material.depthWrite = false; }
                    else { material.opacity = 0; material.depthWrite = false; }
                }
                else if (mode === 'molecular') {
                    if (layer === 'skin') { material.opacity = 0.05; material.depthWrite = false; }
                    else if (layer === 'molecular') { material.opacity = 0.9; material.depthWrite = true; }
                    else { material.opacity = 0; material.depthWrite = false; }
                }
            });
        });

        // Update the neural field / brainwave entrainment globe (mindMesh)
        if (this.mannequinGroup) {
            const mindMesh = this.mannequinGroup.children.find(child => child.userData['isMindCore']);
            if (mindMesh && mindMesh instanceof THREE.Mesh) {
                const avsActive = this.state.isAvsSessionActive();
                const showGlobe = avsActive || mode === 'organs' || mode === 'molecular';
                
                mindMesh.visible = showGlobe;
                if (mindMesh.material instanceof THREE.MeshStandardMaterial) {
                    mindMesh.material.opacity = showGlobe ? (avsActive ? 0.25 : 0.08) : 0.0;
                    mindMesh.material.depthWrite = showGlobe;
                }
            }
        }
    }

    private setupInteractions() {
        const canvas = this.renderer.domElement;

        let startX = 0;
        let startY = 0;

        canvas.addEventListener('pointerdown', (event: PointerEvent) => {
            if (event.button !== 0 && event.pointerType === 'mouse') return;
            startX = event.clientX;
            startY = event.clientY;
        });

        canvas.addEventListener('pointerup', (event: PointerEvent) => {
            if (event.button !== 0 && event.pointerType === 'mouse') return;

            const deltaX = Math.abs(event.clientX - startX);
            const deltaY = Math.abs(event.clientY - startY);

            // Increase threshold to 10px to be more forgiving of slight movements
            if (deltaX < 10 && deltaY < 10) {
                const rect = canvas.getBoundingClientRect();
                this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

                this.raycaster.setFromCamera(this.mouse, this.camera);
                const activeGroup = this.customModelGroup ? this.customModelGroup : this.mannequinGroup;
                const intersects = this.raycaster.intersectObjects(activeGroup.children, true);
                if (intersects.length > 0) {
                    // Find the mesh object that has the userData.id
                    let object: THREE.Object3D | null = intersects[0].object;
                    while (object && !object.userData['id']) {
                        object = object.parent;
                    }

                    if (object && object.userData['id']) {
                        const id = object.userData['id'];
                        const name = this.getPartName(id);
                        this.partSelected.emit({ id, name });
                    }
                }
            }
        });

        window.addEventListener('resize', this.handleResize);
    }

    private getPartName(id: string): string {
        return PART_NAMES[id] || id;
    }

    private startAnimation() {
        if (!isPlatformBrowser(this.platformId)) return;
        
        const animate = () => {
            if (!this.renderer || !this.scene || !this.camera) return;
            this.animationFrameId = requestAnimationFrame(animate);

            if (this.controls) this.controls.update();

            this.timer.update();
            const time = this.timer.getElapsed();
            
            // Idle & Biometric AVS breathing and mind wave entrainment animations
            if (this.mannequinGroup) {
                const avsActive = this.state.isAvsSessionActive();
                
                // 1. Respiratory & Organ Coherence Entrainment
                const chestPart = this.parts.get('chest');
                if (chestPart) {
                    if (avsActive) {
                        const pacingFrequency = (this.state.avsBreathingRate() / 60) * 2 * Math.PI;
                        chestPart.scale.set(
                            1 + Math.sin(time * pacingFrequency) * 0.035, 
                            1 + Math.sin(time * pacingFrequency) * 0.015, 
                            1 + Math.sin(time * pacingFrequency) * 0.045
                        );
                    } else {
                        chestPart.scale.set(
                            1 + Math.sin(time * 2) * 0.02, 
                            1 + Math.sin(time * 2) * 0.01, 
                            1 + Math.sin(time * 2) * 0.03
                        );
                    }
                }

                // Heart Beat Animation (Systolic/Diastolic rhythm)
                const heartPart = this.parts.get('heart');
                if (heartPart) {
                    const cardiacPulse = 1 + Math.sin(time * 7) * 0.05 + Math.sin(time * 14) * 0.02;
                    heartPart.scale.set(cardiacPulse, cardiacPulse, cardiacPulse);
                }

                // Lungs Respiration Animation
                const lungsPart = this.parts.get('lungs');
                if (lungsPart) {
                    const lungExpansion = 1 + Math.sin(time * 2) * 0.04;
                    lungsPart.scale.set(lungExpansion, 1 + Math.sin(time * 2) * 0.02, lungExpansion);
                }

                // Brain Neural Firing Animation
                const brainPart = this.parts.get('brain');
                if (brainPart) {
                    const neuralGlow = 0.2 + Math.sin(time * 5) * 0.1;
                    brainPart.children.forEach(c => {
                        if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
                            c.material.emissiveIntensity = neuralGlow;
                        }
                    });
                }
                
                // 2. Gentle floating
                this.mannequinGroup.position.y = Math.sin(time * 1.5) * 0.02;
                if (this.customModelGroup) {
                    this.customModelGroup.position.y = Math.sin(time * 1.5) * 0.02;
                }
                
                // 3. Update Shader Uniforms for Heatmaps
                this.parts.forEach((group) => {
                    group.children.forEach(child => {
                        if (child instanceof THREE.Mesh && child.userData['layer'] === 'molecular') {
                            if (child.material instanceof THREE.ShaderMaterial) {
                                child.material.uniforms['uTime'].value = time;
                            }
                        }
                    });
                });
                
                // 4. Update pulsing for inflamed bones
                this.parts.forEach((group) => {
                    group.children.forEach(child => {
                        if (child instanceof THREE.Mesh && child.userData['layer'] === 'bone') {
                            const pain = child.userData['painIntensity'] || 0;
                            if (pain > 0) {
                                // Subtle throbbing for acute inflammation
                                const pulse = Math.sin(time * 4) * 0.5 + 0.5;
                                if (child.material instanceof THREE.MeshStandardMaterial) {
                                    child.material.emissiveIntensity = pain * 0.5 * pulse;
                                }
                            }
                        }
                    });
                });
                
                // 5. Mind Core & Neural Pathway Entrainment
                this.mannequinGroup.children.forEach(child => {
                    if (child.userData['isMindCore']) {
                        child.rotation.y += 0.01;
                        child.rotation.x += 0.005;
                        
                        if (avsActive) {
                            const wave = this.state.avsBrainwaveFrequency();
                            let waveFreq = 6.0; // default theta
                            if (wave === 'delta') waveFreq = 2.5;
                            else if (wave === 'theta') waveFreq = 6.0;
                            else if (wave === 'alpha') waveFreq = 10.0;
                            else if (wave === 'beta') waveFreq = 18.0;
                            
                            const wavePulsation = Math.sin(time * waveFreq * 2 * Math.PI);
                            child.scale.set(1 + wavePulsation * 0.06, 1 + wavePulsation * 0.06, 1 + wavePulsation * 0.06);
                            
                            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                                child.material.emissiveIntensity = 0.3 + wavePulsation * 0.2;
                            }
                        } else {
                            child.scale.set(1, 1, 1);
                            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                                child.material.emissiveIntensity = 0.2;
                            }
                        }
                    }
                });

                // 4. Ambient Aura / Bloom entrainment
                if (this.bloomPass) {
                    if (avsActive) {
                        const pacingFrequency = (this.state.avsBreathingRate() / 60) * 2 * Math.PI;
                        this.bloomPass.strength = 0.4 + Math.sin(time * pacingFrequency) * 0.15;
                    } else {
                        const mode = this.anatomyViewMode();
                        this.bloomPass.strength = (mode === 'organs' || mode === 'molecular') ? 0.3 : 0.15;
                    }
                }
            }

            // High-speed interpolation for Patient 3D Slide-to-Right Transition
            if (this.isSlidingPatient) {
                if (this.mannequinGroup) {
                    this.mannequinGroup.position.x += (0 - this.mannequinGroup.position.x) * 0.22;
                    if (Math.abs(this.mannequinGroup.position.x) < 0.01) {
                        this.mannequinGroup.position.x = 0;
                        this.isSlidingPatient = false;
                    }
                }
                if (this.customModelGroup) {
                    this.customModelGroup.position.x += (0 - this.customModelGroup.position.x) * 0.22;
                }
            }

            // Sync external rotation or 360 Auto-Spinning Sentinel Orbit
            if (this.isAutoSpinning()) {
                if (this.mannequinGroup) this.mannequinGroup.rotation.y += 0.008;
                if (this.customModelGroup) this.customModelGroup.rotation.y += 0.008;
            } else {
                if (this.mannequinGroup) {
                    this.mannequinGroup.rotation.y = this.rotation();
                }
                if (this.customModelGroup) {
                    this.customModelGroup.rotation.y = this.rotation();
                }
            }

            if (this.composer) {
                this.composer.render();
            } else if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        };
        animate();
    }
}
