// Front-end-only metadata: icons, booking form fields, and which field (if any)
// multiplies against the vendor's price to estimate a total. The category list,
// deposit rules, and vendors themselves all come from the backend.
const categoryMeta = {
  photo: { icon: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l1.5-3h5L16 7"/><circle cx="12" cy="13.5" r="3.5"/>',
    fields: [["Shoot location", "text", "location", "e.g. studio or outdoor"], ["Duration (hours)", "number", "hours", "e.g. 3"]], quantityField: null },
  catering: { icon: '<path d="M5 11h14l-1.5 8h-11L5 11z"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    fields: [["Number of guests", "number", "guests", "e.g. 80"], ["Cuisine preference", "text", "cuisine", "e.g. Arabic, continental"], ["Venue address", "text", "venue", "Where should we cater?"]], quantityField: "guests" },
  hamper: { icon: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M4 13h16"/><path d="M12 9v11"/>',
    fields: [["Delivery address", "text", "address", "Full delivery address"], ["Hamper theme", "select", "theme", ["Birthday", "Congratulations", "Wedding"]]], quantityField: null },
  local: { icon: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M9 6v12" stroke-dasharray="2 2"/>',
    fields: [["Event name", "text", "eventName", "e.g. Riverside food fest"], ["Number of tickets", "number", "tickets", "e.g. 4"]], quantityField: "tickets" },
  bus: { icon: '<rect x="4" y="10" width="16" height="9" rx="1.5"/><path d="M4 10l8-5 8 5"/><path d="M12 5v14"/>',
    fields: [["Pickup point", "text", "pickup", "e.g. Dubai Mall"], ["Drop-off point", "text", "dropoff", "e.g. Al Ain oasis"], ["Passengers", "number", "passengers", "e.g. 25"]], quantityField: null },
  wedding: { icon: '<circle cx="9" cy="14" r="4"/><circle cx="15" cy="14" r="4"/>',
    fields: [["Guest count", "number", "guests", "e.g. 150"], ["Package tier", "select", "package", ["Essential", "Premium", "Luxury"]], ["Venue address", "text", "venue", "Wedding venue location"]], quantityField: null },
  birthday: { icon: '<rect x="6" y="10" width="12" height="9" rx="1.5"/><path d="M6 14h12" stroke-dasharray="2 2"/>',
    fields: [["Guest count", "number", "guests", "e.g. 25"], ["Venue or location", "text", "venue", "Home, hall, or park"], ["Theme", "text", "theme", "e.g. superheroes, princess"]], quantityField: "guests" },
};
