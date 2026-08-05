import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { AdobeFireflyTextureService } from './adobe-firefly-texture.service';

export type FitzpatrickSkinType = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';

@Injectable({
  providedIn: 'root'
})
export class BodyMeshFactoryService {
  private fireflyTexture = inject(AdobeFireflyTextureService);

  /**
   * Returns Hex PBR color for a given Fitzpatrick skin phototype.
   */
  getFitzpatrickColor(type: FitzpatrickSkinType): number {
    switch (type) {
      case 'I': return 0xf7d0b5;
      case 'II': return 0xf3c5a6;
      case 'III': return 0xd8a07c;
      case 'IV': return 0xaa724b;
      case 'V': return 0x7a4929;
      case 'VI': return 0x422614;
      default: return 0x38bdf8;
    }
  }

  /**
   * Creates the standard human mannequin group with skin, muscle, bone, and organ layers.
   */
  createMannequinGroup(phototype: FitzpatrickSkinType = 'III'): { group: THREE.Group; parts: Map<string, THREE.Group | THREE.Mesh> } {
    const mannequinGroup = new THREE.Group();
    const parts = new Map<string, THREE.Group | THREE.Mesh>();

    const skinTexture = this.fireflyTexture.getFireflyTexture('skin');
    const muscleTexture = this.fireflyTexture.getFireflyTexture('muscle');
    const boneTexture = this.fireflyTexture.getFireflyTexture('skeleton');

    const skinColor = this.getFitzpatrickColor(phototype);
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: skinColor, bumpMap: skinTexture, bumpScale: 0.04, roughness: 0.35, metalness: 0.15, emissive: 0x0369a1, emissiveIntensity: 0.05, transparent: true, opacity: 0.92, depthWrite: true
    });
    const muscleMaterial = new THREE.MeshStandardMaterial({
      color: 0xbe123c, bumpMap: muscleTexture, bumpScale: 0.08, roughness: 0.65, metalness: 0.1, transparent: true, opacity: 0.0, depthWrite: false
    });
    const boneMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f4, bumpMap: boneTexture, bumpScale: 0.03, roughness: 0.4, metalness: 0.1, transparent: true, opacity: 0.0, depthWrite: false
    });

    // Helper to register parts into hierarchy
    const addPart = (id: string, mesh: THREE.Mesh | THREE.Group) => {
      mesh.userData['id'] = id;
      parts.set(id, mesh);
      mannequinGroup.add(mesh);
    };

    // Head & Neck
    const headGroup = new THREE.Group();
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), skinMaterial.clone());
    headMesh.position.y = 1.75;
    headGroup.add(headMesh);
    addPart('head', headGroup);

    // Chest & Thorax
    const chestGroup = new THREE.Group();
    const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.5, 32), skinMaterial.clone());
    chestMesh.position.y = 1.25;
    chestGroup.add(chestMesh);
    addPart('chest', chestGroup);

    // Abdomen
    const abdoGroup = new THREE.Group();
    const abdoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.4, 32), skinMaterial.clone());
    abdoMesh.position.y = 0.8;
    abdoGroup.add(abdoMesh);
    addPart('abdomen', abdoGroup);

    // Pelvis
    const pelvisGroup = new THREE.Group();
    const pelvisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.3, 32), skinMaterial.clone());
    pelvisMesh.position.y = 0.45;
    pelvisGroup.add(pelvisMesh);
    addPart('pelvis', pelvisGroup);

    return { group: mannequinGroup, parts };
  }
}
