"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/profile/TagInput";
import { WorkExperienceRole, type WorkExperienceRoleData } from "@/components/profile/WorkExperienceRole";

const MAX_ROLES = 3;

type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: string;
};

type ProfessionalInfo = {
  currentTitle: string;
  experienceLevel: string;
  yearsExperience: string;
  skills: string[];
  industries: string[];
};

type EducationInfo = {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
};

type JobPreferences = {
  jobTitlesSeeking: string;
  remotePreference: string;
  salaryExpectation: string;
  preferredLocations: string;
};

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

export function ProfileForm() {
  const [personal, setPersonal] = useState<PersonalInfo>({
    fullName: "Faizan Ali",
    email: "faizan@jsmastery.pro",
    phone: "",
    location: "",
    linkedinUrl: "https://linkedin.com/in/faizan",
    portfolioUrl: "https://github.com/jsmastery",
    workAuthorization: "citizen",
  });

  const [professional, setProfessional] = useState<ProfessionalInfo>({
    currentTitle: "Frontend Engineer",
    experienceLevel: "junior",
    yearsExperience: "4",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    industries: [],
  });

  const [roles, setRoles] = useState<WorkExperienceRoleData[]>([
    {
      id: "role-1",
      company: "Vercel",
      title: "Frontend Engineer",
      startDate: "2022-01",
      endDate: "",
      current: true,
      responsibilities: "Built Next.js features and optimized web vitals. Led a team of 3 developers.",
    },
  ]);

  const [education, setEducation] = useState<EducationInfo>({
    degree: "high_school",
    fieldOfStudy: "Computer Science",
    institution: "",
    graduationYear: "",
  });

  const [preferences, setPreferences] = useState<JobPreferences>({
    jobTitlesSeeking: "Frontend Engineer, React Developer",
    remotePreference: "any",
    salaryExpectation: "",
    preferredLocations: "",
  });

  const addRole = () => {
    if (roles.length >= MAX_ROLES) return;
    setRoles([...roles, createRole()]);
  };

  const updateRole = (updated: WorkExperienceRoleData) => {
    setRoles(roles.map((role) => (role.id === updated.id ? updated : role)));
  };

  const removeRole = (id: string) => {
    setRoles(roles.filter((role) => role.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
              value={personal.fullName}
              onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" className="mt-1.5" value={personal.email} disabled />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              className="mt-1.5"
              placeholder="+1 (555) 000-0000"
              value={personal.phone}
              onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              className="mt-1.5"
              placeholder="City, Country"
              value={personal.location}
              onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              className="mt-1.5"
              value={personal.linkedinUrl}
              onChange={(e) => setPersonal({ ...personal, linkedinUrl: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="portfolioUrl">Portfolio / GitHub</Label>
            <Input
              id="portfolioUrl"
              className="mt-1.5"
              value={personal.portfolioUrl}
              onChange={(e) => setPersonal({ ...personal, portfolioUrl: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="workAuthorization">Work Authorization</Label>
            <Select
              id="workAuthorization"
              className="mt-1.5"
              value={personal.workAuthorization}
              onChange={(e) => setPersonal({ ...personal, workAuthorization: e.target.value })}
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
              value={professional.currentTitle}
              onChange={(e) => setProfessional({ ...professional, currentTitle: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select
                id="experienceLevel"
                className="mt-1.5"
                value={professional.experienceLevel}
                onChange={(e) => setProfessional({ ...professional, experienceLevel: e.target.value })}
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
                value={professional.yearsExperience}
                onChange={(e) => setProfessional({ ...professional, yearsExperience: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Skills</Label>
            <div className="mt-1.5">
              <TagInput
                tags={professional.skills}
                onChange={(skills) => setProfessional({ ...professional, skills })}
                placeholder="Add a skill"
              />
            </div>
          </div>

          <div>
            <Label>Industries Worked In (optional)</Label>
            <div className="mt-1.5">
              <TagInput
                tags={professional.industries}
                onChange={(industries) => setProfessional({ ...professional, industries })}
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
          {roles.length < MAX_ROLES ? (
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
          {roles.map((role, index) => (
            <div key={role.id} className={index > 0 ? "pt-6" : undefined}>
              <WorkExperienceRole
                role={role}
                onChange={updateRole}
                onRemove={roles.length > 1 ? () => removeRole(role.id) : undefined}
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
              value={education.degree}
              onChange={(e) => setEducation({ ...education, degree: e.target.value })}
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
              value={education.fieldOfStudy}
              onChange={(e) => setEducation({ ...education, fieldOfStudy: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="institution">Institution Name</Label>
            <Input
              id="institution"
              className="mt-1.5"
              placeholder="E.g. State University"
              value={education.institution}
              onChange={(e) => setEducation({ ...education, institution: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="graduationYear">Graduation Year</Label>
            <Input
              id="graduationYear"
              className="mt-1.5"
              placeholder="YYYY"
              value={education.graduationYear}
              onChange={(e) => setEducation({ ...education, graduationYear: e.target.value })}
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
              value={preferences.jobTitlesSeeking}
              onChange={(e) => setPreferences({ ...preferences, jobTitlesSeeking: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="remotePreference">Remote Preference</Label>
              <Select
                id="remotePreference"
                className="mt-1.5"
                value={preferences.remotePreference}
                onChange={(e) => setPreferences({ ...preferences, remotePreference: e.target.value })}
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
                value={preferences.salaryExpectation}
                onChange={(e) => setPreferences({ ...preferences, salaryExpectation: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="preferredLocations">Preferred Locations (optional)</Label>
            <Input
              id="preferredLocations"
              className="mt-1.5"
              placeholder="E.g. New York, London"
              value={preferences.preferredLocations}
              onChange={(e) => setPreferences({ ...preferences, preferredLocations: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Button type="submit" variant="primary" className="mt-8 w-full py-3 text-base">
        Save Profile
      </Button>
    </form>
  );
}
