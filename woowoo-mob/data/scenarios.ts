export interface Scenario {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon?: string; // Optional icon identifier
}

export const scenarios: Scenario[] = [
  {
    id: "3-words",
    title: "In 3 Words",
    description: "Generate a short description of this person in 3 words",
    prompt:
      "Generate a short description of this person in 3 words based on their birth chart.",
    icon: "💬",
  },
  {
    id: "best-worst",
    title: "At My Best vs. At My Worst",
    description:
      "Discover how your astrological placements influence your highest and lowest moments",
    prompt:
      "Based on this birth chart analysis, create a short report on how this person behaves and appears at their absolute best, and contrast it with their behavior and appearance at their worst. Include specific astrological placements that influence these states.",
    icon: "⭐",
  },
  {
    id: "perfect-career",
    title: "My Perfect Career",
    description: "Find career paths that align with your astrological profile",
    prompt:
      "Analyzing this birth chart, create a short report on what career paths would be most fulfilling and successful for this person. Consider the Midheaven, 10th house placements, and overall chart aspects to provide specific career recommendations.",
    icon: "💼",
  },
  {
    id: "dating-profile",
    title: "Dating Profile Bio",
    description:
      "Generate a dating profile that reflects your astrological nature",
    prompt:
      "Create an engaging and authentic dating profile bio based on this person's birth chart. Include their most attractive qualities, values, and what they seek in relationships, as indicated by their Venus, Mars, and 7th house placements. Write in a way that is true to their astrological nature.",
    icon: "❤️",
  },
];
