import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

interface MarkFormProps {
  action: (formData: FormData) => void | Promise<void>;
  studentOptions: Array<{ label: string; value: string }>;
  subjectOptions: Array<{ label: string; value: string }>;
}

export function MarkForm({ action, studentOptions, subjectOptions }: MarkFormProps) {
  return (
    <form
      action={action}
      className="grid gap-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Select
          label="Student"
          name="student_id"
          defaultValue=""
          options={[{ label: "Select student", value: "" }, ...studentOptions]}
          required
        />
        <Select
          label="Subject"
          name="subject_id"
          defaultValue=""
          options={[{ label: "Select subject", value: "" }, ...subjectOptions]}
          required
        />
        <Input label="Mark" name="mark" type="number" min="0" max="100" step="0.01" required />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary">
          Save mark
        </Button>
      </div>
    </form>
  );
}
