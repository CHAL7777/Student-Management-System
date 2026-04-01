import { redirectToDashboardHome } from "@/lib/auth";

export default async function DashboardIndexPage() {
  await redirectToDashboardHome();
}
