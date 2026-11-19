export const TRACK_IDS = ["ai", "social-good", "creative", "open"] as const;
export const COLLEGES = [
  "Pomona",
  "Claremont McKenna",
  "Scripps",
  "Pitzer",
  "Harvey Mudd",
  "Keck Graduate Institute",
  "Other",
] as const;
export const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Grad"] as const;
export const EXPERIENCE = ["beginner", "intermediate", "advanced"] as const;

export const eventInfo = {
  name: "5C Hackathon",
  tagline: "24 hours. Five colleges. One room full of ideas.",
  startsAt: "2027-02-20T17:00:00.000Z",
  endsAt: "2027-02-21T23:00:00.000Z",
  location: "Pomona College, Claremont, CA",
  tracks: [
    { id: "ai", name: "AI & Machine Learning", description: "Build something smart with models, data, or agents." },
    { id: "social-good", name: "Social Good", description: "Tackle a problem facing the Claremont community or beyond." },
    { id: "creative", name: "Creative Tech", description: "Art, music, games, and everything expressive." },
    { id: "open", name: "Open Track", description: "Anything goes. Surprise us." },
  ],
  prizes: [
    { place: "1st", title: "Grand Prize", amount: "$2,000" },
    { place: "2nd", title: "Runner Up", amount: "$1,000" },
    { place: "3rd", title: "Third Place", amount: "$500" },
  ],
};

export const schedule = [
  { id: "s1", day: 1, startsAt: "2027-02-20T17:00:00.000Z", title: "Check-in & breakfast", description: "Pick up your badge and grab food.", location: "Smith Campus Center" },
  { id: "s2", day: 1, startsAt: "2027-02-20T18:00:00.000Z", title: "Opening ceremony", description: "Welcome, rules, and track overviews.", location: "Bridges Hall of Music" },
  { id: "s3", day: 1, startsAt: "2027-02-20T19:00:00.000Z", title: "Hacking begins", description: "Teams start building.", location: "Millikan Lab" },
  { id: "s4", day: 1, startsAt: "2027-02-21T01:00:00.000Z", title: "Dinner", description: "Food from Claremont Village favorites.", location: "Frary Dining Hall" },
  { id: "s5", day: 2, startsAt: "2027-02-21T05:00:00.000Z", title: "Midnight snack & mini-events", description: "Take a break with games and stretching.", location: "Millikan Lab" },
  { id: "s6", day: 2, startsAt: "2027-02-21T16:00:00.000Z", title: "Hacking ends", description: "Submit your project.", location: "Millikan Lab" },
  { id: "s7", day: 2, startsAt: "2027-02-21T18:00:00.000Z", title: "Demos & judging", description: "Show your project to the judges.", location: "Rains Center" },
  { id: "s8", day: 2, startsAt: "2027-02-21T21:30:00.000Z", title: "Awards & closing", description: "Prizes and celebration.", location: "Bridges Hall of Music" },
];

export const faq = [
  { id: "f1", question: "Who can participate?", answer: "Any current student at Pomona, Claremont McKenna, Scripps, Pitzer, Harvey Mudd, or Keck Graduate Institute." },
  { id: "f2", question: "How much does it cost?", answer: "Nothing. Food, drinks, and swag are free for all registered participants." },
  { id: "f3", question: "Do I need a team?", answer: "No. You can register solo and find teammates on the team board, or at the opening ceremony." },
  { id: "f4", question: "How big can a team be?", answer: "Teams can have up to 5 people from any mix of the 5Cs." },
  { id: "f5", question: "I'm a beginner. Should I join?", answer: "Absolutely. There are mentors on site and workshops for first-time hackers." },
  { id: "f6", question: "What should I bring?", answer: "A laptop, charger, student ID, and anything you need to be comfortable. Sleeping bags are welcome." },
];
