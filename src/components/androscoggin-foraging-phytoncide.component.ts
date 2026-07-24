import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';

export interface IForagingItem {
  id: string;
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  name: string;
  botanicalName: string;
  phytochemicals: string;
  therapeuticBenefit: string;
  icon: string;
  safetyGuide: string;
}

@Component({
  selector: 'app-androscoggin-foraging-phytoncide',
  standalone: true,
  imports: [CommonModule, PocketGullBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-2xl font-sans relative overflow-hidden pocket-gull-card mb-8">
      
      <!-- Component Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div class="flex items-center gap-3.5">
          <span class="text-3xl p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">🫐</span>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs sm:text-sm font-mono font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Androscoggin River Valley Bioregion</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#10B981] text-white font-mono font-extrabold uppercase border border-[#1C1C1C] shadow-[1px_1px_0px_0px_rgba(28,28,28,0.9)]">
                Scribes 📖 Botanical Logbook
              </span>
              <pocket-gull-badge label="Seasonal Foraging & Terpene Phytoncides" severity="success"></pocket-gull-badge>
            </div>
            <h3 class="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight mt-1 uppercase">Lewiston-Auburn Riverbank Foraging & Conifer Terpene Tracker</h3>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span class="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs sm:text-sm font-mono font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Active Season: {{ selectedSeason() }}
          </span>
        </div>
      </div>

      <!-- Season Filter Buttons -->
      <div class="grid grid-cols-4 gap-2 mb-6">
        @for (s of seasons; track s) {
          <button (click)="selectedSeason.set(s)"
            [class]="selectedSeason() === s ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-lg scale-[1.02]' : 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 hover:bg-emerald-800/60 font-semibold'"
            class="py-2.5 px-3 min-h-[44px] rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2">
            <span>{{ getSeasonIcon(s) }}</span>
            <span class="hidden sm:inline">{{ s }}</span>
          </button>
        }
      </div>

      <!-- Terpene Phytoncide Immune Calculator Banner -->
      <div class="p-5 rounded-2xl bg-emerald-900/40 border border-emerald-700/60 mb-6">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
            <span>🌲</span> Northern White Pine & Red Spruce Phytoncide Index
          </h4>
          <span class="text-xs font-mono text-emerald-400 font-bold">NK Cell Activity Boost: +42%</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div class="p-3 rounded-xl bg-slate-950/60 border border-emerald-800/80">
            <div class="text-[10px] text-emerald-400 font-bold uppercase">Alpha-Pinene</div>
            <div class="text-slate-200 mt-1">Bronchodilator & Memory Enhancement</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-950/60 border border-emerald-800/80">
            <div class="text-[10px] text-emerald-400 font-bold uppercase">Beta-Pinene</div>
            <div class="text-slate-200 mt-1">Anti-Inflammatory Vagal Modulation</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-950/60 border border-emerald-800/80">
            <div class="text-[10px] text-emerald-400 font-bold uppercase">Myrcene & Camphene</div>
            <div class="text-slate-200 mt-1">Analgesic & Antioxidant Defense</div>
          </div>
        </div>
      </div>

      <!-- Seasonal Foraging Items Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (item of filteredItems(); track item.id) {
          <div class="p-4 rounded-2xl bg-slate-950/70 border border-emerald-800/80 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">{{ item.icon }}</span>
                  <div>
                    <h5 class="text-sm font-bold text-white">{{ item.name }}</h5>
                    <span class="text-[11px] font-mono italic text-emerald-400 opacity-90">{{ item.botanicalName }}</span>
                  </div>
                </div>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-bold">
                  {{ item.season }}
                </span>
              </div>

              <div class="text-xs text-slate-300 space-y-1.5 mt-3">
                <p><strong class="text-emerald-400 font-mono">Key Phytochemicals:</strong> {{ item.phytochemicals }}</p>
                <p><strong class="text-emerald-400 font-mono">Clinical Benefit:</strong> {{ item.therapeuticBenefit }}</p>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-emerald-900 text-[11px] font-mono text-amber-300/90 flex items-center gap-1.5">
              <span>⚠️</span> Safety Note: {{ item.safetyGuide }}
            </div>
          </div>
        }
      </div>

    </div>
  `
})
export class AndroscogginForagingPhytoncideComponent {
  state = inject(PatientStateService);

  readonly seasons: ('Spring' | 'Summer' | 'Autumn' | 'Winter')[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
  readonly selectedSeason = signal<'Spring' | 'Summer' | 'Autumn' | 'Winter'>('Spring');

  readonly foragingDatabase: IForagingItem[] = [
    {
      id: 'f_fiddlehead',
      season: 'Spring',
      name: 'Ostrich Fern Fiddleheads',
      botanicalName: 'Matteuccia struthiopteris',
      phytochemicals: 'Omega-3 Fatty Acids, Potassium, Vitamin A, Chlorophyll',
      therapeuticBenefit: 'Potent vascular anti-inflammatory & antioxidant support harvested along wet Androscoggin riverbanks.',
      icon: '🌿',
      safetyGuide: 'Harvest only uncurled fronds with brown papery scales. Always steam thoroughly for 10-15 mins before eating.'
    },
    {
      id: 'f_elderberry',
      season: 'Summer',
      name: 'American Black Elderberry',
      botanicalName: 'Sambucus nigra ssp. canadensis',
      phytochemicals: 'Anthocyanins, Quercetin, Rutin, Vitamin C',
      therapeuticBenefit: 'Inhibits viral replication spikes and strengthens upper respiratory mucosal barriers.',
      icon: '🫐',
      safetyGuide: 'Consume only fully ripe dark purple berries. Cook berries to neutralize cyanogenic glycosides in raw seeds.'
    },
    {
      id: 'f_chaga',
      season: 'Autumn',
      name: 'Wild Birch Chaga Mushroom',
      botanicalName: 'Inonotus obliquus',
      phytochemicals: 'Betulinic Acid, Polysaccharides, Superoxide Dismutase (SOD)',
      therapeuticBenefit: 'Top-tier antioxidant cellular protection and immune modulation harvested from Maine white paper birch trees.',
      icon: '🍄',
      safetyGuide: 'Harvest sustainably leaving 30% of sclerotium intact on host tree. Simmer ground chaga in hot water at 80°C for 2 hours.'
    },
    {
      id: 'f_pine',
      season: 'Winter',
      name: 'Eastern White Pine Needle Infusion',
      botanicalName: 'Pinus strobus',
      phytochemicals: 'Shikimic Acid, Vitamin C (5x lemon concentration), Alpha-Pinene',
      therapeuticBenefit: 'Expectorant airway clearance, immune enhancement, and metabolic brown fat activation during winter cold fronts.',
      icon: '🌲',
      safetyGuide: 'Use 5-needle bundle Eastern White Pine only. Avoid Ponderosa or Yew needles. Steep fresh needles in boiled water.'
    }
  ];

  readonly filteredItems = computed(() => {
    const s = this.selectedSeason();
    return this.foragingDatabase.filter(item => item.season === s);
  });

  getSeasonIcon(season: string): string {
    switch (season) {
      case 'Spring': return '🌸';
      case 'Summer': return '☀️';
      case 'Autumn': return '🍂';
      case 'Winter': return '❄️';
      default: return '🌿';
    }
  }
}
