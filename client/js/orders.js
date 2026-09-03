/**
 * NEXORA Order History & Details JS Module
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('orders-page-view')) {
    initOrdersPage();
  }
});

let allUserOrders = [];

async function initOrdersPage() {
  const container = document.getElementById('orders-page-view');
  if (!container) return;

  const user = NEXORA_APP.getUser();
  if (!user) {
    window.location.href = '/login.html?redirect=orders';
    return;
  }

  try {
    const res = await NEXORA_APP.api('/orders');
    allUserOrders = res.orders;
    renderOrdersList(allUserOrders);
  } catch (error) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem; background:#fff; border-radius:var(--radius-xl);">
        <p style="color:red;">Failed to load order history. ${error.message}</p>
      </div>
    `;
  }
}

function renderOrdersList(orders) {
  const container = document.getElementById('orders-page-view');
  if (!container) return;

  if (!orders || orders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; background: #fff; border-radius: var(--radius-xl); border: 1px solid var(--slate-200);">
        <div style="font-size: 3.5rem; margin-bottom: 1rem;">📦</div>
        <h2 style="font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--slate-900); margin-bottom: 0.5rem;">No orders placed yet</h2>
        <p style="color: var(--slate-500); margin-bottom: 1.5rem;">You haven't placed any orders with NEXORA yet.</p>
        <a href="/products.html" class="btn btn-primary">Start Shopping</a>
      </div>
    `;
    return;
  }

  container.innerHTML = orders
    .map((ord) => {
      let badgeClass = 'badge-primary';
      if (ord.orderStatus === 'Delivered') badgeClass = 'badge-success';
      if (ord.orderStatus === 'Cancelled') badgeClass = 'badge-danger';
      if (ord.orderStatus === 'Processing') badgeClass = 'badge-warning';

      const createdDate = new Date(ord.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      return `
      <div style="background: #fff; border-radius: var(--radius-xl); border: 1px solid var(--slate-200); padding: 1.5rem; margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--slate-200); padding-bottom: 1rem; margin-bottom: 1rem;">
          <div>
            <span style="font-family: var(--font-display); font-weight: 800; font-size: 1.125rem; color: var(--primary);">${ord.orderId}</span>
            <span style="font-size: 0.8125rem; color: var(--slate-500); margin-left: 0.75rem;">Placed on ${createdDate}</span>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="badge ${badgeClass}">${ord.orderStatus}</span>
            <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8125rem;" onclick="viewOrderModal('${ord._id || ord.orderId}')">View Details</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: center;">
          <div style="display: flex; gap: 0.75rem; overflow-x: auto;">
            ${ord.items
              .map(
                (item) => `
              <img src="${item.image}" alt="${item.name}" title="${item.name} (Qty: ${item.quantity})" 
                   style="width: 3.5rem; height: 3.5rem; border-radius: var(--radius-md); object-fit: cover; border: 1px solid var(--slate-200);" />
            `
              )
              .join('')}
          </div>

          <div style="text-align: right;">
            <div style="font-size: 0.8125rem; color: var(--slate-500);">Total Amount</div>
            <div style="font-family: var(--font-display); font-weight: 800; font-size: 1.25rem; color: var(--slate-900);">₹${ord.total.toLocaleString()}</div>
          </div>
        </div>
      </div>
    `;
    })
    .join('');
}

function viewOrderModal(orderId) {
  const ord = allUserOrders.find((o) => (o._id || o.orderId) === orderId);
  if (!ord) return;

  const modalHTML = `
    <div id="order-modal-backdrop" style="position: fixed; inset: 0; background: rgba(15,23,42,0.7); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1.5rem;" onclick="closeOrderModal(event)">
      <div style="background: #fff; border-radius: var(--radius-xl); max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem; box-shadow: var(--shadow-xl); border: 1px solid var(--slate-200); position: relative;" onclick="event.stopPropagation()">
        <button onclick="closeOrderModalDirect()" style="position: absolute; top: 1rem; right: 1rem; font-size: 1.25rem; color: var(--slate-500);">✕</button>

        <h3 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--slate-900); margin-bottom: 0.5rem;">
          Order ${ord.orderId}
        </h3>

        <div style="margin-bottom: 1.5rem;">
          <span class="badge badge-primary">${ord.orderStatus}</span>
          <span style="font-size: 0.875rem; color: var(--slate-500); margin-left: 0.5rem;">Payment: ${ord.paymentMethod} (${ord.paymentStatus})</span>
        </div>

        <h4 style="font-weight: 700; margin-bottom: 0.75rem;">Items Ordered</h4>
        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
          ${ord.items
            .map(
              (i) => `
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <img src="${i.image}" style="width: 3rem; height: 3rem; border-radius: var(--radius-md); object-fit: cover;" />
              <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 0.875rem;">${i.name}</div>
                <div style="font-size: 0.75rem; color: var(--slate-500);">Qty: ${i.quantity} × ₹${i.price.toLocaleString()}</div>
              </div>
              <div style="font-weight: 800;">₹${(i.price * i.quantity).toLocaleString()}</div>
            </div>
          `
            )
            .join('')}
        </div>

        <h4 style="font-weight: 700; margin-bottom: 0.5rem;">Shipping Address</h4>
        <div style="background: var(--slate-100); padding: 1rem; border-radius: var(--radius-md); font-size: 0.875rem; color: var(--slate-700); margin-bottom: 1.5rem;">
          <strong>${ord.shippingAddress.fullName}</strong> (${ord.shippingAddress.phone})<br/>
          ${ord.shippingAddress.street}, ${ord.shippingAddress.city}, ${ord.shippingAddress.state} - ${ord.shippingAddress.zipCode}
        </div>

        <div style="border-top: 2px solid var(--slate-200); padding-top: 1rem; display: flex; justify-content: space-between; font-weight: 800; font-size: 1.25rem;">
          <span>Total Paid</span>
          <span style="color: var(--primary);">₹${ord.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeOrderModalDirect() {
  const backdrop = document.getElementById('order-modal-backdrop');
  if (backdrop) backdrop.remove();
}

function closeOrderModal(e) {
  if (e.target.id === 'order-modal-backdrop') {
    closeOrderModalDirect();
  }
}
