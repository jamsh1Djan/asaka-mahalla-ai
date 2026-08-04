"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

/** Multi-file image picker with thumbnail previews and per-image removal.
 * Keeps a real hidden <input type="file" multiple> in sync via DataTransfer
 * so the form still submits the right files under `name` — removing one
 * preview has to remove it from the actual FileList too, not just the UI. */
export default function ImagePicker({
  name,
  max = 2,
  helpText,
}: {
  name: string;
  max?: number;
  helpText?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function syncInput(next: File[]) {
    const dt = new DataTransfer();
    next.forEach((f) => dt.items.add(f));
    if (inputRef.current) inputRef.current.files = dt.files;
    setFiles(next);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length > max) {
      setError(`Ko'pi bilan ${max} ta rasm yuklash mumkin`);
      syncInput([]);
      return;
    }
    setError(null);
    syncInput(picked);
  }

  function removeAt(i: number) {
    setError(null);
    syncInput(files.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <input ref={inputRef} type="file" name={name} accept="image/*" multiple onChange={onChange} />
      {helpText && (
        <p className="small-muted" style={{ marginTop: 6 }}>
          {helpText}
        </p>
      )}
      {error && <div className="err">{error}</div>}
      {previews.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {previews.map((src, i) => (
            <div key={src} style={{ position: "relative" }}>
              <img
                src={src}
                alt=""
                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10, display: "block" }}
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Rasmni olib tashlash"
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "var(--ink)",
                  color: "#fff",
                  border: "2px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
