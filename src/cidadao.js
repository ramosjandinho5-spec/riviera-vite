import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    // Ativa os ícones do Lucide
    lucide.createIcons();

    // --- DADOS ESTRUTURADOS ---

    const data = {
        primeirosPassos: [
            { title: 'Como começar na cidade', icon: 'map', desc: 'Saiba onde pegar documentos, adquirir sua moradia e conhecer os primeiros locais da cidade.', btn: 'Começar Agora' },
            { title: 'Primeiros empregos', icon: 'briefcase', desc: 'Conheça os empregos disponíveis para novos cidadãos e comece a ganhar dinheiro rapidamente.', btn: 'Ver Empregos' },
            { title: 'Como ganhar dinheiro', icon: 'dollar-sign', desc: 'Descubra outras formas de renda, investimentos e atividades legais da cidade.', btn: 'Aprender' },
            { title: 'Dicas para iniciantes', icon: 'lightbulb', desc: 'Comandos úteis, atalhos, celular, banco e tudo para facilitar sua experiência.', btn: 'Ver Dicas' },
        ],
        documentos: [
            { name: 'CNH', desc: 'Habilitação para dirigir veículos.', req: 'RG, CPF, Exames.', icon: 'car' },
            { name: 'Porte de Armas', desc: 'Licença para porte de armas de fogo.', req: 'Testes, certidões, treinamento.', icon: 'shield' },
            { name: 'Registro de Veículos', desc: 'Documentação e emplacamento.', req: 'Nota fiscal, documentos pessoais.', icon: 'file-text' },
        ],
        empresas: [
            { title: 'Como abrir uma empresa', desc: 'Passo a passo para iniciar seu negócio.', icon: 'file-plus' },
            { title: 'Licenças e Alvarás', desc: 'Obtenha as permissões necessárias.', icon: 'award' },
            { title: 'Impostos e Tributos', desc: 'Entenda as obrigações fiscais.', icon: 'receipt' },
            { title: 'Contratação', desc: 'Guia para contratar funcionários.', icon: 'users' },
        ],
        moradia: [
            { name: 'Comprar Imóvel', desc: 'Encontre a casa dos seus sonhos.', icon: 'home' },
            { name: 'Alugar Imóvel', desc: 'Opções de aluguel na cidade.', icon: 'building' },
            { name: 'Garagens', desc: 'Estacione seu veículo com segurança.', icon: 'parking-square' },
        ],
        contatos: [
            { name: 'Polícia Militar', desc: 'Emergências e patrulhamento.', tel: '190' },
            { name: 'SAMU', desc: 'Urgências médicas.', tel: '192' },
            { name: 'Bombeiros', desc: 'Incêndios e resgates.', tel: '193' },
            { name: 'Prefeitura', desc: 'Informações e serviços.', tel: '156' },
        ],
        faq: [
            { q: 'Como conseguir meu primeiro emprego?', a: 'Explore a seção de "Primeiros Passos" e a lista de "Empregos" para ver as oportunidades e requisitos. Muitas profissões para iniciantes estão disponíveis.' },
            { q: 'Como abrir uma empresa?', a: 'Visite a seção "Empresas" para um guia completo, desde o registro inicial até a obtenção de licenças e o entendimento dos impostos.' },
            { q: 'Como comprar uma casa?', a: 'A seção "Moradia" oferece informações sobre a compra de imóveis. Recomendamos procurar uma imobiliária licenciada na cidade.' },
            { q: 'Como tirar minha CNH?', a: 'Consulte a seção "Documentos" para ver os requisitos para a CNH. O processo geralmente envolve exames médicos, teóricos e práticos no DETRAN.' },
        ]
    };

    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    function renderGrid(containerId, items, cardGenerator) {
        const container = document.querySelector(`#${containerId} .card-grid`);
        if (!container) return;
        container.innerHTML = items.map(cardGenerator).join('');
    }

    function renderAccordion(containerId, items) {
        const container = document.querySelector(`#${containerId} .accordion`);
        if (!container) return;
        container.innerHTML = items.map(item => `
            <div class="accordion-item">
                <div class="accordion-header">
                    ${item.q}
                    <i data-lucide="chevron-down" class="icon"></i>
                </div>
                <div class="accordion-content">
                    <p>${item.a}</p>
                </div>
            </div>
        `).join('');
    }

    // --- GERADORES DE CARDS ---

    const cardGenerators = {
        primeirosPassos: item => `
            <div class="card">
                <h3><i data-lucide="${item.icon}"></i> ${item.title}</h3>
                <a href="#" class="btn">Ver mais</a>
            </div>`,
        empregos: item => `
            <div class="card emprego-card">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p class="requisitos"><strong>Requisitos:</strong> ${item.requirements}</p>
                <div class="status ${item.status.toLowerCase()}">${item.status}</div>
                <a href="#" class="btn btn-ver-mais" data-details='${JSON.stringify(item)}'>Ver mais</a>
            </div>`,
        servicosPublicos: item => `
            <div class="card">
                <h3>${item.name}</h3>
                <p>${item.description || 'Descrição não disponível.'}</p>
                <p><strong>Horário:</strong> ${item.schedule || 'Não informado'}</p>
                ${item.link_url && item.link_url !== '#' ? `<button class="btn btn-servico-details" data-name="${item.name}" data-details="${item.link_url}">Saiba mais</button>` : ''}
            </div>`,
        documentos: item => `
            <div class="card">
                <h3><i data-lucide="${item.icon}"></i> ${item.name}</h3>
                <p>${item.desc}</p>
                <p><strong>Requisitos:</strong> ${item.req}</p>
                <a href="#" class="btn">Consultar</a>
            </div>`,
        empresas: item => `
            <div class="card">
                <h3><i data-lucide="${item.icon}"></i> ${item.title}</h3>
                <p>${item.desc}</p>
                <a href="#" class="btn">Ver detalhes</a>
            </div>`,
        moradia: item => `
            <div class="card">
                <h3><i data-lucide="${item.icon}"></i> ${item.name}</h3>
                <p>${item.desc}</p>
                <a href="#" class="btn">Saiba mais</a>
            </div>`,
        contatos: item => `
            <div class="card">
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
                <p><strong>Telefone:</strong> ${item.tel}</p>
                <a href="#" class="btn">Entrar em contato</a>
            </div>`,
    };

    // --- CARREGAMENTO DINÂMICO DE EMPREGOS ---
    async function loadAndRenderEmpregos() {
        const container = document.querySelector('#empregos .card-grid');
        if (!container) return;

        container.innerHTML = '<p class="loading-message">Carregando vagas...</p>';

        const { data: empregos, error } = await supabase
            .from('empregos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao carregar vagas:', error);
            container.innerHTML = '<p class="error-message">Não foi possível carregar as vagas no momento. Tente novamente mais tarde.</p>';
            return;
        }

        if (empregos.length === 0) {
            container.innerHTML = '<p class="empty-list-message">Nenhuma vaga de emprego disponível no momento.</p>';
            return;
        }

        renderGrid('empregos', empregos, cardGenerators.empregos);
        lucide.createIcons(); // Re-ativar ícones se houver algum nos cards
    }


    // --- CARREGAMENTO DINÂMICO DE SERVIÇOS PÚBLICOS ---
    async function loadAndRenderServicosPublicos() {
        const container = document.querySelector('#servicos-publicos .card-grid');
        if (!container) return;

        container.innerHTML = '<p class="loading-message">Carregando serviços...</p>';

        const { data: servicos, error } = await supabase
            .from('servicos_publicos')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Erro ao carregar serviços públicos:', error);
            container.innerHTML = '<p class="error-message">Não foi possível carregar os serviços no momento.</p>';
            return;
        }

        if (servicos.length === 0) {
            container.innerHTML = '<p class="empty-list-message">Nenhum serviço público cadastrado no momento.</p>';
            return;
        }

        renderGrid('servicos-publicos', servicos, cardGenerators.servicosPublicos);
        lucide.createIcons();
    }


    // --- RENDERIZAÇÃO INICIAL ---

    // Renderização customizada para a seção "Primeiros Passos"
    const ppContainer = document.querySelector('#primeiros-passos .card-grid');
    if (ppContainer) {
        ppContainer.className = 'primeiros-passos-grid'; // Nova classe para o grid
        ppContainer.innerHTML = data.primeirosPassos.map((item, index) => `
            <div class="card-passo">
                <div class="card-passo-header">
                    <span class="passo-numero">${String(index + 1).padStart(2, '0')}</span>
                    <i data-lucide="${item.icon}"></i>
                </div>
                <div class="card-passo-body">
                    <h3>${item.title}</h3>
                    <p>${item.desc}</p>
                </div>
                <div class="card-passo-footer">
                    <a href="#" class="btn" ${item.btn === 'Começar Agora' ? 'id="abrir-como-comecar-modal"' : ''}><i data-lucide="arrow-right"></i> ${item.btn}</a>
                </div>
            </div>
        `).join('');

        // Adicionar a nova seção "Sua Jornada" logo após o grid
        const ppSection = document.querySelector('#primeiros-passos');
        if (ppSection) {
            const jornadaHtml = `
                <div class="sua-jornada">
                    <div class="jornada-header">
                        <i data-lucide="star"></i>
                        <h3>Sua Jornada</h3>
                        <span class="jornada-percent">0%</span>
                    </div>
                    <p class="jornada-description">Complete a jornada e ganhe um brinde</p>
                    <div class="jornada-progress-bar">
                        <div class="progress" style="width: 0%;"></div>
                    </div>
                    <div class="jornada-steps">
                        <div class="step next" data-step="1"><span>1</span> Conheceu a cidade</div>
                        <div class="step" data-step="2"><span>2</span> Escolheu um emprego</div>
                        <div class="step" data-step="3"><span>3</span> Ganhou seu primeiro dinheiro</div>
                        <div class="step" data-step="4"><span>4</span> Comprou sua primeira casa</div>
                    </div>
                </div>
            `;
            ppSection.insertAdjacentHTML('beforeend', jornadaHtml);
        }
    }

    loadAndRenderEmpregos(); // Carrega os empregos dinamicamente
    loadAndRenderServicosPublicos(); // Carrega os serviços dinamicamente
    renderGrid('documentos', data.documentos, cardGenerators.documentos);
    renderGrid('empresas', data.empresas, cardGenerators.empresas);
    renderGrid('moradia', data.moradia, cardGenerators.moradia);
    renderGrid('contatos', data.contatos, cardGenerators.contatos);
    renderAccordion('faq', data.faq);

    // --- LÓGICA DO ACCORDION ---

    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            accordionItems.forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- LÓGICA DO MODAL "VER MAIS" PARA EMPREGOS ---
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('btn-ver-mais')) {
            event.preventDefault();
            const jobData = JSON.parse(event.target.dataset.details);

            Swal.fire({
                title: `<strong>${jobData.name}</strong>`,
                html: `
                    <div class="swal-job-details">
                        <div class="detail-section">
                            <strong>Descrição:</strong>
                            <p>${jobData.description}</p>
                        </div>
                        <div class="detail-section">
                            <strong>Requisitos:</strong>
                            <p>${jobData.requirements}</p>
                        </div>
                        <hr>
                        <div class="detail-section">
                            <strong>Mais Informações:</strong>
                            <p>${jobData.details || 'Não há mais detalhes disponíveis.'}</p>
                        </div>
                    </div>
                `,
                showCloseButton: true,
                focusConfirm: false,
                confirmButtonText: 'Fechar',
                confirmButtonColor: '#9333ea',
                background: '#111827',
                color: '#fff'
            });
        }

        // --- LÓGICA DO MODAL "SAIBA MAIS" PARA SERVIÇOS PÚBLICOS ---
        if (event.target.classList.contains('btn-servico-details')) {
            event.preventDefault();
            const serviceName = event.target.dataset.name;
            const serviceDetails = event.target.dataset.details;

            Swal.fire({
                title: `<strong>${serviceName}</strong>`,
                html: `<div class="swal-service-details">${serviceDetails}</div>`,
                showCloseButton: true,
                focusConfirm: false,
                confirmButtonText: 'Fechar',
                confirmButtonColor: '#9333ea',
                background: '#111827',
                color: '#fff'
            });
        }
    });

    // --- LÓGICA DOS MODAIS ---
    // A função setupModal é definida no final do arquivo e lida com a abertura/fechamento.
    // É esperado que os botões de abrir tenham os IDs correspondentes.
    setupModal('staff-modal', 'abrir-staff-modal');
    setupModal('como-comecar-modal', 'abrir-como-comecar-modal');

    // Configura o slideshow
        setupSlideshow('.passo-slideshow');

        // Configura o Lightbox
         setupLightbox();
     // --- LÓGICA DO FORMULÁRIO STAFF ---
    const staffForm = document.getElementById('staff-form');
    const discordWebhookUrl = 'https://discord.com/api/webhooks/1521680634274119770/MDNXXrZB0jzCS27pmuQV5lbTTaFQLW9c9Av7uZeuTcR5EMJSjY8P_2hClTmjtm6s9tHw';

    if (staffForm) {
        staffForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(staffForm);
            const nomeReal = formData.get('nome-real');
            const nomeCidade = formData.get('nome-cidade');
            const playerId = formData.get('player-id');
            const experiencia = formData.get('experiencia');
            const horario = formData.get('horario-disponivel');

            const payload = {
                embeds: [{
                    title: 'Nova Candidatura para Staff Recebida!',
                    color: 9699539, // Cor roxa em decimal
                    fields: [
                        { name: 'Nome Real', value: nomeReal, inline: true },
                        { name: 'Nome na Cidade', value: nomeCidade, inline: true },
                        { name: 'ID do Jogador', value: playerId, inline: true },
                        { name: 'Horários Disponíveis', value: horario, inline: false },
                        { name: 'Experiência', value: experiencia, inline: false },
                    ],
                    footer: {
                        text: `Candidatura enviada em: ${new Date().toLocaleString('pt-BR')}`
                    }
                }]
            };

            fetch(discordWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
            .then(response => {
                if (response.ok) {
                    staffForm.reset();
                    staffModal.style.display = 'none';
                    Swal.fire({
                        title: 'Sucesso!',
                        text: 'Sua candidatura foi enviada. Entraremos em contato em breve!',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        background: '#111827',
                        color: '#fff',
                        confirmButtonColor: '#9333ea'
                    });
                } else {
                    Swal.fire({
                        title: 'Erro!',
                        text: 'Houve um problema ao enviar sua candidatura. Tente novamente.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        background: '#111827',
                        color: '#fff',
                        confirmButtonColor: '#9333ea'
                    });
                }
            })
            .catch(error => {
                console.error('Erro no webhook do Discord:', error);
                Swal.fire({
                    title: 'Erro Técnico!',
                    text: 'Não foi possível conectar ao servidor. Verifique o console para detalhes.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    background: '#111827',
                    color: '#fff',
                    confirmButtonColor: '#9333ea'
                });
            });
        });
    }

    // Re-ativa os ícones após a renderização dinâmica
    lucide.createIcons();

    // --- LÓGICA DA JORNADA DO CIDADÃO ---
    const jornadaContainer = document.querySelector('.sua-jornada');
    if (jornadaContainer) {
        const steps = jornadaContainer.querySelectorAll('.step');
        const progressBar = jornadaContainer.querySelector('.jornada-progress-bar .progress');
        const progressPercent = jornadaContainer.querySelector('.jornada-percent');
        const totalSteps = steps.length;

        // Função para atualizar a UI da jornada
        function updateJornadaUI(currentStep) {
            const progress = ((currentStep - 1) / totalSteps) * 100;
            progressBar.style.width = `${progress}%`;
            progressPercent.textContent = `${Math.round(progress)}%`;

            steps.forEach(step => {
                const stepIndex = parseInt(step.dataset.step);
                step.classList.remove('active', 'next');
                if (stepIndex < currentStep) {
                    step.classList.add('completed'); // Adiciona uma classe para passos já feitos
                } else if (stepIndex === currentStep) {
                    step.classList.add('active');
                }
            });

            // Adiciona a classe 'next' para o próximo passo clicável
            const nextStep = jornadaContainer.querySelector(`.step[data-step="${currentStep}"]`);
            if (nextStep) {
                nextStep.classList.add('next');
            }
        }

        // Função para mostrar a raspadinha
        async function showRaspadinha() {
            // Busca o prêmio no banco de dados
            let premioTexto = '+R$5.000 no Banco (Padrão)'; // Prêmio padrão
            try {
                const { data, error } = await supabase
                    .from('configuracoes')
                    .select('valor')
                    .eq('chave', 'jornada_premio')
                    .single();

                if (error && error.code !== 'PGRST116') throw error; // Ignora erro se a chave não existe
                if (data && data.valor) {
                    premioTexto = data.valor;
                }
            } catch (error) {
                console.error('Erro ao buscar prêmio da jornada:', error.message);
            }

            // Dispara os confetes!
            confetti({
                particleCount: 150,
                spread: 180,
                origin: { y: 0.6 }
            });

            const discordWebhookUrl = 'https://discord.com/api/webhooks/1525479428044492863/dQrvl3PeKoMTdgiJ0j6hA97kPw_FmeYtFmt7gFIY-enfHGU7PdO1O97jEMTGuMaCKmbo';

            Swal.fire({
                title: '<span style="color: #9333ea;">Parabéns!</span>',
                html: `
                    <p>Você completou sua jornada inicial!</p>
                    <p>Raspe abaixo para revelar seu prêmio.</p>
                    <div id="scratch-container" style="position: relative; width: 250px; height: 100px; margin: 20px auto; cursor: crosshair; border-radius: 8px; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;">
                        <div id="scratch-prize" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #2a374a; color: var(--cor-sucesso); font-size: 1.2rem; font-weight: bold; border-radius: 8px;">
                            ${premioTexto}
                        </div>
                        <canvas id="scratch-canvas" width="250" height="100" style="position: absolute; top: 0; left: 0;"></canvas>
                    </div>
                    <button id="claim-prize-btn" class="btn" style="background-color: #9333ea; color: white; margin-top: 20px;">Reivindicar Prêmio</button>
                `,
                showConfirmButton: false, // O botão de fechar será adicionado dinamicamente
                background: '#111827',
                color: '#fff',
                allowOutsideClick: false,
                didOpen: () => {
                    const canvas = document.getElementById('scratch-canvas');
                    const claimBtn = document.getElementById('claim-prize-btn');
                    const swalContainer = Swal.getHtmlContainer();
                    const actions = Swal.getActions();
                    
                    // Adiciona o botão de fechar manualmente
                    const closeBtn = document.createElement('button');
                    closeBtn.innerText = 'Fechar';
                    closeBtn.className = 'swal2-confirm swal2-styled';
                    closeBtn.style.backgroundColor = '#9333ea';
                    closeBtn.onclick = () => Swal.close();
                    actions.appendChild(closeBtn);


                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#777';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    let isDrawing = false;

                    function getPos(evt) {
                        const rect = canvas.getBoundingClientRect();
                        const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
                        const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
                        return { x: clientX - rect.left, y: clientY - rect.top };
                    }

                    function scratch(e) {
                        if (!isDrawing) return;
                        e.preventDefault();
                        const pos = getPos(e);
                        ctx.globalCompositeOperation = 'destination-out';
                        ctx.beginPath();
                        ctx.arc(pos.x, pos.y, 15, 0, 2 * Math.PI);
                        ctx.fill();
                    }

                    canvas.addEventListener('mousedown', () => isDrawing = true);
                    canvas.addEventListener('mouseup', () => isDrawing = false);
                    canvas.addEventListener('mousemove', scratch);
                    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isDrawing = true; }, { passive: false });
                    canvas.addEventListener('touchend', (e) => { e.preventDefault(); isDrawing = false; }, { passive: false });
                    canvas.addEventListener('touchmove', scratch, { passive: false });

                    claimBtn.addEventListener('click', () => {
                        Swal.fire({
                            title: '<span style="color: #9333ea;">Reivindicar Prêmio</span>',
                            html: `
                                <p>Preencha seus dados para receber o prêmio.</p>
                                <input id="swal-input-name" class="swal2-input" placeholder="Seu Nome (Discord)">
                                <input id="swal-input-id" class="swal2-input" placeholder="Seu ID (no jogo)">
                            `,
                            confirmButtonText: 'Enviar',
                            confirmButtonColor: '#9333ea',
                            background: '#111827',
                            color: '#fff',
                            focusConfirm: false,
                            preConfirm: async () => {
                                const name = document.getElementById('swal-input-name').value;
                                const id = document.getElementById('swal-input-id').value;
                                if (!name || !id) {
                                    Swal.showValidationMessage(`Por favor, preencha todos os campos.`);
                                    return false;
                                }

                                // Verifica se o ID já foi recompensado
                                const { data, error } = await supabase
                                    .from('recompensas_jornada')
                                    .select('player_id')
                                    .eq('player_id', id);

                                if (error) {
                                    Swal.showValidationMessage(`Erro ao verificar o ID. Tente novamente mais tarde.`);
                                    return false;
                                }

                                if (data && data.length > 0) {
                                    Swal.showValidationMessage(`Este ID de jogador já resgatou a recompensa.`);
                                    return false;
                                }

                                return { name, id };
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                const { name, id } = result.value;
                                
                                Swal.fire({
                                    title: 'Processando...',
                                    text: 'Registrando sua reivindicação...',
                                    allowOutsideClick: false,
                                    didOpen: () => { Swal.showLoading(); }
                                });

                                // 1. TENTA INSERIR NO BANCO DE DADOS PRIMEIRO
                                supabase.from('recompensas_jornada')
                                    .insert([{ player_id: id, discord_name: name }])
                                    .then(async ({ error: insertError }) => {
                                        
                                        if (insertError) {
                                            // Se der erro, verifica se é por ID duplicado
                                            if (insertError.code === '23505') { // Código de erro para violação de chave única
                                                Swal.fire({
                                                    icon: 'error',
                                                    title: 'Oops...',
                                                    text: 'Este ID de jogador já resgatou a recompensa!',
                                                    confirmButtonColor: '#9333ea',
                                                    background: '#111827',
                                                    color: '#fff'
                                                });
                                            } else {
                                                // Outro tipo de erro no DB
                                                console.error('Falha ao salvar recompensa no DB:', insertError);
                                                Swal.fire('Erro no Registro', 'Houve um erro ao registrar. Tente novamente.', 'error');
                                            }
                                            return; // Para a execução
                                        }

                                        // 2. SE A INSERÇÃO FUNCIONOU, BUSCA O PRÊMIO ATUALIZADO E ENVIA PARA O DISCORD
                                        const { data: config, error: configError } = await supabase
                                            .from('configuracoes')
                                            .select('valor')
                                            .eq('chave', 'jornada_premio')
                                            .single();

                                        if (configError) {
                                            console.error('Erro ao buscar prêmio:', configError);
                                            // Se não conseguir buscar, usa um valor padrão para não travar o processo
                                            const premio = '+R$5.000 no Banco (Padrão)';
                                            sendToDiscord(name, id, premio);
                                            return;
                                        }

                                        const premio = config.valor;
                                        sendToDiscord(name, id, premio);
                                    });
                            }
                        });

                        async function sendToDiscord(name, id, premio) {
                            const payload = {
                                embeds: [{
                                    title: 'Reivindicação de Prêmio da Jornada!',
                                    color: 5814783, // Cor ciano
                                    fields: [
                                        { name: 'Nome (Discord)', value: name, inline: true },
                                        { name: 'ID (no jogo)', value: id, inline: true },
                                        { name: 'Prêmio', value: premio, inline: false },
                                    ],
                                    footer: { text: `Reivindicação feita em: ${new Date().toLocaleString('pt-BR')}` }
                                }]
                            };

                            try {
                                const response = await fetch(discordWebhookUrl, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(payload),
                                });

                                if (response.ok) {
                                    Swal.fire('Sucesso!', 'Seu prêmio foi reivindicado e será entregue em breve.', 'success');
                                } else {
                                    Swal.fire('Reivindicado!', 'Sua recompensa foi registrada, mas houve um erro ao notificar o Discord. Contate um admin.', 'warning');
                                }
                            } catch (error) {
                                console.error('Erro de conexão com Discord:', error);
                                Swal.fire('Reivindicado!', 'Sua recompensa foi registrada, mas a notificação falhou. Contate um admin.', 'warning');
                            }
                        }
                    });
                }
            });
        }

        // Carrega o progresso salvo
        let currentStep = parseInt(localStorage.getItem('jornadaStep') || '1');
        updateJornadaUI(currentStep);

        // Adiciona evento de clique
        jornadaContainer.addEventListener('click', (e) => {
            const clickedStep = e.target.closest('.step');
            if (clickedStep && clickedStep.classList.contains('next')) {
                const stepIndex = parseInt(clickedStep.dataset.step);
                
                if (stepIndex < totalSteps) {
                    currentStep++;
                    localStorage.setItem('jornadaStep', currentStep);
                    updateJornadaUI(currentStep);
                } else if (stepIndex === totalSteps) {
                    // Último passo
                    clickedStep.classList.remove('active', 'next');
                    clickedStep.classList.add('completed');
                    localStorage.setItem('jornadaStep', totalSteps + 1); // Marca como finalizado
                    updateJornadaUI(totalSteps + 1);
                    showRaspadinha();
                }
            }
        });
    }
});

// Função para controlar modais
function setupModal(modalId, openBtnId) {
    const modal = document.getElementById(modalId);
    const openBtn = document.getElementById(openBtnId);
    const closeBtn = modal.querySelector('.close-modal-btn');

    if (!modal || !openBtn || !closeBtn) {
        console.warn(`Modal ou botões não encontrados para ${modalId}`);
        return;
    }

    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const slides = document.querySelectorAll('.passo-slideshow .slide');
    const closeBtn = document.querySelector('.lightbox-close');

    if (!lightbox || !lightboxImg || !closeBtn) return;

    slides.forEach(slide => {
        slide.style.cursor = 'pointer';
        slide.addEventListener('click', () => {
            lightbox.style.display = 'block';
            lightboxImg.src = slide.src;
        });
    });

    function closeLightbox() {
        lightbox.style.display = 'none';
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

// Função para controlar o slideshow de passos
function setupSlideshow(containerSelector) {
    const slideshows = document.querySelectorAll(containerSelector);
    if (!slideshows.length) return;

    slideshows.forEach(slideshow => {
        const slides = slideshow.querySelectorAll('.slide');
        const prevBtn = slideshow.querySelector('.prev');
        const nextBtn = slideshow.querySelector('.next');
        let currentSlide = 0;

        if (slides.length <= 1) {
            if(prevBtn) prevBtn.style.display = 'none';
            if(nextBtn) nextBtn.style.display = 'none';
            return;
        }

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        }

        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        });

        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        });

        showSlide(currentSlide);
    });
}