
import { codigoCivil } from './data/codigo-civil-data.js';

let allArticles = [];

document.addEventListener('DOMContentLoaded', () => {
    // Adiciona um pequeno atraso para garantir que o DOM esteja totalmente pronto
    setTimeout(initialize, 100);
});

function initialize() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
        console.error("Elemento 'searchInput' não encontrado. A inicialização será interrompida.");
        return;
    }

    allArticles = [...codigoCivil].sort((a, b) => {
        const numA = parseInt(a.numero.replace('Art. ', '').replace('.', ''));
        const numB = parseInt(b.numero.replace('Art. ', '').replace('.', ''));
        return numA - numB;
    });

    populateFilters();
    renderArticles(allArticles);
    setupEventListeners();
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.querySelector('.limpar-busca');
    const categoryFilter = document.getElementById('categoryFilter');
    const severityFilter = document.getElementById('severityFilter');
    const natureFilter = document.getElementById('natureFilter');
    const articlesGrid = document.getElementById('artigosGrid');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalCloseBtn = document.getElementById('modalClose');

    searchInput.addEventListener('input', filterAndSearch);
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterAndSearch();
    });

    categoryFilter.addEventListener('change', filterAndSearch);
    severityFilter.addEventListener('change', filterAndSearch);
    natureFilter.addEventListener('change', filterAndSearch);

    articlesGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.artigo-card');
        if (card) {
            const articleId = parseInt(card.dataset.id);
            const article = allArticles.find(a => a.id === articleId);
            if (article) {
                openModal(article);
            }
        }
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    modalCloseBtn.addEventListener('click', closeModal);
}

function populateFilters() {
    const categories = [...new Set(allArticles.map(a => a.categoria))];
    const natures = [...new Set(allArticles.map(a => a.natureza))];

    const categoryFilter = document.getElementById('categoryFilter');
    const natureFilter = document.getElementById('natureFilter');

    categories.sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    natures.sort().forEach(nature => {
        const option = document.createElement('option');
        option.value = nature;
        option.textContent = nature;
        natureFilter.appendChild(option);
    });
}

function renderArticles(articles) {
    const articlesGrid = document.getElementById('artigosGrid');
    const resultCount = document.getElementById('resultCount');
    const noResults = document.getElementById('noResults');

    articlesGrid.innerHTML = '';

    if (articles.length === 0) {
        noResults.style.display = 'block';
        resultCount.textContent = 'Nenhum artigo encontrado.';
    } else {
        noResults.style.display = 'none';
        resultCount.textContent = `${articles.length} artigo(s) encontrado(s).`;
    }

    articles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'artigo-card';
        card.dataset.id = article.id;
        card.innerHTML = `
            <h3>${article.numero} - ${article.titulo}</h3>
            <p><span class="label">Descrição:</span> ${article.descricao.substring(0, 100)}...</p>
            <p><span class="label">Multa:</span> ${article.multa}</p>
            <p><span class="label">Medida Civil:</span> ${article.medidaCivil}</p>
            <p><span class="label">Gravidade:</span> ${article.gravidade}</p>
            <span class="categoria-tag">${article.categoria}</span>
        `;
        articlesGrid.appendChild(card);
    });
}

function filterAndSearch() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const severityFilter = document.getElementById('severityFilter');
    const natureFilter = document.getElementById('natureFilter');

    const searchTerm = searchInput.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const selectedCategory = categoryFilter.value;
    const selectedSeverity = severityFilter.value;
    const selectedNature = natureFilter.value;

    const filteredArticles = allArticles.filter(article => {
        const matchesCategory = !selectedCategory || article.categoria === selectedCategory;
        const matchesSeverity = !selectedSeverity || article.gravidade === selectedSeverity;
        const matchesNature = !selectedNature || article.natureza === selectedNature;

        const articleContent = [
            article.numero,
            article.titulo,
            article.descricao,
            article.multa,
            article.medidaCivil,
            article.observacoes,
            article.categoria,
            article.palavrasChave
        ].join(' ').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const searchTerms = searchTerm.split(' ').filter(t => t.length > 0);
        const matchesSearch = searchTerms.every(term => articleContent.includes(term));

        return matchesCategory && matchesSeverity && matchesNature && matchesSearch;
    });

    renderArticles(filteredArticles);
}

function openModal(article) {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const copyBtn = document.getElementById('copyBtn');

    modalTitle.textContent = `${article.numero} - ${article.titulo}`;
    modalBody.innerHTML = `
        <p><span class="label">Descrição:</span> ${article.descricao}</p>
        <p><span class="label">Multa:</span> ${article.multa}</p>
        <p><span class="label">Medida Civil:</span> ${article.medidaCivil}</p>
        <p><span class="label">Observações:</span> ${article.observacoes}</p>
        <p><span class="label">Categoria / Livro:</span> ${article.categoria}</p>
        <p><span class="label">Gravidade:</span> ${article.gravidade}</p>
        <p><span class="label">Natureza:</span> ${article.natureza}</p>
        <p><span class="label">Palavras-chave:</span> ${article.palavrasChave}</p>
    `;

    copyBtn.onclick = () => copyArticle(article);

    modalOverlay.classList.add('visible');
}

function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.classList.remove('visible');
}

function copyArticle(article) {
    const textToCopy = `
${article.numero} - ${article.titulo}

Descrição: ${article.descricao}
Multa: ${article.multa}
Medida Civil: ${article.medidaCivil}
Observações: ${article.observacoes}
Categoria / Livro: ${article.categoria}
Gravidade: ${article.gravidade}
Natureza: ${article.natureza}
Palavras-chave: ${article.palavrasChave}
    `.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
        Swal.fire({
            title: 'Copiado!',
            text: 'O artigo foi copiado para a área de transferência.',
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'swal-popup',
                title: 'swal-title',
                content: 'swal-content',
                confirmButton: 'swal-confirm-button'
            }
        });
    }).catch(err => {
        console.error('Erro ao copiar artigo: ', err);
        Swal.fire({
            title: 'Erro!',
            text: 'Não foi possível copiar o artigo.',
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'swal-popup',
                title: 'swal-title',
                content: 'swal-content',
                confirmButton: 'swal-confirm-button'
            }
        });
    });
}