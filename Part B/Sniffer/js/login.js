/* ================================================
   login.js — Login page logic
   ================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* If already logged in, skip to home */
  if (getCurrentUser()) {
    window.location.href = 'home.html';
    return;
  }

  const form        = document.getElementById('login-form');
  const emailField  = document.getElementById('email');
  const passField   = document.getElementById('password');
  const errorBanner = document.getElementById('login-error');
  const toggleBtn   = document.getElementById('toggle-password');

  /* ----- Attach real-time validators ----- */
  attachValidator(emailField, validateEmail);

  attachValidator(passField, function (v) {
    return validateRequired(v, 'Password');
  });

  /* ----- Password show/hide toggle ----- */
  toggleBtn.addEventListener('click', function () {
    if (passField.type === 'password') {
      passField.type = 'text';
      toggleBtn.textContent = 'Hide';
    } else {
      passField.type = 'password';
      toggleBtn.textContent = 'Show';
    }
  });

  /* ----- Form submit ----- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Run all validations before attempting login
    const valid = validateForm([
      { field: emailField, validator: validateEmail },
      { field: passField,  validator: function (v) { return validateRequired(v, 'Password'); } },
    ]);

    if (!valid) return;

    // Attempt login
    const user = loginUser(emailField.value.trim(), passField.value);

    if (!user) {
      errorBanner.hidden = false;
      emailField.classList.add('error');
      passField.classList.add('error');
      return;
    }

    // Success
    errorBanner.hidden = true;
    setCurrentUser(user);
    window.location.href = 'home.html';
  });

});
