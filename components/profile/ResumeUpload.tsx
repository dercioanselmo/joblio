"use client";

import { useRef, useState, useTransition } from "react";
import { FileText, Sparkles, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { uploadResume } from "@/actions/profile";
import type { ExtractedProfileData } from "@/types";

type Props = {
  initialResumeUrl: string | null;
  onExtracted: (extracted: ExtractedProfileData) => void;
};

export function ResumeUpload({ initialResumeUrl, onExtracted }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(initialResumeUrl);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  // Backstop for the optimistic setResumeUrl in handleFile: uploadResume's
  // revalidatePath call refreshes this page's server-rendered props independently
  // of whatever happens on the client, so once that refresh lands, initialResumeUrl
  // reflects the real DB state — sync down from it rather than trusting local state
  // alone. Adjusted during render (React's documented pattern for this), not in an
  // effect, to avoid an extra commit.
  const [prevInitialResumeUrl, setPrevInitialResumeUrl] = useState(initialResumeUrl);
  if (initialResumeUrl !== prevInitialResumeUrl) {
    setPrevInitialResumeUrl(initialResumeUrl);
    setResumeUrl(initialResumeUrl);
  }

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setIsUploading(true);
    // Shown immediately, independent of the upload's own network round trip —
    // the one piece of feedback that can't be delayed or dropped by anything
    // server-side, since it's set synchronously from the file the user just picked.
    setUploadedFileName(file.name);

    // Server Actions invoked outside a <form> must be wrapped in startTransition —
    // uploadResume calls revalidatePath, which pushes an immediate refresh of this
    // page. Without startTransition, that refresh can land ahead of this callback's
    // own setResumeUrl and get reconciled as a fresh mount, silently dropping the
    // update (no error, no UI change — exactly what a real user hit here).
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("resume", file);
        const result = await uploadResume(formData);

        if (result.success && result.url) {
          setResumeUrl(result.url);
        } else {
          setError(result.error ?? "Failed to upload resume.");
        }
      } catch (err) {
        console.error("[ResumeUpload]", err);
        setError("Failed to upload resume. Please try again.");
      } finally {
        setIsUploading(false);
      }
    });
  };

  const handleExtract = async () => {
    setExtractError(null);
    setIsExtracting(true);

    try {
      const response = await fetch("/api/resume/extract", { method: "POST" });
      const result = await response.json();

      if (result.success) {
        onExtracted(result.data);
      } else {
        setExtractError(result.error ?? "Failed to extract profile data.");
      }
    } catch (err) {
      console.error("[ResumeUpload]", err);
      setExtractError("Failed to extract profile data. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerate = async () => {
    setGenerateError(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/resume/generate", { method: "POST" });
      const result = await response.json();

      if (result.success && result.url) {
        setResumeUrl(result.url);
        setUploadedFileName("resume.pdf");
      } else {
        setGenerateError(result.error ?? "Failed to generate resume.");
      }
    } catch (err) {
      console.error("[ResumeUpload]", err);
      setGenerateError("Failed to generate resume. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow">
      <h2 className="text-base font-semibold text-text-primary">Resume</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Upload an existing resume to auto-fill the profile, or generate a new tailored one from
        your details below.
      </p>

      {resumeUrl ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-secondary">
            Current resume: <span className="font-medium text-text-primary">{uploadedFileName ?? "resume.pdf"}</span>{" "}
            ·{" "}
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent hover:text-accent-dark"
            >
              View resume
            </a>
          </p>
          <Button type="button" variant="secondary" disabled={isExtracting} onClick={handleExtract}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {isExtracting ? "Extracting..." : "Extract from Resume"}
          </Button>
        </div>
      ) : null}

      {extractError ? (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {extractError}
        </div>
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
          {isUploading
            ? `Uploading ${uploadedFileName}...`
            : resumeUrl && uploadedFileName
              ? `${uploadedFileName} uploaded`
              : "Click to upload or drag and drop"}
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

      {generateError ? (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {generateError}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
        <p className="text-sm text-text-secondary">Need a fresh document based on the fields below?</p>
        <Button type="button" variant="primary" disabled={isGenerating} onClick={handleGenerate}>
          <FileText className="h-4 w-4" aria-hidden="true" />
          {isGenerating ? "Generating..." : "Generate Resume from Profile"}
        </Button>
      </div>
    </div>
  );
}
