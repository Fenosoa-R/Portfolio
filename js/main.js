// ========== 1. UTILITIES & HELPERS ==========

function createObserver(elements, callback, options = { threshold: 0.15 }) {
  const observer = new IntersectionObserver(callback, options);
  elements.forEach(el => observer.observe(el));
  return observer;
}

function updateActiveLink() {
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    const isActive = href === currentPage || (currentPage === '' && href === 'index.html');
    link.classList.toggle('active', isActive);
  });
}

// ========== 2. NAVBAR INTERACTIONS ==========

const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('active');
    navLinks?.classList.remove('open');
  });
});

// ========== 3. HERO SECTION - TYPED EFFECT ==========

const TYPED_TEXTS = [
  'Automatisme',
  'Système embarqué',
  'Mécatronique'
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typedEl = document.getElementById('typed');

function type() {
  const currentText = TYPED_TEXTS[textIndex];
  const cursor = '<span class="cursor">|</span>';

  if (isDeleting) {
    charIndex--;
    typedEl.innerHTML = currentText.substring(0, charIndex) + cursor;
  } else {
    charIndex++;
    typedEl.innerHTML = currentText.substring(0, charIndex) + cursor;
  }

  let speed = isDeleting ? 60 : 100;

  if (!isDeleting && charIndex === currentText.length) {
    speed = 1800;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    textIndex = (textIndex + 1) % TYPED_TEXTS.length;
    speed = 400;
  }

  setTimeout(type, speed);
}

if (typedEl) type();

// ========== 4. SCROLL ANIMATIONS - FADE IN ==========

const FADE_SELECTORS = [
  '.about-grid', '.skill-category', '.project-card', '.timeline-item',
  '.contact-grid', '.about-card', '.interest-card', '.stat-item',
  '.faq-item', '.certificate-card', '.project-detail'
];

const fadeEls = document.querySelectorAll(FADE_SELECTORS.join(', '));
fadeEls.forEach(el => el.classList.add('fade-in'));

createObserver(fadeEls, (entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
});

// ========== 5. SKILL BARS ANIMATION ==========

const fills = document.querySelectorAll('.fill');

createObserver(fills, (entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('animated');
  });
}, { threshold: 0.5 });

// ========== 6. NAVIGATION - ACTIVE STATE ==========

updateActiveLink();

const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

if (sections.length > 0) {
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.getAttribute('id');
      }
    });
    navItems.forEach(link => {
      const href = link.getAttribute('href');
      if (href?.startsWith('#')) {
        link.classList.toggle('active', href === `#${current}`);
      }
    });
  });
}

// ========== 7. STATS COUNTER ANIMATION ==========

function animateStats() {
  document.querySelectorAll('.stat-number').forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    if (isNaN(target)) return;

    let current = 0;
    const increment = target / 30;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        stat.textContent = target;
        clearInterval(timer);
      } else {
        stat.textContent = Math.floor(current);
      }
    }, 50);
  });
}

const statsSection = document.querySelector('.stats-grid');
if (statsSection) {
  createObserver([statsSection], () => animateStats(), { threshold: 0.5 });
}

// ========== 8. CONTACT FORM — EmailJS ==========

window.addEventListener('load', () => {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  if (typeof emailjs !== 'undefined') {
    emailjs.init('AIezCTFzZo-1GuFAp');
  }

  const contactBtn     = contactForm.querySelector('button[type="submit"]');
  const contactSuccess = document.getElementById('status-success');
  const contactError   = document.getElementById('status-error');
  const timeField      = document.getElementById('time-field');

  // Cache un message après un délai
  function hideAfter(el, delay = 4000) {
    setTimeout(() => {
      el.style.transition = 'opacity 0.5s ease';
      el.style.opacity    = '0';
      setTimeout(() => {
        el.style.display  = 'none';
        el.style.opacity  = '1';
        el.style.transition = '';
      }, 500);
    }, delay);
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validation
    const required = contactForm.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    required.forEach(input => {
      const empty = !input.value.trim();
      input.style.borderColor = empty ? 'var(--red)' : '';
      if (empty) isValid = false;
    });
    if (!isValid) return;

    // Remplir le champ time
    if (timeField) timeField.value = new Date().toLocaleString('fr-FR');

    // Cacher messages précédents
    if (contactSuccess) { contactSuccess.style.display = 'none'; contactSuccess.style.opacity = '1'; }
    if (contactError)   { contactError.style.display   = 'none'; contactError.style.opacity   = '1'; }

    // Bouton chargement
    const originalText   = contactBtn.innerHTML;
    contactBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
    contactBtn.disabled  = true;

    emailjs.sendForm('service_byhchg6', 'template_fq61o0e', contactForm)
      .then(() => {
        // ✅ Succès
        if (contactSuccess) {
          contactSuccess.style.display = 'block';
          hideAfter(contactSuccess, 4000); // disparaît après 4s
        }
        contactForm.reset();
        contactBtn.innerHTML        = '<i class="fas fa-check"></i> Envoyé !';
        contactBtn.style.background = '#2ecc71';
        contactBtn.style.boxShadow  = '0 0 20px rgba(46,204,113,0.4)';

        setTimeout(() => {
          contactBtn.innerHTML        = originalText;
          contactBtn.style.background = '';
          contactBtn.style.boxShadow  = '';
          contactBtn.disabled         = false;
        }, 4000);
      })
      .catch((err) => {
        // ❌ Erreur
        console.error('EmailJS error:', err);
        if (contactError) {
          contactError.style.display = 'block';
          hideAfter(contactError, 4000); // disparaît après 4s
        }
        contactBtn.innerHTML = originalText;
        contactBtn.disabled  = false;
      });
  });
});

// ========== 9. SCROLL PROGRESS INDICATOR ==========

window.addEventListener('scroll', () => {
  const scrollTop     = window.scrollY;
  const docHeight     = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  document.documentElement.style.setProperty('--scroll-progress', scrollPercent + '%');
});

// ========== 10. SMOOTH SCROLL ANCHORS ==========

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (hamburger?.classList.contains('active')) {
        hamburger.classList.remove('active');
        navLinks?.classList.remove('open');
      }
    }
  });
});

// ========== 11. LAZY LOADING IMAGES ==========

if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.add('loaded');
        }
      }
    });
  });
  document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// ========== 12. BACK TO TOP BUTTON ==========

const createBackToTopButton = () => {
  const backToTop = document.createElement('button');
  backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTop.setAttribute('aria-label', 'Retour en haut');

  Object.assign(backToTop.style, {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '45px',
    height: '45px',
    background: 'var(--red)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    fontSize: '1.1rem',
    cursor: 'pointer',
    opacity: '0',
    transition: 'all 0.3s',
    zIndex: '999',
    boxShadow: '0 0 15px var(--red-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  document.body.appendChild(backToTop);

  window.addEventListener('scroll', () => {
    const isVisible = window.scrollY > 400;
    backToTop.style.opacity   = isVisible ? '1' : '0';
    backToTop.style.transform = isVisible ? 'translateY(0)' : 'translateY(10px)';
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

createBackToTopButton();

// ========== 13. EDUCATION PAGE - ANIMATED BALL ==========

function initEducationAnimation() {
  const eduItems = document.querySelectorAll('.edu-item');
  if (!eduItems.length) return;

  const ball    = document.getElementById('edu-ball');
  const dateEl  = document.getElementById('edu-date');
  const wrapper = document.getElementById('edu-wrapper');

  if (!ball || !dateEl || !wrapper) return;

  function moveBallTo(item) {
    const wrapperTop = wrapper.getBoundingClientRect().top;
    const itemTop    = item.getBoundingClientRect().top;
    const itemHeight = item.getBoundingClientRect().height;
    const offset     = itemTop - wrapperTop + itemHeight / 2 - 9;

    ball.style.top     = offset + 'px';
    dateEl.style.top   = (offset - 8) + 'px';
    dateEl.textContent = item.dataset.date;
    dateEl.classList.add('visible');

    eduItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  }

  window.addEventListener('load', () => {
    if (eduItems.length) moveBallTo(eduItems[0]);
  });

  eduItems.forEach(item => {
    item.addEventListener('mouseenter', () => moveBallTo(item));
  });
}

initEducationAnimation();

// ========== 14. CONSOLE MESSAGE ==========

console.log('%c🚀 Fenosoa Ny Avo Portfolio', 'font-size: 20px; font-weight: bold; color: #e63946;');
console.log('%cBienvenue! Merci de visiter mon portfolio.', 'font-size: 14px; color: #888;');
console.log('%cGitHub: https://github.com/Fenosoa-R', 'font-size: 12px; color: #e63946;');
console.log('%cLinkedIn: https://linkedin.com/in/fenosoa-ny-avo-randriamampionona-79b3913aa', 'font-size: 12px; color: #e63946;');