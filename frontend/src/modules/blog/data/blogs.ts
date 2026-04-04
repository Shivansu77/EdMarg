import { BlogPost } from '../types';

export const blogs: BlogPost[] = [
  {
    id: 1,
    title: 'How to Crack NPTEL Exam in 8 Weeks',
    slug: 'how-to-crack-nptel',
    description:
      'A practical 8-week roadmap for NPTEL success with weekly milestones, revision loops, and mock strategy.',
    image:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=80',
    author: 'Admin',
    date: '2026-04-01',
    tags: ['NPTEL', 'Exam Strategy', 'Students'],
    content:
      '<p>NPTEL exams reward consistency more than marathon study sessions. Start with a weekly system and stick to it.</p><h2>Week-by-Week Plan</h2><p>In weeks 1-2, map your syllabus and identify high-weight topics. In weeks 3-6, solve at least 25 topic-wise questions weekly. In weeks 7-8, shift to mixed mocks and timing control.</p><h3>Must-Do Checklist</h3><ul><li>Create a fixed daily slot for lectures and notes.</li><li>Keep an error log of every wrong answer.</li><li>Use 2 revision rounds before your final mock.</li></ul><p>Small improvements each week compound into strong scores.</p>',
  },
  {
    id: 2,
    title: 'How to Build a Mentor-Winning LinkedIn Profile',
    slug: 'mentor-winning-linkedin-profile',
    description:
      'Turn your profile into a credibility page mentors actually respond to, with headline and proof-driven project sections.',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80',
    author: 'EdMarg Team',
    date: '2026-03-28',
    tags: ['LinkedIn', 'Career Growth', 'Mentorship'],
    content:
      '<p>Your LinkedIn profile should answer one question quickly: why should a mentor invest time in you?</p><h2>Profile Structure That Works</h2><p>Start with a headline that includes your target role and strengths. Add a summary focused on your current level, what you are building, and what guidance you seek.</p><h3>Proof Over Claims</h3><ul><li>Show outcomes from projects, not just tools used.</li><li>Attach links to GitHub, demos, or case studies.</li><li>Ask for 2-3 skill-specific recommendations.</li></ul><p>When your profile communicates clarity, mentor replies improve significantly.</p>',
  },
  {
    id: 3,
    title: 'Career Decision Framework for Confused Students',
    slug: 'career-decision-framework-for-students',
    description:
      'A clear framework to evaluate career options based on skills, market demand, and long-term motivation.',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',
    author: 'Career Coach Team',
    date: '2026-03-20',
    tags: ['Career Planning', 'Decision Making'],
    content:
      '<p>Confusion usually means you are comparing options without a decision model.</p><h2>The 3-Lens Model</h2><p>Evaluate each career path through: ability (can you do it), demand (will it pay), and energy (will you sustain it).</p><h3>Scoring Method</h3><ul><li>Rate each lens from 1 to 10.</li><li>Multiply by weights: ability 35%, demand 35%, energy 30%.</li><li>Shortlist top two paths and run 30-day experiments.</li></ul><p>Data-driven decisions reduce regret and increase confidence.</p>',
  },
  {
    id: 4,
    title: 'Portfolio Projects That Actually Get Interviews',
    slug: 'portfolio-projects-that-get-interviews',
    description:
      'Design projects with real constraints and measurable outcomes so recruiters can assess your practical skills quickly.',
    image:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80',
    author: 'Hiring Panel Mentor',
    date: '2026-03-12',
    tags: ['Portfolio', 'Interviews', 'Projects'],
    content:
      '<p>Most portfolios fail because they show effort but not impact.</p><h2>Project Design Principles</h2><p>Choose one user problem, define constraints, and measure before/after improvements.</p><h3>Interview-Ready Format</h3><ul><li>Problem statement in one paragraph.</li><li>Architecture and trade-off explanation.</li><li>Metrics: performance, conversion, or reliability.</li></ul><p>Interviewers look for judgment, not just coding output.</p>',
  },
  {
    id: 5,
    title: 'From Semester Plan to Placement Plan',
    slug: 'semester-plan-to-placement-plan',
    description:
      'Convert your academic calendar into a placement-focused execution plan with monthly checkpoints and accountability.',
    image:
      'https://images.unsplash.com/photo-1488998427799-e3362cec87c3?auto=format&fit=crop&w=1600&q=80',
    author: 'Placement Mentor',
    date: '2026-03-05',
    tags: ['Placements', 'Planning', 'Execution'],
    content:
      '<p>A placement offer is often the output of disciplined semester planning.</p><h2>Map the Semester</h2><p>Mark exam windows, project deadlines, and interview seasons. Build your schedule around predictable pressure points.</p><h3>Monthly Execution</h3><ul><li>Month 1: Resume baseline and weak-area audit.</li><li>Month 2: DSA and project depth sprint.</li><li>Month 3: Mock interviews and networking pipeline.</li></ul><p>Consistency beats intensity when placement timelines are tight.</p>',
  },
];

export function getAllBlogs(): BlogPost[] {
  return blogs;
}

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return blogs.find((blog) => blog.slug === slug);
}

export function getRelatedBlogs(currentSlug: string, limit = 3): BlogPost[] {
  return blogs.filter((blog) => blog.slug !== currentSlug).slice(0, limit);
}
