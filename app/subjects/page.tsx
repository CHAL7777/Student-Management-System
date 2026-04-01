import Link from "next/link";

import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { requireRole } from "@/lib/auth";
import { listSubjects } from "@/lib/queries";

export default async function SubjectsPage() {
  await requireRole(["admin"]);
  const subjects = await listSubjects();

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/dashboard/admin" label="Back to registrar dashboard" />
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Subjects</h2>
          <p className="text-slate-500">Manage dynamic subjects used in mark entry and report generation.</p>
        </div>
        <Link href="/subjects/add">
          <Button variant="secondary">Add subject</Button>
        </Link>
      </div>

      <Table
        data={subjects}
        columns={[
          {
            key: "subject_name",
            header: "Subject",
            render: (subject) => <span className="font-semibold">{subject.subject_name}</span>
          },
          { key: "total_mark", header: "Total mark", render: (subject) => subject.total_mark }
        ]}
      />
    </section>
  );
}
