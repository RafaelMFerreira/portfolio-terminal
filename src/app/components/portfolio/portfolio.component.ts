import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TerminalComponent } from '../terminal/terminal.component';
import { SimpleViewComponent } from '../simple-view/simple-view.component';
import { BootMenuComponent } from '../boot-menu/boot-menu.component';
import { ViewSwitcherComponent } from '../view-switcher/view-switcher.component';
import { TerminalService } from '../../services/terminal.service';
import { PortfolioService } from '../../services/portfolio.service';
import { TerminalTheme } from '../../models/theme';
import { environment } from '../../../environments/environment';
import { ThemeService } from '../../services/theme.service';
import { PortfolioView, ViewService } from '../../services/view.service';
import { LanguageService } from '../../services/language.service';

type Stage = 'intro' | 'boot' | 'menu' | 'view';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, TerminalComponent, SimpleViewComponent, BootMenuComponent, ViewSwitcherComponent],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit, OnDestroy {
  terminalCommands: any[] = [];

  stage: Stage = 'intro';
  view: PortfolioView = 'modern';

  // Animação
  nameOpacity = 1;
  nameText = 'Rafael Miranda Ferreira';
  bootLog = '';
  /** Incrementado a cada reinício: interrompe a sequência anterior se ainda estiver rodando. */
  private run = 0;

  currentTheme!: TerminalTheme;

  get terminalPrompt(): string {
    return this.lang === 'en' ? 'visitor@rmf:~$' : 'visitante@rmf:~$';
  }

  bootMessages = [
    'Initializing system...',
    'CPU: Intel Core i9-12900K @ 5.2GHz',
    'RAM: 64GB DDR5-5600',
    'Loading kernel modules...',
    'Checking disk integrity...',
    'ERROR: System corruption detected.',
    'Scanning disk for errors...',
    'Multiple corrupted sectors found.',
    'Attempting automatic recovery...',
    'Recovery failed: Critical system files missing.',
    'Initiating emergency recovery mode...',
    'Loading minimal environment...'
  ];

  private subs: Subscription[] = [];

  constructor(
    private terminalService: TerminalService,
    private portfolioService: PortfolioService,
    private themeService: ThemeService,
    public viewService: ViewService,
    public languageService: LanguageService
  ) {
    this.initPortfolioCommands();
    this.currentTheme = this.themeService.getStored();
  }

  get lang(): 'en' | 'pt' {
    return this.languageService.getCurrentLanguage();
  }

  get terminalInitialMessage(): string {
    return this.lang === 'en'
      ? 'Terminal Recovery Mode [Version 2.0]\nType "help" to see the commands, or click one below.'
      : 'Modo de Recuperação do Terminal [Versão 2.0]\nDigite "ajuda" para ver os comandos, ou clique em um abaixo.';
  }

  ngOnInit(): void {
    this.terminalCommands = this.terminalService.getCommands();
    this.themeService.apply(this.currentTheme);
    this.subs.push(this.viewService.view$.subscribe(v => (this.view = v)));

    // Link direto (?view=...) ou celular: vai direto ao conteúdo, sem intro.
    if (this.viewService.fromLink || this.viewService.isSmallScreen()) {
      this.stage = 'view';
    } else {
      this.startIntroSequence();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.run++;
  }

  private initPortfolioCommands(): void {
    const add = (command: any) => {
      if (!this.terminalService.getCommands().some(c => c.name === command.name)) {
        this.terminalService.addCommand(command);
      }
    };

    add({
      name: 'reboot',
      description: 'Restart the system and show boot animation',
      action: () => {
        setTimeout(() => this.restartSystem(), 400);
        return this.lang === 'en' ? 'Rebooting system...' : 'Reiniciando o sistema...';
      }
    });

    add({
      name: 'view',
      description: 'Switch the view (usage: view [modern|crt|simple])',
      action: (args: string[]) => {
        const target = this.viewService.parse(args[0]);
        if (!target) {
          return this.lang === 'en'
            ? 'Views: modern, crt, simple. Usage: view crt'
            : 'Visualizações: moderno, crt, simples. Uso: view crt';
        }
        setTimeout(() => this.viewService.setView(target), 250);
        return this.lang === 'en' ? `Switching to ${args[0]}...` : `Trocando para ${args[0]}...`;
      }
    });

    add({
      name: 'projects',
      description: 'List all projects or view a specific project',
      visualMode: true,
      action: (args: string[]) => {
        if (args.length > 0) {
          const project = this.portfolioService.getProject(args[0]);
          if (project) return { type: 'project', data: [project] };
          return this.lang === 'en'
            ? `Project "${args[0]}" not found. Use "projects" to see all projects.`
            : `Projeto "${args[0]}" não encontrado. Use "projetos" para ver todos.`;
        }
        return { type: 'project', data: this.portfolioService.getProjects() };
      }
    });

    add({
      name: 'skills',
      description: 'Display skills and expertise',
      visualMode: true,
      action: () => ({ type: 'skills', data: this.portfolioService.getSkills() })
    });

    add({
      name: 'about',
      description: 'Display information about me',
      visualMode: true,
      action: () => ({ type: 'about', data: this.portfolioService.getAboutInfo() })
    });

    add({
      name: 'experience',
      description: 'View my professional experience',
      visualMode: true,
      action: () => ({ type: 'experience', data: this.portfolioService.getExperience() })
    });

    add({
      name: 'contact',
      description: 'Get in touch with me',
      visualMode: true,
      action: () => ({ type: 'contact', data: this.portfolioService.getContactInfo() })
    });

    add({
      name: 'download',
      description: 'Download my resume',
      action: () => {
        if (!environment.resumeUrl) {
          return this.lang === 'en'
            ? 'Résumé not available yet. Use "contact" to reach me.'
            : 'Currículo ainda não disponível. Use "contato" para falar comigo.';
        }
        window.open(environment.resumeUrl, '_blank', 'noopener');
        return this.lang === 'en' ? 'Opening résumé...' : 'Abrindo o currículo...';
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Intro
  // ---------------------------------------------------------------------------

  async startIntroSequence(): Promise<void> {
    const run = ++this.run;
    this.stage = 'intro';
    this.nameOpacity = 1;
    this.nameText = 'Rafael Miranda Ferreira';
    this.bootLog = '';

    await this.sleep(environment.bootSequence.initialDelay);
    if (run !== this.run) return;
    await this.glitchName(run);
    if (run !== this.run) return;
    await this.startBootSequence(run);
    if (run !== this.run) return;
    this.finishIntro();
  }

  /** Primeira visita: menu de boot. Quem já escolheu antes vai direto para a visualização salva. */
  private finishIntro(): void {
    this.stage = this.viewService.hasExplicitChoice ? 'view' : 'menu';
  }

  /** Esc, ou o botão "pular", durante a intro. */
  skipIntro(): void {
    if (this.stage !== 'intro' && this.stage !== 'boot') return;
    this.run++;
    this.finishIntro();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.skipIntro();
  }

  onViewChosen(view: PortfolioView): void {
    this.viewService.setView(view);
    this.view = view;
    this.stage = 'view';
  }

  async glitchName(run: number): Promise<void> {
    const glitchColors: Record<string, { primary: string, secondary: string }> = {
      graphite: { primary: '#ff4fa3', secondary: '#4fd8ff' },
      matrix: { primary: '#ff00c1', secondary: '#00fff9' },
      classic: { primary: '#ff0000', secondary: '#0000ff' },
      amber: { primary: '#ff8000', secondary: '#ffff00' },
      blue: { primary: '#00ffff', secondary: '#0080ff' },
      ubuntu: { primary: '#ff4444', secondary: '#00ffff' }
    };
    const colors = glitchColors[this.currentTheme.name] ?? glitchColors['graphite'];
    document.documentElement.style.setProperty('--glitch-color-1', colors.primary);
    document.documentElement.style.setProperty('--glitch-color-2', colors.secondary);

    const stages = [
      { text: 'R4fa3l M1r4nda F3rr31ra', duration: 900 },
      { text: 'Rafael Mir#nda Ferr&!ra', duration: 700 },
      { text: 'R@f@el M!r@nd@ Ferreir@', duration: 600 },
      { text: 'Raf@el Mir@nd@ Ferreir@', duration: 500 },
      { text: 'R@f@el Mir@nd@', duration: 400 },
      { text: 'RM Ferreira', duration: 600 },
      { text: 'RM F', duration: 800 },
      { text: 'RM -RF', duration: 1100 },
      { text: 'rm -rf /', duration: 1600 }
    ];

    for (const stage of stages) {
      if (run !== this.run) return;
      this.nameText = stage.text;
      await this.sleep(stage.duration);
    }
    await this.sleep(1000);
  }

  async startBootSequence(run: number): Promise<void> {
    this.nameOpacity = 0;
    await this.sleep(500);
    if (run !== this.run) return;
    this.stage = 'boot';

    for (const message of this.bootMessages) {
      if (run !== this.run) return;
      await this.typeText(message, environment.bootSequence.typingSpeed);
      await this.sleep(environment.bootSequence.messageDelay);
    }
    await this.sleep(environment.bootSequence.finalDelay);
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

  onCommandExecuted(_event: { command: string, output: string | any }): void {
    // ganchos para efeitos futuros (ex.: shutdown)
  }

  async restartSystem(): Promise<void> {
    this.currentTheme = this.themeService.getStored();
    this.themeService.apply(this.currentTheme);
    await this.startIntroSequence();
  }
}
