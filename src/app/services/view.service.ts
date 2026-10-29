import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type PortfolioView = 'modern' | 'crt' | 'simple';

export const PORTFOLIO_VIEWS: PortfolioView[] = ['modern', 'crt', 'simple'];

const STORAGE_KEY = 'portfolio-view';

/** Aceita os nomes em inglês e em português (`?view=simples`, `view crt`...). */
const VIEW_ALIASES: Record<string, PortfolioView> = {
  modern: 'modern',
  moderno: 'modern',
  terminal: 'modern',
  crt: 'crt',
  retro: 'crt',
  'retrô': 'crt',
  simple: 'simple',
  simples: 'simple',
  gui: 'simple'
};

@Injectable({
  providedIn: 'root'
})
export class ViewService {
  private viewSubject = new BehaviorSubject<PortfolioView>('modern');
  public view$ = this.viewSubject.asObservable();

  /** Veio de um link (?view=...) ou de uma escolha salva: nesses casos a intro pode ser pulada. */
  readonly hasExplicitChoice: boolean;
  /** Veio de um link direto (?view=...). */
  readonly fromLink: boolean;

  constructor() {
    const fromQuery = this.readQueryParam();
    const fromStorage = this.readStorage();

    this.fromLink = fromQuery !== null;
    this.hasExplicitChoice = fromQuery !== null || fromStorage !== null;

    const initial = fromQuery ?? fromStorage ?? (this.isSmallScreen() ? 'simple' : 'modern');
    this.viewSubject.next(initial);
  }

  get current(): PortfolioView {
    return this.viewSubject.value;
  }

  /** Celular ou tela estreita: o terminal é ruim de usar, então o padrão é o modo simples. */
  isSmallScreen(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches;
  }

  setView(view: PortfolioView): void {
    if (view === this.viewSubject.value) return;
    this.viewSubject.next(view);
    try {
      localStorage.setItem(STORAGE_KEY, view);
    } catch {
      /* navegação privada ou storage bloqueado: só não lembra a escolha */
    }
    this.syncUrl(view);
  }

  /** Converte um nome digitado (inglês ou português) em uma visualização. */
  parse(name: string | null | undefined): PortfolioView | null {
    if (!name) return null;
    return VIEW_ALIASES[name.trim().toLowerCase()] ?? null;
  }

  private readQueryParam(): PortfolioView | null {
    if (typeof window === 'undefined') return null;
    return this.parse(new URLSearchParams(window.location.search).get('view'));
  }

  private readStorage(): PortfolioView | null {
    try {
      return this.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  }

  /** Mantém a URL compartilhável: quem copiar o endereço leva a visualização junto. */
  private syncUrl(view: PortfolioView): void {
    if (typeof window === 'undefined' || !window.history?.replaceState) return;
    const url = new URL(window.location.href);
    url.searchParams.set('view', view);
    window.history.replaceState(null, '', url.toString());
  }
}
