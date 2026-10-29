import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PORTFOLIO_VIEWS, PortfolioView } from '../../services/view.service';

interface BootOption {
  view: PortfolioView;
  key: string;
  title: { en: string; pt: string };
  desc: { en: string; pt: string };
}

const OPTIONS: BootOption[] = [
  {
    view: 'modern', key: '1',
    title: { en: 'Modern terminal', pt: 'Terminal moderno' },
    desc: { en: 'Type commands or click them. The default way.', pt: 'Digite comandos ou clique neles. O jeito padrão.' }
  },
  {
    view: 'crt', key: '2',
    title: { en: 'Retro CRT', pt: 'CRT retrô' },
    desc: { en: 'An 80s phosphor monitor, everything in text.', pt: 'Um monitor de fósforo dos anos 80, com tudo em texto.' }
  },
  {
    view: 'simple', key: '3',
    title: { en: 'Simple mode', pt: 'Modo simples' },
    desc: { en: 'Straight to the content, no typing needed.', pt: 'Conteúdo direto, sem precisar digitar nada.' }
  }
];

/** Tempo até entrar sozinho na opção destacada, se o visitante não fizer nada. */
const AUTO_START_SECONDS = 8;

/**
 * Fim da intro: "3 ambientes de exibição encontrados" e a escolha da visualização.
 */
@Component({
  selector: 'app-boot-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boot-menu.component.html',
  styleUrls: ['./boot-menu.component.css']
})
export class BootMenuComponent implements OnInit, OnDestroy {
  @Input() lang: 'en' | 'pt' = 'en';
  @Input() initial: PortfolioView = 'modern';
  @Output() chosen = new EventEmitter<PortfolioView>();

  options = OPTIONS;
  selected: PortfolioView = 'modern';
  secondsLeft = AUTO_START_SECONDS;
  /** Para de contar assim que o visitante interage: ele está lendo as opções. */
  countingDown = true;
  private timer?: ReturnType<typeof setInterval>;

  get isEn(): boolean {
    return this.lang === 'en';
  }

  get selectedTitle(): string {
    const option = OPTIONS.find(o => o.view === this.selected);
    return option ? option.title[this.lang].toLowerCase() : '';
  }

  ngOnInit(): void {
    this.selected = this.initial;
    this.timer = setInterval(() => {
      if (!this.countingDown) return;
      this.secondsLeft--;
      if (this.secondsLeft <= 0) this.start(this.selected);
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  select(view: PortfolioView): void {
    this.selected = view;
    this.countingDown = false;
  }

  start(view: PortfolioView): void {
    if (this.timer) clearInterval(this.timer);
    this.chosen.emit(view);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    const index = PORTFOLIO_VIEWS.indexOf(this.selected);
    const byKey = OPTIONS.find(o => o.key === event.key);
    if (byKey) {
      this.start(byKey.view);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      this.select(PORTFOLIO_VIEWS[(index + 1) % PORTFOLIO_VIEWS.length]);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      this.select(PORTFOLIO_VIEWS[(index + PORTFOLIO_VIEWS.length - 1) % PORTFOLIO_VIEWS.length]);
    } else if (event.key === 'Enter') {
      // Enter num cartão focado já dispara o clique; aqui cobre o caso sem foco
      if (!(event.target instanceof HTMLButtonElement)) this.start(this.selected);
    } else {
      return;
    }
    event.preventDefault();
  }
}
