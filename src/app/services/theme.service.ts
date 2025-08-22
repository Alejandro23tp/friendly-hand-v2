import { Injectable, computed, signal, effect } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme-preference';
  private themeSignal = signal<Theme>(
    (localStorage.getItem(this.THEME_KEY) as Theme) || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
  
  theme = computed(() => this.themeSignal());
  isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    // Apply the initial theme
    this.applyTheme(this.themeSignal());
    
    // Watch for theme changes
    effect(() => {
      const theme = this.themeSignal();
      localStorage.setItem(this.THEME_KEY, theme);
      this.applyTheme(theme);
    });
    
    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.THEME_KEY)) {
        const newTheme = e.matches ? 'dark' : 'light';
        this.themeSignal.set(newTheme);
      }
    });
  }

  toggleTheme() {
    this.themeSignal.set(this.isDark() ? 'light' : 'dark');
  }

  applyTheme(theme: Theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
    }
  }

  // Inicializar el tema
  initializeTheme() {
    this.applyTheme(this.themeSignal());
  }
}
