import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LanguageService } from './language.service';

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  demoUrl?: string;
  codeUrl?: string;
}

export interface Skill {
  name: string;
  level: number; // 0-100
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
}

export interface AboutInfo {
  name: string;
  title: string;
  bio: string;
  photo: string;
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  responsibilities: string[];
}

export interface Contact {
  email: string;
  linkedin: string;
  github: string;
  website: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private baseUrl = environment.baseUrl;
  
  private projectsEn: Project[] = [
    {
      id: 'automata',
      title: 'Automata Sandbox',
      description: 'An interactive tool for exploring finite state machines and automata theory. Created as a graduation project to help students learn automata theory concepts.',
      technologies: ['React', 'TypeScript', 'P5.js'],
      imageUrl: `${this.baseUrl}/assets/images/projectAutomataSandbox.jpg`,
      demoUrl: 'https://igorsolerc.github.io/automata-sandbox/',
      codeUrl: 'https://github.com/IgorSolerC/automata-sandbox'
    },
    {
      id: 'ai-automation',
      title: 'AI Process Automation',
      description: 'Developed an AI-based solution that reduced operational costs by 40% and increased productivity with less than 5% error rate.',
      technologies: ['C#', 'SQL Server', 'AI APIs']
    },
    {
      id: 'portfolio',
      title: 'Terminal Portfolio',
      description: 'This interactive terminal-style portfolio website showcasing my projects and skills.',
      technologies: ['Angular', 'TypeScript', 'CSS Animations'],
      imageUrl: `${this.baseUrl}/assets/images/projectTerminal.jpg`,
      codeUrl: 'https://github.com/RafaelMFerreira/portfolio-terminal'
    }
  ];

  private projectsPt: Project[] = [
    {
      id: 'automata',
      title: 'Automata Sandbox',
      description: 'Uma ferramenta interativa para explorar máquinas de estado finito e teoria de autômatos. Criado como projeto de graduação para ajudar estudantes a aprender conceitos de teoria de autômatos.',
      technologies: ['React', 'TypeScript', 'P5.js'],
      imageUrl: `${this.baseUrl}/assets/images/projectAutomataSandbox.jpg`,
      demoUrl: 'https://igorsolerc.github.io/automata-sandbox/',
      codeUrl: 'https://github.com/IgorSolerC/automata-sandbox'
    },
    {
      id: 'ai-automation',
      title: 'Automação de Processos com IA',
      description: 'Desenvolveu uma solução baseada em IA que reduziu custos operacionais em 40% e aumentou a produtividade com menos de 5% de taxa de erro.',
      technologies: ['C#', 'SQL Server', 'AI APIs']
    },
    {
      id: 'portfolio',
      title: 'Terminal Portfolio',
      description: 'Este site de portfólio interativo estilo terminal apresentando meus projetos e habilidades.',
      technologies: ['Angular', 'TypeScript', 'CSS Animations'],
      imageUrl: `${this.baseUrl}/assets/images/projectTerminal.jpg`,
      codeUrl: 'https://github.com/RafaelMFerreira/portfolio-terminal'
    }
  ];

  //TODO: Find a better way to convey skillsets.
  //Level bars are pretty but don't mean much
  private skillsEn: SkillCategory[] = [
    {
      name: 'Backend',
      skills: [
        { name: 'C# (.NET)', level: 90 },
        { name: 'ASP.NET Core', level: 85 },
        { name: 'Entity Framework', level: 80 },
        { name: 'Python', level: 70 }
      ]
    },
    {
      name: 'Frontend',
      skills: [
        { name: 'HTML/CSS', level: 85 },
        { name: 'JavaScript', level: 80 },
        { name: 'TypeScript', level: 75 },
        { name: 'Angular', level: 80 },
        { name: 'React', level: 70 }
      ]
    },
    {
      name: 'Databases',
      skills: [
        { name: 'SQL Server', level: 85 },
        { name: 'MongoDB', level: 70 },
        { name: 'ClickHouse', level: 65 },
        { name: 'Redis', level: 60 }
      ]
    },
    {
      name: 'DevOps',
      skills: [
        { name: 'Git', level: 80 },
        { name: 'Docker', level: 75 },
        { name: 'RabbitMQ', level: 75},
        { name: 'IIS', level: 70 },
        { name: 'Nginx', level: 70 },        
        { name: 'WSL', level: 65 }
      ]
    }
  ];

  private skillsPt: SkillCategory[] = [
    {
      name: 'Backend',
      skills: [
        { name: 'C# (.NET)', level: 90 },
        { name: 'ASP.NET Core', level: 85 },
        { name: 'Entity Framework', level: 80 },
        { name: 'Python', level: 70 }
      ]
    },
    {
      name: 'Frontend',
      skills: [
        { name: 'HTML/CSS', level: 85 },
        { name: 'JavaScript', level: 80 },
        { name: 'TypeScript', level: 75 },
        { name: 'Angular', level: 80 },
        { name: 'React', level: 70 }
      ]
    },
    {
      name: 'Databases',
      skills: [
        { name: 'SQL Server', level: 85 },
        { name: 'MongoDB', level: 70 },
        { name: 'ClickHouse', level: 65 },
        { name: 'Redis', level: 60 }
      ]
    },
    {
      name: 'DevOps',
      skills: [
        { name: 'Git', level: 80 },
        { name: 'Docker', level: 75 },
        { name: 'RabbitMQ', level: 75},
        { name: 'IIS', level: 70 },
        { name: 'Nginx', level: 70 },        
        { name: 'WSL', level: 65 }
      ]
    }
  ];

  private experienceEn: Experience[] = [
    {
      title: 'Mid-level Developer',
      company: 'SERGET Mobilidade Viária',
      period: 'May 2024 - Present',
      responsibilities: [
        'Manage new projects, planning and requirements gathering',
        'Coordinate and assist the team in developing effective solutions',
        'Participate in client meetings to understand needs',
        'Designed databases and implemented optimizations in critical systems'
      ]
    },
    {
      title: 'Junior Developer',
      company: 'SERGET Mobilidade Viária',
      period: 'June 2023 - May 2024',
      responsibilities: [
        'Assisted in implementing our system for a major client',
        'Collaborated in adapting agile methodologies to team needs',
        'Migrated production infrastructure (Linux) to another server',
        'Automated a manual report generation process, reducing time from weeks to seconds'
      ]
    },
    {
      title: 'Trainee Developer',
      company: 'SERGET Mobilidade Viária',
      period: 'February 2022 - June 2023',
      responsibilities: [
        'Developed and maintained scalable web applications',
        'Implemented improvements that reduced costs using AI',
        'Participated in developing new features across various systems'
      ]
    },
    {
      title: 'Intern',
      company: 'SERGET Mobilidade Viária',
      period: 'July 2021 - February 2022',
      responsibilities: [
        'First professional experience in the field',
        'Worked on maintenance and development of small features',
        'Worked with agile methodologies (Scrum/Kanban)'
      ]
    }
  ];

  private experiencePt: Experience[] = [
    {
      title: 'Desenvolvedor Pleno',
      company: 'SERGET Mobilidade Viária',
      period: 'Maio 2024 - Presente',
      responsibilities: [
        'Gerencio novos projetos, planejamento e levantamento de requisitos',
        'Coordeno e auxilio a equipe no desenvolvimento de soluções eficazes',
        'Participo de reuniões com clientes para entender necessidades',
        'Modelei bancos de dados e implementei otimizações em sistemas críticos'
      ]
    },
    {
      title: 'Desenvolvedor Júnior',
      company: 'SERGET Mobilidade Viária',
      period: 'Junho 2023 - Maio 2024',
      responsibilities: [
        'Auxiliei na implantação de nosso sistema em um grande cliente',
        'Colaborei na adaptação das metodologias ágeis às necessidades da equipe',
        'Realizei a migração da infraestrutura (Linux) de produção para outro servidor',
        'Automatizei um processo manual de geração de relatórios, reduzindo o tempo de semanas para segundos.'
      ]
    },
    {
      title: 'Desenvolvedor Trainee',
      company: 'SERGET Mobilidade Viária',
      period: 'Fevereiro 2022 - Junho 2023',
      responsibilities: [
        'Desenvolvi e mantive aplicações web escaláveis',
        'Implementei melhorias que reduziram custos utilizando IA',
        'Participei do desenvolvimento de novas funcionalidades em diversos sistemas'
      ]
    },
    {
      title: 'Estagiário',
      company: 'SERGET Mobilidade Viária',
      period: 'Julho 2021 - Fevereiro 2022',
      responsibilities: [
        'Primeira experiência profissional na área',
        'Trabalhei na manutenção e desenvolvimento de pequenas funcionalidades',
        'Atuei com metodologias ágeis (Scrum/Kanban)'
      ]
    }
  ];

  private aboutInfoEn: AboutInfo = {
    name: 'Rafael Miranda Ferreira',
    title: 'Full-Stack Developer',
    bio: 'I am a developer passionate about technology and problem-solving. Graduated in Computer Science from Mackenzie Presbyterian University (2020-2024), I currently work as a Mid-level Developer at SERGET Mobilidade Viária. Always seeking innovation, I have a strong interest in artificial intelligence and process optimization.',
    photo: `${this.baseUrl}/assets/images/profile.jfif` //TODO: Better photo
  };

  private aboutInfoPt: AboutInfo = {
    name: 'Rafael Miranda',
    title: 'Desenvolvedor Full-Stack',
    bio: 'Sou um desenvolvedor apaixonado por tecnologia e resolução de problemas. Graduado em Ciência da Computação pela Universidade Presbiteriana Mackenzie (2020-2024), atualmente trabalho como Desenvolvedor Pleno na SERGET Mobilidade Viária. Sempre buscando inovação, tenho grande interesse em inteligência artificial e otimização de processos.',
    photo: `${this.baseUrl}/assets/images/profile.jfif` //TODO: Better photo
  };

  //TODO: Actually enable the form to send e-mails
  private contactInfoEn: Contact = {
    email: 'rafaelmirandaferreira@outlook.com',
    linkedin: 'linkedin.com/in/rafael-miranda-ferreira/',
    github: 'github.com/RafaelMFerreira/',
    website: 'www.rafaelmirandaferreira.com',
    message: 'Feel free to get in touch for collaborations, opportunities, or just to chat!'
  };

  private contactInfoPt: Contact = {
    email: 'rafaelmirandaferreira@outlook.com',
    linkedin: 'linkedin.com/in/rafael-miranda-ferreira',
    github: 'github.com/rafaelMFerreira',
    website: 'www.rafaelmirandaferreira.com',
    message: 'Interessado em trabalhar juntos? Envie-me uma mensagem e vamos conversar sobre como posso ajudar em seu próximo projeto!'
  };

  constructor(private languageService: LanguageService) { }

  getProjects(): Project[] {
    return this.languageService.getCurrentLanguage() === 'en' ? this.projectsEn : this.projectsPt;
  }

  getProject(id: string): Project | undefined {
    const projects = this.getProjects();
    return projects.find(p => p.id === id);
  }

  getSkills(): SkillCategory[] {
    return this.languageService.getCurrentLanguage() === 'en' ? this.skillsEn : this.skillsPt;
  }

  getAboutInfo(): AboutInfo {
    return this.languageService.getCurrentLanguage() === 'en' ? this.aboutInfoEn : this.aboutInfoPt;
  }

  getExperience(): Experience[] {
    return this.languageService.getCurrentLanguage() === 'en' ? this.experienceEn : this.experiencePt;
  }

  getContactInfo(): Contact {
    return this.languageService.getCurrentLanguage() === 'en' ? this.contactInfoEn : this.contactInfoPt;
  }
}
