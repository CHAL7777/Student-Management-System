import Link from "next/link";

import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { requireRole } from "@/lib/auth";
import { listDepartments, listTeachers } from "@/lib/queries";

export default async function TeachersPage() {
  await requireRole(["admin"]);
  const [teachers, departments] = await Promise.all([listTeachers(), listDepartments()]);

  const departmentMap = new Map(
    departments.map((department) => [department.department_id, department.department_name])
  );

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/dashboard/admin" label="Back to registrar dashboard" />
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Teachers</h2>
          <p className="text-slate-500">Assign teachers to departments and keep staffing records current.</p>
        </div>
        <Link href="/teachers/add">
          <Button variant="secondary">Add teacher</Button>
        </Link>
      </div>

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
            key: "department",
            header: "Department",
            render: (teacher) => departmentMap.get(teacher.department_id) ?? "Unknown"
          }
        ]}
      />
    </section>
  );
}
