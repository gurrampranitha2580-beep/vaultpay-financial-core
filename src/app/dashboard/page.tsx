
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth/get-profile";
export const instant = false;
export default async function DashboardRedirect() {
  const result = await getCurrentUserProfile();

  if (!result) {
    redirect("/login");
  }

  if (result.profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (result.profile.role === "client") {
    redirect("/client/dashboard");
  }

  redirect("/403");
}
