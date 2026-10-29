import { Injectable } from '@angular/core';
import { Phosphor, TerminalTheme } from '../models/theme';

const MONO = "'JetBrains Mono', ui-monospace, 'Cascadia Code', Menlo, monospace";

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  /** Temas do terminal moderno (e da coluna de terminal do modo simples). O primeiro é o padrão. */
  themes: TerminalTheme[] = [
    { name: 'graphite', background: '#101216', surface: '#161A20', border: '#2A2F38', foreground: '#D4D7DD', muted: '#8A919C', promptColor: '#7FD4A0', accent: '#E5B567', fontFamily: MONO },
    { name: 'matrix', background: '#050805', surface: '#0B140D', border: '#1E3A24', foreground: '#7CF29C', muted: '#4FAE6B', promptColor: '#B6FFC9', accent: '#E8FF6A', fontFamily: MONO },
    { name: 'classic', background: '#0C0C0C', surface: '#161616', border: '#303030', foreground: '#EDEDED', muted: '#9A9A9A', promptColor: '#9DB4FF', accent: '#FFD479', fontFamily: MONO },
    { name: 'amber', background: '#100B04', surface: '#1A1309', border: '#3A2C14', foreground: '#FFC266', muted: '#B98B45', promptColor: '#FF8A3D', accent: '#FFE3A8', fontFamily: MONO },
    { name: 'blue', background: '#0A0F1A', surface: '#111829', border: '#24304A', foreground: '#BFE3FF', muted: '#7F9CC0', promptColor: '#5CC8FF', accent: '#F28BFF', fontFamily: MONO },
    { name: 'ubuntu', background: '#300A24', surface: '#3C1430', border: '#5A2A4C', foreground: '#FFFFFF', muted: '#C9A9BF', promptColor: '#FF7A3D', accent: '#8AE234', fontFamily: "'Ubuntu Mono', " + MONO }
  ];

  /**
   * Fósforos da visualização CRT, separados dos temas: cada um é visivelmente diferente,
   * então cada clique no botão de tema da CRT muda a tela.
   * Baseados em fósforos reais de monitores antigos: P1 (verde), P3 (âmbar), P4 (branco) e um azul.
   */
  phosphors: Phosphor[] = [
    { name: 'green', background: '#04120A', foreground: '#62F59A', dim: '#45B574', glow: 'rgba(80, 255, 150, 0.5)' },
    { name: 'amber', background: '#140C02', foreground: '#FFB547', dim: '#C0873A', glow: 'rgba(255, 170, 60, 0.55)' },
    { name: 'white', background: '#0A0D0F', foreground: '#E6EEF2', dim: '#9AA8AF', glow: 'rgba(210, 235, 255, 0.4)' },
    { name: 'blue', background: '#020C16', foreground: '#7FD3FF', dim: '#4F9CC4', glow: 'rgba(90, 195, 255, 0.5)' }
  ];

  getThemes(): TerminalTheme[] {
    return this.themes;
  }

  getDefault(): TerminalTheme {
    return this.themes[0];
  }

  /** Tema salvo, ou o padrão. */
  getStored(): TerminalTheme {
    const saved = this.read('terminal-theme');
    return this.themes.find(t => t.name === saved) ?? this.getDefault();
  }

  store(theme: TerminalTheme): void {
    this.write('terminal-theme', theme.name);
  }

  getPhosphors(): Phosphor[] {
    return this.phosphors;
  }

  getStoredPhosphor(): Phosphor {
    const saved = this.read('crt-phosphor');
    return this.phosphors.find(p => p.name === saved) ?? this.phosphors[0];
  }

  storePhosphor(phosphor: Phosphor): void {
    this.write('crt-phosphor', phosphor.name);
  }

  /** Publica o tema (e o fósforo salvo da CRT) como variáveis CSS na raiz; todas as visualizações leem daqui. */
  apply(theme: TerminalTheme): void {
    const root = document.documentElement.style;
    root.setProperty('--t-bg', theme.background);
    root.setProperty('--t-surface', theme.surface);
    root.setProperty('--t-border', theme.border);
    root.setProperty('--t-fg', theme.foreground);
    root.setProperty('--t-muted', theme.muted);
    root.setProperty('--t-prompt', theme.promptColor);
    root.setProperty('--t-accent', theme.accent);
    root.setProperty('--t-font', theme.fontFamily);
    root.setProperty('--t-prompt-soft', this.withAlpha(theme.promptColor, 0.14));
    this.applyPhosphor(this.getStoredPhosphor());
  }

  applyPhosphor(phosphor: Phosphor): void {
    const root = document.documentElement.style;
    root.setProperty('--crt-bg', phosphor.background);
    root.setProperty('--crt-fg', phosphor.foreground);
    root.setProperty('--crt-dim', phosphor.dim);
    root.setProperty('--crt-glow', phosphor.glow);
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* navegação privada ou storage bloqueado: só não lembra a escolha */
    }
  }

  private withAlpha(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
