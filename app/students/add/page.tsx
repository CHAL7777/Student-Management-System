import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { StudentForm } from "@/components/forms/StudentForm";
import { BackButton } from "@/components/ui/BackButton";
import { requireRole } from "@/lib/auth";
import { createStudent, listClasses } from "@/lib/queries";
import { toOptions } from "@/utils/helpers";

export default async function AddStudentPage() {
  await requireRole(["admin"]);
  const classes = await listClasses();

  async function createStudentAction(formData: FormData) {
    "use server";

    await requireRole(["admin"]);
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

    revalidatePath("/students");
    redirect("/students");
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/students" label="Back to students" />
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Add student</h2>
        <p className="text-slate-500">
          Create a new student record, assign the login ID, and issue a temporary password.
        </p>
      </div>
      <StudentForm action={createStudentAction} classOptions={toOptions(classes, "class_name", "class_id")} />
    </section>
  );
}
