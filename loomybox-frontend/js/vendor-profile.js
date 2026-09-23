let vendor = null;

function getVendorIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id"));
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

async function bootstrap() {
  const id = getVendorIdFromUrl();
  const content = document.getElementById("profile-content");
  if (!id) {
    content.innerHTML = `<p style="padding:40px 0;color:var(--wine)">No vendor specified.</p>`;
    return;
  }
  try {
    vendor = await Api.getVendor(id);
  } catch (err) {
    content.innerHTML = `<p style="padding:40px 0;color:var(--wine)">${err.message}</p>`;
    return;
  }

  content.innerHTML = `
    <div class="profile-hero">
      <div class="profile-avatar"></div>
      <div>
        <div class="vendor-tag">${vendor.category_name}</div>
        <h1 class="profile-name">${vendor.name}</h1>
        <div class="profile-meta">${vendor.rating.toFixed(1)} rating · AED ${vendor.price_from} ${vendor.price_unit}</div>
        <p>${vendor.description || "No description provided yet."}</p>
        <button class="btn btn-primary" style="margin-top:8px;" onclick="openBooking()">Request booking</button>
      </div>
    </div>
    <div>
      <h3 style="margin-bottom:12px;">Recent work</h3>
      <div class="gallery"><div></div><div></div><div></div></div>
      <p style="color:var(--ink-soft);font-size:13px;">Portfolio photos aren't wired up yet — this space is reserved for the vendor's own gallery.</p>
    </div>
  `;
}

function renderField([label, type, key, extra]) {
  if (type === "select") {
    const opts = extra.map((o) => `<option>${o}</option>`).join("");
    return `<div class="field"><label class="field-label">${label}</label><select data-key="${key}">${opts}</select></div>`;
  }
  return `<div class="field"><label class="field-label">${label}</label><input type="${type}" data-key="${key}" placeholder="${extra}"></div>`;
}

function openBooking() {
  const meta = categoryMeta[vendor.category];
  document.getElementById("dynamic-fields").innerHTML = meta.fields.map(renderField).join("");
  document.getElementById("payment-note").textContent =
    "Payment terms (deposit or full amount) depend on this vendor's category and are confirmed at checkout.";
  document.getElementById("form-error").innerHTML = "";

  const { name } = getCustomerSession();
  if (name) document.getElementById("modal-name").value = name;

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

  const name = document.getElementById("modal-name").value.trim();
  const email = document.getElementById("modal-email").value.trim();
  const date = document.getElementById("modal-date").value;
  const time = document.getElementById("modal-time").value;

  if (!name || !email || !date) {
    errorBox.innerHTML = '<div class="error-text">Please fill in your name, email, and a date.</div>';
    return;
  }

  const meta = categoryMeta[vendor.category];
  const details = {};
  document.querySelectorAll("#dynamic-fields [data-key]").forEach((el) => {
    details[el.dataset.key] = el.value;
  });
  const quantity = meta.quantityField && Number(details[meta.quantityField]) > 0
    ? Number(details[meta.quantityField])
    : 1;
  const amountTotal = Math.round(vendor.price_from * quantity);

  const { token } = getCustomerSession();

  try {
    await Api.createBooking({
      vendorId: vendor.id,
      categoryId: vendor.category_id,
      customerName: name,
      customerEmail: email,
      date,
      time,
      details,
      amountTotal,
    }, token);
    document.getElementById("confirm-text").textContent =
      `Your request with ${vendor.name} for ${date} has been sent (estimated total: AED ${amountTotal}).`;
    document.getElementById("modal-form-view").style.display = "none";
    document.getElementById("modal-confirm-view").style.display = "block";
  } catch (err) {
    errorBox.innerHTML = `<div class="error-text">${err.message}</div>`;
  }
}

bootstrap();
