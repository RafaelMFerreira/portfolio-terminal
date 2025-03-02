import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalComponent } from '../terminal/terminal.component';
import { TerminalService } from '../../services/terminal.service';

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

  constructor(private terminalService: TerminalService) {
    this.terminalService.addCommand({
      name: 'launch',
      description: 'Launch a project',
      action: (args) => {
        const project = args[0];
        if (project === 'portfolio') {
          return 'Launching portfolio...';
        } else if (project === 'automata') {
          return 'Launching Automata Sandbox...';
        } else {
          return `launch: project not found: ${project}`;
        }
      }
    });
  }

  ngOnInit(): void {
    this.startIntroSequence();
    this.terminalCommands = this.terminalService.getCommands();
  }

  async startIntroSequence(): Promise<void> {
    await this.sleep(2200);
    await this.glitchName();
    await this.startBootSequence();

    if (!this.helpShown) {
      setTimeout(() => {
        // Automatically show help after 3 econds
        this.onCommandExecuted({command: 'help', output: ''});
        this.helpShown = true;
      }, 3000);
    }
  }

  async glitchName(): Promise<void> {
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
      await this.typeText(message);
      await this.sleep(100);
    }

    // Wait before showing terminal
    await this.sleep(1000);

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
}
