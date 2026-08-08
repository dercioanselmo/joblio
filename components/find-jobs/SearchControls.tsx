"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function SearchControls() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!jobTitle.trim()) {
      setError("Please enter a job title to search for.");
      setMessage(null);
      return;
    }

    setError(null);
    setMessage(null);
    setIsSearching(true);

    try {
      const response = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, location }),
      });
      const result = await response.json();

      if (result.success) {
        setMessage(result.data.message);
        router.refresh();
      } else {
        setError(result.error ?? "Failed to search for jobs.");
      }
    } catch (err) {
      console.error("[SearchControls]", err);
      setError("Failed to search for jobs. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="jobTitle">Job Title</Label>
          <div className="relative mt-1.5">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <Input
              id="jobTitle"
              className="pl-9"
              placeholder="Frontend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            className="mt-1.5"
            placeholder="Remote, New York..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button
          type="button"
          variant="primary"
          className="h-10.5"
          disabled={isSearching}
          onClick={handleSearch}
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          {isSearching ? "Searching..." : "Find Jobs"}
        </Button>
      </div>

      {message ? (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-success-lightest px-4 py-3 text-sm font-medium text-success-foreground">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}
    </div>
  );
}
