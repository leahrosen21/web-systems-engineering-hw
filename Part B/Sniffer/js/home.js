/* ================================================
   home.js — Swipe/matching page logic
   Handles:
   - Rendering dog profile cards
   - Sniff / Skip button clicks
   - Touch/mouse drag-to-swipe
   - Match pop-up modal
   ================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Auth guard: redirect if not logged in ---- */
  requireLogin();

  /* Update logout link behavior */
  const logoutLink = document.getElementById('nav-logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', function (e) {
      e.preventDefault();
      logout();
      window.location.href = 'login.html';
    });
  }

  /* ---- DOM references ---- */
  const deck         = document.getElementById('card-deck');
  const noMoreEl     = document.getElementById('no-more-cards');
  const swipeActions = document.getElementById('swipe-actions');
  const btnSniff     = document.getElementById('btn-sniff');
  const btnSkip      = document.getElementById('btn-skip');
  const matchModal   = document.getElementById('match-modal');
  const modalClose   = document.getElementById('modal-close');
  const matchText    = document.getElementById('match-text');
  const matchContact = document.getElementById('match-contact');

  /* ---- Load profiles ---- */
  let profiles = getUnseenProfiles();
  let currentIndex = 0;   // which profile is "on top"

  /* Emoji avatars as fallback when no photo uploaded */
  const dogEmojis = ['🐕', '🐩', '🦮', '🐕‍🦺', '🐶'];

  /**
   * Build and insert cards into the deck.
   * We render 3 at a time (or however many remain) for the stacking effect.
   */
  function renderCards() {
    deck.innerHTML = '';

    if (profiles.length === 0) {
      showNoMore();
      return;
    }

    // Render up to 3 cards from current position (bottom-up in DOM = visual stack)
    const visibleCount = Math.min(3, profiles.length);

    for (let i = visibleCount - 1; i >= 0; i--) {
      const profile = profiles[i];
      const card = buildCard(profile, i);
      deck.appendChild(card);
    }

    // Attach drag events to top card
    attachSwipeEvents(deck.querySelector('.dog-card.top-card'));
  }

  /**
   * Create a card DOM element for a given profile.
   * @param {Object} profile
   * @param {number} stackIndex — 0 = top card
   */
  function buildCard(profile, stackIndex) {
    const card = document.createElement('div');
    card.className = 'dog-card' + (stackIndex === 0 ? ' top-card' : '');
    card.dataset.userId = profile.id;
    card.style.zIndex = 100 - stackIndex;

    // Slight scale + offset to show stack depth
    if (stackIndex === 1) {
      card.style.transform = 'scale(0.97) translateY(8px)';
    } else if (stackIndex === 2) {
      card.style.transform = 'scale(0.94) translateY(16px)';
    }

    const dog  = profile.dog || {};
    const emoji = dogEmojis[Math.floor(Math.random() * dogEmojis.length)];

    card.innerHTML = `
      <!-- Swipe hint labels (shown while dragging) -->
      <span class="swipe-hint swipe-hint-sniff" aria-hidden="true">SNIFF</span>
      <span class="swipe-hint swipe-hint-skip"  aria-hidden="true">SKIP</span>

      <!-- Dog image placeholder -->
      <div class="dog-card-image" role="img" aria-label="${escapeHTML(dog.name || 'Dog')} photo">
        <span aria-hidden="true">${emoji}</span>
      </div>

      <div class="dog-card-body">
        <div class="dog-card-name">${escapeHTML(dog.name || 'Unknown')}</div>
        <div class="dog-card-meta">
          ${escapeHTML(dog.age || '?')} year${dog.age === '1' ? '' : 's'} old
          &bull; ${escapeHTML(dog.breed || 'Mixed breed')}
          &bull; ${escapeHTML(profile.location || '')}
        </div>

        ${dog.aboutDog
          ? `<p class="dog-card-desc">${escapeHTML(dog.aboutDog)}</p>`
          : ''}

        <div class="dog-card-tags">
          ${dog.size        ? `<span class="tag">${escapeHTML(dog.size)}</span>` : ''}
          ${dog.energyLevel ? `<span class="tag tag-secondary">${escapeHTML(dog.energyLevel)} Energy</span>` : ''}
          ${dog.personality ? `<span class="tag">${escapeHTML(dog.personality)}</span>` : ''}
        </div>

        <div class="dog-card-owner">
          <span aria-hidden="true">👤</span>
          <span>${escapeHTML(profile.username || profile.name || 'Owner')}
            ${profile.aboutOwner
              ? ' &ndash; ' + escapeHTML(profile.aboutOwner.slice(0, 60)) + (profile.aboutOwner.length > 60 ? '…' : '')
              : ''}
          </span>
        </div>
      </div>
    `;

    return card;
  }

  /* ====================================================
     BUTTON EVENTS: Sniff & Skip
     ==================================================== */

  btnSniff.addEventListener('click', function () {
    handleAction('sniff');
  });

  btnSkip.addEventListener('click', function () {
    handleAction('skip');
  });

  /**
   * Core action handler — called by button OR drag-to-swipe.
   * @param {'sniff'|'skip'} action
   */
  function handleAction(action) {
    if (profiles.length === 0) return;

    const topCard = deck.querySelector('.dog-card.top-card');
    if (!topCard) return;

    const userId = topCard.dataset.userId;

    // Animate swipe
    if (action === 'sniff') {
      topCard.classList.add('swiping-right');
    } else {
      topCard.classList.add('swiping-left');
    }

    // Wait for animation then process
    topCard.addEventListener('animationend', function () {
      processAction(action, userId);
    }, { once: true });
  }

  /**
   * Record the action in data layer, then advance the deck.
   */
  function processAction(action, userId) {
    if (action === 'sniff') {
      const isMatch = sniffUser(userId);
      if (isMatch) {
        showMatchModal(userId);
      }
    } else {
      skipUser(userId);
    }

    // Remove from local profiles array and re-render
    profiles = profiles.filter(function (p) { return p.id !== userId; });
    renderCards();
  }

  /* ====================================================
     DRAG / SWIPE EVENTS (touch & mouse)
     ==================================================== */

  let dragStartX = 0;
  let dragCurrentX = 0;
  let isDragging = false;
  const SWIPE_THRESHOLD = 80; // px to trigger a swipe

  function attachSwipeEvents(card) {
    if (!card) return;

    /* Mouse events */
    card.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    /* Touch events */
    card.addEventListener('touchstart', onDragStart, { passive: true });
    document.addEventListener('touchmove', onDragMove, { passive: true });
    document.addEventListener('touchend', onDragEnd);
  }

  function getClientX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  function onDragStart(e) {
    isDragging = true;
    dragStartX = getClientX(e);
    dragCurrentX = dragStartX;
  }

  function onDragMove(e) {
    if (!isDragging) return;

    dragCurrentX = getClientX(e);
    const delta = dragCurrentX - dragStartX;
    const card  = deck.querySelector('.dog-card.top-card');
    if (!card) return;

    const rotation = delta * 0.08; // slight tilt

    card.style.transform = `translateX(${delta}px) rotate(${rotation}deg)`;
    card.style.transition = 'none';

    // Show hint labels
    const sniffHint = card.querySelector('.swipe-hint-sniff');
    const skipHint  = card.querySelector('.swipe-hint-skip');
    if (sniffHint && skipHint) {
      const ratio = Math.min(Math.abs(delta) / SWIPE_THRESHOLD, 1);
      if (delta > 0) {
        sniffHint.style.opacity = ratio;
        skipHint.style.opacity  = 0;
      } else {
        skipHint.style.opacity  = ratio;
        sniffHint.style.opacity = 0;
      }
    }
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;

    const card = deck.querySelector('.dog-card.top-card');
    if (!card) return;

    const delta = dragCurrentX - dragStartX;
    card.style.transition = '';

    if (delta > SWIPE_THRESHOLD) {
      handleAction('sniff');
    } else if (delta < -SWIPE_THRESHOLD) {
      handleAction('skip');
    } else {
      // Snap back to center
      card.style.transform = '';
      const sniffHint = card.querySelector('.swipe-hint-sniff');
      const skipHint  = card.querySelector('.swipe-hint-skip');
      if (sniffHint) sniffHint.style.opacity = 0;
      if (skipHint)  skipHint.style.opacity  = 0;
    }
  }

  /* ====================================================
     MATCH MODAL
     ==================================================== */

  function showMatchModal(userId) {
    const matched = getAllUsers().find(function (u) { return u.id === userId; });
    if (!matched) return;

    matchText.textContent = 'You matched with ' + (matched.name || matched.username) + '!';

    matchContact.innerHTML = `
      <p class="match-contact-row">
        <span aria-hidden="true">📞</span>
        <span>${escapeHTML(matched.phone || 'Contact info available in Matches')}</span>
      </p>
    `;

    matchModal.hidden = false;
    matchModal.focus();
  }

  // Close modal on button click
  modalClose.addEventListener('click', function () {
    matchModal.hidden = true;
  });

  // Close modal on overlay click (outside box)
  matchModal.addEventListener('click', function (e) {
    if (e.target === matchModal) {
      matchModal.hidden = true;
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !matchModal.hidden) {
      matchModal.hidden = true;
    }
  });

  /* ====================================================
     NO MORE CARDS STATE
     ==================================================== */

  function showNoMore() {
    deck.hidden = true;
    noMoreEl.hidden = false;
    swipeActions.style.display = 'none';
  }

  /* ====================================================
     INIT
     ==================================================== */

  renderCards();

  /* ---- Utility: safely escape HTML to prevent XSS ---- */
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

});
