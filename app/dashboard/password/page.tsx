import { redirect } from "next/navigation";

import { Alert } from "@/components/ui/Alert";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth";
import { changeOwnPassword } from "@/lib/queries";
import { ROLE_LABELS } from "@/utils/roles";

interface PasswordPageProps {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
}

export default async function PasswordPage({ searchParams }: PasswordPageProps) {
  const [profile, resolvedSearchParams] = await Promise.all([
    requireRole(["teacher", "student"]),
    searchParams ?? Promise.resolve({ error: undefined, success: undefined })
  ]);

  const params = resolvedSearchParams as { error?: string; success?: string };

  async function changePasswordAction(formData: FormData) {
    "use server";

    await requireRole(["teacher", "student"]);

    const currentPassword = String(formData.get("current_password") ?? "");
    const newPassword = String(formData.get("new_password") ?? "");
    const confirmPassword = String(formData.get("confirm_password") ?? "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      redirect("/dashboard/password?error=Fill%20in%20all%20password%20fields");
    }

    if (newPassword.length < 6) {
      redirect("/dashboard/password?error=New%20password%20must%20be%20at%20least%206%20characters");
    }

    if (newPassword !== confirmPassword) {
      redirect("/dashboard/password?error=New%20password%20and%20confirmation%20do%20not%20match");
    }

    if (currentPassword === newPassword) {
      redirect("/dashboard/password?error=Choose%20a%20different%20new%20password");
    }

    try {
      await changeOwnPassword(currentPassword, newPassword);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update password";
      redirect(`/dashboard/password?error=${encodeURIComponent(message)}`);
    }

    redirect("/dashboard/password?success=Password%20updated%20successfully");
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref={`/dashboard/${profile.role}`} label="Back to dashboard" />

      <PageHeader
        description={`${ROLE_LABELS[profile.role]} accounts can replace the temporary password with a personal one at any time.`}
        eyebrow="Account Security"
        title="Change password"
      />

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">Update credentials</h2>
          <p className="text-sm text-slate-500">
            Choose a strong password you can remember and keep your account secure.
          </p>
        </CardHeader>
        <CardContent>
          <form action={changePasswordAction} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Current password"
                name="current_password"
                type="password"
                placeholder="Enter current password"
                minLength={6}
                required
              />
              <Input
                label="New password"
                name="new_password"
                type="password"
                placeholder="Enter new password"
                minLength={6}
                required
              />
            </div>

            <Input
              label="Confirm new password"
              name="confirm_password"
              type="password"
              placeholder="Re-enter new password"
              minLength={6}
              required
            />

            {params.error ? <Alert variant="danger">{params.error}</Alert> : null}

            {params.success ? <Alert variant="success">{params.success}</Alert> : null}

            <div className="flex justify-end">
              <Button type="submit" variant="secondary">
                Update password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
