import Link from "next/link";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/Motion";
import { getDashboardMetrics, getTeacherAssignedClasses, getTeacherAssignedSubject } from "@/lib/queries";
import { requireRole } from "@/lib/auth";

export default async function TeacherDashboardPage() {
  const profile = await requireRole(["teacher"]);
  const [metrics, assignedSubject, assignedClasses] = await Promise.all([
    getDashboardMetrics(profile),
    getTeacherAssignedSubject(profile),
    getTeacherAssignedClasses(profile)
  ]);

  return (
    <section className="grid gap-6">
      <FadeIn>
        <PageHeader
          actions={
            <>
              <Link href="/marks">
                <Button variant="secondary">Enter marks</Button>
              </Link>
              <Link href="/reports">
                <Button variant="ghost">Review reports</Button>
              </Link>
            </>
          }
          description="Enter or update student marks, review standings, and keep progress visible without duplicating derived academic statistics."
          eyebrow="Teacher Workspace"
          title="Teaching overview and live assessment flow"
        />
      </FadeIn>

      {assignedSubject ? (
        <Alert title="Assigned subject" variant="info">
          You are currently assigned to <strong>{assignedSubject.subject_name}</strong>. You can
          only enter marks for this subject.
        </Alert>
      ) : (
        <Alert title="No assigned subject" variant="danger">
          This teacher account does not have a subject yet. Ask the registrar to assign one before
          entering marks.
        </Alert>
      )}

      <Alert title="Assigned classes" variant={assignedClasses.length > 0 ? "info" : "danger"}>
        {assignedClasses.length > 0 ? (
          <>
            You can currently work with{" "}
            <strong>{assignedClasses.map((classRoom) => classRoom.class_name).join(", ")}</strong>.
          </>
        ) : (
          "This teacher account is not assigned to any class yet. Ask the registrar to add one or more classes."
        )}
      </Alert>

      <StaggerGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatCard description="Students inside your assigned classes." label="Students" value={metrics.totalStudents} />
        </StaggerItem>
        <StaggerItem>
          <StatCard description="Your assigned teaching subject." label="Subjects" value={metrics.totalSubjects} />
        </StaggerItem>
        <StaggerItem>
          <StatCard description="Class groups assigned to you." label="Classes" value={metrics.totalClasses} />
        </StaggerItem>
        <StaggerItem>
          <StatCard description="Teaching staff in the institution." label="Teachers" value={metrics.totalTeachers} />
        </StaggerItem>
      </StaggerGroup>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-slate-900">Teaching workspace</h2>
          <p className="text-sm leading-6 text-slate-500">
            Use this area to move quickly between mark entry, student review, and academic reports.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/marks">
              <Button variant="secondary">Enter marks</Button>
            </Link>
            <Link href="/students">
              <Button variant="ghost">Browse students</Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost">Review reports</Button>
            </Link>
            <Link href="/dashboard/password">
              <Button variant="ghost">Change password</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
