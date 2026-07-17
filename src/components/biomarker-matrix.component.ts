import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface IBiomarkerStatus {
  name: string;
  level: 'Deficient' | 'Sub-optimal' | 'Optimal' | 'High' | 'Excess';
  pathway: string;
}

@Component({
  selector: 'app-biomarker-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (biomarkers().length > 0) {
      <div class="mb-8 mt-4 bg-zinc-900/5 dark:bg-black/20 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-500/10 shadow-inner relative overflow-hidden">
        <!-- Glowing background effect -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl rounded-full"></div>
        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full"></div>

        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900 dark:text-emerald-50 uppercase tracking-widest">Biomarker Matrix</h3>
              <p class="text-xs text-gray-600 dark:text-emerald-400/80 uppercase tracking-widest mt-0.5">Orthomolecular Status Detected</p>
            </div>
          </div>

          @if (introText()) {
            <p class="text-xs text-gray-700 dark:text-zinc-300 mb-6 leading-relaxed font-medium">
              {{ introText() }}
            </p>
          }

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @for (marker of biomarkers(); track marker.name) {
              @let isCritical = marker.level === 'Deficient' || marker.level === 'Excess';
              @let isWarning = marker.level === 'Sub-optimal' || marker.level === 'High';
              @let isOptimal = marker.level === 'Optimal';

              <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl p-4 border transition-all hover:scale-105 shadow-sm"
                   [class.border-red-200]="isCritical"
                   [class.dark:border-red-900]="isCritical"
                   [class.border-yellow-200]="isWarning"
                   [class.dark:border-yellow-900]="isWarning"
                   [class.border-emerald-200]="isOptimal"
                   [class.dark:border-emerald-900]="isOptimal">
                
                <div class="flex justify-between items-start mb-2">
                  <span class="text-sm font-bold text-gray-900 dark:text-zinc-100 truncate pr-2" [title]="marker.name">{{ marker.name }}</span>
                  <div class="w-2.5 h-2.5 rounded-full mt-1 shrink-0 animate-pulse"
                       [class.bg-red-500]="isCritical"
                       [class.bg-yellow-500]="isWarning"
                       [class.bg-emerald-500]="isOptimal"></div>
                </div>
                
                <div class="text-xs font-bold uppercase tracking-wider mb-2"
                     [class.text-red-700]="isCritical"
                     [class.dark:text-red-400]="isCritical"
                     [class.text-amber-700]="isWarning"
                     [class.dark:text-amber-400]="isWarning"
                     [class.text-emerald-700]="isOptimal"
                     [class.dark:text-emerald-400]="isOptimal">
                  {{ marker.level }}
                </div>
 
                <div class="text-xs text-gray-600 dark:text-zinc-400 uppercase tracking-widest truncate" [title]="marker.pathway">
                  {{ marker.pathway }}
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class BiomarkerMatrixComponent {
  reportText = input<string>('');

  introText = computed(() => {
    const text = this.reportText();
    if (!text) return '';
    const match = text.match(/###\s*(?:Biochemical\s*&\s*)?Biomarker\s*Matrix\s*\n([\s\S]*?)(?:```|###|$)/i);
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
