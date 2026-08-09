import { supabase } from './supabaseClient.js';

async function carregarComunicados() {
    const comunicadosGrid = document.querySelector('.comunicados-grid');
    if (!comunicadosGrid) {
        console.error('Elemento .comunicados-grid não encontrado.');
        return;
    }

    // Limpa a área antes de carregar novos dados
    comunicadosGrid.innerHTML = '<p>Carregando comunicados...</p>';

    try {
        const { data: comunicados, error } = await supabase
            .from('comunicados')
            .select('*')
            .order('created_at', { ascending: false }); // Ordena pelos mais recentes

        if (error) {
            throw error;
        }

        if (comunicados && comunicados.length > 0) {
            comunicadosGrid.innerHTML = ''; // Limpa a mensagem de "Carregando..."
            comunicados.forEach(comunicado => {
                const card = document.createElement('div');
                card.classList.add('card-comunicado');

                // Formata a data para o padrão brasileiro (dd/mm/yyyy)
                const data = new Date(comunicado.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                card.innerHTML = `
                    <div class="card-header">
                        <h3>${comunicado.titulo}</h3>
                        <span class="data">${data}</span>
                    </div>
                    <div class="card-body">
                        <span class="categoria">${comunicado.tag}</span>
                        <p>${comunicado.conteudo}</p>
                    </div>
                    <div class="card-footer">
                        <span>Autor: ${comunicado.autor}</span>
                    </div>
                `;
                comunicadosGrid.appendChild(card);
            });
        } else {
            comunicadosGrid.innerHTML = '<p>Nenhum comunicado encontrado.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar comunicados:', error);
        comunicadosGrid.innerHTML = '<p>Erro ao carregar comunicados. Tente novamente mais tarde.</p>';
    }
}


async function carregarEquipe() {
    const equipeGrid = document.querySelector('.equipe-grid');
    if (!equipeGrid) {
        console.error('Elemento .equipe-grid não encontrado.');
        return;
    }

    equipeGrid.innerHTML = '<p>Carregando equipe...</p>';

    try {
        const { data: membros, error } = await supabase
            .from('equipe_membros')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            throw error;
        }

        if (membros && membros.length > 0) {
            equipeGrid.innerHTML = '';
            membros.forEach(membro => {
                const card = document.createElement('div');
                card.classList.add('card-membro');

                const statusClass = membro.status ? membro.status.toLowerCase() : 'ausente';
                const avatarUrl = membro.avatar_url || '/src/assets/avatar-placeholder.png';

                card.innerHTML = `
                    <div class="membro-header">
                        <img src="${avatarUrl}" alt="Avatar de ${membro.nome}">
                        <div class="membro-info">
                            <h4>${membro.nome}</h4>
                            <p>${membro.cargo}</p>
                        </div>
                        <span class="status ${statusClass}">${membro.status || 'Ausente'}</span>
                    </div>
                    <div class="membro-body">
                        <p>${membro.descricao || 'Sem descrição disponível.'}</p>
                    </div>
                `;
                equipeGrid.appendChild(card);
            });
        } else {
            equipeGrid.innerHTML = '<p>Nenhum membro da equipe encontrado.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar a equipe:', error);
        equipeGrid.innerHTML = '<p>Erro ao carregar a equipe. Tente novamente mais tarde.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Página de Transparência carregada.');
    carregarComunicados();
    carregarEquipe();

    const btnConstituicao = document.getElementById('btn-constituicao');
    const btnCodigoPenal = document.getElementById('btn-codigo-penal');

    if (btnConstituicao) {
        btnConstituicao.addEventListener('click', (e) => {
            e.preventDefault();
            gerarPDF('constituicao.html', 'Constituicao_Riviera.pdf');
        });
    }

    if (btnCodigoPenal) {
        btnCodigoPenal.addEventListener('click', (e) => {
            e.preventDefault();
            gerarPDF('codigo-penal.html', 'Codigo_Penal_Riviera.pdf');
        });
    }

    // --- Lógica do Modal de Suporte ---
    const suporteModal = document.getElementById('suporte-modal');
    const openSuporteModalBtn = document.getElementById('abrir-suporte-modal');
    const closeSuporteModalBtn = document.getElementById('close-suporte-modal');
    const suporteForm = document.getElementById('suporte-form');

    if (openSuporteModalBtn && suporteModal) {
        openSuporteModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            suporteModal.style.display = 'flex';
        });
    }

    if (closeSuporteModalBtn) {
        closeSuporteModalBtn.addEventListener('click', () => {
            suporteModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === suporteModal) {
            suporteModal.style.display = 'none';
        }
    });

    if (suporteForm) {
        suporteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const ticketType = document.getElementById('ticket-type').value;
            const ticketMessage = document.getElementById('ticket-message').value;

            Swal.fire({
                title: 'Enviando chamado...',
                text: 'Por favor, aguarde.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const { data, error } = await supabase.functions.invoke('enviar-ticket-suporte', {
                    body: { ticketType, ticketMessage },
                });

                if (error) throw error;

                Swal.fire({
                    icon: 'success',
                    title: 'Chamado Enviado!',
                    text: 'Sua solicitação foi enviada com sucesso. Nossa equipe responderá em breve.',
                });
                suporteModal.style.display = 'none';
                suporteForm.reset();

            } catch (error) {
                console.error('Erro ao enviar chamado:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Ocorreu um erro ao enviar seu chamado. Tente novamente mais tarde.',
                });
            }
        });
    }

    // --- Lógica do Modal de Bug ---
    const bugModal = document.getElementById('bug-modal');
    const openBugModalBtn = document.getElementById('abrir-bug-modal');
    const closeBugModalBtn = document.getElementById('close-bug-modal');
    const bugForm = document.getElementById('bug-form');

    if (openBugModalBtn && bugModal) {
        openBugModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            bugModal.style.display = 'flex';
        });
    }

    if (closeBugModalBtn) {
        closeBugModalBtn.addEventListener('click', () => {
            bugModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === bugModal) {
            bugModal.style.display = 'none';
        }
    });

    if (bugForm) {
        bugForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const bugMessage = document.getElementById('bug-message').value;

            Swal.fire({
                title: 'Enviando relatório...',
                text: 'Por favor, aguarde.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const { data, error } = await supabase.functions.invoke('enviar-relatorio-bug', {
                    body: { bugMessage },
                });

                if (error) throw error;

                Swal.fire({
                    icon: 'success',
                    title: 'Relatório Enviado!',
                    text: 'Obrigado por nos ajudar a melhorar o Riviera!',
                });
                bugModal.style.display = 'none';
                bugForm.reset();

        } catch (error) {
            console.error('Erro ao enviar relatório de bug:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Ocorreu um erro ao enviar seu relatório. Tente novamente mais tarde.',
            });
        }
    });
}

// --- Lógica para o Modal de Sugestão ---
const sugestaoModal = document.getElementById('sugestao-modal');
const openSugestaoModalBtn = document.getElementById('abrir-sugestao-modal');
const closeSugestaoModalBtn = document.getElementById('close-sugestao-modal');
const sugestaoForm = document.getElementById('sugestao-form');

if (openSugestaoModalBtn) {
    openSugestaoModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sugestaoModal.style.display = 'block';
    });
}

if (closeSugestaoModalBtn) {
    closeSugestaoModalBtn.addEventListener('click', () => {
        sugestaoModal.style.display = 'none';
    });
}

if (sugestaoModal) {
    window.addEventListener('click', (event) => {
        if (event.target == sugestaoModal) {
            sugestaoModal.style.display = 'none';
        }
    });
}

if (sugestaoForm) {
    sugestaoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const sugestaoMessage = document.getElementById('sugestao-message').value;

        Swal.fire({
            title: 'Enviando sugestão...',
            text: 'Por favor, aguarde.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const { data, error } = await supabase.functions.invoke('enviar-sugestao', {
                body: { sugestaoMessage },
            });

            if (error) throw error;

            Swal.fire({
                icon: 'success',
                title: 'Sugestão Enviada!',
                text: 'Obrigado por sua contribuição para o Riviera!',
            });
            sugestaoModal.style.display = 'none';
            sugestaoForm.reset();

        } catch (error) {
            console.error('Erro ao enviar sugestão:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Ocorreu um erro ao enviar sua sugestão. Tente novamente mais tarde.',
            });
        }
    });
}
});

async function gerarPDF(url, nomeArquivo) {
    const { jsPDF } = window.jspdf;

    try {
        // Exibe um loader/feedback para o usuário
        Swal.fire({
            title: 'Gerando PDF...',
            text: 'Por favor, aguarde enquanto preparamos seu documento.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch(url);
        const htmlString = await response.text();

        // Cria um elemento temporário para renderizar o HTML
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px'; // Posiciona fora da tela
        container.innerHTML = htmlString;
        document.body.appendChild(container);

        // Encontra o elemento principal de conteúdo dentro do HTML carregado
        const contentElement = container.querySelector('main') || container; // Tenta encontrar <main>, senão usa o container todo

        const canvas = await html2canvas(contentElement, {
            scale: 2, // Aumenta a resolução da imagem
            useCORS: true
        });

        document.body.removeChild(container); // Remove o container temporário

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(nomeArquivo);

        Swal.close(); // Fecha o loader

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Ocorreu um erro ao gerar o PDF. Tente novamente.',
        });
    }
}