import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../../services/portfolio.service';
import { LanguageService } from '../../services/language.service';

export interface TerminalCommand {
  name: string;
  description: string;
  action: (args: string[]) => string | VisualResponse;
  visualMode?: boolean;
}

export interface TerminalTheme {
  name: string;
  background: string;
  foreground: string;
  fontFamily: string;
}

export interface VisualResponse {
  type: 'project' | 'skills' | 'about' | 'contact' | 'experience';
  data: any;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  demoUrl?: string;
  codeUrl?: string;
}

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.css']
})
export class TerminalComponent implements OnInit {
  @Input() prompt = 'visitor@portfolio:~$';
  @Input() initialMessage = 'Welcome to the terminal. Type "help" for available commands.';
  @Input() enableCrtEffect = true;
  @Input() commands: TerminalCommand[] = [];

  @Output() commandExecuted = new EventEmitter<{command: string, output: string | VisualResponse}>();
  @Output() themeChanged = new EventEmitter<TerminalTheme>();

  @ViewChild('terminalOutput', { static: true }) terminalOutput!: ElementRef;
  @ViewChild('commandInput', { static: true }) commandInput!: ElementRef;
  @ViewChild('terminalContainer', { static: true }) terminalContainer!: ElementRef;

  currentCommand = '';
  commandHistory: string[] = [];
  historyIndex = -1;
  currentVisualResponse: VisualResponse | null = null;
  suggestionButtonsEn: string[] = ['projects', 'skills', 'about', 'experience', 'contact', 'theme', 'language'];
  suggestionButtonsPt: string[] = ['projetos', 'habilidades', 'sobre', 'experiência', 'contato', 'tema', 'language'];
  currentExperienceIndex = 0;
  
  // Image modal properties
  imageModal = {
    visible: false,
    src: '',
    title: ''
  };

  themes: TerminalTheme[] = [
    { name: 'matrix', background: '#000', foreground: '#0f0', fontFamily: 'Courier New, monospace' },
    { name: 'classic', background: '#000', foreground: '#fff', fontFamily: 'Courier New, monospace' },
    { name: 'amber', background: '#000', foreground: '#ffb000', fontFamily: 'Courier New, monospace' },
    { name: 'blue', background: '#000', foreground: '#00bfff', fontFamily: 'Courier New, monospace' },
    { name: 'ubuntu', background: '#300a24', foreground: '#fff', fontFamily: 'Ubuntu Mono, monospace' }
  ];

  currentTheme: TerminalTheme = this.themes[0];

  constructor(
    private portfolioService: PortfolioService,
    public languageService: LanguageService
  ) {  }

  ngOnInit(): void {
    // Add initial message
    this.addOutput(this.initialMessage);

    // Subscribe to language changes
    this.languageService.currentLanguage$.subscribe(() => {
      // If there's a visual response active, refresh it with the new language
      if (this.currentVisualResponse) {
        const type = this.currentVisualResponse.type;
        switch (type) {
          case 'project':
            this.currentVisualResponse.data = this.portfolioService.getProjects();
            break;
          case 'skills':
            this.currentVisualResponse.data = this.portfolioService.getSkills();
            break;
          case 'about':
            this.currentVisualResponse.data = this.portfolioService.getAboutInfo();
            break;
          case 'experience':
            this.currentVisualResponse.data = this.portfolioService.getExperience();
            break;
          case 'contact':
            this.currentVisualResponse.data = this.portfolioService.getContactInfo();
            break;
        }
      }
    });

    // Add UI-specific commands
    this.commands.push(
      {
        name: 'theme',
        description: 'Change the terminal theme (usage: theme [name])',
        action: (args) => this.handleThemeCommand(args)
      },
      {
        name: 'language',
        description: 'Change the current language (usage: language [en|pt])',
        action: (args) => this.handleLanguageCommand(args)
      },
      {
        name: 'lang',
        description: 'Alias for language command',
        action: (args) => this.handleLanguageCommand(args)
      } 
    );

    // Focus the input
    setTimeout(() => {
      this.commandInput.nativeElement.focus();
    }, 0);

    // Load saved theme from localStorage if it exists
    const savedTheme = localStorage.getItem('terminal-theme');
    if (savedTheme) {
      const theme = this.themes.find(t => t.name === savedTheme);
      if (theme) {
        this.currentTheme = theme;
      }
    }

    // Apply initial theme
    this.applyTheme(this.currentTheme);

    this.commandInput.nativeElement.addEventListener('focus', () => {
      this.updateCaretPosition();
    });

    this.commandInput.nativeElement.addEventListener('click', () => {
      this.updateCaretPosition();
    });

    this.commandInput.nativeElement.addEventListener('mouseup', () => {
      this.updateCaretPosition();
    });

    // Initial update
    setTimeout(() => this.updateCaretPosition(), 100);
  }

  updateCaretPosition(): void {
    const input = this.commandInput.nativeElement;
    const caretElement = this.terminalContainer.nativeElement.querySelector('.terminal-caret');
    if (!caretElement) return;

    // Get input metrics
    const inputStyles = window.getComputedStyle(input);
    const fontFamily = inputStyles.fontFamily;
    const fontSize = inputStyles.fontSize;

    // Create a measuring element with the same styling
    const measure = document.createElement('span');
    measure.style.fontFamily = fontFamily;
    measure.style.fontSize = fontSize;
    measure.style.visibility = 'hidden';
    measure.style.position = 'absolute';
    measure.style.whiteSpace = 'pre';

    // Add to DOM to measure
    document.body.appendChild(measure);

    // Measure text up to cursor position
    const cursorPos = input.selectionStart || 0;
    const textBeforeCursor = input.value.substring(0, cursorPos);
    measure.textContent = textBeforeCursor;

    // Calculate position
    const textWidth = measure.offsetWidth;

    // Clean up
    document.body.removeChild(measure);

    // Position caret
    const promptElement = this.terminalContainer.nativeElement.querySelector('.prompt');
    const promptWidth = promptElement.offsetWidth;

    caretElement.style.left = `${promptWidth + textWidth + 8}px`;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.imageModal.visible) {
        this.closeImageModal();
        event.preventDefault();
        return;
      }
      if (this.currentVisualResponse) {
        this.currentVisualResponse = null;
        this.scrollToBottom();
        event.preventDefault();
        return;
      }
    }
    
    if (event.key === 'Enter') {
      this.executeCommand();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateHistory(-1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateHistory(1);
    } else if (event.key === 'ArrowLeft' && this.currentVisualResponse?.type === 'experience') {
      this.navigateExperience(-1);
    } else if (event.key === 'ArrowRight' && this.currentVisualResponse?.type === 'experience') {
      this.navigateExperience(1);
    }
    setTimeout(() => this.updateCaretPosition(), 10);
  }

  executeCommand(): void {
    const commandText = this.currentCommand.trim();

    if (commandText) {
      // Add to history
      this.commandHistory.push(commandText);
      this.historyIndex = this.commandHistory.length;

      // Display the command
      this.addOutput(`${this.prompt} ${commandText}`, 'command-history');

      // Process the command
      const [cmd, ...args] = commandText.split(' ');
      let output: string | VisualResponse = 'Command not found. Type "help" for available commands.';

      // Check built-in commands
      if (cmd === 'clear') {
        this.clearTerminal();
        output = '';
      } else {
        // Check custom commands
        const command = this.commands.find(c => c.name === cmd);
        if (command) {
          try {
            output = command.action(args);
            this.handleCommandOutput(output, commandText);
          } catch (error) {
            output = `Error executing command: ${error}`;
            this.currentVisualResponse = null;
            this.addOutput(output as string);
          }
        } else {
          this.addOutput(output as string);
        }
      }

      this.currentCommand = '';
      setTimeout(() => this.commandInput.nativeElement.focus(), 0);
    }
  }

  private handleCommandOutput(output: string | VisualResponse, commandText: string): void {
    if (typeof output !== 'string') {
      this.currentVisualResponse = output;
      this.addOutput(`Displaying ${output.type} information...`);
      
      // Reset experience index when showing experience
      if (output.type === 'experience') {
        this.currentExperienceIndex = 0;
      }
      
      // Apply current theme to visual response elements after they render
      setTimeout(() => {
        // Refresh animations for the new visual response
        this.refreshVisualResponseAnimations();
        // Ensure terminal is scrolled to bottom after visual response renders
        this.scrollToBottom();
      }, 50);
    } else if (output) {
      this.currentVisualResponse = null;
      this.addOutput(output);
    }

    this.commandExecuted.emit({command: commandText, output});
    console.log("teste2", this.currentTheme.name)
  }

  executeButtonCommand(command: string): void {
    // Map Portuguese commands to English commands
    let cmdToExecute = command;
    if (this.languageService.getCurrentLanguage() === 'pt') {
      const commandMap: {[key: string]: string} = {
        'projetos': 'projects',
        'habilidades': 'skills',
        'sobre': 'about',
        'experiência': 'experience',
        'contato': 'contact',
        'tema': 'theme'
      };
      cmdToExecute = commandMap[command] || command;
    }

    // Special handling for language button
    if (cmdToExecute === 'language') {
      const newLang = this.languageService.getCurrentLanguage() === 'en' ? 'pt' : 'en';
      this.currentCommand = `language ${newLang}`;
    } 
    // Special handling for theme button
    else if (cmdToExecute === 'theme') {
      console.log("teste3", this.currentTheme.name)
      const currentThemeIndex = this.themes.findIndex(t => t.name === this.currentTheme.name);
      const nextThemeIndex = (currentThemeIndex + 1) % this.themes.length;
      this.currentCommand = `theme ${this.themes[nextThemeIndex].name}`;
    }
    else {
      this.currentCommand = cmdToExecute;
    }
    
    this.executeCommand();
  }

  navigateHistory(direction: number): void {
    const newIndex = this.historyIndex + direction;

    if (newIndex >= 0 && newIndex <= this.commandHistory.length) {
      this.historyIndex = newIndex;
      this.currentCommand = newIndex === this.commandHistory.length
        ? ''
        : this.commandHistory[newIndex];
    }
  }

  clearTerminal(): void {
    this.terminalOutput.nativeElement.innerHTML = '';
  }

  addOutput(text: string, className: string = ''): void {
    const element = document.createElement('div');
    element.className = className;
    element.innerHTML = text.replace(/\n/g, '<br>');
    this.terminalOutput.nativeElement.appendChild(element);
    this.scrollToBottom();
  }

  getHelpText(): string {
    const isEnglish = this.languageService.getCurrentLanguage() === 'en';
    
    let helpText = isEnglish ? 'Available commands:\n' : 'Comandos disponíveis:\n';
    helpText += isEnglish 
      ? '- clear: Clear the terminal\n' 
      : '- clear: Limpar o terminal\n';
    helpText += isEnglish 
      ? '- help: Display this help message\n' 
      : '- help: Exibir esta mensagem de ajuda\n';

    this.commands.forEach(cmd => {
      // Skip the lang alias in the help text to avoid duplication
      if (cmd.name === 'lang') return;
      
      let description = cmd.description;
      
      // Translate common command descriptions if in Portuguese
      if (!isEnglish) {
        switch (cmd.name) {
          case 'projects':
            description = 'Mostrar meus projetos';
            break;
          case 'skills':
            description = 'Mostrar minhas habilidades';
            break;
          case 'about':
            description = 'Mostrar informações sobre mim';
            break;
          case 'experience':
            description = 'Mostrar minha experiência profissional';
            break;
          case 'contact':
            description = 'Mostrar informações de contato';
            break;
          case 'theme':
            description = 'Mudar o tema do terminal (uso: theme [nome])';
            break;
          case 'language':
            description = 'Mudar o idioma atual (uso: language [en|pt])';
            break;
        }
      }
      
      helpText += `- ${cmd.name}: ${description}\n`;
    });

    return helpText;
  }

  handleThemeCommand(args: string[]): string {
    if (!args.length || args[0] === 'list') {
      return 'Available themes:\n' + this.themes.map(t => `- ${t.name}`).join('\n');
    }
    
    const themeName = args[0];
    const theme = this.themes.find(t => t.name === themeName);

    if (theme) {
      // Store current visual response type and data if any
      const currentResponse = this.currentVisualResponse;

      this.currentTheme = theme;
      this.applyTheme(theme);
      
      // Save theme preference to localStorage
      localStorage.setItem('terminal-theme', theme.name);
      
      // If there was a visual response, restore it after theme change
      if (currentResponse) {
        setTimeout(() => {
          this.currentVisualResponse = currentResponse;
            this.scrollToBottom();
        }, 50);
      }
      
      this.themeChanged.emit(theme);
      console.log("teste1",  this.currentTheme.name)
      return `Theme changed to ${theme.name}`;
    }

    this.scrollToBottom();
    return `Theme "${themeName}" not found. Use "theme list" to see available themes.`;
  }

  handleLanguageCommand(args: string[]): string {
    if (!args.length || args[0] === 'list') {
      const currentLang = this.languageService.getCurrentLanguage();
      this.scrollToBottom();  
      return `Available languages:\n- en (English) ${currentLang === 'en' ? '[current]' : ''}\n- pt (Português) ${currentLang === 'pt' ? '[current]' : ''}`;
    }

    const lang = args[0].toLowerCase();
    if (lang === 'en' || lang === 'pt') {
      // Store current visual response type and data if any
      const currentResponse = this.currentVisualResponse;
      
      this.languageService.setLanguage(lang);
      
      // If there was a visual response, restore it after language change
      if (currentResponse) {
        setTimeout(() => {
          this.currentVisualResponse = currentResponse;
            this.scrollToBottom();  
        }, 50);
      }
    
      return lang === 'en' 
        ? 'Language changed to English' 
        : 'Idioma alterado para Português';
    }

    this.scrollToBottom();      
    const currentLang = this.languageService.getCurrentLanguage();
    return currentLang === 'en' 
      ? `Language "${args[0]}" not supported. Available options: en, pt`
      : `Idioma "${args[0]}" não suportado. Opções disponíveis: en, pt`;
  }

  applyTheme(theme: TerminalTheme): void {
    document.documentElement.style.setProperty('--terminal-bg', theme.background);
    document.documentElement.style.setProperty('--terminal-fg', theme.foreground);
    document.documentElement.style.setProperty('--terminal-font', theme.fontFamily);
    document.documentElement.style.setProperty('--terminal-accent', theme.foreground);
    document.documentElement.style.setProperty('--terminal-accent-hover', this.adjustColor(theme.foreground, 20));
    document.documentElement.style.setProperty('--terminal-input-bg', this.adjustColor(theme.background, 20));
    
    // Update transparent accent colors
    const transparentAccent = this.createTransparentColor(theme.foreground, 0.2);
    const borderLight = this.createTransparentColor(theme.foreground, 0.3);
    document.documentElement.style.setProperty('--terminal-accent-transparent', transparentAccent);
    document.documentElement.style.setProperty('--terminal-border-light', borderLight);

    // Force a style recalculation by accessing offsetHeight
    document.documentElement.offsetHeight;
    const input = this.commandInput.nativeElement;
    input.style.caretColor = 'transparent';

  }
  
  // Helper function to adjust color brightness
  private adjustColor(color: string, amount: number): string {
    // Handle hex colors
    if (color.startsWith('#')) {
      return this.adjustHexColor(color, amount);
    }
    
    // Handle rgb/rgba colors
    if (color.startsWith('rgb')) {
      return this.adjustRgbColor(color, amount);
    }
    
    return color;
  }
  
  private adjustHexColor(hex: string, amount: number): string {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  private adjustRgbColor(rgb: string, amount: number): string {
    const rgbMatch = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
    if (!rgbMatch) return rgb;
    
    let r = parseInt(rgbMatch[1]);
    let g = parseInt(rgbMatch[2]);
    let b = parseInt(rgbMatch[3]);
    const a = rgbMatch[4] || '1';
    
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // Helper method to create transparent colors
  private createTransparentColor(color: string, opacity: number): string {
    // For hex colors
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // For rgb colors
    if (color.startsWith('rgb(')) {
      const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
    }
    
    // For rgba colors
    if (color.startsWith('rgba(')) {
      const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
      if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1]);
        const g = parseInt(rgbaMatch[2]);
        const b = parseInt(rgbaMatch[3]);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
    }
    
    // Default fallback
    return `rgba(0, 255, 0, ${opacity})`;
  }

  // Experience navigation methods
  navigateExperience(direction: number): void {
    if (!this.currentVisualResponse || this.currentVisualResponse.type !== 'experience') return;
    
    const newIndex = this.currentExperienceIndex + direction;
    const maxIndex = this.currentVisualResponse.data.length - 1;
    
    if (newIndex >= 0 && newIndex <= maxIndex) {
      // Apply animation refresh
      this.refreshVisualResponseAnimations();
      this.currentExperienceIndex = newIndex;
    }
  }
  
  setExperienceIndex(index: number): void {
    if (!this.currentVisualResponse || this.currentVisualResponse.type !== 'experience') return;
    
    if (index >= 0 && index < this.currentVisualResponse.data.length && index !== this.currentExperienceIndex) {
      // Apply animation refresh
      this.refreshVisualResponseAnimations();
      this.currentExperienceIndex = index;
    }
  }
  
  private refreshVisualResponseAnimations(): void {
    if (!this.currentVisualResponse) return;
    
    const container = this.terminalContainer.nativeElement;
    let elements: NodeListOf<HTMLElement>;
    
    // Select elements based on visual response type
    switch (this.currentVisualResponse.type) {
      case 'project':
        elements = container.querySelectorAll('.project-item .card, .tech-tag, .card-actions a');
        break;
      case 'skills':
        elements = container.querySelectorAll('.skill-category, .skill-bar');
        break;
      case 'about':
        elements = container.querySelectorAll('.profile-photo, .about-text h2, .about-text h3, .about-text p');
        break;
      case 'contact':
        elements = container.querySelectorAll('.contact-info h2, .contact-info p, .contact-item, .form-input, .form-textarea, .form-button');
        break;
      case 'experience':
        elements = container.querySelectorAll('.experience-card, .job-responsibilities li');
        break;
      default:
        return;
    }
    
    // Reset animations for all elements
    elements.forEach((element: HTMLElement) => {
      const originalAnimation = window.getComputedStyle(element).animation;
      element.style.animation = 'none';
      // Force reflow
      void element.offsetWidth;
      // Restore original animation or use fadeIn as fallback
      element.style.animation = originalAnimation || 'fadeIn 0.4s ease';
    });
  }

  openImageModal(src: string, title: string): void {
    this.imageModal = {
      visible: true,
      src,
      title
    };
    
  }

  closeImageModal(): void {
    this.imageModal.visible = false;
  }

  get suggestionButtons(): string[] {
    return this.languageService.getCurrentLanguage() === 'en' ? this.suggestionButtonsEn : this.suggestionButtonsPt;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.terminalOutput?.nativeElement) {
        this.terminalOutput.nativeElement.scrollTop = this.terminalOutput.nativeElement.scrollHeight;
      }
    }, 0);
  }

  closeVisualResponse(): void {
    this.currentVisualResponse = null;
    this.scrollToBottom();
  }
}
