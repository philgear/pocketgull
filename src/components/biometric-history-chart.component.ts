import { Component, ChangeDetectionStrategy, inject, effect, ElementRef, viewChild, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { Chart, registerables, ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-biometric-history-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white dark:bg-[#111111] border border-[#EEEEEE] dark:border-zinc-800 rounded-xl shadow-sm p-4 h-full flex flex-col">
      <div class="flex items-center justify-between mb-4 shrink-0">
        <h3 class="text-sm font-bold tracking-widest uppercase text-gray-500 dark:text-zinc-500">Biometric Trends</h3>
        
        <!-- View Toggle -->
        <div class="flex bg-gray-100 dark:bg-zinc-900 rounded p-1">
          <button (click)="activeMetric.set('hr')"
                  class="px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded transition-colors"
                  [class.bg-white]="activeMetric() === 'hr'"
                  [class.dark:bg-zinc-800]="activeMetric() === 'hr'"
                  [class.text-gray-900]="activeMetric() === 'hr'"
                  [class.dark:text-white]="activeMetric() === 'hr'"
                  [class.shadow-sm]="activeMetric() === 'hr'"
                  [class.text-gray-500]="activeMetric() !== 'hr'"
                  [class.dark:text-zinc-500]="activeMetric() !== 'hr'">HR</button>
          <button (click)="activeMetric.set('bp')"
                  class="px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded transition-colors"
                  [class.bg-white]="activeMetric() === 'bp'"
                  [class.dark:bg-zinc-800]="activeMetric() === 'bp'"
                  [class.text-gray-900]="activeMetric() === 'bp'"
                  [class.dark:text-white]="activeMetric() === 'bp'"
                  [class.shadow-sm]="activeMetric() === 'bp'"
                  [class.text-gray-500]="activeMetric() !== 'bp'"
                  [class.dark:text-zinc-500]="activeMetric() !== 'bp'">BP</button>
          <button (click)="activeMetric.set('spO2')"
                  class="px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded transition-colors"
                  [class.bg-white]="activeMetric() === 'spO2'"
                  [class.dark:bg-zinc-800]="activeMetric() === 'spO2'"
                  [class.text-gray-900]="activeMetric() === 'spO2'"
                  [class.dark:text-white]="activeMetric() === 'spO2'"
                  [class.shadow-sm]="activeMetric() === 'spO2'"
                  [class.text-gray-500]="activeMetric() !== 'spO2'"
                  [class.dark:text-zinc-500]="activeMetric() !== 'spO2'">SpO2</button>
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
  
  private chartInstance: Chart | null = null;
  activeMetric = signal<'hr' | 'bp' | 'spO2'>('hr');

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
    const labels = points.map(p => {
      const d = new Date(p.timestamp);
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
      // Generic HR or SpO2
      const data = points.map(p => parseFloat(String(p.value)));
      const color = activeType === 'hr' ? '#E11D48' : '#0284C7'; // Rose for HR, Sky Blue for O2
      
      datasets = [
        {
          label: activeType === 'hr' ? 'Heart Rate (bpm)' : 'SpO2 (%)',
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
            suggestedMin: activeType === 'spO2' ? 85 : undefined,
            suggestedMax: activeType === 'spO2' ? 100 : undefined
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
