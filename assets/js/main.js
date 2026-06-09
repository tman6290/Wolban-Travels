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
