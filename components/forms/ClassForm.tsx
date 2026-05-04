import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

interface ClassFormProps {
  action: (formData: FormData) => void | Promise<void>;
  teacherOptions: Array<{ label: string; value: string }>;
}

export function ClassForm({ action, teacherOptions }: ClassFormProps) {
  return (
    <form
      action={action}
      className="grid gap-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]"
    >
      <Input label="Class name" name="class_name" placeholder="Grade 10 - A" required />

      <Select
        label="Homeroom teacher"
        name="homeroom_teacher_id"
        defaultValue=""
        options={[{ label: "Unassigned", value: "" }, ...teacherOptions]}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary">
          Save class
        </Button>
      </div>
    </form>
  );
}
