import { useState } from "react";
import type { LabelInput } from "../types/label";

interface LabelFormProps {
  defaultSvg: string;
  onGenerate: (input: LabelInput) => Promise<void>;
}

export function LabelForm({ defaultSvg, onGenerate }: LabelFormProps) {
  const [title, setTitle] = useState("M3x10 Socket");
  const [line1, setLine1] = useState("M3x10");
  const [line2, setLine2] = useState("Socket");
  const [iconSvg, setIconSvg] = useState(defaultSvg);
  const [loading, setLoading] = useState(false);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    setIconSvg(text);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    try {
      await onGenerate({ title, line1, line2, iconSvg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>Custom label</h2>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        Text line 1
        <input value={line1} onChange={(e) => setLine1(e.target.value)} required />
      </label>
      <label>
        Text line 2
        <input value={line2} onChange={(e) => setLine2(e.target.value)} required />
      </label>
      <label>
        Clipart SVG
        <input type="file" accept=".svg,image/svg+xml" onChange={handleFile} />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Generating..." : "Download STL"}
      </button>
    </form>
  );
}
