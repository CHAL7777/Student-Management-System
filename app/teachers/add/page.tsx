import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { TeacherForm } from "@/components/forms/TeacherForm";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requireRole } from "@/lib/auth";
import { createDepartment, createTeacher, listDepartments } from "@/lib/queries";
import { toOptions } from "@/utils/helpers";

export default async function AddTeacherPage() {
  await requireRole(["admin"]);
  const departments = await listDepartments();

  async function createTeacherAction(formData: FormData) {
    "use server";

    await requireRole(["admin"]);
    await createTeacher({
      teacher_id: String(formData.get("teacher_id") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      department_id: String(formData.get("department_id") ?? ""),
      temporary_password: String(formData.get("temporary_password") ?? "")
    });

    revalidatePath("/teachers");
    redirect("/teachers");
  }

  async function createDepartmentAction(formData: FormData) {
    "use server";

    await requireRole(["admin"]);
    await createDepartment(String(formData.get("department_name") ?? ""));
    revalidatePath("/teachers/add");
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/teachers" label="Back to teachers" />
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Add teacher</h2>
        <p className="text-slate-500">
          Create a teacher, assign the teacher ID, and issue a temporary password for first login.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <TeacherForm
          action={createTeacherAction}
          departmentOptions={toOptions(departments, "department_name", "department_id")}
        />

        <form
          action={createDepartmentAction}
          className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Need a new department?</h3>
            <p className="mt-1 text-sm text-slate-500">Add it here without leaving the teacher workflow.</p>
          </div>
          <Input label="Department name" name="department_name" placeholder="Science Department" required />
          <Button type="submit" variant="ghost">
            Save Department
          </Button>
        </form>
      </div>
    </section>
  );
}
