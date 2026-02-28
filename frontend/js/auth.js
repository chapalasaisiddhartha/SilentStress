document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        window.location.href = 'chat.html';
        return;
    }

    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Toggle forms
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerSection.style.display = 'none';
        loginSection.style.display = 'block';
    });

    // Login Handle
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        const btnText = document.getElementById('login-btn-text');
        const loader = document.getElementById('login-loader');

        try {
            errorDiv.style.display = 'none';
            btnText.style.display = 'none';
            loader.style.display = 'inline-block';

            const data = await fetchAPI('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            window.location.href = 'chat.html';
        } catch (err) {
            errorDiv.textContent = err.message;
            errorDiv.style.display = 'block';
        } finally {
            btnText.style.display = 'inline-block';
            loader.style.display = 'none';
        }
    });

    // Register Handle
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const errorDiv = document.getElementById('register-error');
        const btnText = document.getElementById('register-btn-text');
        const loader = document.getElementById('register-loader');

        try {
            errorDiv.style.display = 'none';
            btnText.style.display = 'none';
            loader.style.display = 'inline-block';

            const data = await fetchAPI('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            window.location.href = 'chat.html';
        } catch (err) {
            errorDiv.textContent = err.message;
            errorDiv.style.display = 'block';
        } finally {
            btnText.style.display = 'inline-block';
            loader.style.display = 'none';
        }
    });
});
