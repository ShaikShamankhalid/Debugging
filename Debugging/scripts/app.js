/*
====================================
Roll Number : 261FB04039
Project     : CampusCafe
Technology  : HTML, CSS, JavaScript
====================================
*/

const menuGrid = document.getElementById("menu-grid");
const cartList = document.getElementById("cart-list");
const cartSubtotalEl = document.getElementById("cart-subtotal");
const cartCountEl = document.getElementById("cart-count");
const cartMsgEl = document.getElementById("cart-msg");
const checkoutBtn = document.getElementById("checkout-btn");

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem("campus_cart"));
    if (!Array.isArray(savedCart)) return [];

    return savedCart
      .filter((item) => item && Number.isFinite(Number(item.id)))
      .map((item) => ({
        id: Number(item.id),
        name: String(item.name || ""),
        price: Number(item.price) || 0,
        qty: Math.max(1, Number(item.qty) || 1)
      }));
  } catch (error) {
    return [];
  }
}

let cart = loadCart();
let activeCategory = "all";
let searchText = "";

function renderMenu(items) {
  menuGrid.innerHTML = "";

  if (items.length === 0) {
    menuGrid.innerHTML = '<p class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 2rem 0;">No items found matching your search.</p>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="card-header">
        <span class="category-tag">${item.category}</span>
        <span class="price">₹${item.price}</span>
      </div>
      <h3>${item.name}</h3>
      <p style="font-size: 0.85rem; color: #6b7280;">${item.description}</p>
      <button class="btn btn-primary add-btn" data-id="${item.id}">Add to Cart</button>
    `;
    menuGrid.appendChild(card);
  });

  document.querySelectorAll(".add-btn").forEach((addButton) => {
    addButton.addEventListener("click", () => {
      const id = Number(addButton.dataset.id);
      addToCart(id);
    });
  });
}

function addToCart(itemId) {
  const found = MENU_ITEMS.find((item) => item.id === itemId);
  if (!found) return;

  const existing = cart.find((item) => item.id === itemId);
  if (existing) {
    existing.qty = (Number(existing.qty) || 1) + 1;
  } else {
    cart.push({
      id: found.id,
      name: found.name,
      price: Number(found.price),
      qty: 1
    });
  }

  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem("campus_cart", JSON.stringify(cart));
}

function renderCart() {
  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = '<li class="empty-state">Your cart is empty.</li>';
  } else {
    cartMsgEl.textContent = "";
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "cart-row";
      li.innerHTML = `
        <span>${item.name}</span>
        <div class="qty-controls">
          <button class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease ${item.name} quantity">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase ${item.name} quantity">+</button>
          <span>₹${Number(item.price) * item.qty}</span>
        </div>
      `;
      cartList.appendChild(li);
    });

    document.querySelectorAll(".qty-btn").forEach((button) => {
      button.addEventListener("click", () => {
        changeQuantity(Number(button.dataset.id), button.dataset.action);
      });
    });
  }

  let subtotal = 0;
  cart.forEach((item) => {
    subtotal += Number(item.price) * (Number(item.qty) || 1);
  });

  cartSubtotalEl.textContent = Number.isInteger(subtotal) ? subtotal : subtotal.toFixed(2);
  cartCountEl.textContent = cart.reduce(
    (count, item) => count + (Number(item.qty) || 1),
    0
  );
}

function changeQuantity(itemId, action) {
  const item = cart.find((cartItem) => cartItem.id === itemId);
  if (!item) return;

  item.qty = (Number(item.qty) || 1) + (action === "increase" ? 1 : -1);
  if (item.qty <= 0) {
    cart = cart.filter((cartItem) => cartItem.id !== itemId);
  }

  saveCart();
  renderCart();
}

function filterMenu() {
  const visibleItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchText);
    return matchesCategory && matchesSearch;
  });
  renderMenu(visibleItems);
}

document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    filterMenu();
  });
});

document.getElementById("search-input").addEventListener("input", (event) => {
  searchText = event.target.value.trim().toLowerCase();
  filterMenu();
});

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    cartMsgEl.textContent = "Your cart is empty. Add an item before checkout.";
    return;
  }
  cartMsgEl.textContent = "";
  window.location.href = "pages/checkout.html";
});

// Initialize page
renderMenu(MENU_ITEMS);
renderCart();
