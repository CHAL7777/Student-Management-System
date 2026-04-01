import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import { ReportTable } from "@/components/reports/ReportTable";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth";
import { deleteStudent, getStudentById, getStudentReport, listClasses } from "@/lib/queries";

interface StudentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const profile = await requireRole(["admin", "teacher"]);
  const { id } = await params;

  async function deleteStudentAction(formData: FormData) {
    "use server";

    await requireRole(["admin"]);
    await deleteStudent(String(formData.get("student_id") ?? ""));
    revalidatePath("/students");
    revalidatePath("/reports");
    revalidatePath("/dashboard/admin");
  }

  try {
    const [student, report, classes] = await Promise.all([
      getStudentById(id, profile),
      getStudentReport(id, profile),
      listClasses()
    ]);

    const className =
      classes.find((classRoom) => classRoom.class_id === student.class_id)?.class_name ?? "Unassigned";

    return (
      <section className="grid gap-6">
        <BackButton fallbackHref="/students" label="Back to students" />
        <PageHeader
          actions={
            profile.role === "admin" ? (
              <form action={deleteStudentAction}>
                <input name="student_id" type="hidden" value={student.student_id} />
                <Button type="submit" variant="danger">
                  Delete student
                </Button>
              </form>
            ) : null
          }
          description="Student profile details and live performance breakdown."
          eyebrow="Student Detail"
          title={student.name}
        />
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Student profile</h2>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
              <p>
                <span className="font-semibold text-slate-800">Student ID:</span> {student.student_id}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Gender:</span> {student.gender}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Grade:</span> {student.grade}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Class:</span> {className}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Academic year:</span> {student.academic_year}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Semester:</span> {student.semester}
              </p>
            </div>
          </CardContent>
        </Card>

        <ReportTable report={report} />
      </section>
    );
  } catch {
    notFound();
  }
}
