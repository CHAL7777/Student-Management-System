import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

interface TeacherFormProps {
  action: (formData: FormData) => void | Promise<void>;
  departmentOptions: Array<{ label: string; value: string }>;
}

export function TeacherForm({ action, departmentOptions }: TeacherFormProps) {
  return (
    <form action={action} className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Teacher ID" name="teacher_id" placeholder="TCH-101" required />
        <Input label="Full name" name="name" placeholder="Teacher full name" required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Department"
          name="department_id"
          defaultValue=""
          options={[{ label: "Select department", value: "" }, ...departmentOptions]}
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

      <div className="flex justify-end">
        <Button type="submit" variant="secondary">
          Save teacher
        </Button>
      </div>
    </form>
  );
}
