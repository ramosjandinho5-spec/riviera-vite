import { supabase } from './supabaseClient.js';
import './auth.css';

function setupAuth() {
    // --- Seletores do DOM ---
    const authModal = document.getElementById('auth-modal');
    const closeAuthModalBtn = authModal ? authModal.querySelector('.close-button') : null;
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const areaGovernoBtn = document.getElementById('area-governo-btn');

    // Se os elementos essenciais não existirem, não faz nada.
    if (!authModal || !areaGovernoBtn) {
        return;
    }

    // --- Funções do Modal ---
    function openAuthModal() {
        authModal.style.display = 'flex';
    }

    function closeAuthModal() {
        authModal.style.display = 'none';
    }

    function switchToRegister(e) {
        e.preventDefault();
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
    }

    function switchToLogin(e) {
        e.preventDefault();
        if (registerForm) registerForm.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
    }

    // --- Lógica de Autenticação com Supabase ---

    // Função de Registro
    async function handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name,
                    }
                }
            });

            if (error) throw error;

            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: name })
                .eq('id', data.user.id);

            if (profileError) throw profileError;

            Swal.fire({
                title: 'Sucesso!',
                text: 'Sua conta foi criada com sucesso! Você já pode fazer o login.',
                icon: 'success',
                customClass: {
                    popup: 'swal-popup-custom',
                    title: 'swal-title-custom',
                    content: 'swal-content-custom'
                }
            });
            switchToLogin(e);

        } catch (error) {
            console.error('Erro no cadastro:', error.message);
            Swal.fire({
                title: 'Erro no cadastro',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'Tentar Novamente',
                customClass: {
                    popup: 'swal-popup-custom',
                    title: 'swal-title-custom',
                    content: 'swal-content-custom',
                    confirmButton: 'swal-confirm-button-custom'
                }
            });
        }
    }

    // Função de Login
    async function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            Swal.fire({
                title: 'Sucesso!',
                text: 'Login realizado com sucesso!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: 'swal-popup-custom',
                    title: 'swal-title-custom',
                    content: 'swal-content-custom'
                }
            });
            closeAuthModal();
            window.location.href = 'admin.html';

        } catch (error) {
            console.error('Erro no login:', error.message);
            Swal.fire({
                title: 'Erro no login',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'Tentar Novamente',
                customClass: {
                    popup: 'swal-popup-custom',
                    title: 'swal-title-custom',
                    content: 'swal-content-custom',
                    confirmButton: 'swal-confirm-button-custom'
                }
            });
        }
    }

    // --- Event Listeners ---
    areaGovernoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal();
    });

    if (closeAuthModalBtn) {
        closeAuthModalBtn.addEventListener('click', closeAuthModal);
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', switchToRegister);
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', switchToLogin);
    }
    
    if(loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if(registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeAuthModal();
        }
    });
}

// Garante que o DOM esteja carregado antes de executar o setup
document.addEventListener('DOMContentLoaded', setupAuth);