const TOKEN_KEY = "loomybox_vendor_token";
const NAME_KEY = "loomybox_vendor_name";

function getToken() {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function setSession(token, name) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(NAME_KEY, name);
  } catch { /* storage unavailable, session just won't persist across reload */ }
}
function clearSession() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(NAME_KEY);
  } catch { /* no-op */ }
}

async function login() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const errorBox = document.getElementById("login-error");
  errorBox.innerHTML = "";
  if (!email || !password) {
    errorBox.innerHTML = '<div class="error-text">Enter your email and password.</div>';
    return;
  }
  try {
    const { token, vendor } = await Api.vendorLogin(email, password);
    setSession(token, vendor.name);
    showDashboard(vendor.name);
  } catch (err) {
    errorBox.innerHTML = `<div class="error-text">${err.message}</div>`;
  }
}

function logout() {
  clearSession();
  document.getElementById("dashboard-view").style.display = "none";
  document.getElementById("logout-btn").style.display = "none";
  document.getElementById("login-view").style.display = "block";
}

function statusBadge(status) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return `<span class="badge badge-${status}">${label}</span>`;
}

async function showDashboard(name) {
  document.getElementById("login-view").style.display = "none";
  document.getElementById("dashboard-view").style.display = "block";
  document.getElementById("logout-btn").style.display = "inline-block";
  document.getElementById("vendor-name-heading").textContent = `Welcome back, ${name}`;
  await loadBookings();
}

async function loadBookings() {
  const token = getToken();
  const list = document.getElementById("bookings-list");
  const summary = document.getElementById("summary-row");
  try {
    const bookings = await Api.getMyBookings(token);
    const pending = bookings.filter((b) => b.status === "pending").length;
    const accepted = bookings.filter((b) => b.status === "accepted").length;
    const revenue = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

    summary.innerHTML = `
      <div class="summary-card"><b>${bookings.length}</b><span>total requests</span></div>
      <div class="summary-card"><b>${pending}</b><span>awaiting your response</span></div>
      <div class="summary-card"><b>${accepted}</b><span>accepted</span></div>
      <div class="summary-card"><b>AED ${revenue}</b><span>collected so far</span></div>
    `;

    if (bookings.length === 0) {
      list.innerHTML = '<div class="empty-state">No booking requests yet. Once a customer books you on Loomybox, it will show up here.</div>';
      return;
    }

    list.innerHTML = bookings
      .map((b) => {
        const detailBits = Object.entries(b.details || {})
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" · ");
        const actions = b.status === "pending"
          ? `<button class="btn" onclick="respond(${b.id}, 'declined')">Decline</button>
             <button class="btn btn-primary" onclick="respond(${b.id}, 'accepted')">Accept</button>`
          : "";
        return `<div class="booking-row">
          <div class="booking-info">
            <b>${b.customerName} — ${b.categoryName}</b>
            <span>${b.date}${b.time ? " at " + b.time : ""} · ${b.customerEmail}</span>
            ${detailBits ? `<span>${detailBits}</span>` : ""}
            <span>Payment: ${b.paymentStatus.replace("_", " ")}${b.amountTotal ? ` · AED ${b.amountPaid} of ${b.amountTotal}` : ""}</span>
          </div>
          <div class="booking-actions">${statusBadge(b.status)} ${actions}</div>
        </div>`;
      })
      .join("");
  } catch (err) {
    list.innerHTML = `<div class="error-text">${err.message}</div>`;
  }
}

async function respond(bookingId, status) {
  const token = getToken();
  try {
    await Api.setBookingStatus(bookingId, status, token);
    await loadBookings();
  } catch (err) {
    alert(err.message);
  }
}

// Resume session on reload
(function init() {
  const token = getToken();
  const name = (() => { try { return sessionStorage.getItem(NAME_KEY); } catch { return null; } })();
  if (token && name) showDashboard(name);
})();
