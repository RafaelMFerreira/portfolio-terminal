import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PORTFOLIO_VIEWS, PortfolioView, ViewService } from '../../services/view.service';
import { Language, LanguageService } from '../../services/language.service';

const LABELS: Record<Language, Record<PortfolioView, string>> = {
  en: { modern: 'modern', crt: 'CRT', simple: 'simple' },
  pt: { modern: 'moderno', crt: 'CRT', simple: 'simples' }
};

/**
 * Seletor fixo no canto superior direito, presente nas três visualizações.
 * Mesmo lugar sempre; o visual acompanha a visualização ativa (classe view-*).
 */
@Component({
  selector: 'app-view-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="switcher" [ngClass]="'view-' + view">
      <button type="button" class="lang" (click)="toggleLanguage()"
              [attr.aria-label]="lang === 'en' ? 'Mudar para português' : 'Switch to English'">
        <span [class.on]="lang === 'pt'">PT</span><span class="sep">·</span><span [class.on]="lang === 'en'">EN</span>
      </button>
      <div class="group" role="group" [attr.aria-label]="lang === 'en' ? 'View' : 'Visualização'">
        <button *ngFor="let v of views" type="button" class="opt"
                [class.active]="v === view" [attr.aria-pressed]="v === view"
                (click)="select(v)">{{ label(v) }}</button>
      </div>
    </div>
  `,
  styles: [`
    :host { position: fixed; top: 0; right: 0; z-index: 50; }
    .switcher { display: flex; align-items: center; gap: 16px; }
    button { font: inherit; cursor: pointer; }
    .lang { background: transparent; border: 0; padding: 4px; display: flex; gap: 4px; }
    .group { display: flex; }

    /* moderno: abas discretas dentro da barra superior do terminal */
    .view-modern { height: 40px; padding: 0 16px; font-family: var(--t-font); font-size: 12px; }
    .view-modern .lang { color: var(--t-muted); }
    .view-modern .lang .on { color: var(--t-fg); }
    .view-modern .group { border: 1px solid var(--t-border); border-radius: 5px; overflow: hidden; }
    .view-modern .opt { text-transform: lowercase; height: 28px; padding: 0 12px; border: 0; background: transparent; color: var(--t-muted); }
    .view-modern .opt + .opt { border-left: 1px solid var(--t-border); }
    .view-modern .opt.active { background: var(--t-prompt-soft); color: var(--t-prompt); }
    .view-modern .opt:not(.active):hover { color: var(--t-fg); }

    /* crt: texto puro, opção ativa acesa em fósforo */
    .view-crt { padding: 56px 70px 0 0; font-family: 'VT323', monospace; font-size: 22px; }
    .view-crt .lang, .view-crt .opt { color: var(--crt-dim); text-shadow: 0 0 6px var(--crt-glow); }
    .view-crt .lang .on { color: var(--crt-fg); }
    .view-crt .group { gap: 12px; }
    .view-crt .opt { background: transparent; border: 0; padding: 0 6px; text-transform: uppercase; }
    .view-crt .opt::before { content: '[ '; } .view-crt .opt::after { content: ' ]'; }
    .view-crt .opt.active { background: var(--crt-fg); color: var(--crt-bg); text-shadow: none; box-shadow: 0 0 10px var(--crt-glow); }
    .view-crt .opt:not(.active):hover { color: var(--crt-fg); }

    /* simples: controle arredondado sobre a página clara */
    .view-simple { padding: 40px 48px 0 0; font-family: 'Space Grotesk', system-ui, sans-serif; font-size: 13px; }
    .view-simple .lang { color: #5B5F66; font-family: var(--t-font); }
    .view-simple .lang .on { color: #17181B; }
    .view-simple .group { gap: 2px; padding: 3px; background: #E4E4DF; border-radius: 999px; }
    .view-simple .opt { height: 30px; padding: 0 14px; border: 0; border-radius: 999px; background: transparent; color: #3B3E44; }
    .view-simple .opt::first-letter { text-transform: uppercase; }
    .view-simple .opt.active { background: #17181B; color: #F3F3F0; }
    .view-simple .opt:not(.active):hover { background: #D5D5D0; }

    button:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }

    @media (max-width: 720px) {
      .view-modern, .view-crt, .view-simple { padding: 10px 12px 0 0; height: auto; }
      .view-crt { font-size: 18px; }
      .switcher { gap: 8px; }
      /* no celular o seletor fica sobre a faixa escura de navegação do modo simples */
      .view-simple .lang { color: var(--t-muted); }
      .view-simple .lang .on { color: var(--t-fg); }
    }
  `]
})
export class ViewSwitcherComponent implements OnInit, OnDestroy {
  views = PORTFOLIO_VIEWS;
  view: PortfolioView = 'modern';
  lang: Language = 'en';
  private subs: Subscription[] = [];

  constructor(private viewService: ViewService, private languageService: LanguageService) {}

  ngOnInit(): void {
    this.subs.push(
      this.viewService.view$.subscribe(v => (this.view = v)),
      this.languageService.currentLanguage$.subscribe(l => (this.lang = l))
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  label(v: PortfolioView): string {
    return LABELS[this.lang][v];
  }

  select(v: PortfolioView): void {
    this.viewService.setView(v);
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }
}
