/**
 * NEXORA Authentication JS Module
 * Handles login & registration forms, input validations, password toggles
 */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initLoginForm();
  initRegisterForm();
});

// Password Eye Toggle
function initPasswordToggles() {
  const toggleBtns = document.querySelectorAll('.password-toggle-btn');
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input && (input.type === 'password' || input.type === 'text')) {
        input.type = input.type === 'password' ? 'text' : 'password';
        btn.textContent = input.type === 'password' ? '👁️' : '🙈';
      }
    });
  });
}

// Login Form Submit Handler
function initLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    if (!email || !password) {
      NEXORA_APP.toast('Please enter both email and password', 'warning');
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Signing In...';

      const res = await NEXORA_APP.api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.success) {
        NEXORA_APP.setSession(res.user, res.token);
        NEXORA_APP.toast('Welcome back! Login successful ✓', 'success');
        
        setTimeout(() => {
          if (res.user.role === 'admin') {
            window.location.href = '/admin.html';
          } else {
            window.location.href = '/index.html';
          }
        }, 800);
      }
    } catch (error) {
      NEXORA_APP.toast(error.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Sign In';
    }
  });
}

// Registration Form Submit Handler
function initRegisterForm() {
  const regForm = document.getElementById('register-form');
  if (!regForm) return;

  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const submitBtn = regForm.querySelector('button[type="submit"]');

    if (!name || !email || !password || !confirmPassword) {
      NEXORA_APP.toast('Please fill in all required fields', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      NEXORA_APP.toast('Passwords do not match. Please verify.', 'error');
      return;
    }

    if (password.length < 6) {
      NEXORA_APP.toast('Password must be at least 6 characters long', 'warning');
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Creating Account...';

      const res = await NEXORA_APP.api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      if (res.success) {
        NEXORA_APP.setSession(res.user, res.token);
        NEXORA_APP.toast('Registration successful! Welcome to NEXORA 🎉', 'success');

        setTimeout(() => {
          window.location.href = '/index.html';
        }, 800);
      }
    } catch (error) {
      NEXORA_APP.toast(error.message || 'Registration failed.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Create Account';
    }
  });
}
