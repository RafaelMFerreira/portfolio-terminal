// Update terminal.service.ts

import { Injectable } from '@angular/core';
import { PortfolioService } from './portfolio.service';

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

  constructor(private portfolioService: PortfolioService) {
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

    // Portfolio specific commands
    this.addCommand({
      name: 'projects',
      description: 'List all projects or view a specific project',
      visualMode: true,
      action: (args) => {
        if (args.length > 0) {
          const project = this.portfolioService.getProject(args[0]);
          if (project) {
            return {
              type: 'project',
              data: [project]
            };
          } else {
            return `Project "${args[0]}" not found. Use "projects" to see all projects.`;
          }
        } else {
          return {
            type: 'project',
            data: this.portfolioService.getProjects()
          };
        }
      }
    });

    this.addCommand({
      name: 'skills',
      description: 'Display skills and expertise',
      visualMode: true,
      action: () => {
        return {
          type: 'skills',
          data: this.portfolioService.getSkills()
        };
      }
    });

    this.addCommand({
      name: 'about',
      description: 'Display information about me',
      visualMode: true,
      action: () => {
        return {
          type: 'about',
          data: this.portfolioService.getAboutInfo()
        };
      }
    });

    this.addCommand({
      name: 'experience',
      description: 'View my professional experience',
      visualMode: true,
      action: () => {
        return {
          type: 'experience',
          data: this.portfolioService.getExperience()
        };
      }
    });

    this.addCommand({
      name: 'contact',
      description: 'Get in touch with me',
      visualMode: true,
      action: () => {
        return {
          type: 'contact',
          data: this.portfolioService.getContactInfo()
        };
      }
    });

    this.addCommand({
      name: 'download',
      description: 'Download my resume',
      action: () => {
        window.open('/assets/documents/resume.pdf', '_blank');
        return 'Downloading resume...';
      }
    });

    this.addCommand({
      name: 'help',
      description: 'Display available commands',
      action: () => {
        let helpText = 'Available commands:\n\n';
        this.commands.forEach(cmd => {
          helpText += `${cmd.name.padEnd(12)} - ${cmd.description}\n`;
        });
        helpText += '\nTip: Click the buttons below for quick access!';
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
