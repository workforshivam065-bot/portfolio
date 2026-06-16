/**
 * ============================================================================
 * PORTFOLIO CLIENT-SIDE CONTROLLERS & INTERACTION SYSTEM
 * For: Shivam Singh (B.Tech CSE Student | Aspiring Software Engineer)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- THEME MANAGEMENT (DARK/LIGHT MODE) ---
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  // Initialize theme from LocalStorage or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
    body.classList.add('light-theme');
  } else {
    body.classList.remove('light-theme');
  }

  // Toggle theme click listener
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('light-theme');
      const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
      localStorage.setItem('theme', currentTheme);
    });
  }

  // --- MOBILE NAVIGATION BAR CONTROLLER ---
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // --- STICKY NAVIGATION EFFECT ---
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // --- BACK TO TOP BUTTON ---
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --- HERO TYPING EFFECT ---
  const typingElement = document.getElementById('typewriter-text');
  const roles = [
    'B.Tech CSE Student',
    'Aspiring Software Engineer',
    'Python Developer',
    'Java Developer',
    'C++ Programmer',
    'Web Developer',
    'Computer Science Student'
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeEffect() {
    if (!typingElement) return;

    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      // Deleting characters
      typingElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50; // Deletes faster
    } else {
      // Typing characters
      typingElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100; // Normal typing speed
    }

    // Determine state switches
    if (!isDeleting && charIndex === currentRole.length) {
      // Pause at full word
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 500; // Pause before typing next word
    }

    setTimeout(typeEffect, typingSpeed);
  }
  
  // Start the typing loop
  setTimeout(typeEffect, 1000);


  // --- INTERSECTION OBSERVER FOR ACTIVE NAV HIGHLIGHT ---
  const sections = document.querySelectorAll('section[id]');
  const navObserverOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach(section => navObserver.observe(section));


  // --- SCROLL REVEAL & SKILLS BAR ANIMATIONS ---
  const reveals = document.querySelectorAll('.reveal');
  const skillBars = document.querySelectorAll('.progress-bar-fill');

  const revealObserverOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.15
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        
        // Trigger skill progress animations inside the revealed skills category
        if (entry.target.classList.contains('skills-category')) {
          const bars = entry.target.querySelectorAll('.progress-bar-fill');
          bars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-width');
            bar.style.width = targetWidth;
          });
        }
        
        observer.unobserve(entry.target); // Stop observing once revealed
      }
    });
  }, revealObserverOptions);

  reveals.forEach(element => revealObserver.observe(element));


  // --- CONTACT FORM VALIDATION & HANDLING ---
  const contactForm = document.getElementById('portfolio-contact-form');
  const formSubmitStatus = document.getElementById('form-submit-status');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const subjectInput = document.getElementById('form-subject');
      const messageInput = document.getElementById('form-message');

      let isFormValid = true;

      // Reset errors
      [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
        if (input) input.classList.remove('invalid');
      });
      if (formSubmitStatus) {
        formSubmitStatus.className = 'form-submit-status';
        formSubmitStatus.style.display = 'none';
      }

      // Name validation
      if (!nameInput.value.trim()) {
        nameInput.classList.add('invalid');
        isFormValid = false;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.add('invalid');
        isFormValid = false;
      }

      // Subject validation
      if (!subjectInput.value.trim()) {
        subjectInput.classList.add('invalid');
        isFormValid = false;
      }

      // Message validation
      if (!messageInput.value.trim()) {
        messageInput.classList.add('invalid');
        isFormValid = false;
      }

      if (isFormValid) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        // Visual submit state feedback
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending Message...';

        // Mock API submission latency
        setTimeout(() => {
          if (formSubmitStatus) {
            formSubmitStatus.textContent = 'Thank you, Shivam! Your message has been sent successfully.';
            formSubmitStatus.classList.add('success');
            formSubmitStatus.style.display = 'block';
          }

          // Reset inputs
          contactForm.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;

          // Fade out the success message after 5 seconds
          setTimeout(() => {
            if (formSubmitStatus) {
              formSubmitStatus.style.display = 'none';
            }
          }, 5000);
        }, 1500);
      }
    });
  }
});
