import { supabase } from './supabaseClient.js';

// Abordagem robusta com onAuthStateChange para garantir que a sessão seja totalmente estabelecida.
document.addEventListener('DOMContentLoaded', () => {
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('--- DIAGNÓSTICO DE AUTENTICAÇÃO ---');
        console.log('Evento de autenticação recebido:', event);
        console.log('Objeto da sessão:', session);

        const user = session?.user;
        console.log('Objeto do usuário extraído:', user);

        if (user && !document.body.classList.contains('admin-initialized')) {
            const allowedRoles = ['admin', 'Ministro', 'Juiz', 'Advogado', 'Estagiario'];
            const userRoleFromMeta = user.user_metadata?.role;
            const userRole = userRoleFromMeta || 'admin';
            
            console.log('Cargo extraído dos metadados:', userRoleFromMeta);
            console.log('Cargo final a ser verificado:', userRole);
            console.log('O cargo está na lista de permissões?', allowedRoles.includes(userRole));

            if (allowedRoles.includes(userRole)) {
                console.log('%cACESSO PERMITIDO. Inicializando o painel...', 'color: green; font-weight: bold;');
                document.body.classList.add('admin-initialized');
                initializePanel(user, userRole);
            } else {
                console.error('%cACESSO NEGADO: O cargo "' + userRole + '" não tem permissão. Deslogando.', 'color: red; font-weight: bold;');
                supabase.auth.signOut();
                window.location.href = '/index.html';
            }
        } 
        else if (!user) {
            console.error('%cACESSO NEGADO: Nenhum usuário encontrado na sessão. Redirecionando...', 'color: red; font-weight: bold;');
            window.location.href = '/index.html';
        } else {
            console.log('Painel já inicializado. Nenhuma ação necessária.');
        }
        console.log('--- FIM DO DIAGNÓSTICO ---');
    });
});

// Função que inicializa todos os componentes do painel, chamada APÓS a confirmação da sessão.
function initializePanel(user, userRole) {
    console.log(`Sessão confirmada para ${user.email} com cargo ${userRole}. Inicializando painel.`);
    
    // Configura a UI com base no cargo
    updateSidebarForRole(userRole);
    
    // Anexa todos os outros event listeners da página.
    attachEventListeners(userRole);
}

// Atualiza a barra lateral com base no cargo do usuário
function updateSidebarForRole(role) {
    const allLinks = document.querySelectorAll('.sidebar-nav a[data-tab]');
    const allContents = document.querySelectorAll('.tab-content');

    // 1. Reseta tudo
    allLinks.forEach(link => {
        link.style.display = 'none';
        link.classList.remove('active');
    });
    allContents.forEach(content => content.classList.remove('active'));

    if (!role) return;

    // 2. Define as permissões
    const permissions = {
        'admin': ['administracao', 'audiencias', 'agendar-audiencia', 'equipe', 'comunicados'],
        'Ministro': ['administracao', 'audiencias', 'agendar-audiencia', 'equipe', 'comunicados'],
        'Juiz': ['audiencias', 'agendar-audiencia'],
        'Advogado': ['agendar-audiencia'],
        'Estagiario': ['agendar-audiencia']
    };

    const userPermissions = permissions[role] || [];

    // 3. Mostra os links permitidos
    allLinks.forEach(link => {
        const tab = link.getAttribute('data-tab');
        if (userPermissions.includes(tab)) {
            link.style.display = 'block';
        }
    });

    // 4. Ativa a primeira aba visível
    const firstVisibleLink = document.querySelector('.sidebar-nav a[data-tab]:not([style*="display: none"])');
    if (firstVisibleLink) {
        firstVisibleLink.classList.add('active');
        const firstTabId = firstVisibleLink.getAttribute('data-tab');
        const firstTabContent = document.getElementById(firstTabId);
        if (firstTabContent) {
            firstTabContent.classList.add('active');
        }
    }
}

// Agrupa todos os listeners que dependem do DOM carregado e do usuário autenticado.
function attachEventListeners(userRole) {
    // --- Lógica de Logout ---
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            await supabase.auth.signOut();
            // onAuthStateChange cuidará do redirecionamento
        });
    }

    // --- Lógica para troca de abas principais ---
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.sidebar-nav a.active')?.classList.remove('active');
            document.querySelector('.tab-content.active')?.classList.remove('active');
            
            link.classList.add('active');
            const tabId = link.getAttribute('data-tab');
            const activeTab = document.getElementById(tabId);
            if (activeTab) {
                activeTab.classList.add('active');
                // Dispara um evento customizado para notificar que a aba mudou
                activeTab.dispatchEvent(new CustomEvent('tab:activated'));
            }
        });
    });

    // --- Lógica de Gerenciamento de Usuários (Aba Administração) ---
    const adminTab = document.getElementById('administracao');
    if (adminTab) {
        const openModalBtn = adminTab.querySelector('#open-create-user-modal');
        const createUserModal = document.getElementById('create-user-modal');
        const closeModalBtn = createUserModal?.querySelector('.close-button');
        const createUserForm = document.getElementById('create-user-form');
        const adminUsersTableBody = adminTab.querySelector('#admin-users-table-body');

        const openUserModal = () => { if (createUserModal) createUserModal.style.display = 'block'; };
        const closeUserModal = () => { if (createUserModal) createUserModal.style.display = 'none'; };

        openModalBtn?.addEventListener('click', openUserModal);
        closeModalBtn?.addEventListener('click', closeUserModal);
        window.addEventListener('click', (e) => { if (e.target === createUserModal) closeUserModal(); });

        // Carregar usuários quando a aba de administração for ativada
        adminTab.addEventListener('tab:activated', () => loadUsers(adminUsersTableBody));
        
        // Lógica do formulário de criação
        createUserForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userName = document.getElementById('user-name').value;
            const userEmail = document.getElementById('user-email').value;
            const userPassword = document.getElementById('user-password').value;
            const role = document.getElementById('user-role').value;

            if (!userName || !userEmail || !userPassword || !role) {
                Swal.fire('Erro!', 'Por favor, preencha todos os campos.', 'error');
                return;
            }

            const { data, error } = await supabase.auth.signUp({
                email: userEmail,
                password: userPassword,
                options: { data: { full_name: userName, role: role } }
            });

            if (error) {
                Swal.fire('Erro!', `Não foi possível criar o usuário: ${error.message}`, 'error');
            } else {
                Swal.fire('Sucesso!', 'Novo usuário criado!', 'success');
                closeUserModal();
                createUserForm.reset();
                loadUsers(adminUsersTableBody); // Recarrega a lista
            }
        });

        // Delegação de eventos para botões de ação na tabela
        adminUsersTableBody?.addEventListener('click', async (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            const userId = target.dataset.userId;

            if (target.classList.contains('btn-edit-role')) {
                const userRole = target.dataset.userRole;
                await openRoleModal(userId, userRole, () => loadUsers(adminUsersTableBody));
            }

            if (target.classList.contains('btn-delete-user')) {
                Swal.fire({
                    title: 'Tem certeza?',
                    text: "Esta ação não pode ser revertida!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sim, excluir!',
                    cancelButtonText: 'Cancelar'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        await deleteUser(userId, () => loadUsers(adminUsersTableBody));
                    }
                });
            }
        });
    }
}

// --- Funções de Ação para Usuários ---

async function loadUsers(tableBody) {
    if (!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';

    const { data, error } = await supabase.functions.invoke('list-users');

    if (error) {
        tableBody.innerHTML = `<tr><td colspan="4">Erro ao carregar usuários.</td></tr>`;
        console.error(error);
        return;
    }

    tableBody.innerHTML = '';
    if (data.users && data.users.length > 0) {
        data.users.forEach(user => {
            const tr = document.createElement('tr');
            const nome = user.user_metadata?.full_name || 'Não informado';
            const email = user.email;
            const cargo = user.user_metadata?.role || 'Não definido';

            tr.innerHTML = `
                <td>${nome}</td>
                <td>${email}</td>
                <td>${cargo}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-secondary btn-edit-role" data-user-id="${user.id}" data-user-role="${cargo}">Alterar Cargo</button>
                    <button class="btn btn-sm btn-danger btn-delete-user" data-user-id="${user.id}">Excluir</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } else {
        tableBody.innerHTML = '<tr><td colspan="4">Nenhum usuário encontrado.</td></tr>';
    }
}

async function openRoleModal(userId, currentRole, onComplete) {
    const { value: newRole } = await Swal.fire({
        title: 'Alterar Cargo do Usuário',
        input: 'select',
        inputOptions: { 'Ministro': 'Ministro', 'Juiz': 'Juiz', 'Advogado': 'Advogado', 'Estagiario': 'Estagiário' },
        inputValue: currentRole,
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar'
    });

    if (newRole && newRole !== currentRole) {
        Swal.fire({ title: 'Atualizando...', didOpen: () => Swal.showLoading() });
        const { error } = await supabase.functions.invoke('update-user-role', {
            body: { userId, newRole },
        });
        if (error) {
            Swal.fire('Erro!', `Falha ao alterar cargo: ${error.message}`, 'error');
        } else {
            Swal.fire('Sucesso!', 'Cargo alterado com sucesso.', 'success');
            onComplete(); // Callback para recarregar a lista
        }
    }
}

async function deleteUser(userId, onComplete) {
    Swal.fire({ title: 'Excluindo...', didOpen: () => Swal.showLoading() });
    const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
    });
    if (error) {
        Swal.fire('Erro!', `Falha ao excluir usuário: ${error.message}`, 'error');
    } else {
        Swal.fire('Excluído!', 'O usuário foi removido.', 'success');
        onComplete(); // Callback para recarregar a lista
    }
}