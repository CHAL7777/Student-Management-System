import Link from "next/link";
import { revalidatePath } from "next/cache";

import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table } from "@/components/ui/Table";
import { FadeIn } from "@/components/ui/Motion";
import { requireRole } from "@/lib/auth";
import { deleteClass, listClasses, listTeachers } from "@/lib/queries";

export default async function ClassesPage() {
  await requireRole(["admin"]);
  const [classes, teachers] = await Promise.all([listClasses(), listTeachers()]);
  const teacherMap = new Map(teachers.map((teacher) => [teacher.teacher_id, teacher.name]));

  async function deleteClassAction(formData: FormData) {
    "use server";

    await requireRole(["admin"]);
    await deleteClass(String(formData.get("class_id") ?? ""));
    revalidatePath("/classes");
    revalidatePath("/students");
    revalidatePath("/teachers");
    revalidatePath("/reports");
    revalidatePath("/dashboard/admin");
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/dashboard/admin" label="Back to registrar dashboard" />
      <FadeIn>
        <PageHeader
          actions={
            <Link href="/classes/add">
              <Button variant="secondary">Add class</Button>
            </Link>
          }
          description="Maintain class groups and assign homeroom teachers with a clear academic structure."
          eyebrow="Class Structure"
          title="Classes"
        />
      </FadeIn>

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
          },
          {
            key: "actions",
            header: "Actions",
            render: (classRoom) => (
              <form action={deleteClassAction}>
                <input name="class_id" type="hidden" value={classRoom.class_id} />
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
