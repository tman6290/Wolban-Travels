/* ==============================
   WOLBAN TRAVELS — Main JavaScript
   ============================== */

'use strict';

/* ---- Navbar ---- */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const mobile  = document.getElementById('navMobile');
  if (!navbar) return;

  function updateNavbar() {
    if (window.scrollY > 60) {
      navbar.classList.remove('navbar--transparent');
      navbar.classList.add('navbar--solid');
    } else {
      navbar.classList.remove('navbar--solid');
      navbar.classList.add('navbar--transparent');
    }
  }

  // On inner pages always solid
  if (navbar.dataset.alwaysSolid === 'true') {
    navbar.classList.add('navbar--solid');
  } else {
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();
  }

  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const isOpen = mobile.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // Close mobile menu on link click
  if (mobile) {
    mobile.querySelectorAll('.navbar__mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobile.classList.remove('open');
        if (toggle) toggle.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link highlighting
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link, .navbar__mobile-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Sun logo animation — plays on every page load
  const logoWrap = document.querySelector('.logo-img-wrap');
  if (logoWrap) {
    logoWrap.classList.remove('sun-animate');
    void logoWrap.offsetWidth; // force reflow so animation restarts
    logoWrap.classList.add('sun-animate');
  }
})();

/* ---- Hero Carousel ---- */
(function initHeroCarousel() {
  const carousel = document.querySelector('.hero__carousel');
  if (!carousel) return;

  const slides    = carousel.querySelectorAll('.hero__slide');
  const dots      = carousel.querySelectorAll('.hero__dot');
  const prevBtn   = document.querySelector('.hero__prev');
  const nextBtn   = document.querySelector('.hero__next');

  if (!slides.length) return;

  let current    = 0;
  let timer      = null;
  const INTERVAL = 6000;

  function goTo(index) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function autoPlay() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  }

  function pause() { clearInterval(timer); }

  goTo(0);
  autoPlay();

  if (prevBtn) {
    prevBtn.addEventListener('click', () => { goTo(current - 1); autoPlay(); });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => { goTo(current + 1); autoPlay(); });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); autoPlay(); });
  });

  // Pause on hover
  carousel.addEventListener('mouseenter', pause);
  carousel.addEventListener('mouseleave', autoPlay);

  // Swipe support
  let touchStartX = 0;
  carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); autoPlay(); }
  }, { passive: true });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); autoPlay(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); autoPlay(); }
  });
})();

/* ---- Scroll Animations ---- */
(function initScrollAnimations() {
  const targets = document.querySelectorAll('.fade-up, .scale-in');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
})();

/* ---- Counter Animation ---- */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el      = entry.target;
        const target  = parseFloat(el.dataset.count);
        const suffix  = el.dataset.suffix || '';
        const decimal = el.dataset.decimal ? parseInt(el.dataset.decimal) : 0;
        const duration = 2000;
        const start   = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = eased * target;
          el.textContent = decimal > 0
            ? value.toFixed(decimal) + suffix
            : Math.floor(value) + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();

/* ---- Testimonials Slider ---- */
(function initTestimonialsSlider() {
  const track    = document.querySelector('.testimonials__track');
  if (!track) return;

  const cards    = track.querySelectorAll('.testimonial-card');
  const prevBtn  = document.querySelector('.testimonials__prev');
  const nextBtn  = document.querySelector('.testimonials__next');

  if (!cards.length) return;

  let current   = 0;
  let itemsVisible = 3;
  const total = cards.length;

  function getVisible() {
    if (window.innerWidth <= 768)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function maxIndex() { return Math.max(0, total - getVisible()); }

  function slide(dir) {
    itemsVisible = getVisible();
    current = Math.min(Math.max(0, current + dir), maxIndex());
    const cardWidth = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${current * cardWidth}px)`;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => slide(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => slide(1));

  window.addEventListener('resize', () => {
    current = Math.min(current, maxIndex());
    slide(0);
  });
})();

/* ---- FAQ Accordion ---- */
(function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(open => open.classList.remove('open'));

      if (!isOpen) item.classList.add('open');
    });
  });
})();

/* ---- Package Filter & Sort ---- */
(function initPackageFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const grid       = document.querySelector('.packages-page__grid');
  if (!filterBtns.length || !grid) return;

  const cards = Array.from(grid.querySelectorAll('[data-category]'));
  if (!cards.length) return;

  // Store original DOM order for restoring "popular" sort
  cards.forEach((card, i) => { card.dataset.order = i; });

  let activeFilter = 'all';

  function applyFilter(filter) {
    activeFilter = filter;
    filterBtns.forEach(b => {
      const isMatch = b.dataset.filter === filter;
      b.classList.toggle('active', isMatch);
      b.setAttribute('aria-pressed', String(isMatch));
    });
    cards.forEach(card => {
      const cats  = card.dataset.category ? card.dataset.category.split(' ') : [];
      const match = filter === 'all' || cats.includes(filter);
      card.style.display = match ? '' : 'none';
      if (match) {
        card.classList.remove('visible');
        setTimeout(() => card.classList.add('visible'), 50);
      }
    });
  }

  /* Price/sort functions commented out — sort dropdown removed, prices hidden
  function getPrice(card) {
    const el = card.querySelector('.package-card__price');
    if (!el) return 0;
    return parseInt(el.textContent.replace(/[^\d]/g, '')) || 0;
  }

  function getNights(card) {
    const el = card.querySelector('.package-card__nights');
    if (!el) return 0;
    const m = el.textContent.match(/\d+/);
    return m ? parseInt(m[0]) : 0;
  }

  function applySort(val) {
    const sorted = [...cards];
    if (val === 'price-asc')       sorted.sort((a, b) => getPrice(a) - getPrice(b));
    else if (val === 'price-desc') sorted.sort((a, b) => getPrice(b) - getPrice(a));
    else if (val === 'duration')   sorted.sort((a, b) => getNights(b) - getNights(a));
    else                           sorted.sort((a, b) => parseInt(a.dataset.order) - parseInt(b.dataset.order));
    sorted.forEach(card => grid.appendChild(card));
  }
  */

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  /* sortSelect listener removed — sort dropdown no longer in page
  const sortSelect = document.getElementById('sortPackages');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => applySort(sortSelect.value));
  }
  */

  // Apply filter from URL query string (e.g. packages.html?filter=beach)
  const urlFilter = new URLSearchParams(window.location.search).get('filter');
  if (urlFilter) {
    applyFilter(urlFilter);
  }
})();

/* ---- Wishlist Toggle ---- */
(function initWishlist() {
  document.querySelectorAll('.package-card__wishlist').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.classList.toggle('active');
      const icon = btn.querySelector('i');
      if (btn.classList.contains('active')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        btn.setAttribute('aria-label', 'Remove from wishlist');
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        btn.setAttribute('aria-label', 'Add to wishlist');
      }
    });
  });
})();

/* ---- Enquiry / Contact Form ---- */
(function initEnquiryForm() {
  const form = document.getElementById('enquiryForm');
  if (!form) return;

  const fields = {
    firstName:   { required: true,  pattern: /^[A-Za-z\s'-]{2,}$/,  msg: 'Please enter a valid first name.' },
    lastName:    { required: true,  pattern: /^[A-Za-z\s'-]{2,}$/,  msg: 'Please enter a valid last name.' },
    email:       { required: true,  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Please enter a valid email address.' },
    phone:       { required: false, pattern: /^[\d\s\+\-\(\)]{7,}$/, msg: 'Please enter a valid phone number.' },
    destination: { required: true,  check: v => v.trim().length >= 2, msg: 'Please tell us your desired destination.' },
    travelDate:  { required: false, check: () => true },
    travelers:   { required: true,  check: v => parseInt(v) >= 1,    msg: 'Please enter number of travelers.' },
    budget:      { required: false, check: () => true },
    message:     { required: true,  check: v => v.trim().length >= 10, msg: 'Please tell us more about your trip (at least 10 characters).' },
    consent:     { required: true,  isCheckbox: true, msg: 'You must agree to the privacy policy to proceed.' }
  };

  function validateField(name) {
    const rule  = fields[name];
    if (!rule) return true;
    const el    = form.elements[name];
    if (!el) return true;
    const wrap  = el.closest('.form-field');
    const errorEl = wrap && wrap.querySelector('.form-error');

    let valid = true;
    let msg   = '';

    if (rule.isCheckbox) {
      valid = !rule.required || el.checked;
      msg   = valid ? '' : rule.msg;
    } else {
      const val = el.value.trim();
      if (rule.required && !val) {
        valid = false;
        msg   = rule.msg || 'This field is required.';
      } else if (val && rule.pattern && !rule.pattern.test(val)) {
        valid = false;
        msg   = rule.msg;
      } else if (val && rule.check && !rule.check(val)) {
        valid = false;
        msg   = rule.msg;
      }
    }

    if (wrap) {
      wrap.classList.toggle('has-error', !valid);
      if (errorEl) errorEl.textContent = msg;
    }
    return valid;
  }

  // Live validation on blur
  Object.keys(fields).forEach(name => {
    const el = form.elements[name];
    if (el) {
      el.addEventListener('blur', () => validateField(name));
      el.addEventListener('input', () => {
        const wrap = el.closest('.form-field');
        if (wrap && wrap.classList.contains('has-error')) validateField(name);
      });
    }
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    let allValid = true;
    Object.keys(fields).forEach(name => {
      if (!validateField(name)) allValid = false;
    });

    if (!allValid) {
      const firstError = form.querySelector('.form-field.has-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Collect data (sanitised)
    const submitBtn = form.querySelector('.form-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending…';

    const formData  = new FormData(form);
    const payload   = Object.fromEntries(formData.entries());

    fetch('https://api.web3forms.com/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        form.style.display = 'none';
        const successEl = document.getElementById('formSuccess');
        if (successEl) {
          successEl.style.display = 'block';
          successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send My Enquiry';
        alert('Submission error: ' + (data.message || JSON.stringify(data)));
      }
    })
    .catch(err => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send My Enquiry';
      alert('Network error — please check your connection and try again, or email us at info@wolbantravels.com. (' + err.message + ')');
    });
  });
})();

/* ---- Newsletter Form ---- */
(function initNewsletter() {
  document.querySelectorAll('.newsletter__form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('.newsletter__input');
      const btn   = form.querySelector('button[type="submit"]');
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!input || !emailPattern.test(input.value.trim())) {
        input.style.borderColor = 'var(--danger)';
        setTimeout(() => input.style.borderColor = '', 2000);
        return;
      }

      // === BACKEND INTEGRATION POINT ===
      // Connect to your email marketing service (Mailchimp, SendGrid, etc.) here.
      // NEVER hard-code API keys in client-side code.
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
        btn.style.background = 'var(--success)';
      }
      input.value = '';
    });
  });
})();

/* ---- Back to Top ---- */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ---- Smooth Anchor Scroll ---- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const offset = 90;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ---- Query String Enquiry Pre-fill ---- */
(function prefillEnquiry() {
  const params  = new URLSearchParams(window.location.search);
  const dest    = params.get('destination');
  const pkg     = params.get('package');
  const msgText = params.get('msgText');
  if (!dest && !pkg && !msgText) return;

  const destInput = document.getElementById('destination');
  const msgInput  = document.getElementById('message');

  if (dest && destInput) destInput.value = decodeURIComponent(dest);
  if (msgText && msgInput) {
    msgInput.value = decodeURIComponent(msgText);
  } else if (pkg && msgInput) {
    msgInput.value = `I'm interested in the ${decodeURIComponent(pkg)} package. Please send me more details.`;
  }
})();

/* ---- Hero Search ---- */
(function initHeroSearch() {
  var PKGS = [
    {
      title: 'Maldives Overwater Escape',
      location: 'Maldives, Indian Ocean',
      desc: 'Private overwater villa, crystal lagoons, world-class snorkelling, and spa treatments. Absolute paradise.',
      keys: ['maldives','indian ocean','overwater','villa','bungalow','beach','luxury','honeymoon'],
      nights: 7, price: '\u20A63,950,000',
      badge: 'Bestseller', bc: 'badge-popular',
      img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=700&q=75',
      ia: 'Overwater bungalows in the Maldives',
      url: 'contact.html?package=Maldives+Overwater+Escape&destination=Maldives',
      feat: [['fa-plane','Flights'],['fa-hotel','5\u2605 Resort'],['fa-utensils','Half Board'],['fa-ship','Transfers']]
    },
    {
      title: 'Kenya Safari Adventure',
      location: 'Masai Mara, Kenya',
      desc: 'Witness the Great Migration. Track the Big Five. Sleep under stars in a luxury tented camp.',
      keys: ['kenya','safari','masai mara','africa','wildlife','adventure','big five','game drive'],
      nights: 10, price: '\u20A66,350,000',
      badge: 'Exclusive', bc: 'badge-exclusive',
      img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=700&q=75',
      ia: 'Elephant on Kenya safari',
      url: 'contact.html?package=Kenya+Safari+Adventure&destination=Kenya',
      feat: [['fa-plane','Flights'],['fa-binoculars','Game Drives'],['fa-utensils','Full Board'],['fa-user-tie','Guide']]
    },
    {
      title: 'Greek Islands Discovery',
      location: 'Santorini & Mykonos, Greece',
      desc: 'Whitewashed villages, volcanic beaches, world-famous sunsets, and freshly caught seafood. Island life perfected.',
      keys: ['greece','greek','santorini','mykonos','islands','mediterranean','beach','honeymoon'],
      nights: 8, price: '\u20A63,500,000',
      badge: 'New', bc: 'badge-new',
      img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=700&q=75',
      ia: 'Santorini blue dome churches',
      url: 'contact.html?package=Greek+Islands+Discovery&destination=Greece',
      feat: [['fa-plane','Flights'],['fa-hotel','4\u2605 Hotels'],['fa-ship','Ferry'],['fa-umbrella-beach','Beach']]
    },
    {
      title: 'Dubai Luxury City Break',
      location: 'Dubai, UAE',
      desc: 'Skyscrapers, desert dunes, incredible dining, and world-class shopping. Dubai never fails to dazzle.',
      keys: ['dubai','uae','emirates','city','luxury','shopping','burj','desert','middle east'],
      nights: 5, price: '\u20A62,999,000',
      badge: 'Popular', bc: 'badge-popular',
      img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=75',
      ia: 'Dubai skyline with Burj Khalifa',
      url: 'contact.html?package=Dubai+Luxury+City+Break&destination=Dubai',
      feat: [['fa-plane','Flights'],['fa-hotel','5\u2605 Hotel'],['fa-car','Transfers'],['fa-binoculars','City Tour']]
    },
    {
      title: 'Bali Serenity Retreat',
      location: 'Ubud & Seminyak, Bali',
      desc: 'Ancient temples, emerald rice terraces, spa rituals, and sunset cocktails on the beach. Bali recharges the soul.',
      keys: ['bali','indonesia','ubud','seminyak','temple','spa','beach','honeymoon','luxury','adventure'],
      nights: 9, price: '\u20A62,850,000',
      badge: 'New', bc: 'badge-new',
      img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=700&q=75',
      ia: 'Bali rice terraces',
      url: 'contact.html?package=Bali+Serenity+Retreat&destination=Bali',
      feat: [['fa-plane','Flights'],['fa-hotel','Villa'],['fa-spa','Spa'],['fa-car','Driver']]
    },
    {
      title: 'Thailand Discovery',
      location: 'Bangkok, Chiang Mai & Koh Samui',
      desc: 'Street food, golden temples, elephant sanctuaries, and turquoise island beaches — Thailand has it all.',
      keys: ['thailand','thai','bangkok','chiang mai','koh samui','temple','elephant','beach','adventure','asia'],
      nights: 12, price: '\u20A63,350,000',
      badge: 'Popular', bc: 'badge-popular',
      img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=700&q=75',
      ia: 'Thailand tropical beach',
      url: 'contact.html?package=Thailand+Discovery&destination=Thailand',
      feat: [['fa-plane','Flights'],['fa-hotel','Hotels'],['fa-car','Transfers'],['fa-map','3 Cities']]
    },
    {
      title: 'Caribbean Island Escape',
      location: 'Barbados, Caribbean',
      desc: 'Powdery white sand, clear waters, rum cocktails, and reggae rhythms. The Caribbean dream, perfectly packaged.',
      keys: ['caribbean','barbados','island','beach','luxury','honeymoon','tropical','rum'],
      nights: 10, price: '\u20A64,450,000',
      badge: 'Exclusive', bc: 'badge-exclusive',
      img: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=700&q=75',
      ia: 'Caribbean palm beach at sunset',
      url: 'contact.html?package=Caribbean+Island+Escape&destination=Barbados',
      feat: [['fa-plane','Flights'],['fa-hotel','Beach Resort'],['fa-utensils','All Inclusive'],['fa-water','Water Sports']]
    },
    {
      title: 'Morocco Desert Adventure',
      location: 'Marrakech & Sahara, Morocco',
      desc: 'Lose yourself in the medina souks, ride camels through the Sahara, and sleep in a luxury desert camp.',
      keys: ['morocco','marrakech','sahara','desert','africa','camel','adventure','medina','souk'],
      nights: 7, price: '\u20A62,550,000',
      badge: 'New', bc: 'badge-new',
      img: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=700&q=75',
      ia: 'Sahara desert dunes in Morocco',
      url: 'contact.html?package=Morocco+Desert+Adventure&destination=Morocco',
      feat: [['fa-plane','Flights'],['fa-hotel','Riad'],['fa-car','4\u00D74 Trips'],['fa-moon','Desert Camp']]
    },
    {
      title: 'Iceland Northern Lights',
      location: 'Reykjavik, Iceland',
      desc: 'Chase the aurora borealis, explore volcanic landscapes, soak in geothermal lagoons. Nature at its most dramatic.',
      keys: ['iceland','reykjavik','northern lights','aurora','borealis','volcano','geothermal','adventure'],
      nights: 5, price: '\u20A63,650,000',
      badge: 'Unique', bc: 'badge-exclusive',
      img: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=700&q=75',
      ia: 'Northern lights over Iceland landscape',
      url: 'contact.html?package=Iceland+Northern+Lights&destination=Iceland',
      feat: [['fa-plane','Flights'],['fa-hotel','Cabin'],['fa-car','4\u00D74'],['fa-water','Blue Lagoon']]
    },
    {
      title: 'New York City Break',
      location: 'New York, USA',
      desc: "Broadway shows, iconic skyline views, world-class museums, and the best pizza you'll ever eat. NYC delivers.",
      keys: ['new york','nyc','usa','america','broadway','manhattan','city','times square'],
      nights: 5, price: '\u20A62,380,000',
      badge: 'Popular', bc: 'badge-popular',
      img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=700&q=75',
      ia: 'New York City skyline',
      url: 'contact.html?package=New+York+City+Break&destination=New+York',
      feat: [['fa-plane','Flights'],['fa-hotel','Midtown Hotel'],['fa-subway','Metro Pass'],['fa-map','City Guide']]
    },
    {
      title: 'Amalfi Coast Luxury',
      location: 'Amalfi Coast, Italy',
      desc: 'Cliffside villages, limoncello, luxury boats, and the scent of lemon groves. La dolce vita personified.',
      keys: ['amalfi','italy','italian','positano','coast','beach','luxury','honeymoon','mediterranean'],
      nights: 6, price: '\u20A63,100,000',
      badge: 'Exclusive', bc: 'badge-exclusive',
      img: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=700&q=75',
      ia: 'Amalfi Coast cliffside village',
      url: 'contact.html?package=Amalfi+Coast+Luxury&destination=Italy',
      feat: [['fa-plane','Flights'],['fa-hotel','Boutique Hotel'],['fa-ship','Boat Tour'],['fa-utensils','Dining']]
    }
  ];

  function buildCard(p) {
    var feats = p.feat.map(function(f) {
      return '<li class="package-feature"><i class="fas ' + f[0] + '" aria-hidden="true"></i> ' + f[1] + '</li>';
    }).join('');
    return '<article class="package-card" aria-label="' + p.title + ' package">' +
      '<div class="package-card__img-wrap">' +
        '<img class="package-card__img" loading="lazy" src="' + p.img + '" alt="' + p.ia + '" width="700" height="440" />' +
        '<span class="package-card__badge ' + p.bc + '">' + p.badge + '</span>' +
      '</div>' +
      '<div class="package-card__body">' +
        '<p class="package-card__location"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ' + p.location + '</p>' +
        '<h3 class="package-card__title">' + p.title + '</h3>' +
        '<p class="package-card__desc">' + p.desc + '</p>' +
        '<ul class="package-card__features">' + feats + '</ul>' +
        '<div class="package-card__footer">' +
          '<span class="package-card__nights"><i class="fas fa-moon" aria-hidden="true"></i> ' + p.nights + ' Nights</span>' +
          '<div class="package-card__price-block">' +
            '<div class="package-card__from-label">From</div>' +
            '<span class="package-card__price">' + p.price + '</span>' +
            '<span class="package-card__price-pp"> pp</span>' +
          '</div>' +
        '</div>' +
        '<a href="' + p.url + '" class="package-card__cta" aria-label="Enquire about ' + p.title + '">' +
          '<i class="fas fa-paper-plane" aria-hidden="true"></i> Enquire Now' +
        '</a>' +
      '</div>' +
    '</article>';
  }

  function matchPackages(query) {
    var terms = query.toLowerCase().trim().split(/\s+/);
    return PKGS.filter(function(p) {
      return terms.some(function(term) {
        return p.keys.some(function(kw) { return kw.includes(term); }) ||
               p.title.toLowerCase().includes(term) ||
               p.location.toLowerCase().includes(term);
      });
    });
  }

  window.handleSearch = function() {
    var whereEl   = document.getElementById('searchWhere');
    var dateEl    = document.getElementById('searchDate');
    var travEl    = document.getElementById('searchTravelers');
    var section   = document.getElementById('searchResults');
    if (!section) return;

    var where     = whereEl ? whereEl.value.trim() : '';
    var date      = dateEl  ? dateEl.value  : '';
    var travelers = travEl  ? travEl.value  : '';

    if (!where) {
      if (whereEl) {
        whereEl.focus();
        whereEl.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.35)';
        setTimeout(function() { whereEl.style.boxShadow = ''; }, 2000);
      }
      return;
    }

    var matches = matchPackages(where);
    var grid    = section.querySelector('.search-results__grid');
    var heading = section.querySelector('.search-results__title');
    var empty   = section.querySelector('.search-results__empty');

    if (matches.length > 0) {
      heading.textContent = matches.length + ' package' + (matches.length > 1 ? 's' : '') + ' found for \u201c' + where + '\u201d';
      grid.innerHTML = matches.map(buildCard).join('');
      grid.hidden = false;
      empty.hidden = true;
    } else {
      var msg = 'I searched for a holiday to "' + where + '"' +
        (date      ? ', departing around ' + date         : '') +
        (travelers ? ', for ' + travelers + ' traveller(s)' : '') +
        ', but could not find a matching package. Please help me arrange a custom trip.';
      var enquireUrl = 'contact.html?destination=' + encodeURIComponent(where) +
                       '&msgText=' + encodeURIComponent(msg);
      heading.textContent = 'No packages found for \u201c' + where + '\u201d';
      grid.hidden = true;
      empty.hidden = false;
      empty.querySelector('.search-results__enquire-btn').href = enquireUrl;
    }

    section.hidden = false;
    var top = section.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: top, behavior: 'smooth' });
  };

})();
