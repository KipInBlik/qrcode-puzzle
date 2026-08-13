/* ==========================================================================
   LEVEL 1: GATEWAY LOGIC (AETHERIA)
   ========================================================================== */

const ALLOWED_HASHES = [
  "76d8b2d4f2a71d020d5c0b1bb64b38d350b3294326f63459e74bb34614c2b291", 
  "934a530e38692694b92b6a2f721ec15a20120f26e5a409748e91ff2c9e7a83bf", 
  "00154761637ca746c354a6d9cfbf1da1a92e79afa6bb127bb8a1c434e9c73170"  
];

const form = document.getElementById('level1-form');
const passInput = document.getElementById('pass-input');
const statusMsg = document.getElementById('status-msg');

async function hashInput(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const userInput = passInput.value;
  if (!userInput) return;

  const inputHash = await hashInput(userInput);

  if (ALLOWED_HASHES.includes(inputHash)) {
    statusMsg.textContent = "REFLECTION VERIFIED. ACCESS GRANTED...";
    statusMsg.style.color = "#00ff66";
    passInput.disabled = true;

    setTimeout(() => {
      window.location.href = "level2.html";
    }, 1500);

  } else {
    statusMsg.textContent = "SIGNAL DISTORTION: ECHO MISMATCH";
    statusMsg.style.color = "#ff003c";
    
    AudioEngine.playOnce('morse-audio');

    passInput.value = "";
    passInput.focus();
  }
});