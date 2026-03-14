import { Prisma } from "@prisma/client";
import { getCurrentWeekKey } from "./gamification";

const GHOST_NAMES = [
  { first: "Alex", last: "Chen" }, { first: "Sofia", last: "Garcia" },
  { first: "Yuki", last: "Tanaka" }, { first: "Liam", last: "Smith" },
  { first: "Amara", last: "Okonkwo" }, { first: "Mateo", last: "Silva" },
  { first: "Elena", last: "Petrov" }, { first: "Omar", last: "Hassan" },
  { first: "Chloe", last: "Dupont" }, { first: "Ji-woo", last: "Kim" },
  { first: "Arjun", last: "Patel" }, { first: "Isabella", last: "Rossi" },
  { first: "Noah", last: "Müller" }, { first: "Zara", last: "Khan" },
  { first: "Lucas", last: "Santos" }, { first: "Anya", last: "Sokolov" },
  { first: "Kai", last: "Sato" }, { first: "Lina", last: "Hansen" },
  { first: "Diego", last: "Lopez" }, { first: "Sana", last: "Ito" },
  { first: "瑞", last: "张" }, { first: "Fatima", last: "Al-Sayed" },
  { first: "Hiroshi", last: "Yamamoto" }, { first: "Camila", last: "Rodriguez" },
  { first: "Niklas", last: "Sjöberg" }
];

const HAIR_STYLES = ["danny", "doug", "normal", "elvis", "funky", "pomp", "shaved", "turban"];
const EYE_SHAPES = ["round", "oval", "squint", "heart", "wink"];
const CLOTHES = ["shirt", "hoodie", "overall", "vNeck"];

/**
 * Generates a random DiceBear Micah configuration.
 */
function generateRandomAvatar() {
  return {
    hair: HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)],
    baseColor: ["#F9C9B6", "#AC6651", "#77311D"][Math.floor(Math.random() * 3)],
    hairColor: ["#000000", "#4B2412", "#A55728", "#B58143"][Math.floor(Math.random() * 4)],
    eyes: EYE_SHAPES[Math.floor(Math.random() * EYE_SHAPES.length)],
    clothing: CLOTHES[Math.floor(Math.random() * CLOTHES.length)],
    clothingColor: ["#1CB0F6", "#FF4B4B", "#FF9600", "#7851A9"][Math.floor(Math.random() * 4)]
  };
}

/**
 * Seeds a league group with competitive ghosts.
 */
export async function seedLeagueGroupWithGhosts(
  groupId: string,
  tier: number,
  tx: Prisma.TransactionClient
) {
  const weekKey = getCurrentWeekKey();
  const ghostCount = 20 + Math.floor(Math.random() * 5); // 20-25 ghosts

  // Shuffle names
  const shuffledNames = [...GHOST_NAMES].sort(() => 0.5 - Math.random());
  const selectedNames = shuffledNames.slice(0, ghostCount);

  for (const name of selectedNames) {
    // Create actual User records for ghosts (marked as SUSPENDED or a special flag if we had one)
    // For now, we'll just create users with a unique ghost email
    const ghostId = `ghost_${groupId}_${name.first.toLowerCase()}_${Math.random().toString(36).slice(2, 7)}`;
    const email = `${ghostId}@ghost.omniilearn.com`;

    const user = await tx.user.create({
      data: {
        id: ghostId,
        email,
        passwordHash: "GHOST_ACCOUNT", // Indicated as ghost
        firstName: name.first,
        lastName: name.last,
        status: 'SUSPENDED', // Ghosts are technical users
        studentProfile: {
          create: {
            avatarConfig: generateRandomAvatar() as any,
            totalXp: 0
          }
        }
      }
    });

    // Randomize XP based on tier and day of the week
    // Monday = 1, Sunday = 7
    const dayOfWeek = new Date().getUTCDay() || 7;
    const baseDailyXP = 15 + (tier * 5);
    const totalGhostXP = Math.floor(Math.random() * (baseDailyXP * dayOfWeek * 1.5));

    await tx.userLeague.create({
      data: {
        userId: user.id,
        leagueGroupId: groupId,
        weekKey,
        xpEarned: totalGhostXP
      }
    });
  }

  // Update final member count
  await tx.leagueGroup.update({
    where: { id: groupId },
    data: { memberCount: { increment: ghostCount } }
  });
}
