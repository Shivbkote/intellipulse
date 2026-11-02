(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const header = $('.site-header');
  const menuToggle = $('.menu-toggle');
  const nav = $('#primary-nav');
  const profileWrap = $('.profile-wrap');
  const profileTrigger = $('.profile-trigger');
  const searchPanel = $('.search-panel');
  const searchInput = $('#site-search');
  const toast = $('.toast');
  let toastTimer;

  $('#current-year').textContent = new Date().getFullYear();

  // Compact the navigation once the page begins to scroll.
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 16);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile navigation.
  function closeMobileNav() {
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('menu-open');
  }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    profileWrap.classList.remove('is-open');
    profileTrigger.setAttribute('aria-expanded', 'false');
  });
  $$('.nav-link').forEach(link => link.addEventListener('click', closeMobileNav));

  // Highlight the current section in the navigation.
  const observedSections = $$('main section[id], main section.hero');
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id || 'top';
        $$('.nav-link').forEach(link => {
          const active = link.getAttribute('href') === `#${id}` ||
            (id === 'top' && link.getAttribute('href') === '#top');
          link.classList.toggle('is-active', active);
        });
      });
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
    observedSections.forEach(section => navObserver.observe(section));
  }

  // Profile dropdown closes on outside click and Escape.
  profileTrigger.addEventListener('click', event => {
    event.stopPropagation();
    const open = !profileWrap.classList.contains('is-open');
    profileWrap.classList.toggle('is-open', open);
    profileTrigger.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', event => {
    if (!profileWrap.contains(event.target)) {
      profileWrap.classList.remove('is-open');
      profileTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
  }
  $('.notification-trigger').addEventListener('click', () => showToast('You’re all caught up. New updates will appear here.'));
  $('.signout-button').addEventListener('click', () => {
    profileWrap.classList.remove('is-open');
    profileTrigger.setAttribute('aria-expanded', 'false');
    showToast('Connect this button to your account sign-in system.');
  });
  $('.announcement__close').addEventListener('click', () => {
    $('.announcement').classList.add('announcement--dismissed');
    $('.announcement').style.display = 'none';
  });

  // Search overlay. This demo searches section headings and jumps to the closest match.
  function openSearch() {
    searchPanel.classList.add('is-open');
    searchPanel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('search-open');
    setTimeout(() => searchInput.focus(), 80);
  }
  function closeSearch() {
    searchPanel.classList.remove('is-open');
    searchPanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('search-open');
  }
  $('.search-trigger').addEventListener('click', openSearch);
  $('.search-close').addEventListener('click', closeSearch);
  searchPanel.addEventListener('click', event => { if (event.target === searchPanel) closeSearch(); });
  $('#search-form').addEventListener('submit', event => {
    event.preventDefault();
    const term = searchInput.value.trim().toLowerCase();
    const feedback = $('.search-feedback');
    if (!term) { feedback.textContent = 'Enter a topic to search this page.'; return; }
    const targets = $$('main section, main article');
    const match = targets.find(target => target.innerText.toLowerCase().includes(term));
    if (match) {
      feedback.textContent = `Found a match for “${searchInput.value.trim()}”.`;
      setTimeout(() => { closeSearch(); match.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 450);
    } else {
      feedback.textContent = `No matches for “${searchInput.value.trim()}”. Try “events”, “solutions” or “contact”.`;
    }
  });

  // Accessible Escape handling.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeSearch();
      closeMobileNav();
      profileWrap.classList.remove('is-open');
      profileTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  // Filter event cards by category.
  const filterButtons = $$('.filter-button');
  const eventCards = $$('.event-card');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filterButtons.forEach(item => item.classList.toggle('is-selected', item === button));
    const category = button.dataset.filter;
    let visible = 0;
    eventCards.forEach(card => {
      const show = category === 'all' || card.dataset.category === category;
      card.classList.toggle('is-hidden', !show);
      if (show) visible += 1;
    });
    $('.counter-current').textContent = String(visible).padStart(2, '0');
  }));

  // Soft reveal animations, with a fallback for older browsers.
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  // Close the profile menu when a menu link is followed.
  $$('.profile-menu a').forEach(link => link.addEventListener('click', () => {
    profileWrap.classList.remove('is-open');
    profileTrigger.setAttribute('aria-expanded', 'false');
  }));
})();
