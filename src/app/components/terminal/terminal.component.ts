import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TerminalCommand {
  name: string;
  description: string;
  action: (args: string[]) => string;
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

  @ViewChild('terminalOutput', { static: true }) terminalOutput!: ElementRef;
  @ViewChild('commandInput', { static: true }) commandInput!: ElementRef;

  currentCommand = '';
  commandHistory: string[] = [];
  historyIndex = -1;

  constructor() {}

  ngOnInit(): void {
    if (this.initialMessage) {
      this.addOutput(this.initialMessage);
    }
    setTimeout(() => this.commandInput.nativeElement.focus(), 100);
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
}
