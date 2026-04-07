import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { StudentForm } from "@/components/forms/StudentForm";
import { Alert } from "@/components/ui/Alert";
import { BackButton } from "@/components/ui/BackButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth";
import { createStudent, listClasses } from "@/lib/queries";
import { toOptions } from "@/utils/helpers";

interface AddStudentPageProps {
  searchParams?: Promise<{
    error?: string;
  }>;
}

export default async function AddStudentPage({ searchParams }: AddStudentPageProps) {
  await requireRole(["admin"]);
  const [classes, resolvedSearchParams] = await Promise.all([
    listClasses(),
    searchParams ?? Promise.resolve({ error: undefined })
  ]);
  const params = resolvedSearchParams as { error?: string };

  async function createStudentAction(formData: FormData) {
    "use server";

    await requireRole(["admin"]);

    try {
      await createStudent({
        student_id: String(formData.get("student_id") ?? "").trim(),
        name: String(formData.get("name") ?? "").trim(),
        gender: String(formData.get("gender") ?? "male") as "male" | "female" | "other",
        grade: String(formData.get("grade") ?? "").trim(),
        academic_year: String(formData.get("academic_year") ?? "").trim(),
        semester: String(formData.get("semester") ?? "").trim(),
        class_id: String(formData.get("class_id") ?? ""),
        temporary_password: String(formData.get("temporary_password") ?? "")
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create student";
      redirect(`/students/add?error=${encodeURIComponent(message)}`);
    }

    revalidatePath("/students");
    redirect("/students");
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/students" label="Back to students" />
      <PageHeader
        description="Create a new student record, assign the institutional ID, and issue a temporary password."
        eyebrow="Student Management"
        title="Add student"
      />
      {params.error ? <Alert variant="danger">{params.error}</Alert> : null}
      <StudentForm action={createStudentAction} classOptions={toOptions(classes, "class_name", "class_id")} />
    </section>
  );
}
