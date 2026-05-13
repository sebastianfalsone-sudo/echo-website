// ============================================================
// ECHO — Interaction layer
// Scroll reveals · stat counters · mobile menu · scroll progress
// ============================================================

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- Animated stat counters ---------- */
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    if (isNaN(target)) return;

    if (reduceMotion) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }

    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const stats = document.querySelectorAll('.stat-num[data-target]');
  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach((el) => statObserver.observe(el));
  } else {
    stats.forEach(animateCounter);
  }

  /* ---------- Scroll progress bar ---------- */
  const progress = document.querySelector('.scroll-progress');
  if (progress) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
          progress.style.width = pct + '%';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });
    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Nav background intensifies on scroll ---------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const setScrolled = () => nav.classList.toggle('scrolled', window.scrollY > 12);
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

  /* ---------- Phone carousel toggle ---------- */
  const stack = document.querySelector('.phone-stack');
  if (stack) {
    const phones = Array.from(stack.querySelectorAll('.phone'));
    const dots = Array.from(stack.querySelectorAll('.phone-indicator'));
    let active = phones.findIndex((p) => p.classList.contains('active'));
    if (active < 0) active = 1;
    let timer;

    const setActive = (idx) => {
      active = ((idx % phones.length) + phones.length) % phones.length;
      phones.forEach((p, i) => p.classList.toggle('active', i === active));
      dots.forEach((d, i) => d.classList.toggle('active', i === active));
    };

    const start = () => {
      clearInterval(timer);
      if (reduceMotion) return;
      timer = setInterval(() => setActive(active + 1), 4500);
    };

    const handle = (idx) => {
      setActive(idx);
      start(); // reset cycle clock after manual interaction
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => handle(parseInt(dot.dataset.idx, 10)));
    });
    phones.forEach((phone, i) => {
      phone.addEventListener('click', () => handle(i));
    });

    // Pause when not in viewport
    if ('IntersectionObserver' in window) {
      const vis = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) start();
          else clearInterval(timer);
        });
      }, { threshold: 0.25 });
      vis.observe(stack);
    } else {
      start();
    }
  }
})();
