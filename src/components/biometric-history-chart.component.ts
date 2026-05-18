import { Component, ChangeDetectionStrategy, inject, effect, ElementRef, viewChild, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PythonBridgeService } from '../services/python-bridge.service';
import { Chart, registerables, ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-biometric-history-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white dark:bg-[#111111] border border-[#EEEEEE] dark:border-zinc-800 rounded-xl shadow-sm p-4 h-full flex flex-col">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 shrink-0">
        <div class="flex flex-col">
          <h3 class="text-sm font-bold tracking-widest uppercase text-gray-500 dark:text-zinc-500">Biometric Trends</h3>
          <!-- Live Telemetry Status Badge -->
          @if (pythonBridge.isAvailable() === true) {
            <span class="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5 animate-pulse">
              <span class="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full"></span>
              Live Sidecar Connected (SSE)
            </span>
          } @else if (pythonBridge.isAvailable() === false) {
            <span class="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
              <span class="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full"></span>
              Sidecar Offline (Demo Mode)
            </span>
          } @else {
            <span class="text-[10px] text-gray-400 dark:text-zinc-600 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
              <span class="w-1.5 h-1.5 bg-gray-400 dark:bg-zinc-600 rounded-full"></span>
              Verifying Telemetry Bridge...
            </span>
          }
        </div>
        
        <!-- View Toggle -->
        <div class="flex flex-wrap bg-gray-100 dark:bg-zinc-900 rounded p-1 gap-1 max-w-full">
          <button (click)="activeMetric.set('hr')"
                  class="px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                  [class.bg-white]="activeMetric() === 'hr'"
                  [ngClass]="{'dark:bg-zinc-800': activeMetric() === 'hr'}"
                  [class.text-gray-900]="activeMetric() === 'hr'"
                  [ngClass]="{'dark:text-white': activeMetric() === 'hr'}"
                  [class.shadow-sm]="activeMetric() === 'hr'"
                  [class.text-gray-500]="activeMetric() !== 'hr'"
                  [ngClass]="{'dark:text-zinc-500': activeMetric() !== 'hr'}">HR</button>
          <button (click)="activeMetric.set('bp')"
                  class="px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                  [class.bg-white]="activeMetric() === 'bp'"
                  [ngClass]="{'dark:bg-zinc-800': activeMetric() === 'bp'}"
                  [class.text-gray-900]="activeMetric() === 'bp'"
                  [ngClass]="{'dark:text-white': activeMetric() === 'bp'}"
                  [class.shadow-sm]="activeMetric() === 'bp'"
                  [class.text-gray-500]="activeMetric() !== 'bp'"
                  [ngClass]="{'dark:text-zinc-500': activeMetric() !== 'bp'}">BP</button>
          <button (click)="activeMetric.set('spO2')"
                  class="px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                  [class.bg-white]="activeMetric() === 'spO2'"
                  [ngClass]="{'dark:bg-zinc-800': activeMetric() === 'spO2'}"
                  [class.text-gray-900]="activeMetric() === 'spO2'"
                  [ngClass]="{'dark:text-white': activeMetric() === 'spO2'}"
                  [class.shadow-sm]="activeMetric() === 'spO2'"
                  [class.text-gray-500]="activeMetric() !== 'spO2'"
                  [ngClass]="{'dark:text-zinc-500': activeMetric() !== 'spO2'}">SpO2</button>
          <button (click)="activeMetric.set('hrv')"
                  class="px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                  [class.bg-white]="activeMetric() === 'hrv'"
                  [ngClass]="{'dark:bg-zinc-800': activeMetric() === 'hrv'}"
                  [class.text-gray-900]="activeMetric() === 'hrv'"
                  [ngClass]="{'dark:text-white': activeMetric() === 'hrv'}"
                  [class.shadow-sm]="activeMetric() === 'hrv'"
                  [class.text-gray-500]="activeMetric() !== 'hrv'"
                  [ngClass]="{'dark:text-zinc-500': activeMetric() !== 'hrv'}">HRV</button>
          <button (click)="activeMetric.set('coherence')"
                  class="px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                  [class.bg-white]="activeMetric() === 'coherence'"
                  [ngClass]="{'dark:bg-zinc-800': activeMetric() === 'coherence'}"
                  [class.text-gray-900]="activeMetric() === 'coherence'"
                  [ngClass]="{'dark:text-white': activeMetric() === 'coherence'}"
                  [class.shadow-sm]="activeMetric() === 'coherence'"
                  [class.text-gray-500]="activeMetric() !== 'coherence'"
                  [ngClass]="{'dark:text-zinc-500': activeMetric() !== 'coherence'}">Coherence</button>
          <button (click)="activeMetric.set('breathing')"
                  class="px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                  [class.bg-white]="activeMetric() === 'breathing'"
                  [ngClass]="{'dark:bg-zinc-800': activeMetric() === 'breathing'}"
                  [class.text-gray-900]="activeMetric() === 'breathing'"
                  [ngClass]="{'dark:text-white': activeMetric() === 'breathing'}"
                  [class.shadow-sm]="activeMetric() === 'breathing'"
                  [class.text-gray-500]="activeMetric() !== 'breathing'"
                  [ngClass]="{'dark:text-zinc-500': activeMetric() !== 'breathing'}">Breath</button>
        </div>
      </div>
      
      <div class="flex-1 relative min-h-0 w-full h-full">
        @if (hasData()) {
          <canvas #chartCanvas class="absolute inset-0 w-full h-full"></canvas>
        } @else {
          <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600">
            <svg class="w-8 h-8 opacity-50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            <p class="text-xs uppercase tracking-widest font-bold">No Telemetry Recorded</p>
          </div>
        }
      </div>
    </div>
  `
})
export class BiometricHistoryChartComponent implements OnDestroy {
  chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private patientState = inject(PatientStateService);
  public pythonBridge = inject(PythonBridgeService);
  
  private chartInstance: Chart | null = null;
  activeMetric = signal<'hr' | 'bp' | 'spO2' | 'hrv' | 'coherence' | 'breathing'>('hr');

  // Compute the current patient's history array, fallback to empty array
  biometricHistory = computed(() => {
    return this.patientState.biometricHistory() || [];
  });

  // Verify we actually have data for the active filter to show/hide the canvas
  hasData = computed(() => {
    const history = this.biometricHistory();
    const metric = this.activeMetric();
    return history.some(entry => entry.type === metric);
  });

  constructor() {
    effect(() => {
      const history = this.biometricHistory();
      const metricType = this.activeMetric();
      const canvasRef = this.chartCanvas();
      
      if (!canvasRef || !this.hasData()) {
        this.destroyChart();
        return;
      }

      this.renderChart(canvasRef.nativeElement, history, metricType);
    });
  }

  private renderChart(canvas: HTMLCanvasElement, allHistory: any[], activeType: string) {
    this.destroyChart(); // Cleanup previous instance

    // Filter points to active metric
    const points = allHistory
      .filter(entry => entry.type === activeType)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Extract axes
    // Determine if we have high-precision timestamps (e.g. within same day/short span) to show HH:MM:SS
    const showTime = points.some(p => {
      const d = new Date(p.timestamp);
      return d.getSeconds() > 0 || d.getMinutes() > 0 || d.getHours() > 0;
    });

    const labels = points.map(p => {
      const d = new Date(p.timestamp);
      if (showTime) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      }
      return `${d.getMonth() + 1}/${d.getDate()}`; // MM/DD
    });

    // Determine configuration specifics for current active metric
    let datasets: any[] = [];
    if (activeType === 'bp') {
      // BP values are often "120/80"
      const systolicData = points.map(p => {
        const parts = String(p.value).split('/');
        return parts.length === 2 ? parseInt(parts[0], 10) : null;
      });
      const diastolicData = points.map(p => {
        const parts = String(p.value).split('/');
        return parts.length === 2 ? parseInt(parts[1], 10) : null;
      });

      datasets = [
        {
          label: 'Systolic',
          data: systolicData,
          borderColor: '#ff4500', // Braun Orange
          backgroundColor: '#ff450033',
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#ff4500'
        },
        {
          label: 'Diastolic',
          data: diastolicData,
          borderColor: '#416B1F', // Deep Green
          backgroundColor: '#416B1F33',
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#416B1F'
        }
      ];
    } else {
      // Generic HR or SpO2 or HRV or Coherence or Breathing
      const data = points.map(p => parseFloat(String(p.value)));
      let color = '#E11D48'; // Rose for HR
      let label = 'Heart Rate (bpm)';
      
      if (activeType === 'spO2') {
        color = '#0284C7'; // Sky Blue
        label = 'SpO2 (%)';
      } else if (activeType === 'hrv') {
        color = '#8B5CF6'; // Violet
        label = 'HRV (ms)';
      } else if (activeType === 'coherence') {
        color = '#10B981'; // Emerald/Green
        label = 'Coherence (0.0-1.0)';
      } else if (activeType === 'breathing') {
        color = '#F59E0B'; // Amber
        label = 'Breathing Rate (bpm)';
      }
      
      datasets = [
        {
          label: label,
          data: data,
          borderColor: color,
          backgroundColor: `${color}22`,
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#fff',
          pointBorderColor: color
        }
      ];
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: datasets.length > 1,
            position: 'top',
            labels: {
              boxWidth: 10,
              usePointStyle: true,
              font: { size: 10, family: 'Inter, sans-serif' }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { family: 'Inter, sans-serif', size: 10 },
            bodyFont: { family: 'Inter, sans-serif', size: 12, weight: 'bold' },
            padding: 8,
            cornerRadius: 4,
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter, sans-serif', size: 10 } }
          },
          y: {
            grid: { color: 'rgba(156, 163, 175, 0.1)' },
            ticks: { font: { family: 'Inter, sans-serif', size: 10 } },
            suggestedMin: activeType === 'spO2' ? 85 : activeType === 'coherence' ? 0.0 : undefined,
            suggestedMax: activeType === 'spO2' ? 100 : activeType === 'coherence' ? 1.0 : undefined
          }
        }
      }
    };

    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.chartInstance = new Chart(ctx, config);
    }
  }

  private destroyChart() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  ngOnDestroy() {
    this.destroyChart();
  }
}
