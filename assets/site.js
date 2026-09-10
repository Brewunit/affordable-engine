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
const shopTrack = document.querySelector('.shop-track');
const shopPrev = document.querySelector('[data-shop-prev]');
const shopNext = document.querySelector('[data-shop-next]');
const shopFrame = document.querySelector('[data-shop-frame]');
if (shopViewport && shopTrack && shopPrev && shopNext) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const total = shopTrack.children.length;
  [...shopTrack.children].forEach((node, i) => { node.dataset.i = String((i % total) + 1); });
  if (!reduce) {
    shopTrack.innerHTML += shopTrack.innerHTML;
    [...shopTrack.children].forEach((node, i) => {
      if (i >= total) node.setAttribute('aria-hidden', 'true');
    });
  }
  shopPrev.hidden = false;
  shopNext.hidden = false;
  let x = 0;
  let v = reduce ? 0 : -0.045;
  let dragging = false;
  let lastX = 0;
  let lastT = 0;
  const half = () => shopTrack.scrollWidth / (reduce ? 1 : 2);
  const wrap = () => {
    const h = half();
    if (h < 8) return;
    while (x <= -h) x += h;
    while (x > 0) x -= h;
  };
  const paint = () => {
    wrap();
    shopTrack.style.transform = 'translate3d(' + x + 'px,0,0)';
    if (shopFrame) {
      const mid = shopViewport.getBoundingClientRect().left + shopViewport.clientWidth / 2;
      let best = '01';
      let bestD = Infinity;
      shopTrack.querySelectorAll('.shop-shot').forEach(shot => {
        const r = shot.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (d < bestD) {
          bestD = d;
          best = String(shot.dataset.i).padStart(2, '0');
        }
      });
      shopFrame.textContent = best;
    }
  };
  const tick = (now) => {
    if (!dragging) {
      x += v * Math.min(32, now - lastT);
      if (!reduce) {
        const cruise = -0.045;
        v += (cruise - v) * 0.035;
        if (Math.abs(v) > 1.2) v *= 0.98;
      } else {
        v *= 0.9;
        if (Math.abs(v) < 0.002) v = 0;
      }
    }
    lastT = now;
    paint();
    requestAnimationFrame(tick);
  };
  lastT = performance.now();
  requestAnimationFrame(tick);
  const kick = (dir) => { v += dir * 0.55; };
  shopPrev.addEventListener('click', () => kick(1));
  shopNext.addEventListener('click', () => kick(-1));
  shopViewport.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); kick(1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); kick(-1); }
  });
  shopViewport.addEventListener('pointerdown', event => {
    if (event.button) return;
    dragging = true;
    v = 0;
    lastX = event.clientX;
    lastT = performance.now();
    shopViewport.classList.add('is-dragging');
    shopViewport.setPointerCapture(event.pointerId);
  });
  shopViewport.addEventListener('pointermove', event => {
    if (!dragging) return;
    const now = performance.now();
    const dx = event.clientX - lastX;
    const dt = Math.max(8, now - lastT);
    x += dx;
    v = dx / dt;
    lastX = event.clientX;
    lastT = now;
    paint();
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    shopViewport.classList.remove('is-dragging');
    if (Math.abs(v) < 0.02 && !reduce) v = v < 0 ? -0.045 : 0.045;
  };
  shopViewport.addEventListener('pointerup', endDrag);
  shopViewport.addEventListener('pointercancel', endDrag);
}
