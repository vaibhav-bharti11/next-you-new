const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const motionTargets = [
  ['.catalog-lead,.editorial-intro,.science-page-lead,.quality-lead,.faq-lead,.contact-heading,.policy-lead,.service-page>header,.service-policy-lead,.product-summary,.story-lead>div', 'hero'],
  ['.catalog-card,.catalog-editorial,.article-end,.science-close,.quality-status-heading,.quality-notes,.faq-contact,.contact-next,.policy-notice,.policy-source-links,.service-footer,.service-policy-detail,.story-principles,.formula-page>header', 'reveal'],
  ['.article-hero,.faq-image,.story-lead>img,.story-close>img,.quality-lead figure,.catalog-card>img,.catalog-editorial>img,.product-gallery>img,.product-gallery>video,.formula-page figure', 'media'],
  ['.journal-card-image,.contact-links>a,.service-cards article,.service-policy-grid>section,.story-principle-grid article,.formula-grid article,.pdp-thumbs button', 'card'],
  ['.article-body>section,.quality-record,.faq-list details,.policy-sections>section,.product-summary>details', 'row'],
  ['.journal-tools,.science-stage,.ingredient-explorer,.quality-records,.product-gallery,.product-summary>.pill', 'reveal']
];

function addRevealMotion(root) {
  if (!('IntersectionObserver' in window)) return;
  const observed = [];
  for (const [selector, type] of motionTargets) {
    root.querySelectorAll(selector).forEach((element, index) => {
      if (element.dataset.motion) return;
      element.dataset.motion = type;
      element.style.setProperty('--motion-order', String(index % 4));
      observed.push(element);
    });
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-inview');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
  observed.forEach(element => observer.observe(element));
}

function addReadingProgress() {
  const readingPage = document.querySelector('.policy-page');
  if (!readingPage) return;

  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Reading progress');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', '0');
  const fill = document.createElement('span');
  bar.append(fill);
  document.body.append(bar);

  const sections = [...readingPage.querySelectorAll('.policy-sections section')];
  const links = [...readingPage.querySelectorAll('.policy-index a')];
  const scroll = () => {
    const rect = readingPage.getBoundingClientRect();
    const travel = Math.max(1, readingPage.offsetHeight - innerHeight);
    const progress = Math.max(0, Math.min(1, -rect.top / travel));
    const value = Math.round(progress * 100);
    fill.style.transform = `scaleX(${progress})`;
    bar.setAttribute('aria-valuenow', String(value));
  };
  scroll();
  window.addEventListener('scroll', scroll, { passive: true });
  window.addEventListener('resize', scroll);

  if ('IntersectionObserver' in window && sections.length && links.length) {
    const activeObserver = new IntersectionObserver(entries => {
      const active = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!active) return;
      links.forEach(link => {
        const isActive = link.hash === `#${active.target.id}`;
        link.classList.toggle('is-current', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-18% 0px -70% 0px' });
    sections.forEach(section => activeObserver.observe(section));
  }
}

function addCapsuleScroll() {
  const stage = document.querySelector('.science-stage');
  const scene = stage?.querySelector('.science');
  const capsule = scene?.querySelector('.capsule-breakdown');
  if (!stage || !scene || !capsule || reducedMotion.matches) return;

  capsule.pause();
  let frame = 0;
  const sync = () => {
    frame = 0;
    const travel = Math.max(1, stage.offsetHeight - stage.querySelector('.science-stage-sticky').offsetHeight);
    const progress = Math.max(0, Math.min(1, (window.scrollY - stage.offsetTop) / travel));
    scene.style.setProperty('--capsule-scale', (0.8 + progress * 0.62).toFixed(3));
    stage.style.setProperty('--journey-progress', progress.toFixed(3));
    if (capsule.readyState >= 1 && capsule.duration) {
      const frameTime = Math.round(progress * capsule.duration * 24) / 24;
      if (Math.abs(capsule.currentTime - frameTime) > 0.025) {
        capsule.currentTime = Math.min(frameTime, capsule.duration - 0.001);
      }
    }
  };
  const requestSync = () => {
    if (!frame) frame = requestAnimationFrame(sync);
  };
  capsule.addEventListener('loadedmetadata', requestSync);
  window.addEventListener('scroll', requestSync, { passive: true });
  window.addEventListener('resize', requestSync);
  requestSync();
}

export function initPageMotion() {
  const main = document.querySelector('body.inner-page main');
  if (!main) return;

  document.body.classList.add('has-inner-motion');
  if (!reducedMotion.matches) addRevealMotion(main);
  addReadingProgress();
  addCapsuleScroll();
}
