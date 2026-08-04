"use client";

import { useRef, useState } from "react";
import { FileText, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { uploadResume } from "@/actions/profile";

type Props = {
  initialResumeUrl: string | null;
};

export function ResumeUpload({ initialResumeUrl }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(initialResumeUrl);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setIsUploading(true);

    const result = await uploadResume(file);

    if (result.success && result.url) {
      setResumeUrl(result.url);
    } else {
      setError(result.error ?? "Failed to upload resume.");
    }
    setIsUploading(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow">
      <h2 className="text-base font-semibold text-text-primary">Resume</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Upload an existing resume to auto-fill the profile, or generate a new tailored one from
        your details below.
      </p>

      {resumeUrl ? (
        <p className="mt-4 text-sm text-text-secondary">
          Current resume:{" "}
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-accent hover:text-accent-dark"
          >
            View resume
          </a>
        </p>
      ) : null}

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
          void handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow">
          <UploadCloud className="h-5 w-5 text-accent" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm font-semibold text-text-primary">
          {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
        </p>
        <p className="mt-1 text-xs text-text-muted">PDF formatting only. Maximum file size 5MB.</p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          Select Resume
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

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
