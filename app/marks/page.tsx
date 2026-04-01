import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { MarkForm } from "@/components/forms/MarkForm";
import { Alert } from "@/components/ui/Alert";
import { BackButton } from "@/components/ui/BackButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table } from "@/components/ui/Table";
import { FadeIn } from "@/components/ui/Motion";
import { requireRole } from "@/lib/auth";
import { getTeacherAssignedClasses, getTeacherAssignedSubject, listStudents, listVisibleReports, upsertMark } from "@/lib/queries";
import { formatNumber, toOptions } from "@/utils/helpers";

interface MarksPageProps {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
}

export default async function MarksPage({ searchParams }: MarksPageProps) {
  const profile = await requireRole(["teacher"]);
  const [students, assignedSubject, assignedClasses, reports, resolvedSearchParams] = await Promise.all([
    listStudents(profile),
    getTeacherAssignedSubject(profile),
    getTeacherAssignedClasses(profile),
    listVisibleReports(profile),
    searchParams ?? Promise.resolve({ error: undefined, success: undefined })
  ]);
  const params = resolvedSearchParams as { error?: string; success?: string };

  async function saveMarkAction(formData: FormData) {
    "use server";

    const profile = await requireRole(["teacher"]);

    try {
      await upsertMark(
        {
          student_id: String(formData.get("student_id") ?? ""),
          subject_id: String(formData.get("subject_id") ?? ""),
          mark: Number(formData.get("mark") ?? 0)
        },
        profile
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save mark";
      redirect(`/marks?error=${encodeURIComponent(message)}`);
    }

    revalidatePath("/marks");
    revalidatePath("/reports");
    redirect("/marks?success=Mark%20saved%20successfully");
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/dashboard/teacher" label="Back to teacher dashboard" />
      <FadeIn>
        <PageHeader
          description="Enter or update marks for the subject assigned to your teacher account with immediate report recalculation."
          eyebrow="Assessment"
          title="Mark entry"
        />
      </FadeIn>

      {assignedSubject ? (
        <Alert variant="info" title="Assigned subject">
          You can only enter marks for <strong>{assignedSubject.subject_name}</strong>.
        </Alert>
      ) : (
        <Alert variant="danger" title="No subject assigned">
          This teacher account does not have a subject yet. Ask the registrar to assign one before
          entering marks.
        </Alert>
      )}

      <Alert variant={assignedClasses.length > 0 ? "info" : "danger"} title="Assigned classes">
        {assignedClasses.length > 0 ? (
          <>
            Student choices are limited to <strong>{assignedClasses.map((classRoom) => classRoom.class_name).join(", ")}</strong>.
          </>
        ) : (
          "No class is assigned to this teacher account yet."
        )}
      </Alert>

      {params.error ? <Alert variant="danger">{params.error}</Alert> : null}
      {params.success ? <Alert variant="success">{params.success}</Alert> : null}

      {assignedSubject && assignedClasses.length > 0 ? (
        <MarkForm
          action={saveMarkAction}
          studentOptions={toOptions(students, "name", "student_id")}
          subjectOptions={toOptions([assignedSubject], "subject_name", "subject_id")}
        />
      ) : null}

      <Table
        data={reports}
        columns={[
          {
            key: "student_name",
            header: "Student",
            render: (report) => <span className="font-semibold">{report.student_name}</span>
          },
          { key: "total", header: "Total", render: (report) => formatNumber(report.total) },
          { key: "average", header: "Average", render: (report) => formatNumber(report.average) },
          { key: "rank", header: "Rank", render: (report) => report.rank }
        ]}
        emptyState="Marks will appear in report rankings once subjects and students exist."
      />
    </section>
  );
}
