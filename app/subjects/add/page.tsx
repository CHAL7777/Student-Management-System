import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { SubjectForm } from "@/components/forms/SubjectForm";
import { BackButton } from "@/components/ui/BackButton";
import { requireRole } from "@/lib/auth";
import { createSubject } from "@/lib/queries";

export default async function AddSubjectPage() {
  await requireRole(["admin"]);

  async function createSubjectAction(formData: FormData) {
    "use server";

    await requireRole(["admin"]);
    await createSubject({
      subject_name: String(formData.get("subject_name") ?? ""),
      total_mark: Number(formData.get("total_mark") ?? 100)
    });

    revalidatePath("/subjects");
    redirect("/subjects");
  }

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/subjects" label="Back to subjects" />
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Add subject</h2>
        <p className="text-slate-500">Create curriculum subjects dynamically without hardcoding them.</p>
      </div>
      <SubjectForm action={createSubjectAction} />
    </section>
  );
}
