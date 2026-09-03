/**
 * NEXORA Products Catalog JS Module
 * Handles product listing grid, live search, multi-filters, sorting, pagination
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('products-grid')) {
    initProductListingPage();
  } else if (document.getElementById('featured-products-grid')) {
    initFeaturedProductsGrid();
  }
});

let currentPage = 1;
let currentCategory = 'All';
let currentSearch = '';
let currentSort = 'featured';
let currentMinPrice = 0;
let currentMaxPrice = 50000;

// Initialize Shop Listing Page
async function initProductListingPage() {
  // Parse URL Query Params (e.g. ?category=Electronics&search=Watch)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('category')) currentCategory = urlParams.get('category');
  if (urlParams.has('search')) currentSearch = urlParams.get('search');

  // Search input element
  const searchInput = document.getElementById('shop-search-input');
  if (searchInput) {
    searchInput.value = currentSearch;
    let timer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        currentSearch = e.target.value.trim();
        currentPage = 1;
        fetchAndRenderProducts();
      }, 350);
    });
  }

  // Category Filter Radio / Buttons
  const categoryEls = document.querySelectorAll('.filter-category-item');
  categoryEls.forEach((el) => {
    if (el.dataset.category === currentCategory) {
      el.classList.add('active');
    }
    el.addEventListener('click', () => {
      categoryEls.forEach((c) => c.classList.remove('active'));
      el.classList.add('active');
      currentCategory = el.dataset.category;
      currentPage = 1;
      fetchAndRenderProducts();
    });
  });

  // Sort Dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      currentPage = 1;
      fetchAndRenderProducts();
    });
  }

  // Initial Fetch
  fetchAndRenderProducts();
}

// Fetch Products from API & Render
async function fetchAndRenderProducts() {
  const gridContainer = document.getElementById('products-grid');
  const countEl = document.getElementById('products-count');
  if (!gridContainer) return;

  // Show Skeleton Loaders
  gridContainer.innerHTML = Array(8)
    .fill(0)
    .map(
      () => `
      <div class="product-card">
        <div class="skeleton" style="padding-top: 85%;"></div>
        <div style="padding: 1.25rem;">
          <div class="skeleton" style="height: 1rem; width: 40%; margin-bottom: 0.5rem;"></div>
          <div class="skeleton" style="height: 1.25rem; width: 85%; margin-bottom: 0.75rem;"></div>
          <div class="skeleton" style="height: 1.5rem; width: 50%;"></div>
        </div>
      </div>
    `
    )
    .join('');

  try {
    let queryStr = `?page=${currentPage}&limit=12&sort=${currentSort}`;
    if (currentCategory && currentCategory !== 'All') queryStr += `&category=${encodeURIComponent(currentCategory)}`;
    if (currentSearch) queryStr += `&search=${encodeURIComponent(currentSearch)}`;

    const res = await NEXORA_APP.api(`/products${queryStr}`);

    if (countEl) {
      countEl.textContent = `Showing ${res.products.length} of ${res.total} products`;
    }

    if (!res.products || res.products.length === 0) {
      gridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">No products found</h3>
          <p style="color: var(--slate-500); margin-bottom: 1.5rem;">Try adjusting your search terms or filter criteria.</p>
          <button class="btn btn-primary" onclick="resetFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = res.products.map((p) => createProductCardHTML(p)).join('');
    renderPagination(res.pages, res.page);
    attachCardEventListeners();
  } catch (error) {
    gridContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:red;">Failed to load products.</div>`;
  }
}

// Render Featured Products on Home Page
async function initFeaturedProductsGrid() {
  const container = document.getElementById('featured-products-grid');
  if (!container) return;

  try {
    const res = await NEXORA_APP.api('/products?featured=true&limit=8');
    container.innerHTML = res.products.map((p) => createProductCardHTML(p)).join('');
    attachCardEventListeners();
  } catch (error) {
    console.error('Featured products load error:', error);
  }
}

// Generate Product Card HTML template
function createProductCardHTML(product) {
  const isWish = NEXORA_APP.isWishlisted(product._id || product.id);
  const imgUrl = product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  return `
    <div class="product-card" data-id="${product._id || product.id}">
      <div class="product-img-wrapper">
        ${product.discount > 0 ? `<span class="product-badge-discount">-${product.discount}% OFF</span>` : ''}
        <button class="wishlist-btn ${isWish ? 'active' : ''}" data-id="${product._id || product.id}" title="Add to Wishlist">
          ${isWish ? '❤️' : '🤍'}
        </button>
        <a href="/product.html?id=${product._id || product.id}">
          <img src="${imgUrl}" alt="${product.name}" loading="lazy" />
        </a>
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <a href="/product.html?id=${product._id || product.id}">
          <h3 class="product-title">${product.name}</h3>
        </a>
        <div class="product-rating">
          <span class="stars">★</span>
          <span style="font-weight:700;">${product.rating || 4.8}</span>
          <span style="color:var(--slate-400);">(${product.reviewsCount || 12})</span>
        </div>
        <div class="product-price-row">
          <span class="price-current">₹${product.price.toLocaleString()}</span>
          ${product.originalPrice ? `<span class="price-original">₹${product.originalPrice.toLocaleString()}</span>` : ''}
        </div>
        <button class="btn-add-cart" data-id="${product._id || product.id}">
          🛒 Add to Cart
        </button>
      </div>
    </div>
  `;
}

// Attach Add to Cart & Wishlist click listeners
function attachCardEventListeners() {
  document.querySelectorAll('.btn-add-cart').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const productId = btn.dataset.id;
      btn.disabled = true;
      btn.innerHTML = 'Adding...';

      try {
        const product = await NEXORA_APP.api(`/products/${productId}`);
        NEXORA_APP.addToCart(product.product, 1);
      } catch (err) {
        NEXORA_APP.toast('Could not add product to cart', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '🛒 Add to Cart';
      }
    });
  });

  document.querySelectorAll('.wishlist-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const productId = btn.dataset.id;

      try {
        const res = await NEXORA_APP.api(`/products/${productId}`);
        const isAdded = NEXORA_APP.toggleWishlist(res.product);
        btn.innerHTML = isAdded ? '❤️' : '🤍';
        btn.classList.toggle('active', isAdded);
      } catch (err) {
        console.error(err);
      }
    });
  });
}

// Pagination controls
function renderPagination(totalPages, activePage) {
  const container = document.getElementById('pagination-container');
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="btn ${i === activePage ? 'btn-primary' : 'btn-outline'}" 
              style="padding: 0.5rem 0.875rem; font-size: 0.875rem;" 
              onclick="goToPage(${i})">${i}</button>
    `;
  }
  container.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  fetchAndRenderProducts();
  window.scrollTo({ top: 300, behavior: 'smooth' });
}

function resetFilters() {
  currentCategory = 'All';
  currentSearch = '';
  currentSort = 'featured';
  currentPage = 1;
  const searchInput = document.getElementById('shop-search-input');
  if (searchInput) searchInput.value = '';
  fetchAndRenderProducts();
}
