import { Injectable } from '@angular/core';

export interface ITermDefinition {
  term: string;
  definition: string;
  category: 'western' | 'genetics' | 'tcm' | 'ayurveda' | 'actuarial';
}

@Injectable({
  providedIn: 'root'
})
export class MedicalDecoderService {

  private readonly dictionary: Record<string, ITermDefinition> = {
    'apob': {
      term: 'ApoB',
      definition: 'Apolipoprotein B: A direct count of all cholesterol particles that can cause arterial plaque.',
      category: 'western'
    },
    'hs-crp': {
      term: 'hs-CRP',
      definition: 'High-Sensitivity C-Reactive Protein: A blood marker measuring general vascular inflammation.',
      category: 'western'
    },
    'homocysteine': {
      term: 'Homocysteine',
      definition: 'An amino acid marker indicating methylation efficiency and cardiovascular/brain health.',
      category: 'western'
    },
    'qrs': {
      term: 'QRS Duration',
      definition: 'The electrical measurement (in milliseconds) of how fast your heart ventricles pump.',
      category: 'western'
    },
    'qtc': {
      term: 'QTc Interval',
      definition: 'The heart rate-corrected duration of heart muscle electrical recharge.',
      category: 'western'
    },
    'sdnn': {
      term: 'SDNN',
      definition: 'Standard deviation of heartbeats: The primary measure of overall Heart Rate Variability (HRV).',
      category: 'western'
    },
    'vagal tone': {
      term: 'Vagal Tone',
      definition: 'The strength of your vagus nerve in calming your heart rate and lowering stress.',
      category: 'western'
    },
    'mthfr': {
      term: 'MTHFR',
      definition: 'A key gene controlling how your body converts folate into active B12 for DNA repair.',
      category: 'genetics'
    },
    'l-5-mthf': {
      term: 'L-5-MTHF',
      definition: 'The active, bioavailable form of folate that bypasses MTHFR gene mutations.',
      category: 'genetics'
    },
    'ubiquinol': {
      term: 'Ubiquinol',
      definition: 'The active antioxidant form of CoQ10 that fuels cellular mitochondria energy.',
      category: 'genetics'
    },
    'sirtuins': {
      term: 'Sirtuins',
      definition: 'Longevity proteins that regulate cellular repair, inflammation, and aging pace.',
      category: 'genetics'
    },
    'qi': {
      term: 'Qi',
      definition: 'In Chinese Medicine, the vital life force energy flowing through your body meridians.',
      category: 'tcm'
    },
    'shen': {
      term: 'Shen',
      definition: 'In Chinese Medicine, your mind, spirit, and emotional clarity housed in the Heart.',
      category: 'tcm'
    },
    'ren mai': {
      term: 'Ren Mai',
      definition: 'The Conception Vessel meridian regulating reproductive health and Yin energy.',
      category: 'tcm'
    },
    'jing': {
      term: 'Jing',
      definition: 'In Chinese Medicine, your foundational kidney essence and cellular longevity reserve.',
      category: 'tcm'
    },
    'ama': {
      term: 'Ama',
      definition: 'In Ayurveda, metabolic toxins and un-digested waste accumulated in tissues.',
      category: 'ayurveda'
    },
    'agni': {
      term: 'Agni',
      definition: 'In Ayurveda, your metabolic digestive fire responsible for nutrient absorption.',
      category: 'ayurveda'
    },
    'vata': {
      term: 'Vata',
      definition: 'The Ayurvedic energy governing movement, nervous system, and circulation.',
      category: 'ayurveda'
    },
    'pitta': {
      term: 'Pitta',
      definition: 'The Ayurvedic energy governing digestion, metabolism, and body temperature.',
      category: 'ayurveda'
    },
    'kapha': {
      term: 'Kapha',
      definition: 'The Ayurvedic energy governing bodily structure, lubrication, and stability.',
      category: 'ayurveda'
    },
    'rasayana': {
      term: 'Rasayana',
      definition: 'Traditional Ayurvedic rejuvenation protocols promoting cellular longevity.',
      category: 'ayurveda'
    },
    'gompertz': {
      term: 'Gompertz-Makeham',
      definition: 'An actuarial mathematical law modeling mortality risk and aging rates over time.',
      category: 'actuarial'
    },
    'qaly': {
      term: 'QALY',
      definition: 'Quality-Adjusted Life Year: A standard measure combining length and quality of life.',
      category: 'actuarial'
    }
  };

  public getDefinition(term: string): ITermDefinition | null {
    const key = term.toLowerCase().trim();
    return this.dictionary[key] || null;
  }

  public annotateText(html: string): string {
    if (!html) return '';
    let annotated = html;

    Object.keys(this.dictionary).forEach(key => {
      const def = this.dictionary[key];
      const regex = new RegExp(`\\b(${def.term})\\b`, 'gi');
      annotated = annotated.replace(regex, `<mark class="medical-term cursor-help bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold px-1 rounded hover:bg-teal-500/20 transition" title="💡 ${def.definition}">$1</mark>`);
    });

    return annotated;
  }
}
