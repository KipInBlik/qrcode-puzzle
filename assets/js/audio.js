/* ==========================================================================
   AUDIO ENGINE (AETHERIA)
   ========================================================================== */

const AudioEngine = {
  bgAudio: null,
  isInitialized: false,

  initBackgroundAudio(filePath) {
    this.bgAudio = new Audio(filePath);
    this.bgAudio.loop = false; // <-- Slechts 1x afspelen!
    this.bgAudio.volume = 0.6;

    this.bgAudio.onerror = (e) => {
      console.error("AUDIO FOUT: Kan het bestand niet vinden op pad:", filePath, e);
    };

    const startAudio = () => {
      if (!this.isInitialized && this.bgAudio) {
        this.bgAudio.play().then(() => {
          console.log("Audio gestart (1x)...");
          this.isInitialized = true;
          
          // Verwijder klik-luisteraars zodra het afspelen start
          window.removeEventListener('click', startAudio);
          window.removeEventListener('touchstart', startAudio);
        }).catch(err => {
          console.error("Fout bij afspelen van audio:", err);
        });
      }
    };

    window.addEventListener('click', startAudio);
    window.addEventListener('touchstart', startAudio);
  },

  stopBackgroundAudio() {
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.currentTime = 0;
    }
  }
};