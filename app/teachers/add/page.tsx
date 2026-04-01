import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { TeacherForm } from "@/components/forms/TeacherForm";
import { Alert } from "@/components/ui/Alert";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth";
import { createTeacher, listClasses, listSubjects } from "@/lib/queries";
import { toOptions } from "@/utils/helpers";

interface AddTeacherPageProps {
  searchParams?: Promise<{
    error?: string;
  }>;
}

export default async function AddTeacherPage({ searchParams }: AddTeacherPageProps) {
  await requireRole(["admin"]);
  const [subjects, classes, resolvedSearchParams] = await Promise.all([
    listSubjects(),
    listClasses(),
    searchParams ?? Promise.resolve({ error: undefined })
  ]);
  const params = resolvedSearchParams as { error?: string };

  async function createTeacherAction(formData: FormData) {
    "use server";

    await requireRole(["admin"]);

    try {
      await createTeacher({
        teacher_id: String(formData.get("teacher_id") ?? "").trim(),
        name: String(formData.get("name") ?? "").trim(),
        subject_id: String(formData.get("subject_id") ?? ""),
        class_ids: formData
          .getAll("class_ids")
          .map((value) => String(value))
          .filter(Boolean),
        temporary_password: String(formData.get("temporary_password") ?? "")
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create teacher";
      redirect(`/teachers/add?error=${encodeURIComponent(message)}`);
    }

    revalidatePath("/teachers");
    redirect("/teachers");
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/teachers" label="Back to teachers" />
      <PageHeader
        description="Create a teacher, assign the teaching subject, and issue a temporary password for first login."
        eyebrow="Teaching Staff"
        title="Add teacher"
      />

            {params.error ? <Alert variant="danger">{params.error}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <TeacherForm
          action={createTeacherAction}
          classOptions={toOptions(classes, "class_name", "class_id")}
          subjectOptions={toOptions(subjects, "subject_name", "subject_id")}
        />

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">Need a new subject?</h3>
            <p className="mt-1 text-sm text-slate-500">
              Add the subject first, then come back and assign it to the teacher.
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/subjects/add">
              <Button variant="ghost">Add subject</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
