
import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth/get-profile";

type UserRole = "admin" | "client";

export async function requireRole(role: UserRole) {
  const result = await getCurrentUserProfile();

  if (!result) {
    redirect("/login");
  }

  if (result.profile.role !== role) {
    redirect("/403");
  }

  return result;
}
