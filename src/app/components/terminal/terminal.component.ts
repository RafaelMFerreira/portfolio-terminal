import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TerminalCommand {
  name: string;
  description: string;
  action: (args: string[]) => string;
}

export interface TerminalTheme {
  name: string;
  background: string;
  foreground: string;
  fontFamily: string;
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

  @Output() commandExecuted = new EventEmitter<{command: string, output: string}>();
  @Output() themeChanged = new EventEmitter<TerminalTheme>();

  @ViewChild('terminalOutput', { static: true }) terminalOutput!: ElementRef;
  @ViewChild('commandInput', { static: true }) commandInput!: ElementRef;
  @ViewChild('terminalContainer', { static: true }) terminalContainer!: ElementRef;

  currentCommand = '';
  commandHistory: string[] = [];
  historyIndex = -1;

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

    // Add theme command
    this.commands.push({
      name: 'theme',
      description: 'Change terminal theme. Usage: theme [name] or theme list',
      action: (args) => this.handleThemeCommand(args)
    });

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
    if (event.key === 'Enter') {
      this.executeCommand();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateHistory(-1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateHistory(1);
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
      let output = 'Command not found. Type "help" for available commands.';

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
          } catch (error) {
            output = `Error executing command: ${error}`;
          }
        }
      }

      if (output) {
        this.addOutput(output);
      }

      this.commandExecuted.emit({command: commandText, output});
    }

    this.currentCommand = '';
    setTimeout(() => this.commandInput.nativeElement.focus(), 0);
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
      this.themeChanged.emit(theme);
      return `Theme changed to ${theme.name}`;
    }

    return `Theme "${themeName}" not found. Use "theme list" to see available themes.`;
  }

  applyTheme(theme: TerminalTheme): void {
    const container = this.terminalContainer.nativeElement;
    const input = this.commandInput.nativeElement;

    container.style.backgroundColor = theme.background;
    container.style.color = theme.foreground;
    container.style.fontFamily = theme.fontFamily;

    input.style.color = theme.foreground;
    input.style.fontFamily = theme.fontFamily;
    input.style.caretColor = 'transparent';
  }
}
