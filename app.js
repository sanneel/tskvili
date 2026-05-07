/* ───────────────────────────────────────────────────────
   Eternal Gallery — app.js (Georgian Headless Logic)
   Backend: https://dropos-production.up.railway.app
──────────────────────────────────────────────────────── */

'use strict';

// ── Config ────────────────────────────────────────────
const BACKEND_URL = 'https://dropos-production.up.railway.app';
const API_BASE    = `${BACKEND_URL}/api`;
const IG_HANDLE   = 'lovugifts'; // Replace with your handle
const PAGE_LIMIT  = 24;

// Georgian Category Mapping
const CAT_KEYWORDS = {
    all:            null,
    'for-her':      ['jewelry', 'bracelet', 'necklace', 'ring', 'earring', 'perfume', 'care', 'skincare', 'bag'],
    'for-him':      ['tech', 'gadget', 'wallet', 'watch', 'phone'],
    'for-couples':  ['couple', 'matching', 'set', 'game', 'romantic', 'home', 'candle'],
};

// ── State ─────────────────────────────────────────────
let state = {
    allProducts: [],
    filtered:    [],
    category:    'all',
    offset:      0,
    total:       0,
    loading:     false,
};

// ── DOM Refs ──────────────────────────────────────────
const $gallery  = document.getElementById('view-gallery');
const $profile  = document.getElementById('view-profile');
const $grid     = document.getElementById('bento-grid');
const $empty    = document.getElementById('empty-state');
const $loadBtn  = document.getElementById('load-more-btn');
const $pill     = document.getElementById('liquid-pill');
const $catBtns  = document.querySelectorAll('.cat-btn');

// ── Boot ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initCategoryNav();
    fetchProducts(false);
    
    $loadBtn.addEventListener('click', () => fetchProducts(true));

    window.addEventListener('popstate', (e) => {
        if (e.state?.view === 'profile' && e.state.id) {
            const p = state.allProducts.find(x => x.id === e.state.id);
            if (p) { renderProfileView(p, false); return; }
        }
        renderGalleryView(false);
    });
});

// ── Fetch ─────────────────────────────────────────────
async function fetchProducts(append = false) {
    if (state.loading) return;
    state.loading = true;

    if (!append) {
        state.offset = 0;
        state.allProducts = [];
        showSkeletons();
    }

    try {
        const offset = state.offset;
        // Fetch from the new consolidated catalog endpoint
        const res = await apiFetch(`/catalog?limit=${PAGE_LIMIT}&offset=${offset}`);

        const fresh = res.products || [];
        const seen = new Set(state.allProducts.map(p => p.id));
        const unique = fresh.filter(p => !seen.has(p.id));

        state.allProducts = append ? [...state.allProducts, ...unique] : unique;
        state.total = res.total || 0;
        state.offset = offset + PAGE_LIMIT;

        applyFilter();
    } catch (err) {

        console.error('Fetch error:', err);
        showEmpty();
    } finally {
        state.loading = false;
    }
}

async function apiFetch(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

// ── Image Proxy Logic ─────────────────────────────────
function imageUrl(src) {
    if (!src) return null;
    // Prepend backend URL for relative API paths (cleaned images)
    if (src.startsWith('/api/')) {
        return BACKEND_URL + src;
    }
    // Proxy standard HTTP images to avoid Referer blocks
    if (src.startsWith('http')) {
        return `${API_BASE}/image?url=${encodeURIComponent(src)}`;
    }
    return src;
}

// ── Category Nav ──────────────────────────────────────
function initCategoryNav() {
    $catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.cat;
            if (cat === state.category) return;
            state.category = cat;

            $catBtns.forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
            animatePill(btn);
            applyFilter();
        });
    });

    // Initial pill position
    requestAnimationFrame(() => animatePill(document.querySelector('.cat-btn.active')));
}

function animatePill(activeBtn) {
    if (!activeBtn || !$pill) return;
    const track = document.getElementById('category-track');
    const trackRect = track.getBoundingClientRect();
    const btnRect   = activeBtn.getBoundingClientRect();
    $pill.style.left  = (btnRect.left - trackRect.left) + 'px';
    $pill.style.width = btnRect.width + 'px';
}

// ── Filter & Render ───────────────────────────────────
function applyFilter() {
    const keywords = CAT_KEYWORDS[state.category];
    if (!keywords) {
        state.filtered = [...state.allProducts];
    } else {
        state.filtered = state.allProducts.filter(p => {
            const haystack = [
                p.category || '',
                p.keyword  || '',
                p.product_name || '',
                p.title_translated || '',
            ].join(' ').toLowerCase();
            return keywords.some(k => haystack.includes(k));
        });
    }
    renderGrid();
}

function renderGrid() {
    if (state.filtered.length === 0) { showEmpty(); return; }

    $empty.style.display = 'none';
    $grid.style.display  = 'grid';

    // Sort by score
    const sorted = [...state.filtered].sort((a, b) =>
        ((b.score ?? b.ai_score ?? 0) - (a.score ?? a.ai_score ?? 0))
    );

    $grid.innerHTML = sorted.map(p => `
        <article class="product-card" data-id="${p.id}">
            <div class="card-img-wrap">
                <img data-src="${imageUrl(p.images?.[0])}" alt="${p.product_name}" loading="lazy"/>
            </div>
            <div class="card-info">
                <div class="card-name">${esc(p.product_name || p.title_translated)}</div>
                <div class="card-price">₾${Number(p.sell_price_eur || 0).toFixed(0)}</div>
            </div>
        </article>
    `).join('');

    // Lazy load images
    $grid.querySelectorAll('img[data-src]').forEach(lazyLoad);

    // Attach click events
    $grid.querySelectorAll('.product-card').forEach(el => {
        el.addEventListener('click', () => {
            const id = parseInt(el.dataset.id, 10);
            const product = state.allProducts.find(p => p.id === id);
            if (product) renderProfileView(product, true);
        });
    });
}

// ── View Management ───────────────────────────────────
function renderProfileView(product, pushHistory = true) {
    $gallery.classList.add('melting');

    setTimeout(() => {
        $gallery.classList.remove('active', 'melting');
        $profile.classList.add('active', 'fading-in');

        const name    = product.product_name || product.title_translated;
        const story   = product.caption || product.description || 'დახვეწილი საჩუქარი, შერჩეული განსაკუთრებული მომენტებისთვის.';
        const price   = Number(product.sell_price_eur || 0).toFixed(0);
        const igLink  = `https://ig.me/m/${IG_HANDLE}?text=${encodeURIComponent(`გამარჯობა, მაინტერესებს ${name}`)}`;

        document.getElementById('profile-inner').innerHTML = `
            <div class="back-bar">
                <button class="back-btn" id="back-btn">← გალერეა</button>
            </div>
            <div class="profile-inner">
                <div class="profile-img-wrap">
                    <img src="${imageUrl(product.images?.[0])}" alt="${name}"/>
                </div>
                <div class="profile-details">
                    <p class="profile-label">კურატორული საჩუქარი</p>
                    <h1 class="profile-name">${esc(name)}</h1>
                    <p class="profile-price">₾${price}</p>
                    <div class="profile-divider"></div>
                    <p class="profile-story">${esc(story)}</p>
                    <a class="cta-btn" href="${igLink}" target="_blank" rel="noopener">
                        დეტალების გარკვევა
                    </a>
                    <p class="cta-sub">გაიხსნება Instagram-ში</p>
                </div>
            </div>
        `;

        document.getElementById('back-btn').addEventListener('click', () => renderGalleryView(true));
        window.scrollTo(0, 0);

        if (pushHistory) {
            history.pushState({ view: 'profile', id: product.id }, '', `#product-${product.id}`);
        }
        setTimeout(() => $profile.classList.remove('fading-in'), 500);
    }, 420);
}

function renderGalleryView(pushHistory = true) {
    $profile.classList.add('melting');

    setTimeout(() => {
        $profile.classList.remove('active', 'melting');
        $gallery.classList.add('active', 'fading-in');

        if (pushHistory) {
            history.pushState({ view: 'gallery' }, '', window.location.pathname);
        }
        setTimeout(() => $gallery.classList.remove('fading-in'), 500);
    }, 420);
}

// ── Utils ─────────────────────────────────────────────
function showSkeletons() {
    $grid.innerHTML = Array.from({ length: 6 }, () => '<div class="skeleton" style="aspect-ratio:3/4"></div>').join('');
}

function showEmpty() {
    $grid.style.display = 'none';
    $empty.style.display = 'block';
}

function lazyLoad(img) {
    const src = img.dataset.src;
    if (!src) return;
    img.src = src;
    img.onload = () => img.classList.add('loaded');
}

function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
