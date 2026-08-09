// Arquivo principal de JavaScript (entry point) para o Vite

// 1. Importa o CSS principal e essencial para todas as páginas.
import './style.css';
import './swal-custom.css';
import themeAudio from '/src/assets/theme.mp3';

// Estilos para o painel de administração, que agora é carregado na página principal
import './admin.css';

// 2. Importa os scripts essenciais para o funcionamento da PÁGINA PRINCIPAL (index.html).
// Estes scripts são seguros e verificados para não quebrar o site.

// Controla a tela de carregamento (preloader). Essencial para a página aparecer.
import './preloader.js';

// Controla o contador de jogadores no cabeçalho.
import './player-count.js';

// Controla interações específicas da index.html, como modais.
import './script.js';

// Importa o script de autenticação
import './auth.js';

// NOTA: Scripts e CSS de outras páginas (como constituicao, leis, etc.)
// NÃO devem ser importados aqui. Eles devem ser carregados apenas nas suas respectivas páginas
// para evitar conflitos e erros como o que causou a tela preta.

// NOTA: Scripts e CSS de outras páginas (como constituicao, leis, etc.)
// NÃO devem ser importados aqui. Eles devem ser carregados apenas nas suas respectivas páginas
// para evitar conflitos e erros como o que causou a tela preta.

document.addEventListener('DOMContentLoaded', () => {

    // ==================================================
    // --- INICIALIZADOR DE MÓDULOS ---
    // ==================================================
    // Este código verifica quais elementos existem na página e inicializa
    // os módulos correspondentes para evitar erros em páginas diferentes.

    const initializers = {
        '.music-player': initMusicPlayer,
        '#governo-button': initGovernoDropdown,
    };

    // Percorre os seletores e executa a função de inicialização se o elemento existir
    for (const selector in initializers) {
        if (document.querySelector(selector)) {
            initializers[selector]();
        }
    }
});

// ==================================================
// --- LÓGICA DO PLAYER DE MÚSICA ---
// ==================================================
function initMusicPlayer() {
    const musicPlayer = document.querySelector('.music-player');
    const audio = new Audio(themeAudio);
    const playPauseBtn = musicPlayer.querySelector('.play-pause-btn');
    const artworkPlayBtn = musicPlayer.querySelector('.player-artwork');
    const progressContainer = musicPlayer.querySelector('.progress-container');
    const progress = musicPlayer.querySelector('.progress');
    const currentTimeEl = musicPlayer.querySelector('.current-time');
    const totalTimeEl = musicPlayer.querySelector('.total-time');
    const volumeBtn = musicPlayer.querySelector('.volume-btn');
    const volumeSlider = musicPlayer.querySelector('.volume-slider');

    let isPlaying = false;

    function setInitialVolume() {
        const volume = volumeSlider.value / 100;
        audio.volume = volume;
    }

    function togglePlay() {
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        isPlaying = !isPlaying;
        updatePlayPauseIcon();
    }

    function updatePlayPauseIcon() {
        const icon = playPauseBtn.querySelector('i');
        const artworkIcon = artworkPlayBtn.querySelector('.play-button-overlay i');
        if (isPlaying) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            artworkIcon.classList.remove('fa-play');
            artworkIcon.classList.add('fa-pause');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            artworkIcon.classList.remove('fa-pause');
            artworkIcon.classList.add('fa-play');
        }
    }

    function updateProgress() {
        const { currentTime, duration } = audio;
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            progress.style.width = `${progressPercent}%`;
            totalTimeEl.textContent = formatTime(duration);
        }
        currentTimeEl.textContent = formatTime(currentTime);
    }

    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        if (duration) {
            audio.currentTime = (clickX / width) * duration;
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function toggleVolume() {
        volumeSlider.classList.toggle('show');
    }

    function setVolume() {
        audio.volume = this.value / 100;
    }

    playPauseBtn.addEventListener('click', togglePlay);
    artworkPlayBtn.addEventListener('click', togglePlay);
    audio.addEventListener('timeupdate', updateProgress);
    progressContainer.addEventListener('click', setProgress);
    volumeBtn.addEventListener('click', toggleVolume);
    volumeSlider.addEventListener('input', setVolume);

    audio.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayPauseIcon();
        progress.style.width = '0%';
        audio.currentTime = 0;
    });

    setInitialVolume();
}

// ==================================================
// --- LÓGICA DO DROPDOWN DO GOVERNO ---
// ==================================================
function initGovernoDropdown() {
    const governoButton = document.getElementById('governo-button');
    const dropdownMenu = governoButton.nextElementSibling;

    governoButton.addEventListener('click', (e) => {
        e.preventDefault();
        dropdownMenu.classList.toggle('show');
    });

    window.addEventListener('click', (e) => {
        if (!governoButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
}


// ==================================================
// --- LÓGICA DO BOTÃO SERVIDOR DA CIDADE ---
// ==================================================
document.addEventListener('DOMContentLoaded', () => {
    const serverButton = document.querySelector('.btn-outline');
    if (serverButton) {
        serverButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.open('https://discord.gg/mYAtRRd7W7', '_blank');
        });
    }
});

// ==================================================
// --- LÓGICA DO BOTÃO LOJA VIP ---
// ==================================================
document.addEventListener('DOMContentLoaded', () => {
    const vipButton = document.querySelector('.btn-vip');
    if (vipButton) {
        vipButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Redireciona para a loja VIP externa em uma nova guia.
            window.open('https://riviera_city.hydrus.gg/', '_blank');
        });
    }
});