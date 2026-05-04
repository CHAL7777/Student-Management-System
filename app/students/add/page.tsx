import { revalidatePath } from "next/cache";

import { StudentForm, type StudentFormActionState } from "@/components/forms/StudentForm";
import { BackButton } from "@/components/ui/BackButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth";
import { createStudent, listClasses } from "@/lib/queries";
import { toOptions } from "@/utils/helpers";

export default async function AddStudentPage() {
  await requireRole(["admin"]);
  const classes = await listClasses();

  async function createStudentAction(
    _state: StudentFormActionState,
    formData: FormData
  ): Promise<StudentFormActionState> {
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
      return {
        status: "error",
        message,
        fieldErrors: {}
      };
    }

    revalidatePath("/students");
    revalidatePath("/reports");
    revalidatePath("/dashboard/admin");

    return {
      status: "success",
      message: "Student record and login were created successfully.",
      fieldErrors: {}
    };
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/students" label="Back to students" />
      <PageHeader
        description="Register a student with academic placement, class assignment, and an onboarding-ready access account."
        eyebrow="Student Management"
        title="Create student profile"
      />
      <StudentForm action={createStudentAction} classOptions={toOptions(classes, "class_name", "class_id")} />
    </section>
  );
}
