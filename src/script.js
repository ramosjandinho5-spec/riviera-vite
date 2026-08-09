import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    // Código do Modal "Sobre a Cidade"
    const aboutCityBtn = document.getElementById('about-city-btn');
    const aboutCityCard = document.getElementById('about-city-card');
    const closeButton = aboutCityCard ? aboutCityCard.querySelector('.close-button') : null;

    if (aboutCityBtn && aboutCityCard && closeButton) {
        aboutCityBtn.addEventListener('click', (e) => {
            e.preventDefault();
            aboutCityCard.classList.add('active');
        });

        closeButton.addEventListener('click', () => {
            aboutCityCard.classList.remove('active');
        });

        window.addEventListener('click', (e) => {
            if (e.target === aboutCityCard) {
                aboutCityCard.classList.remove('active');
            }
        });
    }

    // Código do Modal "Quero Ser Staff"
    const openStaffModalBtn = document.getElementById('open-staff-modal-home');
    const staffModal = document.getElementById('staff-modal');
    const staffForm = document.getElementById('staff-form');
    const closeStaffModalBtn = staffModal.querySelector('.close-modal-btn');

    if (openStaffModalBtn && staffModal && closeStaffModalBtn && staffForm) {
        openStaffModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            staffModal.classList.add('active');
        });

        const closeModal = () => {
            staffModal.classList.remove('active');
        };

        closeStaffModalBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (e) => {
            if (e.target === staffModal) {
                closeModal();
            }
        });

        staffForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const webhookUrl = 'https://discord.com/api/webhooks/1521680634274119770/MDNXXrZB0jzCS27pmuQV5lbTTaFQLW9c9Av7uZeuTcR5EMJSjY8P_2hClTmjtm6s9tHw';
            
            const formData = new FormData(staffForm);
            const data = {
                nomeReal: formData.get('nome-real'),
                nomeCidade: formData.get('nome-cidade'),
                playerId: formData.get('player-id'),
                experiencia: formData.get('experiencia'),
                horario: formData.get('horario-disponivel'),
            };

            const payload = {
                username: "Candidaturas Riviera",
                avatar_url: "https://i.imgur.com/4M34hi2.png",
                embeds: [{
                    title: `Nova Candidatura de ${data.nomeCidade}`,
                    color: 9649402, // Cor roxa
                    fields: [
                        { name: "Nome Real", value: data.nomeReal, inline: true },
                        { name: "ID na Cidade", value: data.playerId, inline: true },
                        { name: "Horários Disponíveis", value: data.horario, inline: false },
                        { name: "Experiência", value: data.experiencia, inline: false },
                    ],
                    footer: { text: "Enviado em" },
                    timestamp: new Date().toISOString(),
                }]
            };

            try {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    Swal.fire({
                        title: 'Enviado!',
                        text: 'Sua candidatura foi enviada com sucesso. Boa sorte!',
                        icon: 'success',
                        confirmButtonColor: '#9333ea',
                    });
                    staffForm.reset();
                    closeModal();
                } else {
                    throw new Error(`Erro do servidor: ${response.status}`);
                }
            } catch (error) {
                console.error('Falha ao enviar webhook:', error);
                Swal.fire({
                    title: 'Erro!',
                    text: 'Não foi possível enviar sua candidatura. Tente novamente mais tarde.',
                    icon: 'error',
                    confirmButtonColor: '#9333ea',
                });
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Modal do Formulário Jurídico
    const juridicoBtn = document.getElementById('juridico-form-btn');
    if (juridicoBtn) {
        const formModal = document.getElementById('form-modal');
        const closeBtn = formModal.querySelector('.close-btn');

        juridicoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            formModal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            formModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target == formModal) {
                formModal.style.display = 'none';
            }
        });
    }

    // Modal do Formulário da Polícia
    const policiaBtn = document.getElementById('policia-form-btn');
    if (policiaBtn) {
        const policiaModal = document.getElementById('form-modal-policia');
        const closePoliciaBtn = policiaModal.querySelector('.close-btn-policia');

        policiaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            policiaModal.style.display = 'block';
        });

        closePoliciaBtn.addEventListener('click', () => {
            policiaModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target == policiaModal) {
                policiaModal.style.display = 'none';
            }
        });
    }
});

// --- INÍCIO: Carregamento Dinâmico de Notícias ---
document.addEventListener('DOMContentLoaded', async () => {
    const newsContainer = document.querySelector('.news-cards');
    if (!newsContainer) return;

    if (!supabase) {
        console.error('Cliente Supabase não encontrado.');
        // Opcional: Mostrar erro em cada placeholder
        document.querySelectorAll('.news-card-placeholder').forEach(ph => {
            ph.innerHTML = '<p>Erro de conexão.</p>';
        });
        return;
    }

    const loadNewsBySlots = async () => {
        try {
            // 1. Busca as notícias que pertencem aos slots 1, 2 ou 3.
            const { data: noticias, error } = await supabase
                .from('noticias')
                .select('*')
                .in('slot_id', [1, 2, 3]);

            if (error) throw error;

            // 2. Cria um mapa para acesso rápido às notícias pelo slot_id.
            const newsBySlot = noticias.reduce((acc, news) => {
                acc[news.slot_id] = news;
                return acc;
            }, {});

            // 3. Itera sobre os placeholders no HTML.
            document.querySelectorAll('.news-card-placeholder').forEach(placeholder => {
                const slotId = placeholder.dataset.slotId;
                const news = newsBySlot[slotId];

                // 4. Verifica se existe uma notícia para o slot atual.
                if (news) {
                    // Se existe, constrói o HTML do card completo.
                    const hasImages = news.urls_imagens && news.urls_imagens.length > 0;
                    const hasMultipleImages = hasImages && news.urls_imagens.length > 1;

                    const imageSection = hasImages
                        ? `
                        <div class="news-image-carousel" data-interval="${(news.intervalo_slide || 5) * 1000}">
                            <div class="carousel-inner">
                                ${news.urls_imagens.map((url, index) => `
                                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                        <img src="${url}" alt="Imagem da notícia: ${news.titulo}" class="news-image">
                                    </div>
                                `).join('')}
                            </div>
                            ${hasMultipleImages ? `
                                <button class="carousel-control prev">&lt;</button>
                                <button class="carousel-control next">&gt;</button>
                                <div class="carousel-indicators">
                                    ${news.urls_imagens.map((_, index) => `
                                        <span class="indicator ${index === 0 ? 'active' : ''}" data-slide-to="${index}"></span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                        `
                        : '<div class="news-image-placeholder-content"></div>';

                    const cardHTML = `
                        <div class="news-card" data-news-id="${news.id}">
                            ${imageSection}
                            <div class="news-content">
                                <h3>${news.titulo}</h3>
                                <p class="news-summary">${news.resumo || ''}</p>
                                <div class="news-full-content" style="display: none;">
                                    ${news.conteudo_completo || ''}
                                </div>
                                ${news.conteudo_completo ? `
                                    <a href="#" class="btn-form read-more-btn">
                                        Leia Mais <i class="fas fa-arrow-right"></i>
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    `;
                    // Substitui o placeholder pelo card.
                    placeholder.outerHTML = cardHTML;
                } else {
                    // Se não existe, exibe uma mensagem no placeholder.
                    placeholder.innerHTML = `
                        <div class="news-card-empty">
                            <i class="fa-regular fa-newspaper"></i>
                            <p>Aguardando publicação</p>
                        </div>
                    `;
                }
            });

            initializeCarousels();
            initializeReadMore();

        } catch (error) {
            console.error('Erro ao carregar notícias por slot:', error.message);
            document.querySelectorAll('.news-card-placeholder').forEach(ph => {
                ph.innerHTML = '<p>Falha ao carregar.</p>';
            });
        }
    };

    const initializeCarousels = () => {
        document.querySelectorAll('.news-image-carousel').forEach(carousel => {
            let currentIndex = 0;
            const items = carousel.querySelectorAll('.carousel-item');
            const indicators = carousel.querySelectorAll('.indicator');
            const totalItems = items.length;
            if (totalItems <= 1) return;

            const intervalTime = parseInt(carousel.dataset.interval, 10);
            let slideInterval;

            const showSlide = (index) => {
                items.forEach(item => item.classList.remove('active'));
                indicators.forEach(indicator => indicator.classList.remove('active'));
                items[index].classList.add('active');
                indicators[index].classList.add('active');
            };

            const nextSlide = () => {
                currentIndex = (currentIndex + 1) % totalItems;
                showSlide(currentIndex);
            };

            const prevSlide = () => {
                currentIndex = (currentIndex - 1 + totalItems) % totalItems;
                showSlide(currentIndex);
            };

            const startInterval = () => {
                if (intervalTime > 0) {
                    slideInterval = setInterval(nextSlide, intervalTime);
                }
            };

            const resetInterval = () => {
                clearInterval(slideInterval);
                startInterval();
            };

            carousel.querySelector('.next').addEventListener('click', () => {
                nextSlide();
                resetInterval();
            });

            carousel.querySelector('.prev').addEventListener('click', () => {
                prevSlide();
                resetInterval();
            });
            
            indicators.forEach(indicator => {
                indicator.addEventListener('click', (e) => {
                    const slideIndex = parseInt(e.target.dataset.slideTo, 10);
                    currentIndex = slideIndex;
                    showSlide(currentIndex);
                    resetInterval();
                });
            });

            startInterval();
        });
    };

    const initializeReadMore = () => {
        newsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('read-more-btn')) {
                e.preventDefault(); // Previne o comportamento padrão do link
                const card = e.target.closest('.news-card');
                const summary = card.querySelector('.news-summary');
                const fullContent = card.querySelector('.news-full-content');
                const button = e.target;

                const isExpanded = fullContent.style.display === 'block';

                if (isExpanded) {
                    fullContent.style.display = 'none';
                    summary.style.display = 'block';
                    button.innerHTML = 'Leia Mais <i class="fas fa-arrow-right"></i>';
                } else {
                    fullContent.style.display = 'block';
                    summary.style.display = 'none';
                    button.innerHTML = 'Leia Menos <i class="fas fa-arrow-up"></i>';
                }
            }
        });
    };

    loadNewsBySlots();
    loadRivieraTV();
});

// Função para obter detalhes do vídeo (plataforma, ID, URLs)
function getVideoDetails(url) {
    if (!url) return null;

    // Expressão regular para YouTube
    const ytRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const ytMatch = url.match(ytRegex);
    if (ytMatch && ytMatch[2].length === 11) {
        const id = ytMatch[2];
        return {
            platform: 'youtube',
            id: id,
            embedUrl: `https://www.youtube.com/embed/${id}`,
            thumbnailUrl: `https://img.youtube.com/vi/${id}/mqdefault.jpg`
        };
    }

    // Expressão regular para TikTok
    const tkRegex = /tiktok\.com\/.*\/video\/(\d+)/;
    const tkMatch = url.match(tkRegex);
    if (tkMatch && tkMatch[1]) {
        const id = tkMatch[1];
        return {
            platform: 'tiktok',
            id: id,
            embedUrl: `https://www.tiktok.com/embed/v2/${id}`,
            // TikTok não tem uma API de thumbnail simples como o YouTube, então usamos um placeholder.
            thumbnailUrl: 'https://i.imgur.com/82S525s.png' 
        };
    }

    return null; // URL não suportada
}

// Função para carregar e gerenciar a Riviera TV
async function loadRivieraTV() {
    const videoPlayer = document.querySelector('.video-player iframe');
    const playlistContainer = document.getElementById('video-playlist');

    if (!videoPlayer || !playlistContainer) {
        console.warn('Elementos da Riviera TV não encontrados nesta página.');
        return;
    }

    const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao carregar vídeos da Riviera TV:', error);
        playlistContainer.innerHTML = '<p>Não foi possível carregar os vídeos.</p>';
        return;
    }

    if (videos.length === 0) {
        playlistContainer.innerHTML = '<p>Nenhum vídeo disponível no momento.</p>';
        videoPlayer.src = '';
        return;
    }

    const mainVideo = videos[0];
    const highlightVideos = videos.filter(v => v.is_destaque === true);

    // Atualizar o player principal
    if (mainVideo) {
        const mainVideoDetails = getVideoDetails(mainVideo.url_video);
        if (mainVideoDetails) {
            videoPlayer.src = mainVideoDetails.embedUrl;
        } else {
            videoPlayer.src = ''; // Limpa se a URL for inválida ou não suportada
        }
    }

    // Limpar e reconstruir a lista de destaques
    playlistContainer.innerHTML = '';
    if (highlightVideos.length > 0) {
        highlightVideos.forEach((video) => {
            const videoDetails = getVideoDetails(video.url_video);
            if (!videoDetails) return; // Pula vídeos com URL inválida ou não suportada

            const playlistItem = document.createElement('div');
            playlistItem.classList.add('playlist-item');
            playlistItem.dataset.embedUrl = videoDetails.embedUrl; // Armazena a URL de embed completa

            playlistItem.innerHTML = `
                <img src="${videoDetails.thumbnailUrl}" alt="Thumbnail do vídeo" style="object-fit: cover;">
                <div class="playlist-info">
                    <h4>${video.titulo}</h4>
                </div>
            `;
            playlistContainer.appendChild(playlistItem);
        });
    } else {
        playlistContainer.innerHTML = '<p>Nenhum vídeo em destaque.</p>';
    }

    // Adicionar listener de clique para trocar o vídeo
    playlistContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.playlist-item');
        if (item && item.dataset.embedUrl) {
            const newEmbedUrl = item.dataset.embedUrl;
            videoPlayer.src = newEmbedUrl;
            
            document.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        }
    });
}
// --- FIM: Carregamento Dinâmico de Notícias ---