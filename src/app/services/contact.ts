export interface ContactDraft {
  name: string;
  email: string;
  message: string;
}

/**
 * O site é estático (sem servidor), então o formulário abre o app de email
 * do visitante com a mensagem já preenchida.
 */
export function buildContactMailto(to: string, draft: ContactDraft): string {
  const name = draft.name.trim();
  const subject = name ? `Contato pelo portfólio: ${name}` : 'Contato pelo portfólio';
  const lines = [draft.message.trim()];
  if (name || draft.email.trim()) {
    lines.push('', '—', [name, draft.email.trim()].filter(Boolean).join(' · '));
  }
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}
