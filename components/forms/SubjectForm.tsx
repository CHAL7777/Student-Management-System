import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface SubjectFormProps {
  action: (formData: FormData) => void | Promise<void>;
}

export function SubjectForm({ action }: SubjectFormProps) {
  return (
    <form action={action} className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Subject name" name="subject_name" placeholder="Mathematics" required />
        <Input label="Total mark" name="total_mark" type="number" min="1" defaultValue="100" required />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="secondary">
          Save subject
        </Button>
      </div>
    </form>
  );
}
