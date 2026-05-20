/* ================================================
   data.js — Simulated data layer (localStorage)
   In a real app this would be replaced by API calls.
   For the course project: all data lives in the browser.
   ================================================ */

/* ---- Storage keys ---- */
const KEYS = {
  USER:          'sniffer_user',         // logged-in user object
  USERS:         'sniffer_users',        // all registered users (array)
  MATCHES:       'sniffer_matches',      // array of matched user IDs
  LIKED:         'sniffer_liked',        // user IDs the current user has liked
  SKIPPED:       'sniffer_skipped',      // user IDs skipped
  AVAILABILITY:  'sniffer_availability', // availability slots
  RECOMMENDATIONS: 'sniffer_recommendations', // community posts
};

/* ====================================================
   USERS
   ==================================================== */

/**
 * Get the currently logged-in user object, or null if not logged in.
 */
function getCurrentUser() {
  const raw = localStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Persist the currently logged-in user object.
 * @param {Object} user
 */
function setCurrentUser(user) {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

/**
 * Log out by removing the session.
 */
function logout() {
  localStorage.removeItem(KEYS.USER);
}

/**
 * Get all registered users.
 * @returns {Array}
 */
function getAllUsers() {
  const raw = localStorage.getItem(KEYS.USERS);
  return raw ? JSON.parse(raw) : getSeedUsers();
}

/**
 * Save the full users array.
 * @param {Array} users
 */
function saveAllUsers(users) {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

/**
 * Register a new user.
 * @param {Object} userObj
 * @returns {boolean} false if email already exists, true on success
 */
function registerUser(userObj) {
  const users = getAllUsers();
  const exists = users.some(function (u) {
    return u.email.toLowerCase() === userObj.email.toLowerCase();
  });
  if (exists) return false;

  userObj.id = 'user_' + Date.now();
  users.push(userObj);
  saveAllUsers(users);
  return true;
}

/**
 * Find a user by email + password (simple plaintext for course project).
 * @returns {Object|null}
 */
function loginUser(email, password) {
  const users = getAllUsers();
  return users.find(function (u) {
    return u.email.toLowerCase() === email.toLowerCase() && u.password === password;
  }) || null;
}

/**
 * Update the current user's profile in both current session and users array.
 * @param {Object} updatedFields
 */
function updateCurrentUser(updatedFields) {
  const current = getCurrentUser();
  if (!current) return;

  const merged = Object.assign({}, current, updatedFields);
  setCurrentUser(merged);

  const users = getAllUsers();
  const idx = users.findIndex(function (u) { return u.id === current.id; });
  if (idx !== -1) {
    users[idx] = merged;
    saveAllUsers(users);
  }
}

/* ====================================================
   MATCHING — likes & matches
   ==================================================== */

/**
 * Get IDs that the current user has already "liked" (sniffed).
 * @returns {Array<string>}
 */
function getLiked() {
  const raw = localStorage.getItem(KEYS.LIKED);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Get IDs that the current user has skipped.
 * @returns {Array<string>}
 */
function getSkipped() {
  const raw = localStorage.getItem(KEYS.SKIPPED);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Get mutual matches (both sides liked each other).
 * For the course project: the seed users automatically "like" back.
 * @returns {Array<string>}
 */
function getMatches() {
  const raw = localStorage.getItem(KEYS.MATCHES);
  return raw ? JSON.parse(raw) : [];
}

function saveMatches(matches) {
  localStorage.setItem(KEYS.MATCHES, JSON.stringify(matches));
}

/**
 * Called when current user "sniffs" (likes) another user.
 * Returns true if it creates a new match (for showing the match popup).
 * @param {string} targetId
 * @returns {boolean} isNewMatch
 */
function sniffUser(targetId) {
  const liked = getLiked();
  if (!liked.includes(targetId)) {
    liked.push(targetId);
    localStorage.setItem(KEYS.LIKED, JSON.stringify(liked));
  }

  // Seed users always sniff back for demo purposes
  const target = getAllUsers().find(function (u) { return u.id === targetId; });
  const isMatch = target && target.alwaysMatches === true;

  if (isMatch) {
    const matches = getMatches();
    if (!matches.includes(targetId)) {
      matches.push(targetId);
      saveMatches(matches);
      return true; // new match!
    }
  }
  return false;
}

/**
 * Called when current user skips another user.
 * @param {string} targetId
 */
function skipUser(targetId) {
  const skipped = getSkipped();
  if (!skipped.includes(targetId)) {
    skipped.push(targetId);
    localStorage.setItem(KEYS.SKIPPED, JSON.stringify(skipped));
  }
}

/**
 * Return profiles the current user has NOT yet interacted with.
 */
function getUnseenProfiles() {
  const current = getCurrentUser();
  if (!current) return [];

  const liked   = getLiked();
  const skipped = getSkipped();
  const seen    = liked.concat(skipped);

  return getAllUsers().filter(function (u) {
    return u.id !== current.id && !seen.includes(u.id);
  });
}

/* ====================================================
   AVAILABILITY
   ==================================================== */

function getAvailability() {
  const raw = localStorage.getItem(KEYS.AVAILABILITY);
  return raw ? JSON.parse(raw) : [];
}

function saveAvailability(slots) {
  localStorage.setItem(KEYS.AVAILABILITY, JSON.stringify(slots));
}

/* ====================================================
   RECOMMENDATIONS
   ==================================================== */

function getRecommendations() {
  const raw = localStorage.getItem(KEYS.RECOMMENDATIONS);
  return raw ? JSON.parse(raw) : getSeedRecommendations();
}

function saveRecommendations(recs) {
  localStorage.setItem(KEYS.RECOMMENDATIONS, JSON.stringify(recs));
}

function addRecommendation(rec) {
  const recs = getRecommendations();
  rec.id = 'rec_' + Date.now();
  rec.date = new Date().toLocaleDateString('en-GB');
  const current = getCurrentUser();
  rec.author = current ? current.username : 'Anonymous';
  recs.unshift(rec); // newest first
  saveRecommendations(recs);
}

/* ====================================================
   SEED DATA — pre-populated demo profiles
   ==================================================== */

function getSeedUsers() {
  const users = [
    {
      id: 'user_seed_1',
      username: 'golden_maya',
      email: 'maya@example.com',
      password: '123456',
      name: 'Maya',
      age: '28',
      location: 'Tel Aviv',
      phone: '0521234567',
      aboutOwner: 'Hi! I love long walks in Hayarkon Park.',
      dog: {
        name: 'Buddy',
        age: '3',
        breed: 'Golden Retriever',
        size: 'Large',
        gender: 'Male',
        energyLevel: 'High',
        personality: 'Friendly',
        compatibility: 'All dogs',
        vaccinated: 'Yes',
        playStyle: 'Outdoor',
        aboutDog: 'Buddy is the friendliest dog in the park. He loves fetch and swimming.',
      },
      preferences: {
        size: 'Any',
        personality: 'Friendly',
        interaction: 'Playdate',
      },
      alwaysMatches: true,   // seed users match back for demo
    },
    {
      id: 'user_seed_2',
      username: 'beagle_noam',
      email: 'noam@example.com',
      password: '123456',
      name: 'Noam',
      age: '35',
      location: 'Ramat Gan',
      phone: '0539876543',
      aboutOwner: 'Dog dad. Software engineer by day, ball-thrower by evening.',
      dog: {
        name: 'Pickle',
        age: '1',
        breed: 'Beagle',
        size: 'Medium',
        gender: 'Female',
        energyLevel: 'High',
        personality: 'Playful',
        compatibility: 'Small & Medium dogs',
        vaccinated: 'Yes',
        playStyle: 'Both',
        aboutDog: 'Pickle is a puppy who wants to zoom with everyone she meets.',
      },
      preferences: {
        size: 'Small',
        personality: 'Any',
        interaction: 'Walk',
      },
      alwaysMatches: true,
    },
    {
      id: 'user_seed_3',
      username: 'corgi_dana',
      email: 'dana@example.com',
      password: '123456',
      name: 'Dana',
      age: '24',
      location: 'Herzliya',
      phone: '0547654321',
      aboutOwner: 'Work from home & my corgi is my coworker.',
      dog: {
        name: 'Pretzel',
        age: '4',
        breed: 'Corgi',
        size: 'Medium',
        gender: 'Male',
        energyLevel: 'Medium',
        personality: 'Curious',
        compatibility: 'All dogs',
        vaccinated: 'Yes',
        playStyle: 'Outdoor',
        aboutDog: 'Pretzel has big opinions about everything. Loves structured playdates.',
      },
      preferences: {
        size: 'Medium',
        personality: 'Calm',
        interaction: 'Playdate',
      },
      alwaysMatches: false,
    },
    {
      id: 'user_seed_4',
      username: 'husky_ron',
      email: 'ron@example.com',
      password: '123456',
      name: 'Ron',
      age: '31',
      location: 'Petah Tikva',
      phone: '0521112222',
      aboutOwner: 'Weekend hiker and full-time husky wrangler.',
      dog: {
        name: 'Blizzard',
        age: '2',
        breed: 'Siberian Husky',
        size: 'Large',
        gender: 'Male',
        energyLevel: 'High',
        personality: 'Adventurous',
        compatibility: 'Large dogs',
        vaccinated: 'Yes',
        playStyle: 'Outdoor',
        aboutDog: 'Blizzard needs a running buddy. Great with confident dogs.',
      },
      preferences: {
        size: 'Large',
        personality: 'Adventurous',
        interaction: 'Walk',
      },
      alwaysMatches: false,
    },
  ];

  // Save the seed data so it persists
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  return users;
}

function getSeedRecommendations() {
  const recs = [
    {
      id: 'rec_seed_1',
      title: 'Hayarkon Park Dog Area',
      category: 'park',
      description: 'Huge off-leash zone near the lake. Always clean, well fenced, and easy to find parking. Best early mornings on weekdays.',
      author: 'golden_maya',
      date: '12/04/2026',
    },
    {
      id: 'rec_seed_2',
      title: 'Freeze-dried Salmon Treats',
      category: 'product',
      description: 'My vet recommended these for training. High-value reward, single ingredient, and dogs go absolutely wild for them.',
      author: 'beagle_noam',
      date: '05/04/2026',
    },
    {
      id: 'rec_seed_3',
      title: 'Bark & Brew Grooming',
      category: 'service',
      description: 'Amazing mobile groomer who comes to you. Very calm with nervous dogs. Book in advance, she fills up fast.',
      author: 'corgi_dana',
      date: '01/04/2026',
    },
  ];

  localStorage.setItem(KEYS.RECOMMENDATIONS, JSON.stringify(recs));
  return recs;
}

/* ====================================================
   AUTH GUARD — redirect to login if not logged in
   Call at the top of protected pages.
   ==================================================== */

function requireLogin() {
  if (!getCurrentUser()) {
    window.location.href = '../pages/login.html';
  }
}
