export interface TerminalTheme {
    name: string;
    /** Fundo principal do terminal. */
    background: string;
    /** Fundo de painéis, linha selecionada, barras. */
    surface: string;
    /** Bordas e divisórias. */
    border: string;
    /** Texto principal. */
    foreground: string;
    /** Texto secundário (dicas, rótulos). Precisa manter contraste de 4.5:1 com o fundo. */
    muted: string;
    /** Cor do prompt `visitante@rmf`. */
    promptColor: string;
    /** Destaques: títulos de painel, atalhos, links. */
    accent: string;
    fontFamily: string;
}

/** Cores de fósforo da visualização CRT: independentes dos temas do terminal moderno. */
export interface Phosphor {
    name: string;
    background: string;
    foreground: string;
    /** Texto secundário. Precisa manter contraste de 4.5:1 com o fundo. */
    dim: string;
    glow: string;
}
