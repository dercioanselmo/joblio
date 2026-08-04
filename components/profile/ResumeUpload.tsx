"use client";

import { useRef, useState } from "react";
import { FileText, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function ResumeUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow">
      <h2 className="text-base font-semibold text-text-primary">Resume</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Upload an existing resume to auto-fill the profile, or generate a new tailored one from
        your details below.
      </p>

      <div
        className={cn(
          "mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-border-muted bg-surface-secondary px-6 py-12 text-center transition-colors",
          isDragging && "border-accent bg-accent-muted",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow">
          <UploadCloud className="h-5 w-5 text-accent" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm font-semibold text-text-primary">
          Click to upload or drag and drop
        </p>
        <p className="mt-1 text-xs text-text-muted">PDF formatting only. Maximum file size 5MB.</p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => fileInputRef.current?.click()}
        >
          Select Resume
        </Button>
        <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" />
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
        <p className="text-sm text-text-secondary">Need a fresh document based on the fields below?</p>
        <Button type="button" variant="primary">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Generate Resume from Profile
        </Button>
      </div>
    </div>
  );
}
