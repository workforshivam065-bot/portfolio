/**
 * ============================================================================
 * SHIVAM SINGH PORTFOLIO ADMIN DASHBOARD & CMS CONTROLLER
 * ============================================================================
 */

(function () {
  'use strict';

  // State Management
  const state = {
    user: null,
    activeTab: 'overview',
    data: null,
    deleteTarget: null // { table: 'skills', id: '...', callback: fn }
  };

  // DOM Elements Cache
  const DOM = {
    authScreen: document.getElementById('auth-screen'),
    adminApp: document.getElementById('admin-app'),
    loginForm: document.getElementById('admin-login-form'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    loginError: document.getElementById('login-error-msg'),
    loginSubmitBtn: document.getElementById('login-submit-btn'),
    togglePasswordBtn: document.getElementById('toggle-password-btn'),
    authStatusPill: document.getElementById('auth-supabase-status'),
    openConfigBtn: document.getElementById('open-config-modal-btn'),

    // Shell
    sidebar: document.getElementById('admin-sidebar'),
    sidebarToggle: document.getElementById('sidebar-toggle-btn'),
    sidebarClose: document.getElementById('sidebar-close-btn'),
    currentUserEmail: document.getElementById('current-user-email'),
    currentUserInitial: document.getElementById('current-user-initial'),
    adminLogoutBtn: document.getElementById('admin-logout-btn'),
    themeToggleBtn: document.getElementById('admin-theme-toggle'),
    currentTabTitle: document.getElementById('current-tab-title'),

    // Overview Stats
    statProjects: document.getElementById('stat-projects-count'),
    statProjectsFeatured: document.getElementById('stat-projects-featured'),
    statSkills: document.getElementById('stat-skills-count'),
    statSkillsCategories: document.getElementById('stat-skills-categories'),
    statAchievements: document.getElementById('stat-achievements-count'),
    statExperience: document.getElementById('stat-experience-count'),
    overviewResumeName: document.getElementById('overview-resume-name'),
    overviewResumeDate: document.getElementById('overview-resume-date'),
    overviewResumeLink: document.getElementById('overview-resume-link'),
    overviewSupabaseUrl: document.getElementById('overview-supabase-url'),
    overviewLastSync: document.getElementById('overview-last-sync'),

    // Badges
    badgeSkillsCount: document.getElementById('badge-skills-count'),
    badgeProjectsCount: document.getElementById('badge-projects-count'),

    // Toasts
    toastContainer: document.getElementById('admin-toast-container')
  };

  /**
   * ==========================================================================
   * 1. INITIALIZATION & AUTHENTICATION
   * ==========================================================================
   */
  async function init() {
    initTheme();
    bindEvents();
    checkSupabaseConnectionStatus();
    await checkAuth();
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
    }
  }

  function checkSupabaseConnectionStatus() {
    const config = window.PortfolioSupabase.getConfig();
    if (!config.isConfigured) {
      updateStatusPill('disconnected', 'Supabase: Not Configured (Click to set keys)');
    } else {
      window.PortfolioSupabase.testConnection().then(res => {
        if (res.success) {
          updateStatusPill('connected', 'Supabase: Connected');
        } else {
          updateStatusPill('disconnected', 'Supabase: ' + (res.error || 'Connection Failed'));
        }
      });
    }
  }

  function updateStatusPill(status, text) {
    if (!DOM.authStatusPill) return;
    DOM.authStatusPill.className = 'status-pill status-' + status;
    const txtEl = DOM.authStatusPill.querySelector('.status-text');
    if (txtEl) txtEl.textContent = text;
  }

  async function checkAuth() {
    const client = window.PortfolioSupabase.getClient();

    if (!client) {
      showAuthScreen();
      return;
    }

    try {
      const { data: { session }, error } = await client.auth.getSession();
      if (session && session.user) {
        state.user = session.user;
        showAdminApp();
        loadAllData();
      } else {
        showAuthScreen();
      }

      // Listen for auth state changes
      client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          state.user = session.user;
          showAdminApp();
          loadAllData();
        } else if (event === 'SIGNED_OUT') {
          state.user = null;
          showAuthScreen();
        }
      });
    } catch (err) {
      console.warn('Auth check error:', err);
      showAuthScreen();
    }
  }

  function showAuthScreen() {
    DOM.authScreen.style.display = 'flex';
    DOM.adminApp.style.display = 'none';
  }

  function showAdminApp() {
    DOM.authScreen.style.display = 'none';
    DOM.adminApp.style.display = 'flex';

    if (state.user && state.user.email) {
      DOM.currentUserEmail.textContent = state.user.email;
      DOM.currentUserInitial.textContent = state.user.email.charAt(0).toUpperCase();
    }
  }

  /**
   * Login handler
   */
  async function handleLogin(e) {
    e.preventDefault();
    const email = DOM.loginEmail.value.trim();
    const password = DOM.loginPassword.value;

    DOM.loginError.style.display = 'none';

    const client = window.PortfolioSupabase.getClient();
    if (!client) {
      DOM.loginError.textContent = 'Please configure your Supabase Project URL and Anon Key first using the button below.';
      DOM.loginError.style.display = 'block';
      return;
    }

    DOM.loginSubmitBtn.disabled = true;
    DOM.loginSubmitBtn.innerHTML = '<span>Signing in...</span>';

    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        DOM.loginError.textContent = error.message || 'Invalid login credentials.';
        DOM.loginError.style.display = 'block';
        DOM.loginSubmitBtn.disabled = false;
        DOM.loginSubmitBtn.innerHTML = '<span>Sign In to Dashboard</span>';
      } else {
        showToast('Welcome back, ' + (data.user.email || 'Admin') + '!', 'success');
        DOM.loginSubmitBtn.disabled = false;
        DOM.loginSubmitBtn.innerHTML = '<span>Sign In to Dashboard</span>';
      }
    } catch (err) {
      DOM.loginError.textContent = err.message || 'Network error signing in.';
      DOM.loginError.style.display = 'block';
      DOM.loginSubmitBtn.disabled = false;
      DOM.loginSubmitBtn.innerHTML = '<span>Sign In to Dashboard</span>';
    }
  }

  /**
   * Logout handler
   */
  async function handleLogout() {
    const client = window.PortfolioSupabase.getClient();
    if (client) {
      await client.auth.signOut();
    }
    state.user = null;
    showToast('Signed out successfully.', 'info');
    showAuthScreen();
  }

  /**
   * ==========================================================================
   * 2. DATA LOADING & SYNCHRONIZATION
   * ==========================================================================
   */
  async function loadAllData() {
    const res = await window.PortfolioSupabase.fetchPortfolioData();
    state.data = res.data;

    // Render all views
    renderOverview();
    renderProfileForm();
    renderSkills();
    renderProjects();
    renderExperience();
    renderEducation();
    renderAchievements();
    renderCodingProfiles();
    renderResumeView();
    renderSettingsView();

    DOM.overviewLastSync.textContent = new Date().toLocaleTimeString();
  }

  /**
   * Overview pane rendering
   */
  function renderOverview() {
    if (!state.data) return;

    const projects = state.data.projects || [];
    const skills = state.data.skills || [];
    const achievements = state.data.achievements || [];
    const experience = state.data.experience || [];
    const profile = state.data.profile || {};

    DOM.statProjects.textContent = projects.length;
    DOM.statProjectsFeatured.textContent = projects.filter(p => p.is_featured).length + ' Featured';
    DOM.badgeProjectsCount.textContent = projects.length;

    DOM.statSkills.textContent = skills.length;
    const categories = new Set(skills.map(s => s.category));
    DOM.statSkillsCategories.textContent = categories.size + ' Categories';
    DOM.badgeSkillsCount.textContent = skills.length;

    DOM.statAchievements.textContent = achievements.length;
    DOM.statExperience.textContent = experience.length;

    // Resume info
    const resumeUrl = profile.resume_url || '#';
    DOM.overviewResumeLink.href = resumeUrl;
    DOM.overviewResumeDate.textContent = 'Active Link: ' + (resumeUrl.length > 50 ? resumeUrl.substring(0, 50) + '...' : resumeUrl);

    // Supabase URL status
    const config = window.PortfolioSupabase.getConfig();
    DOM.overviewSupabaseUrl.textContent = config.url ? config.url.replace(/^https?:\/\//, '') : 'None';
  }

  /**
   * ==========================================================================
   * 3. PERSONAL INFO & ABOUT ME
   * ==========================================================================
   */
  function renderProfileForm() {
    if (!state.data || !state.data.profile) return;
    const p = state.data.profile;

    document.getElementById('prof-name').value = p.full_name || '';
    document.getElementById('prof-title').value = p.title || '';
    document.getElementById('prof-tagline').value = p.tagline || '';
    document.getElementById('prof-img').value = p.profile_image_url || '';
    document.getElementById('prof-email').value = p.email || '';
    document.getElementById('prof-phone').value = p.phone || '';
    document.getElementById('prof-location').value = p.location || '';
    document.getElementById('prof-bio1').value = p.bio_p1 || '';
    document.getElementById('prof-bio2').value = p.bio_p2 || '';
    document.getElementById('prof-bio3').value = p.bio_p3 || '';
  }

  async function saveProfile() {
    const client = window.PortfolioSupabase.getClient();
    if (!client) {
      showToast('Supabase client not connected. Save your keys in Settings first.', 'error');
      return;
    }

    const payload = {
      full_name: document.getElementById('prof-name').value.trim(),
      title: document.getElementById('prof-title').value.trim(),
      tagline: document.getElementById('prof-tagline').value.trim(),
      profile_image_url: document.getElementById('prof-img').value.trim(),
      email: document.getElementById('prof-email').value.trim(),
      phone: document.getElementById('prof-phone').value.trim(),
      location: document.getElementById('prof-location').value.trim(),
      bio_p1: document.getElementById('prof-bio1').value.trim(),
      bio_p2: document.getElementById('prof-bio2').value.trim(),
      bio_p3: document.getElementById('prof-bio3').value.trim(),
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await client.from('profile').upsert({ id: 1, ...payload });
      if (error) throw error;
      showToast('Profile information updated successfully!', 'success');
      loadAllData();
    } catch (err) {
      showToast('Error saving profile: ' + err.message, 'error');
    }
  }

  /**
   * ==========================================================================
   * 4. TECHNICAL SKILLS CRUD
   * ==========================================================================
   */
  let currentSkillCategoryFilter = 'ALL';

  function renderSkills() {
    const tbody = document.getElementById('skills-table-body');
    if (!tbody || !state.data) return;

    let skills = state.data.skills || [];
    if (currentSkillCategoryFilter !== 'ALL') {
      skills = skills.filter(s => s.category === currentSkillCategoryFilter);
    }

    if (skills.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center; padding: 2rem;">No skills found in this category. Click "+ Add New Skill" to create one.</td></tr>`;
      return;
    }

    tbody.innerHTML = skills.map(skill => {
      const prof = skill.proficiency || (skill.level >= 85 ? 'Advanced' : (skill.level >= 70 ? 'Intermediate' : 'Beginner'));
      const badgeClass = prof === 'Advanced' ? 'skill-badge-advanced' : (prof === 'Intermediate' ? 'skill-badge-intermediate' : 'skill-badge-beginner');
      return `
        <tr>
          <td><strong>${escapeHtml(skill.name)}</strong></td>
          <td><span class="badge badge-primary">${escapeHtml(skill.category)}</span></td>
          <td>
            <span class="skill-badge ${badgeClass}">${prof}</span>
          </td>
          <td>${skill.display_order || 1}</td>
          <td>
            <div class="action-btns">
              <button class="table-action-btn" title="Edit Skill" onclick="AdminApp.editSkill('${skill.id}')">
                <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <button class="table-action-btn btn-delete" title="Delete Skill" onclick="AdminApp.confirmDelete('skills', '${skill.id}', '${escapeHtml(skill.name)}')">
                <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function openAddSkillModal() {
    document.getElementById('skill-modal-title').textContent = 'Add New Skill';
    document.getElementById('modal-skill-id').value = '';
    document.getElementById('modal-skill-name').value = '';
    document.getElementById('modal-skill-category').value = currentSkillCategoryFilter !== 'ALL' ? currentSkillCategoryFilter : 'Programming Languages';
    document.getElementById('modal-skill-proficiency').value = 'Advanced';
    document.getElementById('modal-skill-order').value = (state.data.skills ? state.data.skills.length + 1 : 1);
    openModal('skill-modal');
  }

  function editSkill(id) {
    const skill = (state.data.skills || []).find(s => String(s.id) === String(id));
    if (!skill) return;

    const prof = skill.proficiency || (skill.level >= 85 ? 'Advanced' : (skill.level >= 70 ? 'Intermediate' : 'Beginner'));
    document.getElementById('skill-modal-title').textContent = 'Edit Skill: ' + skill.name;
    document.getElementById('modal-skill-id').value = skill.id;
    document.getElementById('modal-skill-name').value = skill.name;
    document.getElementById('modal-skill-category').value = skill.category;
    document.getElementById('modal-skill-proficiency').value = prof;
    document.getElementById('modal-skill-order').value = skill.display_order || 1;
    openModal('skill-modal');
  }

  async function saveSkill(e) {
    e.preventDefault();
    const client = window.PortfolioSupabase.getClient();
    if (!client) {
      showToast('Connect Supabase first in Settings.', 'error');
      return;
    }

    const id = document.getElementById('modal-skill-id').value;
    const prof = document.getElementById('modal-skill-proficiency').value;
    const payload = {
      name: document.getElementById('modal-skill-name').value.trim(),
      category: document.getElementById('modal-skill-category').value,
      proficiency: prof,
      level: prof === 'Advanced' ? 90 : (prof === 'Intermediate' ? 75 : 55),
      display_order: parseInt(document.getElementById('modal-skill-order').value, 10) || 1
    };

    try {
      if (id) {
        const { error } = await client.from('skills').update(payload).eq('id', id);
        if (error) throw error;
        showToast('Skill updated successfully!', 'success');
      } else {
        const { error } = await client.from('skills').insert([payload]);
        if (error) throw error;
        showToast('Skill added successfully!', 'success');
      }
      closeModal('skill-modal');
      loadAllData();
    } catch (err) {
      showToast('Error saving skill: ' + err.message, 'error');
    }
  }

  /**
   * ==========================================================================
   * 5. PROJECTS CRUD
   * ==========================================================================
   */
  function renderProjects() {
    const container = document.getElementById('projects-admin-cards');
    if (!container || !state.data) return;

    const projects = state.data.projects || [];
    if (projects.length === 0) {
      container.innerHTML = `<div class="card glass-card" style="grid-column: 1/-1; text-align:center; padding: 3rem;"><p class="text-muted">No projects found. Click "+ Add New Project" to add one.</p></div>`;
      return;
    }

    container.innerHTML = projects.map(proj => {
      const isFeatured = proj.is_featured;
      const tags = Array.isArray(proj.tags) ? proj.tags : [];

      return `
        <div class="card glass-card project-admin-card ${isFeatured ? 'featured-card' : ''}">
          <div class="card-top-badges">
            <span class="badge ${isFeatured ? 'badge-primary' : 'badge-warning'}">
              ${isFeatured ? '★ Featured Flagship' : (proj.subtitle || 'Project')}
            </span>
            <span class="text-muted font-sm">Order: #${proj.display_order || 1}</span>
          </div>

          <h3 style="margin-bottom: 0.4rem; font-size: 1.2rem;">${escapeHtml(proj.title)}</h3>
          <p class="text-muted font-sm" style="margin-bottom: 0.8rem; line-height: 1.5;">${escapeHtml(proj.description || '')}</p>

          <div class="project-tags-cloud">
            ${tags.map(t => `<span class="proj-tag-pill">${escapeHtml(t)}</span>`).join('')}
          </div>

          <div class="card-footer-actions">
            <div style="display:flex; gap:0.5rem;">
              ${proj.demo_url && proj.demo_url !== '#' ? `<a href="${proj.demo_url}" target="_blank" class="btn-text">Demo ↗</a>` : ''}
              ${proj.github_url ? `<a href="${proj.github_url}" target="_blank" class="btn-text">GitHub ↗</a>` : ''}
            </div>
            <div class="action-btns">
              <button class="table-action-btn" title="Edit Project" onclick="AdminApp.editProject('${proj.id}')">
                <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <button class="table-action-btn btn-delete" title="Delete Project" onclick="AdminApp.confirmDelete('projects', '${proj.id}', '${escapeHtml(proj.title)}')">
                <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function openAddProjectModal() {
    document.getElementById('project-modal-title').textContent = 'Add New Project';
    document.getElementById('modal-project-id').value = '';
    document.getElementById('modal-project-title').value = '';
    document.getElementById('modal-project-subtitle').value = '';
    document.getElementById('modal-project-desc').value = '';
    document.getElementById('modal-project-bullets').value = '';
    document.getElementById('modal-project-problem').value = '';
    document.getElementById('modal-project-tags').value = '';
    document.getElementById('modal-project-github').value = '';
    document.getElementById('modal-project-demo').value = '';
    document.getElementById('modal-project-flag').value = 'Featured Project';
    document.getElementById('modal-project-featured').checked = false;
    document.getElementById('modal-project-order').value = (state.data.projects ? state.data.projects.length + 1 : 1);
    openModal('project-modal');
  }

  function editProject(id) {
    const proj = (state.data.projects || []).find(p => String(p.id) === String(id));
    if (!proj) return;

    document.getElementById('project-modal-title').textContent = 'Edit Project: ' + proj.title;
    document.getElementById('modal-project-id').value = proj.id;
    document.getElementById('modal-project-title').value = proj.title || '';
    document.getElementById('modal-project-subtitle').value = proj.subtitle || '';
    document.getElementById('modal-project-desc').value = proj.description || '';
    
    // Bullets
    const bullets = Array.isArray(proj.bullets) ? proj.bullets.join('\n') : '';
    document.getElementById('modal-project-bullets').value = bullets;

    document.getElementById('modal-project-problem').value = proj.problem_solved || '';
    
    // Tags
    const tags = Array.isArray(proj.tags) ? proj.tags.join(', ') : '';
    document.getElementById('modal-project-tags').value = tags;

    document.getElementById('modal-project-github').value = proj.github_url || '';
    document.getElementById('modal-project-demo').value = proj.demo_url || '';
    document.getElementById('modal-project-flag').value = proj.featured_flag_label || '';
    document.getElementById('modal-project-featured').checked = !!proj.is_featured;
    document.getElementById('modal-project-order').value = proj.display_order || 1;
    openModal('project-modal');
  }

  async function saveProject(e) {
    e.preventDefault();
    const client = window.PortfolioSupabase.getClient();
    if (!client) {
      showToast('Connect Supabase first in Settings.', 'error');
      return;
    }

    const id = document.getElementById('modal-project-id').value;
    
    // Parse bullets
    const rawBullets = document.getElementById('modal-project-bullets').value.split('\n')
      .map(b => b.trim())
      .filter(b => b.length > 0);

    // Parse tags
    const rawTags = document.getElementById('modal-project-tags').value.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      title: document.getElementById('modal-project-title').value.trim(),
      subtitle: document.getElementById('modal-project-subtitle').value.trim(),
      description: document.getElementById('modal-project-desc').value.trim(),
      bullets: rawBullets,
      problem_solved: document.getElementById('modal-project-problem').value.trim(),
      tags: rawTags,
      github_url: document.getElementById('modal-project-github').value.trim(),
      demo_url: document.getElementById('modal-project-demo').value.trim(),
      is_featured: document.getElementById('modal-project-featured').checked,
      featured_flag_label: document.getElementById('modal-project-flag').value.trim() || 'Featured Project',
      display_order: parseInt(document.getElementById('modal-project-order').value, 10) || 1
    };

    try {
      if (id) {
        const { error } = await client.from('projects').update(payload).eq('id', id);
        if (error) throw error;
        showToast('Project updated successfully!', 'success');
      } else {
        const { error } = await client.from('projects').insert([payload]);
        if (error) throw error;
        showToast('Project created successfully!', 'success');
      }
      closeModal('project-modal');
      loadAllData();
    } catch (err) {
      showToast('Error saving project: ' + err.message, 'error');
    }
  }

  /**
   * ==========================================================================
   * 6. EXPERIENCE CRUD
   * ==========================================================================
   */
  function renderExperience() {
    const container = document.getElementById('experience-admin-list');
    if (!container || !state.data) return;

    const list = state.data.experience || [];
    if (list.length === 0) {
      container.innerHTML = `<div class="card glass-card" style="padding: 2rem; text-align:center;"><p class="text-muted">No experience entries found.</p></div>`;
      return;
    }

    container.innerHTML = list.map(item => {
      const bullets = Array.isArray(item.bullets) ? item.bullets : [];
      const tags = Array.isArray(item.tags) ? item.tags : [];

      return `
        <div class="card glass-card list-item-card">
          <div class="list-item-content">
            <div class="list-item-header">
              <h3 class="list-item-title">${escapeHtml(item.role)}</h3>
              <span class="list-item-subtitle">• ${escapeHtml(item.organization)}</span>
              <span class="badge badge-primary">${escapeHtml(item.period)}</span>
            </div>
            <ul class="list-item-bullets">
              ${bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
            </ul>
            <div class="project-tags-cloud" style="margin-top:0.75rem;">
              ${tags.map(t => `<span class="proj-tag-pill">${escapeHtml(t)}</span>`).join('')}
            </div>
          </div>
          <div class="action-btns">
            <button class="table-action-btn" title="Edit Experience" onclick="AdminApp.editExperience('${item.id}')">
              <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
            <button class="table-action-btn btn-delete" title="Delete Experience" onclick="AdminApp.confirmDelete('experience', '${item.id}', '${escapeHtml(item.role)}')">
              <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function openAddExperienceModal() {
    document.getElementById('experience-modal-title').textContent = 'Add Experience Entry';
    document.getElementById('modal-exp-id').value = '';
    document.getElementById('modal-exp-role').value = '';
    document.getElementById('modal-exp-org').value = '';
    document.getElementById('modal-exp-period').value = '2025 – Present';
    document.getElementById('modal-exp-bullets').value = '';
    document.getElementById('modal-exp-tags').value = '';
    document.getElementById('modal-exp-order').value = (state.data.experience ? state.data.experience.length + 1 : 1);
    openModal('experience-modal');
  }

  function editExperience(id) {
    const item = (state.data.experience || []).find(x => String(x.id) === String(id));
    if (!item) return;

    document.getElementById('experience-modal-title').textContent = 'Edit: ' + item.role;
    document.getElementById('modal-exp-id').value = item.id;
    document.getElementById('modal-exp-role').value = item.role || '';
    document.getElementById('modal-exp-org').value = item.organization || '';
    document.getElementById('modal-exp-period').value = item.period || '';
    document.getElementById('modal-exp-bullets').value = Array.isArray(item.bullets) ? item.bullets.join('\n') : '';
    document.getElementById('modal-exp-tags').value = Array.isArray(item.tags) ? item.tags.join(', ') : '';
    document.getElementById('modal-exp-order').value = item.display_order || 1;
    openModal('experience-modal');
  }

  async function saveExperience(e) {
    e.preventDefault();
    const client = window.PortfolioSupabase.getClient();
    if (!client) {
      showToast('Connect Supabase first in Settings.', 'error');
      return;
    }

    const id = document.getElementById('modal-exp-id').value;
    const bullets = document.getElementById('modal-exp-bullets').value.split('\n')
      .map(b => b.trim()).filter(b => b.length > 0);
    const tags = document.getElementById('modal-exp-tags').value.split(',')
      .map(t => t.trim()).filter(t => t.length > 0);

    const payload = {
      role: document.getElementById('modal-exp-role').value.trim(),
      organization: document.getElementById('modal-exp-org').value.trim(),
      period: document.getElementById('modal-exp-period').value.trim(),
      bullets: bullets,
      tags: tags,
      display_order: parseInt(document.getElementById('modal-exp-order').value, 10) || 1
    };

    try {
      if (id) {
        const { error } = await client.from('experience').update(payload).eq('id', id);
        if (error) throw error;
        showToast('Experience updated!', 'success');
      } else {
        const { error } = await client.from('experience').insert([payload]);
        if (error) throw error;
        showToast('Experience added!', 'success');
      }
      closeModal('experience-modal');
      loadAllData();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  }

  /**
   * ==========================================================================
   * 7. EDUCATION CRUD
   * ==========================================================================
   */
  function renderEducation() {
    const container = document.getElementById('education-admin-list');
    if (!container || !state.data) return;

    const list = state.data.education || [];
    container.innerHTML = list.map(item => `
      <div class="card glass-card list-item-card">
        <div class="list-item-content">
          <div class="list-item-header">
            <h3 class="list-item-title">${escapeHtml(item.degree)}</h3>
            <span class="badge badge-primary">${escapeHtml(item.badge_text || 'Degree')}</span>
          </div>
          <p class="text-secondary" style="margin-bottom:0.4rem;"><strong>${escapeHtml(item.institution)}</strong> (${escapeHtml(item.location_date)})</p>
          ${item.cgpa_value ? `<p class="font-sm" style="color:var(--primary-accent); margin-bottom:0.3rem;"><strong>${escapeHtml(item.cgpa_label || 'CGPA:')}</strong> ${escapeHtml(item.cgpa_value)}</p>` : ''}
          <p class="font-sm text-muted">${escapeHtml(item.description || '')}</p>
        </div>
        <div class="action-btns">
          <button class="table-action-btn" title="Edit Education" onclick="AdminApp.editEducation('${item.id}')">
            <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          </button>
          <button class="table-action-btn btn-delete" title="Delete Education" onclick="AdminApp.confirmDelete('education', '${item.id}', '${escapeHtml(item.degree)}')">
            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  function openAddEducationModal() {
    document.getElementById('education-modal-title').textContent = 'Add Education Record';
    document.getElementById('modal-edu-id').value = '';
    document.getElementById('modal-edu-degree').value = '';
    document.getElementById('modal-edu-inst').value = '';
    document.getElementById('modal-edu-date').value = '';
    document.getElementById('modal-edu-cgpa-val').value = '';
    document.getElementById('modal-edu-semesters').value = '';
    document.getElementById('modal-edu-desc').value = '';
    document.getElementById('modal-edu-tags').value = '';
    document.getElementById('modal-edu-order').value = (state.data.education ? state.data.education.length + 1 : 1);
    openModal('education-modal');
  }

  function editEducation(id) {
    const item = (state.data.education || []).find(e => String(e.id) === String(id));
    if (!item) return;

    document.getElementById('education-modal-title').textContent = 'Edit Education';
    document.getElementById('modal-edu-id').value = item.id;
    document.getElementById('modal-edu-degree').value = item.degree || '';
    document.getElementById('modal-edu-inst').value = item.institution || '';
    document.getElementById('modal-edu-date').value = item.location_date || '';
    document.getElementById('modal-edu-cgpa-val').value = item.cgpa_value || '';
    document.getElementById('modal-edu-semesters').value = item.semesters_text || '';
    document.getElementById('modal-edu-desc').value = item.description || '';
    document.getElementById('modal-edu-tags').value = Array.isArray(item.coursework_tags) ? item.coursework_tags.join(', ') : '';
    document.getElementById('modal-edu-order').value = item.display_order || 1;
    openModal('education-modal');
  }

  async function saveEducation(e) {
    e.preventDefault();
    const client = window.PortfolioSupabase.getClient();
    if (!client) return;

    const id = document.getElementById('modal-edu-id').value;
    const tags = document.getElementById('modal-edu-tags').value.split(',')
      .map(t => t.trim()).filter(t => t.length > 0);

    const payload = {
      degree: document.getElementById('modal-edu-degree').value.trim(),
      institution: document.getElementById('modal-edu-inst').value.trim(),
      location_date: document.getElementById('modal-edu-date').value.trim(),
      cgpa_label: document.getElementById('modal-edu-cgpa-val').value ? '1st Year Cumulative CGPA:' : '',
      cgpa_value: document.getElementById('modal-edu-cgpa-val').value.trim(),
      semesters_text: document.getElementById('modal-edu-semesters').value.trim(),
      description: document.getElementById('modal-edu-desc').value.trim(),
      coursework_tags: tags,
      display_order: parseInt(document.getElementById('modal-edu-order').value, 10) || 1
    };

    try {
      if (id) {
        await client.from('education').update(payload).eq('id', id);
        showToast('Education updated!', 'success');
      } else {
        await client.from('education').insert([payload]);
        showToast('Education added!', 'success');
      }
      closeModal('education-modal');
      loadAllData();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  }

  /**
   * ==========================================================================
   * 8. ACHIEVEMENTS CRUD
   * ==========================================================================
   */
  function renderAchievements() {
    const container = document.getElementById('achievements-admin-list');
    if (!container || !state.data) return;

    const list = state.data.achievements || [];
    container.innerHTML = list.map(item => {
      const items = Array.isArray(item.items) ? item.items : [];
      return `
        <div class="card glass-card list-item-card">
          <div class="list-item-content">
            <div class="list-item-header">
              <span style="font-size:1.5rem;">${item.icon_emoji || '🏆'}</span>
              <h3 class="list-item-title">${escapeHtml(item.title)}</h3>
              ${item.badge_text ? `<span class="badge badge-warning">${escapeHtml(item.badge_text)}</span>` : ''}
            </div>
            ${item.description ? `<p class="font-sm text-secondary" style="margin-top:0.4rem;">${escapeHtml(item.description)}</p>` : ''}
            <ul class="list-item-bullets">
              ${items.map(it => `<li>${escapeHtml(it)}</li>`).join('')}
            </ul>
          </div>
          <div class="action-btns">
            <button class="table-action-btn" title="Edit Achievement" onclick="AdminApp.editAchievement('${item.id}')">
              <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
            <button class="table-action-btn btn-delete" title="Delete Achievement" onclick="AdminApp.confirmDelete('achievements', '${item.id}', '${escapeHtml(item.title)}')">
              <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function openAddAchievementModal() {
    document.getElementById('achievement-modal-title').textContent = 'Add Achievement Record';
    document.getElementById('modal-ach-id').value = '';
    document.getElementById('modal-ach-title').value = '';
    document.getElementById('modal-ach-emoji').value = '🏆';
    document.getElementById('modal-ach-badge').value = '';
    document.getElementById('modal-ach-desc').value = '';
    document.getElementById('modal-ach-items').value = '';
    document.getElementById('modal-ach-order').value = (state.data.achievements ? state.data.achievements.length + 1 : 1);
    openModal('achievement-modal');
  }

  function editAchievement(id) {
    const item = (state.data.achievements || []).find(a => String(a.id) === String(id));
    if (!item) return;

    document.getElementById('achievement-modal-title').textContent = 'Edit: ' + item.title;
    document.getElementById('modal-ach-id').value = item.id;
    document.getElementById('modal-ach-title').value = item.title || '';
    document.getElementById('modal-ach-emoji').value = item.icon_emoji || '🏆';
    document.getElementById('modal-ach-badge').value = item.badge_text || '';
    document.getElementById('modal-ach-desc').value = item.description || '';
    document.getElementById('modal-ach-items').value = Array.isArray(item.items) ? item.items.join('\n') : '';
    document.getElementById('modal-ach-order').value = item.display_order || 1;
    openModal('achievement-modal');
  }

  async function saveAchievement(e) {
    e.preventDefault();
    const client = window.PortfolioSupabase.getClient();
    if (!client) return;

    const id = document.getElementById('modal-ach-id').value;
    const items = document.getElementById('modal-ach-items').value.split('\n')
      .map(i => i.trim()).filter(i => i.length > 0);

    const payload = {
      title: document.getElementById('modal-ach-title').value.trim(),
      icon_emoji: document.getElementById('modal-ach-emoji').value.trim() || '🏆',
      badge_text: document.getElementById('modal-ach-badge').value.trim(),
      description: document.getElementById('modal-ach-desc').value.trim(),
      items: items,
      display_order: parseInt(document.getElementById('modal-ach-order').value, 10) || 1
    };

    try {
      if (id) {
        await client.from('achievements').update(payload).eq('id', id);
        showToast('Achievement updated!', 'success');
      } else {
        await client.from('achievements').insert([payload]);
        showToast('Achievement added!', 'success');
      }
      closeModal('achievement-modal');
      loadAllData();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  }

  /**
   * ==========================================================================
   * 9. CODING PROFILES CRUD
   * ==========================================================================
   */
  function renderCodingProfiles() {
    const tbody = document.getElementById('profiles-table-body');
    if (!tbody || !state.data) return;

    const list = state.data.coding_profiles || [];
    tbody.innerHTML = list.map(item => `
      <tr>
        <td><strong>${escapeHtml(item.platform)}</strong></td>
        <td>${escapeHtml(item.username)}</td>
        <td><a href="${item.url}" target="_blank" class="font-mono font-sm">${escapeHtml(item.url)} ↗</a></td>
        <td>${item.display_order || 1}</td>
        <td>
          <div class="action-btns">
            <button class="table-action-btn" title="Edit Profile" onclick="AdminApp.editCodingProfile('${item.id}')">
              <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
            <button class="table-action-btn btn-delete" title="Delete Profile" onclick="AdminApp.confirmDelete('coding_profiles', '${item.id}', '${escapeHtml(item.platform)}')">
              <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openAddCodingProfileModal() {
    document.getElementById('profile-modal-title').textContent = 'Add Coding Profile';
    document.getElementById('modal-cp-id').value = '';
    document.getElementById('modal-cp-platform').value = '';
    document.getElementById('modal-cp-user').value = '';
    document.getElementById('modal-cp-url').value = '';
    document.getElementById('modal-cp-order').value = (state.data.coding_profiles ? state.data.coding_profiles.length + 1 : 1);
    openModal('profile-modal');
  }

  function editCodingProfile(id) {
    const item = (state.data.coding_profiles || []).find(p => String(p.id) === String(id));
    if (!item) return;

    document.getElementById('profile-modal-title').textContent = 'Edit: ' + item.platform;
    document.getElementById('modal-cp-id').value = item.id;
    document.getElementById('modal-cp-platform').value = item.platform || '';
    document.getElementById('modal-cp-user').value = item.username || '';
    document.getElementById('modal-cp-url').value = item.url || '';
    document.getElementById('modal-cp-order').value = item.display_order || 1;
    openModal('profile-modal');
  }

  async function saveCodingProfile(e) {
    e.preventDefault();
    const client = window.PortfolioSupabase.getClient();
    if (!client) return;

    const id = document.getElementById('modal-cp-id').value;
    const payload = {
      platform: document.getElementById('modal-cp-platform').value.trim(),
      username: document.getElementById('modal-cp-user').value.trim(),
      url: document.getElementById('modal-cp-url').value.trim(),
      display_order: parseInt(document.getElementById('modal-cp-order').value, 10) || 1
    };

    try {
      if (id) {
        await client.from('coding_profiles').update(payload).eq('id', id);
        showToast('Profile link updated!', 'success');
      } else {
        await client.from('coding_profiles').insert([payload]);
        showToast('Profile link added!', 'success');
      }
      closeModal('profile-modal');
      loadAllData();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  }

  /**
   * ==========================================================================
   * 10. RESUME MANAGEMENT
   * ==========================================================================
   */
  function renderResumeView() {
    if (!state.data || !state.data.profile) return;
    const p = state.data.profile;
    const resumeUrl = p.resume_url || '#';

    document.getElementById('active-resume-target').textContent = resumeUrl;
    document.getElementById('btn-view-live-resume').href = resumeUrl;
    document.getElementById('manual-resume-url').value = resumeUrl.includes('drive.google') ? resumeUrl : '';

    if (p.resume_updated_at) {
      document.getElementById('active-resume-date').textContent = 'Last Updated: ' + new Date(p.resume_updated_at).toLocaleDateString();
    }
  }

  async function handleResumeFileUpload(file) {
    if (!file || file.type !== 'application/pdf') {
      showToast('Please select a valid PDF file.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds the 10MB limit.', 'error');
      return;
    }

    const client = window.PortfolioSupabase.getClient();
    if (!client) {
      showToast('Connect Supabase first in Settings.', 'error');
      return;
    }

    const progressBox = document.getElementById('resume-upload-progress');
    const fillEl = document.getElementById('resume-progress-fill');
    const statusEl = document.getElementById('resume-upload-status');

    progressBox.style.display = 'block';
    fillEl.style.width = '30%';
    statusEl.textContent = 'Uploading to Supabase Storage bucket (portfolio-assets)...';

    try {
      const fileName = 'resumes/Shivam_Singh_Resume_' + Date.now() + '.pdf';

      const { data, error: uploadErr } = await client.storage
        .from('portfolio-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadErr) throw uploadErr;

      fillEl.style.width = '80%';
      statusEl.textContent = 'Updating public portfolio resume link...';

      // Get public URL
      const { data: urlData } = client.storage
        .from('portfolio-assets')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Update profile table
      await client.from('profile').upsert({
        id: 1,
        resume_url: publicUrl,
        resume_updated_at: new Date().toISOString()
      });

      fillEl.style.width = '100%';
      statusEl.textContent = 'Complete!';

      setTimeout(() => {
        progressBox.style.display = 'none';
        fillEl.style.width = '0%';
      }, 1500);

      showToast('Resume uploaded and public link updated successfully!', 'success');
      loadAllData();
    } catch (err) {
      progressBox.style.display = 'none';
      showToast('Upload failed: ' + err.message, 'error');
    }
  }

  async function saveManualResumeUrl() {
    const url = document.getElementById('manual-resume-url').value.trim();
    if (!url) {
      showToast('Please enter a valid URL.', 'error');
      return;
    }

    const client = window.PortfolioSupabase.getClient();
    if (!client) return;

    try {
      await client.from('profile').upsert({
        id: 1,
        resume_url: url,
        resume_updated_at: new Date().toISOString()
      });
      showToast('Resume URL updated successfully!', 'success');
      loadAllData();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  }

  /**
   * ==========================================================================
   * 11. GLOBAL DELETE CONFIRMATION
   * ==========================================================================
   */
  function confirmDelete(table, id, name) {
    state.deleteTarget = { table, id };
    document.getElementById('delete-confirm-message').textContent =
      `Are you sure you want to permanently delete "${name}" from your ${table}? This cannot be undone.`;
    openModal('delete-confirm-modal');
  }

  async function executeDelete() {
    if (!state.deleteTarget) return;

    const { table, id } = state.deleteTarget;
    const client = window.PortfolioSupabase.getClient();
    if (!client) return;

    try {
      const { error } = await client.from(table).delete().eq('id', id);
      if (error) throw error;
      showToast('Item deleted successfully.', 'info');
      closeModal('delete-confirm-modal');
      state.deleteTarget = null;
      loadAllData();
    } catch (err) {
      showToast('Error deleting item: ' + err.message, 'error');
    }
  }

  /**
   * ==========================================================================
   * 12. SEED INITIAL PORTFOLIO DATA TO SUPABASE
   * ==========================================================================
   */
  async function seedInitialData() {
    const client = window.PortfolioSupabase.getClient();
    if (!client) {
      showToast('Supabase client not connected. Configure credentials in Settings first.', 'error');
      return;
    }

    const btn = document.getElementById('btn-seed-supabase');
    btn.disabled = true;
    btn.innerHTML = '<span>Syncing to Supabase...</span>';

    try {
      const fb = window.PortfolioSupabase.FALLBACK_DATA;

      // 1. Profile
      await client.from('profile').upsert({ id: 1, ...fb.profile });

      // 2. Skills
      const cleanSkills = fb.skills.map(({ id, ...s }) => s);
      await client.from('skills').upsert(cleanSkills, { onConflict: 'name' });

      // 3. Projects
      const cleanProjects = fb.projects.map(({ id, ...p }) => p);
      await client.from('projects').upsert(cleanProjects, { onConflict: 'title' });

      // 4. Experience
      const cleanExp = fb.experience.map(({ id, ...e }) => e);
      await client.from('experience').upsert(cleanExp, { onConflict: 'role' });

      // 5. Education
      const cleanEdu = fb.education.map(({ id, ...ed }) => ed);
      await client.from('education').upsert(cleanEdu, { onConflict: 'degree' });

      // 6. Achievements
      const cleanAch = fb.achievements.map(({ id, ...a }) => a);
      await client.from('achievements').upsert(cleanAch, { onConflict: 'title' });

      // 7. Coding Profiles
      const cleanCP = fb.coding_profiles.map(({ id, ...cp }) => cp);
      await client.from('coding_profiles').upsert(cleanCP, { onConflict: 'platform' });

      showToast('Initial portfolio data synced to Supabase successfully!', 'success');
      btn.disabled = false;
      btn.innerHTML = '<span>Sync Initial Data to Supabase</span>';
      loadAllData();
    } catch (err) {
      showToast('Sync error: ' + err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '<span>Sync Initial Data to Supabase</span>';
    }
  }

  /**
   * ==========================================================================
   * 13. SETTINGS & BACKUP/RESTORE
   * ==========================================================================
   */
  function renderSettingsView() {
    const config = window.PortfolioSupabase.getConfig();
    const urlInput = document.getElementById('setting-supabase-url');
    const keyInput = document.getElementById('setting-supabase-key');

    if (urlInput && config.url && !config.url.includes('your-project')) {
      urlInput.value = config.url;
    }
    if (keyInput && config.anonKey && !config.anonKey.includes('your-anon-key')) {
      keyInput.value = config.anonKey;
    }
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    const url = document.getElementById('setting-supabase-url').value.trim();
    const key = document.getElementById('setting-supabase-key').value.trim();

    window.PortfolioSupabase.saveConfig(url, key);
    showToast('Supabase settings saved! Re-testing connection...', 'info');

    const res = await window.PortfolioSupabase.testConnection(url, key);
    if (res.success) {
      showToast('Connected to Supabase successfully!', 'success');
    } else {
      showToast('Warning: ' + res.error, 'error');
    }

    checkSupabaseConnectionStatus();
    loadAllData();
  }

  function exportBackup() {
    if (!state.data) return;
    const jsonStr = JSON.stringify(state.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shivam_portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded!', 'success');
  }

  async function handleImportBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        const client = window.PortfolioSupabase.getClient();
        if (!client) {
          showToast('Connect Supabase first in Settings before restoring.', 'error');
          return;
        }

        if (imported.profile) await client.from('profile').upsert({ id: 1, ...imported.profile });
        if (imported.skills) await client.from('skills').upsert(imported.skills.map(({ id, ...s }) => s));
        if (imported.projects) await client.from('projects').upsert(imported.projects.map(({ id, ...p }) => p));
        if (imported.experience) await client.from('experience').upsert(imported.experience.map(({ id, ...x }) => x));
        if (imported.education) await client.from('education').upsert(imported.education.map(({ id, ...ed }) => ed));
        if (imported.achievements) await client.from('achievements').upsert(imported.achievements.map(({ id, ...a }) => a));
        if (imported.coding_profiles) await client.from('coding_profiles').upsert(imported.coding_profiles.map(({ id, ...cp }) => cp));

        showToast('Portfolio data restored from backup successfully!', 'success');
        loadAllData();
      } catch (err) {
        showToast('Error reading backup file: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  /**
   * ==========================================================================
   * 14. UI HELPERS (MODALS, TABS, TOASTS)
   * ==========================================================================
   */
  function switchTab(tabId) {
    state.activeTab = tabId;

    // Nav items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === 'tab-' + tabId);
    });

    // Update title
    const activeNav = document.querySelector(`.sidebar-nav .nav-item[data-tab="${tabId}"] span`);
    if (activeNav) {
      DOM.currentTabTitle.textContent = activeNav.textContent;
    }

    // Auto-close sidebar on mobile
    if (window.innerWidth <= 900) {
      DOM.sidebar.classList.remove('open');
    }
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
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

  /**
   * ==========================================================================
   * 15. EVENT BINDINGS
   * ==========================================================================
   */
  function bindEvents() {
    // Auth
    if (DOM.loginForm) DOM.loginForm.addEventListener('submit', handleLogin);
    if (DOM.adminLogoutBtn) DOM.adminLogoutBtn.addEventListener('click', handleLogout);

    if (DOM.togglePasswordBtn) {
      DOM.togglePasswordBtn.addEventListener('click', () => {
        const type = DOM.loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        DOM.loginPassword.setAttribute('type', type);
      });
    }

    // Open Config Modal from Auth screen
    if (DOM.openConfigBtn) {
      DOM.openConfigBtn.addEventListener('click', () => {
        const cfg = window.PortfolioSupabase.getConfig();
        if (cfg.url && !cfg.url.includes('your-project')) {
          document.getElementById('setup-modal-url').value = cfg.url;
        }
        if (cfg.anonKey && !cfg.anonKey.includes('your-anon-key')) {
          document.getElementById('setup-modal-key').value = cfg.anonKey;
        }
        openModal('supabase-config-modal');
      });
    }

    // Supabase Config Modal Form
    const modalCfgForm = document.getElementById('modal-supabase-config-form');
    if (modalCfgForm) {
      modalCfgForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('setup-modal-url').value.trim();
        const key = document.getElementById('setup-modal-key').value.trim();
        window.PortfolioSupabase.saveConfig(url, key);
        closeModal('supabase-config-modal');
        showToast('Supabase project configuration saved!', 'success');
        checkSupabaseConnectionStatus();
      });
    }

    const modalTestBtn = document.getElementById('btn-modal-test-conn');
    if (modalTestBtn) {
      modalTestBtn.addEventListener('click', async () => {
        const url = document.getElementById('setup-modal-url').value.trim();
        const key = document.getElementById('setup-modal-key').value.trim();
        const statusBox = document.getElementById('setup-modal-status');
        statusBox.style.display = 'block';
        statusBox.textContent = 'Testing connection to ' + url + '...';
        statusBox.className = 'alert-box alert-info';

        const res = await window.PortfolioSupabase.testConnection(url, key);
        if (res.success) {
          statusBox.textContent = 'Connection successful! Tables detected.';
          statusBox.className = 'alert-box alert-success';
        } else {
          statusBox.textContent = 'Connection failed: ' + res.error;
          statusBox.className = 'alert-box alert-error';
        }
      });
    }

    // Sidebar & Navigation
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
    });

    if (DOM.sidebarToggle) {
      DOM.sidebarToggle.addEventListener('click', () => DOM.sidebar.classList.toggle('open'));
    }
    if (DOM.sidebarClose) {
      DOM.sidebarClose.addEventListener('click', () => DOM.sidebar.classList.remove('open'));
    }

    // Theme Toggle
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
      });
    }

    // Overview buttons
    const btnRefresh = document.getElementById('btn-refresh-all');
    if (btnRefresh) btnRefresh.addEventListener('click', () => {
      showToast('Refreshing all portfolio data...', 'info');
      loadAllData();
    });

    const btnSeed = document.getElementById('btn-seed-supabase');
    if (btnSeed) btnSeed.addEventListener('click', seedInitialData);

    // Profile form
    const btnSaveProf = document.getElementById('btn-save-profile');
    if (btnSaveProf) btnSaveProf.addEventListener('click', saveProfile);

    // Skills
    const btnAddSkill = document.getElementById('btn-add-skill-modal');
    if (btnAddSkill) btnAddSkill.addEventListener('click', openAddSkillModal);

    const skillForm = document.getElementById('skill-modal-form');
    if (skillForm) skillForm.addEventListener('submit', saveSkill);

    // Skills filter tabs
    document.querySelectorAll('#skills-filter-tabs .filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#skills-filter-tabs .filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentSkillCategoryFilter = tab.getAttribute('data-category');
        renderSkills();
      });
    });

    // Projects
    const btnAddProj = document.getElementById('btn-add-project-modal');
    if (btnAddProj) btnAddProj.addEventListener('click', openAddProjectModal);

    const projForm = document.getElementById('project-modal-form');
    if (projForm) projForm.addEventListener('submit', saveProject);

    // Experience
    const btnAddExp = document.getElementById('btn-add-experience-modal');
    if (btnAddExp) btnAddExp.addEventListener('click', openAddExperienceModal);

    const expForm = document.getElementById('experience-modal-form');
    if (expForm) expForm.addEventListener('submit', saveExperience);

    // Education
    const btnAddEdu = document.getElementById('btn-add-education-modal');
    if (btnAddEdu) btnAddEdu.addEventListener('click', openAddEducationModal);

    const eduForm = document.getElementById('education-modal-form');
    if (eduForm) eduForm.addEventListener('submit', saveEducation);

    // Achievements
    const btnAddAch = document.getElementById('btn-add-achievement-modal');
    if (btnAddAch) btnAddAch.addEventListener('click', openAddAchievementModal);

    const achForm = document.getElementById('achievement-modal-form');
    if (achForm) achForm.addEventListener('submit', saveAchievement);

    // Coding profiles
    const btnAddCP = document.getElementById('btn-add-profile-modal');
    if (btnAddCP) btnAddCP.addEventListener('click', openAddCodingProfileModal);

    const cpForm = document.getElementById('profile-modal-form');
    if (cpForm) cpForm.addEventListener('submit', saveCodingProfile);

    // Resume Management
    const dropzone = document.getElementById('resume-dropzone');
    const fileInput = document.getElementById('resume-file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleResumeFileUpload(e.dataTransfer.files[0]);
        }
      });
      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files.length > 0) {
          handleResumeFileUpload(fileInput.files[0]);
        }
      });
    }

    const btnSaveManualResume = document.getElementById('btn-save-manual-resume');
    if (btnSaveManualResume) btnSaveManualResume.addEventListener('click', saveManualResumeUrl);

    // Delete Confirmation
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', executeDelete);

    // Settings
    const settingsForm = document.getElementById('settings-supabase-form');
    if (settingsForm) settingsForm.addEventListener('submit', handleSaveSettings);

    const btnTestConn = document.getElementById('btn-test-settings-connection');
    if (btnTestConn) btnTestConn.addEventListener('click', async () => {
      const url = document.getElementById('setting-supabase-url').value.trim();
      const key = document.getElementById('setting-supabase-key').value.trim();
      showToast('Testing Supabase connection...', 'info');
      const res = await window.PortfolioSupabase.testConnection(url, key);
      if (res.success) {
        showToast('Connection verified successfully!', 'success');
      } else {
        showToast('Failed: ' + res.error, 'error');
      }
    });

    const btnExport = document.getElementById('btn-export-backup');
    if (btnExport) btnExport.addEventListener('click', exportBackup);

    const importFileInput = document.getElementById('import-backup-file');
    if (importFileInput) {
      importFileInput.addEventListener('change', () => {
        if (importFileInput.files && importFileInput.files.length > 0) {
          handleImportBackup(importFileInput.files[0]);
        }
      });
    }

    // Modal Close Buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        closeModal(modalId);
      });
    });

    // Escape Key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
          modal.style.display = 'none';
        });
      }
    });
  }

  // Expose global methods for inline HTML onclick handlers
  window.AdminApp = {
    init: init,
    switchTab: switchTab,
    editSkill: editSkill,
    editProject: editProject,
    editExperience: editExperience,
    editEducation: editEducation,
    editAchievement: editAchievement,
    editCodingProfile: editCodingProfile,
    confirmDelete: confirmDelete
  };

  // Run on DOM Ready
  document.addEventListener('DOMContentLoaded', init);
})();
