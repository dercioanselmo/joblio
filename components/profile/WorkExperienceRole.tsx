import { Trash2 } from "lucide-react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import type { WorkExperienceRoleData } from "@/types";

export type { WorkExperienceRoleData };

type Props = {
  role: WorkExperienceRoleData;
  onChange: (role: WorkExperienceRoleData) => void;
  onRemove?: () => void;
};

export function WorkExperienceRole({ role, onChange, onRemove }: Props) {
  return (
    <div className="relative space-y-4">
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove role"
          className="absolute right-0 top-0 text-text-muted hover:text-error"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${role.id}-company`}>Company Name</Label>
          <Input
            id={`${role.id}-company`}
            className="mt-1.5"
            value={role.company}
            onChange={(e) => onChange({ ...role, company: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor={`${role.id}-title`}>Job Title</Label>
          <Input
            id={`${role.id}-title`}
            className="mt-1.5"
            value={role.title}
            onChange={(e) => onChange({ ...role, title: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${role.id}-start`}>Start Date</Label>
          <Input
            id={`${role.id}-start`}
            type="month"
            className="mt-1.5"
            value={role.startDate}
            onChange={(e) => onChange({ ...role, startDate: e.target.value })}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor={`${role.id}-end`} className="mb-0">
              End Date
            </Label>
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Checkbox
                checked={role.current}
                onChange={(e) =>
                  onChange({
                    ...role,
                    current: e.target.checked,
                    endDate: e.target.checked ? "" : role.endDate,
                  })
                }
              />
              Currently working here
            </label>
          </div>
          <Input
            id={`${role.id}-end`}
            type="month"
            className="mt-1.5"
            value={role.endDate}
            disabled={role.current}
            onChange={(e) => onChange({ ...role, endDate: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`${role.id}-responsibilities`}>Key Responsibilities</Label>
        <Textarea
          id={`${role.id}-responsibilities`}
          className="mt-1.5"
          rows={3}
          value={role.responsibilities}
          onChange={(e) => onChange({ ...role, responsibilities: e.target.value })}
        />
      </div>
    </div>
  );
}
