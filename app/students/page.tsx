import { revalidatePath } from "next/cache";

import { StudentsDirectory } from "@/components/students/StudentsDirectory";
import { BackButton } from "@/components/ui/BackButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/ui/Motion";
import { requireRole } from "@/lib/auth";
import { deleteStudent, listClasses, listStudents } from "@/lib/queries";

export default async function StudentsPage() {
  const profile = await requireRole(["admin", "teacher"]);
  const [students, classes] = await Promise.all([listStudents(profile), listClasses()]);

  async function deleteStudentAction(formData: FormData) {
    "use server";

    await requireRole(["admin"]);
    await deleteStudent(String(formData.get("student_id") ?? ""));
    revalidatePath("/students");
    revalidatePath("/reports");
    revalidatePath("/dashboard/admin");
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/dashboard" label="Back to dashboard" />
      <FadeIn>
        <PageHeader
          description="Review every learner in a cleaner registrar view with better search, faster filtering, and a modern roster layout."
          eyebrow="Academic Records"
          title="Students"
        />
      </FadeIn>

      <StudentsDirectory
        classes={classes}
        deleteAction={profile.role === "admin" ? deleteStudentAction : undefined}
        isAdmin={profile.role === "admin"}
        students={students}
      />
    </section>
  );
}
