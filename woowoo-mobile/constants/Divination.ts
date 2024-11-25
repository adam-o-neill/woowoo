export interface TarotCard {
  name: string;
  meaning: string;
  reversedMeaning: string;
  description: string;
  suit: string;
}

export const tarotDeck: TarotCard[] = [
  // Major Arcana
  {
    name: "The Fool",
    meaning: "New beginnings, innocence, spontaneity, free spirit",
    reversedMeaning: "Recklessness, risk-taking, inconsideration",
    description:
      "A young person stands on a cliff, looking upward, carrying a small sack. A white dog is at their feet.",
    suit: "Major Arcana",
  },
  {
    name: "The Magician",
    meaning: "Manifestation, resourcefulness, power, inspired action",
    reversedMeaning: "Manipulation, poor planning, untapped talents",
    description:
      "A figure stands before a table with all four suits, one hand raised to heaven, the other pointing to earth.",
    suit: "Major Arcana",
  },
  {
    name: "The High Priestess",
    meaning:
      "Intuition, sacred knowledge, divine feminine, the subconscious mind",
    reversedMeaning:
      "Secrets, disconnected from intuition, withdrawal and silence",
    description:
      "A female figure sits between two pillars, a crescent moon at her feet.",
    suit: "Major Arcana",
  },
  {
    name: "The Empress",
    meaning: "Femininity, beauty, nature, nurturing, abundance",
    reversedMeaning: "Creative block, dependence on others, empty nurturing",
    description:
      "A woman sits on a throne surrounded by a lush garden, wearing a crown of stars.",
    suit: "Major Arcana",
  },
  {
    name: "The Emperor",
    meaning: "Authority, establishment, structure, a father figure",
    reversedMeaning: "Domination, excessive control, lack of discipline",
    description:
      "A crowned figure sits on a throne decorated with rams' heads, holding an ankh scepter.",
    suit: "Major Arcana",
  },
  {
    name: "The Hierophant",
    meaning: "Spiritual wisdom, religious beliefs, conformity, tradition",
    reversedMeaning: "Personal beliefs, freedom, challenging the status quo",
    description:
      "A religious figure sits between two pillars, hand raised in blessing.",
    suit: "Major Arcana",
  },
  {
    name: "The Lovers",
    meaning: "Love, harmony, relationships, values alignment, choices",
    reversedMeaning: "Self-love, disharmony, imbalance, misalignment of values",
    description: "Two figures stand beneath an angel, with the sun above them.",
    suit: "Major Arcana",
  },
  {
    name: "The Chariot",
    meaning: "Control, willpower, success, ambition, determination",
    reversedMeaning: "Self-discipline, opposition, lack of direction",
    description:
      "A figure stands in a chariot drawn by two sphinxes or horses, one black and one white.",
    suit: "Major Arcana",
  },
  {
    name: "Strength",
    meaning: "Strength, courage, patience, soft control, compassion",
    reversedMeaning: "Inner strength, self-doubt, low energy, raw emotion",
    description:
      "A woman gently closes the mouth of a lion, showing quiet strength.",
    suit: "Major Arcana",
  },
  {
    name: "The Hermit",
    meaning: "Soul-searching, introspection, being alone, inner guidance",
    reversedMeaning: "Isolation, loneliness, withdrawal",
    description:
      "An old man stands alone on a mountain peak, holding a lantern.",
    suit: "Major Arcana",
  },
  {
    name: "Wheel of Fortune",
    meaning: "Good luck, karma, life cycles, destiny, a turning point",
    reversedMeaning: "Bad luck, resistance to change, breaking cycles",
    description:
      "A great wheel turns in the sky, surrounded by mystical creatures.",
    suit: "Major Arcana",
  },
  {
    name: "Justice",
    meaning: "Justice, fairness, truth, cause and effect, law",
    reversedMeaning: "Unfairness, lack of accountability, dishonesty",
    description:
      "A figure sits between two pillars, holding scales and a sword.",
    suit: "Major Arcana",
  },
  {
    name: "The Hanged Man",
    meaning: "Surrender, letting go, new perspective, sacrifice",
    reversedMeaning: "Stalling, needless sacrifice, fear of sacrifice",
    description: "A man hangs upside-down from a tree, seeming peaceful.",
    suit: "Major Arcana",
  },
  {
    name: "Death",
    meaning: "Endings, change, transformation, transition",
    reversedMeaning: "Resistance to change, inability to move on",
    description: "A skeleton in armor rides a white horse.",
    suit: "Major Arcana",
  },
  {
    name: "Temperance",
    meaning: "Balance, moderation, patience, purpose",
    reversedMeaning: "Imbalance, excess, lack of long-term vision",
    description:
      "An angel stands with one foot in water, pouring liquid between two cups.",
    suit: "Major Arcana",
  },
  {
    name: "The Devil",
    meaning: "Shadow self, attachment, addiction, restriction, sexuality",
    reversedMeaning:
      "Releasing limiting beliefs, exploring dark thoughts, detachment",
    description: "A horned figure sits above two chained figures.",
    suit: "Major Arcana",
  },
  {
    name: "The Tower",
    meaning: "Sudden change, upheaval, chaos, revelation, awakening",
    reversedMeaning:
      "Personal transformation, fear of change, averting disaster",
    description: "Lightning strikes a tower, people falling from it.",
    suit: "Major Arcana",
  },
  {
    name: "The Star",
    meaning: "Hope, faith, purpose, renewal, spirituality",
    reversedMeaning: "Lack of faith, despair, disconnection",
    description:
      "A woman kneels by a pool, pouring water, with eight stars above.",
    suit: "Major Arcana",
  },
  {
    name: "The Moon",
    meaning: "Illusion, fear, anxiety, subconscious, intuition",
    reversedMeaning: "Release of fear, repressed emotion, inner confusion",
    description:
      "A moon shines above a path between two towers, with a dog and wolf howling.",
    suit: "Major Arcana",
  },
  {
    name: "The Sun",
    meaning: "Positivity, fun, warmth, success, vitality",
    reversedMeaning: "Inner child, feeling down, overly optimistic",
    description: "A child rides a white horse under a bright sun.",
    suit: "Major Arcana",
  },
  {
    name: "Judgement",
    meaning: "Judgement, rebirth, inner calling, absolution",
    reversedMeaning: "Self-doubt, inner critic, ignoring the call",
    description: "An angel blows a trumpet while people rise from graves.",
    suit: "Major Arcana",
  },
  {
    name: "The World",
    meaning: "Completion, integration, accomplishment, travel",
    reversedMeaning: "Seeking closure, short-cuts, delays",
    description:
      "A dancing figure in a wreath, surrounded by four creatures in corners.",
    suit: "Major Arcana",
  },

  // Wands
  {
    name: "Ace of Wands",
    meaning: "Inspiration, new opportunities, growth, potential",
    reversedMeaning: "Delays, blocks, lack of motivation",
    description: "A hand emerges from a cloud holding a flowering wand.",
    suit: "Wands",
  },
  {
    name: "Two of Wands",
    meaning: "Future planning, progress, decisions, discovery",
    reversedMeaning: "Fear of change, playing it safe, bad planning",
    description:
      "A figure holds a globe while looking out from between two wands.",
    suit: "Wands",
  },
  {
    name: "Three of Wands",
    meaning: "Expansion, foresight, overseas opportunities",
    reversedMeaning: "Obstacles, delays, lack of foresight",
    description: "A figure stands among three wands, looking out over the sea.",
    suit: "Wands",
  },
  {
    name: "Four of Wands",
    meaning: "Celebration, harmony, marriage, home, community",
    reversedMeaning: "Lack of support, transience, home conflicts",
    description: "Four wands with flowers form a canopy over a celebration.",
    suit: "Wands",
  },
  {
    name: "Five of Wands",
    meaning: "Competition, conflict, rivalry, diversity",
    reversedMeaning: "Avoiding conflict, respecting differences",
    description: "Five figures appear to be fighting with wands.",
    suit: "Wands",
  },
  {
    name: "Six of Wands",
    meaning: "Victory, success, public reward, progress",
    reversedMeaning: "Excess pride, lack of recognition, fall from grace",
    description: "A rider in a victory wreath rides through a crowd.",
    suit: "Wands",
  },
  {
    name: "Seven of Wands",
    meaning: "Challenge, competition, protection, perseverance",
    reversedMeaning: "Giving up, overwhelmed, surrendering position",
    description: "A figure defends their position from six attacking wands.",
    suit: "Wands",
  },
  {
    name: "Eight of Wands",
    meaning: "Speed, action, air travel, movement, quick developments",
    reversedMeaning: "Delays, frustration, slowing down",
    description: "Eight wands fly through the air toward their destination.",
    suit: "Wands",
  },
  {
    name: "Nine of Wands",
    meaning: "Resilience, courage, persistence, test of faith",
    reversedMeaning: "Exhaustion, giving up, overwhelmed",
    description: "A wounded figure stands with eight wands behind them.",
    suit: "Wands",
  },
  {
    name: "Ten of Wands",
    meaning: "Burden, extra responsibility, hard work, completion",
    reversedMeaning: "Burning out, giving up, inability to delegate",
    description: "A figure carries ten heavy wands toward a house.",
    suit: "Wands",
  },
  {
    name: "Page of Wands",
    meaning: "Exploration, excitement, freedom, adventure",
    reversedMeaning: "Lack of direction, procrastination, creating drama",
    description: "A young person in a feathered hat holds a flowering wand.",
    suit: "Wands",
  },
  {
    name: "Knight of Wands",
    meaning: "Energy, passion, inspired action, adventure, impulsiveness",
    reversedMeaning: "Anger, impulsiveness, recklessness",
    description: "A knight rides a rearing horse, holding a wand aloft.",
    suit: "Wands",
  },
  {
    name: "Queen of Wands",
    meaning: "Courage, determination, joy, vibrancy, leadership",
    reversedMeaning: "Selfishness, jealousy, insecurities",
    description:
      "A queen sits on a throne with a black cat at her feet, holding a sunflower.",
    suit: "Wands",
  },
  {
    name: "King of Wands",
    meaning: "Natural-born leader, vision, entrepreneur, honor",
    reversedMeaning: "Impulsiveness, haste, ruthlessness",
    description:
      "A king sits on a throne decorated with lions and salamanders.",
    suit: "Wands",
  },

  // Cups
  {
    name: "Ace of Cups",
    meaning: "New feelings, spirituality, intuition, love, compassion",
    reversedMeaning: "Emotional loss, blocked creativity, emptiness",
    description:
      "A hand holds a cup overflowing with water, doves, and holy water.",
    suit: "Cups",
  },
  {
    name: "Two of Cups",
    meaning: "Unity, partnership, connection, attraction",
    reversedMeaning: "Broken communication, tension, disconnection",
    description: "Two figures exchange cups in a ceremony of union.",
    suit: "Cups",
  },
  {
    name: "Three of Cups",
    meaning: "Celebration, friendship, creativity, collaborations",
    reversedMeaning: "Overindulgence, gossip, isolation",
    description: "Three women dance and raise cups in celebration.",
    suit: "Cups",
  },
  {
    name: "Four of Cups",
    meaning: "Meditation, contemplation, apathy, reevaluation",
    reversedMeaning: "Depression, stagnation, acceptance of change",
    description:
      "A figure sits under a tree, ignoring three cups while a fourth is offered.",
    suit: "Cups",
  },
  {
    name: "Five of Cups",
    meaning: "Loss, grief, self-pity, acceptance",
    reversedMeaning: "Return of hope, forgiveness, moving on",
    description:
      "A figure mourns three spilled cups, while two full cups stand behind them.",
    suit: "Cups",
  },
  {
    name: "Six of Cups",
    meaning: "Nostalgia, childhood memories, innocence, joy",
    reversedMeaning: "Living in the past, unrealistic memories",
    description:
      "Children play in a garden, exchanging cups filled with flowers.",
    suit: "Cups",
  },
  {
    name: "Seven of Cups",
    meaning: "Choices, fantasy, illusion, opportunities",
    reversedMeaning: "Lack of purpose, disarray, confusion",
    description:
      "Seven cups float in the clouds, each containing a different vision.",
    suit: "Cups",
  },
  {
    name: "Eight of Cups",
    meaning: "Walking away, disillusionment, leaving behind",
    reversedMeaning: "Confusion, fear of change, fear of loss",
    description: "A figure walks away from eight cups, toward mountains.",
    suit: "Cups",
  },
  {
    name: "Nine of Cups",
    meaning: "Contentment, satisfaction, gratitude, wish come true",
    reversedMeaning: "Inner happiness, materialism, dissatisfaction",
    description:
      "A figure sits contentedly before nine cups arranged in an arc.",
    suit: "Cups",
  },
  {
    name: "Ten of Cups",
    meaning: "Divine love, blissful relationships, harmony, alignment",
    reversedMeaning: "Broken family, domestic problems, disconnection",
    description: "A family celebrates under a rainbow of ten cups.",
    suit: "Cups",
  },
  {
    name: "Page of Cups",
    meaning: "Creative opportunities, curiosity, possibility, wonder",
    reversedMeaning: "Creative blocks, emotional immaturity",
    description: "A youth holds a cup with a fish emerging from it.",
    suit: "Cups",
  },
  {
    name: "Knight of Cups",
    meaning: "Following the heart, idealist, romantic, imagination",
    reversedMeaning: "Moodiness, disappointment",
    description: "A knight rides slowly on a horse, holding out a cup.",
    suit: "Cups",
  },
  {
    name: "Queen of Cups",
    meaning: "Compassion, calm, comfort, emotional security",
    reversedMeaning: "Insecurity, dependence, emotional manipulation",
    description:
      "A queen sits on a throne at the edge of the sea, holding an ornate cup.",
    suit: "Cups",
  },
  {
    name: "King of Cups",
    meaning: "Emotional balance, control, diplomacy",
    reversedMeaning: "Coldness, moodiness, bad advice",
    description:
      "A king sits on a throne in the midst of a turbulent sea, holding a cup and scepter.",
    suit: "Cups",
  },

  // Swords
  {
    name: "Ace of Swords",
    meaning: "Breakthrough, clarity, sharp mind, new ideas",
    reversedMeaning: "Confusion, brutality, chaos",
    description:
      "A hand emerges from clouds holding an upright sword crowned with a wreath.",
    suit: "Swords",
  },
  {
    name: "Two of Swords",
    meaning: "Difficult choices, stalemate, blocked emotions",
    reversedMeaning: "Release, revelation, tension",
    description: "A blindfolded figure balances two crossed swords.",
    suit: "Swords",
  },
  {
    name: "Three of Swords",
    meaning: "Heartbreak, emotional pain, sorrow, grief",
    reversedMeaning: "Recovery, forgiveness, moving on",
    description: "Three swords pierce a heart in storm clouds.",
    suit: "Swords",
  },
  {
    name: "Four of Swords",
    meaning: "Rest, restoration, contemplation, recuperation",
    reversedMeaning: "Restlessness, burnout, stress",
    description: "A knight lies in repose on a tomb, hands in prayer position.",
    suit: "Swords",
  },
  {
    name: "Five of Swords",
    meaning: "Conflict, defeat, win at all costs, dishonor",
    reversedMeaning: "Reconciliation, forgiveness, moving on",
    description: "A figure gathers swords while others walk away in defeat.",
    suit: "Swords",
  },
  {
    name: "Six of Swords",
    meaning: "Transition, leaving behind, moving forward",
    reversedMeaning: "Stuck, resistance to change, unfinished business",
    description: "A ferryman poles a boat carrying passengers and six swords.",
    suit: "Swords",
  },
  {
    name: "Seven of Swords",
    meaning: "Deception, strategy, sneaking away",
    reversedMeaning: "Confession, exposure, acceptance",
    description:
      "A figure sneaks away carrying five swords, leaving two behind.",
    suit: "Swords",
  },
  {
    name: "Eight of Swords",
    meaning: "Imprisonment, self-victimization, trapped",
    reversedMeaning: "Self-acceptance, new perspective, freedom",
    description:
      "A bound and blindfolded figure is surrounded by eight swords.",
    suit: "Swords",
  },
  {
    name: "Nine of Swords",
    meaning: "Anxiety, worry, fear, depression",
    reversedMeaning: "Hope, reaching out, despair",
    description:
      "A figure sits up in bed, head in hands, nine swords on the wall.",
    suit: "Swords",
  },
  {
    name: "Ten of Swords",
    meaning: "Painful endings, deep wounds, betrayal, loss",
    reversedMeaning: "Recovery, regeneration, resisting an inevitable end",
    description: "A figure lies face down, pierced by ten swords.",
    suit: "Swords",
  },
  {
    name: "Page of Swords",
    meaning: "New ideas, curiosity, communication, vigilance",
    reversedMeaning: "Deception, manipulation, all talk",
    description: "A youth holds a sword upright, looking ready for anything.",
    suit: "Swords",
  },
  {
    name: "Knight of Swords",
    meaning: "Action, impulsiveness, defending beliefs",
    reversedMeaning: "No direction, disregard for consequences, unprepared",
    description: "A knight charges forward on a horse, sword raised.",
    suit: "Swords",
  },
  {
    name: "Queen of Swords",
    meaning: "Independent, unbiased judgment, clear boundaries",
    reversedMeaning: "Cruel, bitter, cold",
    description: "A queen sits on a throne with an upright sword, hand raised.",
    suit: "Swords",
  },
  {
    name: "King of Swords",
    meaning: "Mental clarity, intellectual power, authority",
    reversedMeaning: "Quiet power, inner truth, misuse of power",
    description: "A king sits on a throne holding a sword point up.",
    suit: "Swords",
  },

  // Pentacles
  {
    name: "Ace of Pentacles",
    meaning: "New financial opportunity, prosperity, new venture",
    reversedMeaning: "Lost opportunity, lack of planning, greed",
    description: "A hand holds a large coin in a garden.",
    suit: "Pentacles",
  },
  {
    name: "Two of Pentacles",
    meaning: "Balance, adaptability, time management",
    reversedMeaning: "Imbalance, disorganization, overwhelmed",
    description: "A figure juggles two coins in a flowing infinity sign.",
    suit: "Pentacles",
  },
  {
    name: "Three of Pentacles",
    meaning: "Teamwork, collaboration, building",
    reversedMeaning: "Lack of teamwork, disorganized, group conflict",
    description: "Three people discuss plans in a cathedral setting.",
    suit: "Pentacles",
  },
  {
    name: "Four of Pentacles",
    meaning: "Security, conservation, frugality",
    reversedMeaning: "Greed, materialism, possession",
    description: "A figure clutches a coin, with three more at their feet.",
    suit: "Pentacles",
  },
  {
    name: "Five of Pentacles",
    meaning: "Hard times, poverty, isolation",
    reversedMeaning: "Recovery, spiritual growth, asking for help",
    description: "Two figures walk in the snow past a stained glass window.",
    suit: "Pentacles",
  },
  {
    name: "Six of Pentacles",
    meaning: "Generosity, charity, sharing wealth",
    reversedMeaning: "Strings attached, stinginess, power and domination",
    description: "A wealthy figure gives coins to beggars.",
    suit: "Pentacles",
  },
  {
    name: "Seven of Pentacles",
    meaning: "Hard work, perseverance, waiting for results",
    reversedMeaning: "Work without results, distractions, lack of rewards",
    description: "A figure contemplates seven pentacles growing on a bush.",
    suit: "Pentacles",
  },
  {
    name: "Eight of Pentacles",
    meaning: "Apprenticeship, repetitive tasks, mastery",
    reversedMeaning: "Perfectionism, no ambition, uninspired work",
    description: "An apprentice works on carving pentacles.",
    suit: "Pentacles",
  },
  {
    name: "Nine of Pentacles",
    meaning: "Luxury, self-sufficiency, financial independence",
    reversedMeaning: "Showing off, superficial, living beyond means",
    description:
      "A well-dressed figure stands in a garden with a hooded falcon.",
    suit: "Pentacles",
  },
  {
    name: "Ten of Pentacles",
    meaning: "Wealth, family, establishment, inheritance",
    reversedMeaning: "Family disputes, bankruptcy, loss of inheritance",
    description:
      "An elderly figure sits with family and dogs in a wealthy setting.",
    suit: "Pentacles",
  },
  {
    name: "Page of Pentacles",
    meaning: "Manifestation, financial opportunity, new job",
    reversedMeaning: "Lack of progress, procrastination, learn from failure",
    description: "A youth contemplates a large coin in a field.",
    suit: "Pentacles",
  },
  {
    name: "Knight of Pentacles",
    meaning: "Hard work, productivity, routine, conservatism",
    reversedMeaning: "Boredom, feeling stuck, obsessed with work",
    description: "A knight sits on a stationary horse, holding a coin.",
    suit: "Pentacles",
  },
  {
    name: "Queen of Pentacles",
    meaning: "Nurturing, practical, financial security",
    reversedMeaning: "Self-centeredness, jealousy, smothering",
    description: "A queen sits in a garden with a coin in her lap.",
    suit: "Pentacles",
  },
  {
    name: "King of Pentacles",
    meaning: "Abundance, prosperity, security",
    reversedMeaning: "Greed, materialism, poor financial decisions",
    description:
      "A king sits on a throne decorated with bulls and vines, holding a coin.",
    suit: "Pentacles",
  },
];
