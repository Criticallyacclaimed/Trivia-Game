import { TriviaQuestion } from '../types';

export const INITIAL_TRIVIA_QUESTIONS: TriviaQuestion[] = [
  // --- KID'S WONDERS (Kids) ---
  {
    id: 'k-1',
    question: 'Which of these animals is the tallest living land animal in the world?',
    options: ['African Elephant', 'Giraffe', 'Hippopotamus', 'Grizzly Bear'],
    correctAnswer: 1,
    category: "Kid's Wonders",
    difficulty: 'Kids',
    imageUrl: 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=800&q=80',
    explanation: 'Giraffes can grow up to 19 feet (5.8 meters) tall thanks to their super long necks!',
    hint: 'This spotted animal has a very long neck to eat leaves from high trees!'
  },
  {
    id: 'k-2',
    question: 'What is the name of the planet closest to the Sun in our solar system?',
    options: ['Venus', 'Mercury', 'Mars', 'Jupiter'],
    correctAnswer: 1,
    category: "Kid's Wonders",
    difficulty: 'Kids',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
    explanation: 'Mercury is the smallest planet and zips around the Sun in just 88 days!',
    hint: 'Its name starts with M and it is the smallest inner planet.'
  },
  {
    id: 'k-3',
    question: 'How many colors are in a standard rainbow?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    category: "Kid's Wonders",
    difficulty: 'Kids',
    imageUrl: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80',
    explanation: 'The 7 colors are Red, Orange, Yellow, Green, Blue, Indigo, and Violet (ROYGBIV)!',
    hint: 'Think of the acronym ROY G BIV!'
  },

  // --- SCIENCE & NATURE ---
  {
    id: 'sn-1',
    question: 'What chemical element gives our blood its red color when bound with oxygen?',
    options: ['Copper', 'Calcium', 'Iron', 'Magnesium'],
    correctAnswer: 2,
    category: 'Science & Nature',
    difficulty: 'Adults',
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    explanation: 'Iron in hemoglobin reflects red light when it binds with oxygen molecules!',
    hint: 'It is a strong metal that rusts when exposed to water and oxygen.'
  },
  {
    id: 'sn-2',
    question: 'Which natural phenomenon causes the colorful light displays near Earth poles known as Auroras?',
    options: ['Volcanic Ash', 'Solar Wind Particles', 'Lunar Eclipse', 'Tidal Friction'],
    correctAnswer: 1,
    category: 'Science & Nature',
    difficulty: 'Adults',
    imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80',
    explanation: 'Charged solar wind particles collide with atmospheric gases, producing brilliant dancing lights!',
    hint: 'Stream of energetic particles flowing outward from the Sun.'
  },
  {
    id: 'sn-3',
    question: 'What is the hardest known natural substance on Earth?',
    options: ['Quartz', 'Diamond', 'Titanium', 'Obsidian'],
    correctAnswer: 1,
    category: 'Science & Nature',
    difficulty: 'Seniors',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    explanation: 'Diamond scores a 10 on Mohs hardness scale because carbon atoms form a rigid 3D crystal lattice!',
    hint: 'It is a precious gemstone often used in wedding rings.'
  },

  // --- HISTORY & MYTHS ---
  {
    id: 'hm-1',
    question: 'Which ancient wonder of the world was located in the city of Alexandria, Egypt?',
    options: ['Hanging Gardens', 'Colossus of Rhodes', 'Great Lighthouse (Pharos)', 'Statue of Zeus'],
    correctAnswer: 2,
    category: 'History & Myths',
    difficulty: 'Seniors',
    imageUrl: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=800&q=80',
    explanation: 'The Lighthouse of Alexandria was built in the 3rd century BC and guided Mediterranean sailors safely for centuries.',
    hint: 'A towering structure built to shine light for sea vessels.'
  },
  {
    id: 'hm-2',
    question: 'In Norse mythology, what weapon is wielded by the thunder god Thor?',
    options: ['Excalibur', 'Mjolnir', 'Gungnir', 'Trident'],
    correctAnswer: 1,
    category: 'History & Myths',
    difficulty: 'Adults',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    explanation: 'Mjolnir was forged by dwarven smiths and could summon lightning and return to Thor like a boomerang!',
    hint: 'Spelled with a M and J in Scandinavian mythology.'
  },

  // --- GEOGRAPHY & WORLD ---
  {
    id: 'gw-1',
    question: 'Which iconic mountain range stretches across South America along its western coast?',
    options: ['The Rockies', 'The Alps', 'The Andes', 'The Himalayas'],
    correctAnswer: 2,
    category: 'Geography & World',
    difficulty: 'Seniors',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    explanation: 'The Andes range spans over 7,000 km (4,300 miles) through seven South American countries!',
    hint: 'Home to Machu Picchu in Peru.'
  },
  {
    id: 'gw-2',
    question: 'What is the largest hot desert in the world?',
    options: ['Gobi Desert', 'Kalahari Desert', 'Sahara Desert', 'Atacama Desert'],
    correctAnswer: 2,
    category: 'Geography & World',
    difficulty: 'Adults',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    explanation: 'The Sahara covers over 9 million square kilometers across North Africa!',
    hint: 'Spans across North African countries like Egypt, Algeria, and Morocco.'
  },

  // --- POP CULTURE & MOVIES ---
  {
    id: 'pcm-1',
    question: 'Which animated classic featured the song "Under the Sea" composed by Alan Menken?',
    options: ['The Lion King', 'Aladdin', 'The Little Mermaid', 'Beauty and the Beast'],
    correctAnswer: 2,
    category: 'Pop Culture & Movies',
    difficulty: 'Kids',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    explanation: 'Sebastian the crab sang "Under the Sea" in Disney\'s 1989 hit The Little Mermaid!',
    hint: 'Features Ariel, Flounder, and Sebastian the crab.'
  },
  {
    id: 'pcm-2',
    question: 'What fictional secret agent holds code number 007?',
    options: ['Jason Bourne', 'James Bond', 'Ethan Hunt', 'Jack Reacher'],
    correctAnswer: 1,
    category: 'Pop Culture & Movies',
    difficulty: 'Seniors',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    explanation: 'Created by author Ian Fleming in 1953, James Bond has starred in over 25 feature films!',
    hint: 'Famous phrase: "Shaken, not stirred."'
  },

  // --- SPORTS & GAMES ---
  {
    id: 'sg-1',
    question: 'In soccer (football), how many players from each team are on the field during a standard match?',
    options: ['9', '10', '11', '12'],
    correctAnswer: 2,
    category: 'Sports & Games',
    difficulty: 'Kids',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    explanation: 'Each team fields 11 players including 1 goalkeeper!',
    hint: 'One goalkeeper plus ten outfield players.'
  },

  // --- ART & LITERATURE ---
  {
    id: 'al-1',
    question: 'Who painted the famous masterwork "The Starry Night" in 1889?',
    options: ['Pablo Picasso', 'Vincent van Gogh', 'Claude Monet', 'Leonardo da Vinci'],
    correctAnswer: 1,
    category: 'Art & Literature',
    difficulty: 'Seniors',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    explanation: 'Van Gogh painted The Starry Night while staying at the Saint-Paul-de-Mausole asylum in Saint-Rémy-de-Provence!',
    hint: 'Dutch Post-Impressionist painter known for vibrant brushstrokes.'
  },

  // --- FOOD & DELICACIES ---
  {
    id: 'fd-1',
    question: 'Which country is credited with originating the traditional dish sushi?',
    options: ['China', 'Japan', 'Thailand', 'Vietnam'],
    correctAnswer: 1,
    category: 'Food & Delicacies',
    difficulty: 'Adults',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    explanation: 'Modern sushi evolved in Edo (now Tokyo) during the 19th century as a quick street food item!',
    hint: 'Land of the Rising Sun.'
  }
];

export const CATEGORIES_CONFIG = [
  {
    id: "Kid's Wonders" as const,
    title: "Kid's Wonders",
    description: "Fun, bright questions about animals, space, cartoons & fairy tales!",
    color: "from-pink-500 to-rose-400",
    bgLight: "bg-pink-50 text-pink-700 border-pink-200",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    iconName: "Sparkles"
  },
  {
    id: "Science & Nature" as const,
    title: "Science & Nature",
    description: "Explore wildlife, chemistry, space exploration & physics!",
    color: "from-emerald-500 to-teal-400",
    bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
    image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80",
    iconName: "Atom"
  },
  {
    id: "History & Myths" as const,
    title: "History & Myths",
    description: "Ancient empires, legendary gods, historic battles & revolutions!",
    color: "from-amber-500 to-orange-400",
    bgLight: "bg-amber-50 text-amber-700 border-amber-200",
    image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=600&q=80",
    iconName: "Landmark"
  },
  {
    id: "Geography & World" as const,
    title: "Geography & World",
    description: "Capitals, world wonders, mountain peaks, oceans & cultures!",
    color: "from-blue-500 to-cyan-400",
    bgLight: "bg-blue-50 text-blue-700 border-blue-200",
    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80",
    iconName: "Globe"
  },
  {
    id: "Pop Culture & Movies" as const,
    title: "Pop Culture & Movies",
    description: "Hollywood blockbusters, hit music, viral trends & cinema trivia!",
    color: "from-purple-500 to-indigo-400",
    bgLight: "bg-purple-50 text-purple-700 border-purple-200",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
    iconName: "Film"
  },
  {
    id: "Sports & Games" as const,
    title: "Sports & Games",
    description: "Olympics, world cup legends, esports & classic board games!",
    color: "from-red-500 to-orange-500",
    bgLight: "bg-red-50 text-red-700 border-red-200",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80",
    iconName: "Trophy"
  },
  {
    id: "Art & Literature" as const,
    title: "Art & Literature",
    description: "Master paintings, iconic novels, classical music & poetry!",
    color: "from-violet-500 to-purple-400",
    bgLight: "bg-violet-50 text-violet-700 border-violet-200",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
    iconName: "Palette"
  },
  {
    id: "Food & Delicacies" as const,
    title: "Food & Delicacies",
    description: "Global cuisines, famous spices, baking & gourmet culinary facts!",
    color: "from-yellow-500 to-amber-500",
    bgLight: "bg-yellow-50 text-yellow-800 border-yellow-200",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    iconName: "Utensils"
  }
];
