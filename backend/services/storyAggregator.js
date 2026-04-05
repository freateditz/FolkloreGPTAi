/**
 * Story Aggregator Service
 * Fetches cultural stories from various external sources and integrates them
 */

import axios from 'axios';
import Story from '../models/Story.js';

class StoryAggregator {
  constructor() {
    // API endpoints for different cultural story sources
    this.sources = {
      // Open folklore APIs and cultural databases
      folklore: {
        baseUrl: 'https://folklore.org/api',
        enabled: false, // Requires API key
      },
      // Project Gutenberg for public domain stories
      gutenberg: {
        baseUrl: 'https://gutendex.com/books',
        enabled: true,
      },
      // Internet Archive
      archive: {
        baseUrl: 'https://archive.org/advancedsearch.php',
        enabled: true,
      },
      // Wikipedia folklore summaries (for metadata)
      wikipedia: {
        baseUrl: 'https://en.wikipedia.org/api/rest_v1',
        enabled: true,
      }
    };

    // Predefined cultural regions and their story collections
    this.culturalRegions = {
      'indian': {
        name: 'Indian Subcontinent',
        states: ['Rajasthan', 'Kerala', 'Bengal', 'Punjab', 'Maharashtra', 'Tamil Nadu', 'Karnataka'],
        languages: ['Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Urdu', 'Gujarati', 'Malayalam'],
        categories: ['Panchatantra', 'Jataka Tales', 'Mahabharata', 'Ramayana', 'Folk Tales', 'Mythology']
      },
      'african': {
        name: 'African',
        regions: ['West Africa', 'East Africa', 'Southern Africa', 'North Africa'],
        languages: ['Swahili', 'Yoruba', 'Zulu', 'Amharic', 'Hausa'],
        categories: ['Anansi Stories', 'Creation Myths', 'Animal Tales', 'Trickster Tales']
      },
      'native_american': {
        name: 'Indigenous Americas',
        tribes: ['Navajo', 'Cherokee', 'Inuit', 'Apache', 'Sioux', 'Iroquois'],
        categories: ['Creation Stories', 'Trickster Tales', 'Nature Spirits', 'Hero Journeys']
      },
      'asian': {
        name: 'East Asian',
        countries: ['China', 'Japan', 'Korea', 'Vietnam'],
        categories: ['Fairy Tales', 'Mythology', 'Buddhist Stories', 'Daoist Tales']
      },
      'pacific': {
        name: 'Pacific Islands',
        islands: ['Maori', 'Hawaiian', 'Samoan', 'Fijian'],
        categories: ['Ocean Stories', 'Creation Myths', 'Ancestor Tales']
      }
    };
  }

  /**
   * Seed database with curated cultural stories
   * This creates a rich base of stories from different cultures
   */
  async seedCulturalStories() {
    console.log('🌱 Seeding cultural stories database...');

    const stories = [
      // Indian Stories
      {
        title: "The Loyal Mongoose",
        culture: "Indian",
        region: "Maharashtra",
        language: "Marathi",
        category: "Panchatantra",
        description: "A story about a loyal mongoose who protects a farmer's child from a snake, but is tragically misunderstood.",
        storyText: `Once upon a time, there lived a farmer and his wife in a village. They had a newborn baby. One day, the farmer brought home a mongoose to be a companion for his son.

The farmer and his wife came to love the mongoose like their own child. One day, the farmer's wife went to the market, leaving the baby in the care of the mongoose. The farmer was working in the fields.

A snake entered the house and approached the cradle. The mongoose, ever vigilant, fought the snake and killed it to protect the child. When the farmer's wife returned, she saw the mongoose with blood on its mouth near the cradle. Thinking the mongoose had harmed her baby, she threw a heavy stick at it in anger.

The mongoose died from the blow. When she checked the cradle, she found the baby safe and the dead snake nearby. She realized her terrible mistake - the mongoose had saved her child's life.

The moral: Never act in haste and anger without knowing the full truth.`,
        moral: "Never act in haste and anger without knowing the full truth.",
        narrator: "Traditional",
        tags: ["Loyalty", "Animals", "Tragedy", "Wisdom"],
        difficulty: "Easy",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Panchatantra",
        sourceUrl: "https://en.wikipedia.org/wiki/Panchatantra"
      },
      {
        title: "The Golden Deer",
        culture: "Indian",
        region: "All India",
        language: "Sanskrit",
        category: "Ramayana",
        description: "The story of Mareecha, the golden deer who helped Ravana kidnap Sita.",
        storyText: `In the great epic Ramayana, Ravana devised a plan to kidnap Sita, the wife of Lord Rama. He sought the help of his uncle Mareecha, who had the power to transform into a golden deer.

Mareecha took the form of a magnificent golden deer with silver spots. When Sita saw this beautiful creature in the forest, she was enchanted and asked Rama to capture it for her. Lakshmana, Rama's brother, warned them that it might be a trick, but Sita was adamant.

Rama went after the deer, which led him deep into the forest. When Rama struck the deer with his arrow, Mareecha cried out in Rama's voice, "Lakshmana! Help me!"

Hearing the cry, Sita became worried and insisted that Lakshmana go to help Rama. Lakshmana was reluctant to leave her alone, but eventually agreed after drawing a protective line around their hut - the famous Lakshmana Rekha.

As soon as Lakshmana left, Ravana came disguised as a sage and crossed the line to abduct Sita. This event set in motion the great war between Rama and Ravana.`,
        moral: "Be cautious of desires that seem too perfect; they may hide danger.",
        narrator: "Valmiki (Traditional)",
        tags: ["Epic", "Mythology", "Deception", "War"],
        difficulty: "Medium",
        ageGroup: "Teens and Adults",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Ramayana",
        sourceUrl: "https://en.wikipedia.org/wiki/Ramayana"
      },
      {
        title: "The Clever Rabbit",
        culture: "Indian",
        region: "Karnataka",
        language: "Kannada",
        category: "Folk Tales",
        description: "A tale of how a small rabbit outwitted a mighty elephant to save the forest.",
        storyText: `Long ago in a dense forest in Karnataka, the animals lived in peace until a rogue elephant arrived. This elephant was arrogant and destructive, trampling the smaller animals' homes and eating all the vegetation without care.

The animals held a meeting to discuss what to do. The wise old owl suggested they seek help from a rabbit known for his cleverness. The rabbit agreed to help and devised a plan.

The next day, the rabbit went to the elephant and said, "O Mighty One, the animals of the forest have sent me to invite you to a grand feast hosted by the Moon God himself. He has heard of your greatness and wishes to honor you."

The elephant was flattered and followed the rabbit to a pond. The rabbit pointed to the reflection of the moon in the water and said, "Look, the Moon God awaits you below. But you must enter alone to show respect."

The elephant, eager to meet the Moon God, stepped into the water, causing ripples that broke the reflection. The rabbit exclaimed, "Oh no! You have angered the Moon God by disturbing his reflection! He will surely curse you!"

Frightened, the elephant ran away and never returned to that forest. The rabbit's clever thinking had saved everyone.`,
        moral: "Intelligence and wisdom can overcome brute strength.",
        narrator: "Traditional",
        tags: ["Cleverness", "Animals", "Wisdom", "Courage"],
        difficulty: "Easy",
        ageGroup: "Children",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Indian Folktales",
        sourceUrl: null
      },
      {
        title: "The Tiger and the Brahmin",
        culture: "Indian",
        region: "Bengal",
        language: "Bengali",
        category: "Folk Tales",
        description: "A classic tale of how a clever jackal outsmarts both a tiger and a brahmin.",
        storyText: `A long time ago, a tiger was caught in a cage trap set by hunters. For days he remained trapped, growing hungrier and more desperate. One day, a Brahmin (a learned priest) walked by the cage.

The tiger pleaded, "O noble Brahmin, please open the cage and set me free. I am starving and will surely die."

The Brahmin was hesitant, saying, "But you are a tiger. If I free you, you will eat me."

The tiger promised, "I swear on my ancestors that I will not harm you. Please, have mercy."

Moved by compassion, the Brahmin opened the cage. Immediately, the tiger leaped out and grabbed the Brahmin. "Now I shall eat you, for I am starving!" the tiger said.

The Brahmin protested, "This is not fair! You promised not to harm me. Let us ask the first three things we meet to judge this matter."

They came across a pipal tree, a buffalo, and then a jackal. The tree and buffalo both said, "Humans are ungrateful. The tiger should eat the Brahmin."

Finally, they asked the jackal. The clever jackal pretended not to understand the situation. "Show me exactly where you were," the jackal said.

The tiger got back into the cage to demonstrate. "Was the cage door open or closed?" asked the jackal.

"Open," said the tiger, still in the cage.

The jackal quickly said, "Brahmin, close the door!" The Brahmin did so, trapping the tiger again. The jackal turned to the Brahmin and said, "Learn to be wiser about whom you trust."`,
        moral: "Be careful whom you trust; compassion must be tempered with wisdom.",
        narrator: "Traditional",
        tags: ["Cleverness", "Trust", "Animals", "Wisdom"],
        difficulty: "Easy",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Bengali Folktales",
        sourceUrl: null
      },
      {
        title: "The Birth of Ganesha",
        culture: "Indian",
        region: "All India",
        language: "Sanskrit",
        category: "Mythology",
        description: "The origin story of Lord Ganesha, the elephant-headed god of wisdom and remover of obstacles.",
        storyText: `Parvati, the consort of Lord Shiva, wished to take a bath. Not wanting to be disturbed, she created a boy from the turmeric paste she used for her bath and breathed life into him.

"Guard the door and let no one enter while I bathe," she instructed the boy. The boy stood faithfully at the door.

Meanwhile, Lord Shiva returned home after a long meditation. When he tried to enter, the boy stopped him, saying, "Mother has instructed me not to let anyone in."

Shiva, not knowing this was his wife's creation, became angry. He demanded entry, but the boy stood firm. Enraged by this defiance, Shiva cut off the boy's head with his trident.

When Parvati emerged from her bath and saw what had happened, she was devastated. Her grief turned to fury, and she threatened to destroy all creation.

To appease her, Shiva promised to bring the boy back to life. He sent his attendants to find the first living creature they encountered and bring back its head.

The attendants found an elephant, and they brought back its head. Shiva placed the elephant head on the boy's body and brought him back to life. He named the boy Ganesha and declared that Ganesha would be worshipped first before all other gods.

Since then, Ganesha is honored at the beginning of every important undertaking.`,
        moral: "Even in tragedy, new beginnings and blessings can emerge.",
        narrator: "Traditional",
        tags: ["Mythology", "Gods", "Creation", "Wisdom"],
        difficulty: "Medium",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Shiva Purana",
        sourceUrl: "https://en.wikipedia.org/wiki/Ganesha"
      },
      // African Stories
      {
        title: "How Anansi Brought Stories to the World",
        culture: "African",
        region: "West Africa",
        language: "Akan",
        category: "Anansi Stories",
        description: "The tale of how the spider Anansi won all the world's stories from Nyame, the Sky God.",
        storyText: `Long ago, all stories belonged to Nyame, the Sky God. They were kept safe in golden boxes at the edge of the sky. Anansi the spider, who was clever and ambitious, decided he wanted to own all the stories.

He went to Nyame and asked to buy the stories. Nyame laughed and said, "I will sell them to you, but the price is high. You must bring me three things: Mmoboro the hornet who stings, Mmoatia the fairy whom men never see, and Osebo the leopard with teeth like spears."

Anansi accepted the challenge. First, he filled a gourd with water and cut a plantain leaf to cover the top. He went to the hornets' nest and called out, "Is it raining? I think I feel rain!" The hornets said no, but Anansi argued that rain was coming. He offered them the gourd as shelter.

When the hornets flew into the gourd, Anansi quickly covered it with the leaf and took them to Nyame.

Next, Anansi carved a wooden doll and covered it with sticky gum. He placed the doll near the forest where the fairy played, with yams in the doll's lap. When the fairy took the yams, her hands got stuck to the gum doll. Anansi captured her and took her to Nyame.

Finally, Anansi dug a deep pit and covered it with branches. When Osebo the leopard fell in, Anansi offered to rescue him with his cobweb ladder. Once the leopard was out, Anansi trapped him and delivered him to Nyame.

Nyame was amazed. He said, "You are truly clever, Anansi. From this day forward, all stories belong to you. Share them wisely with the people of the earth."

And that is why stories are called "Anansi stories" in many parts of Africa.`,
        moral: "Cleverness and determination can achieve what seems impossible.",
        narrator: "Traditional Akan",
        tags: ["Trickster", "Spider", "Wisdom", "Stories"],
        difficulty: "Medium",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Akan Folklore",
        sourceUrl: null
      },
      {
        title: "The Lion's Whisker",
        culture: "African",
        region: "East Africa",
        language: "Amharic",
        category: "Folk Tales",
        description: "A story about patience, trust, and the journey of building love in a family.",
        storyText: `There was once a woman named Kisa who married a widower with a son. She tried to be a good mother to the boy, but he rejected her at every turn. The boy was still grieving his mother and would not accept Kisa's love.

Desperate, Kisa went to a wise old medicine man. "Please give me a potion that will make my stepson love me," she begged.

The medicine man listened and said, "I can make such a medicine, but I need one special ingredient: a whisker from a living lion."

Kisa was terrified, but her love for the boy was strong. She went to the place where lions were known to drink. Night after night, she brought meat and sat quietly, watching the lions from a distance.

Weeks passed. The lions grew accustomed to her presence. One particularly brave lion even ate the meat she left while she watched. Slowly, over many months, she gained his trust.

One night, while the lion ate peacefully, Kisa reached out with trembling hand and quickly plucked a single whisker. The lion barely noticed. She ran all the way to the medicine man, clutching the whisker.

"Here it is!" she said, breathless.

The medicine man took the whisker and threw it into the fire. "You don't need a potion," he said. "You have already learned what you need. You won the lion's trust through patience and consistency. Do the same with your stepson. Love cannot be forced; it must be earned through patience and understanding."

Kisa understood. She went home and applied the same patience with her stepson. Gradually, over time, the boy opened his heart to her, and they became a true family.`,
        moral: "Love and trust are earned through patience, not forced through magic.",
        narrator: "Traditional Ethiopian",
        tags: ["Family", "Patience", "Love", "Wisdom"],
        difficulty: "Medium",
        ageGroup: "Teens and Adults",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Ethiopian Folktales",
        sourceUrl: null
      },
      {
        title: "The Wise Old Man of the Mountain",
        culture: "African",
        region: "West Africa",
        language: "Yoruba",
        category: "Wisdom Tales",
        description: "A story about the value of wisdom over strength and the true meaning of respect.",
        storyText: `In a village at the foot of a great mountain, there lived an old man named Obi. He was neither strong nor wealthy, but he was known throughout the land for his wisdom.

One day, a young warrior named Ogun came to the village, boasting that he was the strongest man in the world. "I can defeat anyone in combat!" he declared. "I have no need for wisdom when I have strength!"

Obi said gently, "Strength is good, young man, but wisdom is better."

Ogun laughed. "Old man, I could crush you like an insect. What good is your wisdom against my muscles?"

Obi smiled. "Let us have a contest. If you can carry this basket up the mountain before sunset, you are the victor."

Ogun scoffed. "That's too easy!" He picked up the basket, which was filled with stones, and began climbing. But the stones were heavy, and the path was steep. By noon, he was exhausted and had to stop.

Meanwhile, Obi walked slowly up a different path. He carried nothing but a small bag of seeds. As he walked, he scattered them along the way.

When Ogun finally gave up and came down, he found Obi already at the top of the mountain, enjoying the view.

"How did you get there?" Ogun demanded.

"I took the longer path, but it was gentler," Obi explained. "And the seeds I planted will grow into trees that will make the path easier for future generations. True strength is not in lifting heavy burdens, but in making the journey easier for others."

Ogun understood at last and became Obi's student.`,
        moral: "Wisdom and foresight are more valuable than brute strength.",
        narrator: "Traditional Yoruba",
        tags: ["Wisdom", "Strength", "Humility", "Learning"],
        difficulty: "Easy",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Yoruba Oral Tradition",
        sourceUrl: null
      },
      // Native American Stories
      {
        title: "How the Coyote Stole Fire",
        culture: "Native American",
        region: "Pacific Northwest",
        language: "Chinook",
        category: "Creation Stories",
        description: "A tale of how Coyote brought fire to the people, helping them survive the cold.",
        storyText: `Long ago, before humans had fire, the world was cold and dark at night. The People huddled together for warmth, and their food was raw and hard to eat.

In those days, fire belonged only to the Fire Beings who lived on top of a great mountain. They guarded it jealously and would not share it with anyone.

Coyote was troubled by seeing the People suffer. He decided he would steal fire from the mountain top. He called his friends to help: Squirrel, Chipmunk, Frog, and Wood.

Coyote went up the mountain and distracted the Fire Beings with clever talk while his friends snuck past. But the Fire Beings discovered them and gave chase, throwing fire at them.

Squirrel caught a coal on her back, which is why squirrels have black stripes on their backs. She passed it to Chipmunk, who caught it in her hands, which is why chipmunks have black stripes on their backs. Chipmunk threw it to Frog, who swallowed the coal and escaped by jumping into a pond. That's why frogs have no tail and say "Kolah, kolah" - which means "I have it!"

Finally, Wood received the coal and hid it within himself. The Fire Beings could not get it back. Wood would carry fire and give it to anyone who rubbed two sticks together.

Coyote showed the People how to make fire by rubbing sticks. Since that day, fire has belonged to all the People, and they never forgot the sacrifice of Coyote's friends.`,
        moral: "Courage and cleverness can bring gifts that benefit all people.",
        narrator: "Traditional Chinook",
        tags: ["Fire", "Creation", "Animals", "Courage"],
        difficulty: "Medium",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Chinook Oral Tradition",
        sourceUrl: null
      },
      {
        title: "The Legend of the Dreamcatcher",
        culture: "Native American",
        region: "Great Lakes",
        language: "Ojibwe",
        category: "Spiritual",
        description: "The origin story of the dreamcatcher, woven by Spider Woman to protect children from bad dreams.",
        storyText: `Long ago, when the world was still young, the Spider Woman watched over the people. She took care of the children and the adults, but as the people spread across the land, she could not reach everyone.

Spider Woman spoke to the elders. "I cannot watch over all your children as they sleep. You must help me protect them."

She taught the mothers and grandmothers how to weave a special web. "Make a hoop from willow," she instructed, "and weave a web within it like mine. Hang it above where the children sleep."

"The web will catch the bad dreams, like a spider's web catches insects. The bad dreams will get tangled in the web and fade away with the morning light. But the good dreams will find the hole in the center and slide down the feather to the sleeping child."

The people did as Spider Woman taught them. They decorated the dreamcatchers with feathers and beads, each one unique. And it worked - the children slept peacefully, and the good dreams brought them wisdom and guidance.

To this day, the Ojibwe people and many others hang dreamcatchers to protect their sleepers and catch the good dreams from the night sky.`,
        moral: "Protection and love can be woven into physical forms to care for those we love.",
        narrator: "Traditional Ojibwe",
        tags: ["Dreams", "Protection", "Spider", "Spiritual"],
        difficulty: "Easy",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Ojibwe Tradition",
        sourceUrl: null
      },
      // Asian Stories
      {
        title: "The Crane Wife",
        culture: "Asian",
        region: "Japan",
        language: "Japanese",
        category: "Fairy Tales",
        description: "A touching story about gratitude, trust, and the danger of breaking a sacred promise.",
        storyText: `Once upon a time, a poor but kind woodcutter lived alone in the mountains. One winter day, he found a crane caught in a trap. Its wing was injured, and it looked at him with pleading eyes.

The woodcutter freed the crane and nursed it back to health. When the crane could fly again, it circled him three times and flew away toward the sunset.

A few days later, a beautiful young woman appeared at his door. She was lost and asked for shelter. The woodcutter, being kind, agreed. She stayed and eventually became his wife.

Though they had little money, they were happy. One day, the wife said she could weave beautiful cloth that they could sell. But she made him promise never to watch her while she worked.

She went into a room and wove for seven days. When she emerged, she held the most beautiful cloth anyone had ever seen. They sold it for a fortune. But the money soon ran out, so she agreed to weave again.

This time, she wove for seven more days. The woodcutter, curious and worried about his wife's growing weakness, peeked through a crack in the door. He was shocked to see not his wife, but the crane he had saved, plucking its own feathers to weave into the cloth.

When she emerged, she was pale and thin. She knew he had broken his promise. "I am the crane you saved," she said. "I stayed to repay your kindness. But now that you have seen my true form, I must leave."

She transformed back into a crane and flew away, leaving the woodcutter alone with his regret.`,
        moral: "Gratitude is precious, and promises should never be broken.",
        narrator: "Traditional Japanese",
        tags: ["Gratitude", "Promises", "Transformation", "Love"],
        difficulty: "Medium",
        ageGroup: "Teens and Adults",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Japanese Folktales",
        sourceUrl: null
      },
      {
        title: "The Stonecutter",
        culture: "Asian",
        region: "China",
        language: "Mandarin",
        category: "Fairy Tales",
        description: "A story about ambition, power, and finding contentment in one's true nature.",
        storyText: `There was once a stonecutter who worked hard every day, cutting stone from the mountain. One day, as he sweated under the hot sun, he saw a wealthy merchant pass by in a comfortable carriage.

"I wish I were that merchant," the stonecutter thought. "He has wealth and comfort."

A spirit heard his wish and granted it. The stonecutter became the merchant, with fine clothes and a grand house. He was happy until he saw a prince pass by, surrounded by guards and bowed to by all.

"I wish I were a prince," he thought. "He has power and respect."

Again the spirit granted his wish. He became a prince, living in a palace with servants. But one day, he saw the sun scorching the crops in the fields. Even princes must bow to the sun's power.

"I wish I were the sun," he thought. "Nothing is more powerful."

He became the sun, shining down on the earth. He was powerful until a cloud blocked his rays. The cloud was more powerful.

"I wish I were a cloud," he thought, and became one. He rained on the earth, but the mountain stood firm against his storms.

"The mountain is the strongest of all," he thought, and became the mountain. Nothing could move him. Until one day, he felt something chipping away at his base - a stonecutter with a chisel.

"Ah," he realized, "the stonecutter can shape even the mountain." He wished to be himself again.

The spirit granted his final wish, and he returned to his life as a stonecutter, now content with who he was.`,
        moral: "True contentment comes from accepting who you are, not from seeking power over others.",
        narrator: "Traditional Chinese",
        tags: ["Ambition", "Contentment", "Power", "Wisdom"],
        difficulty: "Medium",
        ageGroup: "Teens and Adults",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Chinese Folktales",
        sourceUrl: null
      },
      // Pacific Stories
      {
        title: "Maui and the Sun",
        culture: "Pacific",
        region: "New Zealand",
        language: "Maori",
        category: "Hero Myths",
        description: "The tale of how the demigod Maui slowed the sun to give people longer days.",
        storyText: `In the early days, the sun crossed the sky too quickly. The days were short, and the people did not have enough time to cook their food or do their work.

Maui, the clever demigod, decided to slow the sun. His brothers laughed at him. "No one can catch the sun!" they said.

But Maui was determined. He and his brothers went to the pit where the sun rose each morning. They took with them strong ropes made from their sister's hair.

As the sun rose, Maui and his brothers threw the ropes around it. The sun struggled and burned, but they held on tight. The ropes smoked and sizzled, but did not break.

"Let me go!" the sun cried. "Why do you capture me?"

"You travel too fast across the sky," Maui said. "Give us longer days so our people can live properly."

The sun agreed, and Maui made him promise to travel more slowly. From that day forward, the sun moved at a gentler pace across the sky, giving the people of the Pacific longer days to work and play.

You can still see the marks of the ropes on the sun's surface if you look carefully.`,
        moral: "Courage and determination can change even the mightiest forces of nature.",
        narrator: "Traditional Maori",
        tags: ["Hero", "Sun", "Courage", "Creation"],
        difficulty: "Easy",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Maori Mythology",
        sourceUrl: null
      },
      {
        title: "The First Rainbow",
        culture: "Pacific",
        region: "Hawaii",
        language: "Hawaiian",
        category: "Creation Myths",
        description: "How the goddess Anuenue brought the first rainbow to Hawaii as a bridge between heaven and earth.",
        storyText: `In the ancient days of Hawaii, when the gods walked among the people, there was a beautiful goddess named Anuenue. She was the goddess of rainbows, and she lived in the clouds with her parents, Kane and Lono.

Anuenue loved to watch the people below, but she could not visit them because the path between heaven and earth was too steep and dangerous. She wept with longing, and her tears became the gentle rain of Hawaii.

Her father, Kane, saw her sadness and said, "I will create a bridge for you to visit the earth." He took all the colors of the flowers - the red of the lehua, the yellow of the ilima, the green of the ti leaf, and the blue of the ocean.

He wove these colors together into a great arc that stretched from the clouds to the mountains. "This is your pathway, my daughter. Walk down it whenever you wish to visit the people."

Anuenue was overjoyed. She danced down the rainbow bridge, her feet barely touching the colors. When she reached the earth, the people were amazed by her beauty and the gift of the rainbow.

To this day, when a rainbow appears in the Hawaiian sky, the people say, "Anuenue is visiting us again." And they know that blessings follow the rainbow's path.`,
        moral: "Love finds ways to bridge even the greatest distances.",
        narrator: "Traditional Hawaiian",
        tags: ["Rainbow", "Creation", "Love", "Gods"],
        difficulty: "Easy",
        ageGroup: "All Ages",
        submitterName: "Cultural Heritage Archive",
        submitterEmail: "archive@folkloregpt.com",
        permissions: true,
        attribution: true,
        respectfulUse: true,
        status: "approved",
        submissionType: "text",
        source: "Hawaiian Mythology",
        sourceUrl: null
      }
    ];

    try {
      // Clear existing stories (optional - remove this if you want to keep existing)
      // await Story.deleteMany({ source: { $exists: true } });

      // Check if stories already exist to avoid duplicates
      const existingCount = await Story.countDocuments({ source: { $exists: true } });

      if (existingCount > 0) {
        console.log(`ℹ️ ${existingCount} cultural stories already exist. Skipping seed.`);
        return { success: true, message: 'Stories already seeded', count: existingCount };
      }

      // Insert all stories
      const result = await Story.insertMany(stories);
      console.log(`✅ Successfully seeded ${result.length} cultural stories`);

      return {
        success: true,
        message: `Seeded ${result.length} stories`,
        count: result.length,
        cultures: [...new Set(stories.map(s => s.culture))]
      };
    } catch (error) {
      console.error('❌ Error seeding cultural stories:', error);
      return { success: false, message: error.message, error: error.message };
    }
  }

  /**
   * Get stories by culture/region
   */
  async getStoriesByCulture(culture, options = {}) {
    const { limit = 20, page = 1 } = options;

    try {
      const stories = await Story.find({
        culture: { $regex: culture, $options: 'i' },
        status: 'approved'
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ submittedAt: -1 });

      const total = await Story.countDocuments({
        culture: { $regex: culture, $options: 'i' },
        status: 'approved'
      });

      return {
        success: true,
        stories,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasMore: page * limit < total
        }
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Search stories by keyword
   */
  async searchStories(query, options = {}) {
    const { limit = 20, page = 1 } = options;

    try {
      const stories = await Story.find({
        $and: [
          { status: 'approved' },
          {
            $or: [
              { title: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { storyText: { $regex: query, $options: 'i' } },
              { culture: { $regex: query, $options: 'i' } },
              { region: { $regex: query, $options: 'i' } },
              { tags: { $in: [new RegExp(query, 'i')] } }
            ]
          }
        ]
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ submittedAt: -1 });

      const total = await Story.countDocuments({
        $and: [
          { status: 'approved' },
          {
            $or: [
              { title: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { storyText: { $regex: query, $options: 'i' } },
              { culture: { $regex: query, $options: 'i' } },
              { region: { $regex: query, $options: 'i' } }
            ]
          }
        ]
      });

      return {
        success: true,
        stories,
        query,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasMore: page * limit < total
        }
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get available cultures and their story counts
   */
  async getCultures() {
    try {
      const cultures = await Story.aggregate([
        { $match: { status: 'approved' } },
        {
          $group: {
            _id: '$culture',
            count: { $sum: 1 },
            regions: { $addToSet: '$region' },
            languages: { $addToSet: '$language' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return {
        success: true,
        cultures: cultures.map(c => ({
          name: c._id,
          storyCount: c.count,
          regions: c.regions,
          languages: c.languages
        }))
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get featured collections
   */
  async getFeaturedCollections() {
    try {
      const collections = [
        {
          id: 'creation-myths',
          title: 'Creation Myths',
          description: 'Stories of how the world began from different cultures',
          stories: await Story.find({
            category: { $in: ['Creation Myth', 'Creation Stories'] },
            status: 'approved'
          }).limit(6)
        },
        {
          id: 'animal-tales',
          title: 'Animal Tales',
          description: 'Wisdom stories featuring animals as teachers',
          stories: await Story.find({
            $or: [
              { category: { $in: ['Animal Story', 'Panchatantra'] } },
              { tags: { $in: ['Animals'] } }
            ],
            status: 'approved'
          }).limit(6)
        },
        {
          id: 'trickster-stories',
          title: 'Trickster Tales',
          description: 'Clever characters who outwit the powerful',
          stories: await Story.find({
            $or: [
              { tags: { $in: ['Trickster', 'Cleverness'] } },
              { category: 'Anansi Stories' }
            ],
            status: 'approved'
          }).limit(6)
        },
        {
          id: 'wisdom-teachings',
          title: 'Wisdom Teachings',
          description: 'Stories that teach important life lessons',
          stories: await Story.find({
            $or: [
              { category: { $in: ['Wisdom Tales', 'Folk Tales'] } },
              { tags: { $in: ['Wisdom'] } }
            ],
            status: 'approved'
          }).limit(6)
        }
      ];

      return { success: true, collections };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export default new StoryAggregator();
