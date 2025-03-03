import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from '../../services/language.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="language-toggle-btn" (click)="toggleLanguage()">
      {{ currentLanguage === 'en' ? 'PT' : 'EN' }}
    </button>
  `,
  styles: []
})
export class LanguageToggleComponent implements OnInit {
  currentLanguage: Language = 'en';

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.languageService.currentLanguage$.subscribe(language => {
      this.currentLanguage = language;
    });
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }
} 