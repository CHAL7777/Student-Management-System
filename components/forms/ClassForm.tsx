import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

interface ClassFormProps {
  action: (formData: FormData) => void | Promise<void>;
  teacherOptions: Array<{ label: string; value: string }>;
}

export function ClassForm({ action, teacherOptions }: ClassFormProps) {
  return (
    <form action={action} className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <Input label="Class name" name="class_name" placeholder="Grade 10 - A" required />

      <Select
        label="Homeroom teacher"
        name="homeroom_teacher_id"
        defaultValue=""
        options={[{ label: "Unassigned", value: "" }, ...teacherOptions]}
      />

      <div className="flex justify-end">
        <Button type="submit" variant="secondary">
          Save class
        </Button>
      </div>
    </form>
  );
}
