import {
  AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PortfolioService } from '../../services/portfolio.service';
import { LanguageService } from '../../services/language.service';
import { Phosphor, TerminalTheme } from '../../models/theme';
import { ThemeService } from '../../services/theme.service';
import { TextLink, visualResponseToText } from '../../services/text-box';
import { buildContactMailto, ContactDraft } from '../../services/contact';

export interface TerminalCommand {
  name: string;
  description: string;
  action: (args: string[]) => string | VisualResponse;
  visualMode?: boolean;
}

export interface VisualResponse {
  type: 'project' | 'skills' | 'about' | 'contact' | 'experience';
  data: any;
}

export type TerminalVariant = 'modern' | 'crt';

interface OutputLine {
  kind: 'command' | 'text';
  text: string;
}

/** Comandos em português também funcionam quando digitados. */
const COMMAND_ALIASES: Record<string, string> = {
  projetos: 'projects',
  habilidades: 'skills',
  sobre: 'about',
  'experiência': 'experience',
  experiencia: 'experience',
  contato: 'contact',
  tema: 'theme',
  idioma: 'language',
  ajuda: 'help',
  limpar: 'clear',
  ver: 'view',
  'currículo': 'download',
  curriculo: 'download'
};

/** Comandos de ajuste: mantêm o painel aberto. */
const SETTINGS_COMMANDS = ['theme', 'language', 'lang'];

const PT_DESCRIPTIONS: Record<string, string> = {
  echo: 'Exibir uma mensagem',
  date: 'Mostrar data e hora atuais',
  whoami: 'Mostrar o usuário atual',
  clear: 'Limpar o terminal',
  help: 'Mostrar os comandos disponíveis',
  reboot: 'Reiniciar o sistema e ver a animação de boot',
  projects: 'Mostrar meus projetos (uso: projects [id])',
  skills: 'Mostrar minhas habilidades',
  about: 'Mostrar informações sobre mim',
  experience: 'Mostrar minha experiência profissional',
  contact: 'Entrar em contato',
  download: 'Baixar meu currículo',
  view: 'Trocar a visualização (uso: view [moderno|crt|simples])',
  theme: 'Mudar o tema de cores (uso: theme [nome])',
  language: 'Mudar o idioma (uso: language [en|pt])'
};

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.css']
})
export class TerminalComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() prompt = 'visitor@portfolio:~$';
  @Input() initialMessage = 'Welcome to the terminal. Type "help" for available commands.';
  @Input() commands: TerminalCommand[] = [];
  @Input() variant: TerminalVariant = 'modern';

  @Output() commandExecuted = new EventEmitter<{ command: string, output: string | VisualResponse }>();
  @Output() themeChanged = new EventEmitter<TerminalTheme>();

  @ViewChild('terminalOutput', { static: true }) terminalOutput!: ElementRef<HTMLElement>;
  @ViewChild('commandInput', { static: true }) commandInput!: ElementRef<HTMLInputElement>;
  @ViewChild('crtMeasure') crtMeasure?: ElementRef<HTMLElement>;

  currentCommand = '';
  commandHistory: string[] = [];
  historyIndex = -1;
  lines: OutputLine[] = [];
  currentVisualResponse: VisualResponse | null = null;
  currentExperienceIndex = 0;

  /** CRT: a resposta atual em texto com moldura. */
  crtBox: string[] = [];
  crtLinks: TextLink[] = [];
  private crtCols = 76;

  contactDraft: ContactDraft = { name: '', email: '', message: '' };

  suggestionButtonsEn: string[] = ['help', 'about', 'projects', 'skills', 'experience', 'contact', 'theme'];
  suggestionButtonsPt: string[] = ['ajuda', 'sobre', 'projetos', 'habilidades', 'experiência', 'contato', 'tema'];

  imageModal = { visible: false, src: '', title: '' };

  themes: TerminalTheme[] = [];
  currentTheme!: TerminalTheme;
  phosphors: Phosphor[] = [];
  currentPhosphor!: Phosphor;

  private subs: Subscription[] = [];

  constructor(
    private portfolioService: PortfolioService,
    public languageService: LanguageService,
    public themeService: ThemeService
  ) {}

  get isEn(): boolean {
    return this.languageService.getCurrentLanguage() === 'en';
  }

  ngOnInit(): void {
    this.themes = this.themeService.getThemes();
    this.currentTheme = this.themeService.getStored();
    this.phosphors = this.themeService.getPhosphors();
    this.currentPhosphor = this.themeService.getStoredPhosphor();
    this.themeService.apply(this.currentTheme);

    this.addOutput(this.initialMessage);

    this.subs.push(this.languageService.currentLanguage$.subscribe(() => this.refreshVisualData()));

    // Comandos da interface, ligados a esta tela. O array de comandos é compartilhado
    // e o terminal é recriado ao trocar de visualização: cada tela registra os seus.
    this.registerOwn({
      name: 'theme',
      description: 'Change the color theme (usage: theme [name])',
      action: (args) => this.handleThemeCommand(args)
    });
    this.registerOwn({
      name: 'language',
      description: 'Change the language (usage: language [en|pt])',
      action: (args) => this.handleLanguageCommand(args)
    });
    this.registerOwn({
      name: 'lang',
      description: 'Alias for language',
      action: (args) => this.handleLanguageCommand(args)
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.focusInput(), 0);
    if (this.variant === 'crt') {
      const fonts = (document as any).fonts;
      if (fonts?.ready) {
        fonts.ready.then(() => this.measureCrtColumns());
      } else {
        this.measureCrtColumns();
      }
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.variant === 'crt') this.measureCrtColumns();
  }

  /**
   * Registra (ou substitui) um comando desta tela. Substituir é importante: o array é
   * compartilhado entre as telas, e um comando antigo continuaria apontando para a
   * tela anterior (ex.: "theme" listando fósforos da CRT no terminal moderno).
   */
  private registerOwn(command: TerminalCommand): void {
    const index = this.commands.findIndex(c => c.name === command.name);
    if (index >= 0) {
      this.commands[index] = command;
    } else {
      this.commands.push(command);
    }
  }

  focusInput(): void {
    this.commandInput?.nativeElement.focus();
  }

  /** Clique no fundo da área do terminal foca a linha de comando (sem roubar cliques de links e botões). */
  onScrollClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !window.getSelection()?.toString()) {
      this.focusInput();
    }
  }

  // ---------------------------------------------------------------------------
  // Teclado e execução
  // ---------------------------------------------------------------------------

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.imageModal.visible) {
        this.closeImageModal();
      } else if (this.currentVisualResponse) {
        this.closeVisualResponse();
      }
      event.preventDefault();
      return;
    }

    if (event.key === 'Enter') {
      this.executeCommand();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      this.completeCommand();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateHistory(-1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateHistory(1);
    } else if (event.key === 'ArrowLeft' && !this.currentCommand && this.currentVisualResponse?.type === 'experience') {
      this.navigateExperience(-1);
    } else if (event.key === 'ArrowRight' && !this.currentCommand && this.currentVisualResponse?.type === 'experience') {
      this.navigateExperience(1);
    }
  }

  /** Tab completa o nome do comando (ou mostra as opções, se houver várias). */
  completeCommand(): void {
    const typed = this.currentCommand.trimStart();
    if (!typed || typed.includes(' ')) return;
    const names = [
      ...this.commands.map(c => c.name),
      ...Object.keys(COMMAND_ALIASES)
    ].filter((n, i, all) => all.indexOf(n) === i);
    const matches = names.filter(n => n.startsWith(typed.toLowerCase()));
    if (matches.length === 1) {
      this.currentCommand = matches[0] + ' ';
    } else if (matches.length > 1) {
      this.addOutput(matches.join('   '));
    }
  }

  executeCommand(): void {
    const commandText = this.currentCommand.trim();
    if (!commandText) return;

    this.commandHistory.push(commandText);
    this.historyIndex = this.commandHistory.length;
    this.lines.push({ kind: 'command', text: commandText });

    const [rawCmd, ...args] = commandText.split(/\s+/);
    const cmd = COMMAND_ALIASES[rawCmd.toLowerCase()] ?? rawCmd.toLowerCase();

    if (cmd === 'clear') {
      this.clearTerminal();
    } else if (cmd === 'help') {
      this.currentVisualResponse = null;
      this.addOutput(this.getHelpText());
      this.commandExecuted.emit({ command: commandText, output: '' });
    } else {
      const command = this.commands.find(c => c.name === cmd);
      if (command) {
        try {
          // Ajustes (tema, idioma) não fecham o painel aberto: dá para ver a mudança nele.
          const keepPanel = SETTINGS_COMMANDS.includes(cmd);
          this.handleCommandOutput(command.action(args), commandText, keepPanel);
        } catch (error) {
          this.currentVisualResponse = null;
          this.addOutput(`${this.isEn ? 'Error executing command' : 'Erro ao executar o comando'}: ${error}`);
        }
      } else {
        this.addOutput(this.isEn
          ? `Command not found: ${rawCmd}. Type "help" for available commands.`
          : `Comando não encontrado: ${rawCmd}. Digite "ajuda" para ver os comandos.`);
      }
    }

    this.currentCommand = '';
    setTimeout(() => this.focusInput(), 0);
  }

  private handleCommandOutput(output: string | VisualResponse, commandText: string, keepPanel = false): void {
    if (typeof output !== 'string') {
      this.currentVisualResponse = output;
      if (output.type === 'experience') this.currentExperienceIndex = 0;
      this.renderCrt();
      this.scrollToBottom();
    } else if (output) {
      if (!keepPanel) this.currentVisualResponse = null;
      this.addOutput(output);
    }
    this.commandExecuted.emit({ command: commandText, output });
  }

  executeButtonCommand(command: string): void {
    let cmd = COMMAND_ALIASES[command] ?? command;
    if (cmd === 'theme') {
      // botão de tema: avança para o próximo da lista (fósforos na CRT, temas no moderno)
      if (this.variant === 'crt') {
        const i = this.phosphors.findIndex(p => p.name === this.currentPhosphor.name);
        cmd = `theme ${this.phosphors[(i + 1) % this.phosphors.length].name}`;
      } else {
        const i = this.themes.findIndex(t => t.name === this.currentTheme.name);
        cmd = `theme ${this.themes[(i + 1) % this.themes.length].name}`;
      }
    }
    this.currentCommand = cmd;
    this.executeCommand();
  }

  navigateHistory(direction: number): void {
    const newIndex = this.historyIndex + direction;
    if (newIndex >= 0 && newIndex <= this.commandHistory.length) {
      this.historyIndex = newIndex;
      this.currentCommand = newIndex === this.commandHistory.length ? '' : this.commandHistory[newIndex];
    }
  }

  clearTerminal(): void {
    this.lines = [];
    this.currentVisualResponse = null;
  }

  /** Texto puro: o Angular escapa na renderização, então nada digitado vira HTML. */
  addOutput(text: string): void {
    this.lines.push({ kind: 'text', text });
    this.scrollToBottom();
  }

  getHelpText(): string {
    const en = this.isEn;
    const visible = this.commands.filter(c => c.name !== 'lang');
    const width = Math.max(...visible.map(c => c.name.length), 5) + 2;
    let text = en ? 'Available commands:\n\n' : 'Comandos disponíveis:\n\n';
    for (const cmd of visible) {
      const description = en ? cmd.description : (PT_DESCRIPTIONS[cmd.name] ?? cmd.description);
      text += `  ${cmd.name.padEnd(width)}${description}\n`;
    }
    text += en
      ? '\nTab completes a command. ↑ ↓ browse history. Esc closes a panel.'
      : '\nTab completa o comando. ↑ ↓ percorrem o histórico. Esc fecha o painel.';
    return text;
  }

  // ---------------------------------------------------------------------------
  // Tema e idioma
  // ---------------------------------------------------------------------------

  handleThemeCommand(args: string[]): string {
    if (this.variant === 'crt') return this.handlePhosphorCommand(args);
    if (!args.length || args[0] === 'list') {
      return (this.isEn ? 'Available themes:\n' : 'Temas disponíveis:\n') +
        this.themes.map(t => `  ${t.name}${t.name === this.currentTheme.name ? '  *' : ''}`).join('\n');
    }
    const theme = this.themes.find(t => t.name === args[0].toLowerCase());
    if (!theme) {
      return this.isEn
        ? `Theme "${args[0]}" not found. Use "theme list" to see the options.`
        : `Tema "${args[0]}" não encontrado. Use "theme list" para ver as opções.`;
    }
    this.currentTheme = theme;
    this.themeService.apply(theme);
    this.themeService.store(theme);
    this.themeChanged.emit(theme);
    return this.isEn ? `Theme changed to ${theme.name}` : `Tema alterado para ${theme.name}`;
  }

  /** Na CRT, "theme" escolhe a cor do fósforo. */
  private handlePhosphorCommand(args: string[]): string {
    if (!args.length || args[0] === 'list') {
      return (this.isEn ? 'Phosphor colors:\n' : 'Cores de fósforo:\n') +
        this.phosphors.map(p => `  ${p.name}${p.name === this.currentPhosphor.name ? '  *' : ''}`).join('\n');
    }
    const phosphor = this.phosphors.find(p => p.name === args[0].toLowerCase());
    if (!phosphor) {
      return this.isEn
        ? `Phosphor "${args[0]}" not found. Options: ${this.phosphors.map(p => p.name).join(', ')}`
        : `Fósforo "${args[0]}" não encontrado. Opções: ${this.phosphors.map(p => p.name).join(', ')}`;
    }
    this.currentPhosphor = phosphor;
    this.themeService.applyPhosphor(phosphor);
    this.themeService.storePhosphor(phosphor);
    return this.isEn ? `Phosphor changed to ${phosphor.name}` : `Fósforo alterado para ${phosphor.name}`;
  }

  handleLanguageCommand(args: string[]): string {
    const current = this.languageService.getCurrentLanguage();
    if (!args.length || args[0] === 'list') {
      return `en (English)${current === 'en' ? '  *' : ''}\npt (Português)${current === 'pt' ? '  *' : ''}`;
    }
    const lang = args[0].toLowerCase();
    if (lang === 'en' || lang === 'pt') {
      this.languageService.setLanguage(lang);
      return lang === 'en' ? 'Language changed to English' : 'Idioma alterado para Português';
    }
    return current === 'en'
      ? `Language "${args[0]}" not supported. Options: en, pt`
      : `Idioma "${args[0]}" não suportado. Opções: en, pt`;
  }

  /** Ao trocar de idioma, recarrega os dados do painel aberto. */
  private refreshVisualData(): void {
    const response = this.currentVisualResponse;
    if (!response) return;
    switch (response.type) {
      case 'project': {
        // mantém o filtro "projects <id>" se houver um só
        const ids = (response.data as any[]).map(p => p.id);
        response.data = this.portfolioService.getProjects().filter(p => ids.includes(p.id));
        break;
      }
      case 'skills': response.data = this.portfolioService.getSkills(); break;
      case 'about': response.data = this.portfolioService.getAboutInfo(); break;
      case 'experience': response.data = this.portfolioService.getExperience(); break;
      case 'contact': response.data = this.portfolioService.getContactInfo(); break;
    }
    this.renderCrt();
  }

  // ---------------------------------------------------------------------------
  // CRT
  // ---------------------------------------------------------------------------

  /** Quantos caracteres cabem por linha na área de saída da CRT. */
  private measureCrtColumns(): void {
    const output = this.terminalOutput?.nativeElement;
    const probe = this.crtMeasure?.nativeElement;
    if (!output || !probe) return;
    const charWidth = probe.getBoundingClientRect().width / 10;
    if (!charWidth) return;
    const style = getComputedStyle(output);
    const usable = output.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const cols = Math.floor(usable / charWidth);
    const next = Math.max(36, Math.min(96, cols));
    if (next !== this.crtCols) {
      this.crtCols = next;
      this.renderCrt();
    }
  }

  private renderCrt(): void {
    if (this.variant !== 'crt' || !this.currentVisualResponse) {
      this.crtBox = [];
      this.crtLinks = [];
      return;
    }
    const r = this.currentVisualResponse;
    // Experiência na CRT: mostra todas as posições na mesma caixa.
    const result = visualResponseToText(r.type, r.data, this.languageService.getCurrentLanguage(), this.crtCols);
    this.crtBox = result.lines;
    this.crtLinks = result.links;
  }

  // ---------------------------------------------------------------------------
  // Painéis
  // ---------------------------------------------------------------------------

  navigateExperience(direction: number): void {
    if (this.currentVisualResponse?.type !== 'experience') return;
    const next = this.currentExperienceIndex + direction;
    if (next >= 0 && next < this.currentVisualResponse.data.length) {
      this.currentExperienceIndex = next;
    }
  }

  setExperienceIndex(index: number): void {
    if (this.currentVisualResponse?.type !== 'experience') return;
    if (index >= 0 && index < this.currentVisualResponse.data.length) {
      this.currentExperienceIndex = index;
    }
  }

  sendContact(event: Event): void {
    event.preventDefault();
    const contact = this.portfolioService.getContactInfo();
    window.location.href = buildContactMailto(contact.email, this.contactDraft);
  }

  openImageModal(src: string, title: string): void {
    this.imageModal = { visible: true, src, title };
  }

  closeImageModal(): void {
    this.imageModal.visible = false;
    this.focusInput();
  }

  closeVisualResponse(): void {
    this.currentVisualResponse = null;
    this.crtBox = [];
    this.crtLinks = [];
    this.scrollToBottom();
    this.focusInput();
  }

  get crtText(): string {
    return this.crtBox.join('\n');
  }

  get suggestionButtons(): string[] {
    return this.isEn ? this.suggestionButtonsEn : this.suggestionButtonsPt;
  }

  trackByIndex(index: number): number {
    return index;
  }

  /**
   * Rola até o fim depois que a tela for atualizada. Com eventCoalescing (app.config),
   * o Angular só redesenha no próximo quadro de animação: um setTimeout(0) rolaria
   * antes de o painel novo existir. Dois quadros garantem que ele já foi desenhado.
   */
  private scrollToBottom(): void {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = this.terminalOutput?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }));
  }
}
