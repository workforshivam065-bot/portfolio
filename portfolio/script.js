/**
 * ============================================================================
 * PORTFOLIO CLIENT-SIDE CONTROLLERS & LIVE DATA SYNCHRONIZATION
 * For: Shivam Singh (B.Tech CSE Student | AI & Full-Stack Developer)
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
      hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active'));
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
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
  }, { passive: true });

  // --- BACK TO TOP BUTTON ---
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

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
    'AI & Full-Stack Developer',
    'RAG & Gemini API Developer',
    'Next.js & React Specialist',
    'Operational Head @ Flux',
    'Aspiring Software Engineer'
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeEffect() {
    if (!typingElement) return;

    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      typingElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 45;
    } else {
      typingElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 90;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      typingSpeed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 400;
    }

    setTimeout(typeEffect, typingSpeed);
  }
  setTimeout(typeEffect, 800);

  // --- INTERSECTION OBSERVER FOR ACTIVE NAV HIGHLIGHT ---
  const sections = document.querySelectorAll('section[id]');
  const navObserverOptions = {
    root: null,
    rootMargin: '-25% 0px -65% 0px',
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
  function initScrollReveals() {
    const reveals = document.querySelectorAll('.reveal');
    const revealObserverOptions = {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, revealObserverOptions);

    reveals.forEach(element => revealObserver.observe(element));
  }
  initScrollReveals();

  // --- ABOUT SECTION EXPANDABLE DETAILS CONTROLLER ---
  const aboutExpandBtn = document.getElementById('about-expand-btn');
  const aboutExpandedDrawer = document.getElementById('about-expanded-drawer');

  if (aboutExpandBtn && aboutExpandedDrawer) {
    aboutExpandBtn.addEventListener('click', () => {
      const isExpanded = aboutExpandedDrawer.classList.toggle('is-expanded');
      aboutExpandBtn.setAttribute('aria-expanded', isExpanded);
      const btnText = aboutExpandBtn.querySelector('.btn-text');
      if (btnText) {
        btnText.textContent = isExpanded ? 'Show Less Details' : 'View Detailed Bio & Leadership';
      }
    });
  }

  // --- SKILLS CATEGORY FILTER TABS CONTROLLER ---
  function initSkillsFilter() {
    const filterTabsContainer = document.getElementById('skills-filter-tabs');
    if (!filterTabsContainer) return;

    filterTabsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.skills-filter-btn');
      if (!btn) return;

      const targetFilter = btn.getAttribute('data-filter');
      const allBtns = filterTabsContainer.querySelectorAll('.skills-filter-btn');
      allBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const categories = document.querySelectorAll('.skills-category');
      categories.forEach(cat => {
        const catName = cat.getAttribute('data-category');
        if (targetFilter === 'all' || catName === targetFilter) {
          cat.style.display = 'flex';
          cat.style.opacity = '1';
          cat.style.transform = 'translateY(0)';
        } else {
          cat.style.display = 'none';
        }
      });
    });
  }
  initSkillsFilter();

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

      [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
        if (input) input.classList.remove('invalid');
      });
      if (formSubmitStatus) {
        formSubmitStatus.className = 'form-submit-status';
        formSubmitStatus.style.display = 'none';
      }

      if (!nameInput.value.trim()) {
        nameInput.classList.add('invalid');
        isFormValid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.add('invalid');
        isFormValid = false;
      }

      if (!subjectInput.value.trim()) {
        subjectInput.classList.add('invalid');
        isFormValid = false;
      }

      if (!messageInput.value.trim()) {
        messageInput.classList.add('invalid');
        isFormValid = false;
      }

      if (isFormValid) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending Message...';

        setTimeout(() => {
          if (formSubmitStatus) {
            formSubmitStatus.textContent = 'Thank you, Shivam! Your message has been received successfully.';
            formSubmitStatus.classList.add('success');
            formSubmitStatus.style.display = 'block';
          }

          contactForm.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;

          setTimeout(() => {
            if (formSubmitStatus) {
              formSubmitStatus.style.display = 'none';
            }
          }, 6000);
        }, 1200);
      }
    });
  }

  // ==========================================================================
  // LIVE SUPABASE PORTFOLIO DATA SYNCHRONIZATION (PART 6)
  // ==========================================================================
  async function syncPortfolioData() {
    if (!window.PortfolioSupabase || typeof window.PortfolioSupabase.fetchPortfolioData !== 'function') {
      return;
    }

    try {
      const { data, source } = await window.PortfolioSupabase.fetchPortfolioData();
      if (!data) return;

      // 1. Sync Profile & Hero Info
      if (data.profile) {
        const p = data.profile;
        
        // Update resume download button URL
        const resumeBtn = document.querySelector('.hero-actions a.btn-primary');
        if (resumeBtn && p.resume_url) {
          resumeBtn.href = p.resume_url;
        }

        // Update hero tagline
        const heroTagline = document.querySelector('.hero-tagline');
        if (heroTagline && p.tagline) {
          heroTagline.textContent = p.tagline;
        }

        // Update About paragraphs if customized
        const aboutParagraphs = document.querySelectorAll('.about-details p.about-p');
        if (aboutParagraphs.length >= 3) {
          if (p.bio_p1) aboutParagraphs[0].innerHTML = p.bio_p1;
          if (p.bio_p2) aboutParagraphs[1].innerHTML = p.bio_p2;
          if (p.bio_p3) aboutParagraphs[2].innerHTML = p.bio_p3;
        }

        // Update contact chips
        const contactChips = document.querySelectorAll('.hero-contact-chips .contact-chip');
        if (contactChips.length >= 3) {
          if (p.location) contactChips[0].innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>${escapeHtml(p.location)}`;
          if (p.phone) {
            contactChips[1].href = 'tel:' + p.phone.replace(/\s+/g, '');
            contactChips[1].innerHTML = `<svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>${escapeHtml(p.phone)}`;
          }
          if (p.email) {
            contactChips[2].href = 'mailto:' + p.email;
            contactChips[2].innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>${escapeHtml(p.email)}`;
          }
        }
      }

      // 2. Sync Technical Skills
      if (Array.isArray(data.skills) && data.skills.length > 0 && source === 'supabase') {
        renderDynamicSkills(data.skills);
      }

      // 3. Sync Projects
      if (Array.isArray(data.projects) && data.projects.length > 0 && source === 'supabase') {
        renderDynamicProjects(data.projects);
      }

      // 4. Sync Experience
      if (Array.isArray(data.experience) && data.experience.length > 0 && source === 'supabase') {
        renderDynamicExperience(data.experience);
      }

      // 5. Sync Education
      if (Array.isArray(data.education) && data.education.length > 0 && source === 'supabase') {
        renderDynamicEducation(data.education);
      }

      // 6. Sync Achievements
      if (Array.isArray(data.achievements) && data.achievements.length > 0 && source === 'supabase') {
        renderDynamicAchievements(data.achievements);
      }

      // 7. Sync Coding Profiles
      if (Array.isArray(data.coding_profiles) && data.coding_profiles.length > 0 && source === 'supabase') {
        renderDynamicCodingProfiles(data.coding_profiles);
      }

      // Re-trigger scroll observer for any dynamically inserted elements
      initScrollReveals();

    } catch (err) {
      console.warn('Portfolio sync note:', err);
    }
  }

  // Helper: Determine proficiency level & badge class
  function getProficiencyBadge(skill) {
    const prof = (skill.proficiency || '').toLowerCase();
    const level = typeof skill.level === 'number' ? skill.level : 85;
    if (prof === 'advanced' || (!prof && level >= 85)) {
      return { label: 'Advanced', cls: 'skill-badge-advanced' };
    }
    if (prof === 'intermediate' || (!prof && level >= 70 && level < 85)) {
      return { label: 'Intermediate', cls: 'skill-badge-intermediate' };
    }
    return { label: 'Beginner', cls: 'skill-badge-beginner' };
  }

  // --- Dynamic Skills Renderer ---
  function renderDynamicSkills(skills) {
    const grid = document.querySelector('.skills-grid');
    if (!grid) return;

    // Group by category
    const categories = {};
    skills.forEach(s => {
      const cat = s.category || 'Other Technologies';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(s);
    });

    const categoryIcons = {
      'Programming Languages': '<svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
      'Web Technologies': '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
      'AI & Core Frameworks': '<svg viewBox="0 0 24 24"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18s-.41-.06-.57-.18l-7.9-4.44A.991.991 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18s.41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15z"/></svg>',
      'Databases & Tools': '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 4.02 2 6.5v11c0 2.48 4.48 4.5 10 4.5s10-2.02 10-4.5v-11C22 4.02 17.52 2 12 2zm0 18c-4.42 0-8-1.57-8-3.5V15c0 1.93 3.58 3.5 8 3.5s8-1.57 8-3.5v1.5c0 1.93-3.58 3.5-8 3.5zm0-4.5c-4.42 0-8-1.57-8-3.5V10c0 1.93 3.58 3.5 8 3.5s8-1.57 8-3.5v2c0 1.93-3.58 3.5-8 3.5zm0-4.5c-4.42 0-8-1.57-8-3.5S7.58 4 12 4s8 1.57 8 3.5-3.58 3.5-8 3.5z"/></svg>'
    };

    let html = '';
    for (const [catName, catSkills] of Object.entries(categories)) {
      const icon = categoryIcons[catName] || categoryIcons['Web Technologies'];
      html += `
        <article class="skills-category glass-card reveal active" data-category="${escapeHtml(catName)}">
          <div class="skills-category-header">
            <div class="category-icon-box">
              ${icon}
            </div>
            <div class="category-meta">
              <h3>${escapeHtml(catName)}</h3>
              <span class="category-count">${catSkills.length} Skills</span>
            </div>
          </div>
          <div class="skills-list">
            ${catSkills.map(s => {
              const badge = getProficiencyBadge(s);
              return `
                <div class="skill-item">
                  <div class="skill-main">
                    <span class="skill-dot"></span>
                    <span class="skill-name">${escapeHtml(s.name)}</span>
                  </div>
                  <span class="skill-badge ${badge.cls}">${badge.label}</span>
                </div>
              `;
            }).join('')}
          </div>
        </article>
      `;
    }
    grid.innerHTML = html;
  }

  // --- Dynamic Projects Renderer ---
  function renderDynamicProjects(projects) {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    grid.innerHTML = projects.map(proj => {
      const isFeatured = proj.is_featured;
      const tags = Array.isArray(proj.tags) ? proj.tags : [];
      const bullets = Array.isArray(proj.bullets) ? proj.bullets : [];

      let iconSvg = proj.icon_svg;
      if (!iconSvg) {
        // Project placeholder matching category
        if (proj.title.toLowerCase().includes('tic tac toe')) {
          iconSvg = `
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="38" y1="20" x2="38" y2="80" stroke="var(--primary-accent)" stroke-width="3" stroke-linecap="round"/>
              <line x1="62" y1="20" x2="62" y2="80" stroke="var(--primary-accent)" stroke-width="3" stroke-linecap="round"/>
              <line x1="20" y1="38" x2="80" y2="38" stroke="var(--primary-accent)" stroke-width="3" stroke-linecap="round"/>
              <line x1="20" y1="62" x2="80" y2="62" stroke="var(--primary-accent)" stroke-width="3" stroke-linecap="round"/>
              <path d="M25 25l8 8M33 25l-8 8" stroke="var(--secondary-accent)" stroke-width="3" stroke-linecap="round"/>
              <circle cx="50" cy="50" r="6" stroke="var(--primary-accent)" stroke-width="3"/>
              <circle cx="71" cy="29" r="6" stroke="var(--primary-accent)" stroke-width="3"/>
              <path d="M25 67l8 8M33 67l-8 8" stroke="var(--secondary-accent)" stroke-width="3" stroke-linecap="round"/>
              <path d="M67 67l8 8M75 67l-8 8" stroke="var(--secondary-accent)" stroke-width="3" stroke-linecap="round"/>
            </svg>
          `;
        } else if (isFeatured) {
          iconSvg = `
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100px; height: 100px;">
              <circle cx="50" cy="50" r="38" stroke="var(--primary-accent)" stroke-width="2.5" stroke-dasharray="4 2"/>
              <circle cx="50" cy="50" r="26" stroke="var(--secondary-accent)" stroke-width="2"/>
              <circle cx="50" cy="36" r="10" stroke="var(--primary-accent)" stroke-width="2.5" fill="var(--bg-secondary)"/>
              <path d="M34 66c0-9 7.5-14 16-14s16 5 16 14" stroke="var(--primary-accent)" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="72" y1="45" x2="72" y2="55" stroke="var(--secondary-accent)" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="78" y1="41" x2="78" y2="59" stroke="var(--primary-accent)" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="26" cy="30" r="3" fill="var(--primary-accent)"/>
              <circle cx="74" cy="30" r="3" fill="var(--secondary-accent)"/>
            </svg>
          `;
        } else {
          iconSvg = `
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="15" y="25" width="70" height="50" rx="6" stroke="var(--primary-accent)" stroke-width="3"/>
              <line x1="15" y1="38" x2="85" y2="38" stroke="var(--primary-accent)" stroke-width="2"/>
              <circle cx="25" cy="31" r="2" fill="var(--primary-accent)"/>
              <circle cx="31" cy="31" r="2" fill="var(--primary-accent)"/>
              <circle cx="37" cy="31" r="2" fill="var(--primary-accent)"/>
              <path d="M45 50l5 5 10-10" stroke="var(--secondary-accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `;
        }
      }

      return `
        <article class="project-card ${isFeatured ? 'project-featured' : ''} glass-card reveal active">
          ${isFeatured ? `
            <span class="featured-flag-badge">
              <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              ${escapeHtml(proj.featured_flag_label || 'Flagship AI Project')}
            </span>
          ` : ''}

          <div class="project-card-header">
            ${iconSvg}
          </div>

          <div class="project-card-body">
            <div class="project-tags">
              ${tags.map(t => `<span class="project-tag">${escapeHtml(t)}</span>`).join('')}
            </div>

            <h3 class="project-title">${escapeHtml(proj.title)}</h3>
            <p class="project-desc">${escapeHtml(proj.description)}</p>

            ${bullets.length > 0 ? `
              <ul class="featured-bullets">
                ${bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
              </ul>
            ` : ''}

            ${proj.problem_solved ? `
              <p class="project-problem"><strong>Problem Solved:</strong> ${escapeHtml(proj.problem_solved)}</p>
            ` : ''}

            <div class="project-links">
              ${proj.github_url ? `
                <a href="${proj.github_url}" class="project-link" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24"><path d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/></svg>
                  Source Code
                </a>
              ` : ''}
              ${proj.demo_url && proj.demo_url !== '#' ? `
                <a href="${proj.demo_url}" class="project-link" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
                  Live Demo
                </a>
              ` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // --- Dynamic Experience Renderer ---
  function renderDynamicExperience(experience) {
    const grid = document.querySelector('.experience-grid');
    if (!grid) return;

    grid.innerHTML = experience.map(exp => {
      const bullets = Array.isArray(exp.bullets) ? exp.bullets : [];
      const tags = Array.isArray(exp.tags) ? exp.tags : [];

      return `
        <article class="experience-card glass-card reveal active">
          <div class="experience-header">
            <div class="experience-role-group">
              <h3 class="experience-role">${escapeHtml(exp.role)}</h3>
              <span class="experience-org">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
                ${escapeHtml(exp.organization)}
              </span>
            </div>
            <span class="experience-date-badge">
              <svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
              ${escapeHtml(exp.period)}
            </span>
          </div>

          <ul class="experience-bullets">
            ${bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
          </ul>

          <div class="experience-tags">
            ${tags.map(t => `<span class="experience-tag">${escapeHtml(t)}</span>`).join('')}
          </div>
        </article>
      `;
    }).join('');
  }

  // --- Dynamic Education Renderer ---
  function renderDynamicEducation(education) {
    const grid = document.querySelector('.education-grid');
    if (!grid) return;

    grid.innerHTML = education.map(edu => {
      const tags = Array.isArray(edu.coursework_tags) ? edu.coursework_tags : [];
      return `
        <article class="education-card-dual glass-card reveal active">
          <span class="edu-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
            ${escapeHtml(edu.badge_text || 'Degree')}
          </span>
          <h3>${escapeHtml(edu.degree)}</h3>
          <div class="edu-institution">${escapeHtml(edu.institution)}</div>
          <div class="edu-location-date">
            <span>${escapeHtml(edu.location_date)}</span>
          </div>

          ${edu.cgpa_value ? `
            <div class="cgpa-highlight-box">
              <div class="cgpa-main">
                <span class="cgpa-label">${escapeHtml(edu.cgpa_label || 'CGPA:')}</span>
                <span class="cgpa-value">${escapeHtml(edu.cgpa_value)}</span>
              </div>
              ${edu.semesters_text ? `
                <div class="semester-chips">
                  ${edu.semesters_text.split('|').map(s => `<span class="sem-chip">${escapeHtml(s.trim())}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${edu.description ? `<p style="margin-top: 1rem;">${escapeHtml(edu.description)}</p>` : ''}

          ${tags.length > 0 ? `
            <div class="education-coursework" style="margin-top: auto;">
              <h5>Key Coursework &amp; Topics:</h5>
              <div class="course-tags">
                ${tags.map(t => `<span class="course-tag">${escapeHtml(t)}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </article>
      `;
    }).join('');
  }

  // --- Dynamic Achievements Renderer ---
  function renderDynamicAchievements(achievements) {
    const grid = document.querySelector('.achievements-grid');
    if (!grid) return;

    grid.innerHTML = achievements.map(ach => {
      const items = Array.isArray(ach.items) ? ach.items : [];
      return `
        <article class="achievement-card glass-card reveal active">
          <span class="achievement-icon">${ach.icon_emoji || '🏆'}</span>
          <h3>${escapeHtml(ach.title)}</h3>
          ${ach.description ? `<p>${escapeHtml(ach.description)}</p>` : ''}
          ${items.length > 0 ? `
            <ul class="achievement-card-list">
              ${items.map(it => `<li>${escapeHtml(it)}</li>`).join('')}
            </ul>
          ` : ''}
          ${ach.badge_text ? `<span class="achievement-badge">${escapeHtml(ach.badge_text)}</span>` : ''}
        </article>
      `;
    }).join('');
  }

  // --- Dynamic Coding Profiles Renderer ---
  function renderDynamicCodingProfiles(profiles) {
    const grid = document.querySelector('.profiles-grid');
    if (!grid) return;

    const platformIcons = {
      'github': '<svg viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
      'linkedin': '<svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
      'leetcode': '<svg viewBox="0 0 24 24"><path d="M13.483 0a1.374 1.374 0 00-.961.4l-7.2 7.2a1.37 1.37 0 000 1.937L11.3 15.51a1.37 1.37 0 001.936 0l7.2-7.2a1.37 1.37 0 000-1.936L14.444.4a1.374 1.374 0 00-.961-.4zm0 2.74l4.462 4.46L13.483 11.66 9.02 7.2l4.463-4.46zM3.4 11.4c-.75 0-1.4.65-1.4 1.4v6c0 .75.65 1.4 1.4 1.4h6c.75 0 1.4-.65 1.4-1.4v-6c0-.75-.65-1.4-1.4-1.4H3.4zm0 2.8h6v3.2h-6v-3.2z"/></svg>',
      'hackerrank': '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
    };

    grid.innerHTML = profiles.map(p => {
      const key = p.platform ? p.platform.toLowerCase() : 'other';
      const icon = platformIcons[key] || platformIcons['github'];
      return `
        <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="profile-card glass-card reveal active">
          ${icon}
          <h3>${escapeHtml(p.platform)}</h3>
          <span class="profile-user">${escapeHtml(p.username)}</span>
        </a>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Trigger live data sync
  syncPortfolioData();
});
