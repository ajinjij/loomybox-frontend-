// Change this if your backend runs somewhere other than localhost:4000
const API_BASE = "http://localhost:4000/api";

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
  createBooking: (payload, customerToken) =>
    apiRequest("/bookings", {
      method: "POST",
      headers: customerToken ? { Authorization: `Bearer ${customerToken}` } : {},
      body: JSON.stringify(payload),
    }),
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

  customerSignup: (name, email, password) =>
    apiRequest("/customers/signup", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  customerLogin: (email, password) =>
    apiRequest("/customers/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getMyBookingsAsCustomer: (token) =>
    apiRequest("/bookings/mine-as-customer", { headers: { Authorization: `Bearer ${token}` } }),
  getVendor: (id) => apiRequest(`/vendors/${id}`),
};
