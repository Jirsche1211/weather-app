/* ============================================================
   MPG Navigation
   Scroll-aware header, mobile hamburger, active link state
   ============================================================ */

(function () {
  'use strict';

  // ── Scroll-Aware Header ──────────────────────────────────
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run on load in case page is scrolled
  }

  // ── Mobile Hamburger ─────────────────────────────────────
  const toggle   = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      const nowOpen = !isExpanded;

      toggle.setAttribute('aria-expanded', String(nowOpen));
      toggle.classList.toggle('is-open', nowOpen);
      mobileNav.hidden = !nowOpen;
      document.body.style.overflow = nowOpen ? 'hidden' : '';
    });

    // Close nav when a link is clicked
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });

    // Close nav on outside click
    document.addEventListener('click', (e) => {
      if (
        !header.contains(e.target) &&
        toggle.getAttribute('aria-expanded') === 'true'
      ) {
        closeMobileNav();
      }
    });

    // Close nav on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeMobileNav();
        toggle.focus();
      }
    });
  }

  function closeMobileNav() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('is-open');
    mobileNav.hidden = true;
    document.body.style.overflow = '';
  }

  // ── Active Nav Link ──────────────────────────────────────
  const currentPath = window.location.pathname;
  const currentFile = currentPath.split('/').pop() || 'index.html';

  document.querySelectorAll('.primary-nav a, .mobile-nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkFile = href.split('/').pop();

    if (
      linkFile === currentFile ||
      (currentFile === '' && linkFile === 'index.html') ||
      (currentFile === '/' && linkFile === 'index.html')
    ) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // ── Session page-view counter for install prompt ─────────
  const views = parseInt(sessionStorage.getItem('mpg-views') || '0', 10);
  sessionStorage.setItem('mpg-views', String(views + 1));

})();
