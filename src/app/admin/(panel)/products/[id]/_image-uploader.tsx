"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export function ImageUploader({ productId }: { productId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.append("productId", productId);
    Array.from(files).forEach((f) => fd.append("files", f));

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-edge2 bg-space px-4 py-8 text-center transition hover:border-alien-dim"
      >
        <UploadCloud size={22} className="text-fog-dim" />
        <span className="text-sm text-fog">
          {busy ? "Uploading…" : "Drag images here or click to upload"}
        </span>
        <span className="font-mono text-[10px] text-fog-dim">
          JPG / PNG / HEIC — auto-optimized to WebP
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={busy}
          onChange={(e) => upload(e.target.files)}
        />
      </label>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
