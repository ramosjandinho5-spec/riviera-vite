document.addEventListener('DOMContentLoaded', () => {
    const policiaForm = document.getElementById('policia-form');
    const departamentoSelect = document.getElementById('departamento');
    const cargoSelect = document.getElementById('cargo');

    const cargosPorDepartamento = {
        "Policia Militar": ["Soldado", "Cabo", "Sargento"],
        "Policia Civil": ["Investigador", "Escrivão", "Delegado"],
        "Bope": ["Operador Tático", "Negociador"],
        "PRF": ["Policial Rodoviário Federal"],
        "PF": ["Agente Federal", "Perito Criminal Federal"]
    };

    departamentoSelect.addEventListener('change', () => {
        const selectedDepartment = departamentoSelect.value;

        // Limpa e desabilita o select de cargo se nenhum departamento for selecionado
        if (!selectedDepartment) {
            cargoSelect.innerHTML = '<option value="">Selecione um departamento primeiro...</option>';
            cargoSelect.disabled = true;
            return;
        }

        // Preenche os cargos e habilita o select
        cargoSelect.innerHTML = '<option value="">Selecione um cargo...</option>';
        cargosPorDepartamento[selectedDepartment].forEach(cargo => {
            const option = document.createElement('option');
            option.value = cargo;
            option.textContent = cargo;
            cargoSelect.appendChild(option);
        });
        cargoSelect.disabled = false;
    });

    policiaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const webhookUrl = 'https://discord.com/api/webhooks/1523091297374699620/THhxZFFFx_wb0jAj02XriXW1-j9-h-r-V3zbZDFV5QtHxS8sN7k1JJPi7yi0JhrJBbA6';

        const formData = new FormData(policiaForm);
        const data = {
            departamento: formData.get('departamento'),
            nome: formData.get('nome'),
            playerId: formData.get('player-id'),
            cargo: formData.get('cargo'),
            experiencia: formData.get('experiencia'),
        };

        const payload = {
            username: "Candidaturas Polícia - Riviera",
            avatar_url: "https://i.imgur.com/4M34hi2.png",
            embeds: [{
                title: `Nova Candidatura para ${data.departamento}`,
                color: 9649402,
                fields: [
                    { name: "Departamento", value: data.departamento, inline: false },
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
                policiaForm.reset();
                cargoSelect.innerHTML = '<option value="">Selecione um departamento primeiro...</option>';
                cargoSelect.disabled = true;
                Swal.fire({
                    title: 'Enviado!',
                    text: 'Sua candidatura foi enviada com sucesso. Boa sorte!',
                    icon: 'success',
                    confirmButtonColor: '#9333ea',
                }).then(() => {
                    window.parent.document.getElementById('form-modal-policia').style.display = 'none';
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