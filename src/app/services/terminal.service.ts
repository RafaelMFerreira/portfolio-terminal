// Update terminal.service.ts

import { Injectable } from '@angular/core';

export interface TerminalCommand {
  name: string;
  description: string;
  action: (args: string[]) => string | any;
  visualMode?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TerminalService {
  private commands: TerminalCommand[] = [];

  constructor() {
    this.initCommands();
  }

  private initCommands(): void {
    // Basic commands
    this.addCommand({
      name: 'echo',
      description: 'Display a message',
      action: (args) => args.join(' ')
    });

    this.addCommand({
      name: 'date',
      description: 'Display current date and time',
      action: () => new Date().toString()
    });

    this.addCommand({
      name: 'whoami',
      description: 'Display information about the current user',
      action: () => 'visitor (Guest User)'
    });

    this.addCommand({
      name: 'clear',
      description: 'Clear the terminal',
      action: () => ''
    });

    this.addCommand({
      name: 'help',
      description: 'Display available commands',
      action: () => {
        let helpText = 'Available commands:\n\n';
        this.commands.forEach(cmd => {
          helpText += `${cmd.name.padEnd(12)} - ${cmd.description}\n`;
        });
        return helpText;
      }
    });
  }

  addCommand(command: TerminalCommand): void {
    this.commands.push(command);
  }

  getCommands(): TerminalCommand[] {
    return this.commands;
  }
}
