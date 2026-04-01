import { HomeroomReportTable } from "@/components/reports/HomeroomReportTable";
import Link from "next/link";

import { ReportTable } from "@/components/reports/ReportTable";
import { BackButton } from "@/components/ui/BackButton";
import { Alert } from "@/components/ui/Alert";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/ui/Motion";
import { requireRole } from "@/lib/auth";
import { getHomeroomReport, getStudentReport, getTeacherAssignedClasses, getTeacherAssignedSubject, listVisibleReports } from "@/lib/queries";

interface ReportsPageProps {
  searchParams?: Promise<{
    studentId?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const [profile, resolvedSearchParams] = await Promise.all([
    requireRole(["admin", "teacher", "student"]),
    searchParams ?? Promise.resolve({ studentId: undefined })
  ]);
  const params = resolvedSearchParams as { studentId?: string };

  const [reports, homeroomReport, assignedSubject, assignedClasses] = await Promise.all([
    listVisibleReports(profile),
    profile.role !== "student" ? getHomeroomReport(profile) : Promise.resolve(null),
    profile.role === "teacher" ? getTeacherAssignedSubject(profile) : Promise.resolve(null),
    profile.role === "teacher" ? getTeacherAssignedClasses(profile) : Promise.resolve([])
  ]);
  const selectedId =
    (profile.role === "student" ? profile.student_id : params.studentId ?? reports[0]?.student_id) ??
    undefined;

  const selectedReport = selectedId ? await getStudentReport(selectedId, profile) : null;

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/dashboard" label="Back to dashboard" />
      <FadeIn>
        <PageHeader
          description={
            profile.role === "teacher"
              ? "Teacher reports are limited to your assigned subject and the students inside your assigned classes."
              : "Totals, averages, rank, and pass or fail status are calculated dynamically from stored subject marks."
          }
          eyebrow="Academic Reporting"
          title="Reports"
        />
      </FadeIn>

      {profile.role === "teacher" ? (
        <Alert title="Teacher report scope" variant={assignedSubject && assignedClasses.length > 0 ? "info" : "danger"}>
          {assignedSubject && assignedClasses.length > 0 ? (
            <>
              You are viewing <strong>{assignedSubject.subject_name}</strong> for{" "}
              <strong>{assignedClasses.map((classRoom) => classRoom.class_name).join(", ")}</strong>.
            </>
          ) : (
            "This teacher account needs both a subject and at least one class assignment before reports can be shown."
          )}
        </Alert>
      ) : null}

      {profile.role !== "student" && homeroomReport ? (
        <HomeroomReportTable data={homeroomReport} selectedStudentId={selectedId} />
      ) : null}

      {selectedReport ? (
        <div className="grid gap-4">
          {profile.role !== "student" ? (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Focused student view</h3>
                <p className="text-sm text-slate-500">
                  Detailed breakdown for{" "}
                  <Link className="font-semibold text-emerald-700" href={`/students/${selectedReport.summary.student_id}`}>
                    {selectedReport.summary.student_name}
                  </Link>
                  .
                </p>
              </CardHeader>
            </Card>
          ) : null}
          <ReportTable report={selectedReport} />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">No reports available yet</h3>
            <p className="text-sm text-slate-500">
              Add students, subjects, and marks first to generate academic reporting data.
            </p>
          </CardHeader>
          <CardContent />
        </Card>
      )}
    </section>
  );
}
