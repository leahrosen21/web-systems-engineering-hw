/* ================================================
   signup.js — Signup form validation & submission
   ================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* If already logged in, skip to home */
  if (getCurrentUser()) {
    window.location.href = 'home.html';
    return;
  }

  /* ---- Field references ---- */
  const form          = document.getElementById('signup-form');
  const errorBanner   = document.getElementById('signup-error');
  const successBanner = document.getElementById('signup-success');

  const usernameField = document.getElementById('username');
  const emailField    = document.getElementById('email');
  const passField     = document.getElementById('password');
  const confirmField  = document.getElementById('confirm-password');
  const ageField      = document.getElementById('age');
  const locationField = document.getElementById('location');
  const phoneField    = document.getElementById('phone');
  const dogNameField  = document.getElementById('dog-name');
  const dogAgeField   = document.getElementById('dog-age');

  /* ---- Password show/hide ---- */
  const toggleBtn = document.getElementById('toggle-password');
  toggleBtn.addEventListener('click', function () {
    const isHidden = passField.type === 'password';
    passField.type    = isHidden ? 'text' : 'password';
    confirmField.type = isHidden ? 'text' : 'password';
    toggleBtn.textContent = isHidden ? 'Hide' : 'Show';
  });

  /* ---- Attach real-time validators ---- */
  attachValidator(usernameField, function (v) { return validateRequired(v, 'Username'); });
  attachValidator(emailField,    validateEmail);
  attachValidator(passField,     validatePassword);
  attachValidator(confirmField,  function (v) { return validatePasswordMatch(passField.value, v); });
  attachValidator(phoneField,    validatePhone);
  attachValidator(dogNameField,  function (v) { return validateRequired(v, "Dog's name"); });

  attachValidator(ageField, function (v) {
    if (!v) return null; // age is optional
    return validateAge(v, false);
  });

  attachValidator(dogAgeField, function (v) {
    return validateRequired(v, "Dog's age") || validateAge(v, true);
  });

  attachValidator(locationField, function (v) { return validateRequired(v, 'Location'); });

  /* ---- File drag & drop visual feedback ---- */
  const dropZone   = document.getElementById('drop-zone');
  const fileInput  = document.getElementById('dog-photos');
  const filePreview = document.getElementById('file-preview');

  if (dropZone) {
    dropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function () {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      showFilePreviews(e.dataTransfer.files);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      showFilePreviews(fileInput.files);
    });
  }

  function showFilePreviews(files) {
    filePreview.innerHTML = '';
    Array.from(files).forEach(function (file) {
      const item = document.createElement('span');
      item.className = 'tag';
      item.textContent = file.name;
      item.style.marginRight = '6px';
      item.style.marginBottom = '4px';
      item.style.display = 'inline-flex';
      filePreview.appendChild(item);
    });
  }

  /* ---- Form submit ---- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    errorBanner.hidden   = true;
    successBanner.hidden = true;

    /* Validate all required fields */
    const valid = validateForm([
      { field: usernameField, validator: function (v) { return validateRequired(v, 'Username'); } },
      { field: emailField,    validator: validateEmail },
      { field: passField,     validator: validatePassword },
      { field: confirmField,  validator: function (v) { return validatePasswordMatch(passField.value, v); } },
      { field: locationField, validator: function (v) { return validateRequired(v, 'Location'); } },
      { field: phoneField,    validator: validatePhone },
      { field: dogNameField,  validator: function (v) { return validateRequired(v, "Dog's name"); } },
      { field: dogAgeField,   validator: function (v) { return validateRequired(v, "Dog's age") || validateAge(v, true); } },
    ]);

    if (!valid) {
      errorBanner.textContent = 'Please fix the errors above before continuing.';
      errorBanner.hidden = false;
      // Scroll to first error
      const firstError = form.querySelector('.form-control.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    /* Build user object */
    const newUser = {
      username:    usernameField.value.trim(),
      email:       emailField.value.trim(),
      password:    passField.value,
      name:        document.getElementById('name').value.trim(),
      age:         ageField.value.trim(),
      gender:      document.getElementById('gender').value,
      location:    locationField.value.trim(),
      phone:       phoneField.value.replace(/[\s\-]/g, ''),
      aboutOwner:  document.getElementById('about-owner').value.trim(),
      dog: {
        name:          dogNameField.value.trim(),
        age:           dogAgeField.value.trim(),
        breed:         document.getElementById('dog-breed').value.trim(),
        size:          document.getElementById('dog-size').value,
        gender:        document.getElementById('dog-gender').value,
        energyLevel:   document.getElementById('dog-energy').value,
        personality:   document.getElementById('dog-personality').value,
        compatibility: document.getElementById('dog-compat').value,
        vaccinated:    document.getElementById('dog-vaccinated').value,
        playStyle:     document.getElementById('dog-play').value,
        aboutDog:      document.getElementById('dog-about').value.trim(),
      },
      preferences: {
        size:        document.getElementById('pref-size').value,
        personality: document.getElementById('pref-personality').value,
        interaction: document.getElementById('pref-interaction').value,
      },
      alwaysMatches: false,
    };

    /* Attempt registration */
    const success = registerUser(newUser);

    if (!success) {
      errorBanner.textContent = 'An account with that email already exists. Try logging in.';
      errorBanner.hidden = false;
      emailField.classList.add('error');
      return;
    }

    /* Auto-login the new user */
    setCurrentUser(newUser);

    successBanner.hidden = false;
    form.style.opacity = '0.5';
    form.style.pointerEvents = 'none';

    setTimeout(function () {
      window.location.href = 'home.html';
    }, 1500);
  });

});
