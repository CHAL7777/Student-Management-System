import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { MarkForm } from "@/components/forms/MarkForm";
import { BackButton } from "@/components/ui/BackButton";
import { Table } from "@/components/ui/Table";
import { requireRole } from "@/lib/auth";
import { listStudents, listSubjects, listVisibleReports, upsertMark } from "@/lib/queries";
import { formatNumber, toOptions } from "@/utils/helpers";

export default async function MarksPage() {
  const profile = await requireRole(["teacher"]);
  const [students, subjects, reports] = await Promise.all([
    listStudents(),
    listSubjects(),
    listVisibleReports(profile)
  ]);

  async function saveMarkAction(formData: FormData) {
    "use server";

    await requireRole(["teacher"]);
    await upsertMark({
      student_id: String(formData.get("student_id") ?? ""),
      subject_id: String(formData.get("subject_id") ?? ""),
      mark: Number(formData.get("mark") ?? 0)
    });

    revalidatePath("/marks");
    revalidatePath("/reports");
    redirect("/marks");
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/dashboard/teacher" label="Back to teacher dashboard" />
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Mark entry</h2>
        <p className="text-slate-500">
          Teachers can create or update marks per student and subject.
        </p>
      </div>

      <MarkForm
        action={saveMarkAction}
        studentOptions={toOptions(students, "name", "student_id")}
        subjectOptions={toOptions(subjects, "subject_name", "subject_id")}
      />

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
