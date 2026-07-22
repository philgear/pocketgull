import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';

export interface IPedigreeMember {
  id: string;
  relation: string; // e.g. 'Maternal Grandmother', 'Father', 'Child'
  name: string;
  generation: 'grandparents' | 'parents' | 'offspring';
  status: 'active_risk' | 'neutralized' | 'optimal';
  riskLabel: string; // e.g. 'MTHFR C677T Heterozygous'
  biomarkers: { name: string; value: string; status: 'high' | 'optimal' | 'low' }[];
  intervention: string; // e.g. 'L-5-MTHF 800mcg + Active B12'
  bioAgeDelta: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-family-tree-pedigree',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in">
      
      <!-- Modal Container -->
      <div class="w-full max-w-5xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col font-['Inter']">
        
        <!-- Header -->
        <div class="p-6 bg-slate-50 dark:bg-zinc-850 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
              🌳
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-zinc-100">Family Health Pedigree Tree & Risk Branch Pruning</h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">Trace hereditary risk lineages, drill down into biomarkers, and neutralize hazard branches</p>
            </div>
          </div>
          <button (click)="closeModal.emit()" class="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-2xl font-semibold p-1 cursor-pointer">
            &times;
          </button>
        </div>

        <!-- Main Body: Split View (Tree + Drill-down Panel) -->
        <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          <!-- Tree Visualizer Canvas -->
          <div class="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-100/60 dark:bg-zinc-950">
            
            <!-- Generation 1: Grandparents -->
            <div class="space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Generation 1 — Grandparents (Senior Caretaking)</span>
              <div class="grid grid-cols-2 gap-4">
                <div *ngFor="let member of getMembersByGen('grandparents')" 
                  (click)="selectMember(member)"
                  [class.ring-2]="selectedMember()?.id === member.id"
                  [class.ring-teal-500]="selectedMember()?.id === member.id"
                  class="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between">
                  <div>
                    <span class="text-[10px] font-bold uppercase text-slate-400">{{ member.relation }}</span>
                    <h4 class="text-xs font-bold text-slate-800 dark:text-zinc-200">{{ member.name }}</h4>
                    <p class="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{{ member.riskLabel }}</p>
                  </div>
                  <span [class]="getStatusBadgeClass(member.status)" class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {{ getStatusText(member.status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Connecting Connector Line -->
            <div class="flex justify-center">
              <div class="w-0.5 h-6 bg-slate-300 dark:bg-zinc-700"></div>
            </div>

            <!-- Generation 2: Parents -->
            <div class="space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Generation 2 — Parents (Pre-Conception & Mid-Life)</span>
              <div class="grid grid-cols-2 gap-4">
                <div *ngFor="let member of getMembersByGen('parents')" 
                  (click)="selectMember(member)"
                  [class.ring-2]="selectedMember()?.id === member.id"
                  [class.ring-teal-500]="selectedMember()?.id === member.id"
                  class="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between">
                  <div>
                    <span class="text-[10px] font-bold uppercase text-slate-400">{{ member.relation }}</span>
                    <h4 class="text-xs font-bold text-slate-800 dark:text-zinc-200">{{ member.name }}</h4>
                    <p class="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{{ member.riskLabel }}</p>
                  </div>
                  <span [class]="getStatusBadgeClass(member.status)" class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {{ getStatusText(member.status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Connecting Connector Line -->
            <div class="flex justify-center">
              <div class="w-0.5 h-6 bg-slate-300 dark:bg-zinc-700"></div>
            </div>

            <!-- Generation 3: Offspring -->
            <div class="space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Generation 3 — Offspring (Protected Healthspan)</span>
              <div class="grid grid-cols-1 gap-4">
                <div *ngFor="let member of getMembersByGen('offspring')" 
                  (click)="selectMember(member)"
                  [class.ring-2]="selectedMember()?.id === member.id"
                  [class.ring-teal-500]="selectedMember()?.id === member.id"
                  class="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between">
                  <div>
                    <span class="text-[10px] font-bold uppercase text-slate-400">{{ member.relation }}</span>
                    <h4 class="text-xs font-bold text-slate-800 dark:text-zinc-200">{{ member.name }}</h4>
                    <p class="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{{ member.riskLabel }}</p>
                  </div>
                  <span [class]="getStatusBadgeClass(member.status)" class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {{ getStatusText(member.status) }}
                  </span>
                </div>
              </div>
            </div>

          </div>

          <!-- Drill-Down Detail Drawer -->
          <div *ngIf="selectedMember() as member" class="w-full lg:w-96 p-6 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between overflow-y-auto space-y-6">
            
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div>
                  <span class="text-[10px] font-bold uppercase text-slate-400">Drill-Down Member Detail</span>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-zinc-100">{{ member.name }} ({{ member.relation }})</h3>
                </div>
                <span [class]="getStatusBadgeClass(member.status)" class="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase">
                  {{ getStatusText(member.status) }}
                </span>
              </div>

              <!-- Biomarker Matrix -->
              <div class="space-y-2">
                <span class="text-[10px] font-bold uppercase text-slate-400">Key Biomarker & Variant Metrics</span>
                <div class="space-y-1.5">
                  <div *ngFor="let bio of member.biomarkers" class="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-zinc-800/60 text-xs">
                    <span class="text-slate-600 dark:text-zinc-400">{{ bio.name }}</span>
                    <span class="font-bold" [class.text-red-500]="bio.status === 'high'" [class.text-emerald-500]="bio.status === 'optimal'">
                      {{ bio.value }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Target Protocol -->
              <div class="space-y-1">
                <span class="text-[10px] font-bold uppercase text-slate-400">Multi-Paradigm Neutralization Protocol</span>
                <p class="text-xs font-medium text-slate-800 dark:text-zinc-200 bg-teal-500/10 p-3 rounded-lg border border-teal-500/20">
                  {{ member.intervention }}
                </p>
              </div>

              <!-- Epigenetic Delta -->
              <div class="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <span class="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block mb-0.5">Actuarial Epigenetic Delta</span>
                <p class="font-bold text-emerald-700 dark:text-emerald-300">
                  Biological Age Delta: {{ member.bioAgeDelta }} yrs
                </p>
              </div>
            </div>

            <!-- Risk Pruning Action Button -->
            <div class="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-2">
              <pocket-gull-button 
                *ngIf="member.status === 'active_risk'"
                (click)="neutralizeBranch(member.id)" 
                variant="primary" 
                size="sm" 
                icon="M13 10V3L4 14h7v7l9-11h-7z"
                class="w-full">
                Prune & Neutralize Risk Branch
              </pocket-gull-button>

              <p *ngIf="member.status !== 'active_risk'" class="text-center text-xs text-emerald-600 dark:text-emerald-400 font-bold py-2">
                ✓ Risk Branch Successfully Neutralized
              </p>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 bg-slate-50 dark:bg-zinc-850 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-zinc-400">Interactive Family Pedigree Tree • Prune branches to expand offspring healthspan</span>
          <pocket-gull-button (click)="closeModal.emit()" variant="secondary" size="sm">
            Close Visualizer
          </pocket-gull-button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class FamilyTreePedigreeComponent {
  closeModal = output<void>();

  members = signal<IPedigreeMember[]>([
    {
      id: 'g_mat_gf',
      relation: 'Maternal Grandfather',
      name: 'Arthur Miller',
      generation: 'grandparents',
      status: 'active_risk',
      riskLabel: 'Early ApoB Cardiopulmonary Risk',
      biomarkers: [
        { name: 'ApoB', value: '142 mg/dL', status: 'high' },
        { name: 'hs-CRP', value: '3.8 mg/L', status: 'high' }
      ],
      intervention: 'Vagal Tone 6.0 bpm breathing + CoQ10 200mg + TCM Shen Harmonization',
      bioAgeDelta: +3.2
    },
    {
      id: 'g_mat_gm',
      relation: 'Maternal Grandmother',
      name: 'Evelyn Miller',
      generation: 'grandparents',
      status: 'neutralized',
      riskLabel: 'Mild Osteoarthritis & Vata Dryness',
      biomarkers: [
        { name: 'Vitamin D3', value: '52 ng/mL', status: 'optimal' },
        { name: 'RBC Magnesium', value: '6.4 mg/dL', status: 'optimal' }
      ],
      intervention: 'Ayurvedic Warm Sesame Abhyanga + Ashwagandha Root',
      bioAgeDelta: -2.1
    },
    {
      id: 'p_mother',
      relation: 'Mother',
      name: 'Sarah Miller',
      generation: 'parents',
      status: 'active_risk',
      riskLabel: 'MTHFR C677T Heterozygous',
      biomarkers: [
        { name: 'Homocysteine', value: '12.4 µmol/L', status: 'high' },
        { name: 'Serum Folate', value: 'Sub-optimal', status: 'low' }
      ],
      intervention: 'L-5-MTHF 800mcg + Methyl-B12 + Ubiquinol Oocyte Support',
      bioAgeDelta: -1.5
    },
    {
      id: 'p_father',
      relation: 'Father',
      name: 'David Miller',
      generation: 'parents',
      status: 'neutralized',
      riskLabel: 'Spermatogenic Stress Neutralized',
      biomarkers: [
        { name: 'Sperm DFI', value: '12%', status: 'optimal' },
        { name: 'Fasting Insulin', value: '5.2 µIU/mL', status: 'optimal' }
      ],
      intervention: 'Zinc Picolinate 30mg + L-Carnitine + Organic Whole Foods',
      bioAgeDelta: -3.8
    },
    {
      id: 'o_child',
      relation: 'Offspring / Child',
      name: 'Leo Miller',
      generation: 'offspring',
      status: 'optimal',
      riskLabel: 'Protected Healthspan & Clean Methylation',
      biomarkers: [
        { name: 'Folate Methylation', value: 'Optimal', status: 'optimal' },
        { name: 'Mitochondrial Reserve', value: 'High', status: 'optimal' }
      ],
      intervention: 'Pre-Conception Epigenetic Optimization Complete (+8.4 QALYs)',
      bioAgeDelta: -5.6
    }
  ]);

  selectedMember = signal<IPedigreeMember | null>(this.members()[2]); // Default to Mother

  getMembersByGen(gen: 'grandparents' | 'parents' | 'offspring') {
    return this.members().filter(m => m.generation === gen);
  }

  selectMember(member: IPedigreeMember) {
    this.selectedMember.set(member);
  }

  neutralizeBranch(id: string) {
    this.members.update(list => list.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: 'neutralized',
          bioAgeDelta: parseFloat((m.bioAgeDelta - 4.0).toFixed(1))
        };
      }
      return m;
    }));

    if (this.selectedMember()?.id === id) {
      const updated = this.members().find(m => m.id === id);
      if (updated) this.selectedMember.set(updated);
    }
  }

  getStatusBadgeClass(status: string) {
    if (status === 'active_risk') return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30';
    if (status === 'neutralized') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
    return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30';
  }

  getStatusText(status: string) {
    if (status === 'active_risk') return 'Active Risk Branch';
    if (status === 'neutralized') return 'Risk Branch Neutralized';
    return 'Optimal Protection';
  }
}
