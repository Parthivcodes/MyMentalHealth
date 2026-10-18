// Fixed lists used across the app. Change them here and the frontend picks them up from GET /api/options.

const options = {
  circles: ["Exam stress", "Loneliness", "Family", "Relationships", "Anxiety", "General"],

  reactions: [
    { type: "relate", label: "I relate" },
    { type: "strength", label: "Sending strength" },
    { type: "thanks", label: "Thank you for sharing" },
  ],

  crisisWords: [
    "suicide", "kill myself", "end my life", "want to die", "self harm", "self-harm",
    "hurt myself", "no reason to live", "better off dead", "cut myself",
  ],

  specialisations: ["Anxiety", "Stress", "Depression", "Exam stress", "Relationships", "Family", "Grief", "Loneliness", "Sleep"],
  languages: ["English", "Hindi", "Gujarati", "Marathi", "Tamil", "Telugu", "Bengali"],
  genders: ["Female", "Male", "Non-binary", "Prefer not to say"],
  helperKinds: [
    { value: "licensed", label: "Licensed therapist" },
    { value: "volunteer", label: "Volunteer listener" },
  ],

  moodLabels: ["Very low", "Low", "Okay", "Good", "Great"],
  emotions: ["Happy", "Calm", "Grateful", "Sad", "Anxious", "Angry", "Tired"],
  resourceCategories: ["Stress", "Anxiety", "Sleep", "Mindfulness", "Students"],

  aiInstructions:
    "You are the CalmConnect wellness assistant for college students in India. Be warm, calm and brief " +
    "(under 120 words) and write plain text without markdown, bold or bullet symbols. Listen first, then offer one or two practical ideas such as a breathing exercise, " +
    "journaling, sleep habits or talking to someone they trust. You are not a therapist: never diagnose, " +
    "never name medicines and never claim to be human. When someone seems to be struggling a lot, suggest " +
    "the Find a helper page in this app or Tele-MANAS (14416). If someone mentions self-harm or suicide, " +
    "urge them to call 14416 or 112 right away.",

  assessments: {
    GAD7: {
      name: "Anxiety check-in",
      source: "GAD-7",
      suggests: "Anxiety",
      intro: "Over the last 2 weeks, how often have you been bothered by the following?",
      choices: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
      questions: [
        "Feeling nervous, anxious or on edge",
        "Not being able to stop or control worrying",
        "Worrying too much about different things",
        "Trouble relaxing",
        "Being so restless that it's hard to sit still",
        "Becoming easily annoyed or irritable",
        "Feeling afraid, as if something awful might happen",
      ],
      reversed: [],
      levels: [
        { max: 4, level: "Low", tip: "You seem to be managing well right now. Keep up what's working for you." },
        { max: 9, level: "Mild", tip: "Some worry is showing up. Breathing exercises and talking to someone you trust can help." },
        { max: 14, level: "Moderate", tip: "Anxiety is affecting you quite a bit. Talking to a counsellor or a helper here could really help." },
        { max: 21, level: "High", tip: "You're carrying a lot of anxiety. Please reach out to a professional soon. You don't have to handle this alone." },
      ],
    },
    PSS10: {
      name: "Stress check-in",
      source: "PSS-10",
      suggests: "Stress",
      intro: "In the last month, how often have you...",
      choices: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"],
      questions: [
        "been upset because of something that happened unexpectedly?",
        "felt that you were unable to control the important things in your life?",
        "felt nervous and stressed?",
        "felt confident about your ability to handle your personal problems?",
        "felt that things were going your way?",
        "found that you could not cope with all the things that you had to do?",
        "been able to control irritations in your life?",
        "felt that you were on top of things?",
        "been angered because of things that happened that were outside of your control?",
        "felt difficulties were piling up so high that you could not overcome them?",
      ],
      reversed: [3, 4, 6, 7],
      levels: [
        { max: 13, level: "Low", tip: "Your stress level looks manageable. Keep making time for rest." },
        { max: 26, level: "Moderate", tip: "Stress is building up. Try short breaks, sleep and talking things through with someone." },
        { max: 40, level: "High", tip: "You're under a lot of stress. A helper or counsellor can help you find ways to cope." },
      ],
    },
  },
};

export const penNameWords = {
  adjectives: ["Quiet", "Gentle", "Brave", "Calm", "Kind", "Bright", "Soft", "Steady", "Warm", "Hopeful"],
  nouns: ["Fern", "River", "Sparrow", "Maple", "Cloud", "Lotus", "Pebble", "Willow", "Harbor", "Meadow"],
};

export default options;
