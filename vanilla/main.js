const words = [
  'lago', 'lapiz', 'lata', 'leche', 'lechuza', 'lengua',
  'lentes', 'libro', 'limon', 'lobo', 'luna', 'lupa'
];

const questionAudio = new Audio('../media/que imagen es esta.webm');
const correctAudio = new Audio('../media/correcto.webm');

let recognition;
let selectedWord = null;
let spinning = false;
let rotation = 0;
let speed = 0;

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin');
const resultP = document.getElementById('result');
const segAngle = 2 * Math.PI / words.length;

drawWheel(0);

spinBtn.addEventListener('click', spin);

function drawWheel(angle) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const radius = canvas.width / 2 - 20;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  for (let i = 0; i < words.length; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, i * segAngle, (i + 1) * segAngle);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? '#fdd835' : '#fbc02d';
    ctx.fill();
    ctx.save();
    ctx.rotate(i * segAngle + segAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(words[i], radius - 10, 10);
    ctx.restore();
  }
  ctx.restore();
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.moveTo(cx, cy - radius - 10);
  ctx.lineTo(cx - 10, cy - radius - 30);
  ctx.lineTo(cx + 10, cy - radius - 30);
  ctx.closePath();
  ctx.fill();
}

function spin() {
  if (spinning) return;
  resultP.textContent = '';
  selectedWord = null;
  spinning = true;
  speed = Math.random() * 0.2 + 0.3;
  requestAnimationFrame(animate);
}

function animate() {
  rotation += speed;
  rotation %= 2 * Math.PI;
  speed *= 0.97;
  drawWheel(rotation);
  if (speed > 0.003) {
    requestAnimationFrame(animate);
  } else {
    spinning = false;
    const index = Math.floor(((2 * Math.PI - rotation) % (2 * Math.PI)) / segAngle);
    selectedWord = words[index];
    askQuestion();
  }
}

function askQuestion() {
  questionAudio.play();
  questionAudio.onended = startRecognition;
}

function startRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('SpeechRecognition no soportado en este navegador');
    return;
  }
  if (!recognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = handleResult;
  }
  recognition.start();
}

function handleResult(e) {
  const transcript = e.results[0][0].transcript.toLowerCase();
  if (transcript.includes(selectedWord)) {
    correctAudio.play();
    resultP.textContent = `\u00a1Correcto! Era "${selectedWord}".`;
  } else {
    resultP.textContent = `Escuch\u00e9: "${transcript}". Int\u00e9ntalo de nuevo.`;
  }
}
