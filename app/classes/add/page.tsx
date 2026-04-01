import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ClassForm } from "@/components/forms/ClassForm";
import { Alert } from "@/components/ui/Alert";
import { BackButton } from "@/components/ui/BackButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth";
import { createClass, listTeachers } from "@/lib/queries";

interface AddClassPageProps {
  searchParams?: Promise<{
    error?: string;
  }>;
}

export default async function AddClassPage({ searchParams }: AddClassPageProps) {
  await requireRole(["admin"]);
  const [teachers, resolvedSearchParams] = await Promise.all([
    listTeachers(),
    searchParams ?? Promise.resolve({ error: undefined })
  ]);
  const params = resolvedSearchParams as { error?: string };

  async function createClassAction(formData: FormData) {
    "use server";

    await requireRole(["admin"]);

    try {
      await createClass({
        class_name: String(formData.get("class_name") ?? ""),
        homeroom_teacher_id: String(formData.get("homeroom_teacher_id") ?? "")
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create class";
      redirect(`/classes/add?error=${encodeURIComponent(message)}`);
    }

    revalidatePath("/classes");
    redirect("/classes");
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/classes" label="Back to classes" />
      <PageHeader
        description="Create class groups and assign homeroom ownership when available."
        eyebrow="Class Structure"
        title="Add class"
      />
      {params.error ? <Alert variant="danger">{params.error}</Alert> : null}
      <ClassForm
        action={createClassAction}
        teacherOptions={teachers.map((teacher) => ({
          label: `${teacher.name} (${teacher.teacher_id})`,
          value: teacher.teacher_id
        }))}
      />
    </section>
  );
}
