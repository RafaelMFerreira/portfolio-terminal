import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalComponent } from '../terminal/terminal.component';
import { TerminalService } from '../../services/terminal.service';
import { PortfolioService } from '../../services/portfolio.service';
import { TerminalTheme } from '../terminal/terminal.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, TerminalComponent],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  terminalCommands: any[] = [];
  helpShown = false;

  // Display flags
  showIntro = true;
  showBootScreen = false;
  showTerminal = false;

  // Animation states
  nameOpacity = 1;
  nameText = 'Rafael Miranda Ferreira';
  bootLog = '';
  isShutdown = false;

  // Theme settings
  currentTheme: TerminalTheme = {
    name: 'matrix',
    background: '#000',
    foreground: '#0f0',
    fontFamily: 'Courier New, monospace'
  };

  // Terminal settings
  terminalPrompt = 'visitor@rmf:~$';
  terminalInitialMessage = 'Terminal Recovery Mode [Version 1.0]\nType \'help\' for available commands.';

  // Boot sequence messages
  bootMessages = [
    "Initializing system...",
    "CPU: Intel Core i9-12900K @ 5.2GHz",
    "RAM: 64GB DDR5-5600",
    "Loading kernel modules...",
    "Checking disk integrity...",
    "ERROR: System corruption detected.",
    "Scanning disk for errors...",
    "Multiple corrupted sectors found.",
    "Attempting automatic recovery...",
    "Recovery failed: Critical system files missing.",
    "Initiating emergency recovery mode...",
    "Loading minimal environment..."
  ];

  constructor(
    private terminalService: TerminalService,
    private portfolioService: PortfolioService
  ) {
    this.initPortfolioCommands();
    this.applyStoredTheme();
  }

  private applyStoredTheme(){
    // Load saved theme from localStorage if it exists
    const savedTheme = localStorage.getItem('terminal-theme');
    if (savedTheme) {
      const themes = [
        { name: 'matrix', background: '#000', foreground: '#0f0', fontFamily: 'Courier New, monospace' },
        { name: 'classic', background: '#000', foreground: '#fff', fontFamily: 'Courier New, monospace' },
        { name: 'amber', background: '#000', foreground: '#ffb000', fontFamily: 'Courier New, monospace' },
        { name: 'blue', background: '#000', foreground: '#00bfff', fontFamily: 'Courier New, monospace' },
        { name: 'ubuntu', background: '#300a24', foreground: '#fff', fontFamily: 'Ubuntu Mono, monospace' }
      ];
      const theme = themes.find(t => t.name === savedTheme);
      if (theme) {
        this.currentTheme = theme;
      }
    }
  }

  private initPortfolioCommands(): void {
    // Add reboot command
    this.terminalService.addCommand({
      name: 'reboot',
      description: 'Restart the system and show boot animation',
      action: () => {
        this.restartSystem();
        return 'Rebooting system...';
      }
    });

    // Portfolio specific commands
    this.terminalService.addCommand({
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

    this.terminalService.addCommand({
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

    this.terminalService.addCommand({
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

    this.terminalService.addCommand({
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

    this.terminalService.addCommand({
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

    this.terminalService.addCommand({
      name: 'download',
      description: 'Download my resume',
      action: () => {
        window.open('/assets/documents/resume.pdf', '_blank');
        return 'Downloading resume...';
      }
    });

    // this.terminalService.addCommand({
    //   name: 'launch',
    //   description: 'Launch a project',
    //   action: (args) => {
    //     const project = args[0];
    //     if (project === 'portfolio') {
    //       return 'Launching portfolio...';
    //     } else if (project === 'automata') {
    //       return 'Launching Automata Sandbox...';
    //     } else {
    //       return `launch: project not found: ${project}`;
    //     }
    //   }
    // });
  }

  ngOnInit(): void {
    this.startIntroSequence();
    this.terminalCommands = this.terminalService.getCommands();
  }

  async startIntroSequence(): Promise<void> {
    // Apply theme colors to container
    document.documentElement.style.setProperty('--portfolio-bg', this.currentTheme.background);
    document.documentElement.style.setProperty('--portfolio-fg', this.currentTheme.foreground);
    document.documentElement.style.setProperty('--portfolio-font', this.currentTheme.fontFamily);
    
    await this.sleep(environment.bootSequence.initialDelay);
    await this.glitchName();
    await this.startBootSequence();

    if (!this.helpShown) {
      setTimeout(() => {
        this.onCommandExecuted({command: 'help', output: ''});
        this.helpShown = true;
      }, 3000);
    }
  }

  async glitchName(): Promise<void> {
    const glitchColors = {
      matrix: { primary: '#ff00c1', secondary: '#00fff9' },
      classic: { primary: '#ff0000', secondary: '#0000ff' },
      amber: { primary: '#ff8000', secondary: '#ffff00' },
      blue: { primary: '#00ffff', secondary: '#0080ff' },
      ubuntu: { primary: '#ff4444', secondary: '#00ffff' }
    };

    const colors = glitchColors[this.currentTheme.name as keyof typeof glitchColors] || glitchColors.matrix;

    //Update glitch effect colors
    document.documentElement.style.setProperty('--glitch-color-1', colors.primary);
    document.documentElement.style.setProperty('--glitch-color-2', colors.secondary);

    const stages = [
      { text: "R4fa3l M1r4nda F3rr31ra", duration: 900 },
      { text: "Rafael Mir#nda Ferr&!ra", duration: 700 },
      { text: "R@f@el M!r@nd@ Ferreir@", duration: 600 },
      { text: "Raf@el Mir@nd@ Ferreir@", duration: 500 },
      { text: "R@f@el Mir@nd@", duration: 400 },
      { text: "RM Ferreira", duration: 600 },
      { text: "RM F", duration: 800 },
      { text: "RM -RF", duration: 1100 },
      { text: "rm -rf /", duration: 1600 }
    ];

    for (const stage of stages) {
      this.nameText = stage.text;
      await this.sleep(stage.duration);
    }

    await this.sleep(1000);
  }

  async startBootSequence(): Promise<void> {
    // Fade out name
    this.nameOpacity = 0;
    await this.sleep(500);
    this.showIntro = false;

    // Show boot screen
    this.showBootScreen = true;

    // Display boot messages
    for (const message of this.bootMessages) {
      await this.typeText(message, environment.bootSequence.typingSpeed);
      await this.sleep(environment.bootSequence.messageDelay);
    }

    // Wait before showing terminal
    await this.sleep(environment.bootSequence.finalDelay);

    // Hide boot screen and show terminal
    this.showBootScreen = false;
    this.showTerminal = true;
  }

  async typeText(text: string, speed: number = 10): Promise<void> {
    for (let i = 0; i < text.length; i++) {
      this.bootLog += text.charAt(i);
      await this.sleep(speed);
    }
    this.bootLog += '\n';
  }

  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onCommandExecuted(event: {command: string, output: string | any}): void {
    const cmd = event.command.split(' ')[0];

    if (cmd === 'shutdown') {
      this.isShutdown = true;
      setTimeout(() => {
        this.isShutdown = false;
      }, 3000);
    }
  }

  async restartSystem(): Promise<void> {
    
    // Reset state
    this.showTerminal = false;
    this.showBootScreen = false;
    this.showIntro = true;
    this.nameOpacity = 1;
    this.nameText = 'Rafael Miranda Ferreira';
    this.bootLog = '';
    this.helpShown = false;
   
    // Apply theme in case of changes
    this.applyStoredTheme();
    // Start the sequence again
    await this.startIntroSequence();
  }
}
