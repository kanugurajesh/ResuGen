"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/field";

type Profile = {
  fullName: string | null;
  headline: string | null;
  phone: string | null;
  location: string | null;
  email: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
  summary: string | null;
} | null;

export function ProfileSection({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: (profile: Profile) => void;
}) {
  const [form, setForm] = useState({
    fullName: profile?.fullName ?? "",
    headline: profile?.headline ?? "",
    phone: profile?.phone ?? "",
    location: profile?.location ?? "",
    email: profile?.email ?? "",
    linkedin: profile?.linkedin ?? "",
    github: profile?.github ?? "",
    website: profile?.website ?? "",
    summary: profile?.summary ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await apiFetch<Profile>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(
          Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim() || null]))
        ),
      });
      onSaved(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
        </Field>
        <Field label="Headline" hint="e.g. Senior Backend Engineer">
          <Input value={form.headline} onChange={(e) => set("headline", e.target.value)} />
        </Field>
        <Field label="Email">
          <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="Location">
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
        </Field>
        <Field label="Website">
          <Input value={form.website} onChange={(e) => set("website", e.target.value)} />
        </Field>
        <Field label="LinkedIn URL">
          <Input value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
        </Field>
        <Field label="GitHub URL">
          <Input value={form.github} onChange={(e) => set("github", e.target.value)} />
        </Field>
      </div>
      <Field label="Summary" hint="A general summary — each tailored resume writes its own shorter version from your real background.">
        <Textarea rows={4} value={form.summary} onChange={(e) => set("summary", e.target.value)} />
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving} className="w-fit">
          {saving ? "Saving…" : "Save profile"}
        </Button>
        {saved && <span className="text-xs text-match-good">Saved.</span>}
        {error && <span className="text-xs text-match-bad">{error}</span>}
      </div>
    </form>
  );
}
