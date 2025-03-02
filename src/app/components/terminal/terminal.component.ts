import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  type: 'project' | 'skills' | 'about' | 'contact' | 'gallery' | 'experience';
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
  suggestionButtons: string[] = ['projects', 'skills', 'about', 'experience', 'contact'];
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

  constructor() {}

  ngOnInit(): void {
    if (this.initialMessage) {
      this.addOutput(this.initialMessage);
    }

    this.addOutput('Tip: Click on any command button below or type "projects" to view portfolio');

    // Add theme command
    this.commands.push({
      name: 'theme',
      description: 'Change terminal theme. Usage: theme [name] or theme list',
      action: (args) => this.handleThemeCommand(args)
    });

    // Apply initial theme
    this.applyTheme(this.currentTheme);
    
    // Set initial CSS variables
    document.documentElement.style.setProperty('--terminal-bg', this.currentTheme.background);
    document.documentElement.style.setProperty('--terminal-fg', this.currentTheme.foreground);
    document.documentElement.style.setProperty('--terminal-font', this.currentTheme.fontFamily);
    document.documentElement.style.setProperty('--terminal-accent', this.currentTheme.foreground);
    document.documentElement.style.setProperty('--terminal-accent-hover', this.adjustColor(this.currentTheme.foreground, 20));
    document.documentElement.style.setProperty('--terminal-input-bg', this.adjustColor(this.currentTheme.background, 20));
    
    // Set transparent accent colors
    const transparentAccent = this.createTransparentColor(this.currentTheme.foreground, 0.2);
    const borderLight = this.createTransparentColor(this.currentTheme.foreground, 0.3);
    document.documentElement.style.setProperty('--terminal-accent-transparent', transparentAccent);
    document.documentElement.style.setProperty('--terminal-border-light', borderLight);

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
    // Handle escape key to close visual response or image modal
    if (event.key === 'Escape') {
      if (this.imageModal.visible) {
        this.closeImageModal();
        event.preventDefault();
        return;
      }
      if (this.currentVisualResponse) {
        this.currentVisualResponse = null;
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
      } else if (cmd === 'help') {
        output = this.getHelpText();
      } else {
        // Check custom commands
        const command = this.commands.find(c => c.name === cmd);
        if (command) {
          try {
            output = command.action(args);

            // Handle visual response
            if (typeof output !== 'string') {
              this.currentVisualResponse = output;
              this.addOutput(`Displaying ${output.type} information...`);
              
              // Reset experience index when showing experience
              if (output.type === 'experience') {
                this.currentExperienceIndex = 0;
              }
              
              // Apply current theme to visual response elements after they render
              setTimeout(() => {
                this.applyThemeToVisualElements();
                // Refresh animations for the new visual response
                this.refreshVisualResponseAnimations();
              }, 50);
            } else {
              this.currentVisualResponse = null;
            }
          } catch (error) {
            output = `Error executing command: ${error}`;
            this.currentVisualResponse = null;
          }
        }
      }

      if (output && typeof output === 'string') {
        this.addOutput(output);
      }

      this.commandExecuted.emit({command: commandText, output});
    }

    this.currentCommand = '';
    setTimeout(() => this.commandInput.nativeElement.focus(), 0);
  }

  executeButtonCommand(command: string): void {
    this.currentCommand = command;
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
    this.terminalOutput.nativeElement.scrollTop = this.terminalOutput.nativeElement.scrollHeight;
  }

  getHelpText(): string {
    let helpText = 'Available commands:\n';
    helpText += '- clear: Clear the terminal\n';
    helpText += '- help: Display this help message\n';

    this.commands.forEach(cmd => {
      helpText += `- ${cmd.name}: ${cmd.description}\n`;
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
      this.currentTheme = theme;
      this.applyTheme(theme);
      
      // Update CSS variables when theme changes
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
      
      // Apply theme to visual elements if they exist
      if (this.currentVisualResponse) {
        this.applyThemeToVisualElements();
      }
      
      this.themeChanged.emit(theme);
      return `Theme changed to ${theme.name}`;
    }

    return `Theme "${themeName}" not found. Use "theme list" to see available themes.`;
  }

  applyTheme(theme: TerminalTheme): void {
    const container = this.terminalContainer.nativeElement;
    const input = this.commandInput.nativeElement;

    // Apply theme to main container
    container.style.backgroundColor = theme.background;
    container.style.color = theme.foreground;
    container.style.fontFamily = theme.fontFamily;

    // Apply theme to input
    input.style.color = theme.foreground;
    input.style.fontFamily = theme.fontFamily;
    input.style.caretColor = 'transparent';
    
    // Apply theme to visual response areas
    const visualResponseAreas = container.querySelectorAll('.visual-response-area, .project-card, .skills-display, .about-section, .contact-form');
    visualResponseAreas.forEach((element: HTMLElement) => {
      element.style.backgroundColor = theme.background;
      element.style.color = theme.foreground;
      element.style.fontFamily = theme.fontFamily;
    });
    
    // Apply theme to buttons
    const buttons = container.querySelectorAll('.suggestion-btn, .close-visual, .form-button');
    buttons.forEach((button: HTMLElement) => {
      button.style.fontFamily = theme.fontFamily;
    });
    
    // Apply theme to input fields
    const inputFields = container.querySelectorAll('.form-input, .form-textarea');
    inputFields.forEach((field: HTMLElement) => {
      field.style.backgroundColor = this.adjustColor(theme.background, 20);
      field.style.color = theme.foreground;
      field.style.fontFamily = theme.fontFamily;
    });
    
    // Update CSS variables for consistent theming
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

    // Apply theme to modal if visible
    if (this.imageModal.visible) {
      this.applyThemeToModal();
    }
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

  // Helper method to apply theme to visual elements after they appear
  private applyThemeToVisualElements(): void {
    if (!this.currentVisualResponse) return;
    
    const container = this.terminalContainer.nativeElement;
    
    // Apply theme to visual response areas
    const visualResponseAreas = container.querySelectorAll('.visual-response-area, .project-card, .skills-display, .about-section, .contact-form, .experience-section');
    visualResponseAreas.forEach((element: HTMLElement) => {
      element.style.backgroundColor = this.currentTheme.background;
      element.style.color = this.currentTheme.foreground;
      element.style.fontFamily = this.currentTheme.fontFamily;
    });
    
    // Apply theme to buttons
    const buttons = container.querySelectorAll('.suggestion-btn, .close-visual, .form-button, .carousel-nav, .indicator');
    buttons.forEach((button: HTMLElement) => {
      button.style.fontFamily = this.currentTheme.fontFamily;
      if (button.classList.contains('carousel-nav') || button.classList.contains('indicator')) {
        button.style.borderColor = this.currentTheme.foreground;
      }
    });
    
    // Apply theme to input fields
    const inputFields = container.querySelectorAll('.form-input, .form-textarea');
    inputFields.forEach((field: HTMLElement) => {
      field.style.backgroundColor = this.adjustColor(this.currentTheme.background, 20);
      field.style.color = this.currentTheme.foreground;
      field.style.fontFamily = this.currentTheme.fontFamily;
    });
    
    // Apply theme to tech tags
    const techTags = container.querySelectorAll('.tech-tag');
    const transparentAccent = this.createTransparentColor(this.currentTheme.foreground, 0.2);
    techTags.forEach((tag: HTMLElement) => {
      tag.style.backgroundColor = transparentAccent;
      tag.style.borderColor = this.currentTheme.foreground;
      tag.style.color = this.currentTheme.foreground;
    });
    
    // Apply theme to skill bars
    const skillFills = container.querySelectorAll('.skill-fill');
    skillFills.forEach((fill: HTMLElement) => {
      fill.style.backgroundColor = this.currentTheme.foreground;
    });
    
    // Apply theme to card borders and shadows
    const cards = container.querySelectorAll('.card, .experience-card');
    cards.forEach((card: HTMLElement) => {
      card.style.borderColor = this.currentTheme.foreground;
    });
    
    // Apply theme to experience elements
    const experienceHeaders = container.querySelectorAll('.experience-header h3');
    experienceHeaders.forEach((header: HTMLElement) => {
      header.style.color = this.currentTheme.foreground;
    });
    
    // No need to style active indicators here as they're now styled inline
    
    // Apply theme to navigation tip
    const navigationTips = container.querySelectorAll('.navigation-tip kbd');
    navigationTips.forEach((tip: HTMLElement) => {
      tip.style.borderColor = this.currentTheme.foreground;
    });

    // Apply theme to modal if visible
    if (this.imageModal.visible) {
      this.applyThemeToModal();
    }
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
  
  // Helper method to refresh the card animation
  private refreshExperienceCardAnimation(): void {
    const container = this.terminalContainer.nativeElement;
    const cards = container.querySelectorAll('.experience-card');
    
    // Remove and reapply animation to trigger it again
    cards.forEach((card: HTMLElement) => {
      card.style.animation = 'none';
      // Force reflow
      void card.offsetWidth;
      card.style.animation = 'fadeIn 0.4s ease';
    });
  }
  
  // New method to refresh animations for all visual response types
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

  // Open image modal
  openImageModal(src: string, title: string): void {
    this.imageModal = {
      visible: true,
      src,
      title
    };
    // Apply theme to modal
    this.applyThemeToModal();
  }

  // Close image modal
  closeImageModal(): void {
    this.imageModal.visible = false;
  }

  // Apply theme to modal
  private applyThemeToModal(): void {
    if (!this.imageModal.visible) return;
    
    const modal = document.querySelector('.image-modal');
    if (!modal) return;
    
    const modalContent = modal.querySelector('.modal-content');
    const modalTitle = modal.querySelector('.modal-title');
    const modalClose = modal.querySelector('.modal-close');
    
    if (modalContent) {
      (modalContent as HTMLElement).style.backgroundColor = this.currentTheme.background;
      (modalContent as HTMLElement).style.borderColor = this.currentTheme.foreground;
    }
    
    if (modalTitle) {
      (modalTitle as HTMLElement).style.color = this.currentTheme.foreground;
    }
    
    if (modalClose) {
      (modalClose as HTMLElement).style.color = this.currentTheme.foreground;
    }
  }
}
