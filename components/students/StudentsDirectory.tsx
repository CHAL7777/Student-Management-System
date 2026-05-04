"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  FilterIcon,
  GraduationCapIcon,
  PlusIcon,
  SchoolIcon,
  SearchIcon,
  StudentsIcon,
  TrendUpIcon
} from "@/components/ui/Icons";
import { Input, Select } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import type { ClassRoom, Student } from "@/types";

interface StudentsDirectoryProps {
  students: Student[];
  classes: ClassRoom[];
  isAdmin: boolean;
  deleteAction?: (formData: FormData) => void | Promise<void>;
}

export function StudentsDirectory({
  students,
  classes,
  isAdmin,
  deleteAction
}: StudentsDirectoryProps) {
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const deferredQuery = useDeferredValue(query);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const classMap = new Map(classes.map((item) => [item.class_id, item.class_name]));

  const filteredStudents = students.filter((student) => {
    const className = classMap.get(student.class_id ?? "") ?? "Unassigned";
    const matchesQuery =
      normalizedQuery.length === 0 ||
      student.name.toLowerCase().includes(normalizedQuery) ||
      student.student_id.toLowerCase().includes(normalizedQuery) ||
      student.grade.toLowerCase().includes(normalizedQuery) ||
      className.toLowerCase().includes(normalizedQuery);

    const matchesClass = !classFilter || student.class_id === classFilter;
    const matchesGender = !genderFilter || student.gender === genderFilter;

    return matchesQuery && matchesClass && matchesGender;
  });

  const activeAcademicYears = new Set(students.map((student) => student.academic_year)).size;
  const assignedStudents = students.filter((student) => Boolean(student.class_id)).length;

  if (students.length === 0) {
    return (
      <EmptyState
        action={isAdmin ? { href: "/students/add", label: "Add first student" } : undefined}
        description="No student records are available yet. Start onboarding learners to populate the dashboard, classes, and reports."
        icon={<StudentsIcon className="h-7 w-7" />}
        title="No students have been created"
      />
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description="Total learner profiles currently tracked."
          icon={<StudentsIcon className="h-5 w-5" />}
          label="Students"
          value={students.length}
        />
        <StatCard
          description="Students already assigned to an active class."
          icon={<SchoolIcon className="h-5 w-5" />}
          label="Assigned"
          value={assignedStudents}
        />
        <StatCard
          description="Unique academic year values represented in the roster."
          icon={<GraduationCapIcon className="h-5 w-5" />}
          label="Academic years"
          value={activeAcademicYears}
        />
        <StatCard
          description="Rows that match the current search and filter state."
          icon={<TrendUpIcon className="h-5 w-5" />}
          label="Visible results"
          value={filteredStudents.length}
        />
      </div>

      <div className="rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,255,0.92))] p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="accent">Roster control</Badge>
            <h3 className="heading-display mt-3 text-[1.8rem] text-slate-950">Student directory</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              Search by learner, ID, grade, or class. Filter the roster to move faster through admissions and registrar work.
            </p>
          </div>
          {isAdmin ? (
            <Link href="/students/add">
              <Button variant="primary">
                <PlusIcon className="h-4 w-4" />
                New student
              </Button>
            </Link>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_220px_220px]">
          <Input
            className="bg-white"
            icon={<SearchIcon className="h-4 w-4" />}
            label="Search"
            name="search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, ID, grade, or class"
            value={query}
          />
          <Select
            icon={<FilterIcon className="h-4 w-4" />}
            label="Class filter"
            name="class_filter"
            onChange={(event) => setClassFilter(event.target.value)}
            options={[
              { label: "All classes", value: "" },
              ...classes.map((item) => ({ label: item.class_name, value: item.class_id }))
            ]}
            value={classFilter}
          />
          <Select
            icon={<FilterIcon className="h-4 w-4" />}
            label="Gender filter"
            name="gender_filter"
            onChange={(event) => setGenderFilter(event.target.value)}
            options={[
              { label: "All genders", value: "" },
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Other", value: "other" }
            ]}
            value={genderFilter}
          />
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <EmptyState
          description="No students match the current search terms or filters. Adjust the roster controls to broaden the result set."
          icon={<SearchIcon className="h-7 w-7" />}
          title="No matching students"
        />
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,255,0.92))] shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/70 text-left">
              <thead className="bg-slate-50/90">
                <tr>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Student
                  </th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Grade
                  </th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Class
                  </th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Academic year
                  </th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Semester
                  </th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Gender
                  </th>
                  {isAdmin ? (
                    <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Actions
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/90">
                {filteredStudents.map((student) => {
                  const className = classMap.get(student.class_id ?? "") ?? "Unassigned";

                  return (
                    <tr
                      key={student.student_id}
                      className="odd:bg-white/65 even:bg-slate-50/55 transition duration-200 hover:bg-blue-50/80"
                    >
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#06b6d4_100%)] text-sm font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)]">
                            {student.name
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((part) => part[0]?.toUpperCase() ?? "")
                              .join("")}
                          </div>
                          <div>
                            <Link
                              className="text-sm font-semibold text-slate-950 transition hover:text-blue-700"
                              href={`/students/${student.student_id}`}
                            >
                              {student.name}
                            </Link>
                            <p className="mt-1 font-mono text-xs text-slate-500">{student.student_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top text-sm text-slate-700">{student.grade}</td>
                      <td className="px-5 py-4 align-top text-sm text-slate-700">{className}</td>
                      <td className="px-5 py-4 align-top text-sm text-slate-700">{student.academic_year}</td>
                      <td className="px-5 py-4 align-top text-sm text-slate-700">{student.semester}</td>
                      <td className="px-5 py-4 align-top">
                        <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium capitalize text-slate-600">
                          {student.gender}
                        </span>
                      </td>
                      {isAdmin ? (
                        <td className="px-5 py-4 align-top">
                          {deleteAction ? (
                            <form action={deleteAction}>
                              <input name="student_id" type="hidden" value={student.student_id} />
                              <Button size="sm" type="submit" variant="danger">
                                Delete
                              </Button>
                            </form>
                          ) : null}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
