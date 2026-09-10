'use strict';
document.querySelectorAll('[data-current-year]').forEach(node => {
  node.textContent = String(new Date().getFullYear());
});
const copyButton = document.querySelector('[data-copy-phone]');
if (copyButton) {
  copyButton.hidden = false;
  const status = document.getElementById('copy-status');
  copyButton.addEventListener('click', async () => {
    copyButton.disabled = true;
    status.textContent = '';
    const phone = document.querySelector('.contact-number').textContent.trim();
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(phone);
      status.textContent = `Phone number copied: ${phone}.`;
    } catch {
      status.textContent = `Could not copy automatically. Please select and copy ${phone}, or tap the phone number to call.`;
    } finally {
      copyButton.disabled = false;
    }
  });
}
// Progressive enhancement: navigation remains available without JavaScript.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-navigation');
if (menuButton && navigation) {
  const compact = window.matchMedia('(max-width: 900px)');
  const setOpen = (open, returnFocus = false) => {
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.hidden = compact.matches && !open;
    if (returnFocus) menuButton.focus();
  };
  menuButton.hidden = false;
  document.documentElement.classList.add('menu-ready');
  setOpen(false);
  menuButton.addEventListener('click', () => setOpen(menuButton.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setOpen(false, true);
  });
  navigation.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || !compact.matches) return;
    setOpen(false);
    const target = new URL(link.href);
    if (target.pathname === location.pathname && target.hash) {
      const section = document.getElementById(decodeURIComponent(target.hash.slice(1)));
      if (section) { section.tabIndex = -1; section.focus({preventScroll: true}); }
    }
  });
  compact.addEventListener('change', () => {
    const wasFocused = navigation.contains(document.activeElement);
    setOpen(false, compact.matches && wasFocused);
  });
}
const voicesTrack = document.querySelector('.voices-track');
if (voicesTrack && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  voicesTrack.innerHTML += voicesTrack.innerHTML;
  voicesTrack.querySelectorAll('.quote').forEach((quote, index, list) => {
    if (index >= list.length / 2) quote.setAttribute('aria-hidden', 'true');
  });
  voicesTrack.classList.add('is-rolling');
}
