import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'en' | 'pt';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<Language>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor() {
    // Try to load saved language preference from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pt')) {
      this.currentLanguageSubject.next(savedLanguage);
    }
    // Mantém o <html lang> certo para leitores de tela e tradutores automáticos
    this.currentLanguage$.subscribe(lang => {
      document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
      document.title = lang === 'pt'
        ? 'Rafael Miranda Ferreira · Portfólio'
        : 'Rafael Miranda Ferreira · Portfolio';
    });
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: Language): void {
    this.currentLanguageSubject.next(language);
    localStorage.setItem('language', language);
  }

  toggleLanguage(): void {
    const newLanguage = this.currentLanguageSubject.value === 'en' ? 'pt' : 'en';
    this.setLanguage(newLanguage);
  }
} 