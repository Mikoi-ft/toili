"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

export function PhotoUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          try {
            const blob = await upload(file.name, file, {
              access: "public",
              handleUploadUrl: "/api/blob/upload",
            });
            onChange(blob.url);
          } finally {
            setBusy(false);
          }
        }}
        className="rounded border p-2"
      />
      {busy && <span className="text-sm text-gray-500">Загрузка…</span>}
      {value && <img src={value} alt="" className="h-20 w-20 rounded object-cover" />}
    </div>
  );
}
