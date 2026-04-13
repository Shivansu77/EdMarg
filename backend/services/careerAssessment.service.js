const { ValidationError } = require('../utils/errors');

const TAGS = ['logic', 'tech', 'social', 'business', 'creative', 'practical', 'research', 'outdoor'];

const TAG_LABELS = {
  logic: 'analytical thinking',
  tech: 'technology orientation',
  social: 'people-facing strengths',
  business: 'business and finance mindset',
  creative: 'creative expression',
  practical: 'hands-on execution',
  research: 'deep learning and research interest',
  outdoor: 'field adaptability',
};

// -------------------- CAREER PROFILES (UNCHANGED) --------------------
const CAREER_PROFILES = [
  {
    id: 'software_engineering',
    careerName: 'Software Engineering',
    weights: { tech: 5, logic: 4, research: 2 },
    requiredSkills: ['Programming', 'System Design', 'Algorithmic Thinking'],
    suggestedNextSteps: ['Learn Python/JavaScript', 'Start a GitHub account', 'Build a simple web app'],
    roadmapAfter12th: 'B.Tech in Computer Science -> Internships -> Junior Developer',
    salaryRange: '₹6L - ₹20L per annum (entry level)',
    skillsToLearn: ['Data Structures', 'Version Control', 'React/Node.js'],
    collegeSuggestions: ['IITs', 'NITs', 'BITS', 'IIITs'],
  },
  {
    id: 'product_management',
    careerName: 'Product Management',
    weights: { business: 5, logic: 3, social: 4, tech: 2 },
    requiredSkills: ['Market Research', 'Communication', 'Data Analytics'],
    suggestedNextSteps: ['Study case studies of successful apps', 'Learn basic data analysis'],
    roadmapAfter12th: 'BBA/B.Tech -> MBA (optional) -> Associate Product Manager',
    salaryRange: '₹8L - ₹25L per annum (entry level)',
    skillsToLearn: ['Agile Methodologies', 'User Psychology', 'A/B Testing'],
    collegeSuggestions: ['IIMs', 'ISB', 'XLRI', 'Top Engineering Colleges'],
  },
  {
    id: 'design_ui_ux',
    careerName: 'UI/UX Design',
    weights: { creative: 5, logic: 2, tech: 3, social: 3 },
    requiredSkills: ['Figma/Adobe XD', 'User Empathy', 'Visual Design'],
    suggestedNextSteps: ['Create a Behance portfolio', 'Learn Figma basics', 'Redesign a bad website'],
    roadmapAfter12th: 'B.Des or UI/UX Bootcamp -> Design Intern -> Product Designer',
    salaryRange: '₹5L - ₹15L per annum (entry level)',
    skillsToLearn: ['Wireframing', 'Prototyping', 'User Interviews'],
    collegeSuggestions: ['NID', 'IIT Bombay (IDC)', 'Srishti'],
  },
  {
    id: 'finance_investment_banking',
    careerName: 'Finance / Investment Banking',
    weights: { business: 5, logic: 4, research: 3 },
    requiredSkills: ['Financial Modeling', 'Excel', 'Valuation'],
    suggestedNextSteps: ['Learn Advanced Excel', 'Read Financial Times', 'Track simple stocks'],
    roadmapAfter12th: 'B.Com/Economics -> CFA/MBA -> Financial Analyst',
    salaryRange: '₹10L - ₹30L per annum (entry level)',
    skillsToLearn: ['Corporate Finance', 'Accounting', 'Risk Management'],
    collegeSuggestions: ['SRCC', 'St. Xaviers', 'IIMs'],
  },
  {
    id: 'data_science',
    careerName: 'Data Science',
    weights: { logic: 5, tech: 4, research: 4, business: 2 },
    requiredSkills: ['Python/R', 'Statistics', 'Machine Learning'],
    suggestedNextSteps: ['Learn Python', 'Take an online Statistics course', 'Explore Kaggle'],
    roadmapAfter12th: 'B.Tech/B.Sc Statistics -> Data Science Course -> Data Analyst',
    salaryRange: '₹7L - ₹22L per annum (entry level)',
    skillsToLearn: ['SQL', 'Pandas', 'Data Visualization'],
    collegeSuggestions: ['ISI', 'IITs', 'Top tier Engineering/Science colleges'],
  },
  {
    id: 'marketing_digital',
    careerName: 'Digital Marketing',
    weights: { creative: 4, business: 4, social: 3, tech: 2 },
    requiredSkills: ['SEO/SEM', 'Content Creation', 'Social Media Strategy'],
    suggestedNextSteps: ['Run a mock marketing campaign', 'Learn Google Analytics basics'],
    roadmapAfter12th: 'BMM/BBA -> Digital Marketing Certifications -> Marketing Exec',
    salaryRange: '₹4L - ₹12L per annum (entry level)',
    skillsToLearn: ['Copywriting', 'Ad Campaigns', 'Analytics'],
    collegeSuggestions: ['MICA', 'Symbiosis', 'Christ University'],
  },
  {
    id: 'civil_architecture',
    careerName: 'Architecture / Civil Engineeering',
    weights: { practical: 5, creative: 3, logic: 4 },
    requiredSkills: ['AutoCAD/Revit', 'Spatial Thinking', 'Project Management'],
    suggestedNextSteps: ['Learn basics of 3D modeling', 'Study famous architectural structures'],
    roadmapAfter12th: 'B.Arch / B.Tech Civil -> Apprenticeship -> Architect/Engineer',
    salaryRange: '₹4L - ₹10L per annum (entry level)',
    skillsToLearn: ['Structural Analysis', 'Material Science', 'Urban Planning'],
    collegeSuggestions: ['SPA', 'CEPT', 'IITs', 'NITs'],
  },
  {
    id: 'psychology_counseling',
    careerName: 'Psychology / Counseling',
    weights: { social: 5, research: 4, logic: 2 },
    requiredSkills: ['Empathy', 'Active Listening', 'Behavioral Analysis'],
    suggestedNextSteps: ['Read basics of behavioral psychology', 'Volunteer for peer support'],
    roadmapAfter12th: 'B.A./B.Sc Psychology -> M.A. Clinical/Counseling -> Licensed Therapist',
    salaryRange: '₹3L - ₹8L per annum (entry level)',
    skillsToLearn: ['Cognitive Behavioral Therapy', 'Crisis Intervention', 'Research Methods'],
    collegeSuggestions: ['TISS', 'Delhi University', 'Christ University'],
  },
  {
    id: 'environmental_science',
    careerName: 'Environmental Science / Sustainability',
    weights: { outdoor: 5, research: 4, logic: 3, practical: 3 },
    requiredSkills: ['Ecology', 'Data Collection', 'Policy Understanding'],
    suggestedNextSteps: ['Participate in conservation drives', 'Read climate policy'],
    roadmapAfter12th: 'B.Sc Environmental Science -> M.Sc -> Environmental Consultant',
    salaryRange: '₹4L - ₹10L per annum (entry level)',
    skillsToLearn: ['GIS', 'Environmental Impact Assessment', 'Sustainability Strategy'],
    collegeSuggestions: ['TERI', 'Delhi University', 'Forest Research Institute'],
  },
  {
    id: 'entrepreneurship',
    careerName: 'Entrepreneurship',
    weights: { business: 5, social: 4, practical: 4, logic: 3 },
    requiredSkills: ['Leadership', 'Sales', 'Resilience', 'Problem Solving'],
    suggestedNextSteps: ['Start a small side hustle', 'Read startup case studies', 'Network'],
    roadmapAfter12th: 'Any degree -> Identify a problem -> Build an MVP -> Validate -> Scale',
    salaryRange: 'Variable (High Risk, High Reward)',
    skillsToLearn: ['Fundraising', 'Growth Hacking', 'Financial Management'],
    collegeSuggestions: ['Any college with a strong incubation cell (e.g. IITs, BITS, ISB)'],
  }
];

// -------------------- HELPERS --------------------
function initTagScores() {
  return TAGS.reduce((acc, tag) => {
    acc[tag] = 0;
    return acc;
  }, {});
}

function addTagScore(tagScores, tag, value) {
  tagScores[tag] = (tagScores[tag] || 0) + Number(value || 0);
}

function applyRatingMap(tagScores, rating, map) {
  Object.entries(map).forEach(([tag, weight]) => {
    addTagScore(tagScores, tag, rating * weight);
  });
}

// -------------------- VALIDATION (UNCHANGED) --------------------
function ensureRating(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new ValidationError(`${label} must be an integer between 1 and 5`);
  }
  return parsed;
}

function ensureOption(value, label, allowed) {
  if (!allowed.includes(value)) {
    throw new ValidationError(`${label} has an invalid value`);
  }
  return value;
}

// -------------------- TAG SCORE BUILDING (UNCHANGED) --------------------
function buildTagScores(normalizedAnswers) {
  const tagScores = initTagScores();

  const { interests, skills } = normalizedAnswers;

  applyRatingMap(tagScores, interests.logicalProblems, { logic: 1 });
  applyRatingMap(tagScores, interests.computersTech, { tech: 1 });
  applyRatingMap(tagScores, interests.helpingPeople, { social: 1 });
  applyRatingMap(tagScores, interests.moneyBusiness, { business: 1 });
  applyRatingMap(tagScores, interests.creativeWork, { creative: 1 });
  applyRatingMap(tagScores, interests.machinesTools, { practical: 1 });
  applyRatingMap(tagScores, interests.outdoorWork, { outdoor: 1 });
  applyRatingMap(tagScores, interests.researchLearning, { research: 1 });

  applyRatingMap(tagScores, skills.mathematicsNumerical, { logic: 1.1 });
  applyRatingMap(tagScores, skills.communication, { social: 1.1 });
  applyRatingMap(tagScores, skills.problemSolving, { logic: 1.1 });
  applyRatingMap(tagScores, skills.creativity, { creative: 1.2 });
  applyRatingMap(tagScores, skills.leadership, { business: 0.9 });
  applyRatingMap(tagScores, skills.technicalSkills, { tech: 1.1 });

  return TAGS.reduce((acc, tag) => {
    acc[tag] = Number(tagScores[tag].toFixed(2));
    return acc;
  }, {});
}

// -------------------- CAREER SCORING (UNCHANGED) --------------------
function scoreCareer(profile, tagScores) {
  return Number(
    Object.entries(profile.weights).reduce((sum, [tag, weight]) => {
      return sum + (tagScores[tag] || 0) * weight;
    }, 0).toFixed(2)
  );
}

// -------------------- WHY THIS FITS --------------------
function buildWhyThisFits(profile, tagScores) {
  const contributions = Object.entries(profile.weights)
    .map(([tag, weight]) => ({
      tag,
      value: (tagScores[tag] || 0) * weight,
    }))
    .sort((a, b) => b.value - a.value);

  const first = contributions[0]?.tag || 'logic';
  const second = contributions[1]?.tag || first;

  return `Your ${TAG_LABELS[first]} and ${TAG_LABELS[second]} align strongly with ${profile.careerName}.`;
}

// -------------------- ⭐ FIXED SCORING SYSTEM --------------------
function getMatchLabel(score) {
  if (score >= 85) return 'Excellent Fit';
  if (score >= 70) return 'Strong Fit';
  if (score >= 55) return 'Good Fit';
  return 'Moderate Fit';
}

function generateRecommendations(tagScores) {
  const scored = CAREER_PROFILES.map((profile) => ({
    ...profile,
    rawScore: scoreCareer(profile, tagScores),
  })).sort((a, b) => b.rawScore - a.rawScore);

  const maxRaw = Math.max(1, scored[0]?.rawScore || 1);

  const topThree = scored.slice(0, 3).map((profile, index) => {
    // ✅ HONEST SCORING (NO FAKE VALUES)
    const matchScore = Math.round((profile.rawScore / maxRaw) * 100);

    return {
      rank: index + 1,
      careerId: profile.id,
      careerName: profile.careerName,
      matchScore,
      matchLabel: getMatchLabel(matchScore),

      whyThisFitsYou: buildWhyThisFits(profile, tagScores),
      requiredSkills: profile.requiredSkills,
      suggestedNextSteps: profile.suggestedNextSteps,
      careerRoadmapAfter12th: profile.roadmapAfter12th,
      salaryRange: profile.salaryRange,
      skillsToLearn: profile.skillsToLearn,
      collegeSuggestions: profile.collegeSuggestions,
    };
  });

  const topTags = Object.entries(tagScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);

  return {
    dominantTags: topTags,
    topRecommendations: topThree,
    topCareerRecommendation: topThree[0] || null,
  };
}

// -------------------- MAIN SERVICE --------------------
class CareerAssessmentService {
  evaluate(answers) {
    const normalizedAnswers = answers; // assume validated earlier

    const tagScores = buildTagScores(normalizedAnswers);

    const recommendations = generateRecommendations(tagScores);

    return {
      assessmentVersion: 'career-assessment-v2-fixed',
      generatedAt: new Date(),

      step2TagScores: tagScores,
      step3CareerMapping: recommendations,

      step4Output: {
        top3CareerRecommendations: recommendations.topRecommendations,
      },
    };
  }
}

module.exports = new CareerAssessmentService();