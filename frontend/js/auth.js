document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        window.location.href = 'chat.html';
        return;
    }

    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const showForgotPassword = document.getElementById('show-forgot-password');

    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const otpSection = document.getElementById('otp-section');
    const forgotPasswordSection = document.getElementById('forgot-password-section');
    const resetPasswordSection = document.getElementById('reset-password-section');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const otpForm = document.getElementById('otp-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const resetPasswordForm = document.getElementById('reset-password-form');

    const backToLoginLinks = document.querySelectorAll('.back-to-login');

    let currentEmail = '';

    // Navigation Helpers
    const hideAllSections = () => {
        loginSection.style.display = 'none';
        registerSection.style.display = 'none';
        otpSection.style.display = 'none';
        forgotPasswordSection.style.display = 'none';
        resetPasswordSection.style.display = 'none';
    };

    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        registerSection.style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        loginSection.style.display = 'block';
    });

    showForgotPassword.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        forgotPasswordSection.style.display = 'block';
    });

    backToLoginLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllSections();
            loginSection.style.display = 'block';
            currentEmail = '';
            document.getElementById('otp-code').value = '';
            document.getElementById('forgot-email').value = '';
            document.getElementById('reset-otp-code').value = '';
            document.getElementById('reset-new-password').value = '';
        });
    });

    // Login Handle (Seamless)
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

            // Seamless Login!
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

    // Register Handle (Requires OTP)
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

            currentEmail = data.email || email;
            hideAllSections();
            otpSection.style.display = 'block';

        } catch (err) {
            errorDiv.textContent = err.message;
            errorDiv.style.display = 'block';
        } finally {
            btnText.style.display = 'inline-block';
            loader.style.display = 'none';
        }
    });

    // Registration OTP Verify Handle
    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = document.getElementById('otp-code').value;
        const errorDiv = document.getElementById('otp-error');
        const btnText = document.getElementById('otp-btn-text');
        const loader = document.getElementById('otp-loader');

        try {
            errorDiv.style.display = 'none';
            btnText.style.display = 'none';
            loader.style.display = 'inline-block';

            const data = await fetchAPI('/auth/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ email: currentEmail, otp })
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

    // Forgot Password Handle
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        const errorDiv = document.getElementById('forgot-error');
        const successDiv = document.getElementById('forgot-success');
        const btnText = document.getElementById('forgot-btn-text');
        const loader = document.getElementById('forgot-loader');

        try {
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            btnText.style.display = 'none';
            loader.style.display = 'inline-block';

            const data = await fetchAPI('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email })
            });

            currentEmail = data.email || email;

            // Move to Reset Password screen
            hideAllSections();
            resetPasswordSection.style.display = 'block';

        } catch (err) {
            errorDiv.textContent = err.message;
            errorDiv.style.display = 'block';
        } finally {
            btnText.style.display = 'inline-block';
            loader.style.display = 'none';
        }
    });

    // Reset Password Handle
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = document.getElementById('reset-otp-code').value;
        const newPassword = document.getElementById('reset-new-password').value;
        const errorDiv = document.getElementById('reset-error');
        const successDiv = document.getElementById('reset-success');
        const btnText = document.getElementById('reset-btn-text');
        const loader = document.getElementById('reset-loader');

        try {
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            btnText.style.display = 'none';
            loader.style.display = 'inline-block';

            const data = await fetchAPI('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ email: currentEmail, otp, newPassword })
            });

            // Automatically log them in after a successful reset
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
