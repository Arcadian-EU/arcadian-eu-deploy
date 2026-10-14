// Reflect the existing site's mobile-menu state for keyboard/screen-reader users.
(() => {
  const nav = document.getElementById('site-nav');
  const button = nav?.querySelector('.nav-burger');
  if (!button) return;
  const sync = () => button.setAttribute('aria-expanded', String(nav.classList.contains('nav-open')));
  new MutationObserver(sync).observe(nav, {attributes: true, attributeFilter: ['class']});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('nav-open')) {
      nav.classList.remove('nav-open');
      button.focus();
    }
  });
  sync();
})();
