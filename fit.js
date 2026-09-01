document.addEventListener("DOMContentLoaded", () => {
  initFormValidation();
  initMenuToggle();
  initTestimonialRotator();
});

function initFormValidation() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("form-status");
  const fields = ["name", "email", "message"];

  form.addEventListener("submit", (event) => {
    let firstInvalidField = null;
    const invalidFieldNames = [];

    fields.forEach((fieldName) => {
      const field = document.getElementById(fieldName);
      if (!field) return;

      const isValid = field.checkValidity();
      showFieldError(field, isValid);

      if (!isValid) {
        invalidFieldNames.push(fieldName);
        if (!firstInvalidField) firstInvalidField = field;
      }
    });

    if (invalidFieldNames.length > 0) {
      event.preventDefault();

      firstInvalidField.focus();

      announceStatus(
        status,
        `Please fix ${invalidFieldNames.length} field${invalidFieldNames.length > 1 ? "s" : ""} before submitting: ${invalidFieldNames.join(", ")}.`,
      );
    } else {
      announceStatus(status, "Message sent. Thank you.");
    }
  });

  fields.forEach((fieldName) => {
    const field = document.getElementById(fieldName);
    if (!field) return;
    field.addEventListener("input", () => {
      if (field.checkValidity()) {
        showFieldError(field, true);
      }
    });
  });
}

function showFieldError(field, isValid) {
  const errorEl = document.getElementById(`${field.id}-error`);
  if (!errorEl) return;

  field.setAttribute("aria-invalid", String(!isValid));

  if (isValid) {
    errorEl.textContent = "";
    field.removeAttribute("aria-describedby");
  } else {
    const message = getErrorMessage(field);
    errorEl.textContent = message;
    field.setAttribute("aria-describedby", errorEl.id);
  }
}

function getErrorMessage(field) {
  if (field.validity.valueMissing) return `${labelFor(field)} is required.`;
  if (field.validity.typeMismatch && field.type === "email") {
    return "Enter a valid email address (e.g. name@example.com).";
  }
  return `${labelFor(field)} isn't valid.`;
}

function labelFor(field) {
  const label = document.querySelector(`label[for="${field.id}"]`);
  return label ? label.textContent.trim() : field.name || "This field";
}

function announceStatus(statusEl, message) {
  if (!statusEl) return;
  statusEl.textContent = "";
  requestAnimationFrame(() => {
    statusEl.textContent = message;
  });
}

function initMenuToggle() {
  const toggleButton = document.getElementById("nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (!toggleButton || !nav) return;

  toggleButton.addEventListener("click", () => {
    const isOpen = toggleButton.getAttribute("aria-expanded") === "true";
    setMenuState(toggleButton, nav, !isOpen);
  });

  nav.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(toggleButton, nav, false);
      toggleButton.focus();
    }
  });
}

function setMenuState(toggleButton, nav, open) {
  toggleButton.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("is-open", open);
  nav.hidden = !open;
}

function initTestimonialRotator() {
  const rotator = document.getElementById("testimonial-rotator");
  if (!rotator) return;

  const slides = Array.from(rotator.querySelectorAll(".testimonial"));
  const toggleButton = document.getElementById("rotator-toggle");
  if (slides.length === 0) return;

  let currentIndex = Math.max(
    slides.findIndex((s) => s.dataset.active === "true"),
    0,
  );
  let intervalId = null;
  const ROTATE_MS = 6000;

  showSlide(currentIndex);

  function showSlide(index) {
    slides.forEach((slide, i) => {
      const isActive = i === index;
      slide.dataset.active = String(isActive);
      slide.hidden = !isActive;
    });
    currentIndex = index;
  }

  function advance() {
    showSlide((currentIndex + 1) % slides.length);
  }

  function play() {
    if (intervalId) return;
    intervalId = window.setInterval(advance, ROTATE_MS);
    if (toggleButton) {
      toggleButton.setAttribute("aria-pressed", "false");
      toggleButton.textContent = "Pause";
    }
  }

  function pause() {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    if (toggleButton) {
      toggleButton.setAttribute("aria-pressed", "true");
      toggleButton.textContent = "Play";
    }
  }

  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      if (intervalId) {
        pause();
      } else {
        play();
      }
    });
  }

  let manuallyPaused = false;

  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      manuallyPaused = intervalId === null;
    });
  }

  rotator.addEventListener("mouseenter", () => pause());
  rotator.addEventListener("focusin", () => pause());

  rotator.addEventListener("mouseleave", () => {
    if (!manuallyPaused) play();
  });
  rotator.addEventListener("focusout", (event) => {
    if (!rotator.contains(event.relatedTarget) && !manuallyPaused) {
      play();
    }
  });

  play();
}
