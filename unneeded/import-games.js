/**
 * Game Suggestions Import Script
 * 
 * This script imports all game suggestions from the JSON file into the MongoDB database.
 * To use:
 * 1. Update the MongoDB connection URL below
 * 2. Make sure a valid user ID exists in the database
 * 3. Run with: node import-games.js
 */

const { MongoClient, ObjectId } = require('mongodb');

// Configuration
const MONGODB_URI = 'mongodb+srv://yungking:zDEcqstArJLfYbZs@malikoftheyearcluster.jxqyx.mongodb.net/malik_of_the_year?retryWrites=true&w=majority&appName=MalikOfTheYearCluster';
const MOCK_USER_ID = '67ef80328979dd2ce6ae4637'; // Replace with a valid user ObjectId from your DB

// Game suggestions with recategorized elimination types and extracted player counts
const games = [
  {
    name: "Red Light, Green Light",
    description: "Players move on \"green\" and freeze on \"red\"; movement on red = out",
    type: "Squid Game Style",
    category: "Reflex",
    playerCount: 10,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Elimination",
    materialsNeeded: "None (optional: music)",
    cost: null,
    votes: 1
  },
  {
    name: "The Floor Is Lava",
    description: "Players use 2-3 pads to cross a course without touching the ground",
    type: "Squid Game Style",
    category: "Coordination",
    playerCount: 6,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Elimination",
    materialsNeeded: "Cardboard, tiles, or paper pads",
    cost: null,
    votes: 1
  },
  {
    name: "Silent Ball",
    description: "Throw a ball in silence; drop or noise = out",
    type: "Easy & High Stakes",
    category: "Precision",
    playerCount: 8,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Elimination",
    materialsNeeded: "Soft ball or plush",
    cost: null,
    votes: 1
  },
  {
    name: "Cup Stack Duel",
    description: "2 players race to stack/unstack cups; loser is out",
    type: "Easy & High Stakes",
    category: "Coordination",
    playerCount: 2,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Elimination",
    materialsNeeded: "Plastic cups (10 per person)",
    cost: null,
    votes: 1
  },
  {
    name: "Trivia Elimination",
    description: "Quick-answer trivia; wrong = out",
    type: "Strategy",
    category: "Strategy",
    playerCount: 8,
    duration: 30,
    difficulty: "Easy",
    winCondition: "Elimination",
    materialsNeeded: "Trivia questions",
    cost: null,
    votes: 1
  },
  {
    name: "Paper Plane Poker",
    description: "Throw paper plane at target; worst one = out",
    type: "Squid Game Style",
    category: "Precision",
    playerCount: 6,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Elimination",
    materialsNeeded: "Paper, target",
    cost: null,
    votes: 1
  },
  {
    name: "Tug-of-War Twist",
    description: "1v1 rope duel or balance match",
    type: "Squid Game Style",
    category: "Endurance",
    playerCount: 2,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Elimination",
    materialsNeeded: "Rope or pool noodles",
    cost: null,
    votes: 1
  },
  {
    name: "Memory Walk",
    description: "Memorize and walk safe path; mistake = out or restart",
    type: "Squid Game Style",
    category: "Strategy",
    playerCount: 6,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Elimination",
    materialsNeeded: "Tiles/cards, marked pattern",
    cost: null,
    votes: 1
  },
  {
    name: "Balloon Roulette",
    description: "One balloon contains \"Boom\"\. popping it = out",
    type: "Squid Game Style",
    category: "Strategy",
    playerCount: 6,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Elimination",
    materialsNeeded: "Balloons, paper slips",
    cost: null,
    votes: 1
  },
  {
    name: "Balance Beam Showdown",
    description: "Game requires balance + object on head/tray",
    type: "Skill-Based Balance",
    category: "Coordination",
    playerCount: 6,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Elimination",
    materialsNeeded: "Board, bricks, tray/bean bag",
    cost: null,
    votes: 1
  },
  {
    name: "Spoon & Egg Relay",
    description: "Race while balancing egg on spoon",
    type: "Party Classic",
    category: "Coordination",
    playerCount: 8,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Spoons, eggs (plastic or real)",
    cost: null,
    votes: 1
  },
  {
    name: "Water Balloon Toss",
    description: "Partner tosses balloon increasing distance",
    type: "Party Classic",
    category: "Coordination",
    playerCount: 2,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Water balloons",
    cost: null,
    votes: 1
  },
  {
    name: "Sack Race",
    description: "Jump in a sack to the finish",
    type: "Party Classic",
    category: "Coordination",
    playerCount: 6,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Pillowcases or burlap sacks",
    cost: null,
    votes: 1
  },
  {
    name: "Three-Legged Race",
    description: "Run with a partner's leg tied to yours",
    type: "Party Classic",
    category: "Coordination",
    playerCount: 2,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "String or bandanas",
    cost: null,
    votes: 1
  },
  {
    name: "Human Ring Toss",
    description: "Throw hula hoops over human targets",
    type: "Party/Skill",
    category: "Precision",
    playerCount: 6,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Hula hoops",
    cost: null,
    votes: 1
  },
  {
    name: "Musical Hula Hoops",
    description: "Like musical chairs but with hula hoops",
    type: "Party Game",
    category: "Reflex",
    playerCount: 8,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Elimination",
    materialsNeeded: "Hula hoops, music",
    cost: null,
    votes: 1
  },
  {
    name: "Scavenger Hunt",
    description: "Find items or solve riddles hidden around",
    type: "Strategy-Based",
    category: "Strategy",
    playerCount: 8,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Score",
    materialsNeeded: "Clue cards, small items",
    cost: null,
    votes: 1
  },
  {
    name: "Charades (Olympic Edition)",
    description: "Mime sports or activities",
    type: "Strategy-Based",
    category: "Performance",
    playerCount: 8,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Charade cards",
    cost: null,
    votes: 1
  },
  {
    name: "Tower Building Challenge",
    description: "Race to build tallest tower (cups, marshmallows)",
    type: "Strategy-Based",
    category: "Precision",
    playerCount: 6,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Cups, marshmallows, sticks",
    cost: null,
    votes: 1
  },
  {
    name: "Code Word Relay",
    description: "Pass a secret message down the line",
    type: "Strategy/Teamwork",
    category: "Strategy",
    playerCount: 8,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "None",
    cost: null,
    votes: 1
  },
  {
    name: "Obstacle Course",
    description: "Multiple stations: crawl, jump, throw, balance",
    type: "Sport/Challenge",
    category: "Coordination",
    playerCount: 6,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Score",
    materialsNeeded: "Cones, rope, markers",
    cost: null,
    votes: 1
  },
  {
    name: "Tug-of-War",
    description: "Team rope pull, first to pull other over line wins",
    type: "Sport/Team",
    category: "Endurance",
    playerCount: 10,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Elimination",
    materialsNeeded: "Rope, markers",
    cost: null,
    votes: 1
  },
  {
    name: "Frisbee Accuracy",
    description: "Throw frisbee at targets (buckets, hoops)",
    type: "Sport/Skill",
    category: "Precision",
    playerCount: 6,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Frisbees, targets",
    cost: null,
    votes: 1
  },
  {
    name: "Mini Golf Challenge",
    description: "Putt golf balls into DIY holes",
    type: "Sport/Skill",
    category: "Precision",
    playerCount: 6,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Score",
    materialsNeeded: "Golf balls, cups",
    cost: null,
    votes: 1
  },
  {
    name: "Basketball Shootout",
    description: "Timed shooting challenge or HORSE",
    type: "Sport/Skill",
    category: "Precision",
    playerCount: 6,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Score",
    materialsNeeded: "Hoop, balls",
    cost: null,
    votes: 1
  },
  {
    name: "Wheelbarrow Race",
    description: "One person walks on hands, other holds legs",
    type: "Sport/Challenge",
    category: "Coordination",
    playerCount: 2,
    duration: 45,
    difficulty: "Hard",
    winCondition: "Score",
    materialsNeeded: "None",
    cost: null,
    votes: 1
  },
  {
    name: "Plank Contest",
    description: "See who holds a plank the longest",
    type: "Fitness Challenge",
    category: "Endurance",
    playerCount: 6,
    duration: 45,
    difficulty: "Hard",
    winCondition: "Elimination",
    materialsNeeded: "None",
    cost: null,
    votes: 1
  },
  {
    name: "Sprint Tournament",
    description: "50m dash, bracket style",
    type: "Sport/Track",
    category: "Endurance",
    playerCount: 8,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Elimination",
    materialsNeeded: "Cones/markers",
    cost: null,
    votes: 1
  },
  {
    name: "Backyard Kickball",
    description: "Simple baseball-style team game",
    type: "Sport/Team",
    category: "Coordination",
    playerCount: 10,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Score",
    materialsNeeded: "Ball, bases",
    cost: null,
    votes: 1
  },
  {
    name: "Amazing Race (Mini)",
    description: "Multi-station race with tasks and clues",
    type: "Strategy + Physical",
    category: "Strategy",
    playerCount: 8,
    duration: 45,
    difficulty: "Hard",
    winCondition: "Elimination",
    materialsNeeded: "Clues, props per station",
    cost: null,
    votes: 1
  },
  {
    name: "Water Cup Relay",
    description: "Pass leaky cups to fill a final bucket",
    type: "Fun/Coordination",
    category: "Coordination",
    playerCount: 8,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Cups with holes, bucket",
    cost: null,
    votes: 1
  },
  {
    name: "Family Feud Showdown",
    description: "Two teams guess popular answers",
    type: "Trivia/Team",
    category: "Strategy",
    playerCount: 10,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Elimination",
    materialsNeeded: "Custom questions",
    cost: null,
    votes: 1
  },
  {
    name: "Corn Hole",
    description: "Toss bean bags into a hole on a board for points",
    type: "Sport/Skill",
    category: "Precision",
    playerCount: 4,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Cornhole boards, bean bags",
    cost: null,
    votes: 1
  },
  {
    name: "Potato Sack Race",
    description: "Hop in a sack to the finish line",
    type: "Party Classic",
    category: "Coordination",
    playerCount: 6,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Burlap sacks or pillowcases",
    cost: null,
    votes: 1
  },
  {
    name: "Tug-o-War",
    description: "Teams pull a rope; first to pull other over line wins",
    type: "Sport/Team",
    category: "Endurance",
    playerCount: 10,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Elimination",
    materialsNeeded: "Rope, markers",
    cost: null,
    votes: 1
  },
  {
    name: "Pickleball",
    description: "Paddle game over a net, similar to tennis",
    type: "Sport/Game",
    category: "Coordination",
    playerCount: 4,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Score",
    materialsNeeded: "Paddles, net, ball",
    cost: null,
    votes: 1
  },
  {
    name: "Volleyball",
    description: "Hit ball over net, avoid letting it touch ground",
    type: "Sport/Team",
    category: "Coordination",
    playerCount: 10,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Score",
    materialsNeeded: "Net, volleyball",
    cost: null,
    votes: 1
  },
  {
    name: "Archery",
    description: "Shoot arrows at a target for points",
    type: "Skill-Based",
    category: "Precision",
    playerCount: 6,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Score",
    materialsNeeded: "Bow, arrows, target",
    cost: null,
    votes: 1
  },
  {
    name: "BB Gun",
    description: "Shoot at targets with a BB gun for accuracy",
    type: "Skill-Based",
    category: "Precision",
    playerCount: 6,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Elimination",
    materialsNeeded: "BB guns, safety gear, targets",
    cost: null,
    votes: 1
  },
  {
    name: "Obstacle Course",
    description: "Complete various physical challenges in sequence",
    type: "Sport/Challenge",
    category: "Coordination",
    playerCount: 6,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Score",
    materialsNeeded: "Cones, rope, markers",
    cost: null,
    votes: 1
  },
  {
    name: "Foot Race",
    description: "Classic running race to the finish",
    type: "Sport/Track",
    category: "Endurance",
    playerCount: 6,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Markers, stopwatch (optional)",
    cost: null,
    votes: 1
  },
  {
    name: "Rally Racing",
    description: "Teams complete a course with multiple stations or vehicles (pedal-based)",
    type: "Sport/Challenge",
    category: "Endurance",
    playerCount: 8,
    duration: 45,
    difficulty: "Hard",
    winCondition: "Score",
    materialsNeeded: "Bikes, scooters, markers",
    cost: null,
    votes: 1
  },
  {
    name: "Spikeball",
    description: "Hit ball off round net; team game with quick reflexes",
    type: "Sport/Skill",
    category: "Reflex",
    playerCount: 4,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Score",
    materialsNeeded: "Spikeball set",
    cost: null,
    votes: 1
  },
  {
    name: "Darts",
    description: "Throw darts at a target to score points",
    type: "Skill-Based",
    category: "Precision",
    playerCount: 4,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Dartboard, darts",
    cost: null,
    votes: 1
  },
  {
    name: "Giant Ludo",
    description: "Walkable version of Ludo; human pieces move via dice",
    type: "Party/Board Game",
    category: "Strategy",
    playerCount: 8,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Giant board, dice",
    cost: null,
    votes: 1
  },
  {
    name: "Sponge Bucket",
    description: "Soak sponge, run to bucket, squeeze; repeat to fill bucket",
    type: "Fun/Relay",
    category: "Coordination",
    playerCount: 8,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Sponges, water buckets",
    cost: null,
    votes: 1
  },
  {
    name: "Musical Chairs",
    description: "Remove chairs with each round of music; last seated wins",
    type: "Party Classic",
    category: "Reflex",
    playerCount: 8,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Elimination",
    materialsNeeded: "Chairs, music",
    cost: null,
    votes: 1
  },
  {
    name: "Mine Grid",
    description: "Walk a grid with hidden \"mines\". misstep = out or restart",
    type: "Strategy/Memory",
    category: "Strategy",
    playerCount: 6,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Elimination",
    materialsNeeded: "Grid layout, markers",
    cost: null,
    votes: 1
  },
  {
    name: "Egg Race (Plastic)",
    description: "Balance a plastic egg on a spoon while racing",
    type: "Party Classic",
    category: "Coordination",
    playerCount: 6,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Spoons, plastic eggs",
    cost: null,
    votes: 1
  },
  {
    name: "Apple Bobbing",
    description: "Grab apples from water using only your mouth",
    type: "Party Classic",
    category: "Coordination",
    playerCount: 6,
    duration: 15,
    difficulty: "Easy",
    winCondition: "Score",
    materialsNeeded: "Tub, water, apples",
    cost: null,
    votes: 1
  },
  {
    name: "Kan Jam",
    description: "Teams throw frisbee to hit or slot into can",
    type: "Sport/Frisbee",
    category: "Precision",
    playerCount: 4,
    duration: 30,
    difficulty: "Medium",
    winCondition: "Score",
    materialsNeeded: "Frisbee, Kan Jam set",
    cost: null,
    votes: 1
  }
];

async function importGames() {
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const suggestedGameCollection = db.collection('SuggestedGame');
    
    // Add the suggested user ID to each game
    const gamesWithUser = games.map(game => ({
      ...game,
      suggestedById: new ObjectId(MOCK_USER_ID),
      createdAt: new Date()
    }));
    
    // Insert the games
    const result = await suggestedGameCollection.insertMany(gamesWithUser);
    
    console.log(`Successfully imported ${result.insertedCount} games!`);
    
    // Create votes for each game
    const votes = gamesWithUser.map(game => ({
      suggestedGameId: game._id,
      userId: new ObjectId(MOCK_USER_ID),
      createdAt: new Date()
    }));
    
    const voteCollection = db.collection('SuggestedGameVote');
    const voteResult = await voteCollection.insertMany(votes);
    
    console.log(`Created ${voteResult.insertedCount} votes for games`);
    
  } catch (error) {
    console.error('Error importing games:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the import
importGames().catch(console.error); 