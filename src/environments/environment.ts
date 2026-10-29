export const environment = {
  production: false,
  baseUrl: '',
  // Caminho do currículo em PDF (ex.: `${baseUrl}/assets/documents/resume.pdf`).
  // Vazio = o comando download e o link de currículo ficam ocultos/avisam que não há arquivo.
  resumeUrl: '',
  bootSequence: {
    initialDelay: 100,    // Initial delay before name appears (ms)
    messageDelay: 20,     // Delay between boot messages (ms)
    typingSpeed: 0.5,       // Speed of typing animation (ms)
    finalDelay: 100,      // Final delay before showing terminal (ms)
  }
}; 