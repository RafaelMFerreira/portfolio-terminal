import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  AboutInfo, Contact, Experience, PortfolioService, Project, SkillCategory
} from '../../services/portfolio.service';
import { LanguageService } from '../../services/language.service';
import { ThemeService } from '../../services/theme.service';
import { buildContactMailto, ContactDraft } from '../../services/contact';
import { environment } from '../../../environments/environment';

export type SimpleSection = 'about' | 'projects' | 'skills' | 'experience' | 'contact';

const SECTIONS: SimpleSection[] = ['about', 'projects', 'skills', 'experience', 'contact'];

const FOLDER_NAMES: Record<'en' | 'pt', Record<SimpleSection, string>> = {
  en: { about: 'about', projects: 'projects', skills: 'skills', experience: 'experience', contact: 'contact' },
  pt: { about: 'sobre', projects: 'projetos', skills: 'habilidades', experience: 'experiência', contact: 'contato' }
};

const HEADINGS: Record<'en' | 'pt', Record<SimpleSection, string>> = {
  en: { about: 'Hi, I’m Rafael', projects: 'Things I’ve built', skills: 'What I work with', experience: 'Where I’ve worked', contact: 'Let’s talk' },
  pt: { about: 'Oi, eu sou o Rafael', projects: 'Coisas que construí', skills: 'Com o que trabalho', experience: 'Onde trabalhei', contact: 'Vamos conversar' }
};

/**
 * Visualização "simples": conteúdo direto, sem precisar digitar.
 * A coluna da esquerda mantém a cara de terminal e funciona como navegação.
 */
@Component({
  selector: 'app-simple-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './simple-view.component.html',
  styleUrls: ['./simple-view.component.css']
})
export class SimpleViewComponent implements OnInit, OnDestroy {
  sections = SECTIONS;
  section: SimpleSection = 'about';
  lang: 'en' | 'pt' = 'en';

  about!: AboutInfo;
  projects: Project[] = [];
  skills: SkillCategory[] = [];
  experience: Experience[] = [];
  contact!: Contact;

  command = '';
  commandError = '';
  contactDraft: ContactDraft = { name: '', email: '', message: '' };
  resumeUrl = environment.resumeUrl;

  private sub?: Subscription;

  constructor(
    private portfolioService: PortfolioService,
    private languageService: LanguageService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // a coluna de terminal usa as cores do tema atual
    this.themeService.apply(this.themeService.getStored());
    this.sub = this.languageService.currentLanguage$.subscribe(lang => {
      this.lang = lang;
      this.load();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get isEn(): boolean {
    return this.lang === 'en';
  }

  folder(s: SimpleSection): string {
    return FOLDER_NAMES[this.lang][s];
  }

  get heading(): string {
    return HEADINGS[this.lang][this.section];
  }

  open(s: SimpleSection): void {
    this.section = s;
    this.commandError = '';
    // no celular, a navegação fica em cima: leva o conteúdo para o topo
    document.querySelector('.simple-content')?.scrollTo({ top: 0 });
  }

  /** Aceita "projetos", "cd projetos", "projects/"... nos dois idiomas. */
  runCommand(event: Event): void {
    event.preventDefault();
    const raw = this.command.trim().toLowerCase().replace(/^cd\s+/, '').replace(/\/$/, '');
    if (!raw) return;
    const found = SECTIONS.find(s =>
      s === raw || FOLDER_NAMES.en[s] === raw || FOLDER_NAMES.pt[s] === raw ||
      (s === 'experience' && raw === 'experiencia'));
    if (found) {
      this.open(found);
      this.command = '';
    } else {
      this.commandError = this.isEn
        ? `no such folder: ${raw}`
        : `pasta não encontrada: ${raw}`;
    }
  }

  sendContact(event: Event): void {
    event.preventDefault();
    window.location.href = buildContactMailto(this.contact.email, this.contactDraft);
  }

  pad(n: number): string {
    return String(n + 1).padStart(2, '0');
  }

  private load(): void {
    this.about = this.portfolioService.getAboutInfo();
    this.projects = this.portfolioService.getProjects();
    this.skills = this.portfolioService.getSkills();
    this.experience = this.portfolioService.getExperience();
    this.contact = this.portfolioService.getContactInfo();
  }
}
