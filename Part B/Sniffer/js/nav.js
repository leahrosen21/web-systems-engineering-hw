/* ================================================
   nav.js — Shared navigation behavior
   Handles mobile menu toggle + active link state
   ================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ----- Mobile hamburger toggle ----- */
  const toggle = document.querySelector('.navbar-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      // Accessibility: tell screen readers the menu state
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu when a link is clicked (mobile UX)
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----- Active link highlight ----- */
  // Get the current page filename (e.g. "home.html" or "matches.html")
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-links a').forEach(function (link) {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });

  /* ----- Close mobile menu on outside click ----- */
  document.addEventListener('click', function (e) {
    if (navLinks && !navLinks.contains(e.target) && toggle && !toggle.contains(e.target)) {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
    }
  });

});
