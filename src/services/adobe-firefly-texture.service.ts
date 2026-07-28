import { Injectable, signal } from '@angular/core';
import * as THREE from 'three';

export type FireflyTextureType = 'skin' | 'muscle' | 'skeleton' | 'organs' | 'chassis' | 'arboreal' | 'papercraft';

export interface IFireflyTextureMetadata {
  type: FireflyTextureType;
  prompt: string;
  resolution: number;
  roughness: number;
  metalness: number;
  bumpScale: number;
  emissiveHex: number;
  emissiveIntensity: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdobeFireflyTextureService {
  public isFireflyEnabled = signal<boolean>(true);
  private textureCache = new Map<FireflyTextureType, THREE.CanvasTexture>();

  private readonly textureConfigs: Record<FireflyTextureType, IFireflyTextureMetadata> = {
    skin: {
      type: 'skin',
      prompt: 'Adobe Firefly AI: Micro-cellular dermal epidermis, soft translucency, biophotonic glow',
      resolution: 512,
      roughness: 0.35,
      metalness: 0.15,
      bumpScale: 0.04,
      emissiveHex: 0x0284c7,
      emissiveIntensity: 0.12
    },
    muscle: {
      type: 'muscle',
      prompt: 'Adobe Firefly AI: Striated muscle myofibril fiber matrix, deep teal collagen weave',
      resolution: 512,
      roughness: 0.45,
      metalness: 0.25,
      bumpScale: 0.08,
      emissiveHex: 0x0d9488,
      emissiveIntensity: 0.20
    },
    skeleton: {
      type: 'skeleton',
      prompt: 'Adobe Firefly AI: Compact osteon bone matrix, polished ivory trabecular lattice',
      resolution: 512,
      roughness: 0.25,
      metalness: 0.10,
      bumpScale: 0.03,
      emissiveHex: 0xe2e8f0,
      emissiveIntensity: 0.08
    },
    organs: {
      type: 'organs',
      prompt: 'Adobe Firefly AI: Endothelial organ vascular membrane, glowing cardiac capillary web',
      resolution: 512,
      roughness: 0.30,
      metalness: 0.20,
      bumpScale: 0.06,
      emissiveHex: 0xf43f5e,
      emissiveIntensity: 0.25
    },
    chassis: {
      type: 'chassis',
      prompt: 'Adobe Firefly AI: Ultra-light carbon fiber weave & titanium alloy chassis mesh',
      resolution: 512,
      roughness: 0.20,
      metalness: 0.85,
      bumpScale: 0.10,
      emissiveHex: 0x38bdf8,
      emissiveIntensity: 0.15
    },
    arboreal: {
      type: 'arboreal',
      prompt: 'Adobe Firefly AI: Ancient cedar bark grain, xylem ring structure & chlorophyll veins',
      resolution: 512,
      roughness: 0.70,
      metalness: 0.05,
      bumpScale: 0.12,
      emissiveHex: 0x10b981,
      emissiveIntensity: 0.10
    },
    papercraft: {
      type: 'papercraft',
      prompt: 'Adobe Firefly AI: Architectural heavyweight cardstock paper, unbleached hemp fibers',
      resolution: 512,
      roughness: 0.85,
      metalness: 0.0,
      bumpScale: 0.05,
      emissiveHex: 0xd97706,
      emissiveIntensity: 0.05
    }
  };

  /**
   * Generates a procedural PBR normal/bump texture map mimicking Adobe Firefly AI generative texture synthesis.
   */
  public getFireflyTexture(type: FireflyTextureType): THREE.CanvasTexture {
    if (this.textureCache.has(type)) {
      return this.textureCache.get(type)!;
    }

    const config = this.textureConfigs[type] || this.textureConfigs.skin;
    const canvas = document.createElement('canvas');
    canvas.width = config.resolution;
    canvas.height = config.resolution;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Base Fill
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, config.resolution, config.resolution);

      // 2. Adobe Firefly Procedural Noise & Fiber Synthesis
      const imgData = ctx.getImageData(0, 0, config.resolution, config.resolution);
      const data = imgData.data;

      for (let y = 0; y < config.resolution; y++) {
        for (let x = 0; x < config.resolution; x++) {
          const idx = (y * config.resolution + x) * 4;
          const noise = Math.sin(x * 0.08) * Math.cos(y * 0.08) * 40 + (Math.random() - 0.5) * 30;
          
          if (type === 'muscle') {
            const fiber = Math.sin((x + y * 0.5) * 0.15) * 60;
            data[idx] = Math.min(255, Math.max(0, 15 + fiber + noise)); // R
            data[idx + 1] = Math.min(255, Math.max(0, 140 + fiber + noise)); // G
            data[idx + 2] = Math.min(255, Math.max(0, 130 + fiber + noise)); // B
          } else if (type === 'chassis') {
            const carbonPattern = ((x % 8 < 4 ? 1 : -1) * (y % 8 < 4 ? 1 : -1)) * 50;
            data[idx] = Math.min(255, Math.max(0, 50 + carbonPattern));
            data[idx + 1] = Math.min(255, Math.max(0, 60 + carbonPattern));
            data[idx + 2] = Math.min(255, Math.max(0, 80 + carbonPattern));
          } else if (type === 'organs') {
            const vascular = Math.sin(Math.sqrt(x * x + y * y) * 0.1) * 70;
            data[idx] = Math.min(255, Math.max(0, 220 + vascular));
            data[idx + 1] = Math.min(255, Math.max(0, 40 + vascular * 0.3));
            data[idx + 2] = Math.min(255, Math.max(0, 80 + vascular * 0.4));
          } else {
            data[idx] = Math.min(255, Math.max(0, 56 + noise));
            data[idx + 1] = Math.min(255, Math.max(0, 189 + noise));
            data[idx + 2] = Math.min(255, Math.max(0, 248 + noise));
          }
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);

    this.textureCache.set(type, texture);
    return texture;
  }

  /**
   * Applies an Adobe Firefly AI texturized mesh material to a Three.js Mesh.
   */
  public applyFireflyTextureToMesh(mesh: THREE.Mesh, type: FireflyTextureType, baseColorHex: number = 0x38bdf8) {
    if (!mesh || !this.isFireflyEnabled()) return;

    const config = this.textureConfigs[type] || this.textureConfigs.skin;
    const bumpTexture = this.getFireflyTexture(type);

    const fireflyMaterial = new THREE.MeshStandardMaterial({
      color: baseColorHex,
      bumpMap: bumpTexture,
      bumpScale: config.bumpScale,
      roughness: config.roughness,
      metalness: config.metalness,
      emissive: config.emissiveHex,
      emissiveIntensity: config.emissiveIntensity,
      transparent: true,
      opacity: 0.92,
      depthWrite: true
    });

    mesh.material = fireflyMaterial;
    mesh.userData['fireflyTexturized'] = true;
    mesh.userData['fireflyPrompt'] = config.prompt;
  }
}
