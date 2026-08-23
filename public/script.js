'use strict';

let allCars       = [];
let currentCarId  = null;

const carsGrid        = document.getElementById('cars-grid');
const algoBadge       = document.getElementById('algo-badge');
const sortKey         = document.getElementById('sort-key');
const sortOrder       = document.getElementById('sort-order');
const sortAlgo        = document.getElementById('sort-algo');
const btnSort         = document.getElementById('btn-sort');

const searchQuery     = document.getElementById('search-query');
const btnTextSearch   = document.getElementById('btn-text-search');
const priceSlider     = document.getElementById('price-slider');
const priceLabel      = document.getElementById('price-label');
const btnPriceSearch  = document.getElementById('btn-price-search');
const searchGrid      = document.getElementById('search-results-grid');
const searchAlgoBadge = document.getElementById('search-algo-badge');

const historyList     = document.getElementById('history-list');
const btnUndo         = document.getElementById('btn-undo');

const adminTbody      = document.getElementById('admin-tbody');
const btnShowAddForm  = document.getElementById('btn-show-add-form');
const carFormWrap     = document.getElementById('car-form-wrap');
const carForm         = document.getElementById('car-form');
const formTitle       = document.getElementById('form-title');
const formCarId       = document.getElementById('form-car-id');
const formSubmitBtn   = document.getElementById('form-submit-btn');
const btnCancelForm   = document.getElementById('btn-cancel-form');

const bookingModal    = document.getElementById('booking-modal');
const modalClose      = document.getElementById('modal-close');
const modalCarLabel   = document.getElementById('modal-car-label');
const modalCarMeta    = document.getElementById('modal-car-meta');
const modalCarId      = document.getElementById('modal-car-id');
const waitlistInfo    = document.getElementById('waitlist-info');
const bookingForm     = document.getElementById('booking-form');
const bName           = document.getElementById('b-name');
const bStart          = document.getElementById('b-start');
const bEnd            = document.getElementById('b-end');
const costPreview     = document.getElementById('booking-cost-preview');
const btnBookConfirm  = document.getElementById('btn-book-confirm');

const toastEl = document.getElementById('toast');
let toastTimer;

function showToast(msg, type = 'default', duration = 3500) {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className   = `toast ${type}`;
  toastTimer = setTimeout(() => {
    toastEl.className = 'toast hidden';
  }, duration);
}

const navLinks   = document.querySelectorAll('.nav-link');
const sections   = document.querySelectorAll('.section');

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.dataset.section;

    navLinks.forEach(l => l.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));

    link.classList.add('active');
    document.getElementById(`section-${target}`).classList.add('active');

    if (target === 'browse')  loadCars();
    if (target === 'history') loadHistory();
    if (target === 'admin')   loadAdminTable();
  });
});
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function createCarCard(car, showBookBtn = true) {
  const card = document.createElement('div');
  card.className = 'car-card';

  const availBadge = car.available
    ? '<span class="badge badge-available">✓ Available</span>'
    : '<span class="badge badge-unavailable">✗ Unavailable</span>';

  card.innerHTML = `
    <img src="${car.image}" alt="${car.brand} ${car.model}" loading="lazy"
         onerror="this.src='https://placehold.co/300x180/888/white?text=No+Image'" />
    <div class="car-card-body">
      <div class="car-card-title">
        <span>${car.brand} ${car.model}</span>
        ${availBadge}
      </div>
      <div class="car-card-meta">
        <span>🏷 ${car.type}</span>
        <span>📍 ${car.location}</span>
        <span>⭐ ${renderStars(car.rating)} (${car.rating})</span>
        <span>🛣 ${car.mileage.toLocaleString()} km</span>
      </div>
      <div class="car-card-price">$${car.pricePerDay} <span>/ day</span></div>
    </div>
    <div class="car-card-footer">
      ${showBookBtn ? `<button class="btn btn-primary btn-sm" data-book="${car.id}">
        ${car.available ? 'Book Now' : '📋 Join Waitlist'}
      </button>` : '<span></span>'}
    </div>
  `;

  if (showBookBtn) {
    card.querySelector(`[data-book]`).addEventListener('click', () => openBookingModal(car));
  }

  return card;
}

function renderGrid(container, cars, showBookBtn = true) {
  container.innerHTML = '';
  if (!cars.length) {
    container.innerHTML = '<p class="empty-state">No cars found.</p>';
    return;
  }
  cars.forEach(car => container.appendChild(createCarCard(car, showBookBtn)));
}

async function loadCars(params = '') {
  carsGrid.innerHTML = '<p class="loading">Loading cars…</p>';
  algoBadge.classList.add('hidden');

  try {
    const data = await apiFetch(`/cars${params}`);
    allCars = data.cars;

    if (data.algorithm) {
      algoBadge.textContent =
        `⚙ Algorithm: ${data.algorithm}  ·  Sorted by: ${data.sortedBy}  ·  Order: ${data.order}`;
      algoBadge.classList.remove('hidden');
    }

    renderGrid(carsGrid, allCars);
  } catch (err) {
    carsGrid.innerHTML = `<p class="empty-state">Error: ${err.message}</p>`;
  }
}

btnSort.addEventListener('click', () => {
  const key   = sortKey.value;
  const order = sortOrder.value;
  const algo  = sortAlgo.value;

  if (!key) return loadCars();
  loadCars(`?sort=${key}&order=${order}&algo=${algo}`);
});

priceSlider.addEventListener('input', () => {
  priceLabel.textContent = `≤ $${priceSlider.value} / day`;
});

function updateCostPreview() {
  if (!currentCarId) return;
  const car   = allCars.find(c => c.id === currentCarId);
  if (!car) return;
  const start = new Date(bStart.value);
  const end   = new Date(bEnd.value);
  if (isNaN(start) || isNaN(end) || end <= start) {
    costPreview.classList.add('hidden');
    return;
  }
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const cost = (days * car.pricePerDay).toFixed(2);
  costPreview.textContent = `Estimated cost: ${days} day(s) × $${car.pricePerDay} = $${cost}`;
  costPreview.classList.remove('hidden');
}
