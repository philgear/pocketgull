import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AppTheme = 'light' | 'dark' | 'system' | 'spark' | 'calm' | 'papercraft' | 'hemp' | 'rice' | 'construction' | 'white-marble' | 'black-marble' | 'papyrus' | 'pool' | 'mandala' | 'dream-team' | 'lent' | 'curie';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public currentTheme = signal<AppTheme>('light');
  public activeTheme = signal<'light' | 'dark'>('light');
  public activeParadigm = signal<'western' | 'tcm' | 'ayurveda' | 'unified'>('unified');
  public reduceMotion = signal<boolean>(false);
  public isPlainLanguageMode = signal<boolean>(false);
  public analogyLensMode = signal<'clinical' | 'arborist' | 'mechanic' | 'gentleman' | 'muse' | 'coach'>('clinical');
  public activeSeagullPersona = signal<'calm-gull' | 'active-skimmer' | 'deep-navigator' | 'storm-rider'>('deep-navigator');
  public textSizeScale = signal<'standard' | 'large' | 'extra-large'>('standard');
  private platformId = inject(PLATFORM_ID);

  public setAnalogyLensMode(mode: 'clinical' | 'arborist' | 'mechanic' | 'gentleman' | 'muse' | 'coach') {
    this.analogyLensMode.set(mode);
    if (mode !== 'clinical') {
      this.isPlainLanguageMode.set(true);
    } else {
      this.isPlainLanguageMode.set(false);
    }
  }

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initTheme();
      
      const savedPersona = localStorage.getItem('pocket_gull_seagull_persona') as any;
      if (savedPersona && ['calm-gull', 'active-skimmer', 'deep-navigator', 'storm-rider'].includes(savedPersona)) {
        this.activeSeagullPersona.set(savedPersona);
      }

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

      // Setup effect to apply paradigm reactive CSS variables & data attributes
      effect(() => {
        const paradigm = this.activeParadigm();
        this.applyParadigmToDom(paradigm);
      });

      // Setup effect to apply the seagull persona attribute
      effect(() => {
        const persona = this.activeSeagullPersona();
        localStorage.setItem('pocket_gull_seagull_persona', persona);
        document.documentElement.setAttribute('data-seagull-persona', persona);
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

      // Setup effect to apply plain language mode persistence
      effect(() => {
        const isPlain = this.isPlainLanguageMode();
        if (isPlain) {
          localStorage.setItem('pocket_gull_plain_language', 'true');
          document.documentElement.classList.add('plain-language-mode');
        } else {
          localStorage.setItem('pocket_gull_plain_language', 'false');
          document.documentElement.classList.remove('plain-language-mode');
        }
      });

      // Setup effect to apply text size scale class to document root
      effect(() => {
        const scale = this.textSizeScale();
        localStorage.setItem('pocket_gull_text_size_scale', scale);
        
        document.documentElement.classList.remove('text-scale-standard', 'text-scale-large', 'text-scale-extra-large');
        document.documentElement.classList.add(`text-scale-${scale}`);
      });
    }
  }

  private initTheme() {
    const savedPlainLanguage = localStorage.getItem('pocket_gull_plain_language');
    if (savedPlainLanguage === 'true') {
      this.isPlainLanguageMode.set(true);
    }

    const savedTextSize = localStorage.getItem('pocket_gull_text_size_scale') as any;
    if (savedTextSize && ['standard', 'large', 'extra-large'].includes(savedTextSize)) {
      this.textSizeScale.set(savedTextSize);
    }

    // Check URL query parameters first for testing, audits, or direct links
    const urlParams = new URLSearchParams(window.location.search);
    const urlTheme = urlParams.get('theme') as AppTheme;
    if (urlTheme && ['light', 'dark', 'system', 'spark', 'calm', 'papercraft', 'hemp', 'rice', 'construction', 'white-marble', 'black-marble', 'papyrus', 'pool', 'mandala'].includes(urlTheme)) {
      this.currentTheme.set(urlTheme);
      this.resolveTheme(urlTheme);
    } else {
      const savedTheme = localStorage.getItem('pocket_gull_theme') as AppTheme;
      // Never default to Spark Mode on load for clinical safety reasons.
      if (savedTheme && savedTheme !== 'spark') {
        this.currentTheme.set(savedTheme);
      } else {
        this.currentTheme.set('rice');
      }
    }

    const urlLens = urlParams.get('lens') as any;
    if (urlLens && ['clinical', 'arborist', 'mechanic', 'gentleman', 'muse'].includes(urlLens)) {
      this.setAnalogyLensMode(urlLens);
    }

    const savedReduceMotion = localStorage.getItem('pocket_gull_reduce_motion');
    if (savedReduceMotion === 'true') {
      this.reduceMotion.set(true);
    }

    // Listen to OS prefers-color-scheme changes
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener?.('change', (e) => {
        if (this.currentTheme() === 'system') {
          this.activeTheme.set(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  private saveTheme(theme: AppTheme) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('pocket_gull_theme', theme);
    }
  }

  private resolveTheme(theme: AppTheme) {
    if (theme === 'system') {
      const isSystemDark = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
      this.activeTheme.set(isSystemDark ? 'dark' : 'light');
    } else if (theme === 'spark' || theme === 'black-marble' || theme === 'papyrus' || theme === 'mandala' || theme === 'curie') {
      this.activeTheme.set('dark');
    } else if (theme === 'pool') {
      const hour = new Date().getHours();
      const isNight = hour < 6 || hour > 18;
      this.activeTheme.set(isNight ? 'dark' : 'light');
    } else if (theme === 'calm' || theme === 'papercraft' || theme === 'hemp' || theme === 'rice' || theme === 'construction' || theme === 'white-marble') {
      this.activeTheme.set('light');
    } else {
      this.activeTheme.set(theme === 'dark' ? 'dark' : 'light');
    }
  }

  private applyThemeToDom(resolvedTheme: 'light' | 'dark') {
    if (typeof document === 'undefined') return;
    
    // Always remove existing classes first to clean up state
    document.documentElement.classList.remove(
      'dark', 'theme-spark', 'theme-calm',
      'papercraft-mode', 'papercraft-hemp', 'papercraft-rice', 'papercraft-construction',
      'theme-white-marble', 'theme-black-marble', 'theme-papyrus',
      'theme-pool', 'theme-pool-light', 'theme-pool-dark',
      'theme-mandala'
    );
    
    const theme = this.currentTheme();
    if (theme === 'papercraft' || theme === 'hemp' || theme === 'rice' || theme === 'construction') {
      document.documentElement.classList.add('papercraft-mode');
      if (theme === 'hemp') document.documentElement.classList.add('papercraft-hemp');
      if (theme === 'rice') document.documentElement.classList.add('papercraft-rice');
      if (theme === 'construction') document.documentElement.classList.add('papercraft-construction');

      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#F9F3D9');
      }
    } else if (theme === 'spark') {
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
    } else if (theme === 'white-marble') {
      document.documentElement.classList.add('theme-white-marble');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#FAF9F6');
      }
    } else if (theme === 'black-marble') {
      document.documentElement.classList.add('dark', 'theme-black-marble');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#0d0d11');
      }
    } else if (theme === 'papyrus') {
      document.documentElement.classList.add('dark', 'theme-papyrus');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#13100c');
      }
    } else if (theme === 'pool') {
      document.documentElement.classList.add('theme-pool');
      if (resolvedTheme === 'dark') {
        document.documentElement.classList.add('dark', 'theme-pool-dark');
      } else {
        document.documentElement.classList.add('theme-pool-light');
      }
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#081f3d' : '#7dd3fc');
      }
    } else if (theme === 'mandala') {
      document.documentElement.classList.add('dark', 'theme-mandala');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#16112d');
      }
    } else if (theme === 'curie') {
      document.documentElement.classList.add('dark', 'theme-curie');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#0f1416');
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

  private applyParadigmToDom(paradigm: 'western' | 'tcm' | 'ayurveda' | 'unified') {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-clinical-paradigm', paradigm);

    if (paradigm === 'western') {
      root.style.setProperty('--paradigm-accent', '#06b6d4'); // Cyan
      root.style.setProperty('--paradigm-accent-glow', 'rgba(6, 182, 212, 0.4)');
    } else if (paradigm === 'tcm') {
      root.style.setProperty('--paradigm-accent', '#10b981'); // Emerald
      root.style.setProperty('--paradigm-accent-glow', 'rgba(16, 185, 129, 0.4)');
    } else if (paradigm === 'ayurveda') {
      root.style.setProperty('--paradigm-accent', '#f59e0b'); // Saffron
      root.style.setProperty('--paradigm-accent-glow', 'rgba(245, 158, 11, 0.4)');
    } else {
      root.style.setProperty('--paradigm-accent', '#a855f7'); // Rosetta Purple
      root.style.setProperty('--paradigm-accent-glow', 'rgba(168, 85, 247, 0.4)');
    }
  }

  public setTheme(theme: AppTheme) {
    this.currentTheme.set(theme);
  }

  public setParadigm(paradigm: 'western' | 'tcm' | 'ayurveda' | 'unified') {
    this.activeParadigm.set(paradigm);
  }

  public setReduceMotion(reduce: boolean) {
    this.reduceMotion.set(reduce);
  }

  public togglePlainLanguageMode() {
    this.isPlainLanguageMode.update(curr => !curr);
  }
}
