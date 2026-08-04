"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/profile/TagInput";
import { WorkExperienceRole } from "@/components/profile/WorkExperienceRole";
import { saveProfile } from "@/actions/profile";
import { MAX_WORK_EXPERIENCE_ROLES } from "@/lib/profile";
import type { ProfileFormValues, WorkExperienceRoleData } from "@/types";

function createRole(): WorkExperienceRoleData {
  return {
    id: crypto.randomUUID(),
    company: "",
    title: "",
    startDate: "",
    endDate: "",
    current: false,
    responsibilities: "",
  };
}

type Props = {
  values: ProfileFormValues;
  onChange: (values: ProfileFormValues) => void;
  email: string;
};

export function ProfileForm({ values, onChange, email }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [, startTransition] = useTransition();

  const update = (patch: Partial<ProfileFormValues>) => onChange({ ...values, ...patch });

  const addRole = () => {
    if (values.roles.length >= MAX_WORK_EXPERIENCE_ROLES) return;
    update({ roles: [...values.roles, createRole()] });
  };

  const updateRole = (updated: WorkExperienceRoleData) => {
    update({ roles: values.roles.map((role) => (role.id === updated.id ? updated : role)) });
  };

  const removeRole = (id: string) => {
    update({ roles: values.roles.filter((role) => role.id !== id) });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus(null);

    // saveProfile calls revalidatePath, which pushes an immediate refresh of this
    // page. Without startTransition, that refresh can land ahead of this callback's
    // own setStatus and get reconciled as a fresh mount, silently dropping the update.
    startTransition(async () => {
      const result = await saveProfile(values);

      if (result.success) {
        setStatus({ type: "success", message: "Profile saved." });
      } else {
        setStatus({ type: "error", message: result.error ?? "Failed to save profile." });
      }
      setIsSaving(false);
    });
  };

  return (
    <form onSubmit={handleSave} className="rounded-2xl border border-border bg-surface p-6 shadow">
      <h2 className="text-base font-semibold text-text-primary">Profile Information</h2>
      <p className="mt-1 text-sm text-text-secondary">
        This context is used to accurately represent you in agent interactions.
      </p>

      {/* Personal Info */}
      <div className="mt-6 border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-text-primary">Personal Info</h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              className="mt-1.5"
              value={values.fullName}
              onChange={(e) => update({ fullName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" className="mt-1.5" value={email} disabled />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              className="mt-1.5"
              placeholder="+1 (555) 000-0000"
              value={values.phone}
              onChange={(e) => update({ phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              className="mt-1.5"
              placeholder="City, Country"
              value={values.location}
              onChange={(e) => update({ location: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              className="mt-1.5"
              value={values.linkedinUrl}
              onChange={(e) => update({ linkedinUrl: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="portfolioUrl">Portfolio / GitHub</Label>
            <Input
              id="portfolioUrl"
              className="mt-1.5"
              value={values.portfolioUrl}
              onChange={(e) => update({ portfolioUrl: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="workAuthorization">Work Authorization</Label>
            <Select
              id="workAuthorization"
              className="mt-1.5"
              value={values.workAuthorization}
              onChange={(e) => update({ workAuthorization: e.target.value })}
            >
              <option value="citizen">Citizen</option>
              <option value="permanent_resident">Permanent Resident</option>
              <option value="visa_required">Visa Required</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Professional Info */}
      <div className="mt-6 border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-text-primary">Professional Info</h3>

        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="currentTitle">Current/Recent Job Title</Label>
            <Input
              id="currentTitle"
              className="mt-1.5"
              value={values.currentTitle}
              onChange={(e) => update({ currentTitle: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select
                id="experienceLevel"
                className="mt-1.5"
                value={values.experienceLevel}
                onChange={(e) => update({ experienceLevel: e.target.value })}
              >
                <option value="junior">Junior</option>
                <option value="mid">Mid-level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <Input
                id="yearsExperience"
                type="number"
                min={0}
                className="mt-1.5"
                value={values.yearsExperience}
                onChange={(e) => update({ yearsExperience: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Skills</Label>
            <div className="mt-1.5">
              <TagInput
                tags={values.skills}
                onChange={(skills) => update({ skills })}
                placeholder="Add a skill"
              />
            </div>
          </div>

          <div>
            <Label>Industries Worked In (optional)</Label>
            <div className="mt-1.5">
              <TagInput
                tags={values.industries}
                onChange={(industries) => update({ industries })}
                placeholder="E.g. FinTech, Healthcare"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Work Experience */}
      <div className="mt-6 border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Work Experience</h3>
          {values.roles.length < MAX_WORK_EXPERIENCE_ROLES ? (
            <button
              type="button"
              onClick={addRole}
              className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-dark"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add role
            </button>
          ) : null}
        </div>

        <div className="mt-4 divide-y divide-border">
          {values.roles.map((role, index) => (
            <div key={role.id} className={index > 0 ? "pt-6" : undefined}>
              <WorkExperienceRole
                role={role}
                onChange={updateRole}
                onRemove={values.roles.length > 1 ? () => removeRole(role.id) : undefined}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mt-6 border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-text-primary">Education</h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="degree">Highest Degree</Label>
            <Select
              id="degree"
              className="mt-1.5"
              value={values.education.degree}
              onChange={(e) => update({ education: { ...values.education, degree: e.target.value } })}
            >
              <option value="high_school">High School</option>
              <option value="associate">Associate Degree</option>
              <option value="bachelor">Bachelor&apos;s Degree</option>
              <option value="master">Master&apos;s Degree</option>
              <option value="doctorate">Doctorate</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="fieldOfStudy">Field of Study</Label>
            <Input
              id="fieldOfStudy"
              className="mt-1.5"
              value={values.education.fieldOfStudy}
              onChange={(e) =>
                update({ education: { ...values.education, fieldOfStudy: e.target.value } })
              }
            />
          </div>

          <div>
            <Label htmlFor="institution">Institution Name</Label>
            <Input
              id="institution"
              className="mt-1.5"
              placeholder="E.g. State University"
              value={values.education.institution}
              onChange={(e) =>
                update({ education: { ...values.education, institution: e.target.value } })
              }
            />
          </div>
          <div>
            <Label htmlFor="graduationYear">Graduation Year</Label>
            <Input
              id="graduationYear"
              className="mt-1.5"
              placeholder="YYYY"
              value={values.education.graduationYear}
              onChange={(e) =>
                update({ education: { ...values.education, graduationYear: e.target.value } })
              }
            />
          </div>
        </div>
      </div>

      {/* Job Preferences */}
      <div className="mt-6 border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-text-primary">Job Preferences</h3>

        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="jobTitlesSeeking">Job Titles Seeking</Label>
            <Input
              id="jobTitlesSeeking"
              className="mt-1.5"
              value={values.jobTitlesSeeking}
              onChange={(e) => update({ jobTitlesSeeking: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="remotePreference">Remote Preference</Label>
              <Select
                id="remotePreference"
                className="mt-1.5"
                value={values.remotePreference}
                onChange={(e) => update({ remotePreference: e.target.value })}
              >
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="any">Any</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="salaryExpectation">Salary Expectation (optional)</Label>
              <Input
                id="salaryExpectation"
                className="mt-1.5"
                placeholder="E.g. $120k+"
                value={values.salaryExpectation}
                onChange={(e) => update({ salaryExpectation: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="preferredLocations">Preferred Locations (optional)</Label>
              <Input
                id="preferredLocations"
                className="mt-1.5"
                placeholder="E.g. New York, London"
                value={values.preferredLocations}
                onChange={(e) => update({ preferredLocations: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="coverLetterTone">Cover Letter Tone</Label>
              <Select
                id="coverLetterTone"
                className="mt-1.5"
                value={values.coverLetterTone}
                onChange={(e) => update({ coverLetterTone: e.target.value })}
              >
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {status ? (
        <div
          className={
            status.type === "success"
              ? "mt-6 rounded-md border border-success/20 bg-success-lightest px-4 py-3 text-sm text-success-foreground"
              : "mt-6 rounded-md border border-error/20 bg-error/10 px-4 py-3 text-sm text-error"
          }
        >
          {status.message}
        </div>
      ) : null}

      <Button type="submit" variant="primary" disabled={isSaving} className="mt-8 w-full py-3 text-base">
        {isSaving ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
