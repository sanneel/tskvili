const MOCK_CATALOG = [
  {
    id: 'eg-001', 
    name: 'ორი ნახევარი', 
    atelier: 'ბერიძის სახელოსნო · Beridze Workshop',
    category: 'Jewelry', 
    aesthetic: 'Quiet Luxury',
    subtitle: 'ორი სიმბოლური ჯაჭვი — იდენტური, მაგრამ მაინც განსხვავებული.',
    story: 'თბილისში, ლადო ასათიანის ქუჩაზე ხელით დამუშავებული ვერცხლის წყვილი. თითოეულ ნაკეთობას აქვს მცირე, თითქმის შეუმჩნეველი განსხვავება, რაც მათ უნიკალურობას უსვამს ხაზს. ეს არის ნივთი მათთვის, ვინც შორს ყოფნისასაც ერთ მთლიანობას ინარჩუნებს.',
    materials: [
      ['მასალა', '925 სინჯის ვერცხლი / 18k ოქრო'],
      ['წარმოშობა', 'თბილისი, საქართველო'],
      ['დამზადების დრო', '7-10 სამუშაო დღე']
    ],
    edition: 'Numbered Studio Edition',
    tone: ['#f4f1ee', '#9d7d64'], 
    label: 'Hand-forged Silver'
  },
  {
    id: 'eg-002', 
    name: 'მზის საათი', 
    atelier: 'Studio Mrevlishvili',
    category: 'Home', 
    aesthetic: 'Slow Living',
    subtitle: 'მინიმალისტური ლარნაკი ერთი ყვავილისთვის.',
    story: 'მცხეთის მახლობლად მდებარე პატარა სტუდიაში ხელით გამოძერწილი კერამიკა. მისი ფორმა დღის განმავლობაში შუქ-ჩრდილების თამაშს იმეორებს. იდეალურია ერთი სიმბოლური მცენარისთვის, რომელიც თქვენს საერთო სივრცეს დაამშვენებს.',
    materials: [
      ['მასალა', 'ნატურალური თიხა'],
      ['ტექნიკა', 'ავტორისეული მოჭიქვა'],
      ['სიმაღლე', '22 სმ']
    ],
    edition: 'წელიწადში მხოლოდ 20 ერთეული',
    tone: ['#e8ddd0', '#b06b59'], 
    label: 'Ceramic Art'
  }
];

// Simple SPA Logic
document.addEventListener('DOMContentLoaded', () => {
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
    const items = filter === 'All' ? MOCK_CATALOG : MOCK_CATALOG.filter(i => i.category === filter);
    bento.innerHTML = items.map(item => `
      <div class="card" data-id="${item.id}">
        <div class="card-image" style="background: linear-gradient(135deg, ${item.tone[0]}, ${item.tone[1]})"></div>
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
    const item = MOCK_CATALOG.find(i => i.id === id);
    if (!item) return;

    document.getElementById('profileTag').textContent    = item.aesthetic;
    document.getElementById('profileTitle').textContent  = item.name;
    document.getElementById('profileSubtitle').textContent = item.subtitle;
    document.getElementById('profileStory').textContent  = item.story;
    document.getElementById('profileEdition').textContent= item.edition;
    document.getElementById('profileImage').style.background =
      `linear-gradient(145deg, ${item.tone[0]}, ${item.tone[1]})`;

    const matList = document.getElementById('profileMaterials');
    matList.innerHTML = item.materials.map(([k, v]) =>
      `<li><span>${k}</span><span>${v}</span></li>`).join('');

    const cta = document.getElementById('profileCTA');
    cta.href = `https://instagram.com/${ig}`;

    // Related items
    const related = MOCK_CATALOG.filter(i => i.id !== id);
    document.getElementById('relatedRow').innerHTML = related.map(r => `
      <div class="related-card" data-id="${r.id}">
        <div class="related-card-image" style="background: linear-gradient(145deg, ${r.tone[0]}, ${r.tone[1]})"></div>
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

  // ── Init ──
  render();
  const active = document.querySelector('.slider-link.active');
  pillIndicator.style.width     = `${active.offsetWidth}px`;
  pillIndicator.style.transform = `translateX(${active.offsetLeft}px)`;
});