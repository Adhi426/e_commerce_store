/**
 * NEXORA User Profile JS Module
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('profile-page-view')) {
    initProfilePage();
  }
});

async function initProfilePage() {
  const container = document.getElementById('profile-page-view');
  if (!container) return;

  const user = NEXORA_APP.getUser();
  if (!user) {
    window.location.href = '/login.html?redirect=profile';
    return;
  }

  try {
    const res = await NEXORA_APP.api('/users/profile');
    renderProfileView(res.user || user);
  } catch (error) {
    renderProfileView(user);
  }
}

function renderProfileView(user) {
  const container = document.getElementById('profile-page-view');
  if (!container) return;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 280px 1fr; gap: 2.5rem; align-items: start;">
      <!-- Sidebar Info -->
      <div style="background: #fff; padding: 2rem 1.5rem; border-radius: var(--radius-xl); border: 1px solid var(--slate-200); text-align: center;">
        <div style="width: 5rem; height: 5rem; background: var(--primary-gradient); color: #fff; font-family: var(--font-display); font-size: 2rem; font-weight: 800; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; box-shadow: var(--shadow-md);">
          ${initials}
        </div>

        <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--slate-900); margin-bottom: 0.25rem;">${user.name}</h3>
        <p style="font-size: 0.875rem; color: var(--slate-500); margin-bottom: 1.25rem;">${user.email}</p>

        <span class="badge ${user.role === 'admin' ? 'badge-danger' : 'badge-primary'}" style="margin-bottom: 1.5rem;">
          ${user.role === 'admin' ? '👑 Admin Privileges' : 'Member Account'}
        </span>

        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; border-top: 1px solid var(--slate-200); padding-top: 1rem;">
          <a href="/orders.html" class="btn btn-outline" style="width: 100%; font-size: 0.875rem;">📦 My Orders</a>
          ${user.role === 'admin' ? `<a href="/admin.html" class="btn btn-primary" style="width: 100%; font-size: 0.875rem;">📊 Admin Portal</a>` : ''}
          <button onclick="NEXORA_APP.logout()" class="btn btn-outline" style="width: 100%; color: var(--accent-ruby); border-color: var(--accent-ruby);">Sign Out</button>
        </div>
      </div>

      <!-- Profile Edit Form -->
      <div style="background: #fff; padding: 2.5rem; border-radius: var(--radius-xl); border: 1px solid var(--slate-200);">
        <h3 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--slate-900); margin-bottom: 1.5rem;">Account Settings</h3>

        <form id="profile-form" onsubmit="handleUpdateProfile(event)">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem;">
            <div>
              <label style="display: block; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.35rem;">Full Name</label>
              <input type="text" id="prof-name" value="${user.name || ''}" required 
                     style="width:100%; padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
            </div>

            <div>
              <label style="display: block; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.35rem;">Email Address (Read Only)</label>
              <input type="email" value="${user.email || ''}" disabled readonly 
                     style="width:100%; padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--slate-200); background:var(--slate-100);" />
            </div>

            <div>
              <label style="display: block; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.35rem;">Phone Number</label>
              <input type="tel" id="prof-phone" value="${user.phone || ''}" 
                     style="width:100%; padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
            </div>
          </div>

          <h4 style="font-weight: 700; margin-bottom: 1rem;">Shipping Address</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 2rem;">
            <div style="grid-column: 1 / -1;">
              <label style="display: block; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.35rem;">Street Address</label>
              <input type="text" id="prof-street" value="${user.address?.street || ''}" 
                     style="width:100%; padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
            </div>

            <div>
              <label style="display: block; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.35rem;">City</label>
              <input type="text" id="prof-city" value="${user.address?.city || ''}" 
                     style="width:100%; padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
            </div>

            <div>
              <label style="display: block; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.35rem;">State</label>
              <input type="text" id="prof-state" value="${user.address?.state || ''}" 
                     style="width:100%; padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
            </div>

            <div>
              <label style="display: block; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.35rem;">Zip / PIN Code</label>
              <input type="text" id="prof-zip" value="${user.address?.zipCode || ''}" 
                     style="width:100%; padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--slate-300);" />
            </div>
          </div>

          <button type="submit" id="btn-save-profile" class="btn btn-primary">Save Profile Changes</button>
        </form>
      </div>
    </div>
  `;
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-profile');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const name = document.getElementById('prof-name').value;
  const phone = document.getElementById('prof-phone').value;
  const address = {
    street: document.getElementById('prof-street').value,
    city: document.getElementById('prof-city').value,
    state: document.getElementById('prof-state').value,
    zipCode: document.getElementById('prof-zip').value,
  };

  try {
    const res = await NEXORA_APP.api('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, phone, address }),
    });

    if (res.success) {
      NEXORA_APP.setSession(res.user, NEXORA_APP.getToken());
      NEXORA_APP.toast('Profile updated successfully ✓', 'success');
    }
  } catch (error) {
    NEXORA_APP.toast(error.message || 'Failed to update profile', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Profile Changes';
  }
}
