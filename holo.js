/* =========================================================
   holo.js — hologram tilt card
   - the card tilts toward the pointer with a springy motion
   - with no pointer it sways gently so the foil keeps shimmering
   - click / Enter / Space flips the card
   - "reduce motion" setting: no tilt, no sway, instant flip
   ========================================================= */

(function () {
  const stage = document.querySelector('.holo-stage');
  if (!stage) return;

  const scene = stage.querySelector('.holo-scene');
  const card = stage.querySelector('.holo-card');
  const shine = stage.querySelector('.holo-shine');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pointer = { x: 0, y: 0, active: false };
  let flipped = false;

  // Spring: speeds up toward the target and slows down with damping,
  // so it overshoots a little and settles back.
  function spring(state, target, stiffness, damping) {
    if (reduce) { state.value = target; state.speed = 0; return; }
    state.speed = (state.speed + (target - state.value) * stiffness) * damping;
    state.value += state.speed;
  }

  const tiltX = { value: 0, speed: 0 };
  const tiltY = { value: 0, speed: 0 };
  const flip = { value: 0, speed: 0 };
  let last = performance.now();
  let elapsed = 0;

  function loop(now) {
    const delta = Math.min(48, now - last);
    last = now;
    elapsed += delta;
    const t = elapsed / 1000;

    const targetX = reduce ? 0 : pointer.active ? pointer.x : Math.sin(t * 0.9) * 0.6;
    const targetY = reduce ? 0 : pointer.active ? pointer.y : Math.cos(t * 0.65) * 0.38;

    const steps = Math.max(1, Math.round(delta / 16.7));
    for (let i = 0; i < steps; i++) {
      spring(tiltX, targetX, 0.08, 0.8);
      spring(tiltY, targetY, 0.08, 0.8);
      spring(flip, flipped ? 180 : 0, 0.05, 0.82);
    }

    const progress = Math.min(1, Math.max(0, flip.value / 180));
    stage.style.setProperty('--tx', tiltX.value.toFixed(4));
    stage.style.setProperty('--ty', tiltY.value.toFixed(4));
    stage.style.setProperty('--hyp', Math.min(1, Math.hypot(tiltX.value, tiltY.value)).toFixed(4));
    stage.style.setProperty('--flip', flip.value.toFixed(2) + 'deg');
    stage.style.setProperty('--lift', Math.sin(progress * Math.PI).toFixed(4));

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Measure from the scene (it doesn't tilt) so the motion stays steady.
  stage.addEventListener('pointermove', function (event) {
    const box = scene.getBoundingClientRect();
    pointer.x = Math.max(-1, Math.min(1, (event.clientX - box.left - box.width / 2) / (box.width / 2)));
    pointer.y = Math.max(-1, Math.min(1, (event.clientY - box.top - box.height / 2) / (box.height / 2)));
    pointer.active = true;
  });
  stage.addEventListener('pointerleave', function () { pointer.active = false; });

  // <button> already works with Enter and Space on the keyboard.
  card.addEventListener('click', function () {
    const wasFlipped = flipped;
    flipped = !flipped;
    card.setAttribute('aria-pressed', String(flipped));
    // when the front comes back, sweep a shine across it
    if (wasFlipped && shine && !reduce) {
      setTimeout(function () {
        shine.classList.remove('is-on');
        void shine.offsetWidth;          // restart the animation
        shine.classList.add('is-on');
      }, 380);
    }
  });
})();
