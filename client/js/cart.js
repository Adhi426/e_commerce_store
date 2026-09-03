/**
 * NEXORA Shopping Cart JS Module
 * Handles cart rendering, quantity changes, item removal, coupon calculation
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cart-page-view')) {
    renderCartPage();
  }
});

function renderCartPage() {
  const container = document.getElementById('cart-page-view');
  if (!container) return;

  const cart = NEXORA_APP.getCart();

  if (!cart || cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 5rem 1rem; background: #fff; border-radius: var(--radius-xl); border: 1px solid var(--slate-200);">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
        <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 800; color: var(--slate-900); margin-bottom: 0.5rem;">Your cart is empty</h2>
        <p style="color: var(--slate-500); max-width: 400px; margin: 0 auto 2rem;">Looks like you haven't added anything to your cart yet. Discover what's next in our shop.</p>
        <a href="/products.html" class="btn btn-primary" style="padding: 0.875rem 2rem; font-size: 1rem;">Start Shopping</a>
      </div>
    `;
    return;
  }

  // Calculate Subtotal & Taxes
  let subtotal = 0;
  cart.forEach((item) => {
    subtotal += item.product.price * item.quantity;
  });

  const discount = subtotal > 1500 ? 150 : 0;
  const shipping = subtotal > 1000 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = Math.max(0, subtotal - discount + shipping + tax);

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 340px; gap: 2.5rem; align-items: start;">
      <!-- Cart Table -->
      <div>
        <table class="cart-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${cart
              .map((item) => {
                const p = item.product;
                const pid = p._id || p.id;
                const itemTotal = p.price * item.quantity;
                const imgUrl = p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80';

                return `
                <tr>
                  <td>
                    <div class="cart-item-info">
                      <img src="${imgUrl}" alt="${p.name}" class="cart-item-img" />
                      <div>
                        <a href="/product.html?id=${pid}" style="font-weight: 700; color: var(--slate-900);">${p.name}</a>
                        <div style="font-size: 0.75rem; color: var(--slate-500);">${p.category}</div>
                      </div>
                    </div>
                  </td>
                  <td style="font-weight: 700;">₹${p.price.toLocaleString()}</td>
                  <td>
                    <div class="quantity-control">
                      <button class="qty-btn" onclick="handleCartQtyChange('${pid}', ${item.quantity - 1})">-</button>
                      <input type="number" value="${item.quantity}" class="qty-input" readonly />
                      <button class="qty-btn" onclick="handleCartQtyChange('${pid}', ${item.quantity + 1})">+</button>
                    </div>
                  </td>
                  <td style="font-weight: 800; color: var(--slate-900);">₹${itemTotal.toLocaleString()}</td>
                  <td>
                    <button onclick="handleRemoveCartItem('${pid}')" style="color: var(--accent-ruby); font-size: 1.25rem; font-weight: 700;" title="Remove Item">✕</button>
                  </td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; margin-top: 1.5rem;">
          <a href="/products.html" class="btn btn-outline">← Continue Shopping</a>
          <button class="btn btn-outline" style="color: var(--accent-ruby);" onclick="handleClearCart()">Clear Shopping Cart</button>
        </div>
      </div>

      <!-- Order Summary Card -->
      <div class="order-summary-card">
        <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--slate-900); margin-bottom: 1.25rem;">Order Summary</h3>
        
        <div class="summary-row">
          <span>Subtotal (${cart.length} items)</span>
          <span style="font-weight: 700;">₹${subtotal.toLocaleString()}</span>
        </div>

        <div class="summary-row">
          <span>Discount (Auto Promo)</span>
          <span style="color: var(--accent-emerald); font-weight: 700;">-${discount > 0 ? `₹${discount}` : '₹0'}</span>
        </div>

        <div class="summary-row">
          <span>Estimated Shipping</span>
          <span style="font-weight: 700; color: ${shipping === 0 ? 'var(--accent-emerald)' : 'inherit'};">
            ${shipping === 0 ? 'FREE' : `₹${shipping}`}
          </span>
        </div>

        <div class="summary-row">
          <span>Tax (5% GST)</span>
          <span style="font-weight: 700;">₹${tax.toLocaleString()}</span>
        </div>

        <div class="summary-row total">
          <span>Total</span>
          <span style="color: var(--primary);">₹${total.toLocaleString()}</span>
        </div>

        <a href="/checkout.html" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem; padding: 0.875rem; font-size: 1rem; text-align: center;">
          Proceed to Checkout →
        </a>

        <div style="font-size: 0.75rem; color: var(--slate-500); text-align: center; margin-top: 1rem;">
          🔒 Encrypted 256-Bit SSL Checkout Security
        </div>
      </div>
    </div>
  `;
}

function handleCartQtyChange(productId, newQty) {
  if (newQty < 1) {
    handleRemoveCartItem(productId);
    return;
  }
  NEXORA_APP.updateCartQuantity(productId, newQty);
  renderCartPage();
}

function handleRemoveCartItem(productId) {
  NEXORA_APP.removeFromCart(productId);
  renderCartPage();
}

function handleClearCart() {
  if (confirm('Are you sure you want to clear your shopping cart?')) {
    NEXORA_APP.clearCart();
    renderCartPage();
  }
}
