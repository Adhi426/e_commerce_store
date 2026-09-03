/**
 * NEXORA Admin Portal JS Module
 * Handles Dashboard analytics, Product CRUD, Order Status Management
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('admin-dashboard-view')) {
    initAdminDashboard();
  }
});

let adminProducts = [];
let adminOrders = [];

async function initAdminDashboard() {
  const container = document.getElementById('admin-dashboard-view');
  if (!container) return;

  const user = NEXORA_APP.getUser();
  if (!user || user.role !== 'admin') {
    NEXORA_APP.toast('Access Denied: Admin permissions required', 'error');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 1000);
    return;
  }

  try {
    const [statsRes, prodRes, ordRes] = await Promise.all([
      NEXORA_APP.api('/users/admin/stats'),
      NEXORA_APP.api('/products?limit=100'),
      NEXORA_APP.api('/orders'),
    ]);

    adminProducts = prodRes.products || [];
    adminOrders = ordRes.orders || [];

    renderAdminOverview(statsRes.stats, adminProducts, adminOrders);
  } catch (error) {
    NEXORA_APP.toast(error.message || 'Failed to load admin stats', 'error');
  }
}

function renderAdminOverview(stats, products, orders) {
  const container = document.getElementById('admin-dashboard-view');
  if (!container) return;

  container.innerHTML = `
    <!-- Top Stats Cards -->
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.25rem; margin-bottom: 2.5rem;">
      <div style="background: #fff; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--slate-200);">
        <div style="font-size: 0.8125rem; color: var(--slate-500); font-weight: 700;">TOTAL REVENUE</div>
        <div style="font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--slate-900); margin-top: 0.25rem;">₹${stats.totalRevenue.toLocaleString()}</div>
      </div>

      <div style="background: #fff; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--slate-200);">
        <div style="font-size: 0.8125rem; color: var(--slate-500); font-weight: 700;">TOTAL ORDERS</div>
        <div style="font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--primary); margin-top: 0.25rem;">${stats.totalOrders}</div>
      </div>

      <div style="background: #fff; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--slate-200);">
        <div style="font-size: 0.8125rem; color: var(--slate-500); font-weight: 700;">PRODUCTS</div>
        <div style="font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--slate-900); margin-top: 0.25rem;">${stats.totalProducts}</div>
      </div>

      <div style="background: #fff; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--slate-200);">
        <div style="font-size: 0.8125rem; color: var(--slate-500); font-weight: 700;">REGISTERED USERS</div>
        <div style="font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--slate-900); margin-top: 0.25rem;">${stats.totalUsers}</div>
      </div>

      <div style="background: #fff; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--slate-200);">
        <div style="font-size: 0.8125rem; color: var(--slate-500); font-weight: 700;">PENDING ORDERS</div>
        <div style="font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--accent-amber); margin-top: 0.25rem;">${stats.pendingOrders}</div>
      </div>
    </div>

    <!-- Product Management Table -->
    <div style="background: #fff; padding: 2rem; border-radius: var(--radius-xl); border: 1px solid var(--slate-200); margin-bottom: 3rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h3 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--slate-900);">Product Inventory (${products.length})</h3>
          <p style="font-size: 0.875rem; color: var(--slate-500);">Add, edit, or delete store catalog items in real-time.</p>
        </div>
        <button class="btn btn-primary" onclick="openAddProductModal()">+ Add New Product</button>
      </div>

      <div style="overflow-x: auto;">
        <table class="cart-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${products
              .map((p) => {
                const pid = p._id || p.id;
                return `
                <tr>
                  <td><img src="${p.images[0]}" style="width:3.5rem; height:3.5rem; border-radius:var(--radius-md); object-fit:cover;" /></td>
                  <td style="font-weight:700;">${p.name}</td>
                  <td><span class="badge badge-primary">${p.category}</span></td>
                  <td style="font-weight:800;">₹${p.price.toLocaleString()}</td>
                  <td style="font-weight:700; color:${p.stock < 10 ? 'var(--accent-ruby)' : 'var(--slate-800)'};">${p.stock} units</td>
                  <td>
                    <button class="btn btn-outline" style="padding:0.25rem 0.625rem; font-size:0.75rem; margin-right:0.35rem;" onclick="openEditProductModal('${pid}')">Edit</button>
                    <button class="btn btn-outline" style="padding:0.25rem 0.625rem; font-size:0.75rem; color:var(--accent-ruby);" onclick="handleDeleteProduct('${pid}')">Delete</button>
                  </td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Orders Management Table -->
    <div style="background: #fff; padding: 2rem; border-radius: var(--radius-xl); border: 1px solid var(--slate-200);">
      <h3 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--slate-900); margin-bottom: 1.5rem;">Customer Orders (${orders.length})</h3>
      
      <div style="overflow-x: auto;">
        <table class="cart-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            ${orders
              .map((o) => {
                const oid = o._id || o.orderId;
                return `
                <tr>
                  <td style="font-family:var(--font-display); font-weight:800; color:var(--primary);">${o.orderId}</td>
                  <td>${o.shippingAddress?.fullName || 'Customer'}</td>
                  <td style="font-weight:800;">₹${o.total.toLocaleString()}</td>
                  <td>${o.paymentMethod}</td>
                  <td><span class="badge ${o.orderStatus === 'Delivered' ? 'badge-success' : 'badge-warning'}">${o.orderStatus}</span></td>
                  <td>
                    <select style="padding:0.35rem; border-radius:var(--radius-sm); border:1px solid var(--slate-300); font-weight:700;" 
                            onchange="handleUpdateOrderStatus('${oid}', this.value)">
                      <option value="Confirmed" ${o.orderStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                      <option value="Processing" ${o.orderStatus === 'Processing' ? 'selected' : ''}>Processing</option>
                      <option value="Shipped" ${o.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                      <option value="Delivered" ${o.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                      <option value="Cancelled" ${o.orderStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                  </td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openAddProductModal() {
  const modalHTML = `
    <div id="product-modal-backdrop" style="position: fixed; inset: 0; background: rgba(15,23,42,0.7); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1.5rem;" onclick="closeProductModal(event)">
      <div style="background: #fff; border-radius: var(--radius-xl); max-width: 550px; width: 100%; padding: 2rem; box-shadow: var(--shadow-xl); border: 1px solid var(--slate-200); position: relative;" onclick="event.stopPropagation()">
        <button onclick="closeProductModalDirect()" style="position: absolute; top: 1rem; right: 1rem; font-size: 1.25rem;">✕</button>
        <h3 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; margin-bottom: 1.5rem;">Add New Product</h3>

        <form onsubmit="handleSaveProduct(event)">
          <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
            <div>
              <label style="display:block; font-weight:700; font-size:0.875rem; margin-bottom:0.25rem;">Product Name *</label>
              <input type="text" id="m-prod-name" required style="width:100%; padding:0.625rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
              <div>
                <label style="display:block; font-weight:700; font-size:0.875rem; margin-bottom:0.25rem;">Category *</label>
                <select id="m-prod-cat" style="width:100%; padding:0.625rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);">
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Home & Living">Home & Living</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div>
                <label style="display:block; font-weight:700; font-size:0.875rem; margin-bottom:0.25rem;">Price (₹) *</label>
                <input type="number" id="m-prod-price" required style="width:100%; padding:0.625rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
              <div>
                <label style="display:block; font-weight:700; font-size:0.875rem; margin-bottom:0.25rem;">Original Price (₹)</label>
                <input type="number" id="m-prod-orig" style="width:100%; padding:0.625rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
              </div>

              <div>
                <label style="display:block; font-weight:700; font-size:0.875rem; margin-bottom:0.25rem;">Stock Quantity *</label>
                <input type="number" id="m-prod-stock" value="20" required style="width:100%; padding:0.625rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
              </div>
            </div>

            <div>
              <label style="display:block; font-weight:700; font-size:0.875rem; margin-bottom:0.25rem;">Image URL *</label>
              <input type="url" id="m-prod-img" placeholder="https://images.unsplash.com/..." required style="width:100%; padding:0.625rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
            </div>

            <div>
              <label style="display:block; font-weight:700; font-size:0.875rem; margin-bottom:0.25rem;">Description *</label>
              <textarea id="m-prod-desc" rows="3" required style="width:100%; padding:0.625rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);"></textarea>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;">Create Product</button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

async function handleSaveProduct(e) {
  e.preventDefault();
  const name = document.getElementById('m-prod-name').value;
  const category = document.getElementById('m-prod-cat').value;
  const price = Number(document.getElementById('m-prod-price').value);
  const originalPrice = Number(document.getElementById('m-prod-orig').value) || price * 1.25;
  const stock = Number(document.getElementById('m-prod-stock').value);
  const img = document.getElementById('m-prod-img').value;
  const description = document.getElementById('m-prod-desc').value;

  try {
    const res = await NEXORA_APP.api('/products', {
      method: 'POST',
      body: JSON.stringify({
        name,
        category,
        price,
        originalPrice,
        stock,
        images: [img],
        description,
        featured: true,
      }),
    });

    if (res.success) {
      NEXORA_APP.toast('Product created successfully ✓', 'success');
      closeProductModalDirect();
      initAdminDashboard();
    }
  } catch (error) {
    NEXORA_APP.toast(error.message || 'Failed to create product', 'error');
  }
}

async function handleDeleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      const res = await NEXORA_APP.api(`/products/${id}`, { method: 'DELETE' });
      if (res.success) {
        NEXORA_APP.toast('Product deleted', 'info');
        initAdminDashboard();
      }
    } catch (error) {
      NEXORA_APP.toast(error.message || 'Failed to delete product', 'error');
    }
  }
}

async function handleUpdateOrderStatus(id, newStatus) {
  try {
    const res = await NEXORA_APP.api(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ orderStatus: newStatus }),
    });
    if (res.success) {
      NEXORA_APP.toast(`Order status updated to ${newStatus} ✓`, 'success');
    }
  } catch (error) {
    NEXORA_APP.toast(error.message || 'Failed to update order status', 'error');
  }
}

function closeProductModalDirect() {
  const el = document.getElementById('product-modal-backdrop');
  if (el) el.remove();
}

function closeProductModal(e) {
  if (e.target.id === 'product-modal-backdrop') closeProductModalDirect();
}
