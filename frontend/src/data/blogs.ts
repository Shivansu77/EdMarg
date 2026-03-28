export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  createdAt: string;
  tags: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'build-career-roadmap-in-30-days',
    title: 'How To Build A Career Roadmap In 30 Days',
    excerpt:
      'A practical 4-week framework to move from confusion to clarity with clear weekly outcomes.',
    author: 'Ananya Mehta',
    createdAt: '2026-03-10T10:30:00.000Z',
    tags: ['Career Planning', 'Productivity'],
    content: `Career clarity is not a one-time event. It is the result of small, consistent decisions.

Week one is about discovery. List your interests, strengths, and constraints. Write down what energizes you and what drains you. This gives you a realistic starting point.

Week two is about evidence. Talk to professionals, review role descriptions, and compare your assumptions with market reality. Treat this as research, not commitment.

Week three is about experimentation. Pick one skill that appears across multiple roles and build a mini-project around it. Progress beats perfection.

Week four is about synthesis. Decide your next 90-day direction, define measurable goals, and commit to a weekly review. Clarity grows when your actions and decisions stay aligned.`
  },
  {
    id: 'questions-to-ask-before-choosing-a-mentor',
    title: '7 Questions To Ask Before Choosing A Mentor',
    excerpt:
      'Mentorship works best when expectations are clear. Use these questions to find the right fit.',
    author: 'Rohit Kulkarni',
    createdAt: '2026-03-14T08:15:00.000Z',
    tags: ['Mentorship', 'Career Growth'],
    content: `A mentor can accelerate your career, but the fit matters more than reputation.

Start with goals. Ask what type of outcomes they usually help with and how they structure sessions. You should leave each conversation with actionable next steps.

Discuss communication style. Some mentors coach with direct feedback, others with reflection prompts. You need a style that helps you execute.

Clarify boundaries. Ask about session frequency, response expectations between calls, and how progress will be measured.

Finally, validate alignment. If your values or timelines do not match, the relationship will stall even if the mentor is highly experienced.`
  },
  {
    id: 'from-overwhelm-to-focus',
    title: 'From Overwhelm To Focus: A Student Playbook',
    excerpt:
      'Use this simple system to cut noise, prioritize learning, and build momentum every week.',
    author: 'Ishita Rao',
    createdAt: '2026-03-16T12:00:00.000Z',
    tags: ['Students', 'Mindset'],
    content: `Most students struggle because they try to optimize everything at once.

Begin with one target role. Then identify the top three skills employers repeatedly ask for. Everything else becomes secondary.

Create a weekly plan with three outcomes: one learning outcome, one portfolio outcome, and one networking outcome. Keep scope intentionally small.

Review every Sunday. Keep what worked, remove what did not, and adjust effort for the next week.

Focus is not about doing more. It is about saying no to everything that does not move your goal forward.`
  },
  {
    id: 'portfolio-projects-that-actually-get-interviews',
    title: 'Portfolio Projects That Actually Get Interviews',
    excerpt:
      'A strong portfolio shows problem-solving, not just tutorials. Here is what hiring teams notice.',
    author: 'Karan Sethi',
    createdAt: '2026-03-18T09:20:00.000Z',
    tags: ['Portfolio', 'Interview Prep'],
    content: `Recruiters evaluate your project narrative before your code depth.

Pick a real problem, define clear users, and explain constraints. Your README should tell the story in under two minutes.

Show tradeoffs. Mention what you chose, what you skipped, and why. This signals maturity and ownership.

Include measurable impact, even in personal projects. Time saved, accuracy improved, or complexity reduced are all meaningful.

A good portfolio is not a gallery. It is evidence that you can think, build, and communicate in a professional environment.`
  },
  {
    id: 'networking-without-feeling-fake',
    title: 'Networking Without Feeling Fake',
    excerpt:
      'Build authentic professional relationships using value-first outreach and consistent follow-ups.',
    author: 'Priya Nair',
    createdAt: '2026-03-20T14:45:00.000Z',
    tags: ['Networking', 'Career Growth'],
    content: `Networking feels difficult when you treat it as asking for favors.

Start with relevance. Reach out to people in roles you genuinely want to understand. Share a specific reason you chose them.

Lead with curiosity. Ask focused questions, not broad requests for "guidance." People respond better to thoughtful prompts.

After the conversation, send one concise follow-up with your key takeaway and next action.

Relationships compound over time. Consistency and sincerity matter more than volume.`
  },
  {
    id: 'how-to-prepare-for-your-first-mentor-session',
    title: 'How To Prepare For Your First Mentor Session',
    excerpt:
      'Get more value from your first session by preparing goals, context, and decision points in advance.',
    author: 'Neha Bansal',
    createdAt: '2026-03-22T07:40:00.000Z',
    tags: ['Mentorship', 'Students'],
    content: `Your first mentor session sets the tone for the relationship.

Prepare a short context brief: current stage, target role, biggest blockers, and what success looks like in the next three months.

Bring one decision you are stuck on. This helps the mentor give concrete guidance instead of generic advice.

Capture action items during the call and define your first milestone before ending the session.

Mentorship creates results when every session turns insight into execution.`
  },
  {
    id: 'mistakes-to-avoid-in-career-assessments',
    title: '5 Mistakes To Avoid In Career Assessments',
    excerpt:
      'Assessments are useful when interpreted correctly. Avoid these common mistakes for better decisions.',
    author: 'Arjun Patel',
    createdAt: '2026-03-25T11:10:00.000Z',
    tags: ['Assessment', 'Career Planning'],
    content: `Assessments are direction tools, not destiny tools.

Mistake one is over-indexing on one score. Treat results as patterns, not prescriptions.

Mistake two is ignoring context. Your interests, values, and life constraints matter as much as aptitude.

Mistake three is no follow-through. Insight without action expires quickly. Convert results into immediate experiments.

The best use of an assessment is as a conversation starter with mentors and peers who can help you test the path.`
  },
  {
    id: 'weekly-routine-for-career-growth',
    title: 'A Weekly Routine For Career Growth That Sticks',
    excerpt:
      'A repeatable weekly routine can outperform intense but inconsistent effort over time.',
    author: 'Sana Mirza',
    createdAt: '2026-03-27T16:05:00.000Z',
    tags: ['Habits', 'Career Growth'],
    content: `Career growth is a systems game.

Plan Monday with one primary objective for the week. Split it into small daily actions you can finish in under 90 minutes.

Mid-week, run a short progress check. If something is blocked, adjust scope instead of waiting for perfect conditions.

Use Friday for reflection and documentation. Track what worked, what failed, and what to improve next week.

Long-term growth is built by routines that are sustainable, measurable, and simple to repeat.`
  }
];

export function getAllBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getBlogPostById(id: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.id === id);
}

export function getAllBlogTags(): string[] {
  return Array.from(new Set(BLOG_POSTS.flatMap((post) => post.tags))).sort();
}
