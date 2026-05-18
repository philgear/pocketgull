import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BiomarkerStatus {
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
              <h3 class="text-sm font-bold text-gray-900 dark:text-emerald-50 uppercase tracking-widest">Biomarker Matrix</h3>
              <p class="text-[10px] text-gray-500 dark:text-emerald-500/60 uppercase tracking-widest">Orthomolecular Status Detected</p>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @for (marker of biomarkers(); track marker.name) {
              <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl p-4 border transition-all hover:scale-105 shadow-sm"
                   [class.border-red-200]="marker.level === 'Deficient' || marker.level === 'Excess'"
                   [ngClass]="{'dark:border-red-900': marker.level === 'Deficient' || marker.level === 'Excess'}"
                   [class.border-yellow-200]="marker.level === 'Sub-optimal' || marker.level === 'High'"
                   [ngClass]="{'dark:border-yellow-900': marker.level === 'Sub-optimal' || marker.level === 'High'}"
                   [class.border-emerald-200]="marker.level === 'Optimal'"
                   [ngClass]="{'dark:border-emerald-900': marker.level === 'Optimal'}">
                
                <div class="flex justify-between items-start mb-2">
                  <span class="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate pr-2" [title]="marker.name">{{ marker.name }}</span>
                  <div class="w-2 h-2 rounded-full mt-1 shrink-0 animate-pulse"
                       [class.bg-red-500]="marker.level === 'Deficient' || marker.level === 'Excess'"
                       [class.bg-yellow-500]="marker.level === 'Sub-optimal' || marker.level === 'High'"
                       [class.bg-emerald-500]="marker.level === 'Optimal'"></div>
                </div>
                
                <div class="text-[10px] font-black uppercase tracking-wider mb-2"
                     [class.text-red-600]="marker.level === 'Deficient' || marker.level === 'Excess'"
                     [ngClass]="{'dark:text-red-400': marker.level === 'Deficient' || marker.level === 'Excess'}"
                     [class.text-yellow-600]="marker.level === 'Sub-optimal' || marker.level === 'High'"
                     [ngClass]="{'dark:text-yellow-400': marker.level === 'Sub-optimal' || marker.level === 'High'}"
                     [class.text-emerald-600]="marker.level === 'Optimal'"
                     [ngClass]="{'dark:text-emerald-400': marker.level === 'Optimal'}">
                  {{ marker.level }}
                </div>

                <div class="text-[9px] text-gray-500 dark:text-zinc-500 uppercase tracking-widest truncate" [title]="marker.pathway">
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

  // Auto-parse the AI markdown report to find implied biomarker statuses
  biomarkers = computed(() => {
    const text = this.reportText().toLowerCase();
    const markers: BiomarkerStatus[] = [];

    // Simple heuristic parser for common orthomolecular markers
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

    dictionary.forEach(d => {
      // Look for the biomarker name near words like deficient, low, optimal, high
      const regex = new RegExp(`(?:${d.name.toLowerCase().replace(/\\(.+\\)/, '').trim()}).{0,40}(deficient|deficiency|low|sub-optimal|optimal|high|excess)`, 'i');
      const match = text.match(regex);
      if (match) {
        const val = match[1].toLowerCase();
        let level: BiomarkerStatus['level'] = 'Optimal';
        if (val.includes('defic') || val === 'low') level = 'Deficient';
        if (val === 'sub-optimal') level = 'Sub-optimal';
        if (val === 'high') level = 'High';
        if (val === 'excess') level = 'Excess';
        
        markers.push({ name: d.name, level, pathway: d.pathway });
      } else {
        // Look backwards as well (e.g., "deficient in magnesium")
        const reverseRegex = new RegExp(`(deficient|deficiency|low|sub-optimal|optimal|high|excess).{0,40}(?:${d.name.toLowerCase().replace(/\\(.+\\)/, '').trim()})`, 'i');
        const revMatch = text.match(reverseRegex);
        if (revMatch) {
          const val = revMatch[1].toLowerCase();
          let level: BiomarkerStatus['level'] = 'Optimal';
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
