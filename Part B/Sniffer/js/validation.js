/* ================================================
   validation.js — Form validation helpers
   Used across signup, login, availability, etc.
   ================================================ */

/**
 * Show an error message below a form field.
 * @param {HTMLElement} field   — the input/select/textarea
 * @param {string}      message — error text
 */
function showFieldError(field, message) {
  field.classList.add('error');
  field.classList.remove('success');

  // Find or create the sibling error-message element
  let errEl = field.parentElement.querySelector('.error-message');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'error-message';
    field.parentElement.appendChild(errEl);
  }
  errEl.textContent = message;
  errEl.classList.add('visible');
}

/**
 * Clear any error state on a field.
 * @param {HTMLElement} field
 */
function clearFieldError(field) {
  field.classList.remove('error');
  field.classList.add('success');

  const errEl = field.parentElement.querySelector('.error-message');
  if (errEl) {
    errEl.textContent = '';
    errEl.classList.remove('visible');
  }
}

/**
 * Clear both error + success classes (neutral state).
 * @param {HTMLElement} field
 */
function resetFieldState(field) {
  field.classList.remove('error', 'success');
  const errEl = field.parentElement.querySelector('.error-message');
  if (errEl) {
    errEl.textContent = '';
    errEl.classList.remove('visible');
  }
}

/* ====================================================
   Individual field validators
   Each returns null on success, or an error string.
   ==================================================== */

/**
 * Validate a required text field (not empty).
 */
function validateRequired(value, label) {
  if (!value || value.trim() === '') {
    return label + ' is required.';
  }
  return null;
}

/**
 * Validate email format.
 */
function validateEmail(value) {
  if (!value || value.trim() === '') return 'Email is required.';
  // Simple but effective regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(value.trim())) return 'Please enter a valid email address.';
  return null;
}

/**
 * Validate password: at least 6 characters.
 */
function validatePassword(value) {
  if (!value) return 'Password is required.';
  if (value.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

/**
 * Validate that two password fields match.
 */
function validatePasswordMatch(password, confirm) {
  if (password !== confirm) return 'Passwords do not match.';
  return null;
}

/**
 * Validate Israeli phone number:
 * - Exactly 10 digits
 * - Must start with 0
 */
function validatePhone(value) {
  if (!value || value.trim() === '') return 'Phone number is required.';
  const digits = value.replace(/[\s\-]/g, ''); // allow spaces/dashes in input
  if (!/^\d{10}$/.test(digits)) return 'Phone must be exactly 10 digits.';
  if (digits[0] !== '0') return 'Phone number must start with 0.';
  return null;
}

/**
 * Validate age: must be a positive integer, reasonable range.
 */
function validateAge(value, isAnimal) {
  if (!value || value.trim() === '') return 'Age is required.';
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) return 'Please enter a valid age.';
  if (isAnimal && num > 30) return 'Dog age seems unrealistic.';
  if (!isAnimal && (num < 18 || num > 120)) return 'Please enter your real age (18+).';
  return null;
}

/**
 * Validate a select field — must not be empty/"".
 */
function validateSelect(value, label) {
  if (!value || value === '') return 'Please select a ' + label + '.';
  return null;
}

/* ====================================================
   Attach real-time validation to a field
   Validates on blur (leaving the field) and clears on input.
   ==================================================== */

/**
 * @param {HTMLElement} field
 * @param {Function}    validatorFn — function(value) => error string | null
 */
function attachValidator(field, validatorFn) {
  // Remove error on typing (let user correct without nagging)
  field.addEventListener('input', function () {
    resetFieldState(field);
  });

  // Validate when user leaves the field
  field.addEventListener('blur', function () {
    const error = validatorFn(field.value);
    if (error) {
      showFieldError(field, error);
    } else {
      clearFieldError(field);
    }
  });
}

/* ====================================================
   Validate an entire form's required fields at once.
   Returns true if all valid, false otherwise (and shows errors).
   ==================================================== */

/**
 * @param {Array<{field: HTMLElement, validator: Function}>} rules
 * @returns {boolean}
 */
function validateForm(rules) {
  let allValid = true;

  rules.forEach(function (rule) {
    const error = rule.validator(rule.field.value);
    if (error) {
      showFieldError(rule.field, error);
      allValid = false;
    } else {
      clearFieldError(rule.field);
    }
  });

  return allValid;
}
