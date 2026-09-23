const TOKEN_KEY = "loomybox_customer_token";
const NAME_KEY = "loomybox_customer_name";

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

function showTab(tab) {
  document.getElementById("login-form").style.display = tab === "login" ? "block" : "none";
  document.getElementById("signup-form").style.display = tab === "signup" ? "block" : "none";
  document.getElementById("tab-login").className = tab === "login" ? "btn btn-primary" : "btn";
  document.getElementById("tab-signup").className = tab === "signup" ? "btn btn-primary" : "btn";
}
showTab("login");

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
    const { token, customer } = await Api.customerLogin(email, password);
    setSession(token, customer.name);
    showDashboard(customer.name);
  } catch (err) {
    errorBox.innerHTML = `<div class="error-text">${err.message}</div>`;
  }
}

async function signup() {
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const errorBox = document.getElementById("signup-error");
  errorBox.innerHTML = "";
  try {
    const { token, customer } = await Api.customerSignup(name, email, password);
    setSession(token, customer.name);
    showDashboard(customer.name);
  } catch (err) {
    errorBox.innerHTML = `<div class="error-text">${err.message}</div>`;
  }
}

function logout() {
  clearSession();
  document.getElementById("dashboard-view").style.display = "none";
  document.getElementById("logout-btn").style.display = "none";
  document.getElementById("auth-view").style.display = "block";
}

function statusBadge(status) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return `<span class="badge badge-${status}">${label}</span>`;
}

async function showDashboard(name) {
  document.getElementById("auth-view").style.display = "none";
  document.getElementById("dashboard-view").style.display = "block";
  document.getElementById("logout-btn").style.display = "inline-block";
  document.getElementById("customer-name-heading").textContent = `Hi ${name}, here's what you've booked`;
  await loadBookings();
}

async function loadBookings() {
  const token = getToken();
  const list = document.getElementById("bookings-list");
  try {
    const bookings = await Api.getMyBookingsAsCustomer(token);
    if (bookings.length === 0) {
      list.innerHTML = '<div class="empty-state">No bookings yet — head back to the homepage to book your first vendor.</div>';
      return;
    }
    list.innerHTML = bookings
      .map((b) => `<div class="booking-row">
        <div class="booking-info">
          <b>${b.vendorName} — ${b.categoryName}</b>
          <span>${b.date}${b.time ? " at " + b.time : ""}</span>
          <span>Payment: ${b.paymentStatus.replace("_", " ")}${b.amountTotal ? ` · AED ${b.amountPaid} of ${b.amountTotal}` : ""}</span>
        </div>
        <div class="booking-actions">${statusBadge(b.status)}</div>
      </div>`)
      .join("");
  } catch (err) {
    list.innerHTML = `<div class="error-text">${err.message}</div>`;
  }
}

// Resume session on reload
(function init() {
  const token = getToken();
  const name = (() => { try { return sessionStorage.getItem(NAME_KEY); } catch { return null; } })();
  if (token && name) showDashboard(name);
})();
