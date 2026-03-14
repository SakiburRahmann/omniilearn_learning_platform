import { PrismaClient, QuestType } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log('Seed: Starting Daily Quests templates...');
  
  const quests: { id: string; title: string; description: string; type: QuestType; targetValue: number; xpReward: number; }[] = [
    {
      id: "the-xp-grind",
      title: "The XP Grind",
      description: "Earn 50 XP today",
      type: QuestType.XP_GAIN,
      targetValue: 50,
      xpReward: 20
    },
    {
      id: "lesson-master",
      title: "Lesson Master",
      description: "Complete 3 lessons",
      type: QuestType.LESSON_COMPLETE,
      targetValue: 3,
      xpReward: 15
    },
    {
      id: "unit-conqueror",
      title: "Unit Conqueror",
      description: "Complete 1 full unit",
      type: QuestType.UNIT_COMPLETE,
      targetValue: 1,
      xpReward: 50
    }
  ];

  for (const q of quests) {
    try {
      await db.dailyQuest.upsert({
        where: { id: q.id },
        update: q,
        create: q
      });
    } catch (err: any) {
      console.error(`Failed to seed quest ${q.title}:`, err.message);
    }
  }

  console.log('Seed: Daily Quests templates seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
