// Shared JS for all pages (non-breaking)

(function () {
  'use strict';

  // Initialize Bootstrap tooltips if the page uses them.
  document.addEventListener('DOMContentLoaded', function () {
    if (window.bootstrap && window.bootstrap.Tooltip) {
      var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.forEach(function (el) {
        try {
          // eslint-disable-next-line no-new
          new window.bootstrap.Tooltip(el);
        } catch (e) {
          // Ignore tooltip init errors
        }
      });
    }
  });

  function getCart() {
    try {
      var raw = localStorage.getItem('cartItems');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function setCart(cart) {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cart));
    } catch (e) {
      // Ignore storage errors
    }
  }

  function renderCartFromStorage() {
    var tableBody = document.getElementById('cartTableBody');
    if (!tableBody) return; // only on cart page

    var subtotalEl = document.getElementById('cartSubtotal');
    var shippingEl = document.getElementById('cartShipping');
    var totalEl = document.getElementById('cartTotal');

    var cart = getCart();

    // Price mapping (must match product names used in data-name)
    var prices = {
      'Royal Oud': 850,
      'Velvet Rose': 650,
      'Midnight Musk': 750,
      'Citrus Bloom': 550,
      'Golden Amber': 700,
      'Ocean Breeze': 600
    };

    // Bottle images (add real assets here)
    var bottleImages = {
      'Royal Oud': 'placeholder-perfume-royal-oud.svg',
      'Velvet Rose': 'velvet-rose.svg',
      'Midnight Musk': 'midnight-musk.svg',
      'Citrus Bloom': 'citrus-bloom.svg',
      'Golden Amber': 'golden-amber.svg',
      'Ocean Breeze': 'ocean-breeze.svg'
    };

    var shipping = 50;

    var items = Object.keys(cart)
      .map(function (name) { return { name: name, qty: cart[name] || 0 }; })
      .filter(function (it) { return it.qty > 0; });

    tableBody.innerHTML = '';

    var subtotal = 0;

    if (items.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Your cart is empty.</td></tr>';
      if (subtotalEl) subtotalEl.textContent = 'P0.00';
      if (shippingEl) shippingEl.textContent = 'P' + shipping.toFixed(2);
      if (totalEl) totalEl.textContent = 'P' + shipping.toFixed(2);
      return;
    }

    items.forEach(function (it) {
      var unit = prices[it.name] || 0;
      var lineTotal = unit * it.qty;
      subtotal += lineTotal;

      // Use the provided universal bottle image and add a label overlay.
      var universalBottleUrl = 'https://thumbs.dreamstime.com/b/crystal-clear-perfume-bottle-pink-cap-white-background-modern-fragrance-design-mockup-elegant-transparent-half-full-331843416.jpg';
      var bottle = universalBottleUrl;
      var productLabel = it.name + ' Perfume';

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' +
          '<div class="cart-product-cell">' +
            '<div class="cart-bottle-wrap">' +
              (bottle ? '<img class="cart-bottle-img" src="' + bottle + '" alt="' + it.name + '">' : '') +
              '<div class="cart-bottle-label">' + it.name + '</div>' +
            '</div>' +
            '<div class="cart-product-meta">' +
              '<div class="cart-product-name">' + productLabel + '</div>' +
              '<div class="cart-product-actions">' +
                '<button type="button" class="cart-remove-btn btn btn-sm" data-name="' + it.name + '">Remove</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td>' +
          '<div class="cart-qty-controls">' +
            '<button type="button" class="cart-qty-btn btn btn-sm" data-action="dec" data-name="' + it.name + '">−</button>' +
            '<span class="cart-qty-value" data-name="' + it.name + '">' + it.qty + '</span>' +
            '<button type="button" class="cart-qty-btn btn btn-sm" data-action="inc" data-name="' + it.name + '">+</button>' +
          '</div>' +
        '</td>' +
        '<td>P' + unit.toFixed(2) + '</td>' +
        '<td>P' + lineTotal.toFixed(2) + '</td>';

      tableBody.appendChild(tr);
    });

    var total = subtotal + shipping;

    if (subtotalEl) subtotalEl.textContent = 'P' + subtotal.toFixed(2);
    if (shippingEl) shippingEl.textContent = 'P' + shipping.toFixed(2);
    if (totalEl) totalEl.textContent = 'P' + total.toFixed(2);
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderCartFromStorage();
  });

  document.addEventListener('click', function (e) {
    var target = e.target;
    if (!target) return;

    // 1) Cart page controls (inc/dec/remove)
    var qtyBtn = target.closest ? target.closest('.cart-qty-btn') : null;
    if (qtyBtn) {
      var action = qtyBtn.getAttribute('data-action');
      var name = qtyBtn.getAttribute('data-name');
      if (!action || !name) return;

      var cart = getCart();
      var current = cart[name] || 0;
      if (action === 'inc') {
        cart[name] = current + 1;
      } else if (action === 'dec') {
        cart[name] = Math.max(0, current - 1);
      }
      if (cart[name] <= 0) delete cart[name];
      setCart(cart);
      renderCartFromStorage();
      return;
    }

    var removeBtn = target.closest ? target.closest('.cart-remove-btn') : null;
    if (removeBtn) {
      var removeName = removeBtn.getAttribute('data-name');
      if (!removeName) return;

      var cart2 = getCart();
      if (cart2[removeName]) delete cart2[removeName];
      setCart(cart2);
      renderCartFromStorage();
      return;
    }

    // 2) Listing pages "Add to Cart"
    var btn = target.closest ? target.closest('.submit-btn') : null;
    if (!btn) return;

    var productCard = btn.closest ? btn.closest('.product-card') : null;
    if (!productCard) return;

    var perfumeEl = productCard.querySelector && productCard.querySelector('.perfume-img[data-name]');
    if (!perfumeEl) return;

    var name2 = perfumeEl.getAttribute('data-name');
    if (!name2) return;

    var cart3 = getCart();
    cart3[name2] = (cart3[name2] || 0) + 1;
    setCart(cart3);

    try {
      window.location.href = 'cart&checkout.html';
    } catch (err) {
      // Ignore redirect errors
    }
  });
})();



