-- ==============================================================================
-- SHIVAM SINGH PORTFOLIO CMS - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project and navigate to the SQL Editor.
-- 3. Paste and run this entire script.
-- ==============================================================================

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLES

-- A. PROFILE & PERSONAL INFORMATION
CREATE TABLE IF NOT EXISTS public.profile (
  id INT PRIMARY KEY DEFAULT 1,
  full_name TEXT NOT NULL DEFAULT 'Shivam Singh',
  title TEXT NOT NULL DEFAULT 'B.Tech CSE Student | AI & Full-Stack Developer',
  tagline TEXT DEFAULT 'Enthusiastic and goal-oriented Computer Science undergraduate specializing in AI systems, RAG pipelines, and modern full-stack web architectures.',
  location TEXT DEFAULT 'Lucknow, Uttar Pradesh',
  phone TEXT DEFAULT '+91 8787216094',
  email TEXT DEFAULT 'shivamsingh88442288@gmail.com',
  bio_p1 TEXT DEFAULT 'Enthusiastic and goal-oriented Computer Science undergraduate with a solid foundation in software development, AI systems, and modern web architectures. Demonstrated capability in building end-to-end full-stack applications, integrating LLM APIs (Google Gemini), and designing robust Retrieval-Augmented Generation (RAG) pipelines.',
  bio_p2 TEXT DEFAULT 'Proactive leader and communicator experienced in operations management, organizing campus hackathons, public speaking, and sports. Striving to write clean, high-performance code and bridge real-world business requirements with cutting-edge artificial intelligence.',
  bio_p3 TEXT DEFAULT 'Currently in my 3rd semester of B.Tech CSE at Physics Wallah Skills, Lucknow, maintaining a 1st Year Cumulative CGPA of 8.1 / 10 (Semester 2: 8.73). Actively seeking opportunities to build impactful software products.',
  profile_image_url TEXT DEFAULT 'profile.png',
  resume_url TEXT DEFAULT 'https://drive.google.com/file/d/1cbHPIxeLpHI-0Q1UfT000r-VoJKPw0hQ/view?usp=sharing',
  resume_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- B. TECHNICAL SKILLS
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'Programming Languages', 'Web Technologies', 'AI & Core Frameworks', 'Databases & Tools', 'Other Technologies'
  name TEXT NOT NULL,
  level INT DEFAULT 85 CHECK (level >= 0 AND level <= 100),
  proficiency TEXT DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced'
  icon_svg TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS proficiency TEXT DEFAULT 'Intermediate';

-- C. FEATURED & ALL PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT,
  subtitle TEXT,
  description TEXT NOT NULL,
  bullets JSONB DEFAULT '[]'::jsonb,
  problem_solved TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  github_url TEXT,
  demo_url TEXT,
  thumbnail_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  featured_flag_label TEXT DEFAULT 'Flagship Project',
  icon_svg TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- D. EXPERIENCE & LEADERSHIP
CREATE TABLE IF NOT EXISTS public.experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  organization TEXT NOT NULL,
  period TEXT NOT NULL,
  bullets JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- E. EDUCATION
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  location_date TEXT NOT NULL,
  badge_text TEXT DEFAULT 'Academic Degree',
  cgpa_label TEXT,
  cgpa_value TEXT,
  semesters_text TEXT,
  description TEXT,
  coursework_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- F. ACHIEVEMENTS & AWARDS
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  icon_emoji TEXT DEFAULT '🏆',
  badge_text TEXT,
  description TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  certificate_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- G. CODING & PROFESSIONAL PROFILES
CREATE TABLE IF NOT EXISTS public.coding_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL, -- 'GitHub', 'LinkedIn', 'LeetCode', 'HackerRank', etc.
  username TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_svg TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- H. RESUME MANAGEMENT
CREATE TABLE IF NOT EXISTS public.resume (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  is_active BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 4. CREATE POLICIES (PUBLIC READ / AUTHENTICATED ADMIN FULL ACCESS)
-- ==============================================================================

-- Drop existing policies if they exist (to allow safe re-runs)
DO $$
BEGIN
  -- Profile
  DROP POLICY IF EXISTS "Public Profile Read" ON public.profile;
  DROP POLICY IF EXISTS "Admin Profile Modify" ON public.profile;
  -- Skills
  DROP POLICY IF EXISTS "Public Skills Read" ON public.skills;
  DROP POLICY IF EXISTS "Admin Skills Modify" ON public.skills;
  -- Projects
  DROP POLICY IF EXISTS "Public Projects Read" ON public.projects;
  DROP POLICY IF EXISTS "Admin Projects Modify" ON public.projects;
  -- Experience
  DROP POLICY IF EXISTS "Public Experience Read" ON public.experience;
  DROP POLICY IF EXISTS "Admin Experience Modify" ON public.experience;
  -- Education
  DROP POLICY IF EXISTS "Public Education Read" ON public.education;
  DROP POLICY IF EXISTS "Admin Education Modify" ON public.education;
  -- Achievements
  DROP POLICY IF EXISTS "Public Achievements Read" ON public.achievements;
  DROP POLICY IF EXISTS "Admin Achievements Modify" ON public.achievements;
  -- Coding Profiles
  DROP POLICY IF EXISTS "Public Coding Profiles Read" ON public.coding_profiles;
  DROP POLICY IF EXISTS "Admin Coding Profiles Modify" ON public.coding_profiles;
  -- Resume
  DROP POLICY IF EXISTS "Public Resume Read" ON public.resume;
  DROP POLICY IF EXISTS "Admin Resume Modify" ON public.resume;
END $$;

-- READ POLICIES (Open to everyone, visitors, recruiters, Google crawlers)
CREATE POLICY "Public Profile Read" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Public Skills Read" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public Projects Read" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public Experience Read" ON public.experience FOR SELECT USING (true);
CREATE POLICY "Public Education Read" ON public.education FOR SELECT USING (true);
CREATE POLICY "Public Achievements Read" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Public Coding Profiles Read" ON public.coding_profiles FOR SELECT USING (true);
CREATE POLICY "Public Resume Read" ON public.resume FOR SELECT USING (true);

-- WRITE POLICIES (Only authenticated users, e.g., your Admin account, can insert/update/delete)
CREATE POLICY "Admin Profile Modify" ON public.profile FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Skills Modify" ON public.skills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Projects Modify" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Experience Modify" ON public.experience FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Education Modify" ON public.education FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Achievements Modify" ON public.achievements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Coding Profiles Modify" ON public.coding_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Resume Modify" ON public.resume FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 5. STORAGE BUCKET CONFIGURATION (for Resumes and Project Media)
-- ==============================================================================

-- Create 'portfolio-assets' bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies: Public can read, Authenticated can upload/delete
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Access to Portfolio Assets" ON storage.objects;
  DROP POLICY IF EXISTS "Admin Upload to Portfolio Assets" ON storage.objects;
  DROP POLICY IF EXISTS "Admin Update Portfolio Assets" ON storage.objects;
  DROP POLICY IF EXISTS "Admin Delete Portfolio Assets" ON storage.objects;
END $$;

CREATE POLICY "Public Access to Portfolio Assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-assets');

CREATE POLICY "Admin Upload to Portfolio Assets" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-assets');

CREATE POLICY "Admin Update Portfolio Assets" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-assets');

CREATE POLICY "Admin Delete Portfolio Assets" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'portfolio-assets');

-- ==============================================================================
-- 6. SEED INITIAL PORTFOLIO DATA (Preserves all current projects, skills & bio)
-- ==============================================================================

-- Profile record
INSERT INTO public.profile (id, full_name, title, tagline, location, phone, email, bio_p1, bio_p2, bio_p3, profile_image_url, resume_url)
VALUES (
  1,
  'Shivam Singh',
  'B.Tech CSE Student | AI & Full-Stack Developer',
  'Enthusiastic and goal-oriented Computer Science undergraduate specializing in AI systems, RAG pipelines, and modern full-stack web architectures. Proactive leader experienced in community operations, organizing hackathons, public speaking, and sports.',
  'Lucknow, Uttar Pradesh',
  '+91 8787216094',
  'shivamsingh88442288@gmail.com',
  'Enthusiastic and goal-oriented Computer Science undergraduate with a solid foundation in software development, AI systems, and modern web architectures. Demonstrated capability in building end-to-end full-stack applications, integrating LLM APIs (Google Gemini), and designing robust Retrieval-Augmented Generation (RAG) pipelines.',
  'Proactive leader and communicator experienced in operations management, organizing campus hackathons, public speaking, and sports. Striving to write clean, high-performance code and bridge real-world business requirements with cutting-edge artificial intelligence.',
  'Currently in my 3rd semester of B.Tech CSE at Physics Wallah Skills, Lucknow, maintaining a 1st Year Cumulative CGPA of 8.1 / 10 (Semester 2: 8.73). Actively seeking opportunities to build impactful software products.',
  'profile.png',
  'https://drive.google.com/file/d/1cbHPIxeLpHI-0Q1UfT000r-VoJKPw0hQ/view?usp=sharing'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  updated_at = now();

-- Initial Technical Skills
INSERT INTO public.skills (category, name, level, display_order)
VALUES
  ('Programming Languages', 'C++', 90, 1),
  ('Programming Languages', 'Java', 85, 2),
  ('Programming Languages', 'JavaScript', 90, 3),
  ('Programming Languages', 'C', 85, 4),
  ('Web Technologies', 'React JS & Next.js', 90, 1),
  ('Web Technologies', 'Node.js', 85, 2),
  ('Web Technologies', 'Tailwind CSS', 92, 3),
  ('Web Technologies', 'HTML5 & CSS3', 95, 4),
  ('AI & Core Frameworks', 'Google Gemini API', 92, 1),
  ('AI & Core Frameworks', 'RAG (Retrieval-Augmented Gen)', 88, 2),
  ('AI & Core Frameworks', 'HTML5 Web Speech API', 85, 3),
  ('Databases & Tools', 'DBMS & SQL', 88, 1),
  ('Databases & Tools', 'Git & GitHub', 92, 2),
  ('Databases & Tools', 'Visual Studio Code', 95, 3)
ON CONFLICT DO NOTHING;

-- Initial Featured Projects
INSERT INTO public.projects (title, subtitle, description, bullets, problem_solved, tags, github_url, demo_url, is_featured, featured_flag_label, display_order)
VALUES
(
  'NeuroTwin – AI-Powered Digital Twin Platform',
  'Flagship AI & Voice Platform',
  'An innovative AI platform that converts static resumes into interactive, voice-enabled candidate profiles for recruiters and hiring managers.',
  '["Developed an AI platform converting static resumes into interactive, voice-enabled candidate profiles for recruiters.", "Integrated Google Gemini API to enable context-driven conversational flow for recruiter-to-AI candidate interactions.", "Implemented real-time bi-directional voice chat via HTML5 Web Speech API with automated resume parsing.", "Designed an intuitive dashboard to streamline candidate assessment and minimize profile screening turnaround."]'::jsonb,
  'Eliminates static resume fatigue and lengthy initial recruiter screening cycles through an interactive, grounded AI interview experience.',
  ARRAY['Next.js', 'Node.js', 'Gemini API', 'RAG Pipeline', 'Web Speech API', 'Tailwind CSS'],
  'https://github.com/workforshivam065-bot',
  '#',
  true,
  'Flagship AI Project',
  1
),
(
  'Student Management System',
  'Academic Record Engine',
  'A robust database-driven software built to manage comprehensive student academic records, calculate multi-semester GPAs, and handle course registration workflows.',
  '["Engineered relational database architecture modeling student data, multi-semester GPAs, and course enrollment constraints.", "Implemented automated validation queries reducing database anomalies and eliminating grade computation errors.", "Structured clean CRUD workflows for administrative faculty to manage student records."]'::jsonb,
  'Prevents administrative record loss and spreadsheet inconsistencies via relational database constraints.',
  ARRAY['Java', 'DBMS', 'SQL', 'OOP'],
  'https://github.com/workforshivam065-bot',
  '#',
  false,
  'Database Software',
  2
),
(
  'Attendance Management System',
  'Classroom Attendance Tracker',
  'A web application to record classroom attendance in real-time, generate automated percentage summaries, and export attendance rosters.',
  '["Structured real-time student attendance logging with immediate percentage status computations.", "Integrated unique student-id database checks to prevent administrative proxy submissions.", "Exported attendance rosters and deficit summaries for academic administration."]'::jsonb,
  'Prevents administrative proxy errors and human tracking issues by enforcing unique student-id database checks.',
  ARRAY['JavaScript', 'Node.js', 'DBMS', 'HTML5 / CSS3'],
  'https://github.com/workforshivam065-bot',
  '#',
  false,
  'Web Application',
  3
),
(
  'Developer Portfolio Website',
  'Personal SEO-Optimized Platform',
  'A highly-optimized, dark/light theme personal developer portfolio built with semantic HTML5, CSS design tokens, and smooth client-side interactions.',
  '["Engineered dark/light mode toggle with persistence and system preference sync.", "Designed responsive glassmorphism UI with smooth CSS transitions and IntersectionObserver scroll reveals.", "Implemented comprehensive Schema.org JSON-LD structured data and OpenGraph metadata."]'::jsonb,
  'Delivers an impactful, SEO-indexed personal web presence to showcase projects, leadership, and credentials.',
  ARRAY['HTML5', 'CSS3', 'JavaScript', 'SEO Schema', 'Supabase CMS'],
  'https://github.com/workforshivam065-bot',
  '#hero',
  false,
  'Web Platform',
  4
),
(
  'Tic Tac Toe',
  'Interactive Turn-Based Game',
  'An interactive Tic Tac Toe game where two players can play against each other, take turns, and enjoy a classic game.',
  '["Engineered responsive game-board grid with dynamic player alternation state (X and O).", "Implemented 8 winning pattern detection algorithms and instantaneous draw resolution.", "Designed clean replay, reset, and modal celebration states in pure JavaScript."]'::jsonb,
  'Implements turn alternation, win-state validation algorithms, and draw detection in a responsive, interactive web UI.',
  ARRAY['HTML5', 'CSS3', 'JavaScript', 'Game Logic'],
  'https://github.com/workforshivam065-bot/Tic-Tak-Toe-',
  'https://workforshivam065-bot.github.io/Tic-Tak-Toe-/',
  false,
  'Web Game',
  5
)
ON CONFLICT DO NOTHING;

-- Initial Experience & Leadership
INSERT INTO public.experience (role, organization, period, bullets, tags, display_order)
VALUES
(
  'Operational Head',
  'Flux Community',
  '2025 – Present',
  '["Spearhead operational planning, logistics, and resource management for college-wide hackathons and technical workshops.", "Coordinate mentor allocations and outreach to foster student engagement and active developer participation.", "Oversee budget, equipment, and platform workflows to deliver seamless, high-energy hackathon experiences for hundreds of participants."]'::jsonb,
  ARRAY['Hackathon Operations', 'Event Logistics', 'Mentor Coordination', 'Developer Outreach', 'Community Management'],
  1
),
(
  'Student Council Member',
  'Academic Student Council • Physics Wallah Skills',
  '2025 – Present',
  '["Represent the student body''s interests and liaise directly with faculty coordinators on academic initiatives and technical resources.", "Organized campus engagement activities and skill-building workshops, strengthening cross-batch collaboration and peer learning.", "Facilitated student feedback collection mechanisms that directly influenced lab environments and elective curriculum improvements."]'::jsonb,
  ARRAY['Student Governance', 'Faculty Liaison', 'Academic Initiatives', 'Cross-Batch Collaboration'],
  2
)
ON CONFLICT DO NOTHING;

-- Initial Education
INSERT INTO public.education (degree, institution, location_date, badge_text, cgpa_label, cgpa_value, semesters_text, description, coursework_tags, display_order)
VALUES
(
  'Bachelor of Technology (B.Tech)',
  'Physics Wallah Skills, Lucknow, UP',
  'Lucknow, UP • 2025 – 2029',
  'Undergraduate Degree',
  '1st Year Cumulative CGPA:',
  '8.1 / 10',
  'Semester 1: 7.4 | Semester 2: 8.73 | Current Standing: 3rd Semester',
  'Focused on mastering algorithm analysis, artificial intelligence architectures, database systems, and object-oriented software engineering.',
  ARRAY['Data Structures & Algorithms', 'Database Management Systems (DBMS)', 'Object-Oriented Programming (OOP)', 'AI Systems & RAG', 'Full-Stack Web Engineering'],
  1
),
(
  'Primary to Higher Secondary Schooling',
  'Army Public School, S.P. Marg, Lucknow, UP',
  'Lucknow, UP • Completed',
  'Schooling (Class I – XII)',
  NULL,
  NULL,
  NULL,
  'Cultivated a rigorous discipline in Mathematics, Physics, Computer Science, and analytical reasoning. Actively competed in inter-school athletic championships and developed foundational leadership through extracurricular pursuits.',
  ARRAY['Mathematics', 'Physics', 'Computer Science', 'Critical Reasoning', 'Sports & Athletics'],
  2
)
ON CONFLICT DO NOTHING;

-- Initial Achievements
INSERT INTO public.achievements (title, icon_emoji, badge_text, description, items, display_order)
VALUES
(
  'Sports Honors & Championships',
  '🥇',
  'Athletic Excellence',
  'Athletic discipline translating into focus, clutch decision-making, and high-performing teamwork:',
  '["Gold Medalist – College Badminton Championship (Rapid reflexes, precision and strategic single-play execution).", "Man of the Match – College Football Tournament (Field coordination, tactical teamwork, and clutch performance under pressure).", "Winning Team Member – Inter-College Cricket Tournament (Collaborative team synergy, clear role execution, and communication)."]'::jsonb,
  1
),
(
  'Anchoring & Competitions',
  '🎙️',
  'Public Speaking & Oratory',
  'Proven oratory presence, persuasive storytelling, and stage leadership:',
  '["Winner – Ad Baazi: Clinched 1st place in the marketing pitch competition for creative product framing and consumer psychology.", "Winner – Character Portrayal: Won 1st place in institutional character depiction for expressive acting and impactful delivery.", "Campus Event Host & Anchor: Hosted and anchored multiple institutional convocations, conclaves, and cultural events across campus."]'::jsonb,
  2
),
(
  'Hackathons & Programs',
  '🚀',
  'Hackathons & Venture',
  'Applying technical ingenuity under time-constrained hackathon conditions:',
  '["DTU Hackathon Participation: Competed against top university engineering teams, delivering rapid prototypes and technical architectures.", "Rift Hackathon Participation: Engaged in high-velocity collaborative coding, building full-stack software solutions.", "E-Cell Entrepreneurship Certificate: Completed specialized venture development curriculum on startup fundamentals and product scaling."]'::jsonb,
  3
)
ON CONFLICT DO NOTHING;

-- Initial Coding Profiles
INSERT INTO public.coding_profiles (platform, username, url, display_order)
VALUES
  ('GitHub', '@workforshivam065-bot', 'https://github.com/workforshivam065-bot', 1),
  ('LinkedIn', 'shivam-singh', 'https://www.linkedin.com/in/shivam-singh-aab283381/?isSelfProfile=true', 2),
  ('LeetCode', '@workforshivam065', 'https://leetcode.com/u/workforshivam065/', 3),
  ('HackerRank', '@shivam_cse', 'https://hackerrank.com', 4)
ON CONFLICT DO NOTHING;
