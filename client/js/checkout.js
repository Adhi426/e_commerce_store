/**
 * NEXORA Multi-step Checkout JS Module
 * Handles shipping address, order review, payment simulation, and backend order placement
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('checkout-wizard-view')) {
    initCheckoutWizard();
  }
});

let selectedPaymentMethod = 'COD';

function initCheckoutWizard() {
  const container = document.getElementById('checkout-wizard-view');
  if (!container) return;

  const cart = NEXORA_APP.getCart();

  if (!cart || cart.length === 0) {
    window.location.href = '/cart.html';
    return;
  }

  const user = NEXORA_APP.getUser();
  if (!user) {
    NEXORA_APP.toast('Please sign in to complete your checkout', 'warning');
    setTimeout(() => {
      window.location.href = '/login.html?redirect=checkout';
    }, 1000);
    return;
  }

  // Calculate totals
  let subtotal = 0;
  cart.forEach((item) => {
    subtotal += item.product.price * item.quantity;
  });

  const discount = subtotal > 1500 ? 150 : 0;
  const shipping = subtotal > 1000 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = Math.max(0, subtotal - discount + shipping + tax);

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 360px; gap: 3rem; align-items: start;">
      <!-- Main Form Column -->
      <div>
        <form id="checkout-form" onsubmit="handlePlaceOrder(event, ${subtotal}, ${discount}, ${shipping}, ${tax}, ${total})">
          
          <!-- STEP 1: Shipping Address -->
          <div style="background: #fff; padding: 2rem; border-radius: var(--radius-xl); border: 1px solid var(--slate-200); margin-bottom: 2rem;">
            <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--slate-900); margin-bottom: 1.5rem;">
              1. Shipping Address
            </h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div style="grid-column: 1 / -1;">
                <label style="display: block; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.35rem;">Full Name *</label>
                <input type="text" id="ship-name" required value="${user.name || ''}" 
                       style="width:100%; padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
              </div>

              <div>
                <label style="display: block; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.35rem;">Email Address *</label>
                <input type="email" id="ship-email" required value="${user.email || ''}" 
                       style="width:100%; padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
              </div>

              <div>
                <label style="display: block; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.35rem;">Phone Number *</label>
                <input type="tel" id="ship-phone" required value="${user.phone || '9876543210'}" 
                       style="width:100%; padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
              </div>

              <div style="grid-column: 1 / -1;">
                <label style="display: block; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.35rem;">Street Address *</label>
                <input type="text" id="ship-street" required value="${user.address?.street || '45 Innovation Way, Tech Park'}" 
                       style="width:100%; padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
              </div>

              <div>
                <label style="display: block; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.35rem;">City *</label>
                <input type="text" id="ship-city" required value="${user.address?.city || 'Bengaluru'}" 
                       style="width:100%; padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
              </div>

              <div>
                <label style="display: block; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.35rem;">State *</label>
                <input type="text" id="ship-state" required value="${user.address?.state || 'Karnataka'}" 
                       style="width:100%; padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
              </div>

              <div>
                <label style="display: block; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.35rem;">Zip / PIN Code *</label>
                <input type="text" id="ship-zip" required value="${user.address?.zipCode || '560100'}" 
                       style="width:100%; padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
              </div>
            </div>
          </div>

          <!-- STEP 2: Payment Method Options -->
          <div style="background: #fff; padding: 2rem; border-radius: var(--radius-xl); border: 1px solid var(--slate-200);">
            <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--slate-900); margin-bottom: 1.5rem;">
              2. Select Payment Method
            </h3>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <label style="display: flex; align-items: center; justify-content: space-between; padding: 1.25rem; border: 2px solid var(--primary); border-radius: var(--radius-lg); cursor: pointer; background: #eff6ff;" 
                     onclick="selectPayment('COD', this)">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <input type="radio" name="payment" value="COD" checked />
                  <div>
                    <div style="font-weight: 800; color: var(--slate-900);">Cash on Delivery (COD)</div>
                    <div style="font-size: 0.8125rem; color: var(--slate-500);">Pay cash upon physical delivery at doorstep</div>
                  </div>
                </div>
                <span style="font-size: 1.25rem;">💵</span>
              </label>

              <label style="display: flex; align-items: center; justify-content: space-between; padding: 1.25rem; border: 1px solid var(--slate-200); border-radius: var(--radius-lg); cursor: pointer;" 
                     onclick="selectPayment('CARD_DEMO', this)">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <input type="radio" name="payment" value="CARD_DEMO" />
                  <div>
                    <div style="font-weight: 800; color: var(--slate-900);">Demo Credit / Debit Card</div>
                    <div style="font-size: 0.8125rem; color: var(--slate-500);">Instant simulated card payment (4111 ••••)</div>
                  </div>
                </div>
                <span style="font-size: 1.25rem;">💳</span>
              </label>

              <label style="display: flex; align-items: center; justify-content: space-between; padding: 1.25rem; border: 1px solid var(--slate-200); border-radius: var(--radius-lg); cursor: pointer;" 
                     onclick="selectPayment('UPI_DEMO', this)">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <input type="radio" name="payment" value="UPI_DEMO" />
                  <div>
                    <div style="font-weight: 800; color: var(--slate-900);">Demo UPI / QR Transfer</div>
                    <div style="font-size: 0.8125rem; color: var(--slate-500);">GooglePay / PhonePe / Paytm Virtual ID</div>
                  </div>
                </div>
                <span style="font-size: 1.25rem;">📱</span>
              </label>
            </div>

            <button type="submit" id="btn-place-order" class="btn btn-primary" 
                    style="width: 100%; margin-top: 2rem; padding: 1rem; font-size: 1.125rem;">
              Place Demo Order (₹${total.toLocaleString()}) →
            </button>
          </div>
        </form>
      </div>

      <!-- Order Review Column -->
      <div class="order-summary-card">
        <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--slate-900); margin-bottom: 1.25rem;">
          Order Items (${cart.length})
        </h3>

        <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; max-height: 300px; overflow-y: auto;">
          ${cart
            .map(
              (item) => `
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <img src="${item.product.images[0]}" style="width: 3.5rem; height: 3.5rem; border-radius: var(--radius-md); object-fit: cover;" />
              <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 0.875rem; line-height: 1.2;">${item.product.name}</div>
                <div style="font-size: 0.75rem; color: var(--slate-500);">Qty: ${item.quantity} × ₹${item.product.price.toLocaleString()}</div>
              </div>
              <div style="font-weight: 800;">₹${(item.product.price * item.quantity).toLocaleString()}</div>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="summary-row">
          <span>Subtotal</span>
          <span style="font-weight: 700;">₹${subtotal.toLocaleString()}</span>
        </div>
        <div class="summary-row">
          <span>Discount</span>
          <span style="color: var(--accent-emerald); font-weight: 700;">-${discount > 0 ? `₹${discount}` : '₹0'}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span style="font-weight: 700;">${shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
        </div>
        <div class="summary-row">
          <span>Tax (5% GST)</span>
          <span style="font-weight: 700;">₹${tax.toLocaleString()}</span>
        </div>
        <div class="summary-row total">
          <span>Total Payable</span>
          <span style="color: var(--primary);">₹${total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  `;
}

function selectPayment(method, labelEl) {
  selectedPaymentMethod = method;
  document.querySelectorAll('#checkout-wizard-view label').forEach((l) => {
    l.style.borderColor = 'var(--slate-200)';
    l.style.background = '#fff';
  });
  labelEl.style.borderColor = 'var(--primary)';
  labelEl.style.background = '#eff6ff';
}

async function handlePlaceOrder(e, subtotal, discount, shipping, tax, total) {
  e.preventDefault();
  const btn = document.getElementById('btn-place-order');
  btn.disabled = true;
  btn.innerHTML = 'Processing Order...';

  const cart = NEXORA_APP.getCart();

  const items = cart.map((item) => ({
    product: item.product._id || item.product.id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    image: item.product.images[0] || '',
  }));

  const shippingAddress = {
    fullName: document.getElementById('ship-name').value,
    phone: document.getElementById('ship-phone').value,
    street: document.getElementById('ship-street').value,
    city: document.getElementById('ship-city').value,
    state: document.getElementById('ship-state').value,
    zipCode: document.getElementById('ship-zip').value,
  };

  try {
    const res = await NEXORA_APP.api('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items,
        shippingAddress,
        paymentMethod: selectedPaymentMethod,
      }),
    });

    if (res.success) {
      NEXORA_APP.clearCart();
      showConfirmationModal(res.order);
    }
  } catch (error) {
    NEXORA_APP.toast(error.message || 'Failed to place order', 'error');
    btn.disabled = false;
    btn.innerHTML = 'Place Demo Order →';
  }
}

function showConfirmationModal(order) {
  const modalHTML = `
    <div style="position: fixed; inset: 0; background: rgba(15,23,42,0.7); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1.5rem;">
      <div style="background: #fff; border-radius: var(--radius-xl); max-width: 500px; width: 100%; padding: 2.5rem; text-align: center; box-shadow: var(--shadow-xl); border: 1px solid var(--slate-200);">
        <div style="width: 4.5rem; height: 4.5rem; background: #ecfdf5; color: var(--accent-emerald); font-size: 2.25rem; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
          ✓
        </div>

        <h2 style="font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--slate-900); margin-bottom: 0.5rem;">
          Order Confirmed!
        </h2>

        <p style="color: var(--slate-600); margin-bottom: 1.5rem;">
          Thank you for shopping with NEXORA. Your order has been placed successfully.
        </p>

        <div style="background: var(--slate-100); padding: 1rem; border-radius: var(--radius-md); font-family: var(--font-display); font-weight: 800; font-size: 1.125rem; color: var(--primary); margin-bottom: 1.5rem;">
          Order ID: ${order.orderId}
        </div>

        <div style="font-size: 0.875rem; color: var(--slate-500); margin-bottom: 2rem;">
          Total Paid: <strong>₹${order.total.toLocaleString()}</strong> via ${order.paymentMethod}
        </div>

        <div style="display: flex; gap: 1rem;">
          <a href="/orders.html" class="btn btn-primary" style="flex: 1; text-align: center;">View Order History</a>
          <a href="/products.html" class="btn btn-outline" style="flex: 1; text-align: center;">Continue Shopping</a>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}
