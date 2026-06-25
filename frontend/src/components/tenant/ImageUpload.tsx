import { useRef, useState } from "react";

interface Props {
  onUpload: (url: string) => void;
  label?: string;
  existingUrl?: string;
}

const CLOUD_NAME = "dnkcrvssk";
const UPLOAD_PRESET = "smart_tenant_upload";

export default function ImageUpload({ onUpload, label = "Upload Image", existingUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      const res = await fetch(
        https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Upload failed");
      setPreview(data.secure_url);
      onUpload(data.secure_url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload-wrapper">
      {preview && <img src={preview} alt="Preview" className="image-upload-preview" />}
      <button
        type="button"
        className="btn-secondary"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Uploading…" : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}