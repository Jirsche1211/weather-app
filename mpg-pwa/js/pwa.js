/* ============================================================
   MPG PWA Utilities
   Service worker registration + install prompt banner
   ============================================================ */

(function () {
  'use strict';

  // ── Service Worker Registration ──────────────────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => {
          console.log('[MPG PWA] Service worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[MPG PWA] Service worker registration failed:', err);
        });
    });
  }

  // ── Install Prompt ────────────────────────────────────────
  let deferredPrompt = null;
  const DISMISS_KEY  = 'mpg-install-dismissed';

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    maybeShowInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    hideBanner();
    deferredPrompt = null;
  });

  function maybeShowInstallBanner() {
    // Don't show if already dismissed
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Only show after 2+ page views in this session
    const views = parseInt(sessionStorage.getItem('mpg-views') || '0', 10);
    if (views < 2) return;

    showInstallBanner();
  }

  function showInstallBanner() {
    if (document.getElementById('install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.className = 'install-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Install MPG app');
    banner.innerHTML = `
      <p>Install the MPG app on your device</p>
      <button class="btn btn-primary btn-sm" id="install-btn">Install</button>
      <button class="install-banner-close" id="install-dismiss" aria-label="Dismiss install prompt">&times;</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('install-btn').addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        hideBanner();
      }
      deferredPrompt = null;
    });

    document.getElementById('install-dismiss').addEventListener('click', () => {
      localStorage.setItem(DISMISS_KEY, '1');
      hideBanner();
    });
  }

  function hideBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) banner.remove();
  }

})();
