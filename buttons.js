/* =========================================================
   buttons.js — magnetic glow buttons
   - the button leans toward the pointer (magnet)
   - a soft highlight follows the pointer
   - a ripple appears where you click
   ========================================================= */

const STRENGTH = 12; // how far (px) the button can move toward the pointer
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.btn-glow').forEach(function (button) {
  const inner = button.querySelector('.btn-inner');

  button.addEventListener('pointermove', function (event) {
    const box = button.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;   // 0 ~ 1
    const y = (event.clientY - box.top) / box.height;   // 0 ~ 1

    // highlight position
    button.style.setProperty('--mx', x * 100 + '%');
    button.style.setProperty('--my', y * 100 + '%');

    // magnet (only with a mouse, and only if motion is OK)
    if (!reduceMotion && event.pointerType === 'mouse') {
      button.style.transform =
        'translate(' + (x - 0.5) * STRENGTH + 'px, ' + (y - 0.5) * STRENGTH + 'px)';
    }
  });

  button.addEventListener('pointerleave', function () {
    button.style.transform = '';
  });

  button.addEventListener('click', function (event) {
    if (reduceMotion || !inner) return;
    const box = inner.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.setAttribute('aria-hidden', 'true');
    // keyboard clicks have no pointer position: use the centre
    const fromKeyboard = event.detail === 0;
    ripple.style.left = (fromKeyboard ? box.width / 2 : event.clientX - box.left) + 'px';
    ripple.style.top = (fromKeyboard ? box.height / 2 : event.clientY - box.top) + 'px';
    inner.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 700);
  });
});
