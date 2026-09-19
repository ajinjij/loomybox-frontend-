// PUT YOUR LIVE RENDER URL HERE (no trailing slash, keep the /api at the end).
// You can find it at the top of your service page on dashboard.render.com.
const LIVE_API_BASE = "https://loomybox-bankend.onrender.com/api";

// When you open the site from your own computer it talks to your local server;
// anywhere else (Cloudflare Pages, your domain) it talks to the live backend.
const IS_LOCAL = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE = IS_LOCAL ? "http://localhost:4000/api" : LIVE_API_BASE;

async function apiRequest(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request to ${path} failed (${res.status})`);
  }
  return data;
}

const Api = {
  getCategories: () => apiRequest("/categories"),
  getVendors: (categorySlug) =>
    apiRequest(`/vendors${categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : ""}`),
  createBooking: (payload) =>
    apiRequest("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  payBooking: (id, amount) =>
    apiRequest(`/bookings/${id}/pay`, { method: "POST", body: JSON.stringify({ amount }) }),

  vendorLogin: (email, password) =>
    apiRequest("/vendors/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getMyBookings: (token) =>
    apiRequest("/bookings/mine", { headers: { Authorization: `Bearer ${token}` } }),
  setBookingStatus: (id, status, token) =>
    apiRequest(`/bookings/${id}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    }),
};
