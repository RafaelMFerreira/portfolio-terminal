import { Injectable } from '@angular/core';

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
  private projects: Project[] = [
    {
      id: 'automata',
      title: 'Automata Sandbox',
      description: 'An interactive tool for exploring finite state machines and automata theory. Created as a graduation project to help students learn automata theory concepts.',
      technologies: ['React', 'TypeScript', 'P5.js'],
      imageUrl: '/assets/images/projectAutomataSandbox.jpg',
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
      imageUrl: '/assets/images/projectTerminal.jpg',
      codeUrl: 'https://github.com/RafaelMFerreira/terminal-portfolio'
    }
  ];

  private skills: SkillCategory[] = [
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
        { name: 'IIS/Nginx', level: 70 },
        { name: 'WSL', level: 65 }
      ]
    }
  ];

  private experience: Experience[] = [
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
        'Realizei a migração da infraestrutura (Linux) de produção para outro servidor'
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

  private aboutInfo: AboutInfo = {
    name: 'Rafael Miranda Ferreira',
    title: 'Full-Stack Developer',
    bio: 'Sou um desenvolvedor apaixonado por tecnologia e resolução de problemas. Formado em Ciência da Computação pela Universidade Presbiteriana Mackenzie (2020-2024), atualmente trabalho como Desenvolvedor Pleno na SERGET Mobilidade Viária. Sempre buscando inovação, sou apaixonado por inteligência artificial e otimização de processos.',
    photo: '/assets/images/profile.jfif'
  };

  private contactInfo: Contact = {
    email: 'rafaelmirandaferreira@outlook.com',
    linkedin: 'linkedin.com/in/rafael-miranda-ferreira/',
    github: 'github.com/RafaelMFerreira/',
    website: 'www.rafaelmirandaferreira.com',
    message: 'Sinta-se à vontade para entrar em contato para colaborações, oportunidades ou simplesmente para bater um papo!'
  };

  constructor() { }

  getProjects(): Project[] {
    return this.projects;
  }

  getProject(id: string): Project | undefined {
    return this.projects.find(p => p.id === id);
  }

  getSkills(): SkillCategory[] {
    return this.skills;
  }

  getAboutInfo(): AboutInfo {
    return this.aboutInfo;
  }

  getExperience(): Experience[] {
    return this.experience;
  }

  getContactInfo(): Contact {
    return this.contactInfo;
  }
}
