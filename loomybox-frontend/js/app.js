let categories = [];
let vendorsByCategory = {}; // slug -> vendor[]

async function bootstrap() {
  categories = await Api.getCategories();
  const allVendors = await Api.getVendors();
  vendorsByCategory = {};
  for (const v of allVendors) {
    (vendorsByCategory[v.category] = vendorsByCategory[v.category] || []).push(v);
  }
  renderCategoryGrid();
  renderCategorySelects();
  renderFeaturedVendors(allVendors.slice(0, 3));
}

function renderCategoryGrid() {
  const grid = document.getElementById("cat-grid");
  grid.innerHTML = "";
  categories.forEach((c) => {
    const meta = categoryMeta[c.slug] || { icon: "" };
    const vendors = vendorsByCategory[c.slug] || [];
    const from = vendors.length ? `From AED ${Math.min(...vendors.map((v) => v.price_from))}` : "Coming soon";
    const el = document.createElement("button");
    el.className = "cat-card";
    el.onclick = () => openBookingFor(c.slug);
    el.innerHTML = `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${meta.icon}</svg>
      <h3>${c.name}</h3><p>${from}</p>`;
    grid.appendChild(el);
  });
}

function renderCategorySelects() {
  const heroSelect = document.getElementById("hero-category");
  const modalSelect = document.getElementById("modal-category");
  const options = categories.map((c) => `<option value="${c.slug}">${c.name}</option>`).join("");
  heroSelect.innerHTML = options;
  modalSelect.innerHTML = options;
}

function renderFeaturedVendors(vendors) {
  const grid = document.getElementById("vendor-grid");
  grid.innerHTML = "";
  vendors.forEach((v) => {
    const el = document.createElement("div");
    el.className = "vendor-card";
    el.innerHTML = `<div class="vendor-thumb"></div>
      <div class="vendor-body">
        <div class="vendor-tag">${v.category_name}</div>
        <div class="vendor-name">${v.name}</div>
        <div class="vendor-meta">${v.rating.toFixed(1)} rating</div>
        <div class="vendor-foot">
          <div class="vendor-price">AED ${v.price_from} <span>${v.price_unit}</span></div>
          <div style="display:flex;gap:6px;">
            <a class="btn" style="text-decoration:none;" href="vendor-profile.html?id=${v.id}">View</a>
            <button class="btn btn-primary" onclick="openBookingFor('${v.category}', ${v.id})">Book now</button>
          </div>
        </div>
      </div>`;
    grid.appendChild(el);
  });
}

function renderField([label, type, key, extra]) {
  if (type === "select") {
    const opts = extra.map((o) => `<option>${o}</option>`).join("");
    return `<div class="field"><label class="field-label">${label}</label><select data-key="${key}">${opts}</select></div>`;
  }
  return `<div class="field"><label class="field-label">${label}</label><input type="${type}" data-key="${key}" placeholder="${extra}"></div>`;
}

function populateVendorSelect(slug, preselectVendorId) {
  const vendorSelect = document.getElementById("modal-vendor");
  const vendors = vendorsByCategory[slug] || [];
  vendorSelect.innerHTML = vendors
    .map((v) => `<option value="${v.id}">${v.name} — AED ${v.price_from} ${v.price_unit}</option>`)
    .join("");
  if (preselectVendorId) vendorSelect.value = String(preselectVendorId);
}

function onCategoryChange() {
  const slug = document.getElementById("modal-category").value;
  populateVendorSelect(slug);
  renderDynamicFields();
}

function renderDynamicFields() {
  const slug = document.getElementById("modal-category").value;
  const category = categories.find((c) => c.slug === slug);
  const meta = categoryMeta[slug];
  document.getElementById("dynamic-fields").innerHTML = meta.fields.map(renderField).join("");
  document.getElementById("payment-note").textContent = category && category.deposit_required
    ? `This category typically takes a ${category.deposit_percent}% deposit now, with the balance due before the event.`
    : "This category is usually paid in full at the time of booking.";
  document.getElementById("form-error").innerHTML = "";
}

function getCustomerSession() {
  try {
    return {
      token: sessionStorage.getItem("loomybox_customer_token"),
      name: sessionStorage.getItem("loomybox_customer_name"),
    };
  } catch {
    return { token: null, name: null };
  }
}

function openBookingFor(slug, vendorId) {
  document.getElementById("modal-category").value = slug;
  populateVendorSelect(slug, vendorId);
  renderDynamicFields();

  const { name } = getCustomerSession();
  if (name) {
    document.getElementById("modal-name").value = name;
  }

  document.getElementById("modal-form-view").style.display = "block";
  document.getElementById("modal-confirm-view").style.display = "none";
  document.getElementById("modal-overlay").classList.add("open");
}
function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
}
document.getElementById("modal-overlay").addEventListener("click", (e) => {
  if (e.target.id === "modal-overlay") closeModal();
});

async function submitBooking() {
  const errorBox = document.getElementById("form-error");
  errorBox.innerHTML = "";

  const slug = document.getElementById("modal-category").value;
  const vendorId = Number(document.getElementById("modal-vendor").value);
  const name = document.getElementById("modal-name").value.trim();
  const email = document.getElementById("modal-email").value.trim();
  const date = document.getElementById("modal-date").value;
  const time = document.getElementById("modal-time").value;

  if (!name || !email || !date || !vendorId) {
    errorBox.innerHTML = '<div class="error-text">Please fill in your name, email, a vendor, and a date.</div>';
    return;
  }

  const category = categories.find((c) => c.slug === slug);
  const vendor = (vendorsByCategory[slug] || []).find((v) => v.id === vendorId);
  const meta = categoryMeta[slug];

  const details = {};
  document.querySelectorAll("#dynamic-fields [data-key]").forEach((el) => {
    details[el.dataset.key] = el.value;
  });

  const quantity = meta.quantityField && Number(details[meta.quantityField]) > 0
    ? Number(details[meta.quantityField])
    : 1;
  const amountTotal = vendor ? Math.round(vendor.price_from * quantity) : null;

  const { token } = getCustomerSession();

  try {
    const booking = await Api.createBooking({
      vendorId,
      categoryId: category.id,
      customerName: name,
      customerEmail: email,
      date,
      time,
      details,
      amountTotal,
    }, token);
    document.getElementById("confirm-text").textContent =
      `Your ${category.name.toLowerCase()} request with ${vendor.name} for ${date} has been sent` +
      (amountTotal ? ` (estimated total: AED ${amountTotal}).` : ".") +
      " The vendor usually responds within a few hours.";
    document.getElementById("modal-form-view").style.display = "none";
    document.getElementById("modal-confirm-view").style.display = "block";
  } catch (err) {
    errorBox.innerHTML = `<div class="error-text">${err.message}</div>`;
  }
}

function updateAccountNav() {
  const { name } = getCustomerSession();
  const link = document.getElementById("account-link");
  if (link && name) link.textContent = name.split(" ")[0];
}

bootstrap().catch((err) => {
  console.error(err);
  document.getElementById("cat-grid").innerHTML =
    `<p style="color:var(--wine)">Couldn't reach the Loomybox API. Is the backend running on http://localhost:4000?</p>`;
});
updateAccountNav();
