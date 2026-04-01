import Link from "next/link";

import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { requireRole } from "@/lib/auth";
import { listClasses, listTeachers } from "@/lib/queries";

export default async function ClassesPage() {
  await requireRole(["admin"]);
  const [classes, teachers] = await Promise.all([listClasses(), listTeachers()]);
  const teacherMap = new Map(teachers.map((teacher) => [teacher.teacher_id, teacher.name]));

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/dashboard/admin" label="Back to registrar dashboard" />
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Classes</h2>
          <p className="text-slate-500">Maintain class groups and assign homeroom teachers.</p>
        </div>
        <Link href="/classes/add">
          <Button variant="secondary">Add class</Button>
        </Link>
      </div>

      <Table
        data={classes}
        columns={[
          {
            key: "class_name",
            header: "Class name",
            render: (classRoom) => <span className="font-semibold">{classRoom.class_name}</span>
          },
          {
            key: "homeroom",
            header: "Homeroom teacher",
            render: (classRoom) => teacherMap.get(classRoom.homeroom_teacher_id ?? "") ?? "Unassigned"
          }
        ]}
      />
    </section>
  );
}
