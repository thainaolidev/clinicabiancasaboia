document.getElementById('year').textContent = new Date().getFullYear();

// Optional real clinic assets. No external feed credentials belong in this file.
const content = window.clinicContent || {};
document.querySelectorAll('[data-clinic-photo]').forEach(frame => {
  const photo = content.photos?.[frame.dataset.clinicPhoto];
  if (!photo?.src) return;
  const img = document.createElement('img');
  img.alt = photo.alt || 'Espaço da clínica';
  img.loading = 'lazy';
  img.addEventListener('load', () => frame.replaceChildren(img), { once: true });
  img.src = photo.src;
});
const postRoot = document.getElementById('instagram-posts');
const posts = (content.instagramPosts || []).filter(post => {
  try { const url = new URL(post.url); return url.protocol === 'https:' && ['www.instagram.com', 'instagram.com'].includes(url.hostname) && /^\/(p|reel)\//.test(url.pathname) && post.image; } catch { return false; }
}).slice(0, 4);
if (postRoot && posts.length) {
  postRoot.replaceChildren();
  postRoot.classList.add('has-posts');
  posts.forEach(post => {
    const a = document.createElement('a');
    a.className = 'instagram-post-card'; a.href = post.url; a.target = '_blank'; a.rel = 'noopener';
    const img = document.createElement('img'); img.src = post.image; img.alt = post.alt || 'Publicação da clínica no Instagram'; img.loading = 'lazy';
    const caption = document.createElement('p'); caption.textContent = post.caption || 'Ver publicação no Instagram ↗';
    a.append(img, caption); postRoot.append(a);
  });
}
const gentleMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
const gentleObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  if (!gentleMedia.matches) entry.target.animate([{opacity: .4, transform: 'translateY(12px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 500, easing: 'ease-out'});
  gentleObserver.unobserve(entry.target);
}), {threshold: .15});
document.querySelectorAll('.testimonial-card, .art-collage, .location-collage, .process-steps, .instagram-posts').forEach(el => gentleObserver.observe(el));

// Anonymous, selected reviews: manual controls always available.
const feedbackCarousel = document.querySelector('.feedback-carousel');
if (feedbackCarousel) {
  const slides = [...feedbackCarousel.querySelectorAll('.feedback-slide')];
  const count = feedbackCarousel.querySelector('.feedback-count');
  const status = feedbackCarousel.querySelector('.feedback-status');
  const pauseButton = feedbackCarousel.querySelector('[data-feedback="pause"]');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, timer, manuallyPaused = false, hovered = false, focused = false, visible = false;
  function showFeedback(nextIndex, manual = false) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== index; });
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    if (!motionPreference.matches) {
      slides[index].getAnimations().forEach(animation => animation.cancel());
      slides[index].animate([{opacity: 0, transform: 'translateX(14px)'}, {opacity: 1, transform: 'translateX(0)'}], {duration: 450, easing: 'ease-out'});
    }
    if (manual) status.textContent = `Depoimento ${index + 1} de ${slides.length}: ${slides[index].querySelector('.feedback-topic').textContent}`;
  }
  function scheduleFeedback() {
    clearInterval(timer);
    if (!manuallyPaused && !hovered && !focused && visible && !motionPreference.matches && !document.hidden) timer = setInterval(() => showFeedback(index + 1), 8000);
  }
  feedbackCarousel.querySelector('[data-feedback="prev"]').addEventListener('click', () => { showFeedback(index - 1, true); scheduleFeedback(); });
  feedbackCarousel.querySelector('[data-feedback="next"]').addEventListener('click', () => { showFeedback(index + 1, true); scheduleFeedback(); });
  pauseButton.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    pauseButton.setAttribute('aria-pressed', String(manuallyPaused));
    pauseButton.textContent = manuallyPaused ? 'Retomar movimento' : 'Pausar movimento';
    scheduleFeedback();
  });
  feedbackCarousel.addEventListener('mouseenter', () => { hovered = true; scheduleFeedback(); });
  feedbackCarousel.addEventListener('mouseleave', () => { hovered = false; scheduleFeedback(); });
  feedbackCarousel.addEventListener('focusin', () => { focused = true; scheduleFeedback(); });
  feedbackCarousel.addEventListener('focusout', event => { if (!feedbackCarousel.contains(event.relatedTarget)) { focused = false; scheduleFeedback(); } });
  document.addEventListener('visibilitychange', scheduleFeedback);
  function syncFeedbackMotion() { pauseButton.hidden = motionPreference.matches; scheduleFeedback(); }
  motionPreference.addEventListener('change', syncFeedbackMotion);
  syncFeedbackMotion();
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; scheduleFeedback(); }, {threshold: .25}).observe(feedbackCarousel);
}

// HTML adaptation of React Bits PillNav; keeps working if GSAP is unavailable.
const navRoot = document.querySelector('.pill-nav-container');
const menuButton = navRoot.querySelector('.mobile-menu-button');
const mobileMenu = document.getElementById('mobile-navigation');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function setMenu(open, returnFocus = false) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  mobileMenu.hidden = !open;
  if (open && window.gsap && !reducedMotion.matches) {
    gsap.fromTo(mobileMenu, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .3, ease: 'power2.out', overwrite: true });
  }
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileMenu.hidden) setMenu(false, true);
});
document.addEventListener('click', event => {
  if (!navRoot.contains(event.target) && !mobileMenu.hidden) setMenu(false);
});
window.matchMedia('(min-width: 1101px)').addEventListener('change', event => {
  if (event.matches) setMenu(false);
});

const pills = [...navRoot.querySelectorAll('.pill')];
const animations = new Map();
function layoutPills() {
  animations.forEach(({ timeline, tween }) => { timeline.kill(); tween?.kill(); });
  animations.clear();
  pills.forEach(pill => {
    pill.classList.remove('gsap-ready');
    const circle = pill.querySelector('.hover-circle');
    const label = pill.querySelector('.pill-label');
    const hover = pill.querySelector('.pill-label-hover');
    if (!window.gsap || reducedMotion.matches) return;
    const { width: w, height: h } = pill.getBoundingClientRect();
    if (!w || !h) return;
    const R = (w * w / 4 + h * h) / (2 * h);
    const D = Math.ceil(2 * R) + 2;
    const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - w * w / 4))) + 1;
    Object.assign(circle.style, { width: `${D}px`, height: `${D}px`, bottom: `-${delta}px` });
    gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${D - delta}px` });
    gsap.set(label, { y: 0 });
    gsap.set(hover, { y: h + 12, opacity: 0 });
    const timeline = gsap.timeline({ paused: true });
    timeline.to(circle, { scale: 1.2, duration: 2, ease: 'power2.out' }, 0)
      .to(label, { y: -(h + 8), duration: 2, ease: 'power2.out' }, 0)
      .to(hover, { y: 0, opacity: 1, duration: 2, ease: 'power2.out' }, 0);
    animations.set(pill, { timeline, tween: null });
    pill.classList.add('gsap-ready');
  });
}
function animatePill(pill, entering) {
  const animation = animations.get(pill);
  if (!animation || reducedMotion.matches) return;
  animation.tween?.kill();
  animation.tween = animation.timeline.tweenTo(entering ? animation.timeline.duration() : 0, {
    duration: entering ? .3 : .2, ease: 'power2.out', overwrite: true
  });
}
pills.forEach(pill => {
  pill.addEventListener('mouseenter', () => animatePill(pill, true));
  pill.addEventListener('mouseleave', () => animatePill(pill, false));
  pill.addEventListener('focus', () => animatePill(pill, true));
  pill.addEventListener('blur', () => animatePill(pill, false));
});
window.addEventListener('resize', layoutPills);
reducedMotion.addEventListener('change', () => {
  if (window.gsap) pills.forEach(pill => gsap.set(pill.querySelectorAll('.hover-circle, .pill-label, .pill-label-hover'), { clearProps: 'all' }));
  layoutPills();
});
layoutPills();
document.fonts?.ready.then(layoutPills);

const navSections = pills.map(pill => document.querySelector(pill.getAttribute('href'))).filter(Boolean);
function updateActiveSection() {
  let active = navSections[0];
  navSections.forEach(section => { if (section.getBoundingClientRect().top <= 150) active = section; });
  pills.forEach(pill => {
    const selected = pill.getAttribute('href') === `#${active.id}`;
    pill.classList.toggle('is-active', selected);
    if (selected) pill.setAttribute('aria-current', 'location');
    else pill.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', updateActiveSection, { passive: true });
updateActiveSection();

// Watermelon FAQ-4 layout: single collapsible item, alternating columns.
const faqItems = [...document.querySelectorAll('.faq-item')];
faqItems.forEach(item => {
  const index = Number(item.querySelector('summary').id.split('-').pop());
  item.style.setProperty('--faq-order', index);
  item.addEventListener('toggle', () => {
    if (item.open) faqItems.forEach(other => { if (other !== item) other.open = false; });
  });
});
