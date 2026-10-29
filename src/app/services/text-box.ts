/**
 * Renderizador da visualização CRT: transforma qualquer resposta em texto
 * com moldura ASCII (+==+ | +--+), como um programa de terminal faria.
 * ASCII de propósito: a fonte VT323 não tem os caracteres de caixa (╔═╗),
 * e o substituto do navegador tem outra largura, desalinhando as bordas.
 * Um renderizador só para todas as telas: novas telas não precisam de template próprio.
 */

export interface TextBlock {
  /** Título da seção, à esquerda (ex.: "[1] AUTOMATA SANDBOX"). */
  title?: string;
  /** Texto alinhado à direita na linha do título (ex.: "REACT/TS"). */
  right?: string;
  /** Parágrafos; cada um é quebrado na largura da caixa. */
  lines: string[];
}

export interface TextLink {
  label: string;
  href: string;
}

export interface TextBoxOutput {
  /** Linhas prontas para um <pre>. */
  lines: string[];
  /** Links mostrados abaixo da caixa (um <pre> não tem links clicáveis por linha). */
  links: TextLink[];
}

const INDENT = '    ';

/** Quebra um texto em linhas de no máximo `width` caracteres, sem cortar palavras quando possível. */
export function wrapText(text: string, width: number): string[] {
  if (width <= 0) return [text];
  const out: string[] = [];
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      out.push('');
      continue;
    }
    let line = '';
    for (let word of words) {
      while (word.length > width) {
        if (line) {
          out.push(line);
          line = '';
        }
        out.push(word.slice(0, width));
        word = word.slice(width);
      }
      if (!line) {
        line = word;
      } else if (line.length + 1 + word.length <= width) {
        line += ' ' + word;
      } else {
        out.push(line);
        line = word;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

function pad(text: string, width: number): string {
  return text.length >= width ? text.slice(0, width) : text + ' '.repeat(width - text.length);
}

/**
 * Monta a caixa. `cols` é a largura total em caracteres, bordas incluídas.
 */
export function renderTextBox(blocks: TextBlock[], cols: number, heading?: string): string[] {
  const total = Math.max(32, Math.floor(cols));
  const inner = total - 2;      // entre as duas bordas |
  const content = inner - 2;    // um espaço de respiro de cada lado
  const lines: string[] = [];

  const row = (text: string) => lines.push('| ' + pad(text, content) + ' |');

  if (heading) {
    const label = ` ${heading} `.slice(0, inner - 4);
    lines.push('+==' + label + '='.repeat(Math.max(0, inner - 2 - label.length)) + '+');
  } else {
    lines.push('+' + '='.repeat(inner) + '+');
  }

  blocks.forEach((block, i) => {
    if (i > 0) lines.push('+' + '-'.repeat(inner) + '+');

    if (block.title !== undefined) {
      const right = block.right ?? '';
      const fitsOnOneLine = !right || block.title.length + 2 + right.length <= content;
      if (fitsOnOneLine) {
        row(right ? pad(block.title, content - right.length) + right : block.title);
      } else {
        // Não cabe lado a lado: título em cima, detalhe embaixo, nada cortado.
        for (const piece of wrapText(block.title, content)) row(piece);
        for (const piece of wrapText(right, content - INDENT.length)) row(INDENT + piece);
      }
    }

    for (const paragraph of block.lines) {
      for (const piece of wrapText(paragraph, content - INDENT.length)) {
        row(INDENT + piece);
      }
    }
  });

  lines.push('+' + '='.repeat(inner) + '+');
  return lines;
}

// ---------------------------------------------------------------------------
// Conversão das respostas do portfólio em blocos de texto
// ---------------------------------------------------------------------------

type Lang = 'en' | 'pt';

const t = (lang: Lang, en: string, pt: string) => (lang === 'en' ? en : pt);

/** Converte uma resposta visual (`{ type, data }`) em caixa de texto + links. */
export function visualResponseToText(type: string, data: any, lang: Lang, cols: number): TextBoxOutput {
  const links: TextLink[] = [];
  let blocks: TextBlock[] = [];
  let heading = '';

  switch (type) {
    case 'project': {
      heading = t(lang, 'PROJECTS', 'PROJETOS') + ` (${data.length})`;
      blocks = data.map((p: any, i: number) => {
        if (p.demoUrl) links.push({ label: `[${i + 1}] demo`, href: p.demoUrl });
        if (p.codeUrl) links.push({ label: `[${i + 1}] ${t(lang, 'code', 'código')}`, href: p.codeUrl });
        return {
          title: `[${i + 1}] ${String(p.title).toUpperCase()}`,
          right: (p.technologies ?? []).join('/').toUpperCase(),
          lines: [p.description]
        };
      });
      break;
    }
    case 'skills': {
      heading = t(lang, 'SKILLS', 'HABILIDADES');
      blocks = data.map((c: any) => ({
        title: String(c.name).toUpperCase(),
        lines: [(c.skills ?? []).map((s: any) => s.name).join(' · ')]
      }));
      break;
    }
    case 'about': {
      heading = t(lang, 'ABOUT', 'SOBRE');
      blocks = [{ title: String(data.name).toUpperCase(), right: String(data.title).toUpperCase(), lines: [data.bio] }];
      break;
    }
    case 'experience': {
      heading = t(lang, 'EXPERIENCE', 'EXPERIÊNCIA');
      blocks = data.map((job: any) => ({
        title: `${String(job.title).toUpperCase()} · ${job.company}`,
        right: String(job.period).toUpperCase(),
        lines: (job.responsibilities ?? []).map((r: string) => '- ' + r)
      }));
      break;
    }
    case 'contact': {
      heading = t(lang, 'CONTACT', 'CONTATO');
      links.push({ label: 'email', href: 'mailto:' + data.email });
      links.push({ label: 'linkedin', href: 'https://' + data.linkedin });
      links.push({ label: 'github', href: 'https://' + data.github });
      blocks = [{
        lines: [
          data.message,
          '',
          'EMAIL ....... ' + data.email,
          'LINKEDIN .... ' + data.linkedin,
          'GITHUB ...... ' + data.github
        ]
      }];
      break;
    }
    default:
      blocks = [{ lines: [JSON.stringify(data)] }];
  }

  return { lines: renderTextBox(blocks, cols, heading), links };
}
