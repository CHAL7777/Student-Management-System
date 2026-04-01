import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

interface TeacherFormProps {
  action: (formData: FormData) => void | Promise<void>;
  subjectOptions: Array<{ label: string; value: string }>;
  classOptions: Array<{ label: string; value: string }>;
}

export function TeacherForm({ action, subjectOptions, classOptions }: TeacherFormProps) {
  return (
    <form action={action} className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Teacher ID" name="teacher_id" placeholder="TCH-101" required />
        <Input label="Full name" name="name" placeholder="Teacher full name" required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Subject"
          name="subject_id"
          defaultValue=""
          options={[{ label: "Select subject", value: "" }, ...subjectOptions]}
          required
        />
        <Input
          label="Temporary password"
          name="temporary_password"
          type="password"
          placeholder="Create temporary password"
          minLength={6}
          required
        />
      </div>

      <fieldset className="grid gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-700">Assigned classes</legend>
        <p className="text-sm text-slate-500">
          Select the class groups this teacher is responsible for, such as Grade 11 A or Grade 11
          B.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {classOptions.map((classOption) => (
            <label
              key={classOption.value}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <input
                className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                name="class_ids"
                type="checkbox"
                value={classOption.value}
              />
              <span className="font-medium">{classOption.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex justify-end">
        <Button type="submit" variant="secondary">
          Save teacher
        </Button>
      </div>
    </form>
  );
}
