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
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.voices-track').forEach(track => {
    track.innerHTML += track.innerHTML;
    const kids = [...track.children];
    kids.slice(kids.length / 2).forEach(node => node.setAttribute('aria-hidden', 'true'));
    track.classList.add('is-rolling');
  });
}
const shopViewport = document.querySelector('.shop-viewport');
const shopPrev = document.querySelector('[data-shop-prev]');
const shopNext = document.querySelector('[data-shop-next]');
if (shopViewport && shopPrev && shopNext) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = () => Math.max(240, Math.round(shopViewport.clientWidth * 0.8));
  const go = (dir) => shopViewport.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' });
  shopPrev.hidden = false;
  shopNext.hidden = false;
  shopPrev.addEventListener('click', () => go(-1));
  shopNext.addEventListener('click', () => go(1));
  shopViewport.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
  });
  let drag = null;
  shopViewport.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' || event.button) return;
    drag = { id: event.pointerId, x: event.clientX, left: shopViewport.scrollLeft, moved: false };
    shopViewport.classList.add('is-dragging');
    shopViewport.setPointerCapture(event.pointerId);
  });
  shopViewport.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > 4) drag.moved = true;
    shopViewport.scrollLeft = drag.left - dx;
  });
  const endDrag = event => {
    if (!drag || event.pointerId !== drag.id) return;
    shopViewport.classList.remove('is-dragging');
    drag = null;
  };
  shopViewport.addEventListener('pointerup', endDrag);
  shopViewport.addEventListener('pointercancel', endDrag);
  shopViewport.addEventListener('click', event => {
    if (drag && drag.moved) event.preventDefault();
  }, true);
}
