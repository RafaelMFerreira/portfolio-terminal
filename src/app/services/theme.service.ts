import { Injectable } from '@angular/core';
import { TerminalTheme } from '../models/theme';

@Injectable({
  providedIn: 'root'
})

export class ThemeService {
  
  themes: TerminalTheme[] =  [
    { name: 'matrix', background: '#000', foreground: '#0f0', promptColor: '#88ff88', fontFamily: 'Courier New, monospace' },
    { name: 'classic', background: '#000', foreground: '#fff', promptColor: '#aaaaff', fontFamily: 'Courier New, monospace' },
    { name: 'amber', background: '#000', foreground: '#ffb000', promptColor: '#ff6000', fontFamily: 'Courier New, monospace' },
    { name: 'blue', background: '#000', foreground: '#00bfff', promptColor: '#ff00ff', fontFamily: 'Courier New, monospace' },
    { name: 'ubuntu', background: '#300a24', foreground: '#fff', promptColor: '#e95420', fontFamily: 'Ubuntu Mono, monospace' }
  ];
  
  constructor() { }

  getThemes() {
    return this.themes;
  }
}
