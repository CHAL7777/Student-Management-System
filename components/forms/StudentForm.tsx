import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

interface StudentFormProps {
  action: (formData: FormData) => void | Promise<void>;
  classOptions: Array<{ label: string; value: string }>;
}

export function StudentForm({ action, classOptions }: StudentFormProps) {
  return (
    <form action={action} className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Student ID" name="student_id" placeholder="STD-001" required />
        <Input label="Full name" name="name" placeholder="Student full name" required />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select
          label="Gender"
          name="gender"
          defaultValue="male"
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Other", value: "other" }
          ]}
          required
        />
        <Input label="Grade" name="grade" placeholder="Grade 10" required />
        <Input label="Semester" name="semester" placeholder="Semester 1" required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Academic year" name="academic_year" placeholder="2025/2026" required />
        <Select
          label="Class"
          name="class_id"
          defaultValue=""
          options={[{ label: "Select class", value: "" }, ...classOptions]}
          required
        />
      </div>

      <Input
        label="Temporary password"
        name="temporary_password"
        type="password"
        placeholder="Create temporary password"
        minLength={6}
        required
      />

      <div className="flex justify-end">
        <Button type="submit" variant="secondary">
          Save student
        </Button>
      </div>
    </form>
  );
}
