import { notFound } from "next/navigation";

import { ReportTable } from "@/components/reports/ReportTable";
import { BackButton } from "@/components/ui/BackButton";
import { requireRole } from "@/lib/auth";
import { getStudentById, getStudentReport, listClasses } from "@/lib/queries";

interface StudentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  await requireRole(["admin", "teacher"]);
  const { id } = await params;

  try {
    const [student, report, classes] = await Promise.all([
      getStudentById(id),
      getStudentReport(id),
      listClasses()
    ]);

    const className =
      classes.find((classRoom) => classRoom.class_id === student.class_id)?.class_name ?? "Unassigned";

    return (
      <section className="grid gap-6">
        <BackButton fallbackHref="/students" label="Back to students" />
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900">{student.name}</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
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
        </div>

        <ReportTable report={report} />
      </section>
    );
  } catch {
    notFound();
  }
}
