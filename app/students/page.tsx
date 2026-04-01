import Link from "next/link";

import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { requireRole } from "@/lib/auth";
import { listClasses, listStudents } from "@/lib/queries";

export default async function StudentsPage() {
  const profile = await requireRole(["admin", "teacher"]);
  const [students, classes] = await Promise.all([listStudents(), listClasses()]);

  const classMap = new Map(classes.map((item) => [item.class_id, item.class_name]));

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/dashboard" label="Back to dashboard" />
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Students</h2>
          <p className="text-slate-500">View and manage student records by class, semester, and grade.</p>
        </div>
        {profile.role === "admin" ? (
          <Link href="/students/add">
            <Button variant="secondary">Add student</Button>
          </Link>
        ) : null}
      </div>

      <Table
        data={students}
        columns={[
          {
            key: "student_id",
            header: "Student ID",
            render: (student) => <span className="font-mono text-xs text-slate-600">{student.student_id}</span>
          },
          {
            key: "name",
            header: "Name",
            render: (student) => (
              <Link className="font-semibold text-emerald-700" href={`/students/${student.student_id}`}>
                {student.name}
              </Link>
            )
          },
          { key: "grade", header: "Grade", render: (student) => student.grade },
          {
            key: "class",
            header: "Class",
            render: (student) => classMap.get(student.class_id ?? "") ?? "Unassigned"
          },
          { key: "year", header: "Academic year", render: (student) => student.academic_year },
          { key: "semester", header: "Semester", render: (student) => student.semester }
        ]}
      />
    </section>
  );
}
