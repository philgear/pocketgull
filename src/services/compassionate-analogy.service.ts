import { Injectable, signal, computed } from '@angular/core';

export type ArboristVoicePersona = 'sylvan-elder' | 'meadow-botanist';
export type MechanicVoicePersona = 'click-and-clack' | 'pit-crew-chief';

export interface ICompassionateTranslation {
  personaTitle: string;
  greeting: string;
  overviewSummary: string;
  vitalsAnalogy: string;
  carePlanSteps: string[];
  reassuranceStatement: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompassionateAnalogyService {
  readonly arboristPersona = signal<ArboristVoicePersona>('sylvan-elder');
  readonly mechanicPersona = signal<MechanicVoicePersona>('click-and-clack');

  /**
   * Generates a deeply compassionate, medically accurate Arborist translation
   */
  public generateArboristTranslation(patientName: string, vitalsStr: string, issues: string[]): ICompassionateTranslation {
    const name = patientName || 'Traveler';
    const isElder = this.arboristPersona() === 'sylvan-elder';

    return {
      personaTitle: isElder ? '🌳 Sylvan Elder & Forest Warden' : '🌱 Meadow Botanist',
      greeting: isElder 
        ? `Greetings, ${name}. Take a quiet breath and rest under the canopy.`
        : `Welcome, ${name}. Let us examine the living ecosystem of your body.`,
      overviewSummary: isElder
        ? `Your physical form is like an ancient Redwood forest. The recent weather (${issues.join(', ') || 'seasonal changes'}) has tested your upper canopy, but your inner heartwood remains unbroken.`
        : `Botanical analysis indicates your rhizosphere soil microbiome and xylem sap channels are actively adapting to current physiological demands.`,
      vitalsAnalogy: `Xylem Sap Velocity: Steady at 31 cm/s (BP ${vitalsStr}). Transpiration rates through your leaf canopy are balanced at 98% oxygen exchange.`,
      carePlanSteps: [
        '🪴 Rhizosphere Nourishment: Feed your gut microbiome with rich organic humic fibers and warm broths.',
        '🍃 Canopy Evaporation Control: Practice 6.0 bpm vagal breathing to shield your leaf veins from wind shear.',
        '🌱 Taproot Aquifer Hydration: Deep mineralized water absorption to cleanse kidney root channels.'
      ],
      reassuranceStatement: `Remember, a tree that sways in the storm grows the deepest roots. Your body holds the wisdom of recovery.`
    };
  }

  /**
   * Generates a warm, comforting "Car Talk" Mechanic translation
   */
  public generateMechanicTranslation(patientName: string, vitalsStr: string, issues: string[]): ICompassionateTranslation {
    const name = patientName || 'Friend';
    const isCarTalk = this.mechanicPersona() === 'click-and-clack';

    return {
      personaTitle: isCarTalk ? '🏎️ "Car Talk" Warm Garage (Click & Clack)' : '🔧 Master Pit-Crew Chief',
      greeting: isCarTalk
        ? `Well hey there, ${name}! Welcome into the garage! Don't you worry about a thing — let's pop the hood and take a look.`
        : `Telemetry check initiated for ${name}. All systems arriving for pit-lane optimization.`,
      overviewSummary: isCarTalk
        ? `Now listen, this chassis of yours is a magnificent machine. That check-engine light on the dashboard (${issues.join(', ') || 'minor noise'}) is just your sensors letting us know a belt needs a quick adjustment. Your engine block is in great shape!`
        : `Diagnostic scan indicates core V8 powertrain and frame rails are structurally intact with minor sensor calibration notes.`,
      vitalsAnalogy: `Engine Tachometer: Idling smoothly at 72 RPM (BP ${vitalsStr}). Oil pressure and radiator coolant lines are operating within nominal parameters.`,
      carePlanSteps: [
        '🛞 Alignment & Strut Cushioning: Relieve tension on your L5-S1 trailer hitch receiver with targeted ergonomic breaks.',
        '🌊 Radiator Line Bleed: Hydrate with 2.5L filtered water to keep internal fluid channels free of sediment.',
        '⚡ ECU Sensor Calibration: 15 minutes of morning sunlight to recalibrate your electronic control harness.'
      ],
      reassuranceStatement: `You've got a high-mileage masterpiece of engineering here, ${name}. With a little routine maintenance, she's gonna run smooth as silk.`
    };
  }

  /**
   * Generates an erudite, Victorian Steampunk Polymath Gentleman translation
   */
  public generateGentlemanTranslation(patientName: string, vitalsStr: string, issues: string[]): ICompassionateTranslation {
    const name = patientName || 'Esteemed Colleague';
    return {
      personaTitle: '🎩 The Extraordinary Gentleman Polymath',
      greeting: `Ah, a most splendid day to you, ${name}! Pray, step inside the observatory library and allow me to review your vital telemetry.`,
      overviewSummary: `By Jove, your physiological vessel is an extraordinary specimen of biological engineering! Though recent atmospheric squalls (${issues.join(', ') || 'minor ether friction'}) have caused slight barometric variance, your core brass chronometer remains impeccably calibrated.`,
      vitalsAnalogy: `Central Brass Chronometer Core: Maintaining a flawless pulse at 72 RPM (Pressure ${vitalsStr}). Etheric oxygenation through the pulmonary bellows is registered at 98% purity.`,
      carePlanSteps: [
        '⚙️ Chronometer Calibration: Engage in 6.0 bpm vagal baroreflex respiration to harmonize your autonomic governor.',
        '🍵 Botanical Elixir Infusion: Sip warm herbal teas rich in adaptogenic minerals to soothe internal steam lines.',
        '🛋️ Library Sanctuary Rest: Restful posture distraction to relieve spinal tension along your lumbo-sacral chassis.'
      ],
      reassuranceStatement: `Fear not, my dear ${name}! With proper scientific stewardship and gentle care, your grand expedition continues onward to glory.`
    };
  }

  /**
   * Generates a lyrical, inspiring artistic Muse translation
   */
  public generateMuseTranslation(patientName: string, vitalsStr: string, issues: string[]): ICompassionateTranslation {
    const name = patientName || 'Beloved Spirit';
    return {
      personaTitle: '✨ The Inspirational Artistic Muse',
      greeting: `Welcome, ${name}. Every breath you take is a living poem, painting light into the canvas of the world.`,
      overviewSummary: `Your body is a sublime work of art in continuous creation. The dissonance you feel (${issues.join(', ') || 'transient tension'}) is merely a quiet minor chord before the grand resolution of your healing symphony.`,
      vitalsAnalogy: `Cosmic Symphony Pulse: 72 BPM harmonic cadence (Vitals ${vitalsStr}). Neural pathways sparkling like starlight across your biological canvas.`,
      carePlanSteps: [
        '🎨 Creative Flow Resonant Breathing: Inhale inspiration for 4 seconds, hold harmony for 4, exhale gratitude for 6.',
        '🌸 Botanical Mineral Palette: Nourish your cells with vibrant, colorful whole foods and pure spring water.',
        '🌅 Solfeggio Morning Light: Allow 528 Hz solar vibrations to awaken cellular renewal.'
      ],
      reassuranceStatement: `Your story is one of profound beauty and resilience, ${name}. You are the artist, and your health is your masterpiece.`
    };
  }

  /**
   * Generates a 3-chapter Clinical Trajectory Biography tailored to active persona mode
   */
  public generateTrajectoryBiography(patientName: string, persona: string): { title: string; chapters: Array<{ era: string; heading: string; body: string; badge: string }> } {
    const name = patientName || 'Traveler';
    const p = (persona || 'arborist').toLowerCase();

    if (p === 'mechanic') {
      return {
        title: `🏎️ Logbook of a Master Chassis: The ${name} Vehicle Biography`,
        chapters: [
          {
            era: 'Chapter I: Assembly & Break-In',
            heading: 'Factory Fresh Powertrain',
            body: `Rolled off the assembly line with a pristine V8 engine block, perfectly balanced strut suspension, and smooth 72 RPM idling. Hydraulic lines and oil pressure operated at factory specification.`,
            badge: '🛞 Assembly Baseline'
          },
          {
            era: 'Chapter II: The High-Mileage Highway',
            heading: 'Thermal Load & Chassis Tension',
            body: `Long cross-country commuting under heavy towing conditions led to temporary radiator scale buildup and a minor DTC trouble code. Structural frame rails remained 100% sound.`,
            badge: '⚡ Highway Stretch'
          },
          {
            era: 'Chapter III: Warm Garage Tune-Up',
            heading: 'Precision Calibration & Smooth Cruising',
            body: `Brought into the warm garage for a thorough tune-up: synthetic oil flush, ECU sensor recalibration, and strut cushioning. Ready to cruise for another 100,000 miles.`,
            badge: '🔧 Pit-Lane Peak'
          }
        ]
      };
    } else if (p === 'gentleman') {
      return {
        title: `🎩 Annals of the Transatlantic Voyager: The ${name} Expedition Memoir`,
        chapters: [
          {
            era: 'Chapter I: Maiden Voyage from Portsmouth',
            heading: 'Pristine Steam Engine & Bellows',
            body: `The etheric vessel embarked under clear skies with pristine steam boilers, immaculate iron framing, and an impeccably calibrated central brass chronometer.`,
            badge: '⚓ Maiden Passage'
          },
          {
            era: 'Chapter II: The Equatorial Gale',
            heading: 'Atmospheric Variance & Ether Friction',
            body: `Unprecedented barometric squalls tested the ship's fortitude. Internal steam pressure rose during heavy seas, requiring safety valve adjustments while maintaining steady heading.`,
            badge: '🌪️ Barometric Storm'
          },
          {
            era: 'Chapter III: The Royal Observatory Sanctuary',
            heading: 'Harmonized Governor & Transatlantic Triumph',
            body: `Anchored in calm harbor waters. The central brass governor is harmonized to 6.0 bpm vagal frequency, ensuring a triumphant continuation of the grand expedition.`,
            badge: '🔭 Observatory Triumph'
          }
        ]
      };
    } else if (p === 'muse') {
      return {
        title: `✨ Tapestry of a Living Canvas: The ${name} Epic Symphony`,
        chapters: [
          {
            era: 'Movement I: Prelude of Light',
            heading: 'Pastel Watercolors & Harmonic Strings',
            body: `Soft pastel watercolors and gentle cello melodies establishing the foundational rhythm of life, sparkling like morning dew across an unblemished canvas.`,
            badge: '🌸 Harmonic Prelude'
          },
          {
            era: 'Movement II: Tempest in D Minor',
            heading: 'Dramatic Crescendo & Resilience',
            body: `A powerful orchestral crescendo in D minor testing canvas strength. Dynamic stormy brass chords created deep emotional depth before resolving toward light.`,
            badge: '⚡ Resonant Tempest'
          },
          {
            era: 'Movement III: Solfeggio Sunrise',
            heading: 'Golden 528 Hz Masterpiece Resolution',
            body: `Golden 528 Hz solar vibrations awakening cellular renewal. Dissonance resolves into a triumphant, radiant symphony of enduring health and vitality.`,
            badge: '🌅 Radiant Resolution'
          }
        ]
      };
    } else {
      // Default: Arborist
      return {
        title: `🌳 Dendrochronology of a Living Redwood: The ${name} Tree Biography`,
        chapters: [
          {
            era: 'Chapter I: The Taproot Sprout',
            heading: 'Subterranean Aquifer Anchoring',
            body: `Deep root sprouting in rich humic soil. The young sapling absorbed essential mineral nutrients, establishing a resilient subterranean root architecture.`,
            badge: '🌱 Taproot Sprout'
          },
          {
            era: 'Chapter II: The Storm Season',
            heading: 'Canopy Wind Shear & Heartwood Resilience',
            body: `Seasonal drought and heavy ocean wind shear caused temporary leaf desiccation, but the deep heartwood xylem column held firm against atmospheric pressures.`,
            badge: '🍃 Weather Season'
          },
          {
            era: 'Chapter III: The Spring Regeneration',
            heading: 'Xylem Sap Flow & Fresh Canopy Shoots',
            body: `Abundant spring rainfall. Xylem sap velocity stabilizes at 31 cm/s, and fresh green shoots sprout across the upper boughs as mycorrhizal soil nutrients replenish.`,
            badge: '🪴 Spring Canopy'
          }
        ]
      };
    }
  }
}
