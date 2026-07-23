import { Component, ChangeDetectionStrategy, input, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';

interface IBiomarkerStatus {
  name: string;
  level: 'Deficient' | 'Sub-optimal' | 'Optimal' | 'High' | 'Excess';
  pathway: string;
}

/** WHO/CDC clinical reference guidelines mapped to biomarker names. */
const WHO_CDC_GUIDELINES: Record<string, string> = {
  'Magnesium':     'WHO RNI: 220–260 mg/day (adults). CDC notes Mg deficiency linked to type 2 diabetes, CVD, and osteoporosis.',
  'Vitamin D3':    'WHO: 5–15 µg/day (200–600 IU). CDC: serum 25(OH)D ≥20 ng/mL sufficient; ≥30 ng/mL optimal for bone health.',
  'Vitamin B12':   'WHO RNI: 2.4 µg/day. CDC: serum B12 <200 pg/mL indicates deficiency; methylmalonic acid confirms.',
  'Folate (B9)':   'WHO RNI: 400 µg DFE/day. CDC: ≥400 µg folic acid pre-conception reduces NTD risk by 50–70%.',
  'Zinc':          'WHO RNI: 4.9–7.0 mg/day (females), 7.0–9.8 mg/day (males). CDC: zinc supplementation reduces diarrhea duration 25%.',
  'Homocysteine':  'WHO: >15 µmol/L = hyperhomocysteinemia. CDC: elevated Hcy independently associated with CVD and stroke risk.',
  'Ferritin':      'WHO: serum ferritin <15 µg/L = iron deficiency. CDC: 12–150 ng/mL (females), 12–300 ng/mL (males) normal range.',
  'Vitamin C':     'WHO RNI: 45 mg/day. CDC: serum ascorbic acid <11.4 µmol/L = deficiency; scurvy risk below 10 mg/day intake.',
};

@Component({
  selector: 'app-biomarker-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (biomarkers().length > 0) {
      <div class="mb-8 mt-4 bg-zinc-900/5 dark:bg-black/20 rounded-2xl p-4 md:p-6 border border-emerald-900/10 dark:border-emerald-500/10 shadow-inner relative overflow-hidden">
        <!-- Glowing background effect -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl rounded-full"></div>
        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full"></div>

        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-4 md:mb-6">
            <div class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm md:text-base font-bold text-gray-900 dark:text-emerald-50 uppercase tracking-widest">
                {{ personaBiomarkerTitle() }}
              </h3>
              <p class="text-[10px] md:text-xs text-gray-600 dark:text-emerald-400/80 uppercase tracking-widest mt-0.5">Orthomolecular Telemetry Status</p>
            </div>
            <!-- Global WHO/CDC toggle -->
            <label class="flex items-center gap-1.5 cursor-pointer select-none group shrink-0" title="Show WHO/CDC clinical guidelines for all biomarkers">
              <input type="checkbox" class="sr-only peer" (change)="toggleAllGuidelines()" [checked]="allGuidelinesExpanded()">
              <div class="w-8 h-[18px] md:w-9 md:h-5 bg-gray-300 dark:bg-zinc-700 rounded-full relative transition-colors peer-checked:bg-sky-500 dark:peer-checked:bg-sky-600 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-400 peer-focus-visible:ring-offset-1">
                <div class="absolute left-0.5 top-0.5 w-3.5 h-3.5 md:w-4 md:h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-3.5 md:peer-checked:translate-x-4"
                     [class.translate-x-3.5]="allGuidelinesExpanded()"
                     [class.md:translate-x-4]="allGuidelinesExpanded()"></div>
              </div>
              <span class="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors whitespace-nowrap">WHO/CDC</span>
            </label>
          </div>

          @if (introText()) {
            <p class="text-[10px] md:text-xs text-gray-700 dark:text-zinc-300 mb-4 md:mb-6 leading-relaxed font-medium">
              {{ introText() }}
            </p>
          }

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            @for (marker of biomarkers(); track marker.name) {
              @let isCritical = marker.level === 'Deficient' || marker.level === 'Excess';
              @let isWarning = marker.level === 'Sub-optimal' || marker.level === 'High';
              @let isOptimal = marker.level === 'Optimal';
              @let guidelineVisible = isGuidelineExpanded(marker.name);

              <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl p-3 md:p-4 border transition-all hover:scale-[1.02] md:hover:scale-105 shadow-sm"
                   [class.border-red-200]="isCritical"
                   [class.dark:border-red-900]="isCritical"
                   [class.border-yellow-200]="isWarning"
                   [class.dark:border-yellow-900]="isWarning"
                   [class.border-emerald-200]="isOptimal"
                   [class.dark:border-emerald-900]="isOptimal">
                
                <div class="flex justify-between items-start mb-1.5 md:mb-2">
                  <span class="text-xs md:text-sm font-bold text-gray-900 dark:text-zinc-100 truncate pr-2" [title]="marker.name">{{ marker.name }}</span>
                  <div class="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full mt-0.5 md:mt-1 shrink-0 animate-pulse"
                       [class.bg-red-500]="isCritical"
                       [class.bg-yellow-500]="isWarning"
                       [class.bg-emerald-500]="isOptimal"></div>
                </div>
                
                <div class="text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1.5 md:mb-2"
                     [class.text-red-700]="isCritical"
                     [class.dark:text-red-400]="isCritical"
                     [class.text-amber-700]="isWarning"
                     [class.dark:text-amber-400]="isWarning"
                     [class.text-emerald-700]="isOptimal"
                     [class.dark:text-emerald-400]="isOptimal">
                  {{ marker.level }}
                </div>
 
                <div class="text-[10px] md:text-xs text-gray-600 dark:text-zinc-400 uppercase tracking-widest truncate" [title]="marker.pathway">
                  {{ marker.pathway }}
                </div>

                <!-- WHO/CDC Guideline Toggle -->
                @if (getGuideline(marker.name); as guideline) {
                  <div class="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-100 dark:border-zinc-800">
                    <label class="flex items-center gap-1.5 cursor-pointer select-none group">
                      <input type="checkbox" class="w-3 h-3 md:w-3.5 md:h-3.5 rounded border-gray-300 dark:border-zinc-600 text-sky-500 focus:ring-sky-400 focus:ring-offset-0 transition-colors" 
                             [checked]="guidelineVisible"
                             (change)="toggleGuideline(marker.name)">
                      <span class="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">WHO/CDC Ref</span>
                    </label>
                    @if (guidelineVisible) {
                      <div class="mt-1.5 md:mt-2 p-1.5 md:p-2 rounded-lg bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/50 dark:border-sky-800/30 animate-fadeIn">
                        <div class="flex items-start gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5 md:w-3 md:h-3 text-sky-500 dark:text-sky-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                          <p class="text-[9px] leading-[13px] md:text-[11px] md:leading-[15px] text-sky-800 dark:text-sky-300/90 font-medium">{{ guideline }}</p>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
  `]
})
export class BiomarkerMatrixComponent {
  reportText = input<string>('');
  protected readonly themeService = inject(ThemeService);

  readonly personaBiomarkerTitle = computed(() => {
    const mode = this.themeService.analogyLensMode();
    if (mode === 'arborist') return '🌳 Sap & Aquifer Biomarker Telemetry';
    if (mode === 'mechanic') return '🏎️ Fluid Line & Compression PSI Telemetry';
    if (mode === 'gentleman') return '🎩 Brass Governor & Etheric Dial Telemetry';
    if (mode === 'muse') return '✨ Harmonic Solfeggio Resonance Telemetry';
    return '🔬 Biomarker Matrix Telemetry';
  });

  /** Track which biomarker guideline cards are expanded */
  private expandedGuidelines = signal<Set<string>>(new Set());

  /** Whether all guidelines are toggled on globally */
  allGuidelinesExpanded = signal(false);

  /** Toggle an individual biomarker's WHO/CDC guideline visibility */
  toggleGuideline(name: string): void {
    const current = new Set(this.expandedGuidelines());
    if (current.has(name)) {
      current.delete(name);
    } else {
      current.add(name);
    }
    this.expandedGuidelines.set(current);
    // Sync the global toggle state
    this.allGuidelinesExpanded.set(current.size === this.biomarkers().length);
  }

  /** Toggle all guidelines on/off */
  toggleAllGuidelines(): void {
    const nextState = !this.allGuidelinesExpanded();
    this.allGuidelinesExpanded.set(nextState);
    if (nextState) {
      this.expandedGuidelines.set(new Set(this.biomarkers().map(m => m.name)));
    } else {
      this.expandedGuidelines.set(new Set());
    }
  }

  /** Check if a specific guideline is expanded */
  isGuidelineExpanded(name: string): boolean {
    return this.expandedGuidelines().has(name);
  }

  /** Get the WHO/CDC guideline for a given biomarker name */
  getGuideline(name: string): string | null {
    return WHO_CDC_GUIDELINES[name] ?? null;
  }

  introText = computed(() => {
    const text = this.reportText();
    if (!text) return '';
    const match = text.match(/###\s*(?:Biochemical\s*\&\s*)?Biomarker\s*Matrix\s*\n([\s\S]*?)(?:```|###|$)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    return '';
  });

  // Auto-parse the AI markdown report to find implied biomarker statuses
  biomarkers = computed(() => {
    const text = this.reportText();
    if (!text) return [];

    const markers: IBiomarkerStatus[] = [];
    const dictionary = [
      { name: 'Magnesium', pathway: 'ATP Synthesis / NMDA' },
      { name: 'Vitamin D3', pathway: 'Immune / Bone' },
      { name: 'Vitamin B12', pathway: 'Methylation' },
      { name: 'Folate (B9)', pathway: 'Methylation / DNA' },
      { name: 'Zinc', pathway: 'Immune / Hormones' },
      { name: 'Homocysteine', pathway: 'Cardiovascular / Methylation' },
      { name: 'Ferritin', pathway: 'Iron Storage / Thyroid' },
      { name: 'Vitamin C', pathway: 'Collagen / Antioxidant' }
    ];

    // Strategy 1: Look for JSON code blocks or raw JSON arrays
    let jsonText: string | null = null;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)(?:```|$)/i);
    if (jsonMatch && jsonMatch[1]) {
      jsonText = jsonMatch[1].trim();
    } else {
      const rawArrayMatch = text.match(/(\[\s*\{\s*"name"[\s\S]*?\])/i);
      if (rawArrayMatch && rawArrayMatch[1]) {
        jsonText = rawArrayMatch[1].trim();
      }
    }

    if (jsonText) {
      try {
        let jsonStr = jsonText;
        // Handle potentially incomplete JSON if streaming
        if (!jsonStr.endsWith(']')) {
          const lastCurly = jsonStr.lastIndexOf('}');
          if (lastCurly !== -1) {
            jsonStr = jsonStr.substring(0, lastCurly + 1) + '\n]';
            if (!jsonStr.startsWith('[')) {
              jsonStr = '[\n' + jsonStr;
            }
          }
        }
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          parsed.forEach(item => {
            if (item && typeof item === 'object' && item.name) {
              const matchedDict = dictionary.find(d => d.name.toLowerCase() === item.name.toLowerCase());
              const name = matchedDict ? matchedDict.name : item.name;
              const pathway = item.pathway || (matchedDict ? matchedDict.pathway : 'Metabolic Pathway');
              const levelLower = String(item.level || '').toLowerCase();
              let level: IBiomarkerStatus['level'] = 'Optimal';
              if (levelLower.includes('defic') || levelLower === 'low') level = 'Deficient';
              else if (levelLower === 'sub-optimal') level = 'Sub-optimal';
              else if (levelLower === 'high') level = 'High';
              else if (levelLower === 'excess') level = 'Excess';
              else if (levelLower === 'optimal') level = 'Optimal';

              markers.push({ name, level, pathway });
            }
          });
        }
      } catch (e) {
        // If parsing fails, try custom regex extraction of individual objects
        const objRegex = /\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"level"\s*:\s*"([^"]+)"\s*,\s*"pathway"\s*:\s*"([^"]+)"\s*\}/gi;
        let match;
        while ((match = objRegex.exec(jsonText)) !== null) {
          const name = match[1];
          const levelStr = match[2].toLowerCase();
          const pathway = match[3];
          let level: IBiomarkerStatus['level'] = 'Optimal';
          if (levelStr.includes('defic') || levelStr === 'low') level = 'Deficient';
          else if (levelStr === 'sub-optimal') level = 'Sub-optimal';
          else if (levelStr === 'high') level = 'High';
          else if (levelStr === 'excess') level = 'Excess';

          markers.push({ name, level, pathway });
        }
      }
    }

    // If Strategy 1 successfully extracted markers, return them
    if (markers.length > 0) {
      return markers;
    }

    // Strategy 2: Heuristic regex fallback
    const textLower = text.toLowerCase();
    dictionary.forEach(d => {
      // Look for the biomarker name near words like deficient, low, optimal, high
      const regex = new RegExp(`(?:${d.name.toLowerCase().replace(/\\(.+\\)/, '').trim()}).{0,40}(deficient|deficiency|low|sub-optimal|optimal|high|excess)`, 'i');
      const match = textLower.match(regex);
      if (match) {
        const val = match[1].toLowerCase();
        let level: IBiomarkerStatus['level'] = 'Optimal';
        if (val.includes('defic') || val === 'low') level = 'Deficient';
        if (val === 'sub-optimal') level = 'Sub-optimal';
        if (val === 'high') level = 'High';
        if (val === 'excess') level = 'Excess';
        
        markers.push({ name: d.name, level, pathway: d.pathway });
      } else {
        // Look backwards as well (e.g., "deficient in magnesium")
        const reverseRegex = new RegExp(`(deficient|deficiency|low|sub-optimal|optimal|high|excess).{0,40}(?:${d.name.toLowerCase().replace(/\\(.+\\)/, '').trim()})`, 'i');
        const revMatch = textLower.match(reverseRegex);
        if (revMatch) {
          const val = revMatch[1].toLowerCase();
          let level: IBiomarkerStatus['level'] = 'Optimal';
          if (val.includes('defic') || val === 'low') level = 'Deficient';
          if (val === 'sub-optimal') level = 'Sub-optimal';
          if (val === 'high') level = 'High';
          if (val === 'excess') level = 'Excess';
          
          markers.push({ name: d.name, level, pathway: d.pathway });
        }
      }
    });

    return markers;
  });
}
