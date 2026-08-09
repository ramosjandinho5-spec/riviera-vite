document.addEventListener('DOMContentLoaded', () => {
    const juridicoForm = document.getElementById('juridico-form');

    juridicoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const webhookUrl = 'https://discord.com/api/webhooks/1523083168163434568/LybD80yT6wnrJPOSzx73aHrD-1Ya3cPlb_f2mbaopp4LSfEkvavFnKa-oEatxNz0R7tf';

        const formData = new FormData(juridicoForm);
        const data = {
            nome: formData.get('nome'),
            playerId: formData.get('player-id'),
            cargo: formData.get('cargo'),
            experiencia: formData.get('experiencia'),
        };

        const payload = {
            username: "Candidaturas Jurídico - Riviera",
            avatar_url: "https://i.imgur.com/4M34hi2.png",
            embeds: [{
                title: `Nova Candidatura para o Jurídico`,
                color: 9649402, // Cor roxa
                fields: [
                    { name: "Nome Completo", value: data.nome, inline: false },
                    { name: "ID na Cidade", value: data.playerId, inline: true },
                    { name: "Cargo Desejado", value: data.cargo, inline: true },
                    { name: "Experiência", value: data.experiencia, inline: false },
                ],
                footer: { text: "Enviado diretamente do portal oficial." },
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
                juridicoForm.reset();
                Swal.fire({
                    title: 'Enviado!',
                    text: 'Sua candidatura foi enviada com sucesso. Boa sorte!',
                    icon: 'success',
                    confirmButtonColor: '#9333ea',
                }).then(() => {
                    // Fecha o modal após o usuário clicar em "OK"
                    window.parent.document.getElementById('form-modal').style.display = 'none';
                });
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
});