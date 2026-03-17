import { Component, ChangeDetectionStrategy, inject, signal, effect, viewChild, ElementRef, OnDestroy, AfterViewInit, Output, EventEmitter, input, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PatientStateService } from '../services/patient-state.service';

@Component({
    selector: 'app-body-3d-viewer',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div #canvasContainer class="w-full h-full relative" [class.cursor-grab]="webglSupported()" [class.active:cursor-grabbing]="webglSupported()">
      <div *ngIf="!webglSupported()" class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
        <svg class="w-10 h-10 text-zinc-400 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">3D view unavailable on this device</span>
      </div>
      <div *ngIf="webglSupported()" class="absolute bottom-2 left-2 flex flex-col gap-1 pointer-events-none">
        <span class="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Left Click: Select Part</span>
        <span class="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Right Click: Orbit</span>
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
    anatomyViewMode = input<'skin' | 'muscle' | 'skeleton' | 'mind' | 'molecular'>('skin');

    readonly webglSupported = signal<boolean>(true);

    private renderer!: THREE.WebGLRenderer;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private controls!: OrbitControls;
    private mannequinGroup!: THREE.Group;
    private parts: Map<string, THREE.Group | THREE.Mesh> = new Map();
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
    private animationFrameId?: number;

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
        });
    }

    ngAfterViewInit() {
        if (!isPlatformBrowser(this.platformId)) {
            this.webglSupported.set(false);
            return;
        }

        try {
            this.initScene();
            this.createMannequin();
            this.startAnimation();
            this.setupInteractions();
        } catch (e) {
            console.warn("3D Viewer disabled: WebGL not supported on this device.", e);
            this.webglSupported.set(false);
        }
    }

    ngOnDestroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            this.renderer.domElement?.remove();
        }
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
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch (e) {
            throw new Error('WebGL is not supported in this environment.');
        }
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

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
            color: 0xffe0bd, roughness: 0.4, metalness: 0.1, transparent: true, opacity: 0.9, depthWrite: true
        });
        const muscleMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a1c1c, roughness: 0.7, metalness: 0.1, transparent: true, opacity: 0.0, depthWrite: false
        });
        const boneMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5f5dc, roughness: 0.5, metalness: 0.05, transparent: true, opacity: 0.0, depthWrite: false
        });
        const mindMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b5cf6, roughness: 0.2, metalness: 0.4, transparent: true, emissive: 0x8b5cf6, emissiveIntensity: 0.2, opacity: 0.0, depthWrite: false
        });
        const molecularMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff, wireframe: true, transparent: true, emissive: 0x008888, emissiveIntensity: 0.5, opacity: 0.0, depthWrite: false
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
                    if (layer === 'skin') material.color.setRGB(1, 1 - intensity * 0.6, 1 - intensity * 0.6);
                    if (layer === 'muscle') material.color.setRGB(0.9, 0.2 - intensity * 0.2, 0.2 - intensity * 0.2);
                    if (layer === 'bone') material.color.setRGB(0.9, 0.7 - intensity * 0.5, 0.7 - intensity * 0.5);
                    if (layer === 'mind') material.color.setRGB(0.9, 0.2 - intensity * 0.2, 0.9);
                    if (layer === 'molecular') {
                        material.color.setHex(0xff00ff); // Hot pink to signify pain/inflammation
                        material.emissive.setHex(0xff0066);
                    }
                } else {
                    // Reset to Base Colors
                    if (layer === 'skin') material.color.setHex(0xfdfdfd);
                    if (layer === 'muscle') material.color.setHex(0xc95353);
                    if (layer === 'bone') material.color.setHex(0xe0e0e0);
                    if (layer === 'mind') material.color.setHex(0x8b5cf6);
                    if (layer === 'molecular') {
                        material.color.setHex(0x00ffff);
                        material.emissive.setHex(0x008888);
                    }
                }

                if (isSelected) {
                    if (layer === 'skin') {
                        material.color.setHex(0x1C1C1C);
                        material.emissive.setHex(0x76B362);
                        material.emissiveIntensity = 0.4;
                    } else if (layer === 'molecular') {
                        material.emissive.setHex(0xffffff);
                        material.emissiveIntensity = 1.0;
                    } else {
                        material.emissive.setHex(0x76B362);
                        material.emissiveIntensity = 0.6;
                    }
                } else {
                    if (layer === 'mind') {
                        material.emissive.setHex(0x8b5cf6);
                        material.emissiveIntensity = 0.2;
                    } else if (layer === 'molecular' && maxPain === 0) {
                        material.emissive.setHex(0x008888);
                        material.emissiveIntensity = 0.5;
                    } else if (layer === 'molecular' && maxPain > 0) {
                        material.emissive.setHex(0xff0066);
                        material.emissiveIntensity = 0.5 + (maxPain / 20); // Scale emissive with pain
                    } else {
                        material.emissive.setHex(0x000000);
                        material.emissiveIntensity = 0;
                    }
                }
            });
        });
    }

    private updateTransparency(mode: 'skin' | 'muscle' | 'skeleton' | 'mind' | 'molecular') {
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
                else if (mode === 'mind') {
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
    }

    private setupInteractions() {
        const canvas = this.renderer.domElement;

        let startX = 0;
        let startY = 0;

        canvas.addEventListener('pointerdown', (event: PointerEvent) => {
            if (event.button !== 0) return;
            startX = event.clientX;
            startY = event.clientY;
            console.log('Body3DViewer: pointerdown', { startX, startY });
        });

        canvas.addEventListener('pointerup', (event: PointerEvent) => {
            if (event.button !== 0) return;

            const deltaX = Math.abs(event.clientX - startX);
            const deltaY = Math.abs(event.clientY - startY);
            console.log('Body3DViewer: pointerup', { deltaX, deltaY, clientX: event.clientX, clientY: event.clientY });

            // Increase threshold to 10px to be more forgiving of slight movements
            if (deltaX < 10 && deltaY < 10) {
                const rect = canvas.getBoundingClientRect();
                this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersects = this.raycaster.intersectObjects(this.mannequinGroup.children, true);
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

        window.addEventListener('resize', () => {
            const container = this.canvasContainer()?.nativeElement;
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        });
    }

    private getPartName(id: string): string {
        const names: Record<string, string> = {
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
        return names[id] || id;
    }

    private startAnimation() {
        const animate = () => {
            this.animationFrameId = requestAnimationFrame(animate);
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
}
