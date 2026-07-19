import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AppTheme = 'light' | 'dark' | 'system' | 'spark' | 'calm';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public currentTheme = signal<AppTheme>('light');
  public activeTheme = signal<'light' | 'dark'>('light');
  public reduceMotion = signal<boolean>(false);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initTheme();
      
      // Setup effect to save and apply the theme when the signal changes
      effect(() => {
        const theme = this.currentTheme();
        this.saveTheme(theme);
        this.resolveTheme(theme);
      });

      // Setup effect to actually apply the active theme classes to the DOM
      effect(() => {
        const resolvedTheme = this.activeTheme();
        this.applyThemeToDom(resolvedTheme);
      });

      // Setup effect to apply the reduce-motion class based on user preference
      effect(() => {
        const reduce = this.reduceMotion();
        if (reduce) {
          localStorage.setItem('pocket_gull_reduce_motion', 'true');
          document.documentElement.classList.add('reduce-motion');
        } else {
          localStorage.setItem('pocket_gull_reduce_motion', 'false');
          document.documentElement.classList.remove('reduce-motion');
        }
      });
    }
  }

  private initTheme() {
    // Check URL query parameters first for testing, audits, or direct links
    const urlParams = new URLSearchParams(window.location.search);
    const urlTheme = urlParams.get('theme') as AppTheme;
    if (urlTheme && ['light', 'dark', 'system', 'spark', 'calm'].includes(urlTheme)) {
      this.currentTheme.set(urlTheme);
      this.resolveTheme(urlTheme);
    } else {
      const savedTheme = localStorage.getItem('pocket_gull_theme') as AppTheme;
      // Never default to Spark Mode on load for clinical safety reasons.
      if (savedTheme && savedTheme !== 'spark') {
        this.currentTheme.set(savedTheme);
      } else {
        this.currentTheme.set('light');
      }
    }

    const savedReduceMotion = localStorage.getItem('pocket_gull_reduce_motion');
    if (savedReduceMotion === 'true') {
      this.reduceMotion.set(true);
    }

    // Listen to OS prefers-color-scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (this.currentTheme() === 'system') {
        this.activeTheme.set(e.matches ? 'dark' : 'light');
      }
    });
  }

  private saveTheme(theme: AppTheme) {
    localStorage.setItem('pocket_gull_theme', theme);
  }

  private resolveTheme(theme: AppTheme) {
    if (theme === 'system') {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.activeTheme.set(isSystemDark ? 'dark' : 'light');
    } else if (theme === 'spark') {
      this.activeTheme.set('dark');
    } else if (theme === 'calm') {
      this.activeTheme.set('light');
    } else {
      this.activeTheme.set(theme);
    }
  }

  private applyThemeToDom(resolvedTheme: 'light' | 'dark') {
    if (typeof document === 'undefined') return;
    
    // Always remove existing classes first to clean up state
    document.documentElement.classList.remove('dark', 'theme-spark', 'theme-calm');
    
    const theme = this.currentTheme();
    if (theme === 'spark') {
      document.documentElement.classList.add('dark', 'theme-spark');
      // Update meta theme-color for PWA
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#0a0503'); // Custom dark copper/ember background
      }
    } else if (theme === 'calm') {
      document.documentElement.classList.add('theme-calm');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#FAF9F6'); // soft paper-white background
      }
    } else if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#111827');
      }
    } else {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#1C1C1C'); 
      }
    }
  }

  public setTheme(theme: AppTheme) {
    this.currentTheme.set(theme);
  }

  public setReduceMotion(reduce: boolean) {
    this.reduceMotion.set(reduce);
  }
}
