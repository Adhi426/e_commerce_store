/**
 * NEXORA Main Application JS Module
 * Handles API fetch wrapper, Toast notifications, Cart count, Wishlist, Auth state
 */

const NEXORA_APP = (function () {
  const API_BASE = '/api';

  // State
  let cart = JSON.parse(localStorage.getItem('nexora_cart') || '[]');
  let wishlist = JSON.parse(localStorage.getItem('nexora_wishlist') || '[]');
  let user = JSON.parse(localStorage.getItem('nexora_user') || 'null');
  let token = localStorage.getItem('nexora_token') || null;

  // Initialize UI
  document.addEventListener('DOMContentLoaded', () => {
    updateCartCountUI();
    updateUserAuthUI();
    initMobileNav();
  });

  // 1. API Fetch Helper
  async function api(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API Request Failed');
      }

      return data;
    } catch (error) {
      console.error(`[API Error ${endpoint}]:`, error.message);
      throw error;
    }
  }

  // 2. Toast System
  function toast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✕';
    if (type === 'warning') icon = '⚠️';

    toastEl.innerHTML = `
      <span style="font-weight: 800; font-size: 1.1rem;">${icon}</span>
      <div>${message}</div>
    `;

    container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toastEl.remove(), 300);
    }, 3500);
  }

  // 3. Cart Management
  function getCart() {
    return cart;
  }

  function addToCart(product, quantity = 1) {
    const productId = product._id || product.id;
    const existingIndex = cart.findIndex((item) => (item.product._id || item.product.id) === productId);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        product: product,
        quantity: quantity,
      });
    }

    saveCart();
    toast(`Added "${product.name}" to cart ✓`, 'success');
  }

  function removeFromCart(productId) {
    cart = cart.filter((item) => (item.product._id || item.product.id) !== productId);
    saveCart();
    toast('Item removed from cart', 'info');
  }

  function updateCartQuantity(productId, quantity) {
    const item = cart.find((item) => (item.product._id || item.product.id) === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      saveCart();
    }
  }

  function clearCart() {
    cart = [];
    saveCart();
  }

  function saveCart() {
    localStorage.setItem('nexora_cart', JSON.stringify(cart));
    updateCartCountUI();
  }

  function updateCartCountUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach((b) => {
      b.textContent = totalCount;
      b.style.display = totalCount > 0 ? 'flex' : 'none';
    });
  }

  // 4. Wishlist Management
  function toggleWishlist(product) {
    const productId = product._id || product.id;
    const idx = wishlist.findIndex((p) => (p._id || p.id) === productId);

    if (idx > -1) {
      wishlist.splice(idx, 1);
      toast('Removed from wishlist', 'info');
    } else {
      wishlist.push(product);
      toast('Saved to wishlist ❤️', 'success');
    }

    localStorage.setItem('nexora_wishlist', JSON.stringify(wishlist));
    return idx === -1;
  }

  function isWishlisted(productId) {
    return wishlist.some((p) => (p._id || p.id) === productId);
  }

  // 5. User Auth UI Helper
  function updateUserAuthUI() {
    const userMenu = document.getElementById('user-menu-btn');
    if (!userMenu) return;

    if (user && token) {
      userMenu.href = user.role === 'admin' ? '/admin.html' : '/profile.html';
      userMenu.title = `Logged in as ${user.name}`;
      userMenu.innerHTML = `<span style="font-weight:700; font-size:0.85rem;">Hi, ${user.name.split(' ')[0]}</span>`;
    } else {
      userMenu.href = '/login.html';
      userMenu.innerHTML = `👤`;
    }
  }

  function setSession(userData, jwtToken) {
    user = userData;
    token = jwtToken;
    localStorage.setItem('nexora_user', JSON.stringify(userData));
    localStorage.setItem('nexora_token', jwtToken);
    updateUserAuthUI();
  }

  function logout() {
    user = null;
    token = null;
    localStorage.removeItem('nexora_user');
    localStorage.removeItem('nexora_token');
    toast('Logged out successfully', 'info');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 500);
  }

  // 6. Mobile Nav
  function initMobileNav() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
      mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }
  }

  // Public API
  return {
    api,
    toast,
    getCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    toggleWishlist,
    isWishlisted,
    getUser: () => user,
    getToken: () => token,
    setSession,
    logout,
  };
})();
