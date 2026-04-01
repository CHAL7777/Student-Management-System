import { redirect } from "next/navigation";

import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requireRole } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
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

    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      redirect("/login");
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

    if (verifyError) {
      redirect("/dashboard/password?error=Current%20password%20is%20incorrect");
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      redirect(`/dashboard/password?error=${encodeURIComponent(updateError.message)}`);
    }

    redirect("/dashboard/password?success=Password%20updated%20successfully");
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref={`/dashboard/${profile.role}`} label="Back to dashboard" />

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">Change password</h2>
        <p className="mt-2 text-slate-500">
          {ROLE_LABELS[profile.role]} accounts can replace the temporary password with a personal one
          at any time.
        </p>
      </div>

      <form
        action={changePasswordAction}
        className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
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

        {params.error ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{params.error}</p>
        ) : null}

        {params.success ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {params.success}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" variant="secondary">
            Update password
          </Button>
        </div>
      </form>
    </section>
  );
}
