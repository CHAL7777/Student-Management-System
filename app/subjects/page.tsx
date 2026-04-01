import Link from "next/link";
import { revalidatePath } from "next/cache";

import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table } from "@/components/ui/Table";
import { FadeIn } from "@/components/ui/Motion";
import { requireRole } from "@/lib/auth";
import { deleteSubject, listSubjects } from "@/lib/queries";

export default async function SubjectsPage() {
  await requireRole(["admin"]);
  const subjects = await listSubjects();

  async function deleteSubjectAction(formData: FormData) {
    "use server";

    await requireRole(["admin"]);
    await deleteSubject(String(formData.get("subject_id") ?? ""));
    revalidatePath("/subjects");
    revalidatePath("/teachers");
    revalidatePath("/marks");
    revalidatePath("/reports");
    revalidatePath("/dashboard/admin");
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/dashboard/admin" label="Back to registrar dashboard" />
      <FadeIn>
        <PageHeader
          actions={
            <Link href="/subjects/add">
              <Button variant="secondary">Add subject</Button>
            </Link>
          }
          description="Manage dynamic subjects used in mark entry, staffing, and report generation."
          eyebrow="Curriculum"
          title="Subjects"
        />
      </FadeIn>

      <Table
        data={subjects}
        columns={[
          {
            key: "subject_name",
            header: "Subject",
            render: (subject) => <span className="font-semibold">{subject.subject_name}</span>
          },
          { key: "total_mark", header: "Total mark", render: (subject) => subject.total_mark },
          {
            key: "actions",
            header: "Actions",
            render: (subject) => (
              <form action={deleteSubjectAction}>
                <input name="subject_id" type="hidden" value={subject.subject_id} />
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
