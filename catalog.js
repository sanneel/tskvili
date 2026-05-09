const BACKEND_URL = 'https://dropos-production.up.railway.app';
const API_BASE    = `${BACKEND_URL}/api`;

let CATALOG = [];

// Simple SPA Logic
document.addEventListener('DOMContentLoaded', async () => {
  const bento        = document.getElementById('bento');
  const pillIndicator= document.getElementById('pillIndicator');
  const links        = document.querySelectorAll('.slider-link');
  const viewGallery  = document.getElementById('viewGallery');
  const viewProfile  = document.getElementById('viewProfile');
  const aboutSheet   = document.getElementById('aboutSheet');
  const backBtn      = document.getElementById('backToGallery');
  const aboutClose   = document.getElementById('aboutClose');

  const ig = window.IG_USERNAME_OVERRIDE || 'tskvili';

  // ── Render gallery ──
  function render(filter = 'All') {
    const items = filter === 'All' ? CATALOG : CATALOG.filter(i => i.category === filter);
    bento.innerHTML = items.map(item => `
      <div class="card" data-id="${item.id}">
        <div class="card-image" style="background-image: url('${item.images[0] || ''}'); background-size: cover; background-position: center;"></div>
        <div class="card-body">
          <div class="card-title">${item.name}</div>
          <div class="card-atelier">${item.atelier}</div>
        </div>
      </div>
    `).join('');
    bento.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => openProfile(card.dataset.id));
    });
  }

  // ── Open profile view ──
  function openProfile(id) {
    const item = CATALOG.find(i => i.id == id);
    if (!item) return;

    document.getElementById('profileTag').textContent    = item.aesthetic;
    document.getElementById('profileTitle').textContent  = item.name;
    document.getElementById('profileSubtitle').textContent = item.subtitle;
    document.getElementById('profileStory').textContent  = item.story;
    document.getElementById('profileEdition').textContent= item.edition;
    document.getElementById('profileImage').style.background =
      `url('${item.images[0] || ''}') center/cover`;

    const matList = document.getElementById('profileMaterials');
    matList.innerHTML = item.materials.map(([k, v]) =>
      `<li><span>${k}</span><span>${v}</span></li>`).join('');

    const cta = document.getElementById('profileCTA');
    cta.href = `https://instagram.com/${ig}`;

    // Related items
    const related = CATALOG.filter(i => i.id != id);
    document.getElementById('relatedRow').innerHTML = related.map(r => `
      <div class="related-card" data-id="${r.id}">
        <div class="related-card-image" style="background-image: url('${r.images[0] || ''}'); background-size: cover; background-position: center;"></div>
        <div class="related-card-title">${r.name}</div>
        <div class="related-card-atelier">${r.atelier}</div>
      </div>
    `).join('');
    document.querySelectorAll('.related-card').forEach(card => {
      card.addEventListener('click', () => openProfile(card.dataset.id));
    });

    viewGallery.classList.add('hidden');
    viewProfile.classList.remove('hidden');
    viewProfile.removeAttribute('aria-hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Back to gallery ──
  backBtn.addEventListener('click', () => {
    viewProfile.classList.add('hidden');
    viewProfile.setAttribute('aria-hidden', 'true');
    viewGallery.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Pill nav ──
  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      pillIndicator.style.width     = `${link.offsetWidth}px`;
      pillIndicator.style.transform = `translateX(${link.offsetLeft}px)`;

      if (link.dataset.filter === 'About') {
        aboutSheet.classList.add('open');
        aboutSheet.removeAttribute('aria-hidden');
      } else {
        render(link.dataset.filter);
      }
    });
  });

  // ── About sheet ──
  aboutClose.addEventListener('click', () => {
    aboutSheet.classList.remove('open');
    aboutSheet.setAttribute('aria-hidden', 'true');
    // reset active pill to All
    links.forEach(l => l.classList.remove('active'));
    links[0].classList.add('active');
    pillIndicator.style.width     = `${links[0].offsetWidth}px`;
    pillIndicator.style.transform = `translateX(${links[0].offsetLeft}px)`;
  });
  aboutSheet.addEventListener('click', e => {
    if (e.target === aboutSheet) aboutClose.click();
  });

  function getImageUrl(src) {
      if (!src) return '';
      if (src.startsWith('/api/')) {
          return BACKEND_URL + src;
      }
      if (src.startsWith('http')) {
          return `${API_BASE}/image?url=${encodeURIComponent(src)}`;
      }
      return src;
  }

  // ── Init ──
  try {
    const res = await fetch(API_BASE + '/catalog?limit=24');
    const data = await res.json();
    const fresh = data.products || [];
    CATALOG = fresh.map(p => ({
      id: p.id,
      name: p.product_name || p.title_translated || 'Product',
      atelier: 'ID: ' + p.id,
      category: p.category || 'Home',
      aesthetic: 'წყვილი · Tskvili',
      subtitle: '',
      story: '',
      images: (p.images || []).map(getImageUrl),
      materials: [['ფასი', (p.sell_price_eur || 0) + ' EUR']],
      edition: '',
      label: p.category || 'Curated',
    }));
  } catch (err) {
    console.error('Failed to fetch catalog:', err);
  }

  render();
  const active = document.querySelector('.slider-link.active');
  if (active) {
    pillIndicator.style.width     = `${active.offsetWidth}px`;
    pillIndicator.style.transform = `translateX(${active.offsetLeft}px)`;
  }
});