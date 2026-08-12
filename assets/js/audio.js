/* ==========================================================================
   AUDIO ENGINE (AETHERIA)
   ========================================================================== */

const AudioEngine = {
  // Speelt het meegegeven audio-element exact 1x af
  playOnce(audioElementId) {
    const audio = document.getElementById(audioElementId);
    
    if (!audio) {
      console.error("Audio element niet gevonden:", audioElementId);
      return;
    }

    // Reset naar het begin mocht het fragment al eens gespeeld zijn
    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;

    audio.play().catch(err => {
      console.error("Fout bij afspelen audio:", err);
    });
  }
};