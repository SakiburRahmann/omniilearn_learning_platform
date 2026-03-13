import { db } from "@/lib/prisma";
import { type User } from "@supabase/supabase-js";

/**
 * Ensures a Supabase user is correctly synchronized with the Prisma database.
 * This handles:
 * 1. Email-keyed user lookup (resolves ID mismatches)
 * 2. Automatic StudentProfile creation
 * 3. Atomic synchronization of metadata (names, status)
 * 
 * @param supabaseUser The user object from Supabase Auth
 * @returns The synchronized Prisma User object
 */
export async function ensureUserSynced(supabaseUser: User) {
  const email = supabaseUser.email;
  if (!email) throw new Error("User email is required for synchronization");

  // Perform atomic sync
  const user = await db.user.upsert({
    where: { email },
    create: {
      id: supabaseUser.id,
      email: email,
      firstName: supabaseUser.user_metadata?.first_name || "Student",
      lastName: supabaseUser.user_metadata?.last_name || "",
      passwordHash: "SUPABASE_AUTH",
      status: "VERIFIED",
      emailVerified: true,
      studentProfile: {
        create: {
          totalXp: 0,
          currentStreak: 0,
          heartsCurrent: 5,
        }
      }
    },
    update: {
      // Standardize ID if it was previously a CUID but we now have a Supabase ID
      // Note: We don't update ID here to avoid breaking foreign keys, 
      // but the lookup is always by email now for stability.
      firstName: supabaseUser.user_metadata?.first_name || undefined,
      lastName: supabaseUser.user_metadata?.last_name || undefined,
      emailVerified: true,
      status: "VERIFIED",
    },
    include: {
      studentProfile: true
    }
  });

  // Self-healing: Ensure StudentProfile exists even if User existed without one
  if (!user.studentProfile) {
    await db.studentProfile.create({
      data: {
        userId: user.id,
        totalXp: 0,
        currentStreak: 0,
        heartsCurrent: 5,
      }
    });
    // Re-fetch with profile
    return await db.user.findUniqueOrThrow({
      where: { id: user.id },
      include: { studentProfile: true }
    });
  }

  return user;
}
