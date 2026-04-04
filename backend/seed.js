const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Story = require('./models/Story');
const connectDB = require('./config/db');

dotenv.config();

const stories = [
  {
    title: "The Moon's Daughter",
    region: "Northeast India",
    language: "Khasi",
    culture: "Khasi",
    content:
      "Long ago, the Moon had a beautiful daughter named Ka Sngi, who glowed with an inner radiance that lit the night sky. She would descend to Earth each evening, painting the rivers silver and whispering lullabies to the sleeping forests. One night, a mortal boy named U Hynniewtrep saw her reflection in a lake and fell deeply in love. He climbed the tallest peak in the Khasi Hills to reach her, carrying only a bamboo flute. When Ka Sngi heard his melody, she wept tears of starlight that became the living root bridges that connect the valleys to this day. She could not stay, but she promised: 'Whenever the moon shines on water, I am listening.' The Khasi people still sing to the moon on clear nights, believing their voices travel on silver beams to Ka Sngi's ears.",
    summary: "A Khasi tale of love between a moon goddess and a mortal, explaining the origin of the living root bridges.",
    moral: "Love transcends distance when expressed through sincere devotion.",
    tags: ["origin-story", "romance", "nature", "khasi"],
    source: "verified",
    quality: "high",
    isFeatured: true,
    duration: "8 min",
    listeners: 2340,
    rating: 4.9,
  },
  {
    title: "The Talking Tree of Rotorua",
    region: "New Zealand",
    language: "Te Reo Māori",
    culture: "Maori",
    content:
      "In the geothermal valley of Rotorua, where steam rises from the earth like ancestral breath, there stood a pōhutukawa tree that could speak. Tāne Mahuta, god of forests, had planted it at the spot where the first human drew breath from clay. The tree spoke in riddles, revealing the future only to those patient enough to listen through an entire lunar cycle. Warriors came seeking battle strategies, but the tree spoke of planting seeds. Chiefs asked about power, and the tree spoke of roots. One day, a small child sat beneath it and asked nothing at all. The tree finally said: 'You are the first to understand. Wisdom is not sought—it grows in the silence between questions.' The child became the greatest tohunga (priest) in Māori history, teaching that knowledge lives in the land itself.",
    summary: "A Māori tale about a speaking tree that teaches the value of silent listening.",
    moral: "True wisdom comes from listening, not seeking.",
    tags: ["wisdom", "nature", "maori", "spiritual"],
    source: "verified",
    quality: "high",
    isFeatured: true,
    duration: "12 min",
    listeners: 1820,
    rating: 4.7,
  },
  {
    title: "River Spirit's Gift",
    region: "North America",
    language: "Cherokee",
    culture: "Cherokee",
    content:
      "Long Man, the river spirit, flows through Cherokee country remembering every story ever whispered to its waters. When the people faced a great drought, a young woman named Ama went to Long Man's headwaters carrying seven sacred beads. She sang the old songs—the ones her grandmother had taught her, songs so ancient they predated human memory. Long Man rose from the water in the shape of a great blue heron and said: 'The rain does not forget the earth, but the earth must remember how to receive it.' Ama understood. She taught the people to dig channels shaped like the veins of a leaf, and when the rains finally came, the water found its path. The Cherokee still practice this form of water stewardship, honoring Long Man by letting the river teach them its preferred way to flow.",
    summary: "A Cherokee story of a river spirit teaching water stewardship during drought.",
    moral: "Nature teaches us when we learn to follow its patterns rather than imposing our own.",
    tags: ["nature", "wisdom", "cherokee", "water", "stewardship"],
    source: "verified",
    quality: "high",
    isFeatured: true,
    duration: "15 min",
    listeners: 3100,
    rating: 4.8,
  },
  {
    title: "The Weaver of Stars",
    region: "West Africa",
    language: "Yoruba",
    culture: "Yoruba",
    content:
      "Olorun, the sky god, grew tired of the darkness above. He called upon Arachne-Iya, the great spider-mother, and asked her to weave light into the heavens. She spun threads of pure silver moonlight and gold sunfire, creating patterns that told the stories of every creature below. Each constellation was a chapter: the Hunter's Belt told of courage, the River of Sky told of life's flow, the Gathering told of community. But Arachne-Iya left spaces between the stars — dark patches she called 'the spaces for stories not yet told.' She told Olorun: 'The sky must never be finished, for a complete sky leaves no room for dreams.' To this day, Yoruba astronomers see the dark spaces as invitations, believing each generation adds its own constellation through the stories it lives.",
    summary: "A Yoruba creation myth about a spider-mother weaving the constellations.",
    moral: "Every generation has stories to add; the world is never complete without your contribution.",
    tags: ["creation", "stars", "yoruba", "wisdom", "community"],
    source: "verified",
    quality: "high",
    isFeatured: false,
    duration: "10 min",
    listeners: 1560,
    rating: 4.6,
  },
  {
    title: "The Stone That Sang",
    region: "Australia",
    language: "Pitjantjatjara",
    culture: "Aboriginal Australian",
    content:
      "In the red center of Australia, during the Dreamtime, Tjukurpa the songline serpent shed a single scale that became a stone. This stone held the serpent's voice — a low hum that only those walking their songline could hear. An elder named Minyma Kutjara followed the hum across 400 kilometers of desert, and everywhere the stone sang loudly, water could be found beneath the surface. She marked these places with ochre symbols, creating a living map that fed her people for ten thousand years. When asked how she knew where water hid, she replied: 'I do not find water. The water finds me through the stone's song. We are all connected — rock, water, song, and walker — by the serpent's dreaming.' The songlines remain navigational paths connecting sacred sites across Australia.",
    summary: "An Aboriginal Dreamtime story about a singing stone that reveals water sources along songlines.",
    moral: "Connection to the land is maintained through attentive listening and cultural memory.",
    tags: ["dreamtime", "aboriginal", "songlines", "nature", "navigation"],
    source: "verified",
    quality: "high",
    isFeatured: false,
    duration: "14 min",
    listeners: 890,
    rating: 4.5,
  },
  {
    title: "Grandmother Spider's Web",
    region: "North America",
    language: "Lakota",
    culture: "Lakota Sioux",
    content:
      "Iktomi, the spider trickster, once challenged Grandmother Spider to a weaving contest. He spun elaborate, beautiful webs covered in diamond dewdrops — flashy and impressive. Grandmother Spider wove a simple web between two branches. When the wind came, Iktomi's masterpiece shattered into glittering fragments. Grandmother Spider's web bent, flexed, caught the wind's stories in its threads, and held. She turned to Iktomi and said: 'Beauty that cannot endure is vanity. Strength that can adapt is wisdom.' Iktomi, humbled, asked to learn her way. She taught him: 'Start from the center — your purpose. Spiral outward with intention. Anchor each thread to something real.' The Lakota dreamcatcher originates from this teaching — a web that catches nightmares because it is anchored in love and purpose.",
    summary: "A Lakota tale about Grandmother Spider teaching the difference between display and true craft.",
    moral: "Lasting strength comes from purpose and adaptability, not spectacle.",
    tags: ["wisdom", "trickster", "lakota", "craft", "dreamcatcher"],
    source: "verified",
    quality: "high",
    isFeatured: true,
    duration: "9 min",
    listeners: 2780,
    rating: 4.9,
  },
  {
    title: "The Jade Emperor's Library",
    region: "East Asia",
    language: "Mandarin",
    culture: "Chinese",
    content:
      "In the celestial palace, the Jade Emperor kept a library of every story ever told on Earth. Each tale was inscribed on a jade tablet that glowed with the emotions of its characters. A young scholar named Mei Ling died and ascended to heaven, where she discovered the library. She noticed empty tablets — stories that had been forgotten. Each time a story was lost on Earth, its tablet dimmed and cracked. Mei Ling begged the Emperor: 'Let me return and remember them.' The Emperor granted her wish but with a condition: she could carry only one story back per lifetime. Mei Ling chose carefully. She returned as a grandmother who told one perfect story each night, and that story was retold to children who retold it to their children. The Jade Emperor later revealed: 'One story, well told and well loved, lights more tablets than a thousand forgotten epics.' Chinese New Year storytelling festivals echo this belief — that sharing even one tale sustains the cosmic library.",
    summary: "A Chinese myth about a celestial library of stories and the power of preserving even one tale.",
    moral: "One well-preserved story is worth more than a thousand forgotten ones.",
    tags: ["preservation", "wisdom", "chinese", "celestial", "storytelling"],
    source: "verified",
    quality: "high",
    isFeatured: false,
    duration: "11 min",
    listeners: 1940,
    rating: 4.7,
  },
  {
    title: "The Drum That Remembered",
    region: "Central Africa",
    language: "Lingala",
    culture: "Bantu",
    content:
      "In a village by the Congo River, there was a drum carved from the heartwood of the oldest tree in the forest. This drum did not merely make sound — it remembered. Every rhythm played upon it was stored in its wood grain, and on certain nights, when the moon aligned with the river's bend, the drum would replay the rhythms of ancestors. The village drummer, Bokilo, discovered that by playing the ancient rhythms backward, he could hear the voices of those who had played before him. They whispered guidance: which plants healed, when rains would come, how to resolve disputes. When traders came offering a golden drum in exchange, Bokilo refused. 'Gold has no memory,' he said. 'This drum holds the heartbeat of everyone who has loved this village.' The drum is still played at gatherings, its rhythms a living archive of centuries of Bantu wisdom.",
    summary: "A Bantu story about a drum that stores ancestral wisdom in its rhythms.",
    moral: "Cultural instruments are vessels of collective memory, more valuable than material wealth.",
    tags: ["music", "ancestors", "bantu", "memory", "community"],
    source: "verified",
    quality: "high",
    isFeatured: false,
    duration: "13 min",
    listeners: 1120,
    rating: 4.6,
  },
  {
    title: "The Fox and the Northern Lights",
    region: "Scandinavia",
    language: "Finnish",
    culture: "Sami",
    content:
      "The Sami people of Lapland tell of Tulikettu, the fire fox, who runs across the Arctic tundra so fast that its tail brushes the snow-covered fells, sending sparks into the sky. These sparks catch in the magnetic web of the aurora and dance as the Northern Lights. But there is a deeper version: Tulikettu runs not from joy but from sorrow. It lost its family to a great winter and runs through the darkest nights to keep their memory burning. Each color in the aurora represents a different memory — green for the meadows they shared, red for the warmth of their den, purple for the dreams they dreamed together. The Sami say that when the lights are brightest, Tulikettu has found a moment of peace. Children are taught to send kind thoughts northward on these nights, helping the fox rest. The Finnish word for aurora, 'revontulet,' literally means 'fox fires.'",
    summary: "A Sami origin story for the Northern Lights involving a fire fox running across the tundra.",
    moral: "Grief, when carried with love, can illuminate the world for others.",
    tags: ["origin-story", "sami", "nature", "animals", "aurora"],
    source: "verified",
    quality: "high",
    isFeatured: true,
    duration: "7 min",
    listeners: 3450,
    rating: 4.9,
  },
  {
    title: "The Market of Unfinished Tales",
    region: "South Asia",
    language: "Hindi",
    culture: "Indian",
    content:
      "In old Delhi, hidden between the spice lanes and silver bazaars, there exists a market that appears only during the monsoon's first rainfall. Here, unfinished stories are traded like cloth and spices. A half-told love story might be exchanged for an incomplete adventure. A riddle without an answer trades for a song without an ending. Meera, a young bookseller, stumbled into this market and discovered a stall selling her grandmother's unfinished bedtime stories — the ones that ended with 'and tomorrow I will tell you what happened next,' but tomorrow never came. Meera bargained not with coins but with completions. For each story she finished with a worthy ending, the merchant gave her a page of wisdom written in evening light. She filled three notebooks before the rain stopped and the market vanished. Meera returned to her bookshop and published the completed stories, and elderly readers wept — recognizing tales their own grandmothers had left unfinished.",
    summary: "An Indian urban legend about a mystical monsoon market where unfinished stories are traded.",
    moral: "Completing the stories our elders left unfinished is an act of love and cultural healing.",
    tags: ["storytelling", "indian", "urban-legend", "family", "preservation"],
    source: "verified",
    quality: "high",
    isFeatured: false,
    duration: "16 min",
    listeners: 2100,
    rating: 4.8,
  },
  {
    title: "Coyote Steals the Sun",
    region: "North America",
    language: "Navajo",
    culture: "Navajo",
    content:
      "In the First World, there was no light. Coyote, ever curious and mischievous, heard that the Sun Chief kept daylight locked in a turquoise box in the Fourth World. Coyote climbed through the worlds — swimming through floods, dodging giants, sweet-talking gatekeepers — until he reached the Sun Chief's lodge. He challenged the chief to a game of stick-dice, betting his own tail against the box. Coyote cheated magnificently, using loaded dice carved from moonstone. He won the box and ran. But Coyote's curiosity was his flaw: he opened the box to peek. Light exploded outward, scattering across the sky, creating day and night, shadows and seasons. The Sun Chief wasn't angry — he laughed. 'I was tired of guarding it,' he admitted. 'Light was always meant to be free. It just needed someone foolish enough to release it.' The Navajo say this is why dawn comes suddenly — because Coyote never does anything gradually.",
    summary: "A Navajo trickster tale about Coyote bringing light to the world by accident.",
    moral: "Sometimes the universe uses fools to accomplish what the wise are too cautious to attempt.",
    tags: ["trickster", "navajo", "origin-story", "coyote", "light"],
    source: "verified",
    quality: "high",
    isFeatured: false,
    duration: "10 min",
    listeners: 1670,
    rating: 4.7,
  },
  {
    title: "The Thread Between Worlds",
    region: "South America",
    language: "Quechua",
    culture: "Inca",
    content:
      "The Inca believed that Mama Quilla, the Moon Goddess, wove an invisible thread connecting every living soul. When a person was born, a new thread was spun and attached to the great cosmic loom. When someone died, the thread was not cut but woven deeper into the pattern. A weaver named Cusi could see these threads. She watched them vibrate with emotion — thrumming with joy, going slack with grief, tangling with conflict. Cusi discovered that by weaving a replica of the cosmic pattern on her earthly loom, she could ease tangles in the real web. She became the first healer who worked not with herbs but with patterns. Communities in crisis would bring her their problems described in knots, and she would weave solutions into cloth. The tradition of quipu — the Inca knot-writing system — is said to descend from Cusi's insight that information, emotion, and connection are all forms of weaving.",
    summary: "An Inca myth about a weaver who could see and heal the invisible threads connecting all souls.",
    moral: "We are all connected; healing one thread strengthens the entire web.",
    tags: ["inca", "connection", "weaving", "healing", "spiritual"],
    source: "verified",
    quality: "high",
    isFeatured: false,
    duration: "12 min",
    listeners: 1340,
    rating: 4.6,
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing stories
    const deleted = await Story.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing stories`);

    // Insert seed data
    const created = await Story.insertMany(stories);
    console.log(`🌱 Seeded ${created.length} stories successfully!\n`);

    created.forEach((s) => {
      console.log(`   ✅ ${s.title} (${s.culture} — ${s.region})`);
    });

    console.log('\n📖 Database is ready.\n');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seed Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
