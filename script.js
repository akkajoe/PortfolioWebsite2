const SPEED = {
  asciiLineDelay: 45,  // ms per line
  heroP1Seconds: 1.0,
  heroTitleSeconds: 1.0,
  heroP2Seconds: 1.2,
  pauseAfterP1: 120,
  pauseAfterTitle: 120,
  pauseBeforeButtons: 300,
  aboutCharDelay: 20
};


function toggleMenu(force) {
  const menu = document.getElementById("menu-links");
  const icon = document.getElementById("hamburger-btn");
  if (!menu || !icon) return;

  const willOpen = typeof force === "boolean" ? force : !menu.classList.contains("open");
  menu.classList.toggle("open", willOpen);
  icon.classList.toggle("open", willOpen);

  document.body.style.overflow = willOpen ? "hidden" : "";
  icon.setAttribute("aria-expanded", String(willOpen));
  icon.setAttribute("aria-label", willOpen ? "Close menu" : "Open menu");
}

function setupOutsideClickToClose() {
  const menu = document.getElementById("menu-links");
  const icon = document.getElementById("hamburger-btn");
  if (!menu || !icon) return;

  document.addEventListener("click", (e) => {
    const withinMenu = e.target.closest("#menu-links");
    const withinIcon  = e.target.closest("#hamburger-btn");
    if (!withinMenu && !withinIcon && menu.classList.contains("open")) {
      toggleMenu(false);
    }
  });
}

function setupEscToClose() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggleMenu(false);
  });
}

function setupMenuLinkClicks() {
  const menu = document.getElementById("menu-links");
  if (!menu) return;
  menu.addEventListener("click", (e) => {
    const link = e.target.closest("a[href^='#']");
    if (link) toggleMenu(false);
  });
}

function setupActiveLinkOnScroll() {
  const headerLinks = Array.from(document.querySelectorAll("#desktop-nav .nav-links a"));
  const mobileLinks = Array.from(document.querySelectorAll("#hamburger-nav .menu-links a"));
  const allLinks = [...headerLinks, ...mobileLinks];
  if (!allLinks.length) return;

  const map = {};
  allLinks.forEach(a => {
    const id = (a.getAttribute("href") || "").replace(/^#/, "");
    if (!id) return;
    (map[id] ||= []).push(a);
  });

  const sections = Array.from(document.querySelectorAll("section[id]"));
  if (!sections.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      allLinks.forEach(a => a.classList.remove("active"));
      (map[id] || []).forEach(a => a.classList.add("active"));
    });
  }, { rootMargin: "-50% 0px -50% 0px", threshold: 0.01 });

  sections.forEach(sec => io.observe(sec));
}

const asciiArtElement    = document.getElementById('ascii-art');
const sectionTextElement = document.querySelector('#profile .section__text');
const sectionTextP1      = document.querySelector('#profile .section__text__p1');
const titleElement       = document.querySelector('#profile .title');
const sectionTextP2      = document.querySelector('#profile .section__text__p2');

function safeHideHeroTextInitially() {
  if (sectionTextElement) {
    sectionTextElement.style.visibility = 'hidden';
    sectionTextElement.style.opacity = '0';
  }
  [sectionTextP1, titleElement, sectionTextP2].forEach(el => {
    if (el) { el.style.visibility = 'hidden'; }
  });
}

function typeEffect(content, element, delay = 100, done = null) {
  if (!element) { if (done) done(); return; }
  const lines = String(content).split('\n');
  let i = 0;
  const timer = setInterval(() => {
    if (i < lines.length) {
      element.textContent += lines[i] + '\n';
      i++;
    } else {
      clearInterval(timer);
      if (done) done();
    }
  }, delay);
}

function typeLine(element, text, seconds, hideCursorAfter = false, singleLine = false) {
  return new Promise((resolve) => {
    if (!element) return resolve();

    sectionTextElement.style.visibility = 'visible';
    sectionTextElement.style.opacity = '1';

    element.style.visibility = 'visible';
    element.innerHTML = `<span></span>`;
    const span = element.firstElementChild;
    span.textContent = text;

    const steps = Math.max(text.length, 1);

    if (singleLine) {
      span.style.whiteSpace = 'nowrap';
      span.style.overflow = 'hidden';
      span.style.width = '0ch';
      span.style.setProperty('--chars', `${text.length}ch`);
      span.style.animation = `
        typing-ch ${seconds}s steps(${steps}, end) forwards,
        cursor .8s step-end infinite alternate
      `;
    } else {
      span.style.maxWidth = '0';
      span.style.animation = `
        typing ${seconds}s steps(${steps}, end) forwards,
        cursor .8s step-end infinite alternate
      `;
    }

    span.addEventListener('animationend', () => {
      span.style.width = 'auto';
      span.style.maxWidth = 'none';
      span.style.borderRight = 'none';
      if (hideCursorAfter) span.classList.add('cursor-hidden');
      resolve();
    }, { once: true });
  });
}


function makeAsciiDrippy(preEl, { baseLines = 3, tailWindow = 24, maxWrapPct = 0.33 } = {}){
  if (!preEl) return;
  if (window.innerWidth <= 600) return;  // phone-only disable

  const raw   = preEl.textContent.replace(/\r/g,'');
  const lines = raw.split('\n');
  const N     = lines.length;
  if (!N) return;

  const keepUntil = Math.max(0, N - (baseLines + tailWindow));
  preEl.innerHTML = '';

  const rnd = (min, max) => (min + Math.random() * (max - min));

  if (keepUntil > 0) preEl.append(document.createTextNode(lines.slice(0, keepUntil).join('\n') + '\n'));

  for (let li = keepUntil; li < N; li++) {
    const line = lines[li] ?? '';
    const frag = document.createDocumentFragment();

    const tailPos = (li - keepUntil) / (baseLines + tailWindow - 1 || 1);
    const pWrap = (li >= N - baseLines) ? 1 : (maxWrapPct * Math.pow(tailPos, 1.4));

    for (let i = 0; i < line.length; i++) {
      const ch = line[i] === ' ' ? '\u00A0' : line[i];

      if (Math.random() < pWrap) {
        const s = document.createElement('span');
        s.className = 'drip-char';

        const dy    = (140 + Math.random()*180).toFixed(1) + 'px';
        const dx    = (-40 + Math.random()*80).toFixed(1)  + 'px';
        const dx1   = (-22 + Math.random()*44).toFixed(1)  + 'px';
        const dx2   = (-30 + Math.random()*60).toFixed(1)  + 'px';
        const rot1  = (-7  + Math.random()*14).toFixed(2)  + 'deg';
        const rot2  = (-10 + Math.random()*20).toFixed(2)  + 'deg';
        const rot3  = (-14 + Math.random()*28).toFixed(2)  + 'deg';
        const scale = (0.90 + Math.random()*0.17).toFixed(2);
        const dur   = (2.0  + Math.random()*1.8).toFixed(2) + 's';
        const delay = (-Math.random()*2.6).toFixed(2) + 's';

        const fadeDelay = (0.2 + Math.random()*0.65) * parseFloat(dur);
        const fadeDur   = (0.6 + Math.random()*0.6);

        s.style.setProperty('--dy', dy);
        s.style.setProperty('--dx', dx);
        s.style.setProperty('--dx1', dx1);
        s.style.setProperty('--dx2', dx2);
        s.style.setProperty('--rot1', rot1);
        s.style.setProperty('--rot2', rot2);
        s.style.setProperty('--rot3', rot3);
        s.style.setProperty('--scale', scale);
        s.style.setProperty('--dur', dur);
        s.style.setProperty('--delay', delay);
        s.style.setProperty('--fadeDelay', fadeDelay.toFixed(2) + 's');
        s.style.setProperty('--fadeDur',   fadeDur.toFixed(2)   + 's');

        s.textContent = ch;
        frag.appendChild(s);
      } else {
        frag.appendChild(document.createTextNode(ch));
      }
    }

    preEl.appendChild(frag);
    if (li < N - 1) preEl.appendChild(document.createTextNode('\n'));
  }
}

const pause = (ms) => new Promise(res => setTimeout(res, ms));

async function triggerTypingEffect() {
  await typeLine(sectionTextP1, "Hello there,", SPEED.heroP1Seconds, true);
  await pause(SPEED.pauseAfterP1);

  await typeLine(titleElement, "I'm Anushcka", SPEED.heroTitleSeconds, true);
  await pause(SPEED.pauseAfterTitle);

  await typeLine(
    sectionTextP2,
    "A Computer Science and Digital Arts & Media Design Student",
    SPEED.heroP2Seconds,
    false,
    true  // single-line typing width in ch
  );

  await pause(SPEED.pauseBeforeButtons);
  const btnContainer = document.querySelector('#profile .btn-container');
  if (btnContainer) {
    btnContainer.style.visibility = 'visible';
    btnContainer.style.opacity = '1';
  }
}

function triggerAboutTypingEffect() {
  const aboutTypingElement = document.querySelector('#about-typing .about-line');
  if (!aboutTypingElement) return;

  const content = (aboutTypingElement.textContent || "").trim();
  aboutTypingElement.textContent = '';

  const cursor = document.createElement('span');
  cursor.classList.add('cursor');
  aboutTypingElement.appendChild(cursor);

  let i = 0;
  (function typeNext() {
    if (i < content.length) {
      const textNode = document.createTextNode(content[i]);
      aboutTypingElement.insertBefore(textNode, cursor);
      i++;
      setTimeout(typeNext, SPEED.aboutCharDelay);
    } else {
      cursor.classList.add('cursor-hidden');
    }
  })();
}

function observeAboutSection() {
  const aboutSection = document.querySelector('#about');
  if (!aboutSection) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggerAboutTypingEffect();
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(aboutSection);
}

/* Video Lightbox */
window.openVideo = function openVideo(src) {
  const old = document.getElementById('video-lightbox');
  if (old) old.remove();

  const wrapper = document.createElement('div');
  wrapper.id = 'video-lightbox';
  wrapper.innerHTML = `
    <div class="vlb-backdrop" data-close></div>
    <div class="vlb-dialog" role="dialog" aria-modal="true" aria-label="Video player">
      <video class="vlb-video" controls autoplay playsinline>
        <source src="${src}" type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
    </div>
    <button class="vlb-close" id="vlb-close" type="button" aria-label="Close">×</button>
  `;
  document.body.appendChild(wrapper);

  const close = () => {
    document.removeEventListener('keydown', onKey);
    wrapper.remove();
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);

  document.getElementById('vlb-close').addEventListener('click', close);
  wrapper.querySelector('.vlb-backdrop').addEventListener('click', close, { capture: true });
};

/* Inline preview autoplay only when visible */
function autoPlayPreviews() {
  const vids = document.querySelectorAll('.SeasonsOfChange-video');
  if (!('IntersectionObserver' in window) || vids.length === 0) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { v.play().catch(()=>{}); }
      else { v.pause(); v.currentTime = 0; }
    });
  }, { threshold: 0.25 });

  vids.forEach(v => io.observe(v));
}

document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu
  const btn = document.getElementById('hamburger-btn');
  if (btn) {
    btn.addEventListener('click', () => toggleMenu());
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') toggleMenu();
    });
  }
  setupOutsideClickToClose();
  setupEscToClose();
  setupMenuLinkClicks();
  setupActiveLinkOnScroll();

  safeHideHeroTextInitially();

  if (asciiArtElement) {
    fetch('ascii_art_refined.txt')
      .then(res => res.ok ? res.text() : Promise.reject('Failed to load ASCII'))
      .then(text => {
        asciiArtElement.textContent = '';
        typeEffect(text, asciiArtElement, SPEED.asciiLineDelay, () => {
          makeAsciiDrippy(asciiArtElement, { baseLines: 4, tailWindow: 24, maxWrapPct: 0.33 });
          triggerTypingEffect();
        });
      })
      .catch(() => {
        // Fallback if file missing
        triggerTypingEffect();
      });
  } else {
    triggerTypingEffect();
  }

  observeAboutSection();
  autoPlayPreviews();
});
