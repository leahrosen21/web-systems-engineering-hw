/* ================================================
   matches.js — Matches page logic
   ================================================ */

document.addEventListener('DOMContentLoaded', function () {

  requireLogin();

  const logoutLink = document.getElementById('nav-logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', function (e) {
      e.preventDefault();
      logout();
      window.location.href = 'login.html';
    });
  }

  const list     = document.getElementById('matches-list');
  const noMatch  = document.getElementById('no-matches');
  const modal    = document.getElementById('match-detail-modal');
  const modalContent = document.getElementById('match-detail-content');

  const dogEmojis = ['🐕', '🐩', '🦮', '🐕‍🦺', '🐶'];

  function render() {
    const matchIds = getMatches();
    const users    = getAllUsers();

    if (matchIds.length === 0) {
      noMatch.hidden = false;
      list.hidden    = true;
      return;
    }

    noMatch.hidden = true;
    list.hidden    = false;
    list.innerHTML = '';

    matchIds.forEach(function (id) {
      const user = users.find(function (u) { return u.id === id; });
      if (!user) return;

      const dog   = user.dog || {};
      const emoji = dogEmojis[Math.floor(Math.random() * dogEmojis.length)];

      const card = document.createElement('article');
      card.className = 'card match-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'View match: ' + (dog.name || 'Dog'));

      card.innerHTML = `
        <div class="match-card-avatar" aria-hidden="true">${emoji}</div>
        <div class="match-card-body">
          <div class="match-card-name">${escapeHTML(dog.name || 'Unknown')}</div>
          <div class="match-card-meta">
            ${escapeHTML(dog.breed || 'Mixed')} &bull; ${escapeHTML(user.location || '')}
          </div>
          <span class="match-badge">Matched</span>
        </div>
      `;

      card.addEventListener('click', function () {
        openMatchDetail(user, emoji);
      });

      // Keyboard: open on Enter/Space
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openMatchDetail(user, emoji);
        }
      });

      list.appendChild(card);
    });
  }

  function openMatchDetail(user, emoji) {
    const dog  = user.dog  || {};
    const pref = user.preferences || {};

    modalContent.innerHTML = `
      <div class="modal-dog-header">
        <div class="modal-avatar" aria-hidden="true">${emoji}</div>
        <div class="modal-dog-info">
          <h2 id="match-detail-title">${escapeHTML(dog.name || 'Your Match')}</h2>
          <p>${escapeHTML(dog.breed || 'Dog')} &bull; ${escapeHTML(dog.age || '?')} yrs &bull; ${escapeHTML(user.location || '')}</p>
        </div>
      </div>

      ${dog.aboutDog ? `
        <div class="modal-section">
          <div class="modal-section-title">About the dog</div>
          <p style="font-size:0.92rem; color: var(--color-text-muted);">${escapeHTML(dog.aboutDog)}</p>
        </div>` : ''}

      <div class="modal-section">
        <div class="modal-section-title">Owner</div>
        <p style="font-size:0.92rem; color: var(--color-text-muted);">
          ${escapeHTML(user.username || user.name || 'Owner')}
          ${user.aboutOwner ? ' — ' + escapeHTML(user.aboutOwner) : ''}
        </p>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">Contact</div>
        <div class="modal-contact-box">
          <span aria-hidden="true">📞</span>
          <span>${escapeHTML(user.phone || 'Not available')}</span>
        </div>
      </div>

      <button class="btn btn-outline btn-block modal-close-btn" id="close-detail-modal">
        Close
      </button>
    `;

    modal.hidden = false;
    document.getElementById('close-detail-modal').focus();

    document.getElementById('close-detail-modal').addEventListener('click', function () {
      modal.hidden = true;
    });
  }

  // Close on overlay click
  modal.addEventListener('click', function (e) {
    if (e.target === modal) modal.hidden = true;
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) modal.hidden = true;
  });

  render();

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

});
