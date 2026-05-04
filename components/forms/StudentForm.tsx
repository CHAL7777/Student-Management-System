"use client";

import type { ReactNode } from "react";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  CalendarIcon,
  CheckCircleIcon,
  GraduationCapIcon,
  IdCardIcon,
  LockIcon,
  SchoolIcon,
  UserIcon
} from "@/components/ui/Icons";
import { Input, Select } from "@/components/ui/Input";

export interface StudentFormActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

interface StudentFormProps {
  action: (
    state: StudentFormActionState,
    formData: FormData
  ) => Promise<StudentFormActionState>;
  classOptions: Array<{ label: string; value: string }>;
}

const initialState: StudentFormActionState = {
  status: "idle",
  message: "",
  fieldErrors: {}
};

export function StudentForm({ action, classOptions }: StudentFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({
    gender: "male"
  });

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.push("/students");
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [router, state.status]);

  const errors = {
    ...(state.fieldErrors ?? {}),
    ...clientErrors
  };

  function clearFieldError(fieldName: string) {
    setClientErrors((current) => {
      if (!current[fieldName]) {
        return current;
      }

      const next = { ...current };
      delete next[fieldName];
      return next;
    });
  }

  function validateForm(formData: FormData) {
    const nextErrors: Record<string, string> = {};
    const requiredFields = [
      ["student_id", "Student ID is required"],
      ["name", "Student name is required"],
      ["grade", "Grade is required"],
      ["academic_year", "Academic year is required"],
      ["semester", "Semester is required"],
      ["class_id", "Select a class assignment"]
    ] as const;

    for (const [field, message] of requiredFields) {
      if (!String(formData.get(field) ?? "").trim()) {
        nextErrors[field] = message;
      }
    }

    if (!["male", "female", "other"].includes(String(formData.get("gender") ?? ""))) {
      nextErrors.gender = "Select a valid gender";
    }

    if (String(formData.get("temporary_password") ?? "").length < 6) {
      nextErrors.temporary_password = "Temporary password must be at least 6 characters";
    }

    return nextErrors;
  }

  return (
    <form
      action={formAction}
      className="grid gap-6"
      onChange={(event) => {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLSelectElement ||
          event.target instanceof HTMLTextAreaElement
        ) {
          setValues((current) => ({
            ...current,
            [event.target.name]: event.target.value
          }));
          clearFieldError(event.target.name);
        }
      }}
      onSubmit={(event) => {
        const validationErrors = validateForm(new FormData(event.currentTarget));
        if (Object.keys(validationErrors).length > 0) {
          event.preventDefault();
          setClientErrors(validationErrors);
        }
      }}
    >
      {state.status === "success" && state.message ? (
        <Alert title="Student created" variant="success">
          {state.message}
        </Alert>
      ) : null}
      {state.status === "error" && state.message ? (
        <Alert title="Unable to save" variant="danger">
          {state.message}
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <fieldset className="contents" disabled={pending}>
          <div className="grid gap-6">
            <FormSection
              badge="Primary details"
              description="Capture the core identity and access credentials used to onboard the student."
              title="Student Info"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  error={errors.student_id}
                  icon={<IdCardIcon className="h-4 w-4" />}
                  label="Student ID"
                  name="student_id"
                  placeholder="STD-001"
                  required
                  success={Boolean(values.student_id?.trim()) && !errors.student_id}
                />
                <Input
                  error={errors.name}
                  icon={<UserIcon className="h-4 w-4" />}
                  label="Full name"
                  name="name"
                  placeholder="Alemu Kebede"
                  required
                  success={Boolean(values.name?.trim()) && !errors.name}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  defaultValue="male"
                  error={errors.gender}
                  icon={<UserIcon className="h-4 w-4" />}
                  label="Gender"
                  name="gender"
                  options={[
                    { label: "Male", value: "male" },
                    { label: "Female", value: "female" },
                    { label: "Other", value: "other" }
                  ]}
                  required
                  success={Boolean(values.gender) && !errors.gender}
                />
                <Input
                  error={errors.temporary_password}
                  icon={<LockIcon className="h-4 w-4" />}
                  label="Temporary password"
                  minLength={6}
                  name="temporary_password"
                  placeholder="Create a secure starter password"
                  required
                  success={Boolean(values.temporary_password && values.temporary_password.length >= 6) && !errors.temporary_password}
                  type="password"
                />
              </div>
            </FormSection>

            <FormSection
              badge="Enrollment setup"
              description="Organize the student into the right course context, grade, term, and class roster."
              title="Course Info"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  error={errors.grade}
                  icon={<GraduationCapIcon className="h-4 w-4" />}
                  label="Grade"
                  name="grade"
                  placeholder="Grade 10"
                  required
                  success={Boolean(values.grade?.trim()) && !errors.grade}
                />
                <Select
                  defaultValue=""
                  error={errors.class_id}
                  icon={<SchoolIcon className="h-4 w-4" />}
                  label="Class"
                  name="class_id"
                  options={[{ label: "Select class", value: "" }, ...classOptions]}
                  required
                  success={Boolean(values.class_id) && !errors.class_id}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  error={errors.academic_year}
                  icon={<CalendarIcon className="h-4 w-4" />}
                  label="Academic year"
                  name="academic_year"
                  placeholder="2026/2027"
                  required
                  success={Boolean(values.academic_year?.trim()) && !errors.academic_year}
                />
                <Input
                  error={errors.semester}
                  icon={<CalendarIcon className="h-4 w-4" />}
                  label="Semester"
                  name="semester"
                  placeholder="Semester 1"
                  required
                  success={Boolean(values.semester?.trim()) && !errors.semester}
                />
              </div>
            </FormSection>

          </div>
        </fieldset>

        <Card className="h-fit overflow-hidden border-slate-200 bg-white">
          <CardContent className="grid gap-6 px-6 py-6">
            <div>
              <Badge variant="accent">
                Intake summary
              </Badge>
              <h3 className="heading-display mt-4 text-[1.8rem] text-slate-900">
                Professional onboarding flow
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                The new intake experience is structured for admissions teams: cleaner grouping,
                faster scanning, and fewer missed fields.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                {
                  icon: <CheckCircleIcon className="h-4 w-4" />,
                  title: "Validated fields",
                  description: "Required academic inputs are checked before the request is sent."
                },
                {
                  icon: <SchoolIcon className="h-4 w-4" />,
                  title: "Class placement",
                  description: "Enrollment details stay aligned to the correct grade and class roster."
                },
                {
                  icon: <LockIcon className="h-4 w-4" />,
                  title: "Account creation",
                  description: "Saving this form issues the student record and linked temporary login."
                }
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs leading-6 text-slate-500">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button fullWidth loading={pending} size="lg" type="submit" variant="primary">
              {pending ? "Saving student" : "Create student account"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

function FormSection({
  title,
  description,
  badge,
  badgeVariant = "accent",
  children
}: {
  title: string;
  description: string;
  badge: string;
  badgeVariant?: "neutral" | "success" | "danger" | "accent";
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant={badgeVariant}>{badge}</Badge>
          <h3 className="heading-display mt-3 text-[1.8rem] text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}
