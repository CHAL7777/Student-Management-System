import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ClassForm } from "@/components/forms/ClassForm";
import { BackButton } from "@/components/ui/BackButton";
import { requireRole } from "@/lib/auth";
import { createClass, listTeachers } from "@/lib/queries";

export default async function AddClassPage() {
  await requireRole(["admin"]);
  const teachers = await listTeachers();

  async function createClassAction(formData: FormData) {
    "use server";

    await requireRole(["admin"]);
    await createClass({
      class_name: String(formData.get("class_name") ?? ""),
      homeroom_teacher_id: String(formData.get("homeroom_teacher_id") ?? "")
    });

    revalidatePath("/classes");
    redirect("/classes");
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/classes" label="Back to classes" />
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Add class</h2>
        <p className="text-slate-500">Create class groups and assign homeroom ownership when available.</p>
      </div>
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
