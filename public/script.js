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

bStart.addEventListener('change', updateCostPreview);
bEnd.addEventListener('change', updateCostPreview);

btnTextSearch.addEventListener('click', async () => {
  const q = searchQuery.value.trim();
  if (!q) { showToast('Please enter a search term.', 'warning'); return; }

  searchGrid.innerHTML = '<p class="loading">Searching…</p>';
  searchAlgoBadge.classList.add('hidden');

  try {
    const data = await apiFetch(`/cars/search?q=${encodeURIComponent(q)}`);
    searchAlgoBadge.textContent =
      `⚙ Algorithm: ${data.algorithm}  ·  Query: "${data.query}"  ·  ${data.count} result(s)`;
    searchAlgoBadge.classList.remove('hidden');
    renderGrid(searchGrid, data.cars);
  } catch (err) {
    searchGrid.innerHTML = `<p class="empty-state">Error: ${err.message}</p>`;
  }
});

btnPriceSearch.addEventListener('click', async () => {
  const max = priceSlider.value;
  searchGrid.innerHTML = '<p class="loading">Searching…</p>';
  searchAlgoBadge.classList.add('hidden');

  try {
    const data = await apiFetch(`/cars/search/price?maxPrice=${max}`);
    searchAlgoBadge.textContent =
      `⚙ Algorithm: ${data.algorithm}  ·  Max Price: $${data.maxPrice}/day  ·  ${data.count} result(s)`;
    searchAlgoBadge.classList.remove('hidden');
    renderGrid(searchGrid, data.cars);
  } catch (err) {
    searchGrid.innerHTML = `<p class="empty-state">Error: ${err.message}</p>`;
  }
});

searchQuery.addEventListener('keydown', e => {
  if (e.key === 'Enter') btnTextSearch.click();
});

async function openBookingModal(car) {
  currentCarId = car.id;

  modalCarLabel.textContent = `${car.available ? 'Book' : 'Join Waitlist for'} ${car.brand} ${car.model}`;
  modalCarMeta.textContent  = `${car.type} · ${car.location} · $${car.pricePerDay}/day · ⭐ ${car.rating}`;
  modalCarId.value = car.id;
  costPreview.classList.add('hidden');

  if (!car.available) {
    try {
      const wl = await apiFetch(`/bookings/waitlist/${car.id}`);
      waitlistInfo.textContent =
        `⚠ This car is currently unavailable. ${wl.count > 0
          ? `${wl.count} person(s) are ahead of you in the queue.`
          : 'You will be first in the queue!'}`;
      waitlistInfo.classList.remove('hidden');
    } catch {
      waitlistInfo.classList.add('hidden');
    }
    btnBookConfirm.textContent = '📋 Join Waitlist';
    btnBookConfirm.className   = 'btn btn-warning full-width';
  } else {
    waitlistInfo.classList.add('hidden');
    btnBookConfirm.textContent = '✓ Confirm Booking';
    btnBookConfirm.className   = 'btn btn-primary full-width';
  }

  const today = new Date().toISOString().split('T')[0];
  bStart.min = today;
  bEnd.min   = today;
  bStart.value = '';
  bEnd.value   = '';
  bName.value  = '';

  bookingModal.classList.remove('hidden');
  bName.focus();
}

modalClose.addEventListener('click', () => bookingModal.classList.add('hidden'));
bookingModal.addEventListener('click', e => {
  if (e.target === bookingModal) bookingModal.classList.add('hidden');
});

bookingForm.addEventListener('submit', async e => {
  e.preventDefault();

  const payload = {
    carId:     modalCarId.value,
    userName:  bName.value.trim(),
    startDate: bStart.value,
    endDate:   bEnd.value,
  };

  if (!payload.userName) { showToast('Please enter your name.', 'warning'); return; }
  if (!payload.startDate || !payload.endDate) {
    showToast('Please select both dates.', 'warning'); return;
  }
  if (new Date(payload.endDate) <= new Date(payload.startDate)) {
    showToast('End date must be after start date.', 'warning'); return;
  }

  btnBookConfirm.disabled = true;
  btnBookConfirm.textContent = 'Processing…';

  try {
    const data = await apiFetch('/bookings', {
      method: 'POST',
      body:   JSON.stringify(payload),
    });

    bookingModal.classList.add('hidden');

    if (data.status === 'confirmed') {
      showToast(`✅ ${data.message}`, 'success', 5000);
    } else {
      showToast(`📋 ${data.message}`, 'warning', 5000);
    }

    loadCars();
    if (document.getElementById('section-history').classList.contains('active')) {
      loadHistory();
    }

  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  } finally {
    btnBookConfirm.disabled = false;
  }
});

async function loadHistory() {
  historyList.innerHTML = '<p class="loading">Loading history…</p>';

  try {
    const data = await apiFetch('/bookings/history');

    if (!data.history.length) {
      historyList.innerHTML = '<p class="empty-state">No bookings in the stack yet.</p>';
      return;
    }

    historyList.innerHTML = '';
    data.history.forEach((b, idx) => {
      const card = document.createElement('div');
      card.className = 'history-card';

      const topBadge = idx === 0
        ? '<span class="badge badge-warning" style="margin-left:.5rem">← TOP</span>'
        : '';

      card.innerHTML = `
        <div>
          <h4>${b.carLabel} ${topBadge}
            <span class="stack-pos">Stack position: ${idx + 1}</span>
            ${b.promotedFrom ? '<span class="badge badge-info" style="margin-left:.4rem">From Waitlist</span>' : ''}
          </h4>
          <p>👤 ${b.userName}  ·  📅 ${b.startDate} → ${b.endDate}  ·  ${b.days} day(s)</p>
          <p style="margin-top:.2rem; font-size:.75rem; color:var(--muted)">
            Booked at: ${new Date(b.timestamp).toLocaleString()}
          </p>
        </div>
        <div class="cost">$${b.totalCost}</div>
      `;

      historyList.appendChild(card);
    });
  } catch (err) {
    historyList.innerHTML = `<p class="empty-state">Error: ${err.message}</p>`;
  }
}

btnUndo.addEventListener('click', async () => {
  if (!confirm('Undo the last booking? This will restore the car\'s availability.')) return;

  try {
    const data = await apiFetch('/bookings/undo', { method: 'DELETE' });
    let msg = `↩ ${data.message}`;
    if (data.promoted) {
      msg += ` · ${data.promoted.userName} from the waitlist was auto-promoted!`;
    }
    showToast(msg, 'success', 6000);
    loadHistory();
    loadCars();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
});

async function loadAdminTable() {
  adminTbody.innerHTML = '<tr><td colspan="7" class="loading">Loading…</td></tr>';

  try {
    const data = await apiFetch('/cars');

    if (!data.cars.length) {
      adminTbody.innerHTML = '<tr><td colspan="7" class="empty-state">No cars found.</td></tr>';
      return;
    }

    adminTbody.innerHTML = '';
    data.cars.forEach(car => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${car.brand} ${car.model}</strong></td>
        <td>${car.type}</td>
        <td>${car.location}</td>
        <td>$${car.pricePerDay}</td>
        <td>⭐ ${car.rating}</td>
        <td>
          <span class="badge ${car.available ? 'badge-available' : 'badge-unavailable'}">
            ${car.available ? 'Yes' : 'No'}
          </span>
        </td>
        <td>
          <div class="action-btns">
            <button class="btn btn-secondary btn-sm" data-edit="${car.id}">Edit</button>
            <button class="btn btn-danger btn-sm"    data-delete="${car.id}">Delete</button>
          </div>
        </td>
      `;

      tr.querySelector(`[data-edit]`).addEventListener('click', () => openEditForm(car));
      tr.querySelector(`[data-delete]`).addEventListener('click', () => deleteCar(car));

      adminTbody.appendChild(tr);
    });
  } catch (err) {
    adminTbody.innerHTML = `<tr><td colspan="7" class="empty-state">Error: ${err.message}</td></tr>`;
  }
}

btnShowAddForm.addEventListener('click', () => {
  carFormWrap.classList.toggle('hidden');
  if (!carFormWrap.classList.contains('hidden')) {
    formTitle.textContent      = 'Add New Car';
    formSubmitBtn.textContent  = 'Add Car';
    formCarId.value            = '';
    carForm.reset();
    carFormWrap.scrollIntoView({ behavior: 'smooth' });
  }
});

btnCancelForm.addEventListener('click', () => {
  carFormWrap.classList.add('hidden');
  carForm.reset();
  formCarId.value = '';
});

function openEditForm(car) {
  formTitle.textContent     = `Edit — ${car.brand} ${car.model}`;
  formSubmitBtn.textContent = 'Save Changes';
  formCarId.value = car.id;

  document.getElementById('f-brand').value    = car.brand;
  document.getElementById('f-model').value    = car.model;
  document.getElementById('f-type').value     = car.type;
  document.getElementById('f-location').value = car.location;
  document.getElementById('f-price').value    = car.pricePerDay;
  document.getElementById('f-rating').value   = car.rating;
  document.getElementById('f-mileage').value  = car.mileage;
  document.getElementById('f-image').value    = car.image;

  carFormWrap.classList.remove('hidden');
  carFormWrap.scrollIntoView({ behavior: 'smooth' });
}

carForm.addEventListener('submit', async e => {
  e.preventDefault();

  const id = formCarId.value;
  const payload = {
    brand:       document.getElementById('f-brand').value.trim(),
    model:       document.getElementById('f-model').value.trim(),
    type:        document.getElementById('f-type').value,
    location:    document.getElementById('f-location').value.trim(),
    pricePerDay: parseFloat(document.getElementById('f-price').value),
    rating:      parseFloat(document.getElementById('f-rating').value) || 0,
    mileage:     parseInt(document.getElementById('f-mileage').value)  || 0,
    image:       document.getElementById('f-image').value.trim(),
  };

  try {
    if (id) {
      await apiFetch(`/cars/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('✅ Car updated successfully!', 'success');
    } else {
      await apiFetch('/cars', { method: 'POST', body: JSON.stringify(payload) });
      showToast('✅ Car added successfully!', 'success');
    }

    carFormWrap.classList.add('hidden');
    carForm.reset();
    formCarId.value = '';
    loadAdminTable();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
});

async function deleteCar(car) {
  if (!confirm(`Delete ${car.brand} ${car.model}? This cannot be undone.`)) return;

  try {
    await apiFetch(`/cars/${car.id}`, { method: 'DELETE' });
    showToast(`🗑 ${car.brand} ${car.model} deleted.`, 'default');
    loadAdminTable();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
}

loadCars();
