import { codigoCivil as crimesCivis } from './data/codigo-civil-data.js';

document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('search-crime');
    const resultadosLista = document.getElementById('resultados-lista');
    const categoriasContainer = document.querySelector('.cards-categorias');
    const maisUtilizadosContainer = document.querySelector('.cards-mais-utilizados');
    const resumoLista = document.getElementById('resumo-lista');
    const penaTotalEl = document.getElementById('pena-total');
    const multaTotalEl = document.getElementById('multa-total');
    const fiancaTotalEl = document.getElementById('fianca-status');
    const artigosTotalEl = document.getElementById('artigos-total');
    const btnCopiar = document.querySelector('.btn-copiar');
    const btnLimpar = document.querySelector('.btn-limpar');
    const btnSalvar = document.querySelector('.btn-salvar');
    const btnPdf = document.querySelector('.btn-pdf');
    const prisoesSalvasLista = document.getElementById('prisoes-salvas-lista');
    const seletorCodigo = document.getElementById('seletor-codigo');

    // Variáveis do Modal
    const idModal = document.getElementById('id-modal');
    const playerIdInput = document.getElementById('player-id-input');
    const confirmIdBtn = document.getElementById('confirm-id-btn');
    const closeModalBtn = document.querySelector('.close-modal-btn');

    // Variáveis do Modal de Salvamento
    const saveModal = document.getElementById('save-modal');
    const saveNameInput = document.getElementById('save-name-input');
    const confirmSaveBtn = document.getElementById('confirm-save-btn');
    const cancelSaveBtn = document.getElementById('cancel-save-btn');
    const closeSaveModalBtn = saveModal.querySelector('.close-modal-btn');

    const codigoMap = {
        penal: { file: 'codigo-penal.html', name: 'Código Penal' },
        transito: { file: 'codigo-de-transito.html', name: 'Código de Trânsito' },
        civil: { file: 'codigo-civil.html', name: 'Código Civil' }
    };

    let masterCrimesList = [];
    let crimes = []; // Crimes do código atualmente selecionado
    let todasAsCategorias = []; // Categorias do código atualmente selecionado
    let crimesAdicionados = [];
    let prisoesSalvas = JSON.parse(localStorage.getItem('prisoesSalvas')) || {};
    let jogadorId = null;
    let crimePendente = null; // Armazena o crime a ser adicionado após a inserção do ID


    // Pré-carrega todos os dados dos códigos
    async function preloadAllData() {
        try {
            // Carrega dados do Penal e Trânsito via HTML parsing
            const promises = Object.entries(codigoMap)
                .filter(([codigoId]) => codigoId !== 'civil') // Ignora o civil aqui
                .map(async ([codigoId, { file }]) => {
                    const response = await fetch(file);
                    if (!response.ok) {
                        console.error(`Erro ao carregar ${file}: ${response.statusText}`);
                        return [];
                    }
                    const text = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, 'text/html');
                    const sections = doc.querySelectorAll('.crime-section');
                    const crimesDoCodigo = [];

                    sections.forEach(section => {
                        const categoriaNome = section.querySelector('h2').textContent.trim();
                        const tbody = section.querySelector('.crime-table tbody');
                        if (!tbody) return;
                        const linhas = tbody.querySelectorAll('tr');

                        linhas.forEach(linha => {
                            const colunas = linha.querySelectorAll('td');
                            if (colunas.length >= 5) {
                                crimesDoCodigo.push({
                                    codigo: codigoId,
                                    categoria: categoriaNome,
                                    artigo: colunas[0].textContent.trim(),
                                    nome: colunas[1].textContent.trim(),
                                    pena: colunas[2].textContent.trim(),
                                    multa: colunas[3].textContent.trim(),
                                    fianca: colunas[4].textContent.trim(),
                                    resumo: colunas[5] ? colunas[5].textContent.trim() : ''
                                });
                            }
                        });
                    });
                    return crimesDoCodigo;
                });

            const resultadosHtml = await Promise.all(promises);
            let crimesCarregados = resultadosHtml.flat();

            // Processa e adiciona os crimes do Código Civil a partir do data.js
            const crimesCivisFormatados = crimesCivis.map(crime => ({
                codigo: 'civil',
                categoria: crime.categoria,
                artigo: crime.numero,
                nome: crime.titulo,
                pena: '0', // Código Civil não tem pena de prisão
                multa: crime.multa.replace(/R\$|\./g, '').split(',')[0].trim(), // Extrai o valor numérico da multa
                fianca: '-', // Código Civil não tem fiança
                resumo: crime.descricao
            }));

            masterCrimesList = [...crimesCarregados, ...crimesCivisFormatados];
            
            if (masterCrimesList.length === 0) {
                console.error("Nenhum crime foi carregado. Verifique os arquivos HTML, os seletores e o data.js.");
                resultadosLista.innerHTML = '<p>Falha crítica: Não foi possível carregar nenhum dado. Verifique o console para mais detalhes.</p>';
            }

        } catch (error) {
            console.error('Erro crítico ao pré-carregar todos os dados:', error);
            resultadosLista.innerHTML = '<p>Ocorreu um erro ao carregar os dados. Tente recarregar a página.</p>';
        }
    }

    // Configura a visualização para um código específico
    function switchCodeView(codigoId) {
        crimes = masterCrimesList.filter(c => c.codigo === codigoId);
        
        const categoriasUnicas = new Set(crimes.map(c => c.categoria));
        todasAsCategorias = [...categoriasUnicas];

        renderCategorias();
        renderResultados(crimes);
        // Os listeners dos mais utilizados podem precisar ser re-adicionados se forem dinâmicos
        adicionarListenersMaisUtilizados(); 
    }

    seletorCodigo.addEventListener('change', (e) => {
        switchCodeView(e.target.value);
    });

    async function initialize() {
        await preloadAllData();
        // Carrega a visualização inicial com o valor selecionado no dropdown (padrão: penal)
        switchCodeView(seletorCodigo.value);
        renderPrisoesSalvas();
    }


    function renderCategorias() {
        categoriasContainer.innerHTML = '';
        todasAsCategorias.forEach(categoria => {
            const card = document.createElement('div');
            card.className = 'card-categoria';
            card.textContent = categoria;
            card.addEventListener('click', () => {
                const crimesFiltrados = crimes.filter(crime => crime.categoria === categoria);
                renderResultados(crimesFiltrados);
            });
            categoriasContainer.appendChild(card);
        });
    }

    function renderResultados(resultados) {
        resultadosLista.innerHTML = '';
        if (resultados.length === 0) {
            resultadosLista.innerHTML = '<p>Nenhum crime encontrado.</p>';
            return;
        }

        resultados.forEach(crime => {
            const item = document.createElement('div');
            item.className = 'resultado-item';
            item.innerHTML = `
                <div class="resultado-header">
                    <span class="artigo">${crime.artigo}</span>
                    <span class="nome-crime">${crime.nome}</span>
                </div>
                <p class="resumo">${crime.resumo}</p>
                <div class="resultado-detalhes">
                    <span>Pena: ${crime.pena}</span>
                    <span>Multa: ${crime.multa}</span>
                </div>
                <button class="btn-adicionar">Adicionar</button>
            `;
            item.querySelector('.btn-adicionar').addEventListener('click', () => adicionarAoResumo(crime));
            resultadosLista.appendChild(item);
        });
    }

    function adicionarAoResumo(crime) {
        // Se nenhum crime foi adicionado ainda e não temos um ID, pede o ID primeiro.
        if (crimesAdicionados.length === 0 && !jogadorId) {
            crimePendente = crime; // Guarda o crime que o usuário quer adicionar
            idModal.style.display = 'flex';
            playerIdInput.focus();
            return; // Interrompe a função aqui
        }

        if (crimesAdicionados.find(c => c.artigo === crime.artigo && c.codigo === crime.codigo)) {
            alert('Este crime já foi adicionado.');
            return;
        }
        crimesAdicionados.push(crime);
        renderResumo();
        calcularTotais();
    }

    function removerDoResumo(artigo) {
        const itemParaRemover = resumoLista.querySelector(`[data-artigo="${artigo}"]`);
        if (itemParaRemover) {
            itemParaRemover.classList.add('fade-out');
            itemParaRemover.addEventListener('animationend', () => {
                crimesAdicionados = crimesAdicionados.filter(c => c.artigo !== artigo);
                renderResumo();
                calcularTotais();
            }, { once: true });
        } else {
            // Fallback para o caso de o elemento não ser encontrado
            crimesAdicionados = crimesAdicionados.filter(c => c.artigo !== artigo);
            renderResumo();
            calcularTotais();
        }
    }

    function renderResumo() {
        resumoLista.innerHTML = '';
        crimesAdicionados.forEach(crime => {
            const item = document.createElement('div');
            item.className = 'resumo-item fade-in';
            item.dataset.artigo = crime.artigo;
            item.innerHTML = `
                <div class="resumo-item-header">
                    <strong>${crime.artigo}</strong>
                    <button class="btn-remover">Remover</button>
                </div>
                <p>${crime.nome}</p>
                <div class="resumo-item-detalhes">
                    <span>Pena: ${crime.pena}</span>
                    <span>Multa: ${crime.multa}</span>
                </div>
            `;
            item.querySelector('.btn-remover').addEventListener('click', () => removerDoResumo(crime.artigo));
            resumoLista.appendChild(item);
        });
    }

    function calcularTotais() {
        const penaTotal = crimesAdicionados.reduce((acc, crime) => acc + parseInt(crime.pena), 0);
        const multaTotal = crimesAdicionados.reduce((acc, crime) => acc + parseInt(crime.multa.replace(/\./g, '')), 0);
        
        const contemInafiancavel = crimesAdicionados.some(crime => crime.fianca.trim() === '-');
        
        let fiancaTotal;
        if (contemInafiancavel) {
            fiancaTotal = 'Não Aplicável';
        } else {
            const fiancaSoma = crimesAdicionados.reduce((acc, crime) => acc + parseInt(crime.fianca.replace(/\./g, '')), 0);
            fiancaTotal = `R$ ${fiancaSoma.toLocaleString('pt-BR')}`;
        }

        penaTotalEl.textContent = penaTotal;
        multaTotalEl.textContent = `R$ ${multaTotal.toLocaleString('pt-BR')}`;
        fiancaTotalEl.textContent = fiancaTotal;
        artigosTotalEl.textContent = crimesAdicionados.length;
    }
    
    function adicionarListenersMaisUtilizados() {
        const cards = maisUtilizadosContainer.querySelectorAll('.card-utilizado');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const nomeCrime = card.textContent.substring(2).trim();
                const crime = crimes.find(c => c.nome === nomeCrime);
                if (crime) {
                    adicionarAoResumo(crime);
                }
            });
        });
    }

    btnCopiar.addEventListener('click', () => {
        if (crimesAdicionados.length === 0) {
            alert("Adicione pelo menos um crime ao resumo antes de copiar.");
            return;
        }

        let resumoTexto = `**Resumo da Ocorrência**\n`;
        resumoTexto += `**ID do Indivíduo:** ${jogadorId}\n`;
        resumoTexto += `**Data:** ${new Date().toLocaleString('pt-BR')}\n\n`;

        crimesAdicionados.forEach(crime => {
            resumoTexto += `**Código:** ${codigoMap[crime.codigo].name}\n`;
            resumoTexto += `**Artigo:** ${crime.artigo} - ${crime.nome}\n`;
            resumoTexto += `Pena: ${crime.pena} | Multa: ${crime.multa} | Fiança: ${crime.fianca}\n\n`;
        });

        resumoTexto += '---\n';
        resumoTexto += `**Pena Total:** ${penaTotalEl.textContent} meses\n`;
        resumoTexto += `**Multa Total:** ${multaTotalEl.textContent}\n`;
        resumoTexto += `**Status da Fiança:** ${fiancaTotalEl.textContent}\n`;
        resumoTexto += `**Total de Artigos:** ${artigosTotalEl.textContent}\n`;

        const textarea = document.createElement('textarea');
        textarea.value = resumoTexto;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            btnCopiar.textContent = 'Copiado!';
            btnCopiar.classList.add('copied');
        } catch (err) {
            console.error('Erro ao copiar: ', err);
            alert('Não foi possível copiar o resumo.');
        }
        document.body.removeChild(textarea);

        setTimeout(() => {
            btnCopiar.textContent = 'Copiar Resultado';
            btnCopiar.classList.remove('copied');
        }, 2000);
    });

    btnPdf.addEventListener('click', () => {
        if (crimesAdicionados.length === 0) {
            alert("Adicione pelo menos um crime ao resumo antes de gerar o PDF.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let y = 15;

        doc.setFontSize(18);
        doc.text('Resumo da Ocorrência', 105, y, { align: 'center' });
        y += 10;
        doc.setFontSize(10);
        doc.text(`ID do Indivíduo: ${jogadorId} | Data: ${new Date().toLocaleString('pt-BR')}`, 105, y, { align: 'center' });
        y += 15;

        doc.setFontSize(12);
        crimesAdicionados.forEach((crime, index) => {
            if (y > 270) {
                doc.addPage();
                y = 15;
            }
            doc.setFont(undefined, 'bold');
            doc.text(`Artigo ${index + 1}: ${crime.artigo} - ${crime.nome}`, 15, y);
            y += 7;
            doc.setFont(undefined, 'normal');
            doc.text(`Código: ${codigoMap[crime.codigo].name}`, 15, y);
            y += 5;
            doc.text(`Pena: ${crime.pena} meses`, 15, y);
            y += 5;
            doc.text(`Multa: ${crime.multa}`, 15, y);
            y += 5;
            doc.text(`Fiança: ${crime.fianca}`, 15, y);
            y += 10;
        });

        y += 5;
        doc.setLineWidth(0.5);
        doc.line(15, y, 195, y);
        y += 10;

        doc.setFont(undefined, 'bold');
        doc.text('Totais:', 15, y);
        y += 7;
        doc.setFont(undefined, 'normal');
        doc.text(`Pena Total: ${penaTotalEl.textContent} meses`, 15, y);
        y += 7;
        doc.text(`Multa Total: ${multaTotalEl.textContent}`, 15, y);
        y += 7;
        doc.text(`Status da Fiança: ${fiancaTotalEl.textContent}`, 15, y);
        y += 7;
        doc.text(`Total de Artigos: ${artigosTotalEl.textContent}`, 15, y);

        doc.save(`resumo-ocorrencia-ID${jogadorId}-${Date.now()}.pdf`);
    });

    btnLimpar.addEventListener('click', () => {
        crimesAdicionados = [];
        jogadorId = null;
        crimePendente = null;
        renderResumo();
        calcularTotais();
    });

    confirmIdBtn.addEventListener('click', () => {
        const id = playerIdInput.value.trim();
        if (id) {
            jogadorId = id;
            closeModal();

            if (crimePendente) {
                // Adiciona o crime que estava aguardando
                if (crimesAdicionados.find(c => c.artigo === crimePendente.artigo && c.codigo === crimePendente.codigo)) {
                    alert('Este crime já foi adicionado.');
                } else {
                    crimesAdicionados.push(crimePendente);
                    renderResumo();
                    calcularTotais();
                }
                crimePendente = null; // Limpa o crime pendente
            }
        } else {
            alert('Por favor, insira um ID válido.');
        }
    });

    function closeModal() {
        idModal.style.display = 'none';
        playerIdInput.value = '';
        crimePendente = null;
    }

    closeModalBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === idModal) {
            closeModal();
        }
    });

    searchInput.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        const resultadosFiltrados = crimes.filter(crime => 
            crime.artigo.toLowerCase().includes(termo) ||
            crime.nome.toLowerCase().includes(termo) ||
            crime.resumo.toLowerCase().includes(termo)
        );
        renderResultados(resultadosFiltrados);
    });

    initialize();

    function salvarPrisao() {
        if (crimesAdicionados.length === 0) {
            alert("Adicione pelo menos um crime ao resumo antes de salvar.");
            return;
        }
        if (!jogadorId) {
            alert("É necessário um ID de jogador para salvar a ocorrência. Adicione um crime primeiro.");
            // Opcional: abrir o modal de ID aqui se quiser guiar o usuário
            // idModal.style.display = 'flex';
            // playerIdInput.focus();
            return;
        }
        saveModal.style.display = 'flex';
        saveNameInput.focus();
    }

    function closeSaveModal() {
        saveModal.style.display = 'none';
        saveNameInput.value = '';
    }

    confirmSaveBtn.addEventListener('click', () => {
        const nomePrisao = saveNameInput.value.trim();
        if (nomePrisao) {
            prisoesSalvas[nomePrisao] = {
                id: jogadorId,
                crimes: [...crimesAdicionados]
            };
            localStorage.setItem('prisoesSalvas', JSON.stringify(prisoesSalvas));
            renderPrisoesSalvas();
            alert(`Ocorrência "${nomePrisao}" salva com sucesso!`);
            closeSaveModal();
        } else {
            alert("Por favor, digite um nome para a ocorrência.");
        }
    });

    cancelSaveBtn.addEventListener('click', closeSaveModal);
    closeSaveModalBtn.addEventListener('click', closeSaveModal);

    function carregarPrisao(nome) {
        const ocorrenciaSalva = prisoesSalvas[nome];
        if (ocorrenciaSalva) {
            // Limpa a lista atual antes de carregar a nova
            crimesAdicionados = [];
            jogadorId = ocorrenciaSalva.id; // Carrega o ID do jogador

            // Adiciona os crimes da ocorrência salva
            ocorrenciaSalva.crimes.forEach(crimeSalvo => {
                // Encontra o crime correspondente na master list para garantir dados atualizados
                const crimeCompleto = masterCrimesList.find(c => c.artigo === crimeSalvo.artigo && c.codigo === crimeSalvo.codigo);
                if (crimeCompleto) {
                    // Adiciona sem verificar duplicatas, pois estamos carregando um estado salvo
                    crimesAdicionados.push(crimeCompleto);
                }
            });

            renderResumo();
            calcularTotais();
            // Opcional: Mudar a visão para o código do primeiro crime da lista
            if (crimesAdicionados.length > 0) {
                const primeiroCodigo = crimesAdicionados[0].codigo;
                seletorCodigo.value = primeiroCodigo;
                switchCodeView(primeiroCodigo);
            }
            alert(`Ocorrência "${nome}" carregada. ID do jogador: ${jogadorId}`);
        }
    }

    function excluirPrisao(nome) {
        if (confirm(`Tem certeza que deseja excluir a prisão "${nome}"?`)) {
            delete prisoesSalvas[nome];
            localStorage.setItem('prisoesSalvas', JSON.stringify(prisoesSalvas));
            renderPrisoesSalvas();
        }
    }

    function renderPrisoesSalvas() {
        prisoesSalvasLista.innerHTML = '';
        for (const nome in prisoesSalvas) {
            const item = document.createElement('div');
            item.className = 'prisao-salva-item';
            item.innerHTML = `
                <span>${nome}</span>
                <div class="botoes">
                    <button class="carregar">Carregar</button>
                    <button class="excluir">Excluir</button>
                </div>
            `;
            item.querySelector('.carregar').addEventListener('click', () => carregarPrisao(nome));
            item.querySelector('.excluir').addEventListener('click', () => excluirPrisao(nome));
            prisoesSalvasLista.appendChild(item);
        }
    }

    btnSalvar.addEventListener('click', salvarPrisao);

    window.addEventListener('click', (e) => {
        if (e.target === saveModal) {
            closeSaveModal();
        }
    });
});