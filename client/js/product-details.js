/**
 * NEXORA Product Details JS Module
 * Handles product details, image gallery, quantity, specs, reviews, Buy Now
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('product-detail-view')) {
    initProductDetailPage();
  }
});

let currentProduct = null;

async function initProductDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    window.location.href = '/products.html';
    return;
  }

  try {
    const res = await NEXORA_APP.api(`/products/${productId}`);
    currentProduct = res.product;
    renderProductDetails(currentProduct);
    fetchRelatedProducts(currentProduct.category, currentProduct._id || currentProduct.id);
  } catch (error) {
    document.getElementById('product-detail-view').innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem;">
        <h2>Product Not Found</h2>
        <p style="margin: 1rem 0; color: var(--slate-500);">The product you requested does not exist or has been removed.</p>
        <a href="/products.html" class="btn btn-primary">Back to Shop</a>
      </div>
    `;
  }
}

function renderProductDetails(p) {
  // Breadcrumb & Document Title
  document.title = `${p.name} — NEXORA Store`;
  const breadcrumb = document.getElementById('breadcrumb-category');
  const breadcrumbTitle = document.getElementById('breadcrumb-title');
  if (breadcrumb) breadcrumb.textContent = p.category;
  if (breadcrumbTitle) breadcrumbTitle.textContent = p.name;

  // Main Container
  const container = document.getElementById('product-detail-view');
  if (!container) return;

  const isWish = NEXORA_APP.isWishlisted(p._id || p.id);
  const images = p.images && p.images.length ? p.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'];

  // Specs HTML
  let specsHTML = '';
  if (p.specifications && Object.keys(p.specifications).length > 0) {
    specsHTML = Object.entries(p.specifications)
      .map(([k, v]) => `<tr><td style="font-weight:700; width:35%;">${k}</td><td>${v}</td></tr>`)
      .join('');
  } else {
    specsHTML = `<tr><td>Category</td><td>${p.category}</td></tr><tr><td>Warranty</td><td>1 Year Brand Warranty</td></tr>`;
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3.5rem; align-items: start;">
      <!-- Image Gallery -->
      <div>
        <div style="border-radius: var(--radius-xl); overflow: hidden; border: 1px solid var(--slate-200); background: #fff; margin-bottom: 1rem; position: relative;">
          <img id="main-product-img" src="${images[0]}" alt="${p.name}" style="width: 100%; height: 460px; object-fit: cover;" />
          ${p.discount > 0 ? `<span class="product-badge-discount" style="font-size: 0.85rem; padding: 0.35rem 0.75rem;">-${p.discount}% OFF</span>` : ''}
        </div>
        ${
          images.length > 1
            ? `
          <div style="display: flex; gap: 0.75rem; overflow-x: auto;">
            ${images
              .map(
                (img, idx) => `
              <img src="${img}" class="gallery-thumb ${idx === 0 ? 'active' : ''}" 
                   style="width: 5rem; height: 5rem; object-fit: cover; border-radius: var(--radius-md); border: 2px solid ${idx === 0 ? 'var(--primary)' : 'var(--slate-200)'}; cursor: pointer;" 
                   onclick="changeMainImage('${img}', this)" />
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
      </div>

      <!-- Info & Purchase Column -->
      <div>
        <div class="badge badge-primary" style="margin-bottom: 0.75rem;">${p.category}</div>
        <h1 style="font-family: var(--font-display); font-size: 2.25rem; font-weight: 800; color: var(--slate-900); line-height: 1.25; margin-bottom: 0.75rem;">${p.name}</h1>

        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.25rem; color: var(--accent-amber); font-weight: 700;">
            ★ <span>${p.rating || 4.8}</span>
          </div>
          <span style="color: var(--slate-400);">|</span>
          <span style="color: var(--slate-600); font-weight: 600;">${p.reviewsCount || 14} Customer Reviews</span>
          <span style="color: var(--slate-400);">|</span>
          <span style="color: ${p.stock > 0 ? 'var(--accent-emerald)' : 'var(--accent-ruby)'}; font-weight: 700;">
            ${p.stock > 0 ? `In Stock (${p.stock} units)` : 'Out of Stock'}
          </span>
        </div>

        <div style="display: flex; align-items: baseline; gap: 1rem; margin-bottom: 1.5rem; background: #fff; padding: 1.25rem; border-radius: var(--radius-lg); border: 1px solid var(--slate-200);">
          <span style="font-family: var(--font-display); font-size: 2.25rem; font-weight: 800; color: var(--slate-900);">₹${p.price.toLocaleString()}</span>
          ${p.originalPrice ? `<span style="font-size: 1.25rem; color: var(--slate-400); text-decoration: line-through;">₹${p.originalPrice.toLocaleString()}</span>` : ''}
          ${p.discount ? `<span class="badge badge-danger" style="margin-left: auto;">Save ₹${(p.originalPrice - p.price).toLocaleString()}</span>` : ''}
        </div>

        <p style="color: var(--slate-600); line-height: 1.7; margin-bottom: 2rem;">${p.description}</p>

        <!-- Actions -->
        <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
          <div class="quantity-control" style="height: 3rem;">
            <button class="qty-btn" onclick="updateQty(-1)">-</button>
            <input type="number" id="detail-qty-input" value="1" min="1" max="${p.stock}" class="qty-input" readonly />
            <button class="qty-btn" onclick="updateQty(1)">+</button>
          </div>

          <button class="btn btn-primary" style="flex: 1; height: 3rem; font-size: 1rem;" onclick="handleAddToCartDetail()">
            🛒 Add to Cart
          </button>
          
          <button class="btn btn-outline" style="height: 3rem; font-size: 1rem; background-color: var(--slate-900); color: #fff; border: none;" onclick="handleBuyNowDetail()">
            ⚡ Buy Now
          </button>
        </div>

        <!-- Wishlist -->
        <button class="btn btn-outline" style="width: 100%;" onclick="handleToggleWishlistDetail(this)">
          ${isWish ? '❤️ Saved to Wishlist' : '🤍 Add to Wishlist'}
        </button>
      </div>
    </div>

    <!-- Specifications Table -->
    <div style="margin-top: 4rem; background: #fff; border-radius: var(--radius-xl); border: 1px solid var(--slate-200); padding: 2.5rem;">
      <h3 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; margin-bottom: 1.5rem; color: var(--slate-900);">Product Specifications</h3>
      <table class="cart-table">
        <tbody>
          ${specsHTML}
        </tbody>
      </table>
    </div>
  `;
}

function changeMainImage(url, el) {
  document.getElementById('main-product-img').src = url;
  document.querySelectorAll('.gallery-thumb').forEach((t) => {
    t.style.borderColor = 'var(--slate-200)';
  });
  el.style.borderColor = 'var(--primary)';
}

function updateQty(delta) {
  const input = document.getElementById('detail-qty-input');
  if (!input || !currentProduct) return;
  let val = parseInt(input.value) + delta;
  val = Math.max(1, Math.min(val, currentProduct.stock));
  input.value = val;
}

function handleAddToCartDetail() {
  if (!currentProduct) return;
  const qty = parseInt(document.getElementById('detail-qty-input').value) || 1;
  NEXORA_APP.addToCart(currentProduct, qty);
}

function handleBuyNowDetail() {
  if (!currentProduct) return;
  const qty = parseInt(document.getElementById('detail-qty-input').value) || 1;
  NEXORA_APP.addToCart(currentProduct, qty);
  window.location.href = '/checkout.html';
}

function handleToggleWishlistDetail(btn) {
  if (!currentProduct) return;
  const isAdded = NEXORA_APP.toggleWishlist(currentProduct);
  btn.innerHTML = isAdded ? '❤️ Saved to Wishlist' : '🤍 Add to Wishlist';
}

async function fetchRelatedProducts(category, currentId) {
  const container = document.getElementById('related-products-grid');
  if (!container) return;

  try {
    const res = await NEXORA_APP.api(`/products?category=${encodeURIComponent(category)}&limit=4`);
    const filtered = res.products.filter((p) => (p._id || p.id) !== currentId).slice(0, 4);
    
    if (filtered.length > 0) {
      container.innerHTML = filtered.map((p) => createProductCardHTML(p)).join('');
      attachCardEventListeners();
    } else {
      document.getElementById('related-products-section').style.display = 'none';
    }
  } catch (err) {
    console.error(err);
  }
}
