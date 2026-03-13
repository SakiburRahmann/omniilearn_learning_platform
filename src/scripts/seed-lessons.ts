import { PrismaClient, Difficulty, CourseStatus, LessonType, LessonStatus } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// @ts-ignore
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding lessons data...');

  // Get the first admin user, or create a dummy one if none exists
  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@omniilearn.com',
        passwordHash: 'dummy_hash',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        status: 'VERIFIED',
      }
    });
  }

  // Create a course
  const course = await prisma.course.upsert({
    where: { slug: 'language-basics' },
    update: {},
    create: {
      slug: 'language-basics',
      title: 'Language Basics',
      subtitle: 'Start your journey here',
      description: 'Learn the fundamental building blocks of the language.',
      category: 'languages',
      difficulty: Difficulty.BEGINNER,
      status: CourseStatus.PUBLISHED,
      createdByAdminId: admin.id,
      whatYouLearn: ['Basic vocabulary', 'Simple grammar', 'Common phrases'],
    }
  });

  // Create Unit 1
  const unit1 = await prisma.unit.create({
    data: {
      courseId: course.id,
      title: 'Unit 1: The Basics',
      position: 1,
    }
  });

  // Create Lessons for Unit 1
  const lessonsData = [
    { title: 'Introduction to Sounds', type: LessonType.READING, position: 1, estimatedMinutes: 5 },
    { title: 'Basic Greetings', type: LessonType.READING, position: 2, estimatedMinutes: 10 },
    { title: 'Numbers 1-10', type: LessonType.EXERCISE, position: 3, estimatedMinutes: 15 },
    { title: 'Simple Sentences', type: LessonType.READING, position: 4, estimatedMinutes: 10 },
    { title: 'Unit 1 Quiz', type: LessonType.QUIZ, position: 5, estimatedMinutes: 20 },
  ];

  for (const lData of lessonsData) {
    const lesson = await prisma.lesson.create({
      data: {
        unitId: unit1.id,
        courseId: course.id,
        title: lData.title,
        type: lData.type,
        position: lData.position,
        estimatedMinutes: lData.estimatedMinutes,
        status: LessonStatus.PUBLISHED,
      }
    });

    // Create lesson content
    await prisma.lessonContent.create({
      data: {
        lessonId: lesson.id,
        content: {
          blocks: [
            { type: 'heading', value: lData.title },
            { type: 'text', value: `Welcome to ${lData.title}. This is the content body that you will read to learn and progress in your language journey. It will contain vocabulary, grammar notes, and cultural tips.` }
          ]
        }
      }
    });
  }

  // Create Unit 2
  const unit2 = await prisma.unit.create({
    data: {
      courseId: course.id,
      title: 'Unit 2: Daily Life',
      position: 2,
    }
  });

  const unit2LessonsData = [
    { title: 'Food & Drink', type: LessonType.READING, position: 1, estimatedMinutes: 10 },
    { title: 'Ordering in a Restaurant', type: LessonType.EXERCISE, position: 2, estimatedMinutes: 15 },
    { title: 'Directions', type: LessonType.READING, position: 3, estimatedMinutes: 10 },
  ];

  for (const lData of unit2LessonsData) {
    const lesson = await prisma.lesson.create({
      data: {
        unitId: unit2.id,
        courseId: course.id,
        title: lData.title,
        type: lData.type,
        position: lData.position,
        estimatedMinutes: lData.estimatedMinutes,
        status: LessonStatus.PUBLISHED,
      }
    });

    await prisma.lessonContent.create({
      data: {
        lessonId: lesson.id,
        content: {
          blocks: [
            { type: 'heading', value: lData.title },
            { type: 'text', value: `This is the content for ${lData.title}. You will learn how to interact in daily situations relevant to this topic.` }
          ]
        }
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
