export const environment = {
  production: true,
  baseUrl: '/portfolio-terminal',
  // Caminho do currículo em PDF (ex.: `${baseUrl}/assets/documents/resume.pdf`).
  // Vazio = o comando download e o link de currículo ficam ocultos/avisam que não há arquivo.
  resumeUrl: '',
  bootSequence: {
    initialDelay: 2200,   // Initial delay before name appears (ms)
    messageDelay: 100,    // Delay between boot messages (ms)
    typingSpeed: 10,      // Speed of typing animation (ms)
    finalDelay: 1000,     // Final delay before showing terminal (ms)
  }
}; 