import { Component, ChangeDetectionStrategy, inject, signal, effect, viewChild, ElementRef, OnDestroy, AfterViewInit, Output, EventEmitter, input, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader.js';
import { PatientStateService } from '../services/patient-state.service';

const PART_NAMES: Record<string, string> = {
    'head': 'Head & Neck',
    'chest': 'Chest & Upper Torso',
    'abdomen': 'Abdomen & Stomach',
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
    'l_foot': 'Left Foot'
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
      <div *ngIf="webglSupported()" class="absolute bottom-2 left-2 flex flex-col gap-1 pointer-events-none">
        <span class="text-[12px] font-bold text-gray-500 uppercase tracking-tighter">Left Click: Select Part</span>
        <span class="text-[12px] font-bold text-gray-500 uppercase tracking-tighter">Right Click: Orbit</span>
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
        // React to selection changes in the state
        effect(() => {
            const selectedId = this.state.selectedPartId();
            this.updatePartColors();
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
                (usdz) => {
                    this.processLoadedModel(usdz);
                },
                undefined,
                (error) => {
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

        // Define our three fundamental material layers
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0xfdfdfd, roughness: 0.4, metalness: 0.1, transparent: true, opacity: 0.9, depthWrite: true
        });
        const muscleMaterial = new THREE.MeshStandardMaterial({
            color: 0xc95353, roughness: 0.7, metalness: 0.1, transparent: true, opacity: 0.0, depthWrite: false
        });
        const boneMaterial = new THREE.MeshStandardMaterial({
            color: 0xe0e0e0, roughness: 0.5, metalness: 0.05, transparent: true, opacity: 0.0, depthWrite: false
        });
        const mindMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b5cf6, roughness: 0.2, metalness: 0.4, transparent: true, emissive: 0x8b5cf6, emissiveIntensity: 0.1, opacity: 0.0, depthWrite: false
        });
        
        // Procedural Shader Material for Heatmaps
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
                    // Pulsing displacement based on pain
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
                    
                    // Fresnel/Rim effect
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

        // Procedural construction functions for contoured/biological shapes
        const rSkin = (w: number, h: number, d: number) => new THREE.CapsuleGeometry(Math.min(w, d), h, 4, 16);
        const rBone = (l: number, thickness: number = 0.03) => new THREE.CylinderGeometry(thickness, thickness, l, 8);
        const rJoint = (r: number = 0.05) => new THREE.SphereGeometry(r, 16, 16);
        const rBox = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
        const rSphere = (r: number) => new THREE.SphereGeometry(r, 32, 32);

        // Head
        this.addPartComplex('head',
            rSphere(0.25), skinMaterial, { y: 1.75 },
            rSphere(0.24), muscleMaterial, { y: 1.75 },
            rSphere(0.22), boneMaterial, { y: 1.75 },
            rSphere(0.20), mindMaterial, { y: 1.75 },
            rSphere(0.26), molecularMaterial, { y: 1.75 }
        );

        // Neck
        this.addPartComplex('neck', rSkin(0.12, 0.15, 0.12), skinMaterial, { y: 1.55 }, rSkin(0.11, 0.14, 0.11), muscleMaterial, { y: 1.55 }, rBone(0.15, 0.04), boneMaterial, { y: 1.55 }, undefined, undefined, undefined, rSkin(0.13, 0.16, 0.13), molecularMaterial, { y: 1.55 });

        // Torso (Upper/Chest)
        this.addPartComplex('chest', rBox(0.5, 0.45, 0.3), skinMaterial, { y: 1.3 }, rBox(0.48, 0.43, 0.28), muscleMaterial, { y: 1.3 }, rBox(0.45, 0.4, 0.25), boneMaterial, { y: 1.3 }, undefined, undefined, undefined, rBox(0.52, 0.47, 0.32), molecularMaterial, { y: 1.3 });

        // Abdomen
        this.addPartComplex('abdomen', rBox(0.45, 0.3, 0.28), skinMaterial, { y: 0.95 }, rBox(0.43, 0.28, 0.26), muscleMaterial, { y: 0.95 }, rBone(0.3, 0.05), boneMaterial, { y: 0.95 }, undefined, undefined, undefined, rBox(0.47, 0.32, 0.30), molecularMaterial, { y: 0.95 });

        // Pelvis
        this.addPartComplex('pelvis', rBox(0.48, 0.25, 0.3), skinMaterial, { y: 0.7 }, rBox(0.46, 0.23, 0.28), muscleMaterial, { y: 0.7 }, rBox(0.4, 0.2, 0.2), boneMaterial, { y: 0.7 }, undefined, undefined, undefined, rBox(0.50, 0.27, 0.32), molecularMaterial, { y: 0.7 });

        // Arms (Right)
        this.addPartComplex('r_shoulder', rJoint(0.12), skinMaterial, { x: -0.32, y: 1.45 }, rJoint(0.11), muscleMaterial, { x: -0.32, y: 1.45 }, rJoint(0.06), boneMaterial, { x: -0.32, y: 1.45 }, undefined, undefined, undefined, rJoint(0.13), molecularMaterial, { x: -0.32, y: 1.45 });
        this.addPartComplex('r_arm', rSkin(0.08, 0.4, 0.08), skinMaterial, { x: -0.42, y: 1.15, z: 0.05, rx: 0.1 }, rSkin(0.07, 0.38, 0.07), muscleMaterial, { x: -0.42, y: 1.15, z: 0.05, rx: 0.1 }, rBone(0.4), boneMaterial, { x: -0.42, y: 1.15, z: 0.05, rx: 0.1 }, undefined, undefined, undefined, rSkin(0.09, 0.42, 0.09), molecularMaterial, { x: -0.42, y: 1.15, z: 0.05, rx: 0.1 });
        this.addPartComplex('r_hand', rBox(0.08, 0.15, 0.05), skinMaterial, { x: -0.5, y: 0.82, rx: 0.2 }, rBox(0.07, 0.14, 0.04), muscleMaterial, { x: -0.5, y: 0.82, rx: 0.2 }, rBox(0.06, 0.12, 0.03), boneMaterial, { x: -0.5, y: 0.82, rx: 0.2 }, undefined, undefined, undefined, rBox(0.09, 0.16, 0.06), molecularMaterial, { x: -0.5, y: 0.82, rx: 0.2 });

        // Arms (Left)
        this.addPartComplex('l_shoulder', rJoint(0.12), skinMaterial, { x: 0.32, y: 1.45 }, rJoint(0.11), muscleMaterial, { x: 0.32, y: 1.45 }, rJoint(0.06), boneMaterial, { x: 0.32, y: 1.45 }, undefined, undefined, undefined, rJoint(0.13), molecularMaterial, { x: 0.32, y: 1.45 });
        this.addPartComplex('l_arm', rSkin(0.08, 0.4, 0.08), skinMaterial, { x: 0.42, y: 1.15, z: 0.05, rx: 0.1 }, rSkin(0.07, 0.38, 0.07), muscleMaterial, { x: 0.42, y: 1.15, z: 0.05, rx: 0.1 }, rBone(0.4), boneMaterial, { x: 0.42, y: 1.15, z: 0.05, rx: 0.1 }, undefined, undefined, undefined, rSkin(0.09, 0.42, 0.09), molecularMaterial, { x: 0.42, y: 1.15, z: 0.05, rx: 0.1 });
        this.addPartComplex('l_hand', rBox(0.08, 0.15, 0.05), skinMaterial, { x: 0.5, y: 0.82, rx: 0.2 }, rBox(0.07, 0.14, 0.04), muscleMaterial, { x: 0.5, y: 0.82, rx: 0.2 }, rBox(0.06, 0.12, 0.03), boneMaterial, { x: 0.5, y: 0.82, rx: 0.2 }, undefined, undefined, undefined, rBox(0.09, 0.16, 0.06), molecularMaterial, { x: 0.5, y: 0.82, rx: 0.2 });

        // Legs (Right)
        this.addPartComplex('r_thigh', rSkin(0.12, 0.5, 0.12), skinMaterial, { x: -0.18, y: 0.35 }, rSkin(0.11, 0.48, 0.11), muscleMaterial, { x: -0.18, y: 0.35 }, rBone(0.5, 0.04), boneMaterial, { x: -0.18, y: 0.35 }, undefined, undefined, undefined, rSkin(0.13, 0.52, 0.13), molecularMaterial, { x: -0.18, y: 0.35 });
        this.addPartComplex('r_shin', rSkin(0.1, 0.5, 0.1), skinMaterial, { x: -0.18, y: -0.25 }, rSkin(0.09, 0.48, 0.09), muscleMaterial, { x: -0.18, y: -0.25 }, rBone(0.5, 0.03), boneMaterial, { x: -0.18, y: -0.25 }, undefined, undefined, undefined, rSkin(0.11, 0.52, 0.11), molecularMaterial, { x: -0.18, y: -0.25 });
        this.addPartComplex('r_foot', rBox(0.15, 0.08, 0.25), skinMaterial, { x: -0.18, y: -0.58, z: 0.05 }, rBox(0.14, 0.07, 0.24), muscleMaterial, { x: -0.18, y: -0.58, z: 0.05 }, rBox(0.12, 0.06, 0.22), boneMaterial, { x: -0.18, y: -0.58, z: 0.05 }, undefined, undefined, undefined, rBox(0.16, 0.09, 0.26), molecularMaterial, { x: -0.18, y: -0.58, z: 0.05 });

        // Legs (Left)
        this.addPartComplex('l_thigh', rSkin(0.12, 0.5, 0.12), skinMaterial, { x: 0.18, y: 0.35 }, rSkin(0.11, 0.48, 0.11), muscleMaterial, { x: 0.18, y: 0.35 }, rBone(0.5, 0.04), boneMaterial, { x: 0.18, y: 0.35 }, undefined, undefined, undefined, rSkin(0.13, 0.52, 0.13), molecularMaterial, { x: 0.18, y: 0.35 });
        this.addPartComplex('l_shin', rSkin(0.1, 0.5, 0.1), skinMaterial, { x: 0.18, y: -0.25 }, rSkin(0.09, 0.48, 0.09), muscleMaterial, { x: 0.18, y: -0.25 }, rBone(0.5, 0.03), boneMaterial, { x: 0.18, y: -0.25 }, undefined, undefined, undefined, rSkin(0.11, 0.52, 0.11), molecularMaterial, { x: 0.18, y: -0.25 });
        this.addPartComplex('l_foot', rBox(0.15, 0.08, 0.25), skinMaterial, { x: 0.18, y: -0.58, z: 0.05 }, rBox(0.14, 0.07, 0.24), muscleMaterial, { x: 0.18, y: -0.58, z: 0.05 }, rBox(0.12, 0.06, 0.22), boneMaterial, { x: 0.18, y: -0.58, z: 0.05 }, undefined, undefined, undefined, rBox(0.16, 0.09, 0.26), molecularMaterial, { x: 0.18, y: -0.58, z: 0.05 });

        // Add subtle procedural "breathing" and idle materials
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
        group.userData['id'] = id; // Store ID on the parent group for raycasting

        // 1. Skin Layer
        const meshSkin = new THREE.Mesh(skinGeo, skinMat.clone());
        this.applyPos(meshSkin, skinPos);
        meshSkin.userData['layer'] = 'skin';
        meshSkin.userData['id'] = id; // So children raycast back to parent logical ID
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

        // 4. Mind Layer (Optional)
        if (mindGeo && mindMat && mindPos) {
            const meshMind = new THREE.Mesh(mindGeo, mindMat.clone());
            this.applyPos(meshMind, mindPos);
            meshMind.userData['layer'] = 'mind';
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
        this.parts.set(id, group); // Store the group
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

                // Color Logic overrides
                if (maxPain > 0) {
                    const intensity = maxPain / 10;
                    if (layer === 'skin') (material as THREE.MeshStandardMaterial).color.setRGB(1, 1 - intensity * 0.6, 1 - intensity * 0.6);
                    if (layer === 'muscle') (material as THREE.MeshStandardMaterial).color.setRGB(0.9, 0.2 - intensity * 0.2, 0.2 - intensity * 0.2);
                    if (layer === 'bone') (material as THREE.MeshStandardMaterial).color.setRGB(0.9, 0.7 - intensity * 0.5, 0.7 - intensity * 0.5);
                    if (layer === 'mind') (material as THREE.MeshStandardMaterial).color.setRGB(0.9, 0.2 - intensity * 0.2, 0.9);
                    if (layer === 'molecular' && (material as any).uniforms) {
                        (material as any).uniforms['uPainLevel'].value = intensity;
                    }
                } else {
                    // Reset to Base Colors
                    if (layer === 'skin') (material as THREE.MeshStandardMaterial).color.setHex(0xfdfdfd);
                    if (layer === 'muscle') (material as THREE.MeshStandardMaterial).color.setHex(0xc95353);
                    if (layer === 'bone') (material as THREE.MeshStandardMaterial).color.setHex(0xe0e0e0);
                    if (layer === 'mind') (material as THREE.MeshStandardMaterial).color.setHex(0x8b5cf6);
                    if (layer === 'molecular' && (material as any).uniforms) {
                        (material as any).uniforms['uPainLevel'].value = 0.0;
                    }
                }

                if (isSelected) {
                    if (layer === 'skin') {
                        (material as THREE.MeshStandardMaterial).color.setHex(0x1C1C1C);
                        (material as THREE.MeshStandardMaterial).emissive.setHex(0x76B362);
                        (material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
                    } else if (layer === 'molecular' && (material as any).uniforms) {
                        // Highlight logic for shaders can be left simple, handled by uniforms
                    } else if (layer !== 'molecular') {
                        (material as THREE.MeshStandardMaterial).emissive.setHex(0x76B362);
                        (material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3;
                    }
                } else {
                    if (layer === 'mind') {
                        (material as THREE.MeshStandardMaterial).emissive.setHex(0x8b5cf6);
                        (material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
                    } else if (layer === 'molecular') {
                        // Shader uniform uPainLevel dictates emission/glow
                    } else {
                        (material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
                        (material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
                    }
                }
            });
        });
    }

    private updateTransparency(mode: 'skin' | 'muscle' | 'skeleton' | 'organs' | 'molecular') {
        this.parts.forEach((group) => {
            const isSelected = this.state.selectedPartId() === group.userData['id'];
            group.children.forEach(child => {
                if (!(child instanceof THREE.Mesh)) return;
                const material = child.material as THREE.MeshStandardMaterial;
                const layer = child.userData['layer'];

                if (mode === 'skin') {
                    if (layer === 'skin') { material.opacity = isSelected ? 0.95 : 0.9; material.depthWrite = true; }
                    else { material.opacity = 0; material.depthWrite = false; }
                }
                else if (mode === 'muscle') {
                    if (layer === 'skin') { material.opacity = 0.15; material.depthWrite = false; }
                    else if (layer === 'muscle') { material.opacity = 0.9; material.depthWrite = true; }
                    else { material.opacity = 0; material.depthWrite = false; }
                }
                else if (mode === 'skeleton') {
                    if (layer === 'skin') { material.opacity = 0.10; material.depthWrite = false; }
                    else if (layer === 'muscle') { material.opacity = 0.0; material.depthWrite = false; }
                    else if (layer === 'bone') { material.opacity = 1.0; material.depthWrite = true; }
                    else { material.opacity = 0; material.depthWrite = false; }
                }
                else if (mode === 'organs') {
                    if (layer === 'skin') { material.opacity = 0.10; material.depthWrite = false; }
                    else if (layer === 'mind') { material.opacity = 0.9; material.depthWrite = true; }
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
                
                // 1. Respiratory Coherence Entrainment (Chest Heave Sync)
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
                
                // 3. Mind Core & Neural Pathway Entrainment
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

            // Sync external rotation
            if (this.mannequinGroup) {
                this.mannequinGroup.rotation.y = this.rotation();
            }
            if (this.customModelGroup) {
                this.customModelGroup.rotation.y = this.rotation();
            }

            if (this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        };
        animate();
    }
}
