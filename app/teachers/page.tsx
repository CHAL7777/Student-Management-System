import Link from "next/link";
import { revalidatePath } from "next/cache";

import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table } from "@/components/ui/Table";
import { FadeIn } from "@/components/ui/Motion";
import { requireRole } from "@/lib/auth";
import { deleteTeacher, listSubjects, listTeacherClassAssignments, listTeachers } from "@/lib/queries";

export default async function TeachersPage() {
  await requireRole(["admin"]);
  const [teachers, subjects, classAssignments] = await Promise.all([
    listTeachers(),
    listSubjects(),
    listTeacherClassAssignments()
  ]);

  const subjectMap = new Map(subjects.map((subject) => [subject.subject_id, subject.subject_name]));
  const classMap = new Map<string, string[]>();

  for (const assignment of classAssignments) {
    const currentAssignments = classMap.get(assignment.teacher_id) ?? [];
    if (assignment.class_name) {
      currentAssignments.push(assignment.class_name);
    }
    classMap.set(assignment.teacher_id, currentAssignments);
  }

  async function deleteTeacherAction(formData: FormData) {
    "use server";

    await requireRole(["admin"]);
    await deleteTeacher(String(formData.get("teacher_id") ?? ""));
    revalidatePath("/teachers");
    revalidatePath("/classes");
    revalidatePath("/dashboard/admin");
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/dashboard/admin" label="Back to registrar dashboard" />
      <FadeIn>
        <PageHeader
          actions={
            <Link href="/teachers/add">
              <Button variant="secondary">Add teacher</Button>
            </Link>
          }
          description="Assign teachers to subjects and keep staffing records current with a clean academic roster."
          eyebrow="Teaching Staff"
          title="Teachers"
        />
      </FadeIn>

      <Table
        data={teachers}
        columns={[
          {
            key: "teacher_id",
            header: "Teacher ID",
            render: (teacher) => <span className="font-mono text-xs text-slate-600">{teacher.teacher_id}</span>
          },
          { key: "name", header: "Teacher", render: (teacher) => <span className="font-semibold">{teacher.name}</span> },
          {
            key: "subject",
            header: "Subject",
            render: (teacher) => subjectMap.get(teacher.subject_id ?? "") ?? "Unassigned"
          },
          {
            key: "classes",
            header: "Classes",
            render: (teacher) => {
              const classes = classMap.get(teacher.teacher_id) ?? [];
              return classes.length > 0 ? classes.join(", ") : "Unassigned";
            }
          },
          {
            key: "actions",
            header: "Actions",
            render: (teacher) => (
              <form action={deleteTeacherAction}>
                <input name="teacher_id" type="hidden" value={teacher.teacher_id} />
                <Button size="sm" type="submit" variant="danger">
                  Delete
                </Button>
              </form>
            )
          }
        ]}
      />
    </section>
  );
}
