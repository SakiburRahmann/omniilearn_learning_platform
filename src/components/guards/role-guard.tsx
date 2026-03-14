"use client";

import { api } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface RoleGuardProps {
  allowed: ("STUDENT" | "COURSE_CREATOR" | "ADMIN" | "DEVELOPER")[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Client-side role guard. Checks the user's role via the getProfile query
 * and redirects unauthorized users to their correct portal.
 */
export function RoleGuard({ allowed, children, fallback }: RoleGuardProps) {
  const router = useRouter();
  const { data: profile, isLoading } = api.user.getProfile.useQuery(undefined) as any;

  useEffect(() => {
    if (isLoading || !profile) return;

    const role: string = profile.role;
    if (!allowed.includes(role as any)) {
      // Redirect to the correct portal based on role
      switch (role) {
        case "DEVELOPER":
          router.replace("/dev");
          break;
        case "ADMIN":
          router.replace("/admin");
          break;
        case "COURSE_CREATOR":
          router.replace("/creator");
          break;
        default:
          router.replace("/dashboard");
      }
    }
  }, [profile, isLoading, allowed, router]);

  if (isLoading) {
    return (
      fallback ?? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )
    );
  }

  if (!profile) return null;

  const role: string = profile.role;
  if (!allowed.includes(role as any)) return null;

  return <>{children}</>;
}
