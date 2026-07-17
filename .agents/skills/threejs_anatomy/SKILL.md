---
name: threejs_anatomy
description: Generate and manage Three.js procedural skeletal models in Angular Standalone Components.
---

# Three.js Anatomy Modeling

Use this skill when implementing 3D visualization or procedural anatomy models in the Pocket-Gull Angular application using Three.js.

## Core Rules for Three.js in Angular

1. **Standalone Components**: Always encapsulate Three.js logic within an Angular Standalone Component.
2. **WebGL Context Management**:
   - Initialize the WebGLRenderer in `ngAfterViewInit()` using a native element reference (ViewChild).
   - **CRITICAL**: To prevent memory leaks, you MUST fully dispose of the scene, renderer, geometries, materials, and textures in `ngOnDestroy()`. 
3. **Integration with Signals**:
   - Use Angular Signals (`computed`, `effect`) to map `PatientStateService` properties (like symptoms or identified conditions) to 3D visual changes (e.g., highlighting a specific bone or surface).
4. **Animation Loop**:
   - Use `requestAnimationFrame` for continuous rendering or TWEEN.js for smooth transitions between states.
   - Cancel the animation frame in `ngOnDestroy()`.

## Component Template

A good 3D component looks like this:

```typescript
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect, inject } from '@angular/core';
import * as THREE from 'three';
import { PatientStateService } from '../../services/patient-state.service';

@Component({
  selector: 'app-anatomy-model',
  standalone: true,
  template: `<div #rendererContainer class="w-full h-full min-h-[400px] bg-zinc-900 rounded-xl overflow-hidden"></div>`
})
export class AnatomyModelComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef<HTMLDivElement>;
  
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationId?: number;
  private patientState = inject(PatientStateService);

  constructor() {
    effect(() => {
      const activeCondition = this.patientState.activeCondition();
      this.updateModelHighlight(activeCondition);
    });
  }

  ngAfterViewInit() {
    this.initThreeJs();
    this.animate();
  }

  private initThreeJs() {
    const el = this.rendererContainer.nativeElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, el.clientWidth / el.clientHeight, 0.1, 1000);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(this.renderer.domElement);

    // Add lights and procedural geometry here
  }

  private updateModelHighlight(condition: string | null) {
    // Logic to highlight parts of the mesh based on condition
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    
    // Dispose resources to prevent WebGL context leaks
    this.renderer.dispose();
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
    
    this.rendererContainer.nativeElement.innerHTML = '';
  }
}
```
