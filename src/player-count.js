document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = '/.netlify/functions/player-count';

    const playerCountSpan = document.getElementById('player-count-span');
    const playerCountContainer = document.querySelector('.player-count');

    async function updatePlayerCount() {
        if (!playerCountSpan) {
            return;
        }

        try {
            // Adiciona uma classe para indicar o estado de carregamento (opcional, para CSS)
            playerCountContainer?.classList.add('loading');

            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                // Se a resposta não for OK, lança um erro para ser pego pelo catch
                throw new Error(`Backend API responded with status: ${response.status}`);
            }

            const data = await response.json();

            // A API /players.json retorna um array de jogadores.
            // O número de jogadores online é o comprimento (length) desse array.
            const playerCount = data.length;
            
            // Atualiza o contador com o número de jogadores e o máximo fixo de 120.
            playerCountSpan.textContent = `${playerCount}/120`;

        } catch (error) {
            // Se houver erro (backend desligado, erro de rede), mostra um estado de erro
            console.error('Failed to fetch player count from backend:', error);
            playerCountSpan.textContent = 'N/A / 120';
        } finally {
            // Remove a classe de carregamento independentemente do resultado
            playerCountContainer?.classList.remove('loading');
        }
    }

    // Executa a primeira vez
    updatePlayerCount();

    // Configura a atualização automática
    const intervalId = setInterval(updatePlayerCount, 30000);

    // Opcional: Limpeza do intervalo quando a página é fechada (boa prática)
    // Isso não é estritamente necessário em um site tradicional, mas é bom saber.
    window.addEventListener('beforeunload', () => {
        clearInterval(intervalId);
    });
});