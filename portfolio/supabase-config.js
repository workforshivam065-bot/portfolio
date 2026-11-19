/**
 * ============================================================================
 * SUPABASE CLIENT & CONFIGURATION MANAGER
 * For: Shivam Singh Portfolio & Admin CMS
 * ============================================================================
 * Handles Supabase client initialization, connection checking, credential storage,
 * and data fetching with instant local fallback caching.
 */

(function (window) {
  'use strict';

  // Default configuration placeholders (User can also configure via Admin Dashboard UI)
  const DEFAULT_CONFIG = {
    // You can replace these with your project values or enter them in the Admin Dashboard Settings UI
    SUPABASE_URL: window.PORTFOLIO_SUPABASE_URL || 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: window.PORTFOLIO_SUPABASE_ANON_KEY || 'your-anon-key'
  };

  // Local storage keys
  const STORAGE_KEYS = {
    URL: 'portfolio_supabase_url',
    KEY: 'portfolio_supabase_anon_key',
    DATA_CACHE: 'portfolio_data_cache',
    CACHE_TIME: 'portfolio_data_cache_time'
  };

  /**
   * Retrieves active Supabase credentials
   */
  function getConfig() {
    const storedUrl = localStorage.getItem(STORAGE_KEYS.URL);
    const storedKey = localStorage.getItem(STORAGE_KEYS.KEY);

    const url = (storedUrl && storedUrl.trim() !== '') ? storedUrl.trim() : DEFAULT_CONFIG.SUPABASE_URL;
    const anonKey = (storedKey && storedKey.trim() !== '') ? storedKey.trim() : DEFAULT_CONFIG.SUPABASE_ANON_KEY;

    const isPlaceholder = !url || url.includes('your-project') || !anonKey || anonKey.includes('your-anon-key');

    return {
      url: url,
      anonKey: anonKey,
      isConfigured: !isPlaceholder
    };
  }

  /**
   * Saves credentials to LocalStorage (configured via Admin Settings)
   */
  function saveConfig(url, anonKey) {
    if (url && anonKey) {
      localStorage.setItem(STORAGE_KEYS.URL, url.trim());
      localStorage.setItem(STORAGE_KEYS.KEY, anonKey.trim());
      // Clear client instance so it re-initializes on next call
      _client = null;
      return true;
    }
    return false;
  }

  /**
   * Clears custom credentials
   */
  function clearConfig() {
    localStorage.removeItem(STORAGE_KEYS.URL);
    localStorage.removeItem(STORAGE_KEYS.KEY);
    _client = null;
  }

  // Singleton Supabase Client
  let _client = null;

  function getClient() {
    if (_client) return _client;

    const config = getConfig();
    if (!config.isConfigured) return null;

    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
      try {
        _client = window.supabase.createClient(config.url, config.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        return _client;
      } catch (err) {
        console.error('Supabase initialization error:', err);
        return null;
      }
    } else {
      console.warn('Supabase SDK script not loaded yet.');
      return null;
    }
  }

  /**
   * Tests Supabase connectivity
   */
  async function testConnection(testUrl, testKey) {
    const url = testUrl || getConfig().url;
    const key = testKey || getConfig().anonKey;

    if (!url || !key || url.includes('your-project')) {
      return { success: false, error: 'Please enter valid Supabase Project URL and Anon Key.' };
    }

    try {
      if (typeof window.supabase === 'undefined') {
        return { success: false, error: 'Supabase JS library not loaded.' };
      }

      const tempClient = window.supabase.createClient(url, key);
      const { data, error } = await tempClient.from('profile').select('id').limit(1);

      if (error && error.code !== 'PGRST116') {
        return { success: false, error: error.message || 'Failed to query Supabase.' };
      }

      return { success: true, data: data };
    } catch (err) {
      return { success: false, error: err.message || 'Network error connecting to Supabase.' };
    }
  }

  /**
   * Public Fallback Data (Guarantees site never looks empty or breaks if offline)
   */
  const FALLBACK_DATA = {
    profile: {
      full_name: 'Shivam Singh',
      title: 'B.Tech CSE Student | AI & Full-Stack Developer',
      tagline: 'Enthusiastic and goal-oriented Computer Science undergraduate specializing in AI systems, RAG pipelines, and modern full-stack web architectures. Proactive leader experienced in community operations, organizing hackathons, public speaking, and sports.',
      location: 'Lucknow, Uttar Pradesh',
      phone: '+91 8787216094',
      email: 'shivamsingh88442288@gmail.com',
      bio_p1: 'Enthusiastic and goal-oriented Computer Science undergraduate with a solid foundation in software development, AI systems, and modern web architectures. Demonstrated capability in building end-to-end full-stack applications, integrating LLM APIs (Google Gemini), and designing robust Retrieval-Augmented Generation (RAG) pipelines.',
      bio_p2: 'Proactive leader and communicator experienced in operations management, organizing campus hackathons, public speaking, and sports. Striving to write clean, high-performance code and bridge real-world business requirements with cutting-edge artificial intelligence.',
      bio_p3: 'Currently in my 3rd semester of B.Tech CSE at Physics Wallah Skills, Lucknow, maintaining a 1st Year Cumulative CGPA of 8.1 / 10 (Semester 2: 8.73). Actively seeking opportunities to build impactful software products.',
      profile_image_url: 'profile.png',
      resume_url: 'https://drive.google.com/file/d/1cbHPIxeLpHI-0Q1UfT000r-VoJKPw0hQ/view?usp=sharing'
    },
    skills: [
      { id: '1', category: 'Programming Languages', name: 'C++', level: 90, display_order: 1 },
      { id: '2', category: 'Programming Languages', name: 'Java', level: 85, display_order: 2 },
      { id: '3', category: 'Programming Languages', name: 'JavaScript', level: 90, display_order: 3 },
      { id: '4', category: 'Programming Languages', name: 'C', level: 85, display_order: 4 },
      { id: '5', category: 'Web Technologies', name: 'React JS & Next.js', level: 90, display_order: 1 },
      { id: '6', category: 'Web Technologies', name: 'Node.js', level: 85, display_order: 2 },
      { id: '7', category: 'Web Technologies', name: 'Tailwind CSS', level: 92, display_order: 3 },
      { id: '8', category: 'Web Technologies', name: 'HTML5 & CSS3', level: 95, display_order: 4 },
      { id: '9', category: 'AI & Core Frameworks', name: 'Google Gemini API', level: 92, display_order: 1 },
      { id: '10', category: 'AI & Core Frameworks', name: 'RAG (Retrieval-Augmented Gen)', level: 88, display_order: 2 },
      { id: '11', category: 'AI & Core Frameworks', name: 'HTML5 Web Speech API', level: 85, display_order: 3 },
      { id: '12', category: 'Databases & Tools', name: 'DBMS & SQL', level: 88, display_order: 1 },
      { id: '13', category: 'Databases & Tools', name: 'Git & GitHub', level: 92, display_order: 2 },
      { id: '14', category: 'Databases & Tools', name: 'Visual Studio Code', level: 95, display_order: 3 }
    ],
    projects: [
      {
        id: '1',
        title: 'NeuroTwin – AI-Powered Digital Twin Platform',
        subtitle: 'Flagship AI & Voice Platform',
        description: 'An innovative AI platform that converts static resumes into interactive, voice-enabled candidate profiles for recruiters and hiring managers.',
        bullets: [
          'Developed an AI platform converting static resumes into interactive, voice-enabled candidate profiles for recruiters.',
          'Integrated Google Gemini API to enable context-driven conversational flow for recruiter-to-AI candidate interactions.',
          'Implemented real-time bi-directional voice chat via HTML5 Web Speech API with automated resume parsing.',
          'Designed an intuitive dashboard to streamline candidate assessment and minimize profile screening turnaround.'
        ],
        problem_solved: 'Eliminates static resume fatigue and lengthy initial recruiter screening cycles through an interactive, grounded AI interview experience.',
        tags: ['Next.js', 'Node.js', 'Gemini API', 'RAG Pipeline', 'Web Speech API', 'Tailwind CSS'],
        github_url: 'https://github.com/workforshivam065-bot',
        demo_url: '#',
        is_featured: true,
        featured_flag_label: 'Flagship AI Project',
        display_order: 1
      },
      {
        id: '2',
        title: 'Student Management System',
        subtitle: 'Academic Record Engine',
        description: 'A robust database-driven software built to manage comprehensive student academic records, calculate multi-semester GPAs, and handle course registration workflows.',
        bullets: [
          'Engineered relational database architecture modeling student data, multi-semester GPAs, and course enrollment constraints.',
          'Implemented automated validation queries reducing database anomalies and eliminating grade computation errors.',
          'Structured clean CRUD workflows for administrative faculty to manage student records.'
        ],
        problem_solved: 'Prevents administrative record loss and spreadsheet inconsistencies via relational database constraints.',
        tags: ['Java', 'DBMS', 'SQL', 'OOP'],
        github_url: 'https://github.com/workforshivam065-bot',
        demo_url: '#',
        is_featured: false,
        featured_flag_label: 'Database Software',
        display_order: 2
      },
      {
        id: '3',
        title: 'Attendance Management System',
        subtitle: 'Classroom Attendance Tracker',
        description: 'A web application to record classroom attendance in real-time, generate automated percentage summaries, and export attendance rosters.',
        bullets: [
          'Structured real-time student attendance logging with immediate percentage status computations.',
          'Integrated unique student-id database checks to prevent administrative proxy submissions.',
          'Exported attendance rosters and deficit summaries for academic administration.'
        ],
        problem_solved: 'Prevents administrative proxy errors and human tracking issues by enforcing unique student-id database checks.',
        tags: ['JavaScript', 'Node.js', 'DBMS', 'HTML5 / CSS3'],
        github_url: 'https://github.com/workforshivam065-bot',
        demo_url: '#',
        is_featured: false,
        featured_flag_label: 'Web Application',
        display_order: 3
      },
      {
        id: '4',
        title: 'Developer Portfolio Website',
        subtitle: 'Personal SEO-Optimized Platform',
        description: 'A highly-optimized, dark/light theme personal developer portfolio built with semantic HTML5, CSS design tokens, and smooth client-side interactions.',
        bullets: [
          'Engineered dark/light mode toggle with persistence and system preference sync.',
          'Designed responsive glassmorphism UI with smooth CSS transitions and IntersectionObserver scroll reveals.',
          'Implemented comprehensive Schema.org JSON-LD structured data and OpenGraph metadata.'
        ],
        problem_solved: 'Delivers an impactful, SEO-indexed personal web presence to showcase projects, leadership, and credentials.',
        tags: ['HTML5', 'CSS3', 'JavaScript', 'SEO Schema', 'Supabase CMS'],
        github_url: 'https://github.com/workforshivam065-bot',
        demo_url: '#hero',
        is_featured: false,
        featured_flag_label: 'Web Platform',
        display_order: 4
      },
      {
        id: '5',
        title: 'Tic Tac Toe',
        subtitle: 'Interactive Turn-Based Game',
        description: 'An interactive Tic Tac Toe game where two players can play against each other, take turns, and enjoy a classic game.',
        bullets: [
          'Engineered responsive game-board grid with dynamic player alternation state (X and O).',
          'Implemented 8 winning pattern detection algorithms and instantaneous draw resolution.',
          'Designed clean replay, reset, and modal celebration states in pure JavaScript.'
        ],
        problem_solved: 'Implements turn alternation, win-state validation algorithms, and draw detection in a responsive, interactive web UI.',
        tags: ['HTML5', 'CSS3', 'JavaScript', 'Game Logic'],
        github_url: 'https://github.com/workforshivam065-bot/Tic-Tak-Toe-',
        demo_url: 'https://workforshivam065-bot.github.io/Tic-Tak-Toe-/',
        is_featured: false,
        featured_flag_label: 'Web Game',
        display_order: 5
      }
    ],
    experience: [
      {
        id: '1',
        role: 'Operational Head',
        organization: 'Flux Community',
        period: '2025 – Present',
        bullets: [
          'Spearhead operational planning, logistics, and resource management for college-wide hackathons and technical workshops.',
          'Coordinate mentor allocations and outreach to foster student engagement and active developer participation.',
          'Oversee budget, equipment, and platform workflows to deliver seamless, high-energy hackathon experiences for hundreds of participants.'
        ],
        tags: ['Hackathon Operations', 'Event Logistics', 'Mentor Coordination', 'Developer Outreach', 'Community Management'],
        display_order: 1
      },
      {
        id: '2',
        role: 'Student Council Member',
        organization: 'Academic Student Council • Physics Wallah Skills',
        period: '2025 – Present',
        bullets: [
          'Represent the student body\'s interests and liaise directly with faculty coordinators on academic initiatives and technical resources.',
          'Organized campus engagement activities and skill-building workshops, strengthening cross-batch collaboration and peer learning.',
          'Facilitated student feedback collection mechanisms that directly influenced lab environments and elective curriculum improvements.'
        ],
        tags: ['Student Governance', 'Faculty Liaison', 'Academic Initiatives', 'Cross-Batch Collaboration'],
        display_order: 2
      }
    ],
    education: [
      {
        id: '1',
        degree: 'Bachelor of Technology (B.Tech)',
        institution: 'Physics Wallah Skills, Lucknow, UP',
        location_date: 'Lucknow, UP • 2025 – 2029',
        badge_text: 'Undergraduate Degree',
        cgpa_label: '1st Year Cumulative CGPA:',
        cgpa_value: '8.1 / 10',
        semesters_text: 'Semester 1: 7.4 | Semester 2: 8.73 | Current Standing: 3rd Semester',
        description: 'Focused on mastering algorithm analysis, artificial intelligence architectures, database systems, and object-oriented software engineering.',
        coursework_tags: ['Data Structures & Algorithms', 'Database Management Systems (DBMS)', 'Object-Oriented Programming (OOP)', 'AI Systems & RAG', 'Full-Stack Web Engineering'],
        display_order: 1
      },
      {
        id: '2',
        degree: 'Primary to Higher Secondary Schooling',
        institution: 'Army Public School, S.P. Marg, Lucknow, UP',
        location_date: 'Lucknow, UP • Completed',
        badge_text: 'Schooling (Class I – XII)',
        cgpa_label: '',
        cgpa_value: '',
        semesters_text: '',
        description: 'Cultivated a rigorous discipline in Mathematics, Physics, Computer Science, and analytical reasoning. Actively competed in inter-school athletic championships and developed foundational leadership through extracurricular pursuits.',
        coursework_tags: ['Mathematics', 'Physics', 'Computer Science', 'Critical Reasoning', 'Sports & Athletics'],
        display_order: 2
      }
    ],
    achievements: [
      {
        id: '1',
        title: 'Sports Honors & Championships',
        icon_emoji: '🥇',
        badge_text: 'Athletic Excellence',
        description: 'Athletic discipline translating into focus, clutch decision-making, and high-performing teamwork:',
        items: [
          'Gold Medalist – College Badminton Championship (Rapid reflexes, precision and strategic single-play execution).',
          'Man of the Match – College Football Tournament (Field coordination, tactical teamwork, and clutch performance under pressure).',
          'Winning Team Member – Inter-College Cricket Tournament (Collaborative team synergy, clear role execution, and communication).'
        ],
        display_order: 1
      },
      {
        id: '2',
        title: 'Anchoring & Competitions',
        icon_emoji: '🎙️',
        badge_text: 'Public Speaking & Oratory',
        description: 'Proven oratory presence, persuasive storytelling, and stage leadership:',
        items: [
          'Winner – Ad Baazi: Clinched 1st place in the marketing pitch competition for creative product framing and consumer psychology.',
          'Winner – Character Portrayal: Won 1st place in institutional character depiction for expressive acting and impactful delivery.',
          'Campus Event Host & Anchor: Hosted and anchored multiple institutional convocations, conclaves, and cultural events across campus.'
        ],
        display_order: 2
      },
      {
        id: '3',
        title: 'Hackathons & Programs',
        icon_emoji: '🚀',
        badge_text: 'Hackathons & Venture',
        description: 'Applying technical ingenuity under time-constrained hackathon conditions:',
        items: [
          'DTU Hackathon Participation: Competed against top university engineering teams, delivering rapid prototypes and technical architectures.',
          'Rift Hackathon Participation: Engaged in high-velocity collaborative coding, building full-stack software solutions.',
          'E-Cell Entrepreneurship Certificate: Completed specialized venture development curriculum on startup fundamentals and product scaling.'
        ],
        display_order: 3
      }
    ],
    coding_profiles: [
      { id: '1', platform: 'GitHub', username: '@workforshivam065-bot', url: 'https://github.com/workforshivam065-bot', display_order: 1 },
      { id: '2', platform: 'LinkedIn', username: 'shivam-singh', url: 'https://www.linkedin.com/in/shivam-singh-aab283381/?isSelfProfile=true', display_order: 2 },
      { id: '3', platform: 'LeetCode', username: '@workforshivam065', url: 'https://leetcode.com/u/workforshivam065/', display_order: 3 },
      { id: '4', platform: 'HackerRank', username: '@shivam_cse', url: 'https://hackerrank.com', display_order: 4 }
    ]
  };

  /**
   * Fetches all live portfolio data from Supabase, or falls back to cache / default
   */
  async function fetchPortfolioData() {
    const client = getClient();

    if (!client) {
      // Check if we have cached Supabase data from a previous successful session
      const cached = localStorage.getItem(STORAGE_KEYS.DATA_CACHE);
      if (cached) {
        try {
          return { data: JSON.parse(cached), source: 'cache' };
        } catch (e) {
          /* fallback */
        }
      }
      return { data: FALLBACK_DATA, source: 'fallback' };
    }

    try {
      // Query all public tables in parallel
      const [
        profileRes,
        skillsRes,
        projectsRes,
        experienceRes,
        educationRes,
        achievementsRes,
        profilesRes
      ] = await Promise.all([
        client.from('profile').select('*').limit(1).maybeSingle(),
        client.from('skills').select('*').order('display_order', { ascending: true }),
        client.from('projects').select('*').order('display_order', { ascending: true }),
        client.from('experience').select('*').order('display_order', { ascending: true }),
        client.from('education').select('*').order('display_order', { ascending: true }),
        client.from('achievements').select('*').order('display_order', { ascending: true }),
        client.from('coding_profiles').select('*').order('display_order', { ascending: true })
      ]);

      const liveData = {
        profile: profileRes.data || FALLBACK_DATA.profile,
        skills: (skillsRes.data && skillsRes.data.length > 0) ? skillsRes.data : FALLBACK_DATA.skills,
        projects: (projectsRes.data && projectsRes.data.length > 0) ? projectsRes.data : FALLBACK_DATA.projects,
        experience: (experienceRes.data && experienceRes.data.length > 0) ? experienceRes.data : FALLBACK_DATA.experience,
        education: (educationRes.data && educationRes.data.length > 0) ? educationRes.data : FALLBACK_DATA.education,
        achievements: (achievementsRes.data && achievementsRes.data.length > 0) ? achievementsRes.data : FALLBACK_DATA.achievements,
        coding_profiles: (profilesRes.data && profilesRes.data.length > 0) ? profilesRes.data : FALLBACK_DATA.coding_profiles
      };

      // Cache to LocalStorage for instant subsequent loads
      try {
        localStorage.setItem(STORAGE_KEYS.DATA_CACHE, JSON.stringify(liveData));
        localStorage.setItem(STORAGE_KEYS.CACHE_TIME, new Date().toISOString());
      } catch (err) {
        // quota exceeded or private browsing
      }

      return { data: liveData, source: 'supabase' };
    } catch (err) {
      console.warn('Could not fetch from Supabase, using local data fallback:', err);
      return { data: FALLBACK_DATA, source: 'fallback' };
    }
  }

  // Expose to window
  window.PortfolioSupabase = {
    getConfig: getConfig,
    saveConfig: saveConfig,
    clearConfig: clearConfig,
    getClient: getClient,
    testConnection: testConnection,
    fetchPortfolioData: fetchPortfolioData,
    FALLBACK_DATA: FALLBACK_DATA
  };

})(window);
