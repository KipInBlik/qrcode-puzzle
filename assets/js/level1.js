/* ==========================================================================
   LEVEL 1: GATEWAY LOGIC (AETHERIA)
   ========================================================================== */

// 1. SHA-256 Hashes voor goedgekeurde antwoorden ("spiegel" en "mirror")
const ALLOWED_HASHES = [
  "76d8b2d4f2a71d020d5c0b1bb64b38d350b3294326f63459e74bb34614c2b291", // "spiegel"
  "934a530e38692694b92b6a2f721ec15a20120f26e5a409748e91ff2c9e7a83bf"  // "mirror"
];

// DOM Elementen
const form = document.getElementById('level1-form');
const passInput = document.getElementById('pass-input');
const statusMsg = document.getElementById('status-msg');

/* ==========================================================================
   2. INITIALISEER AUDIO
   ========================================================================== */
// Start de morse-code achtergrondaudio zodra het script laadt
AudioEngine.initBackgroundAudio('assets/audio/morse.wav');

/* ==========================================================================
   3. SHA-256 HASHING HELPER
   ========================================================================== */
async function hashInput(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ==========================================================================
   4. FORMULIER & WACHTWOORD VALIDATIE
   ========================================================================== */
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const userInput = passInput.value;
  if (!userInput) return;

  // Genereer hash van de ingevoerde tekst
  const inputHash = await hashInput(userInput);

  // Controleer de hash
  if (ALLOWED_HASHES.includes(inputHash)) {
    // SUCCES
    statusMsg.textContent = "REFLECTION VERIFIED. ACCESS GRANTED...";
    statusMsg.style.color = "#00ff66";
    passInput.disabled = true;

    // Stop het morse-geluid
    AudioEngine.stopBackgroundAudio();

    // Na 1.5 seconde doorsturen naar Level 2
    setTimeout(() => {
      window.location.href = "level2.html";
    }, 1500);

  } else {
    // FOUTMELDING
    statusMsg.textContent = "SIGNAL DISTORTION: ECHO MISMATCH";
    statusMsg.style.color = "#ff003c";
    
    // Invoerveld leegmaken en herfocussen
    passInput.value = "";
    passInput.focus();
  }
});