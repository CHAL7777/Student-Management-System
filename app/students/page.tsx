import Link from "next/link";
import { revalidatePath } from "next/cache";

import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table } from "@/components/ui/Table";
import { FadeIn } from "@/components/ui/Motion";
import { requireRole } from "@/lib/auth";
import { deleteStudent, listClasses, listStudents } from "@/lib/queries";

export default async function StudentsPage() {
  const profile = await requireRole(["admin", "teacher"]);
  const [students, classes] = await Promise.all([listStudents(profile), listClasses()]);

  const classMap = new Map(classes.map((item) => [item.class_id, item.class_name]));

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
          actions={
            profile.role === "admin" ? (
              <Link href="/students/add">
                <Button variant="secondary">Add student</Button>
              </Link>
            ) : null
          }
          description="View and manage student records by class, semester, grade, and academic year."
          eyebrow="Academic Records"
          title="Students"
        />
      </FadeIn>

      <Table
        data={students}
        columns={[
          {
            key: "student_id",
            header: "Student ID",
            render: (student) => <span className="font-mono text-xs text-slate-600">{student.student_id}</span>
          },
          {
            key: "name",
            header: "Name",
            render: (student) => (
              <Link className="font-semibold text-emerald-700" href={`/students/${student.student_id}`}>
                {student.name}
              </Link>
            )
          },
          { key: "grade", header: "Grade", render: (student) => student.grade },
          {
            key: "class",
            header: "Class",
            render: (student) => classMap.get(student.class_id ?? "") ?? "Unassigned"
          },
          { key: "year", header: "Academic year", render: (student) => student.academic_year },
          { key: "semester", header: "Semester", render: (student) => student.semester },
          ...(profile.role === "admin"
            ? [
                {
                  key: "actions",
                  header: "Actions",
                  render: (student: (typeof students)[number]) => (
                    <form action={deleteStudentAction}>
                      <input name="student_id" type="hidden" value={student.student_id} />
                      <Button size="sm" type="submit" variant="danger">
                        Delete
                      </Button>
                    </form>
                  )
                }
              ]
            : [])
        ]}
      />
    </section>
  );
}
