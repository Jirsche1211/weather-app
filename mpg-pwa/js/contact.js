/* ============================================================
   MPG Contact Form
   Validation, submission handling, UX feedback
   ============================================================ */

(function () {
  'use strict';

  const form    = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn    = document.getElementById('cf-submit');
  const btnText      = submitBtn.querySelector('.btn-text');
  const btnSpinner   = submitBtn.querySelector('.btn-spinner');
  const successMsg   = document.getElementById('form-success');

  // ── Validation Rules ────────────────────────────────────
  const validators = {
    name: {
      test: (v) => v.trim().length >= 2 && v.trim().length <= 100,
      message: 'Please enter your full name (2–100 characters).',
    },
    email: {
      test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      message: 'Please enter a valid work email address.',
    },
    company: {
      test: (v) => v.trim().length >= 2 && v.trim().length <= 150,
      message: 'Please enter your company name.',
    },
    message: {
      test: (v) => v.trim().length >= 10 && v.trim().length <= 2000,
      message: 'Please enter a message (10–2000 characters).',
    },
  };

  // ── Validate a single field ──────────────────────────────
  function validateField(name, value) {
    const rule = validators[name];
    if (!rule) return true; // No rule = valid (e.g. topic select)

    if (!value || !value.trim()) {
      showError(name, `${capitalise(name)} is required.`);
      return false;
    }

    if (!rule.test(value)) {
      showError(name, rule.message);
      return false;
    }

    clearError(name);
    return true;
  }

  function showError(name, message) {
    const input = form.querySelector(`[name="${name}"]`);
    const error = form.querySelector(`#cf-${name}-error`);
    if (input) {
      input.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
    }
    if (error) error.textContent = '⚠ ' + message;
  }

  function clearError(name) {
    const input = form.querySelector(`[name="${name}"]`);
    const error = form.querySelector(`#cf-${name}-error`);
    if (input) {
      input.classList.remove('is-invalid');
      input.setAttribute('aria-invalid', 'false');
    }
    if (error) error.textContent = '';
  }

  function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ── Blur validation (after first interaction) ────────────
  const requiredFields = ['name', 'email', 'company', 'message'];

  requiredFields.forEach((name) => {
    const input = form.querySelector(`[name="${name}"]`);
    if (!input) return;

    let touched = false;

    input.addEventListener('blur', () => {
      touched = true;
      validateField(name, input.value);
    });

    input.addEventListener('input', () => {
      if (touched) validateField(name, input.value);
    });
  });

  // ── Submit Handler ───────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all required fields
    let isValid = true;
    requiredFields.forEach((name) => {
      const input = form.querySelector(`[name="${name}"]`);
      if (!validateField(name, input ? input.value : '')) {
        isValid = false;
      }
    });

    if (!isValid) {
      // Focus first invalid input
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    btnText.hidden = true;
    btnSpinner.hidden = false;

    // Collect form data
    const data = {
      name:    form.querySelector('[name="name"]').value.trim(),
      email:   form.querySelector('[name="email"]').value.trim(),
      company: form.querySelector('[name="company"]').value.trim(),
      topic:   form.querySelector('[name="topic"]').value,
      message: form.querySelector('[name="message"]').value.trim(),
    };

    try {
      /*
       * Production integration: replace the setTimeout below with a fetch call.
       *
       * Formspree example:
       *   const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
       *     method: 'POST',
       *     headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
       *     body: JSON.stringify(data),
       *   });
       *   if (!res.ok) throw new Error('Submission failed');
       *
       * Netlify Forms: add `netlify` attribute to <form> and remove this JS handler.
       */
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Show success
      form.hidden = true;
      successMsg.hidden = false;
      successMsg.focus();

    } catch (err) {
      console.error('[MPG Contact] Submission error:', err);
      submitBtn.disabled = false;
      btnText.hidden = false;
      btnSpinner.hidden = true;

      // Show generic error at form top
      showError('message', 'Something went wrong. Please try again or email us directly.');
    }
  });

})();
