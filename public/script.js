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
