document.addEventListener('DOMContentLoaded', () => {
    // --- Botão Voltar ao Topo ---
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Lógica de Pesquisa ---
    const searchInput = document.getElementById('search-input');
    const articles = document.querySelectorAll('.conteudo-constituicao h4, .conteudo-constituicao p, .conteudo-constituicao li');
    if (searchInput && articles.length) {
        searchInput.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            articles.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (searchTerm.length > 2) {
                    if (text.includes(searchTerm)) {
                        item.style.backgroundColor = 'rgba(138, 43, 226, 0.3)';
                    } else {
                        item.style.backgroundColor = 'transparent';
                    }
                } else {
                    item.style.backgroundColor = 'transparent';
                }
            });
        });
    }

    // --- Navegação suave e Scroll-Spy ---
    const navLinks = document.querySelectorAll('.indice-lateral nav a');
    const sections = document.querySelectorAll('.conteudo-constituicao section');

    if (navLinks.length && sections.length) {
        // Navegação suave
        navLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // Scroll-Spy
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href').substring(1) === entry.target.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { threshold: 0.5 }); // Ativa quando 50% da seção está visível

        sections.forEach(section => {
            observer.observe(section);
        });
    }
});