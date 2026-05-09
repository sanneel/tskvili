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
  const brandLogo    = document.getElementById('brandLogo');

  const ig = window.IG_USERNAME_OVERRIDE || 'tskvili';

  // ── Render gallery ──
  function render(filter = 'All') {
    const items = filter === 'All' ? CATALOG : CATALOG.filter(i => {
      if (filter === 'Girl') return i.category === 'female' || i.category === 'for-her' || i.category === 'Girl';
      if (filter === 'Boy') return i.category === 'male' || i.category === 'for-him' || i.category === 'Boy';
      return i.category === filter;
    });
    
    if (items.length === 0) {
      bento.innerHTML = `<div style="grid-column: 1/-1; padding: 100px 0; text-align: center; color: #666; font-family: var(--ff-b);">
        ამჟამად კატალოგი ცარიელია. გთხოვთ, მოგვიანებით შეამოწმოთ.<br>
        <span style="font-size: 12px; opacity: 0.7;">The catalog is currently empty. Please check back later.</span>
      </div>`;
      return;
    }

    bento.innerHTML = items.map(item => `
      <div class="card" data-id="${item.id}">
        ${item.images[0] ? `
          <div class="card-image" style="background-image: url('${item.images[0]}'); background-size: cover; background-position: center;"></div>
        ` : `
          <div class="card-image" style="background: var(--cream); display: flex; align-items: center; justify-content: center;">
            <span style="font-family: var(--serif); font-style: italic; color: var(--gold); opacity: 0.5;">Tskvili</span>
          </div>
        `}
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

    document.getElementById('profileTitle').textContent  = item.name;
    document.getElementById('profileSubtitle').textContent = item.subtitle;
    const profileImg = document.getElementById('profileImage');
    if (item.images[0]) {
      profileImg.style.backgroundImage = `url('${item.images[0]}')`;
      profileImg.style.backgroundSize = 'cover';
      profileImg.style.backgroundPosition = 'center';
      profileImg.innerHTML = '';
    } else {
      profileImg.style.backgroundImage = '';
      profileImg.style.background = 'var(--cream)';
      profileImg.innerHTML = '<div style="height:100%; display:flex; align-items:center; justify-content:center; font-family:var(--serif); font-style:italic; color:var(--gold); opacity:0.5; font-size:24px;">Tskvili</div>';
    }

    const storyEl = document.getElementById('profileStory');
    const storySection = storyEl.closest('.profile-section');
    if (item.story) {
      storyEl.textContent = item.story;
      storySection.classList.remove('hidden');
    } else {
      storySection.classList.add('hidden');
    }

    const matList = document.getElementById('profileMaterials');
    const matSection = matList.closest('.profile-section');
    if (item.materials && item.materials.length > 0) {
      matList.innerHTML = item.materials.map(([k, v]) =>
        `<li><span>${k}</span><span>${v}</span></li>`).join('');
      matSection.classList.remove('hidden');
    } else {
      matSection.classList.add('hidden');
    }

    const editionEl = document.getElementById('profileEdition');
    const editionSection = editionEl.closest('.profile-section');
    if (item.edition) {
      editionEl.textContent = item.edition;
      editionSection.classList.remove('hidden');
    } else {
      editionSection.classList.add('hidden');
    }

    const cta = document.getElementById('profileCTA');
    cta.href = item.instagram_url || `https://instagram.com/${ig}`;

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

  // ── Brand Logo Reset ──
  if (brandLogo) {
    brandLogo.addEventListener('click', () => {
      viewProfile.classList.add('hidden');
      viewProfile.setAttribute('aria-hidden', 'true');
      viewGallery.classList.remove('hidden');
      aboutSheet.classList.remove('open');
      aboutSheet.setAttribute('aria-hidden', 'true');
      
      const allLink = Array.from(links).find(l => l.dataset.filter === 'All');
      if (allLink) {
        links.forEach(l => l.classList.remove('active'));
        allLink.classList.add('active');
        pillIndicator.style.width     = `${allLink.offsetWidth}px`;
        pillIndicator.style.transform = `translateX(${allLink.offsetLeft}px)`;
        render('All');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

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
    links.forEach(l => l.classList.remove('active'));
    links[0].classList.add('active');
    pillIndicator.style.width     = `${links[0].offsetWidth}px`;
    pillIndicator.style.transform = `translateX(${links[0].offsetLeft}px)`;
  });

  function getImageUrl(src) {
      if (!src) return '';
      if (src.startsWith('/api/')) return BACKEND_URL + src;
      if (src.startsWith('http')) return `${API_BASE}/image?url=${encodeURIComponent(src)}`;
      return src;
  }

  // ── Init ──
  try {
    const res = await fetch(API_BASE + '/catalog?limit=48');
    const data = await res.json();
    const fresh = data.products || [];
    CATALOG = fresh.map(p => ({
      id: p.id,
      name: p.product_name || p.title_translated || 'Product',
      atelier: p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : '',
      category: p.audience || p.category || 'unisex',
      subtitle: p.keyword || '',
      story: (p.caption || p.description || '').trim(),
      instagram_url: p.instagram_url || '',
      images: (p.images || []).map(getImageUrl),
      materials: p.sell_price_eur ? [['ფასი', p.sell_price_eur + ' GEL']] : [],
      edition: '',
    }));
  } catch (err) {
    console.error('Failed to fetch catalog:', err);
  }

  render();
});