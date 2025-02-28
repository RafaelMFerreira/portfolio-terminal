import { Injectable } from '@angular/core';
import { TerminalCommand } from '../components/terminal/terminal.component';

@Injectable({
  providedIn: 'root'
})
export class TerminalService {
  private portfolioContent: Record<string, string> = {
    'about.txt': `
              NAME: Rafael Miranda Ferreira
              ROLE: Full-Stack Developer

              ABOUT ME:
              Sou um desenvolvedor apaixonado por tecnologia e resolução de problemas.
              Formado em Ciência da Computação pela Universidade Presbiteriana Mackenzie (2020-2024),
              atualmente trabalho como Desenvolvedor Pleno na SERGET Mobilidade Viária.

              Além da programação, atuo no gerenciamento de novos projetos, levantamento de requisitos,
              coordenação e treinamento da equipe, e participação em reuniões com clientes.
              Durante minha trajetória, implementei soluções baseadas em inteligência artificial
              que reduziram custos operacionais em 40% e aumentaram a produtividade, mantendo uma
              taxa de erro inferior a 5%.

              Sempre buscando inovação, sou apaixonado por inteligência artificial e otimização de processos.
              `,
    'skills.txt': `
              TECHNICAL SKILLS:
              - Backend: C# (.NET, ASP.NET Core, Entity Framework), Python
              - Frontend: HTML, CSS, JavaScript, TypeScript, Angular, React, Bootstrap
              - Databases: SQL Server, MongoDB, ClickHouse, Redis
              - DevOps: Git, Docker (Portainer), IIS, Nginx, WSL
              - Methodologies: Agile (Scrum, Kanban)
              - Other: RESTful APIs, WebSockets, Software Architecture, Metabase
              `,
    'experience.txt': `
              PROFESSIONAL EXPERIENCE:

              Desenvolvedor Pleno | SERGET Mobilidade Viária | Maio 2024 - Presente
              - Gerencio novos projetos, planejamento e levantamento de requisitos
              - Coordeno e auxilio a equipe no desenvolvimento de soluções eficazes
              - Participo de reuniões com clientes para entender necessidades e definir requisitos
              - Modelei bancos de dados e implementei otimizações em sistemas críticos

              Desenvolvedor Júnior | SERGET Mobilidade Viária | Junho 2023 - Maio 2024
              - Auxiliei na implantação de nosso sistema em um grande cliente
              - Colaborei na adaptação das metodologias ágeis às necessidades da equipe.
              - Realizei a migração da infraestrutura (Linux) de produção para outro servidor

              Desenvolvedor Trainee | SERGET Mobilidade Viária | Fevereiro 2022 - Junho 2023
              - Desenvolvi e mantive aplicações web escaláveis
              - Implementei melhorias que reduziram custos e aumentaram produtividade utilizando IA
              - Participei do desenvolvimento de novas funcionalidades em diversos sistemas

              Estagiário | SERGET Mobilidade Viária | Julho 2021 - Fevereiro 2022
              - Primeira experiência profissional na área
              - Trabalhei na manutenção e no desenvolvimento de pequenas novas funcionalidades em diversos sistemas
              - Atuei com metodologias ágeis (Scrum/Kanban)
              `,
    'projects.txt': `
              NOTABLE PROJECTS:

              Automata Sandbox
              - Projeto de Conclusão de Curso focado na modelagem e simulação de autômatos finitos determinísticos (AFD)
              - Desenvolvi uma aplicação web interativa para solucionar limitações encontradas em softwares similares utilizados durante minha graduação
              - O software foi bem recebido por professores, que passaram a utilizá-lo em sala de aula para ensinar teoria dos autômatos
              - A análise de usabilidade pelo método SUS indicou uma alta aceitação, alcançando um escore acima de "ótimo", comprovando sua aplicabilidade acadêmica
              - Produzi um artigo técnico de 20 páginas detalhando o software, suas motivações, aplicações e resultados obtidos
              - Tecnologias: React, TypeScript, P5.js

              Automação de Processos com IA
              - Desenvolvi uma solução baseada em IA para otimizar processamento de dados
              - Reduzi custos operacionais em 40% e aumentei produtividade com menos de 5% de erro
              - Tecnologias: C#, SQL Server, APIs de IA

          `,
    'contact.txt': `
              GET IN TOUCH:

              Email: rafaelmirandaferreira@outlook.com
              LinkedIn: linkedin.com/in/rafael-miranda-ferreira/
              GitHub: github.com/RafaelMFerreira/
              Portfolio: www.rafaelmirandaferreira.com

              Sinta-se à vontade para entrar em contato para colaborações, oportunidades ou simplesmente para bater um papo sobre tecnologia!
              `,
  };

  private availableCommands: TerminalCommand[] = [
    {
      name: 'ls',
      description: 'List available files',
      action: () => Object.keys(this.portfolioContent).join('  ')
    },
    {
      name: 'cat',
      description: 'Display file contents',
      action: (args: any) => {
        const filename = args[0];
        if (this.portfolioContent[filename]) {
          return this.portfolioContent[filename];
        }
        return `cat: ${filename}: No such file or directory`;
      }
    },
    {
      name: 'about',
      description: 'Show information about me',
      action: () => this.portfolioContent['about.txt']
    },
    {
      name: 'skills',
      description: 'Display my technical skills',
      action: () => this.portfolioContent['skills.txt']
    },
    {
      name: 'experience',
      description: 'Show my professional experience',
      action: () => this.portfolioContent['experience.txt']
    },
    {
      name: 'projects',
      description: 'List my notable projects',
      action: () => this.portfolioContent['projects.txt']
    },
    {
      name: 'contact',
      description: 'Display my contact information',
      action: () => this.portfolioContent['contact.txt']
    },
    {
      name: 'sudo',
      description: 'Run command as administrator',
      action: (args) => {
        if (args[0] === 'su') {
          return `
          ==============================================
          🔒 ACCESS DENIED 🔒

          Nice try! You don't have the proper clearance.
          ==============================================
          `;
        }
        return `sudo: command not found: ${args.join(' ')}`;
      }
    },
    {
      name: 'shutdown',
      description: 'Shutdown the system',
      action: () => 'Shutting down system...'
    }
  ];

  constructor() {}

  getCommands(): TerminalCommand[] {
    return this.availableCommands;
  }

  addCommand(command: TerminalCommand): void {
    // Check if command already exists
    const existingIndex = this.availableCommands.findIndex(c => c.name === command.name);
    if (existingIndex >= 0) {
      // Replace existing command
      this.availableCommands[existingIndex] = command;
    } else {
      // Add new command
      this.availableCommands.push(command);
    }
  }

  removeCommand(commandName: string): void {
    this.availableCommands = this.availableCommands.filter(c => c.name !== commandName);
  }

  updatePortfolioContent(key: string, content: string): void {
    this.portfolioContent[key] = content;
  }
}
