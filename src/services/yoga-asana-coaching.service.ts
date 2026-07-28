import { Injectable, signal, computed } from '@angular/core';

export interface IYogaAsanaPose {
  id: string;
  name: string;
  sanskritName: string;
  targetBodyRegion: string;
  primaryBenefit: string;
  instructions: string[];
  breathTimingSec: { inhale: number; hold: number; exhale: number };
  jointTransformations: {
    spineCurvatureDeg: number;
    hipFlexionDeg: number;
    shoulderRotationDeg: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class YogaAsanaCoachingService {
  readonly activePose = signal<IYogaAsanaPose | null>(null);

  readonly curatedAsanaLibrary: IYogaAsanaPose[] = [
    {
      id: 'pose_cobra',
      name: 'Cobra Pose',
      sanskritName: 'Bhujangasana',
      targetBodyRegion: 'spine_lumbar',
      primaryBenefit: 'Decompresses L4-L5 lumbar spine discs, strengthens erector spinae, and opens thoracic cage.',
      instructions: [
        'Lie prone on mat with hands under shoulders.',
        'Inhale deeply and press through palms to lift chest off floor.',
        'Keep elbows slightly bent and shoulders relaxed away from ears.',
        'Hold position for 5 breath cycles.'
      ],
      breathTimingSec: { inhale: 4, hold: 2, exhale: 6 },
      jointTransformations: { spineCurvatureDeg: 25, hipFlexionDeg: 0, shoulderRotationDeg: -15 }
    },
    {
      id: 'pose_cat_cow',
      name: 'Cat-Cow Flow',
      sanskritName: 'Marjaryasana-Bitilasana',
      targetBodyRegion: 'spine_thoracic',
      primaryBenefit: 'Mobilizes entire vertebral column, stimulates vagus nerve, and relieves tension in thoracic spine.',
      instructions: [
        'Begin on hands and knees in tabletop position.',
        'Inhale, drop belly, lift tailbone and gaze upward (Cow Pose).',
        'Exhale, arch spine, tuck chin to chest, and draw navel toward spine (Cat Pose).',
        'Repeat rhythmically for 10 cycles.'
      ],
      breathTimingSec: { inhale: 4, hold: 1, exhale: 5 },
      jointTransformations: { spineCurvatureDeg: 35, hipFlexionDeg: 15, shoulderRotationDeg: 10 }
    },
    {
      id: 'pose_pigeon',
      name: 'Pigeon Pose',
      sanskritName: 'Eka Pada Rajakapotasana',
      targetBodyRegion: 'pelvis',
      primaryBenefit: 'Releases deep piriformis, psoas major, and sciatic nerve impingement in pelvic girdle.',
      instructions: [
        'Bring right knee forward behind right wrist.',
        'Extend left leg straight back with foot flat on floor.',
        'Lower hips toward floor and walk hands forward to fold over front leg.',
        'Hold for 8 deep breath cycles on each side.'
      ],
      breathTimingSec: { inhale: 5, hold: 3, exhale: 7 },
      jointTransformations: { spineCurvatureDeg: 10, hipFlexionDeg: 65, shoulderRotationDeg: 0 }
    },
    {
      id: 'pose_child',
      name: "Child's Pose",
      sanskritName: 'Balasana',
      targetBodyRegion: 'spine_cervical',
      primaryBenefit: 'Calms central nervous system, stretches cervical spine and shoulders, and activates parasympathetic response.',
      instructions: [
        'Kneel on floor with big toes touching and knees hip-width apart.',
        'Sit back on heels and fold torso forward, resting forehead on mat.',
        'Extend arms forward or rest alongside torso.',
        'Breathe softly into posterior ribcage for 2-3 minutes.'
      ],
      breathTimingSec: { inhale: 4, hold: 2, exhale: 6 },
      jointTransformations: { spineCurvatureDeg: -20, hipFlexionDeg: 80, shoulderRotationDeg: 30 }
    },
    // --- Physical Therapy (PT) Protocols ---
    {
      id: 'pt_rotator_cuff',
      name: 'Scapular Y-T-W Retractions',
      sanskritName: 'Physical Therapy (PT)',
      targetBodyRegion: 'shoulder',
      primaryBenefit: 'Strengthens lower trapezius and rhomboids to relieve shoulder subacromial impingement.',
      instructions: [
        'Lie prone or bend forward with arms hanging down.',
        'Raise arms into Y shape, squeezing shoulder blades together (10 reps).',
        'Raise arms sideways into T shape (10 reps).',
        'Bend elbows to 90 degrees and raise into W shape (10 reps).'
      ],
      breathTimingSec: { inhale: 3, hold: 3, exhale: 3 },
      jointTransformations: { spineCurvatureDeg: 5, hipFlexionDeg: 30, shoulderRotationDeg: 45 }
    },
    {
      id: 'pt_knee_vmo',
      name: 'Terminal Knee Extension (TKE)',
      sanskritName: 'Physical Therapy (PT)',
      targetBodyRegion: 'knee',
      primaryBenefit: 'Isolates and strengthens vastus medialis obliquus (VMO) for patellofemoral tracking.',
      instructions: [
        'Attach resistance band at knee height behind right knee.',
        'Stand with slight bend in knee, then straighten leg backward against band resistance.',
        'Hold contraction for 2 seconds at full extension.',
        'Perform 3 sets of 15 repetitions.'
      ],
      breathTimingSec: { inhale: 2, hold: 2, exhale: 2 },
      jointTransformations: { spineCurvatureDeg: 0, hipFlexionDeg: 10, shoulderRotationDeg: 0 }
    },
    {
      id: 'pt_cervical_chin_tuck',
      name: 'Ergonomic Cervical Chin Tucks',
      sanskritName: 'Physical Therapy (PT)',
      targetBodyRegion: 'neck',
      primaryBenefit: 'Strengthens deep cervical flexors and corrects forward-head tech-neck posture.',
      instructions: [
        'Sit upright with spine aligned against chair back.',
        'Draw chin backward horizontally as if making a double chin (without tilting head down).',
        'Hold isometric contraction for 5 seconds.',
        'Perform 10 repetitions twice daily.'
      ],
      breathTimingSec: { inhale: 4, hold: 5, exhale: 4 },
      jointTransformations: { spineCurvatureDeg: -5, hipFlexionDeg: 0, shoulderRotationDeg: 0 }
    },
    // --- Clinical Pilates & Somatic Core Movement Protocols ---
    {
      id: 'pilates_hundred',
      name: 'Pilates The Hundred',
      sanskritName: 'Clinical Pilates',
      targetBodyRegion: 'core_abdominis',
      primaryBenefit: 'Builds deep transverse abdominis endurance, intra-abdominal pressure, and intercostal breathing.',
      instructions: [
        'Lie supine in neutral spine, curl head and neck up to shoulder tips.',
        'Extend legs to 45-degree angle in Pilates V stance.',
        'Vigorously pump arms up and down 6 inches off mat.',
        'Inhale for 5 arm pumps, exhale for 5 arm pumps (10 cycles = 100 pumps).'
      ],
      breathTimingSec: { inhale: 5, hold: 0, exhale: 5 },
      jointTransformations: { spineCurvatureDeg: 15, hipFlexionDeg: 45, shoulderRotationDeg: 10 }
    },
    {
      id: 'pilates_swimming',
      name: 'Pilates Swimming',
      sanskritName: 'Clinical Pilates',
      targetBodyRegion: 'spine_thoracic',
      primaryBenefit: 'Strengthens posterior chain, lumbar multifidus, and gluteal endurance.',
      instructions: [
        'Lie prone with arms extended overhead and legs hip-width apart.',
        'Hover head, chest, arms, and legs 2 inches off mat.',
        'Flutter opposite arm and leg up and down rapidly in rhythmic motion.',
        'Maintain steady diaphragmatic breath for 30-45 seconds.'
      ],
      breathTimingSec: { inhale: 4, hold: 0, exhale: 4 },
      jointTransformations: { spineCurvatureDeg: 20, hipFlexionDeg: -10, shoulderRotationDeg: -20 }
    }
  ];

  /**
   * Recommends a targeted 3D Yoga Asana pose based on selected body region.
   */
  /**
   * Recommends a targeted 3D Yoga Asana pose based on selected body region.
   */
  getPoseForBodyRegion(bodyRegionId: string): IYogaAsanaPose {
    const found = this.curatedAsanaLibrary.find(p => p.targetBodyRegion === bodyRegionId);
    return found || this.curatedAsanaLibrary[0];
  }

  /**
   * Procedurally generates a custom 3D Yoga Asana pose from 245 combinatorial possibilities
   * across Stance, Spinal Plane Action, and Arm/Leg Configurations.
   */
  generateProceduralAsana(
    stance: 'standing' | 'seated' | 'supine' | 'prone' | 'kneeling' | 'inversion' | 'tabletop',
    spinalAction: 'flexion' | 'extension' | 'sidebend' | 'twist' | 'neutral',
    armLegConfig: 'overhead' | 'eagle' | 'bound' | 'lotus' | 'wide' | 'single_leg'
  ): IYogaAsanaPose {
    let spineDeg = 0;
    let hipDeg = 0;
    let shoulderDeg = 0;

    if (spinalAction === 'extension') spineDeg = 30;
    else if (spinalAction === 'flexion') spineDeg = -35;
    else if (spinalAction === 'twist') spineDeg = 15;
    else if (spinalAction === 'sidebend') spineDeg = 20;

    if (stance === 'seated' || stance === 'kneeling') hipDeg = 90;
    else if (stance === 'supine') hipDeg = 180;
    else if (stance === 'prone') hipDeg = 0;

    if (armLegConfig === 'overhead') shoulderDeg = 170;
    else if (armLegConfig === 'eagle') shoulderDeg = 45;
    else if (armLegConfig === 'bound') shoulderDeg = -30;

    const poseName = `Procedural ${stance.toUpperCase()} ${spinalAction.toUpperCase()} (${armLegConfig})`;

    return {
      id: `proc_${stance}_${spinalAction}_${armLegConfig}`,
      name: poseName,
      sanskritName: 'Combinatorial Asana',
      targetBodyRegion: stance === 'standing' ? 'spine_lumbar' : 'pelvis',
      primaryBenefit: `Procedural 3D biomechanical combination targeting ${spinalAction} in ${stance} stance.`,
      instructions: [
        `Begin in ${stance} foundation stance.`,
        `Initiate ${spinalAction} movement pattern across vertebral column.`,
        `Engage ${armLegConfig} arm/leg alignment.`,
        `Hold for 5 conscious breath cycles with bio-haptic feedback.`
      ],
      breathTimingSec: { inhale: 4, hold: 2, exhale: 6 },
      jointTransformations: {
        spineCurvatureDeg: spineDeg,
        hipFlexionDeg: hipDeg,
        shoulderRotationDeg: shoulderDeg
      }
    };
  }
}
