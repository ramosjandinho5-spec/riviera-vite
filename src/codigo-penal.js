document.addEventListener('DOMContentLoaded', () => {
    const searchArtigo = document.getElementById('search-artigo');
    const searchTipificacao = document.getElementById('search-tipificacao');
    const crimeSections = document.querySelectorAll('.crime-section');
    const navLinks = document.querySelectorAll('.nav-categorias a');

    function filterCrimes() {
        const artigoFilter = searchArtigo.value.toLowerCase();
        const tipificacaoFilter = searchTipificacao.value.toLowerCase();

        crimeSections.forEach(section => {
            const rows = section.querySelectorAll('tbody tr');
            let sectionHasVisibleRows = false;

            rows.forEach(row => {
                const artigo = row.cells[0].textContent.toLowerCase();
                const tipificacao = row.cells[1].textContent.toLowerCase();

                const showRow = artigo.includes(artigoFilter) && tipificacao.includes(tipificacaoFilter);
                row.style.display = showRow ? '' : 'none';

                if (showRow) {
                    sectionHasVisibleRows = true;
                }
            });

            section.style.display = sectionHasVisibleRows ? '' : 'none';
        });
    }

    function updateActiveLink() {
        let currentSectionId = '';
        crimeSections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 150) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });

        crimeSections.forEach(section => {
            const title = section.querySelector('h2');
            if (section.getAttribute('id') === currentSectionId) {
                title.classList.add('active-title');
            } else {
                title.classList.remove('active-title');
            }
        });
    }

    searchArtigo.addEventListener('input', filterCrimes);
    searchTipificacao.addEventListener('input', filterCrimes);
    window.addEventListener('scroll', updateActiveLink);
    window.addEventListener('load', updateActiveLink);
});