
// Voice Recorder & Player Logic
const voiceSection = document.getElementById('voice-section');
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const recordingStatus = document.getElementById('recordingStatus');
const visualizerCanvas = document.getElementById('audioVisualizer');
const voiceList = document.getElementById('voiceList');

let mediaRecorder;
let audioChunks = [];
let audioContext;
let analyser;
let source;
let animationId;

// Mock Data for "Community Voices"
const mockVoices = [
    { name: "Enerji Uzmanı", message: "Güneş panellerinin verimliliği %30 arttı!", time: "2 saat önce", duration: "0:14" },
    { name: "Tesla Fan", message: "Yeni batarya teknolojisi harika görünüyor.", time: "5 saat önce", duration: "0:08" },
    { name: "Mehmet Y.", message: "Rüzgar türbinlerinin sesi sandığınızdan az.", time: "1 gün önce", duration: "0:22" }
];

function initVoiceWall() {
    renderVoices();
    setupRecorder();
}

function renderVoices() {
    // Clear list (except template if any) - simplified for this demo
    voiceList.innerHTML = '';

    // Render Mocks
    mockVoices.forEach(voice => createVoiceCard(voice, false));

    // Render Local (Stored in Session for demo)
    // Real persistence would require a backend (Firebase/Supabase)
}

function createVoiceCard(data, isLocalBlob = false) {
    const card = document.createElement('div');
    card.className = "bg-dark-card border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-amber-500/30 transition-all group";

    card.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shrink-0 shadow-lg">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        </div>
        <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
                <h4 class="text-white font-bold text-sm truncate">${data.name}</h4>
                <span class="text-[10px] text-gray-500">${data.time}</span>
            </div>
            <p class="text-gray-400 text-xs truncate mb-2">${data.message || "Ses Kaydı"}</p>
            
            <div class="flex items-center gap-3">
                <button class="play-btn w-8 h-8 rounded-full bg-white/5 hover:bg-amber-500 text-amber-500 hover:text-white flex items-center justify-center transition-all">
                    <svg class="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
                <div class="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full w-1/3 bg-gray-500 rounded-full"></div>
                </div>
                <span class="text-[10px] text-gray-500 font-mono">${data.duration}</span>
            </div>
        </div>
    `;

    // Audio Logic for newly recorded local blobs
    if (isLocalBlob && data.audioBlob) {
        const audioUrl = URL.createObjectURL(data.audioBlob);
        const audio = new Audio(audioUrl);
        const btn = card.querySelector('.play-btn');

        btn.onclick = () => {
            if (audio.paused) {
                audio.play();
                btn.innerHTML = `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`; // Pause icon
            } else {
                audio.pause();
                btn.innerHTML = `<svg class="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`; // Play icon
            }
        };

        audio.onended = () => {
            btn.innerHTML = `<svg class="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
        };
    }

    voiceList.prepend(card);
}

// Visualize Audio
function visualize() {
    const canvasCtx = visualizerCanvas.getContext('2d');
    const WIDTH = visualizerCanvas.width;
    const HEIGHT = visualizerCanvas.height;

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        animationId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = '#121212'; // Bg matches card
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;

            canvasCtx.fillStyle = `rgb(${barHeight + 100}, 158, 11)`; // Amber gradient
            canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }
    draw();
}

async function setupRecorder() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        recordBtn.disabled = true;
        recordingStatus.innerText = "Tarayıcı desteklemiyor";
        return;
    }

    recordBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Setup Visualizer
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            source = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            source.connect(analyser);
            visualize();

            // Setup Recorder
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                // Add to list
                createVoiceCard({
                    name: "Sen (Misafir)",
                    time: "Az önce",
                    message: "Sesli Kayıt",
                    duration: "0:" + Math.round(audioChunks.length * 0.5), // loose approx or needs calculation
                    audioBlob: audioBlob
                }, true);

                // Cleanup
                cancelAnimationFrame(animationId);
                const ctx = visualizerCanvas.getContext('2d');
                ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            recordBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');
            recordingStatus.classList.remove('hidden');
            recordingStatus.innerText = "Kayıt yapılıyor...";

        } catch (err) {
            console.error("Mic Error:", err);
            alert("Mikrofona erişilemedi!");
        }
    });

    stopBtn.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            recordBtn.classList.remove('hidden');
            stopBtn.classList.add('hidden');
            recordingStatus.classList.add('hidden');
        }
    });
}

document.addEventListener('DOMContentLoaded', initVoiceWall);
