/* Neyora — progressive interactions. Replace the submit handler with a backend service when needed. */
(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const backToTop = document.querySelector('.back-to-top');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Stagger reveal elements without hard-coding timing into the stylesheet.
  document.querySelectorAll('.reveal[data-delay]').forEach((element) => {
    element.style.setProperty('--delay', `${element.dataset.delay}ms`);
  });

  const closeMenu = () => {
    navLinks.classList.remove('open');
    menuButton.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuButton.classList.toggle('open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  const updateScrollState = () => {
    header.classList.toggle('scrolled', window.scrollY > 18);
    backToTop.classList.toggle('show', window.scrollY > 620);
  };
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Sections and the timeline animate only when they enter the viewport.
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.11, rootMargin: '0px 0px -28px' });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const timelineObserver = new IntersectionObserver((entries, observer) => {
      if (entries[0].isIntersecting) {
        timeline.classList.add('is-active');
        observer.unobserve(timeline);
      }
    }, { threshold: .35 });
    timelineObserver.observe(timeline);
  }

  // Highlight the section currently being explored in the desktop navigation.
  const navItems = [...document.querySelectorAll('.nav-links > a:not(.button)')];
  const navigationSections = [...document.querySelectorAll('main section[id]')];
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navItems.forEach((item) => item.classList.toggle('active', item.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-38% 0px -52% 0px', threshold: 0 });
  navigationSections.forEach((section) => activeObserver.observe(section));

  const form = document.querySelector('#project-form');
  const successPanel = document.querySelector('#form-success');
  const closeSuccess = document.querySelector('.success-close');

  const messages = {
    name: 'Indiquez votre nom.',
    business: 'Indiquez le nom de votre business.',
    email: 'Ajoutez une adresse e-mail valide.',
    phone: 'Ajoutez un numéro de téléphone.',
    wilaya: 'Sélectionnez votre wilaya.',
    sector: 'Indiquez votre secteur d’activité.',
    description: 'Décrivez brièvement votre projet.'
  };

  const setFieldError = (field, message = '') => {
    field.classList.toggle('invalid', Boolean(message));
    const error = field.parentElement.querySelector('.field-error');
    if (error) error.textContent = message;
  };

  const validateField = (field) => {
    const value = field.value.trim();
    let message = '';
    if (!value) message = messages[field.name] || 'Ce champ est requis.';
    else if (field.type === 'email' && !field.validity.valid) message = messages.email;
    else if (field.name === 'phone' && value.replace(/\D/g, '').length < 8) message = 'Ajoutez un numéro de téléphone valide.';
    setFieldError(field, message);
    return !message;
  };

  if (form) {
    const requiredFields = [...form.querySelectorAll('[required]')];
    requiredFields.forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('invalid')) validateField(field);
      });
      field.addEventListener('change', () => {
        if (field.classList.contains('invalid')) validateField(field);
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fieldsAreValid = requiredFields.map(validateField).every(Boolean);
      const chosenNeeds = form.querySelectorAll('input[name="needs"]:checked').length;
      const needsError = form.querySelector('.checkbox-error');
      needsError.textContent = chosenNeeds ? '' : 'Sélectionnez au moins un besoin.';

      if (!fieldsAreValid || !chosenNeeds) {
        const firstError = form.querySelector('.invalid, .checkbox-error:not(:empty)');
        firstError?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
        return;
      }

      // Intentionally no network request: this is a transparent frontend simulation.
      successPanel.classList.add('show');
      form.reset();
      form.querySelectorAll('.invalid').forEach((field) => field.classList.remove('invalid'));
      form.querySelectorAll('.field-error').forEach((error) => { error.textContent = ''; });
    });
  }

  closeSuccess?.addEventListener('click', () => successPanel.classList.remove('show'));

  // A click outside the open mobile menu closes it while keeping keyboard navigation predictable.
  document.addEventListener('click', (event) => {
    if (!navLinks.classList.contains('open')) return;
    if (!navLinks.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
})();
