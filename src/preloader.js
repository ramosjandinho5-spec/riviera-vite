// A classe 'preloading' é adicionada diretamente no HTML.
// Este script espera a página carregar e orquestra a revelação do conteúdo.

window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');

    if (preloader) {
        // Inicia a animação para esconder o preloader
        preloader.classList.add('hidden');

        // Espera a transição do preloader terminar antes de revelar o conteúdo
        preloader.addEventListener('transitionend', () => {
            // Remove a classe 'preloading' para o body aparecer com fade-in
            document.body.classList.remove('preloading');
            // Remove o elemento preloader do DOM para limpar a página
            preloader.remove();
        }, { once: true });
    } else {
        // Caso não haja preloader na página, apenas revela o conteúdo
        document.body.classList.remove('preloading');
    }
});